import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, invalidate, useFrame, useThree } from '@react-three/fiber';
import { Environment as Env, Html, Lightformer, useGLTF } from '@react-three/drei';
import { BackSide, Box3, BufferGeometry, Float32BufferAttribute, CanvasTexture, Color, Fog, Matrix4, Quaternion, SRGBColorSpace, Vector2, Vector3 } from 'three';
import {
  RIDES, PLATE_R, EXPLODE_MAX, cameraAt, coverState, dieAnchor, dyFor, explodeAt, floorOpacity, foldSpec, foldState, lidState,
  pageColors, coldness, temperatureAt, plateY, um, DIE_BASE,
} from './timeline.js';
import { progress } from './progress.js';
import { CITY_LABELS, STAGES } from '../data.js';

const BASE = import.meta.env.BASE_URL;
const shared = { cam: null };
const DRACO = `${BASE}draco/`;
useGLTF.preload(`${BASE}models/cryostat.glb`, DRACO);

// A photographic studio baked once into the environment map: dark surround, a large overhead
// soft box and two tall strips, so the brushed steel and the gold have something to reflect.
function Studio() {
  return (
    <Env resolution={256} frames={1} environmentIntensity={1}>
      <color attach="background" args={['#454b54']} />
      <Lightformer form="rect" intensity={3.2} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[8, 5, 1]} />
      <Lightformer form="rect" intensity={2.4} position={[5, 1.5, 2]} rotation-y={-Math.PI / 2.4} scale={[1.4, 7, 1]} />
      <Lightformer form="rect" intensity={1.4} position={[-5, 2, -1]} rotation-y={Math.PI / 2.2} scale={[1.2, 6, 1]} color="#e9eef6" />
      <Lightformer form="rect" intensity={0.9} position={[0, 1.5, 6]} scale={[10, 2.2, 1]} />
      <Lightformer form="rect" intensity={2.2} position={[0, 4.5, -6]} rotation-x={Math.PI / 5} scale={[12, 3.5, 1]} color="#fff6e8" />
      <Lightformer form="rect" intensity={0.5} position={[0, -3, 0]} rotation-x={-Math.PI / 2} scale={[10, 10, 1]} color="#c9c3b8" />
    </Env>
  );
}

// Each named part remembers where it was built so offsets are always applied from rest.
// GLTFLoader sanitises node names ("Vacuum Can" arrives as "Vacuum_Can"), so map them back
// to the Blender names the timeline uses. The first node with a name is the part's root.
function useParts(root) {
  return useMemo(() => {
    const map = {};
    root.traverse((o) => {
      const name = o.name.replace(/_/g, ' ');
      if (!name || map[name]) return;
      map[name] = { obj: o, base: o.position.clone() };
    });
    return map;
  }, [root]);
}

// Covers fade out as they leave, so give them their own transparent materials.
function ownMaterials(obj) {
  const mats = [];
  obj.traverse((o) => {
    if (!o.isMesh) return;
    o.material = Array.isArray(o.material) ? o.material.map((m) => m.clone()) : o.material.clone();
    (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { m.transparent = true; mats.push(m); });
  });
  return mats;
}
function setOpacity(mats, a) {
  for (const m of mats) {
    m.opacity = a;
    m.depthWrite = a > 0.6;
  }
}

