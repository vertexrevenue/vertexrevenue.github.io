# Vertex Revenue website

Vite + React + Three.js (React Three Fiber). Live at https://vertexrevenue.github.io

## Where to change things

| To change | Edit |
|---|---|
| Booking link, LinkedIn link, email | `src/config.js` |
| Any page text, price, FAQ, process steps | `src/components/Sections.jsx` |
| Nav links, loader, animated wordmark | `src/components/Chrome.jsx` |
| Colours, spacing, fonts, layout | `src/styles.css` |
| Privacy and terms text | `privacy.html`, `terms.html` |
| Founder photo | `public/founder.webp` |

Inside `Sections.jsx`: `STEPS` (scroll story), `DAYS` (first 30 days), `QUESTIONS` (the five qualification questions), `FAQS`. Pricing is in `Pricing()`, fit rules in `Fit()`, the replacement policy in `Counts()`.

## The 3D world (`src/three/`)

- `LogoStage.jsx`, `LogoVR.jsx`: the draggable chrome VR monogram in the hero.
- `Story.jsx`, `textures.js`: the envelope, prospect card and revenue line that morph as you scroll.
- `CameraRig.jsx`: camera path for the scroll story.
- `layout.js`: the story timeline (when each stage starts and ends) and colours.
- `GiantText.jsx`: the large sliding "REVENUE" letters.
- `Atmosphere.jsx`, `World.jsx`: background, dust, lighting, post effects.
- `src/lib/scroll.js`: shared scroll state used by both the page and the 3D scene.

If WebGL is missing or reduced motion is on, the page shows a still layout instead.

## Run it on your computer

```
cd website
npm install
npm run dev
```

Open the address it prints (usually http://localhost:5173).

## Deploy

Push to `main`. The workflow builds this folder and publishes the output to the repo root, which GitHub Pages serves. No settings to change.
