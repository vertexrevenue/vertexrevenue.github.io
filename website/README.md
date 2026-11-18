# Vertex Revenue website

Vite + React + Three.js (React Three Fiber) site for https://vertexrevenue.github.io

## Run it locally
```
cd website
npm install
npm run dev
```
Open the address it prints (usually http://localhost:5173).

## Change the booking link
Edit `BOOKING_URL` in `src/config.js`. Every "Book" button uses it.

## How it is built
- `src/three/` is the 3D world: chrome VR logo (LogoVR), stone slab and rocks (Stone), light beam, dust and halo rings (Atmosphere), the qualification funnel (Funnel), the giant sliding letters (GiantText) and the scroll-driven camera (CameraRig).
- `src/components/` is the page: nav, cursor, loader and all sections.
- `src/lib/scroll.js` is the shared scroll state (Lenis smooth scroll). The camera and the text both read from it.
- No WebGL or "reduce motion" turned on: the page falls back to a still layout.

## Deploy
Push to `main`. The workflow in `.github/workflows/deploy.yml` builds this folder and commits the result (index.html, assets/) to the repo root, which GitHub Pages already serves. No settings change needed. The site updates about 2 minutes after the push.