function Cryostat({ world }) {
  const { scene } = useGLTF(`${BASE}models/cryostat.glb`, DRACO);
  shared.cryo = scene;
  const parts = useParts(scene);
  const fades = useMemo(() => {
    const f = {};
    for (const n of ['Vacuum Can', 'Shield 50K', 'Shield 4K', 'Magnetic Shield', 'Signal Looms']) {
      if (parts[n]) f[n] = ownMaterials(parts[n].obj);
    }
    return f;
  }, [parts]);
  // Frame members: where each free end points at rest, and the rotation that folds it.
  const fold = useMemo(() => {
    const list = [];
    const down = new Vector3(0, -1, 0);
    for (const [name, part] of Object.entries(parts)) {
      const spec = foldSpec(name);
      if (!spec || !part.obj.isMesh) continue;
      const box = new Box3().setFromBufferAttribute(part.obj.geometry.attributes.position);
      const corners = [box.min, box.max].flatMap((a) => [box.min, box.max].flatMap((b) => [box.min, box.max].map((c) => new Vector3(a.x, b.y, c.z))));
      const far = corners.reduce((m, v) => (v.lengthSq() > m.lengthSq() ? v : m)).clone().normalize();
      const out = new Vector3(part.base.x, 0, part.base.z).normalize();
      const to = spec.to === 'out' ? out : down;
      // Legs point up from their foot; everything else points along its length from the joint.
      const from = spec.to === 'out' ? new Vector3(0, 1, 0) : far;
      list.push({ part, spec, q: new Quaternion().setFromUnitVectors(from, to), rest: part.obj.quaternion.clone(), mats: ownMaterials(part.obj) });
    }
    return list;
  }, [parts]);
  const qt = useMemo(() => new Quaternion(), []);
  useEffect(() => { invalidate(); }, [scene]);
  useFrame(() => {
    const p = progress.value;
    const E = explodeAt(p);
    for (const [name, part] of Object.entries(parts)) {
      const ride = RIDES[name];
      let dy = ride ? dyFor(ride, E) : 0;
      const cover = coverState(name, p);
      if (cover) {
        dy += cover.dy;
        setOpacity(fades[name], cover.opacity);
        part.obj.visible = cover.opacity > 0.002;
      }
      part.obj.position.y = part.base.y + dy;
    }
    for (const f of fold) {
      const s = foldState(f.spec, p);
      qt.identity().slerp(f.q, s.t);
      f.part.obj.quaternion.copy(f.rest).premultiply(qt);
      f.part.obj.position.y = f.part.base.y + s.sink;
      setOpacity(f.mats, s.opacity);
      f.part.obj.visible = s.opacity > 0.002;
    }
  });
  return <primitive object={scene} />;
}

function Basilisk() {
  const { scene } = useGLTF(`${BASE}models/basilisk-2.glb`, DRACO);
  const parts = useParts(scene);
  const lid = parts['Basilisk Lid'];
  const root = parts['Basilisk 2'];
  const lidMats = useMemo(() => (lid ? ownMaterials(lid.obj) : []), [lid]);
  const { gl, camera } = useThree();
  const warm = useRef(1);
  // Compile its shaders and draw it once as soon as it loads, so the GPU upload never lands mid-scroll.
  useEffect(() => { gl.compile(scene, camera); invalidate(); }, [gl, scene, camera]);
  useFrame(() => {
    const p = progress.value;
    const E = explodeAt(p);
    if (root) root.obj.position.y = root.base.y + dyFor('MXC', E);
    if (lid) {
      const s = lidState(p);
      // The lid sits on the package front; in package space +Y is world +Z (toward the camera).
      lid.obj.position.set(lid.base.x + s.side, lid.base.y + s.out, lid.base.z);
      setOpacity(lidMats, s.opacity);
      lid.obj.visible = s.opacity > 0.002;
    }
    // The micro circuit only matters once the camera is close; skip drawing it until then.
    // The first frames after loading draw it once so its buffers reach the GPU before the camera arrives.
    const near = p > 0.6 || warm.current-- > 0;
    for (const n of ['Basilisk Circuit', 'Basilisk Airbridges', 'Basilisk SQUIDs', 'Basilisk Junction Q10']) {
      if (parts[n]) parts[n].obj.visible = near;
    }
  });
  return <primitive object={scene} />;
}

