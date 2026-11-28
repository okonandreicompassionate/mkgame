'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const crypto = require('node:crypto');
const { WebSocketServer, WebSocket } = require('ws');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const root = __dirname;
const PORT = Number(process.env.PORT) || 3000;
const MAX_MESSAGES_PER_SECOND = 240;      // Leave headroom for button updates and pings.
const MAX_ROOMS = 5000;
const HEARTBEAT_MS = 15000;               // protocol-level ping: drops dead peers, keeps proxies awake
const INPUT_BACKPRESSURE_BYTES = 8192;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',').map(s => s.trim()).filter(Boolean); // optional, e.g. "https://mygame.com"

const allowedFiles = new Set([
  'index.html',
  'controller.html',
  'GLTFLoader.js',
  'RGBELoader.js',
  'homelander.glb',
  'homelander-optimized.glb',
  'omniman.glb',
  'pedestrian_overpass_1k.hdr',
  'royal_esplanade_1k.hdr',
  'sponza.glb'
]);
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.glb': 'model/gltf-binary',
  '.hdr': 'application/octet-stream'
};
const compressibleTypes = new Set(['.html']);

const rooms = new Map();
const codeChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const INPUT_KEYS = ['a', 'd', 'w', 'j', 'k', 'l', 'u', 'o', 'e', 'i', 'r'];

// ---------------------------------------------------------------------------
// Static file cache (read once, revalidated by mtime, ETag + br/gzip)
// ---------------------------------------------------------------------------
const fileCache = new Map();
const pendingLoads = new Map();

async function loadFile(filename) {
  const full = path.join(root, filename);
  const stat = await fs.promises.stat(full);
  const cached = fileCache.get(filename);
  if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) return cached;

  if (pendingLoads.has(filename)) return pendingLoads.get(filename);
  const promise = (async () => {
    const buffer = await fs.promises.readFile(full);
    const ext = path.extname(filename);
    const entry = {
      mtimeMs: stat.mtimeMs,
      size: stat.size,
      buffer,
      etag: `"${crypto.createHash('sha1').update(buffer).digest('base64url')}"`,
      br: null,
      gzip: null
    };
    if (compressibleTypes.has(ext)) {
      entry.br = zlib.brotliCompressSync(buffer, {
        params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 9 }
      });
      entry.gzip = zlib.gzipSync(buffer, { level: 9 });
    }
    fileCache.set(filename, entry);
    return entry;
  })().finally(() => pendingLoads.delete(filename));
  pendingLoads.set(filename, promise);
  return promise;
}

// ---------------------------------------------------------------------------
// Rooms
// ---------------------------------------------------------------------------
function send(socket, value) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(typeof value === 'string' ? value : JSON.stringify(value));
  }
}

function sendError(socket, message) {
  send(socket, { type: 'error', message });
}

