// One scroll progress value (0..1) drives the whole descent: part offsets, the camera,
// the thermometer and the length scale. Everything here is pure so the DOM and the
// scene read the same numbers.
import { Vector3 } from 'three';

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smooth = (t) => t * t * (3 - 2 * t);
export const ramp = (p, a, b) => smooth(clamp((p - a) / (b - a)));

// Stage tops in metres (three.js Y up), matching the Blender build.
export const PLATE_R = { '300K': 0.3, '50K': 0.262, '4K': 0.24, Still: 0.222, Cold: 0.205, MXC: 0.192 };
export const PLATE_Y = { '300K': 1.9, '50K': 1.62, '4K': 1.36, Still: 1.13, Cold: 0.93, MXC: 0.72 };
const TOP = PLATE_Y['300K'];
export const EXPLODE_MAX = 2.4;

// Chapters and their windows. Each `hold` is where the reading is stable.
export const CHAPTERS = [
  { id: 'room', from: 0, to: 0.065 },
  { id: 'motive', from: 0.065, to: 0.16 },
  { id: 'principle-0', from: 0.16, to: 0.21 },
  { id: 'principle-1', from: 0.21, to: 0.26 },
  { id: 'principle-2', from: 0.26, to: 0.30 },
  { id: 'stage-4K', from: 0.30, to: 0.40 },
  { id: 'stage-Still', from: 0.40, to: 0.47 },
  { id: 'stage-Cold', from: 0.47, to: 0.54 },
  { id: 'stage-MXC', from: 0.54, to: 0.61 },
  { id: 'package', from: 0.61, to: 0.70 },
  { id: 'die', from: 0.70, to: 0.75 },
  { id: 'city', from: 0.75, to: 0.82 },
  { id: 'qubit', from: 0.82, to: 0.87 },
  { id: 'squid', from: 0.87, to: 0.92 },
  { id: 'junction', from: 0.92, to: 1.0001 },
];
export const chapterAt = (p) => CHAPTERS.findIndex((c) => p >= c.from && p < c.to);
// Where a chapter reads best, used by the rail links and the reduced-motion mode.
export const chapterRest = (c) => c.from + (c.to - c.from) * 0.72;

export const explodeAt = (p) => 1 + (EXPLODE_MAX - 1) * ramp(p, 0.30, 0.355);
export const plateY = (key, E) => TOP - (TOP - PLATE_Y[key]) * E;
export const dyFor = (key, E) => plateY(key, E) - PLATE_Y[key];

// Which plate each part rides with when the stack separates.
export const RIDES = {
  'Plate 300K': '300K', 'Span 300K': '300K', 'Top Hardware': '300K', 'Signal Looms': '300K',
  // Spans (lines, supports, plumbing) hang from the plate above; mounts (attenuators, amplifiers,
  // circulators, clamps, the still pot and mixing chamber) stay seated on their own plate.
  'Plate 50K': '50K', 'Span 50K': '50K', 'Mount 50K': '50K',
  'Plate 4K': '4K', 'Span 4K': '4K', 'Mount 4K': '4K',
  'Plate Still': 'Still', 'Span Still': 'Still', 'Mount Still': 'Still',
  'Plate Cold': 'Cold', 'Span Cold': 'Cold', 'Mount Cold': 'Cold',
  'Plate MXC': 'MXC', 'Mount MXC': 'MXC', 'Cold Finger': 'MXC', 'Magnetic Shield': 'MXC', 'Basilisk Bracket': 'MXC', 'Basilisk 2': 'MXC',
};

// Covers that leave: how far they drop (metres) and when.
export const COVERS = {
  'Vacuum Can': { drop: 2.3, a: 0.1, b: 0.155 },
  'Shield 50K': { drop: 2.1, a: 0.17, b: 0.215 },
  'Shield 4K': { drop: 1.9, a: 0.22, b: 0.265 },
  'Signal Looms': { drop: 0, a: 0.08, b: 0.1 },
  'Magnetic Shield': { drop: 0.42, a: 0.61, b: 0.645 },
};
export const coverState = (name, p) => {
  const c = COVERS[name];
  if (!c) return null;
  const t = ramp(p, c.a, c.b);
  return { dy: -c.drop * t, opacity: 1 - smooth(clamp((t - 0.45) / 0.55)) };
};
export const floorOpacity = (p) => 1 - ramp(p, 0.31, 0.37);

