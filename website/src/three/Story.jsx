import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { S } from "../lib/scroll";
import { T, seg, ease, C } from "./layout";
import { prospectFace, inviteFace, CARD_ASPECT } from "./textures";
import { glowTexture } from "./Atmosphere";

/* One continuous shot, scrubbed by scroll:
   a flat envelope slides in, turns into 3D, gets scanned four times,
   opens, the prospect card rises out, the envelope falls away, the card
   flips into a calendar invite, collapses into a spark, and the spark
   lands on a revenue line that climbs. Illustration, not client data. */

const EW = 3.2, EH = 2.0, ED = 0.06;
const CH = 1.9, CW = CH * CARD_ASPECT;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

/* rising revenue line */
const GRAPH = (() => {
  const pts = [];
  const n = 16;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = -5.6 + t * 11.2;
    const trend = -2.3 + Math.pow(t, 1.55) * 5.2;
    const wobble = i === 0 || i === n ? 0 : Math.sin(i * 2.3) * 0.32 - (i % 4 === 2 ? 0.35 : 0);
    pts.push(V(x, trend + wobble, -1.2));
  }
  return pts;
})();

function Envelope({ mat, flapPivot, edgeMat }) {
  const body = useMemo(() => new THREE.BoxGeometry(EW, EH, ED), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(body), [body]);
  const crease = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints([V(-EW / 2, -EH / 2, ED / 2 + 0.002), V(0, 0.12, ED / 2 + 0.002), V(EW / 2, -EH / 2, ED / 2 + 0.002)]);
    return g;
  }, []);
  const flapGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-EW / 2, 0); s.lineTo(EW / 2, 0); s.lineTo(0, -1.18); s.closePath();
    return new THREE.ShapeGeometry(s);
  }, []);
  const flapEdges = useMemo(() => new THREE.EdgesGeometry(flapGeo), [flapGeo]);
  return (
    <group>
      <mesh geometry={body} material={mat} />
      <lineSegments geometry={edges} material={edgeMat} />
      <line geometry={crease} material={edgeMat} />
      <group ref={flapPivot} position={[0, EH / 2, ED / 2 + 0.004]}>
        <mesh geometry={flapGeo} material={mat} />
        <lineSegments geometry={flapEdges} material={edgeMat} />
        <mesh position={[0, -1.02, 0.02]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.085, 0.085, 0.03, 32]} />
          <meshBasicMaterial color={[0.35, 0.48, 1.6]} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

