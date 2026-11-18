import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { S, clamp } from "../lib/scroll";

/* "REVENUE" in huge silver letters, sliding past behind everything as you
   scroll, and rising a little as it goes, like the line it sits behind. */
function makeTexture(word) {
  const c = document.createElement("canvas");
  const g = c.getContext("2d");
  const size = 420;
  const font = `800 ${size}px "Archivo Variable", "Archivo", sans-serif`;
  g.font = font;
  try { g.fontStretch = "extra-expanded"; } catch {}
  const w = Math.ceil(g.measureText(word).width) + 80;
  c.width = w; c.height = Math.ceil(size * 0.95);
  g.font = font;
  try { g.fontStretch = "extra-expanded"; } catch {}
  const grad = g.createLinearGradient(0, 0, 0, c.height);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(1, "#7d828c");
  g.fillStyle = grad;
  g.fillText(word, 40, size * 0.8);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return { t, aspect: c.width / c.height };
}

export function GiantText({ word = "REVENUE", z = -8, height = 6.4, opacity = 0.07 }) {
  const [tex, setTex] = useState(null);
  const ref = useRef();
  useEffect(() => {
    let alive = true;
    document.fonts.load(`800 100px "Archivo Variable"`).finally(() => { if (alive) setTex(makeTexture(word)); });
    return () => { alive = false; };
  }, [word]);
  const mat = useMemo(() => tex && new THREE.MeshBasicMaterial({ map: tex.t, transparent: true, opacity, depthWrite: false, fog: false }), [tex, opacity]);
  useFrame(() => {
    if (!ref.current || !tex) return;
    const w = height * tex.aspect;
    const sec = S.sec.how;
    const end = sec ? sec.top + sec.h : S.vh * 8;
    const p = clamp(S.y / end);
    ref.current.position.x = w * 0.48 - p * w * 1.05;
    ref.current.position.y = -1.6 + p * 2.6;
  });
  if (!tex) return null;
  return (
    <mesh ref={ref} position={[0, 0, z]} material={mat} renderOrder={-1}>
      <planeGeometry args={[height * tex.aspect, height]} />
    </mesh>
  );
}
