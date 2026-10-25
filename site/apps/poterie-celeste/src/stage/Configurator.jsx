import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

import { FORMS, GLAZES, HEIGHTS } from './vessels.js';

function profile(form) {
  const raw = FORMS[form].pts.map(([r, h]) => new THREE.Vector2(r, h));
  return new THREE.SplineCurve(raw).getPoints(120);
}

function Ring({ pts, from, to, offset = 0.0025, mat }) {
  const geo = useMemo(() => {
    const slice = pts.slice(Math.floor(pts.length * from), Math.ceil(pts.length * to) + 1).map((p) => new THREE.Vector2(p.x + offset, p.y));
    return new THREE.LatheGeometry(slice, 128);
  }, [pts, from, to, offset]);
  useEffect(() => () => geo.dispose(), [geo]);
  return <mesh geometry={geo} material={mat} castShadow />;
}

function Vessel({ form, glaze, gold, height, fireAt }) {
  const pts = useMemo(() => profile(form), [form]);
  const geo = useMemo(() => {
    const g = new THREE.LatheGeometry(pts, 160);
    g.computeVertexNormals();
    return g;
  }, [pts]);
  useEffect(() => () => geo.dispose(), [geo]);
  const g = GLAZES[glaze];
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: g.color, roughness: g.rough, clearcoat: g.rough < 0.3 ? 0.6 : 0.15, clearcoatRoughness: 0.25, side: THREE.DoubleSide }), [g]);
  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d4ad62', metalness: 1, roughness: 0.32 }), []);
  const raw = useMemo(() => new THREE.Color(g.color).lerp(new THREE.Color('#d8d2c8'), 0.72), [g]);
  const fired = useMemo(() => new THREE.Color(g.color), [g]);
  const heat = useMemo(() => [new THREE.Color('#fff3df'), new THREE.Color('#f6a43e'), new THREE.Color('#c4400f'), new THREE.Color('#3a1208'), new THREE.Color('#000000')], []);
  const group = useRef();

  useFrame(() => {
    const since = fireAt ? (performance.now() - fireAt) / 1000 : -1;
    if (since < 0) {
      mat.color.copy(raw); mat.roughness = 0.95; mat.clearcoat = 0; mat.emissive.set('#000');
      goldMat.color.set('#a99d88'); goldMat.metalness = 0.1; goldMat.roughness = 0.9;
      return;
    }
    const t = Math.min(1, since / 2.2);
    const k = t * (heat.length - 1); const i = Math.min(heat.length - 2, Math.floor(k));
    mat.emissive.copy(heat[i]).lerp(heat[i + 1], k - i).multiplyScalar(1 - t * 0.2);
    mat.emissiveIntensity = 1.4 * (1 - t);
    mat.color.copy(raw).lerp(fired, Math.min(1, t * 1.6));
    mat.roughness = THREE.MathUtils.lerp(0.95, g.rough, Math.min(1, t * 1.4));
    mat.clearcoat = THREE.MathUtils.lerp(0, g.rough < 0.3 ? 0.6 : 0.15, t);
    goldMat.color.set('#a99d88').lerp(new THREE.Color('#d4ad62'), t);
    goldMat.metalness = THREE.MathUtils.lerp(0.1, 1, t); goldMat.roughness = THREE.MathUtils.lerp(0.9, 0.32, t);
  });

  return (
    <group ref={group} scale={height}>
      <mesh geometry={geo} material={mat} castShadow />
      {gold === 'lip' && <Ring pts={pts} from={0.95} to={1} mat={goldMat} />}
      {gold === 'bands' && (
        <>
          <Ring pts={pts} from={0.55} to={0.585} mat={goldMat} />
          <Ring pts={pts} from={0.03} to={0.07} mat={goldMat} />
          <Ring pts={pts} from={0.96} to={1} mat={goldMat} />
        </>
      )}
    </group>
  );
}

export default function Configurator({ form, glaze, gold, height, fireAt, turnRef }) {
  const controls = useRef();
  useEffect(() => {
    if (!turnRef) return;
    turnRef.current = (dir) => {
      const c = controls.current; if (!c) return;
      c.setAzimuthalAngle(c.getAzimuthalAngle() + dir * 0.6);
      c.update();
    };
  }, [turnRef]);
  const h = HEIGHTS[height][1];
  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, 0.42, 1.3], fov: 30 }} gl={{ toneMapping: THREE.AgXToneMapping, toneMappingExposure: 1.1 }}>
      <color attach="background" args={['#e6e1d9']} />
      <spotLight position={[-1.2, 2.4, 1.6]} angle={0.5} penumbra={0.9} intensity={22} decay={1.4} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0006} shadow-normalBias={0.03} />
      <spotLight position={[1.4, 1.2, -1.2]} angle={0.7} penumbra={1} intensity={8} decay={1.2} color="#f3e9dc" />
      <hemisphereLight args={['#f6f1ea', '#9a9187', 0.55]} />
      <Vessel form={form} glaze={glaze} gold={gold} height={h} fireAt={fireAt} />
      <ContactShadows position={[0, 0, 0]} opacity={0.42} scale={1.6} blur={2.4} far={0.8} />
      <OrbitControls ref={controls} target={[0, 0.22 * h, 0]} enableZoom={false} enablePan={false} minPolarAngle={0.9} maxPolarAngle={1.62} autoRotate autoRotateSpeed={0.6} />
    </Canvas>
  );
}