export function StoryScene({ mobile }) {
  const root = useRef(), obj = useRef(), env = useRef(), flap = useRef(), card = useRef();
  const OBJ_SCALE = mobile ? 1.15 : 1.45;
  const scanner = useRef(), spark = useRef(), sparkHalo = useRef();
  const prospect = useMemo(prospectFace, []);
  const invite = useMemo(inviteFace, []);
  const glow = useMemo(glowTexture, []);
  const ticksRef = useRef(0);

  useEffect(() => {
    // redraw once fonts are ready so canvas text uses Archivo
    document.fonts.ready.then(() => { prospect.draw(ticksRef.current); });
  }, [prospect]);

  const envMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#2b2f39", metalness: 0.6, roughness: 0.3, clearcoat: 0.9, clearcoatRoughness: 0.2, envMapIntensity: 1.6, transparent: true }), []);
  const edgeMat = useMemo(() => new THREE.LineBasicMaterial({ color: new THREE.Color(1.6, 1.7, 2.1), toneMapped: false, transparent: true, opacity: 0.9 }), []);
  const frontMat = useMemo(() => new THREE.MeshBasicMaterial({ map: prospect.t, transparent: true, alphaTest: 0.02, side: THREE.FrontSide, toneMapped: false }), [prospect]);
  const backMat = useMemo(() => new THREE.MeshBasicMaterial({ map: invite.t, transparent: true, alphaTest: 0.02, side: THREE.FrontSide, toneMapped: false }), [invite]);
  const scanCore = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(1.2, 1.5, 6), toneMapped: false, transparent: true }), []);
  const scanSoft = useMemo(() => new THREE.MeshBasicMaterial({ color: C.cobalt, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false }), []);

  /* graph pieces */
  const { lineGeo, lineMat, areaGeo, areaMat, dotsGeo, dotsMat, gridGeo, gridMat, curve } = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(GRAPH, false, "catmullrom", 0.2);
    const lineGeo = new THREE.TubeGeometry(curve, 400, 0.045, 12, false);
    const lineMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.9, 1.15, 5.2), toneMapped: false });
    const shape = new THREE.Shape();
    const samples = curve.getSpacedPoints(200);
    shape.moveTo(samples[0].x, -3.2);
    samples.forEach((p) => shape.lineTo(p.x, p.y));
    shape.lineTo(samples[samples.length - 1].x, -3.2);
    shape.closePath();
    const areaGeo = new THREE.ShapeGeometry(shape);
    areaGeo.translate(0, 0, -1.22);
    const areaMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uReveal: { value: -10 } },
      vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `uniform float uReveal; varying vec3 vP;
        void main(){ if (vP.x > uReveal) discard; float a = smoothstep(-3.2, 2.8, vP.y) * 0.32; float edge = smoothstep(uReveal, uReveal - 0.6, vP.x);
          gl_FragColor = vec4(vec3(0.18,0.29,1.0), a * edge); }`,
    });
    const dotsGeo = new THREE.BufferGeometry().setFromPoints(GRAPH.slice(1));
    const dotsMat = new THREE.PointsMaterial({ size: 0.16, color: "#dfe5ff", transparent: true, opacity: 0, depthWrite: false });
    const g = [];
    for (let i = 0; i < 6; i++) { const y = -3 + i * 1.15; g.push(V(-5.8, y, -1.3), V(5.8, y, -1.3)); }
    const gridGeo = new THREE.BufferGeometry().setFromPoints(g);
    const gridMat = new THREE.LineBasicMaterial({ color: "#c4c8d0", transparent: true, opacity: 0 });
    return { lineGeo, lineMat, areaGeo, areaMat, dotsGeo, dotsMat, gridGeo, gridMat, curve };
  }, []);
  const lineRef = useRef();

  const tmpV = useMemo(() => new THREE.Vector3(), []);
  const tmpW = useMemo(() => new THREE.Vector3(), []);
  const qA = useMemo(() => new THREE.Quaternion(), []);
  const qB = useMemo(() => new THREE.Quaternion(), []);
  const eul = useMemo(() => new THREE.Euler(), []);

  useFrame(({ clock }) => {
    const p = S.storyP;
    const t = clock.elapsedTime;
    if (!env.current || !card.current) return;

    /* 1. envelope enters flat, then turns into 3D */
    const eIn = ease(seg(p, T.enter));
    const eTurn = ease(seg(p, T.turn));
    const eDrop = ease(seg(p, T.drop));
    const e = env.current;
    e.position.set(11 - eIn * 11, -eDrop * 5.2 + Math.sin(t * 0.9) * 0.04 * eIn, 0);
    e.rotation.set(eTurn * 0.32 + eDrop * 0.9, eTurn * 0.62 - (1 - eIn) * 0.18 + Math.sin(t * 0.5) * 0.03, eTurn * 0.05 - eDrop * 0.4);
    envMat.opacity = 1 - eDrop;
    edgeMat.opacity = 0.9 * (1 - eDrop);
    e.visible = eDrop < 0.999;

    /* 2. flap opens */
    if (flap.current) flap.current.rotation.x = -ease(seg(p, T.flap)) * 2.75;

    /* 3. card: rides inside the envelope, rises out, then takes centre stage */
    const rise = ease(seg(p, T.rise));
    e.updateMatrixWorld();
    tmpV.set(0, rise * 2.05, 0);
    e.localToWorld(tmpV);
    obj.current.worldToLocal(tmpV);
    const attachedPos = tmpV.clone();
    qA.copy(e.quaternion);

    const take = ease(seg(p, [T.drop[0], T.drop[1] - 0.02]));
    const flip = ease(seg(p, T.flip));
    const shrink = ease(seg(p, T.spark));
    const finalPos = V(0, 0.2, 0.6);
    card.current.position.copy(attachedPos.lerp(finalPos, take));
    eul.set(0, flip * Math.PI, 0);
    qB.setFromEuler(eul);
    card.current.quaternion.copy(qA).slerp(qB, take);
    if (take >= 1) card.current.quaternion.copy(qB);
    const cs = (1 + take * 0.22) * (1 - shrink * 0.97);
    card.current.scale.setScalar(cs);
    card.current.visible = shrink < 0.995;

    /* ticks on the prospect card as each scan finishes */
    const ticks = T.scans.filter((w) => p >= w[1]).length;
    if (ticks !== ticksRef.current) { ticksRef.current = ticks; prospect.draw(ticks); }

    /* 4. scanner light sweeps across for each check */
    let scanX = 0, scanOn = 0;
    T.scans.forEach((w) => {
      const s = seg(p, w);
      if (s > 0 && s < 1) { scanX = -2.3 + s * 4.6; scanOn = Math.sin(s * Math.PI); }
    });
    if (scanner.current) {
      const target = p < T.drop[0] ? e : card.current;
      scanner.current.position.set(target.position.x + scanX, target.position.y + (p < T.drop[0] ? 0.4 : 0), target.position.z + 0.6);
      scanner.current.visible = scanOn > 0.01;
      scanCore.opacity = scanOn;
      scanSoft.opacity = 0.2 * scanOn;
    }

    /* 5. spark: the invite collapses into it, it lands on the graph and rides the line up */
    const reveal = ease(seg(p, T.graph));
    const sp = spark.current, sh = sparkHalo.current;
    if (sp && sh) {
      const born = seg(p, [T.spark[0] + 0.02, T.spark[1]]);
      const startPt = GRAPH[0];
      let pos;
      if (p < T.graph[0]) {
        card.current.getWorldPosition(tmpW);
        root.current.worldToLocal(tmpW);
        pos = tmpW.clone().lerp(startPt, ease(seg(p, [T.spark[0] + 0.03, T.graph[0] + 0.005])));
      } else {
        pos = curve.getPointAt(Math.max(0.0001, Math.min(reveal, 1)));
      }
      sp.position.copy(pos); sh.position.copy(pos);
      const vis = born > 0 ? 1 : 0;
      sp.visible = sh.visible = vis > 0;
      const pulse = 1 + Math.sin(t * 4) * 0.08;
      sp.scale.setScalar((0.55 + (p >= 1 ? 0.15 : 0)) * pulse * Math.min(1, born * 2));
      sh.scale.setScalar(2.4 * pulse * Math.min(1, born * 2));
    }

    /* 6. revenue line draws upward */
    if (lineRef.current) {
      const idx = lineGeo.index.count;
      const count = Math.floor((idx * reveal) / 6) * 6;
      lineGeo.setDrawRange(0, count);
      lineRef.current.visible = count > 0;
    }
    const tipX = -5.6 + reveal * 11.2;
    areaMat.uniforms.uReveal.value = reveal > 0 ? tipX : -10;
    gridMat.opacity = 0.07 * ease(seg(p, [T.spark[0], T.graph[0] + 0.03]));
    dotsMat.opacity = reveal > 0.98 ? 0.9 : 0;
  });

  return (
    <group ref={root}>
      <group ref={obj} scale={OBJ_SCALE}>
      <group ref={env}>
        <Envelope mat={envMat} flapPivot={flap} edgeMat={edgeMat} />
      </group>

      <group ref={card}>
        <mesh material={frontMat} position={[0, 0, 0.004]}>
          <planeGeometry args={[CW, CH]} />
        </mesh>
        <mesh material={backMat} position={[0, 0, -0.004]} rotation-y={Math.PI}>
          <planeGeometry args={[CW, CH]} />
        </mesh>
      </group>

      <group ref={scanner} visible={false}>
        <mesh material={scanCore}><planeGeometry args={[0.035, 3.4]} /></mesh>
        <mesh material={scanSoft}><planeGeometry args={[0.9, 3.4]} /></mesh>
      </group>
      </group>

      <lineSegments geometry={gridGeo} material={gridMat} />
      <mesh geometry={areaGeo} material={areaMat} />
      <mesh ref={lineRef} geometry={lineGeo} material={lineMat} />
      <points geometry={dotsGeo} material={dotsMat} />

      <sprite ref={sparkHalo} visible={false}>
        <spriteMaterial map={glow} color="#3f5bff" transparent opacity={0.75} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <sprite ref={spark} visible={false}>
        <spriteMaterial map={glow} color={[3, 3.2, 4]} toneMapped={false} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
    </group>
  );
}
