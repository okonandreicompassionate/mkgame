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

1. On the laptop, choose **PHONE VS COMPUTER**, then select your fighter and a
   stage.
2. Open the controller link shown on the laptop on one phone, or visit
   `http://<laptop-ip>:3000/controller` and enter the room code.
3. Keep the laptop game open as the display. The phone controls Player 1 and
   the computer controls the opponent.

On the same Wi-Fi, this mode works over the local network without an internet
connection. Use the laptop's Wi-Fi IPv4 address (find it with `ipconfig`) on the
phone, not `localhost`.

## Play with two phone controllers

1. On the laptop, choose **CREATE GAME** and select both fighters and a stage.
2. Share the controller link shown on screen with both phones, or open
   `http://<laptop-ip>:3000/controller` on each phone and enter the room code.
3. Each phone is assigned Player 1 or Player 2. Keep the laptop page open; it
   runs and displays the match. The phones send button inputs, not a video
   stream.

For phones on the same Wi-Fi, use the laptop's local IPv4 address (find it with
`ipconfig`). Allow Node.js through the Windows firewall on the local network if
prompted. For play across the internet, deploy
the Node server to a host that supports persistent WebSocket connections; the
included `render.yaml` configures Render. Use the deployed HTTPS address on all
devices.

The separate `/controller` page is intentionally lightweight and does not load
the 3D game. On lower-powered devices, the game also starts with reduced
rendering quality and disables costly post-processing and shadow effects.

## Assets and licences

- `sponza.glb`: KhronosGroup glTF Sample Assets, (c) Crytek; dual-licensed
  under the Cryengine Limited License and CC-BY 4.0. Credit Crytek/Frank
  Meinl. Review the Cryengine licence before commercial use.
- `*.hdr`: Poly Haven HDRIs (CC0), as shipped in the three.js r128 repository.
- `GLTFLoader.js` and `RGBELoader.js`: three.js r128 (MIT).
