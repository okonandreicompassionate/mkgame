# HOMELANDER 3D: Rooftop Fight

## Run locally

Install Node.js, then start the game server:

```powershell
npm install
npm start
```

For local Wi-Fi play, open the game on the laptop using its Wi-Fi IPv4 address
(for example, `http://192.168.1.25:3000`). You can use
`http://localhost:3000` for solo play.

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

1. On the laptop, choose **CREATE GAME** and keep the game page open.
2. Share the controller link shown on screen with both phones, or open
   `http://<laptop-ip>:3000/controller` on each phone and enter the room code.
3. The first phone is the host controller (Player 1); the second is Player 2.
   Each player uses their phone to choose their own fighter, then only the host
   controller chooses the stage. Keep the laptop page open; it runs and displays
   the match. The phones send button inputs, not a video stream.

During a match, phones give lightweight optional vibration feedback for hits,
blocks, heavy strikes, combos, special attacks, and knockouts. Haptics require a
supported phone browser with vibration enabled.

For phones on the same Wi-Fi, use the laptop's local IPv4 address (find it with
`ipconfig`). Allow Node.js through the Windows firewall on the local network if
prompted. For play across the internet, deploy
the Node server to a host that supports persistent WebSocket connections; the
included `render.yaml` configures Render. Use the deployed HTTPS address on all
devices. Local Wi-Fi generally gives the lowest input delay; over the internet,
latency depends on the network path between both phones, the server, and the
laptop.

The separate `/controller` page is intentionally lightweight and does not load
the 3D game. On lower-powered devices, the game also starts with reduced
rendering quality and disables costly post-processing and shadow effects.

## Assets and licences

- `sponza.glb`: KhronosGroup glTF Sample Assets, (c) Crytek; dual-licensed
  under the Cryengine Limited License and CC-BY 4.0. Credit Crytek/Frank
  Meinl. Review the Cryengine licence before commercial use.
- `*.hdr`: Poly Haven HDRIs (CC0), as shipped in the three.js r128 repository.
- `GLTFLoader.js` and `RGBELoader.js`: three.js r128 (MIT).
