import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const BASE = import.meta.env.BASE_URL;
export const MODEL_URL = `${BASE}models/poterie-celeste-pot.glb`;
const DRACO = `${BASE}draco/`;
const TEX = (n) => `${BASE}textures/${n}.webp`;
const TEXTURES = ['wall_diff', 'wall_nor', 'wall_rough', 'plinth_diff', 'plinth_nor', 'plinth_rough', 'pot_diff', 'pot_nor', 'pot_rough'];

useGLTF.preload(MODEL_URL, DRACO);

// The pot's centre in scene units (Blender Z-up becomes three Y-up on export).
const POT_CENTER = new THREE.Vector3(0, 0.95 + 0.39, 0);

// Story beats along the pinned scroll: whole, breaking, floating, mending, whole.
export function explodeAmount(p) {
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  if (p < 0.2) return 0;
  if (p < 0.44) return ease((p - 0.2) / 0.24);
  if (p < 0.72) return 1 + ((p - 0.44) / 0.28) * 0.2;
  if (p < 0.93) return 1.2 * (1 - inOut((p - 0.72) / 0.21));
  return 0;
}

function prepare(tex, { color = false, repeat = 1, offset = [0, 0] } = {}) {
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.offset.set(...offset);
  tex.anisotropy = 8;
  if (color) tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function useStudioMaterials() {
  const t = useTexture(TEXTURES.map(TEX));
  return useMemo(() => {
    const [wd, wn, wr, pd, pn, pr, vd, vn, vr] = t;
    const wall = new THREE.MeshStandardMaterial({
      map: prepare(wd, { color: true, repeat: 0.27, offset: [0.5, 0.1] }),
      normalMap: prepare(wn, { repeat: 0.27, offset: [0.5, 0.1] }),
      roughnessMap: prepare(wr, { repeat: 0.27, offset: [0.5, 0.1] }),
      normalScale: new THREE.Vector2(1.1, 1.1),
      color: '#8a8276',
    });
    const plinth = new THREE.MeshStandardMaterial({
      map: prepare(pd, { color: true, repeat: 2.2 }),
      normalMap: prepare(pn, { repeat: 2.2 }),
      roughnessMap: prepare(pr, { repeat: 2.2 }),
      normalScale: new THREE.Vector2(0.6, 0.6),
      color: '#c2b8aa',
    });
    const pot = new THREE.MeshStandardMaterial({
      map: prepare(vd, { color: true }),
      normalMap: prepare(vn),
      roughnessMap: prepare(vr),
      normalScale: new THREE.Vector2(1.4, 1.4),
      roughness: 1,
      color: '#ffffff',
    });
    const fracture = new THREE.MeshStandardMaterial({ color: '#cfc6b9', roughness: 0.96, normalMap: vn, normalScale: new THREE.Vector2(2, 2) });
    return { wall, plinth, pot, fracture };
  }, [t]);
}

export function StudioLights({ poolRef }) {
  const key = useRef();
  const pool = useRef();
  const { scene } = useThree();
  useLayoutEffect(() => {
    const k = key.current; const p = pool.current;
    k.target.position.set(0, 1.1, -0.2); scene.add(k.target);
    p.target.position.set(0, 1.4, -2.2); scene.add(p.target);
    if (poolRef) poolRef.current = p;
    return () => { scene.remove(k.target); scene.remove(p.target); };
  }, [scene, poolRef]);
  return (
    <>
      <spotLight ref={key} position={[-0.9, 3.6, 1.6]} angle={0.42} penumbra={0.95} intensity={52} decay={1.6} color="#fff3e2"
        castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0005} shadow-normalBias={0.04} shadow-radius={6}
        shadow-camera-near={1.5} shadow-camera-far={7} />
      <spotLight ref={pool} position={[0.3, 3.4, -0.6]} angle={0.55} penumbra={1} intensity={18} decay={1.4} color="#fff1e0" />
      <hemisphereLight args={['#efe7dc', '#6f675e', 0.4]} />
      {/* Low rim from behind-right so the plinth's edges lift off the wall. */}
      <directionalLight position={[0.9, 1.4, -1.4]} intensity={0.9} color="#fff4e6" />
    </>
  );
}