// The room: a white lab with floor, walls and ceiling you can read as a space. Corners are defined
// by soft occlusion baked into each surface, by each plane taking the light differently, and by
// linear LED panels on the ceiling. The cryostat stands over a pit: the vacuum can and shields are
// lowered into it, as in real installations. The room takes the page colour as the machine cools,
// and fades as the stages separate below floor level.
const PIT = { x: 0.45, z: 0.42, depth: 2.8 };
// The room runs a long way back; its far end dissolves in fog, so walls, floor and ceiling recede to a vanishing point.
const ROOM = { x: 7, back: -130, front: 9, h: 4.6, deck: 1.2, turn: 0.25 };
// Edge occlusion: each surface darkens toward the corners it meets.
function occlusionTexture(edges = [1, 1, 1, 1]) {
  const N = 256, c = document.createElement('canvas'); c.width = c.height = N;
  const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, N, N);
  const band = N * 0.16;
  const sides = [[0, 0, N, band, 0, 0, 0, band], [0, N - band, N, band, 0, N, 0, N - band], [0, 0, band, N, 0, 0, band, 0], [N - band, 0, band, N, N, 0, N - band, 0]];
  sides.forEach(([x, y, w, h, x0, y0, x1, y1], i) => {
    if (!edges[i]) return;
    const grad = g.createLinearGradient(x0, y0, x1, y1);
    grad.addColorStop(0, 'rgba(60,62,66,0.42)'); grad.addColorStop(0.35, 'rgba(60,62,66,0.12)'); grad.addColorStop(1, 'rgba(60,62,66,0)');
    g.fillStyle = grad; g.fillRect(x, y, w, h);
  });
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace;
  return t;
}
const LED_ROWS = [-3.2, 0, 3.2];
const LED_SEGMENTS = Math.floor((ROOM.front - 1 - ROOM.back) / 4);
const LED_COUNT = LED_ROWS.length * LED_SEGMENTS;
// Where a ray from the origin at angle a leaves an axis-aligned rectangle containing the origin.
const rectHit = (x0, x1, y0, y1) => (a) => {
  const c = Math.cos(a), sn = Math.sin(a);
  const tx = c > 0 ? x1 / c : c < 0 ? x0 / c : Infinity;
  const ty = sn > 0 ? y1 / sn : sn < 0 ? y0 / sn : Infinity;
  const t = Math.min(tx, ty);
  return [c * t, sn * t];
};
// A flat ring between two closed outlines, built as quads along rays from the origin. Unlike
// polygon triangulation with holes, this can never bridge a sliver across the opening.
function ringGeometry(inner, outer, n, uvOf) {
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    for (const p of [inner(a), outer(a)]) { pos.push(p[0], p[1], 0); uv.push(...uvOf(p[0], p[1])); }
    if (i < n) { const k = i * 2; idx.push(k, k + 1, k + 3, k, k + 3, k + 2); }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}
