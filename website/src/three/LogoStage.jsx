import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { Monogram, useChrome } from "./LogoVR";
import { glowTexture } from "./Atmosphere";
import { S } from "../lib/scroll";

/* The VR mark as a real object: drag to spin it any way you like.
   It keeps the spin you give it, slows down, then drifts on its own. */
function Fit() {
  const { camera, size } = useThree();
  useEffect(() => {
    const a = size.width / size.height;
    camera.position.z = a < 1.15 ? 11 / Math.max(a, 0.6) * 0.95 : 11;
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

function Spinner() {
  const group = useRef();
  const chrome = useChrome();
  const glow = useMemo(glowTexture, []);
  const { gl } = useThree();
  const st = useRef({ drag: false, x: 0, y: 0, vx: 0, vy: 0, idle: 3 });

  useEffect(() => {
    const el = gl.domElement;
    const s = st.current;
    const down = (e) => { s.drag = true; s.x = e.clientX; s.y = e.clientY; s.vx = s.vy = 0; el.setPointerCapture(e.pointerId); el.style.cursor = "grabbing"; };
    const move = (e) => {
      if (!s.drag) return;
      const dx = e.clientX - s.x, dy = e.clientY - s.y;
      s.x = e.clientX; s.y = e.clientY;
      s.vx = dx * 0.0085; s.vy = dy * 0.0085;
      spin(s.vx, s.vy);
    };
    const up = (e) => { s.drag = false; s.idle = 0; el.style.cursor = "grab"; try { el.releasePointerCapture(e.pointerId); } catch {} };
    el.style.cursor = "grab";
    el.style.touchAction = "pan-y";
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [gl]);

  const qa = useMemo(() => new THREE.Quaternion(), []);
  const Y = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const X = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const eul = useMemo(() => new THREE.Euler(), []);
  function spin(ax, ay) {
    if (!group.current) return;
    qa.setFromAxisAngle(Y, ax); group.current.quaternion.premultiply(qa);
    qa.setFromAxisAngle(X, ay); group.current.quaternion.premultiply(qa);
  }

  useFrame(({ clock }, dt) => {
    const s = st.current;
    if (!group.current) return;
    if (!s.drag) {
      // scrolling nudges the spin, like the object feels the page move
      const dy = S.y - (s.lastY ?? S.y);
      s.lastY = S.y;
      s.vx += Math.max(Math.min(dy * 0.0009, 0.06), -0.06);
      s.vx *= Math.pow(0.03, dt); s.vy *= Math.pow(0.03, dt);
      spin(s.vx, s.vy);
      s.idle += dt;
      // its own slow turn, so it always reads as a real 3D object
      const auto = Math.min(Math.max((s.idle - 1.2) / 1.5, 0), 1);
      if (auto > 0) {
        qa.setFromAxisAngle(Y, 0.32 * dt * auto);
        group.current.quaternion.premultiply(qa);
        // keep it upright: ease any tilt from dragging back toward level
        eul.setFromQuaternion(group.current.quaternion, "YXZ");
        eul.x += (Math.sin(clock.elapsedTime * 0.5) * 0.08 - eul.x) * Math.min(1, dt * 1.2 * auto);
        eul.z += (0 - eul.z) * Math.min(1, dt * 1.2 * auto);
        group.current.quaternion.setFromEuler(eul);
      }
    }
    group.current.position.y = Math.sin(clock.elapsedTime * 0.9) * 0.08;
  });

  return (
    <group ref={group} rotation={[0.04, 0.3, 0]}>
      <Monogram chrome={chrome} />
      <sprite position={[(14 - 19) / 7, (16 - 29.7) / 7, 0]} scale={1.1}>
        <spriteMaterial map={glow} color="#4c66ff" transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
    </group>
  );
}

export default function LogoStage() {
  return (
    <Canvas
      className="logo-stage"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      camera={{ fov: 30, position: [0, 0, 11] }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#0d0f14"]} />
        <Lightformer form="rect" intensity={4} position={[0, 5, -2]} rotation-x={Math.PI / 2} scale={[14, 2.4, 1]} />
        <Lightformer form="rect" intensity={2.2} position={[0, 0, 8]} scale={[10, 1.4, 1]} />
        <Lightformer form="rect" intensity={3.2} position={[-6, 1, 1]} rotation-y={Math.PI / 2} scale={[3.5, 10, 1]} />
        <Lightformer form="rect" intensity={2.4} color="#5470ff" position={[6, -1, 0]} rotation-y={-Math.PI / 2} scale={[2, 7, 1]} />
        <Lightformer form="ring" intensity={2.4} position={[0, 2, 7]} scale={3.5} />
        <Lightformer form="rect" intensity={1} color="#2f4bff" position={[0, -6, 2]} rotation-x={-Math.PI / 2} scale={[8, 2, 1]} />
      </Environment>
      <Fit />
      <Spinner />
    </Canvas>
  );
}
