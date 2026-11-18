import { useMemo } from "react";
import * as THREE from "three";

/* VR monogram as swept chrome tubes, all on one plane so the R is welded
   into the V: the V's right arm is the R's stem, the bowl returns into that
   arm, and the leg leaves from the same joint. A cobalt spark marks the vertex. */
const V3 = (x, y, z = 0) => new THREE.Vector3(x, y, z);
const S = 1 / 7;
export const P = (x, y) => V3((x - 19) * S, (16 - y) * S, 0);

function roundCorner(path, a, b, c, d) {
  const ab = b.clone().sub(a).normalize();
  const bc = c.clone().sub(b).normalize();
  const p1 = b.clone().addScaledVector(ab, -d);
  const p2 = b.clone().addScaledVector(bc, d);
  path.add(new THREE.LineCurve3(a, p1));
  path.add(new THREE.QuadraticBezierCurve3(p1, b, p2));
  return p2;
}

export function buildMonogram() {
  const A = P(4, 4), B = P(14, 28), C = P(24, 4);
  const k1 = P(34, 3), k2 = P(31, 15.2);
  const M = P(14 + 10 * (13 / 24), 15); // point on the right arm where the bowl closes
  const main = new THREE.CurvePath();
  const afterB = roundCorner(main, A, B, C, 0.3);
  const afterC = roundCorner(main, afterB, C, k1, 0.2);
  main.add(new THREE.CubicBezierCurve3(afterC, k1, k2, M));
  const legStart = P(21.5, 15);
  const leg = new THREE.CubicBezierCurve3(legStart, P(25.5, 19.2), P(29.5, 23.6), P(34, 28));
  return { main, leg, A, M, legStart, legEnd: P(34, 28), vertex: P(14, 29.7) };
}

export function useChrome() {
  return useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#eceef3",
    metalness: 1,
    roughness: 0.08,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    iridescence: 0.12,
    iridescenceIOR: 1.3,
    envMapIntensity: 1.6,
  }), []);
}

export function Monogram({ chrome, dotRef }) {
  const g = useMemo(() => {
    const m = buildMonogram();
    return {
      ...m,
      mainGeo: new THREE.TubeGeometry(m.main, 560, 0.19, 40, false),
      legGeo: new THREE.TubeGeometry(m.leg, 160, 0.19, 40, false),
    };
  }, []);
  const dot = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(0.7, 0.85, 3.4), toneMapped: false }), []);
  return (
    <group>
      <mesh geometry={g.mainGeo} material={chrome} />
      <mesh geometry={g.legGeo} material={chrome} />
      {[g.A, g.M, g.legStart, g.legEnd].map((p, i) => (
        <mesh key={i} position={p} material={chrome}>
          <sphereGeometry args={[i === 1 ? 0.2 : 0.19, 32, 24]} />
        </mesh>
      ))}
      <mesh ref={dotRef} position={g.vertex} material={dot}>
        <sphereGeometry args={[0.17, 32, 24]} />
      </mesh>
    </group>
  );
}