function Room() {
  const group = useRef();
  const leds = useRef();
  useEffect(() => {
    const m = new Matrix4(), q = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2), one = new Vector3(1, 1, 1);
    let i = 0;
    for (const x of LED_ROWS) {
      for (let k = 0; k < LED_SEGMENTS; k++) leds.current.setMatrixAt(i++, m.compose(new Vector3(x, ROOM.h - 0.012, ROOM.front - 2 - k * 4), q, one));
    }
    leds.current.instanceMatrix.needsUpdate = true;
  }, []);
  const mats = useRef([]);
  const W = ROOM.x * 2, D = ROOM.front - ROOM.back, H = ROOM.h;
  const geo = useMemo(() => {
    const d = ROOM.deck;
    // floor: from a circle around the deck out to the room rectangle (shape y maps to -z after rotation)
    const floor = ringGeometry((a) => [Math.cos(a) * d, Math.sin(a) * d], rectHit(-ROOM.x, ROOM.x, -ROOM.front, -ROOM.back), 160,
      (x, y) => [(x + ROOM.x) / W, (y + ROOM.front) / D]);
    // deck: from the pit opening out to a slightly larger circle, carrying the contact shading
    const deck = ringGeometry(rectHit(-PIT.x, PIT.x, -PIT.z, PIT.z), (a) => [Math.cos(a) * (d + 0.02), Math.sin(a) * (d + 0.02)], 160,
      (x, y) => [x / (2 * d) + 0.5, y / (2 * d) + 0.5]);
    return { floor, deck };
  }, [W, D]);
  const tex = useMemo(() => {
    const N = 512, c = document.createElement('canvas'); c.width = c.height = N;
    const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, N, N);
    const grad = g.createRadialGradient(N / 2, N / 2, N * 0.22, N / 2, N / 2, N * 0.49);
    grad.addColorStop(0, 'rgba(40,44,50,0.34)'); grad.addColorStop(1, 'rgba(40,44,50,0)');
    g.fillStyle = grad; g.fillRect(0, 0, N, N);
    const shade = new CanvasTexture(c); shade.colorSpace = SRGBColorSpace;
    return { shade, surface: occlusionTexture(), long: occlusionTexture([1, 1, 0, 0]), lane: occlusionTexture([0, 0, 1, 1]) };
  }, []);
  const tint = useMemo(() => new Color(), []);
  useFrame(() => {
    const p = progress.value;
    const a = floorOpacity(p);
    group.current.visible = a > 0.01;
    tint.setRGB(...pageColors(coldness(temperatureAt(p))).rgb);
    for (const m of mats.current) {
      if (!m) continue;
      m.opacity = a;
      m.depthWrite = a > 0.6;
      if (m.userData.room) m.color.copy(tint);
    }
  });
  let n = 0;
  const keep = (room) => { const i = n++; return (m) => { if (m) { m.userData.room = room; mats.current[i] = m; } }; };
  const surface = (map = tex.surface, rough = 0.9) => <meshStandardMaterial ref={keep(true)} map={map} roughness={rough} metalness={0} transparent />;
  // walls: [position, rotation, width]
  const walls = [
    [[0, H / 2, ROOM.back], [0, 0, 0], W],
    [[0, H / 2, ROOM.front], [0, Math.PI, 0], W],
    [[-ROOM.x, H / 2, (ROOM.back + ROOM.front) / 2], [0, Math.PI / 2, 0], D],
    [[ROOM.x, H / 2, (ROOM.back + ROOM.front) / 2], [0, -Math.PI / 2, 0], D],
  ];
  return (
    <group ref={group}>
      <group rotation-y={ROOM.turn}>
      <mesh geometry={geo.floor} rotation-x={-Math.PI / 2} renderOrder={-2}>{surface(tex.lane, 0.62)}</mesh>
      {walls.map(([pos, rot, w], i) => (
        <mesh key={i} position={pos} rotation={rot} renderOrder={-2}>
          <planeGeometry args={[w, H]} />
          {surface(i < 2 ? tex.surface : tex.long)}
        </mesh>
      ))}
      <mesh position={[0, H, (ROOM.back + ROOM.front) / 2]} rotation-x={Math.PI / 2} renderOrder={-2}>
        <planeGeometry args={[W, D]} />
        {surface(tex.lane)}
      </mesh>
      {/* linear LED panels on the ceiling, in segments that repeat into the distance */}
      <instancedMesh ref={leds} args={[null, null, LED_COUNT]} renderOrder={-1}>
        <planeGeometry args={[0.16, 2.6]} />
        <meshBasicMaterial ref={keep(false)} color="#f4f4f2" toneMapped={false} transparent />
      </instancedMesh>
      </group>
      <mesh geometry={geo.deck} rotation-x={-Math.PI / 2} renderOrder={-1}>
        <meshStandardMaterial ref={keep(true)} map={tex.shade} roughness={0.62} metalness={0} transparent />
      </mesh>
      <mesh position={[0, -PIT.depth / 2, 0]}>
        <boxGeometry args={[PIT.x * 2, PIT.depth, PIT.z * 2]} />
        <meshStandardMaterial ref={keep(false)} color="#2b2f35" roughness={0.92} side={BackSide} transparent />
      </mesh>
      {[[0, PIT.z, PIT.x * 2 + 0.08, 0.04], [0, -PIT.z, PIT.x * 2 + 0.08, 0.04], [PIT.x, 0, 0.04, PIT.z * 2], [-PIT.x, 0, 0.04, PIT.z * 2]].map(([x, z, w, d]) => (
        <mesh key={`${x},${z}`} position={[x, 0.004, z]}>
          <boxGeometry args={[w, 0.008, d]} />
          <meshStandardMaterial ref={keep(false)} color="#b9bdc2" metalness={0.9} roughness={0.35} transparent />
        </mesh>
      ))}
    </group>
  );
}

