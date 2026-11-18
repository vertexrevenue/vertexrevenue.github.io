import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { Sky, Dust } from "./Atmosphere";
import { StoryScene } from "./Story";
import { GiantText } from "./GiantText";
import { CameraRig } from "./CameraRig";

function Scene({ mobile }) {
  const world = useRef();
  return (
    <>
      <fog attach="fog" args={["#0a0b0e", 18, 60]} />
      <Sky />
      <Environment resolution={128} frames={1}>
        <color attach="background" args={["#050608"]} />
        <Lightformer form="rect" intensity={2.2} position={[0, 5, 2]} rotation-x={Math.PI / 2} scale={[10, 1, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#7f95ff" position={[6, 0, 1]} rotation-y={-Math.PI / 2} scale={[2, 6, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-6, 1, 1]} rotation-y={Math.PI / 2} scale={[2, 6, 1]} />
      </Environment>
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 8]} intensity={1.1} color="#e9edf5" />
      <directionalLight position={[-6, -2, -4]} intensity={0.8} color="#4f67ff" />

      <GiantText />
      <Dust count={mobile ? 350 : 700} />
      <group ref={world}>
        <StoryScene mobile={mobile} />
      </group>
      <CameraRig worldRef={world} />

      <EffectComposer multisampling={0} disableNormalPass>
        <Bloom mipmapBlur intensity={mobile ? 0.9 : 1.1} luminanceThreshold={0.9} luminanceSmoothing={0.2} radius={0.72} />
        <Noise opacity={0.035} blendFunction={BlendFunction.OVERLAY} />
        <Vignette offset={0.25} darkness={0.7} />
      </EffectComposer>
    </>
  );
}

export default function World({ onReady }) {
  const mobile = typeof window !== "undefined" && window.innerWidth < 900;
  return (
    <Canvas
      id="gl"
      dpr={[1, mobile ? 1.5 : 1.75]}
      gl={{ antialias: false, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      camera={{ fov: 36, near: 0.1, far: 260, position: [0, 0, 10.5] }}
      onCreated={() => setTimeout(() => onReady && onReady(), 350)}
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", zIndex: 0, pointerEvents: "none" }}
      aria-hidden="true"
    >
      <Scene mobile={mobile} />
    </Canvas>
  );
}
