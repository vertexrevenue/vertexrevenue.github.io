import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { S, clamp } from "../lib/scroll";
import { seg, ease } from "./layout";

/* Camera follows the story timeline. Before the story it holds a calm wide
   frame; after it, it settles on the revenue line and drifts slightly. */
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const K = [
  // at story progress p: camera position, look target, world offset (x, y)
  { p: 0.0, pos: V(0, 0, 10.5), look: V(0, 0, 0) },
  { p: 0.12, pos: V(0, 0, 10.5), look: V(0, 0, 0) },
  { p: 0.3, pos: V(-2.4, 1.3, 9.2), look: V(0, 0.2, 0) },
  { p: 0.46, pos: V(-1.6, 2.0, 9.6), look: V(0, 0.7, 0) },
  { p: 0.62, pos: V(-1.2, 1.7, 9.8), look: V(0, 1.2, 0) },
  { p: 0.76, pos: V(-0.4, 0.5, 9.0), look: V(0, 0.2, 0.6) },
  { p: 0.86, pos: V(0.3, 0.4, 8.8), look: V(0, 0.2, 0.6) },
  { p: 1.0, pos: V(0, 0.6, 14.2), look: V(0, 0.2, -1.2) },
];

/* the story object is drawn larger on desktop; pull the camera back by the
   same amount for the object poses so it stays in frame */
const scaled = (k, f) => (k.p > 0.9 ? k : { p: k.p, pos: k.pos.clone().multiplyScalar(f), look: k.look.clone().multiplyScalar(f) });

function sample(p, f = 1) {
  for (let i = 0; i < K.length - 1; i++) {
    const a = scaled(K[i], f), b = scaled(K[i + 1], f);
    if (p <= b.p) {
      const t = ease(seg(p, [a.p, b.p]));
      return { pos: a.pos.clone().lerp(b.pos, t), look: a.look.clone().lerp(b.look, t) };
    }
  }
  const z = K[K.length - 1];
  return { pos: z.pos.clone(), look: z.look.clone() };
}

export function CameraRig({ worldRef }) {
  const { camera, size } = useThree();
  const mobile = size.width < 900;
  const cur = useRef({ pos: V(0, 0, 10.5), look: V(0, 0, 0), wx: 0, wy: 0 });
  const look = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }, dt) => {
    const p = S.storyP;
    const T = sample(p, mobile ? 1 : 1.36);
    // after the story, a slow drift so the page never feels frozen
    const sec = S.sec.how;
    const after = sec ? clamp((S.y - (sec.top + sec.h - S.vh)) / (S.vh * 3)) : 0;
    const tt = clock.elapsedTime;
    T.pos.x += Math.sin(tt * 0.12) * 0.6 * after;
    T.pos.y += Math.sin(tt * 0.09) * 0.3 * after;

    // keep the object clear of the text column
        // final call to action: slide the revenue line to the right of the text
    const bk = S.sec.book;
    const cta = bk ? clamp((S.y + S.vh - bk.top) / S.vh) : 0;
    const wx = mobile ? 0 : (p >= 0.9 ? 1.2 : 2.5) + ease(cta) * 3.2;
    if (!mobile) T.pos.z += ease(cta) * 5.5;
    const wy = mobile ? (p >= 0.9 ? -0.6 : -1.5) : 0;
    if (mobile) T.pos.z *= p >= 0.9 ? 2.0 : 1.55;

    const k = 1 - Math.exp(-dt * (S.reduced ? 50 : 3.2));
    const c = cur.current;
    c.pos.lerp(T.pos, k); c.look.lerp(T.look, k);
    c.wx += (wx - c.wx) * k; c.wy += (wy - c.wy) * k;
    camera.position.set(c.pos.x + S.mouse.x * 0.5, c.pos.y - S.mouse.y * 0.35, c.pos.z);
    look.copy(c.look);
    camera.lookAt(look);
    if (worldRef.current) worldRef.current.position.set(c.wx, c.wy, 0);
  });
  return null;
}