// The frame folds away at the start of the motive: braces swing down, the top and mounting
// beams drop on their end joints, the rails follow, then the legs tip outward onto the floor.
// Each member pivots at its joint (set in Blender); `to` is where its free end ends up pointing.
const FOLD = [
  { prefix: 'Frame Brace', a: 0.068, b: 0.086, to: 'down' },
  { prefix: 'Frame Top', a: 0.076, b: 0.098, to: 'down' },
  { prefix: 'Frame Mount', a: 0.08, b: 0.1, to: 'down' },
  { prefix: 'Frame Rail', a: 0.088, b: 0.104, to: 'down' },
  { prefix: 'Frame Leg', a: 0.098, b: 0.126, to: 'out' },
];
export const foldSpec = (name) => FOLD.find((f) => name.startsWith(f.prefix));
export function foldState(spec, p) {
  const t = ramp(p, spec.a, spec.b);
  // fade during the last third of the swing; legs also sink into the floor once flat
  const fade = clamp((t - 0.66) / 0.34);
  const sink = spec.to === 'out' ? -0.12 * ramp(p, spec.b - 0.008, spec.b + 0.01) : 0;
  return { t, opacity: 1 - smooth(fade), sink };
}
export const lidState = (p) => {
  const t = ramp(p, 0.645, 0.675);
  return { out: 0.035 * smooth(clamp(t * 2)), side: 0.09 * smooth(clamp(t * 1.6 - 0.6)), opacity: 1 - ramp(p, 0.665, 0.69) };
};

// Die centre in world space (three.js) at a given explode factor. Die-local (x, y) in metres
// map straight onto world X and Y; the die faces +Z.
export const DIE_BASE = new Vector3(0, 0.478, 0.0015);
export const dieAnchor = (E, out = new Vector3()) => out.copy(DIE_BASE).setY(DIE_BASE.y + dyFor('MXC', E));
export const um = (x, y, z = 0) => new Vector3(x * 1e-6, y * 1e-6, z * 1e-6);

