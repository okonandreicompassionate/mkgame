# Run locally
    cd game
    python3 -m http.server 8080      # any static server works; file:// will NOT load the GLB
Open http://localhost:8080 . Pick stage 3 (RUINED TEMPLE). Local game works as before; online rooms still need your own /ws server.
# Assets and licences
- assets/sponza.glb: Sponza, KhronosGroup/glTF-Sample-Assets, (c) Crytek; dual-licensed Cryengine Limited License + CC-BY 4.0. Textures downsized to 1024 webp (17.8 MB). Credit Crytek/Frank Meinl. Check the Cryengine licence before commercial use.
- assets/*.hdr: Poly Haven HDRIs (CC0) as shipped in the three.js r128 repo (MIT).
- assets/js/*Loader.js: three.js r128 (MIT).