function makeRoomCode() {
  let code;
  do {
    code = Array.from({ length: 6 }, () => codeChars[crypto.randomInt(codeChars.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function normalizeCode(value) {
  // Forgiving: accepts "abc 123", "ABC-123", lowercase, stray whitespace.
  return typeof value === 'string' ? value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 12) : '';
}

function leaveRoom(socket) {
  const room = socket.room;
  if (!room) return;
  const role = socket.role;
  socket.room = null;
  socket.role = null;
  const player = socket.player;
  socket.player = null;
  if (room.host === socket) {
    for (const controller of room.controllers) {
      if (!controller) continue;
      controller.room = null;
      controller.role = null;
      controller.player = null;
      send(controller, { type: 'roomClosed' });
    }
    rooms.delete(room.code);
  } else if (role === 'controller' && Number.isInteger(player)) {
    room.controllers[player - 1] = null;
    send(room.host, { type: 'controllerLeft', player });
  }
}

function routeMessage(socket, message) {
  const type = message.type;
  if (typeof type !== 'string') return sendError(socket, 'Invalid message.');

  if (type === 'ping') {
    if (Number.isSafeInteger(message.id)) send(socket, { type: 'pong', id: message.id });
    return;
  }

  if (type === 'create') {
    if (socket.room) leaveRoom(socket); // no more "already in a room" dead end
    if (rooms.size >= MAX_ROOMS) return sendError(socket, 'Server is busy. Try again shortly.');
    const mode = message.mode === 'phone-bot' ? 'phone-bot' : 'duo';
    const controllerLimit = mode === 'phone-bot' ? 1 : 2;
    const room = { code: makeRoomCode(), host: socket, controllers: [null, null], mode, controllerLimit };
    rooms.set(room.code, room);
    socket.room = room;
    socket.role = 'host';
    return send(socket, { type: 'created', code: room.code, mode, controllerLimit, controllers: [false, false] });
  }

  if (type === 'join') {
    const code = normalizeCode(message.code);
    const room = rooms.get(code);
    if (!room) return sendError(socket, 'Room not found. Check the code and try again.');
    if (socket.room === room) return; // already in this room
    const playerIndex = room.controllers.indexOf(null);
    if (playerIndex < 0 || playerIndex >= room.controllerLimit) {
      return sendError(socket, room.controllerLimit === 1
        ? 'This game already has its phone controller connected.'
        : 'Both phone controllers are already connected.');
    }
    if (socket.room) leaveRoom(socket);
    room.controllers[playerIndex] = socket;
    socket.room = room;
    socket.role = 'controller';
    socket.player = playerIndex + 1;
    send(socket, { type: 'joined', code, mode: room.mode, player: socket.player });
    send(room.host, { type: 'controllerJoined', player: socket.player });
    return;
  }

  if (type === 'leave') return leaveRoom(socket);

  const room = socket.room;
  if (!room) return sendError(socket, 'Join a room first.');
  const isHost = socket.role === 'host';
  const target = isHost ? null : room.host;

  if (!isHost && socket.role === 'controller' && type === 'input') {
    const input = message.input;
    if (!input || typeof input !== 'object' || Array.isArray(input)) return;
    const pressedIn = message.pressed && typeof message.pressed === 'object' ? message.pressed : null;
    const cleanInput = {};
    const cleanPressed = {};
    let anyPressed = false;
    for (const key of INPUT_KEYS) {
      cleanInput[key] = input[key] === true;
      const p = !!pressedIn && pressedIn[key] === true;
      cleanPressed[key] = p;
      if (p) anyPressed = true;
    }
    // Under congestion, drop plain held-key updates but never a fresh key press.
    if (!anyPressed && target.bufferedAmount > INPUT_BACKPRESSURE_BYTES) return;
    return send(target, { type: 'input', player: socket.player, input: cleanInput, pressed: cleanPressed });
  }

  if (isHost && (type === 'matchStart' || type === 'lobbyReset')) {
    for (const controller of room.controllers) {
      if (controller) send(controller, { type });
    }
  }
}

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------
const baseHeaders = { 'x-content-type-options': 'nosniff' };

const server = http.createServer(async (request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400, baseHeaders).end('Bad request');
    return;
  }

  if (request.method === 'GET' && pathname === '/healthz') {
    response.writeHead(200, { ...baseHeaders, 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
    response.end(JSON.stringify({ status: 'ok', rooms: rooms.size }));
    return;
  }

  const filename = pathname === '/' ? 'index.html' : pathname === '/controller' ? 'controller.html' : pathname.slice(1);
  const isHead = request.method === 'HEAD';
  if ((request.method !== 'GET' && !isHead) || !allowedFiles.has(filename)) {
    response.writeHead(404, baseHeaders).end('Not found');
    return;
  }

  try {
    const entry = await loadFile(filename);
    const ext = path.extname(filename);
    const headers = {
      ...baseHeaders,
      'content-type': contentTypes[ext] || 'application/octet-stream',
      'cache-control': filename === 'index.html' ? 'no-cache' : 'public, max-age=3600',
      etag: entry.etag
    };

    if (request.headers['if-none-match'] === entry.etag) {
      response.writeHead(304, headers).end();
      return;
    }

    let body = entry.buffer;
    if (entry.br || entry.gzip) {
      headers.vary = 'Accept-Encoding';
      const accepted = String(request.headers['accept-encoding'] || '');
      if (entry.br && /\bbr\b/.test(accepted)) {
        body = entry.br;
        headers['content-encoding'] = 'br';
      } else if (entry.gzip && /\bgzip\b/.test(accepted)) {
        body = entry.gzip;
        headers['content-encoding'] = 'gzip';
      }
    }
    headers['content-length'] = body.length;
    response.writeHead(200, headers);
    response.end(isHead ? undefined : body);
  } catch (error) {
    if (!response.headersSent) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500, baseHeaders).end(
        error.code === 'ENOENT' ? 'Not found' : 'Unable to read game file'
      );
    }
  }
});

server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

// ---------------------------------------------------------------------------
// WebSocket
// ---------------------------------------------------------------------------
const webSockets = new WebSocketServer({ noServer: true, maxPayload: 16 * 1024, perMessageDeflate: false });

server.on('upgrade', (request, socket, head) => {
  let pathname;
  try {
    pathname = new URL(request.url, 'http://localhost').pathname;
  } catch {
    socket.destroy();
    return;
  }
  if (pathname !== '/ws') {
    socket.destroy();
    return;
  }
  if (ALLOWED_ORIGINS.length && !ALLOWED_ORIGINS.includes(request.headers.origin)) {
    socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
    socket.destroy();
    return;
  }
  webSockets.handleUpgrade(request, socket, head, client => webSockets.emit('connection', client, request));
});

webSockets.on('connection', socket => {
  if (socket._socket) {
    socket._socket.setNoDelay(true);
    socket._socket.setKeepAlive(true, 10000);
  }
  socket.isAlive = true;
  socket.on('pong', () => { socket.isAlive = true; });

  let messagesThisSecond = 0;
  let rateWindow = Date.now();

  socket.on('message', (raw, isBinary) => {
    if (isBinary) return sendError(socket, 'Invalid message format.');
    const now = Date.now();
    if (now - rateWindow >= 1000) {
      rateWindow = now;
      messagesThisSecond = 0;
    }
    if (++messagesThisSecond > MAX_MESSAGES_PER_SECOND) {
      sendError(socket, 'Too many messages.');
      socket.close(1008, 'Rate limit exceeded');
      return;
    }
    const text = raw.toString();
    let message;
    try {
      message = JSON.parse(text);
    } catch {
      sendError(socket, 'Invalid message format.');
      return;
    }
    if (!message || typeof message !== 'object' || Array.isArray(message)) {
      sendError(socket, 'Invalid message.');
      return;
    }
    routeMessage(socket, message);
  });
  socket.on('close', () => leaveRoom(socket));
  socket.on('error', () => leaveRoom(socket));
});

// Drop half-open connections quickly so a friend's room doesn't hang on a ghost.
const heartbeat = setInterval(() => {
  for (const client of webSockets.clients) {
    if (!client.isAlive) {
      client.terminate();
      continue;
    }
    client.isAlive = false;
    client.ping();
  }
}, HEARTBEAT_MS);

// ---------------------------------------------------------------------------
// Start / shutdown
// ---------------------------------------------------------------------------
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Game server listening on port ${PORT}`);
  // Warm the cache so the first player doesn't pay for disk reads + compression.
  for (const file of allowedFiles) loadFile(file).catch(() => {});
});

function shutdown() {
  clearInterval(heartbeat);
  for (const client of webSockets.clients) client.close(1001, 'Server restarting');
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 5000).unref();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);