import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { rng } from "../lib/noise";

/* Plain, quiet sky: charcoal below, a faint midnight-cobalt haze above. */
export function Sky() {
  const ref = useRef();
  const mat = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `varying vec3 vDir;
      void main(){
        float h = vDir.y;
        vec3 low = vec3(0.018,0.019,0.024);
        vec3 mid = vec3(0.040,0.043,0.052);
        vec3 high = vec3(0.045,0.060,0.150);
        vec3 c = mix(low, mid, smoothstep(-0.6, 0.1, h));
        c = mix(c, high, smoothstep(0.1, 1.0, h) * 0.55);
        gl_FragColor = vec4(c, 1.0);
      }`,
  }), []);
  useFrame(({ camera }) => ref.current && ref.current.position.copy(camera.position));
  return (
    <mesh ref={ref} material={mat} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[150, 48, 32]} />
    </mesh>
  );
}

/* Fine silver dust, barely moving. Gives depth without decoration. */
export function Dust({ count = 700 }) {
  const ref = useRef();
  const { geo, speeds } = useMemo(() => {
    const r = rng(11);
    const pos = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (r() - 0.5) * 50;
      pos[i * 3 + 1] = (r() - 0.5) * 30;
      pos[i * 3 + 2] = -25 + r() * 30;
      speeds[i] = 0.03 + r() * 0.1;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return { geo, speeds };
  }, [count]);
  useFrame((_, dt) => {
    const p = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      p[i * 3 + 1] += speeds[i] * dt;
      if (p[i * 3 + 1] > 15) p[i * 3 + 1] = -15;
    }
    geo.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={ref} geometry={geo} frustumCulled={false}>
      <pointsMaterial size={0.035} color="#b8c0d6" transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
    </points>
  );
}

export function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.14, "rgba(200,212,255,.95)");
  gr.addColorStop(0.4, "rgba(70,95,255,.42)");
  gr.addColorStop(1, "rgba(47,75,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