// The studio: putty cyclorama, plaster plinth, and the vessel that breaks and mends with scroll.
export default function Studio({ progressRef, pointerRef, interactive = true }) {
  const gltf = useGLTF(MODEL_URL, DRACO);
  const mats = useStudioMaterials();
  const group = useRef();
  const poolRef = useRef();
  const smooth = useRef(0);
  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  const { root, vase, shards, movers } = useMemo(() => {
    const root = gltf.scene.clone(true);
    let vase = null; const shards = [];
    const rand = mulberry32(19);
    root.traverse((o) => {
      if (!o.isMesh) return;
      const name = o.material?.name || '';
      if (/Wall/i.test(name)) { o.material = mats.wall; o.receiveShadow = true; }
      else if (/Plinth/i.test(name)) { o.material = mats.plinth; o.receiveShadow = true; o.castShadow = true; }
      else if (/Fracture/i.test(name)) { o.material = mats.fracture; o.castShadow = true; o.receiveShadow = false; }
      else if (/Pot/i.test(name)) { o.material = mats.pot; o.castShadow = true; o.receiveShadow = true; }
    });
    root.traverse((o) => {
      const n = o.name || '';
      if (/^Shard/.test(n)) { shards.push(o); o.traverse((m) => { if (m.isMesh) m.receiveShadow = false; }); }
      else if (/^Vase$/.test(n)) vase = o;
    });
    // Recentre each shard on its own centroid so it can tumble about itself.
    root.updateMatrixWorld(true);
    const data = shards.map((s) => {
      const box = new THREE.Box3().setFromObject(s);
      const centreW = box.getCenter(new THREE.Vector3());
      const centreL = s.worldToLocal(centreW.clone());
      s.traverse((m) => { if (m.isMesh) m.geometry = m.geometry.clone().translate(-centreL.x, -centreL.y, -centreL.z); });
      s.position.add(centreL.clone().applyQuaternion(s.quaternion).multiply(s.scale));
      const dir = centreW.clone().sub(POT_CENTER);
      dir.y *= 0.4; dir.normalize();
      dir.x += (rand() - 0.5) * 0.35; dir.y += (rand() - 0.45) * 0.3; dir.z += (rand() - 0.5) * 0.3; dir.normalize();
      return {
        obj: s,
        base: s.position.clone(),
        baseQ: s.quaternion.clone(),
        dir,
        dist: 0.2 + rand() * 0.34,
        axis: new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(),
        spin: (rand() - 0.5) * 3.2,
        phase: rand() * Math.PI * 2,
      };
    });
    shards.forEach((s) => { s.visible = false; });
    // Only the vessel turns towards the pointer; the room stays put. Re-parent it under a
    // group whose origin is the pot's centre.
    const movers = new THREE.Group();
    root.children.slice().forEach((c) => {
      if (/^Shard|^Vase$/.test(c.name)) { root.remove(c); c.position.sub(POT_CENTER); movers.add(c); }
    });
    data.forEach((s) => s.base.sub(POT_CENTER));
    return { root, vase, shards: data, movers };
  }, [gltf, mats]);

  useEffect(() => () => { root.traverse((o) => o.isMesh && o.geometry?.dispose()); }, [root]);

  const q = useMemo(() => new THREE.Quaternion(), []);
  const wob = useMemo(() => new THREE.Quaternion(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const target = reduced ? 0 : (progressRef?.current ?? 0);
    // Moving between stages jumps the target; snap instead of sweeping through a false burst.
    if (Math.abs(target - smooth.current) > 0.25) smooth.current = target;
    else smooth.current = THREE.MathUtils.damp(smooth.current, target, 5, delta);
    const e = explodeAmount(smooth.current);
    const t = state.clock.elapsedTime;
    const broken = e > 0.002;
    if (vase) vase.visible = !broken;
    for (const s of shards) {
      s.obj.visible = broken;
      if (!broken) continue;
      const float = Math.min(1, e) * 0.028;
      tmp.copy(s.dir).multiplyScalar(s.dist * e);
      tmp.y += Math.sin(t * 0.7 + s.phase) * float;
      tmp.x += Math.cos(t * 0.5 + s.phase) * float * 0.6;
      s.obj.position.copy(s.base).add(tmp);
      q.setFromAxisAngle(s.axis, s.spin * Math.min(e, 1.2));
      wob.setFromAxisAngle(s.axis, Math.sin(t * 0.45 + s.phase) * 0.22 * Math.min(1, e));
      s.obj.quaternion.copy(s.baseQ).multiply(q).multiply(wob);
    }
    // The room dims a little while the pieces hang in the air.
    if (poolRef.current) poolRef.current.intensity = 18 - Math.min(1, e) * 6;
    if (group.current && interactive && pointerRef) {
      const px = pointerRef.current.x; const py = pointerRef.current.y;
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, px * 0.12 * (0.4 + Math.min(1, e)), 3, delta);
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, py * 0.04 * Math.min(1, e), 3, delta);
    }
  });

  return (
    <>
      <StudioLights poolRef={poolRef} />
      <primitive object={root} />
      <group ref={group} position={POT_CENTER.toArray()}>
        <primitive object={movers} />
      </group>
    </>
  );
}

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
