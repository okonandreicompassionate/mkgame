const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { WebSocketServer, WebSocket } = require('ws');

const root = __dirname;
const allowedFiles = new Set([
  'index.html',
  'homelander.glb',
  'homelander-optimized.glb',
  'omniman.glb'
]);
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.glb': 'model/gltf-binary'
};
const rooms = new Map();
const codeChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function send(socket, value) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(value));
}

function sendError(socket, message) {
  send(socket, { type: 'error', message });
}

function makeRoomCode() {
  let code;
  do {
    code = Array.from({ length: 6 }, () => codeChars[Math.floor(Math.random() * codeChars.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function leaveRoom(socket) {
  const room = socket.room;
  if (!room) return;
  socket.room = null;
  socket.role = null;
  if (room.host === socket) {
    if (room.guest) send(room.guest, { type: 'peerLeft' });
    rooms.delete(room.code);
  } else if (room.guest === socket) {
    room.guest = null;
    send(room.host, { type: 'peerLeft' });
  }
}

function routeMessage(socket, message) {
  if (typeof message.type !== 'string') return sendError(socket, 'Invalid message.');

  if (message.type === 'ping') {
    if (Number.isSafeInteger(message.id)) send(socket, { type: 'pong', id: message.id });
    return;
  }

  if (message.type === 'create') {
    if (socket.room) return sendError(socket, 'You are already in a room.');
    const room = { code: makeRoomCode(), host: socket, guest: null };
    rooms.set(room.code, room);
    socket.room = room;
    socket.role = 'host';
    return send(socket, { type: 'created', code: room.code });
  }

  if (message.type === 'join') {
    if (socket.room) return sendError(socket, 'You are already in a room.');
    const code = typeof message.code === 'string' ? message.code.trim().toUpperCase() : '';
    const room = rooms.get(code);
    if (!room) return sendError(socket, 'Room not found. Check the code and try again.');
    if (room.guest) return sendError(socket, 'That room already has two players.');
    room.guest = socket;
    socket.room = room;
    socket.role = 'guest';
    send(socket, { type: 'joined', code });
    send(room.host, { type: 'peerJoined' });
    return;
  }

  const room = socket.room;
  if (!room) return sendError(socket, 'Join a room first.');
  const target = socket.role === 'host' ? room.guest : room.host;
  if (!target) return;

  if (socket.role === 'guest' && message.type === 'input') {
    const input = message.input;
    if (!input || typeof input !== 'object' || Array.isArray(input)) return;
    const cleanInput = {}, cleanPressed = {};
    for (const key of ['a', 'd', 'w', 'j', 'k', 'l', 'u', 'o', 'e', 'i', 'r']) {
      cleanInput[key] = input[key] === true;
      cleanPressed[key] = !!message.pressed && message.pressed[key] === true;
    }
    return send(target, { type: 'input', input: cleanInput, pressed: cleanPressed });
  }

  if (socket.role === 'guest' && message.type === 'selection') {
    if (typeof message.character !== 'string' || message.character.length > 32) return;
    return send(target, { type: 'selection', character: message.character });
  }

  if (socket.role === 'host' && message.type === 'snapshot') {
    if (target.bufferedAmount > 8192) return;
    return send(target, { type: 'snapshot', snapshot: message.snapshot });
  }

  if (socket.role === 'host' && message.type === 'matchStart') {
    return send(target, { type: 'matchStart', match: message.match });
  }

  if (socket.role === 'host' && message.type === 'lobbyReset') {
    return send(target, { type: 'lobbyReset' });
  }
}

const server = http.createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }

  if (request.method === 'GET' && pathname === '/healthz') {
    response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  const filename = pathname === '/' ? 'index.html' : pathname.slice(1);
  if (request.method !== 'GET' || !allowedFiles.has(filename)) {
    response.writeHead(404).end('Not found');
    return;
  }

  fs.readFile(path.join(root, filename), (error, contents) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500).end('Unable to read game file');
      return;
    }
    response.writeHead(200, {
      'content-type': contentTypes[path.extname(filename)] || 'application/octet-stream',
      'cache-control': filename === 'index.html' ? 'no-cache' : 'public, max-age=3600'
    });
    response.end(contents);
  });
});

const webSockets = new WebSocketServer({ noServer: true, maxPayload: 16 * 1024, perMessageDeflate: false });
server.on('upgrade', (request, socket, head) => {
  if (request.url !== '/ws') {
    socket.destroy();
    return;
  }
  webSockets.handleUpgrade(request, socket, head, client => webSockets.emit('connection', client));
});

webSockets.on('connection', socket => {
  socket._socket.setNoDelay(true);
  let messagesThisSecond = 0;
  let rateWindow = Date.now();
  socket.on('message', raw => {
    const now = Date.now();
    if (now - rateWindow >= 1000) {
      rateWindow = now;
      messagesThisSecond = 0;
    }
    if (++messagesThisSecond > 120) {
      sendError(socket, 'Too many messages.');
      socket.close(1008, 'Rate limit exceeded');
      return;
    }
    let message;
    try {
      message = JSON.parse(raw.toString());
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

const port = Number(process.env.PORT) || 3000;
server.listen(port, '0.0.0.0', () => {
  console.log(`Game server listening on port ${port}`);
});
