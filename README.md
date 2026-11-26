# HOMELANDER 3D: Rooftop Fight

## Play online

The Node server hosts the game files and relays room messages over WebSockets. The player who creates the room runs the existing game simulation; the other player's controls are sent to that host, and the host streams the live game state back. Combat rules stay in the browser game.

Online controls are relayed immediately, quick taps are buffered until the next game tick, and the host sends state updates every rendered frame. Actual response time still depends on both players' network latency.

### Run locally

1. Install Node.js.
2. Run `npm install`, then `npm start`.
3. Open `http://localhost:3000` and choose **Create online room**.
4. To play from another computer on your home network, open the same address using the host computer's local IP address and join with the room code.

### Host over the internet

Deploy this folder as a Node web service (the included `render.yaml` can be used as a Render blueprint). Once deployed, both players open the service's HTTPS URL, then one creates a room and shares the six-character code. The other player joins with that code.

The server must support WebSocket upgrades at `/ws`. HTTPS deployments use secure WebSockets automatically.
"# mkgame" 