// Camera keys: target, view direction (from target toward camera) and distance.
// `space: 'die'` keys are relative to the die anchor; the scene re-centres there for precision.
const V = (x, y, z) => new Vector3(x, y, z);
const dir = (x, y, z) => new Vector3(x, y, z).normalize();
// Machine keys: fixed targets, or a plate-relative height (`plate`, `dy`) resolved per frame.
const machineKeys = [
  { p: 0.0, t: V(-0.82, 1.12, 0), d: dir(0.42, 0.1, 1), r: 5.4 },
  { p: 0.065, t: V(-0.82, 1.12, 0), d: dir(0.42, 0.1, 1), r: 5.4 },
  { p: 0.15, t: V(-0.5, 1.18, 0), d: dir(0.5, 0.12, 1), r: 4.3 },
  { p: 0.215, t: V(-0.38, 1.2, 0), d: dir(0.55, 0.14, 1), r: 3.6 },
  { p: 0.29, t: V(-0.3, 1.22, 0), d: dir(0.58, 0.16, 1), r: 3.2 },
  { p: 0.355, t: V(-0.2, 0, 0), plate: '4K', dy: -0.04, d: dir(0.62, 0.32, 1), r: 1.35 },
  { p: 0.40, t: V(-0.2, 0, 0), plate: '4K', dy: -0.06, d: dir(0.6, 0.3, 1), r: 1.3 },
  { p: 0.425, t: V(-0.2, 0, 0), plate: 'Still', dy: -0.04, d: dir(0.6, 0.3, 1), r: 1.25 },
  { p: 0.47, t: V(-0.2, 0, 0), plate: 'Still', dy: -0.06, d: dir(0.58, 0.3, 1), r: 1.2 },
  { p: 0.495, t: V(-0.2, 0, 0), plate: 'Cold', dy: -0.04, d: dir(0.58, 0.3, 1), r: 1.15 },
  { p: 0.54, t: V(-0.2, 0, 0), plate: 'Cold', dy: -0.06, d: dir(0.56, 0.3, 1), r: 1.1 },
  { p: 0.565, t: V(-0.18, 0, 0), plate: 'MXC', dy: -0.05, d: dir(0.55, 0.28, 1), r: 1.05 },
  { p: 0.61, t: V(-0.16, 0, 0), plate: 'MXC', dy: -0.12, d: dir(0.5, 0.25, 1), r: 1.0 },
];
const dieKeys = [
  { p: 0.65, t: um(0, 0), d: dir(0.18, 0.06, 1), r: 0.2, space: 'die' },
  { p: 0.70, t: um(0, -3000), d: dir(0.16, 0.02, 1), r: 0.17, space: 'die' },
  { p: 0.735, t: um(0, 0), d: dir(0.22, -0.18, 1), r: 0.0185, space: 'die' },
  { p: 0.75, t: um(-150, 150), d: dir(0.24, -0.3, 1), r: 0.0145, space: 'die' },
  { p: 0.79, t: um(-760, 820), d: dir(0.42, -0.95, 0.4), r: 0.00125, space: 'die' },
  { p: 0.82, t: um(-790, 760), d: dir(0.4, -0.95, 0.42), r: 0.00105, space: 'die' },
  { p: 0.85, t: um(-800, 640), d: dir(0.28, -0.62, 0.74), r: 0.00034, space: 'die' },
  { p: 0.87, t: um(-800, 632), d: dir(0.26, -0.6, 0.76), r: 0.0003, space: 'die' },
  { p: 0.90, t: um(-800, 622), d: dir(0.24, -0.55, 0.8), r: 0.000042, space: 'die' },
  { p: 0.92, t: um(-800, 622), d: dir(0.24, -0.55, 0.8), r: 0.000038, space: 'die' },
  { p: 0.965, t: um(-807, 621.6, 0.3), d: dir(0.5, -0.55, 0.68), r: 0.0000048, space: 'die' },
  { p: 1.0, t: um(-807, 621.6, 0.3), d: dir(0.52, -0.5, 0.69), r: 0.0000044, space: 'die' },
];
const KEYS = [...machineKeys, ...dieKeys];
for (const k of KEYS) k.logR = Math.log(k.r);

// Scratch objects: the camera is evaluated every frame, so nothing here allocates.
const anchorV = new Vector3(), taV = new Vector3(), tbV = new Vector3();
const CAM = { position: new Vector3(), target: new Vector3(), r: 1, space: 'world' };
function keyTarget(k, E, inDie, out) {
  out.copy(k.t);
  if (k.plate) out.y = plateY(k.plate, E) + k.dy;
  if (inDie && k.space !== 'die') out.sub(anchorV);
  return out;
}
// Returns the camera for progress p. When `space` is 'die' the position and target are
// relative to the die anchor, and the scene is shifted so the anchor sits at the origin.
// The returned object is reused between calls.
export function cameraAt(p, E, aspect = 1.6) {
  dieAnchor(E, anchorV);
  let i = 0;
  while (i < KEYS.length && KEYS[i].p <= p) i++;
  if (i >= KEYS.length) i = KEYS.length - 1;
  const a = KEYS[Math.max(0, i - 1)], b = KEYS[i];
  const t = a === b ? 1 : smooth(clamp((p - a.p) / (b.p - a.p)));
  // Express both keys in die space once the descent reaches the package.
  const inDie = a.space === 'die' || b.space === 'die';
  const target = CAM.target.copy(keyTarget(a, E, inDie, taV)).lerp(keyTarget(b, E, inDie, tbV), t);
  const d = taV.copy(a.d).lerp(b.d, t).normalize();
  // Distance interpolates in log space, so zooming feels the same at every scale.
  let r = Math.exp(a.logR + (b.logR - a.logR) * t);
  // Portrait: pull back, centre the machine and lift it above the copy panel.
  if (aspect < 1) {
    r *= inDie ? 1 + (1 - aspect) * 0.6 : 1 + (1 - aspect) * 1.7;
    if (!inDie) { target.x *= 0.1; target.y -= r * 0.1; }
    else target.y -= r * 0.12;
  }
  CAM.position.copy(target).addScaledVector(d, r);
  CAM.r = r;
  CAM.space = inDie ? 'die' : 'world';
  return CAM;
}