const Emax = EXPLODE_MAX;
// Each stage label sits on the front of its plate's rim (the point nearest the camera, which is
// near the middle of the frame and clear of the thermometer) and follows the plate as it moves.
function StageLabels({ chapter }) {
  const refs = useRef({});
  const { size } = useThree();
  const tmp = useMemo(() => ({ right: new Vector3(), view: new Vector3(), up: new Vector3(0, 1, 0) }), []);
  useFrame(() => {
    const p = progress.value;
    const E = explodeAt(p);
    const cam = shared.cam;
    if (!cam) return;
    // horizontal direction from the stack toward the camera, nudged a little to the right
    tmp.view.copy(cam.position).sub(cam.target).setY(0).normalize();
    tmp.right.crossVectors(tmp.up, tmp.view).normalize();
    tmp.right.multiplyScalar(0.35).add(tmp.view).normalize();
    for (const s of STAGES) {
      const g = refs.current[s.key];
      if (!g) continue;
      g.position.copy(tmp.right).multiplyScalar(PLATE_R[s.key] + 0.004).setY(plateY(s.key, E) - 0.008);
    }
  });
  return STAGES.map((s) => (
    <group key={s.key} ref={(g) => { refs.current[s.key] = g; }}>
      <Html zIndexRange={[20, 0]} pointerEvents="none">
        <div className={`tag tag--stage${chapter === `stage-${s.key}` ? ' is-on' : ''}`} aria-hidden="true">
          <span className="tag__temp">{s.temp}</span> {s.name}
        </div>
      </Html>
    </group>
  ));
}
function CityLabels({ chapter }) {
  const base = useMemo(() => DIE_BASE.clone().setY(DIE_BASE.y + dyFor('MXC', Emax)), []);
  return CITY_LABELS.map((l) => (
    <Html key={l.text} position={base.clone().add(um(...l.at)).toArray()} zIndexRange={[20, 0]} pointerEvents="none">
      <div className={`tag tag--chip${l.step.includes(chapter) ? ' is-on' : ''}`} aria-hidden="true">{l.text}</div>
    </Html>
  ));
}

// The camera keeps roughly unit distance from its target: the world is scaled by 1/r and, inside
// the processor, re-centred on the die. Logarithmic depth adds 1.0 before taking the log, so at
// micrometre distances an unscaled scene runs out of depth precision and surfaces flicker.
function Rig({ world, onFrame }) {
  const { camera, scene, size } = useThree();
  const bg = useMemo(() => new Color(), []);
  const anchor = useMemo(() => new Vector3(), []);
  const look = useMemo(() => new Vector3(), []);
  useFrame(() => {
    const p = progress.value;
    const E = explodeAt(p);
    const cam = cameraAt(p, E, size.width / size.height);
    shared.cam = cam;
    const k = 1 / cam.r;
    world.current.scale.setScalar(k);
    if (cam.space === 'die') world.current.position.copy(dieAnchor(E, anchor)).multiplyScalar(-k);
    else world.current.position.set(0, 0, 0);
    camera.position.copy(cam.position).multiplyScalar(k);
    camera.lookAt(look.copy(cam.target).multiplyScalar(k));
    // The world is rescaled so the target sits about one unit away; a plain depth buffer is precise enough.
    camera.near = 0.01;
    camera.far = 1500;
    // At chip scale the cryostat is far outside the frame; skip drawing it.
    if (shared.cryo) shared.cryo.visible = !(cam.space === 'die' && cam.r < 0.03);
    camera.updateProjectionMatrix();
    const c = pageColors(coldness(temperatureAt(p)));
    bg.setRGB(...c.rgb);
    scene.background = bg;
    if (!scene.fog) scene.fog = new Fog(bg.clone(), 1, 2);
    scene.fog.color.copy(bg).multiplyScalar(0.86);
    scene.fog.near = 9 * k;
    scene.fog.far = 60 * k;
    onFrame?.(p, cam);
  });
  return null;
}

export default function Scene({ chapter, onFrame, loadChip }) {
  const world = useRef();
  return (
    <Canvas
      className="stage__canvas"
      // Fixed resolution: changing it mid-scroll resizes the canvas, which is itself a hitch.
      dpr={[1, 1.25]}
      frameloop="demand"
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 34, near: 0.01, far: 100, position: [2, 1.4, 5] }}
      onCreated={(state) => { state.gl.toneMappingExposure = 1.05; if (import.meta.env.DEV) window.__r3f = state; }}
    >
      <Studio />
      <hemisphereLight args={['#ffffff', '#8a8f99', 0.35]} />
      <directionalLight position={[2.5, 4, 3]} intensity={1.6} />
      <directionalLight position={[-3, 2, -2]} intensity={0.5} color="#dfe6f0" />
      <group ref={world}>
        <Suspense fallback={null}>
          <Cryostat world={world} />
          <Room />
          {chapter.startsWith('stage-') && <StageLabels chapter={chapter} />}
        </Suspense>
        {loadChip && (
          <Suspense fallback={null}>
            <Basilisk />
            {['city', 'qubit', 'squid'].includes(chapter) && <CityLabels chapter={chapter} />}
          </Suspense>
        )}
      </group>
      <Rig world={world} onFrame={onFrame} />
    </Canvas>
  );
}
