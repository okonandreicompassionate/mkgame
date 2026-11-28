# Fallen Angels

## Run locally

Install Node.js, then install dependencies and start the game server:

```powershell
npm install
npm start
```

Open `http://localhost:3000` on the laptop. For devices on the same Wi-Fi,
use the laptop's Wi-Fi IPv4 address (for example, `http://192.168.1.25:3000`).

## Play on one laptop

- **Local vs computer:** choose **LOCAL VS COMPUTER**. Player 1 uses WASD and
  J/K/U/E/O/R/I; the computer controls Player 2.
- **Two players:** choose **LOCAL 2 PLAYERS · ONE LAPTOP**. Player 1 uses
  WASD and J/K/U/E/O/R/I. Player 2 uses the arrow keys and 1-7 for those
  corresponding actions (1 punch, 2 kick, 3 hero power, 4 special, 5 uppercut,
  6 speed burst, 7 flight; Down blocks). Two standard gamepads can also be
  connected: the first controls Player 1 and the second Player 2.

## Play from two laptops

1. Both players open the same deployed Fallen Angels URL. For same-Wi-Fi play,
   one player can host the server on their laptop and the other opens that
   laptop's local IPv4 URL. Allow Node.js through the Windows firewall if
   prompted.
2. The host chooses **CREATE ONLINE ROOM · 2 LAPTOPS** and shares the join
   link or six-character room code.
3. The second player chooses **JOIN ONLINE ROOM · THIS LAPTOP**, enters the
   code, and joins. The host picks Player 1 and the stage; the joining laptop
   picks Player 2.
4. Each laptop renders the game locally. The host laptop runs the authoritative
   simulation and sends compact game-state updates and Player 2 inputs over
   WebSockets; no gameplay video is streamed. Each player can use their
   keyboard or a standard gamepad. Gamepad face buttons map to punch, kick,
   hero power, and special; the shoulder buttons map to uppercut and speed
   burst.

For play across the internet, deploy the Node server to a host that supports
persistent WebSocket connections; the included `render.yaml` configures
Render. Both players must use the deployed HTTPS address. Internet delay
depends on the route between both laptops and the server; same-Wi-Fi play
usually has lower latency.

## Play against the computer with one phone

1. On the laptop, choose **PHONE VS COMPUTER** and keep the game page open.
2. Open the controller link shown on the laptop on one phone, or visit
   `http://<laptop-ip>:3000/controller` and enter the room code.
3. Choose your fighter and stage from the host phone. The laptop displays the
   game; the phone controls Player 1 and the computer controls the opponent.

On the same Wi-Fi, this mode works over the local network without an internet
connection. Use the laptop's Wi-Fi IPv4 address (find it with `ipconfig`) on the
phone, not `localhost`.

## Play with two phone controllers

1. On the laptop, choose **CREATE PHONE ROOM · 2 PHONES** and keep the game
   page open.
2. Share the controller link shown on screen with both phones, or open
   `http://<laptop-ip>:3000/controller` on each phone and enter the room code.
3. The first phone is the host controller (Player 1); the second is Player 2.
   Each player uses their phone to choose their own fighter, then only the host
   controller chooses the stage. Keep the laptop page open; it runs and displays
   the match. The phones send button inputs, not a video stream.

During a match, phones give lightweight optional vibration feedback for hits,
blocks, heavy strikes, combos, special attacks, and knockouts. Haptics require a
supported phone browser with vibration enabled.

For phone play, use the laptop's local IPv4 address (find it with `ipconfig`)
when phones are on the same Wi-Fi. The game also starts with reduced rendering
quality on lower-powered devices and disables costly post-processing and shadow
effects.

The separate `/controller` page is intentionally lightweight and does not load
the 3D game.

## Assets and licences

- `sponza.glb`: KhronosGroup glTF Sample Assets, (c) Crytek; dual-licensed
  under the Cryengine Limited License and CC-BY 4.0. Credit Crytek/Frank
  Meinl. Review the Cryengine licence before commercial use.
- `*.hdr`: Poly Haven HDRIs (CC0), as shipped in the three.js r128 repository.
- `GLTFLoader.js` and `RGBELoader.js`: three.js r128 (MIT).