// Operating temperature of the layer in view, kelvin. Moves in log space between stages.
const TEMP_KEYS = [
  // The 50 K to 4 K change, where the page passes mid-grey, is kept short (0.236 to 0.252).
  [0, 296], [0.065, 296], [0.15, 296], [0.17, 296], [0.205, 50], [0.236, 50], [0.252, 4], [0.355, 4], [0.40, 4],
  [0.425, 0.8], [0.47, 0.8], [0.495, 0.1], [0.54, 0.1], [0.565, 0.01], [1, 0.01],
];
export function temperatureAt(p) {
  let i = TEMP_KEYS.findIndex(([kp]) => kp > p);
  if (i === -1) return TEMP_KEYS[TEMP_KEYS.length - 1][1];
  const [pa, ta] = TEMP_KEYS[Math.max(0, i - 1)], [pb, tb] = TEMP_KEYS[i];
  const t = smooth(clamp((p - pa) / (pb - pa || 1)));
  return Math.exp(Math.log(ta) + (Math.log(tb) - Math.log(ta)) * t);
}
export const LOG_HOT = Math.log10(300), LOG_COLD = Math.log10(0.01);
export const coldness = (T) => clamp((LOG_HOT - Math.log10(T)) / (LOG_HOT - LOG_COLD));
export function formatTemp(T) {
  if (T >= 100) return `${T.toFixed(0)} K`;
  if (T >= 10) return `${T.toFixed(1)} K`;
  if (T >= 1) return `${T.toFixed(2)} K`;
  const mK = T * 1000;
  return mK >= 100 ? `${mK.toFixed(0)} mK` : `${mK.toFixed(1)} mK`;
}

// Width of the field of view at the target, for the length-scale instrument.
export function fieldWidth(r, fov = 34, aspect = 1.6) {
  return 2 * r * Math.tan((fov * Math.PI) / 360) * aspect;
}
export function formatLength(m) {
  if (m >= 1) return `${m.toFixed(2)} m`;
  if (m >= 0.01) return `${(m * 1000).toFixed(0)} mm`;
  if (m >= 0.001) return `${(m * 1000).toFixed(1)} mm`;
  if (m >= 1e-5) return `${(m * 1e6).toFixed(0)} µm`;
  return `${(m * 1e6).toFixed(1)} µm`;
}

// Page colour by coldness: lab white at room temperature, the logo's midnight navy at 10 mK.
// The big lightness change happens between the 50 K and 4 K holds (coldness 0.24 to 0.36), so no
// stable reading ever sits on a mid-grey page; chroma stays near zero while the hue swaps sides.
export function pageColors(c) {
  const drop = smooth(clamp((c - 0.24) / 0.12));
  const deepen = smooth(clamp((c - 0.36) / 0.64));
  const L = 96.5 - (96.5 - 27) * drop - (27 - 19) * deepen;
  const warm = 1 - drop;
  const C = 0.005 * warm + 0.035 * drop * (0.55 + 0.45 * deepen);
  const H = drop < 0.5 ? 85 : 252;
  return { bg: `oklch(${L.toFixed(2)}% ${C.toFixed(4)} ${H})`, rgb: oklchToSrgb(L / 100, C, H), dark: drop > 0.5 };
}

// three.js colours take sRGB; the page uses oklch. Same colour, converted (Björn Ottosson's matrices).
export function oklchToSrgb(L, C, H) {
  const h = (H * Math.PI) / 180, a = C * Math.cos(h), b = C * Math.sin(h);
  const l_ = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
  return lin.map((c) => clamp(c));   // linear sRGB, which is what three.js Color stores
}
