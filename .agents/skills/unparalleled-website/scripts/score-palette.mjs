#!/usr/bin/env node
// Local target diagnostics only; not Ou–Luo, Matsuda or an aesthetic predictor.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getContrastRatio } from './check-contrast.mjs';

const bounds = { luminanceRange: [0, 1], saturationMean: [0, 1], hueDiversity: [0, 1], hueSeparation: [0, 180] };
const finite = n => typeof n === 'number' && Number.isFinite(n);
function color(hex) {
  if (typeof hex !== 'string' || !/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) throw new Error('Colors must be opaque #RGB or #RRGGBB.');
  let h = hex.slice(1);
  if (h.length === 3) h = [...h].map(c => c + c).join('');
  const rgb = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  const [r, g, b] = rgb;
  const max = Math.max(...rgb), min = Math.min(...rgb), delta = max - min;
  const lightness = (max + min) / 2;
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  let hue = null;
  if (delta > 1e-10) {
    hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
    hue = (hue * 60 + 360) % 360;
  }
  const lin = rgb.map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return { luminance: lin[0] * .2126 + lin[1] * .7152 + lin[2] * .0722, saturation, hue };
}
export function scorePalette(input) {
  if (!input || !Array.isArray(input.colors) || input.colors.length < 2 || !Array.isArray(input.pairs) || !input.pairs.length) throw new Error('Supply at least two colors and nonempty actual contrast pairs.');
  const names = new Set();
  const colors = input.colors.map(c => {
    if (!c || typeof c.name !== 'string' || !c.name.trim() || names.has(c.name) || !finite(c.weight) || c.weight < 0) throw new Error('Each color needs a unique name, hex and nonnegative finite area weight.');
    names.add(c.name);
    return { ...c, ...color(c.hex) };
  });
  const total = colors.reduce((n, c) => n + c.weight, 0);
  if (Math.abs(total - 1) > 1e-6) throw new Error('Estimated area weights must sum to one.');
  for (const [key, [low, high]] of Object.entries(bounds)) {
    const t = input.targets?.[key];
    if (!Array.isArray(t) || t.length !== 2 || !t.every(finite) || t[0] < low || t[1] > high || t[0] > t[1]) throw new Error(`targets.${key} needs [min,max] within ${low}..${high}.`);
  }
  const active = colors.filter(c => c.weight > 0);
  const chromatic = active.filter(c => c.hue !== null);
  const chromaticWeight = chromatic.reduce((n, c) => n + c.weight, 0);
  let x = 0, y = 0, separation = 0, pairWeight = 0;
  for (const c of chromatic) {
    x += c.weight * Math.cos(c.hue * Math.PI / 180);
    y += c.weight * Math.sin(c.hue * Math.PI / 180);
  }
  for (let i = 0; i < chromatic.length; i++) for (let j = i + 1; j < chromatic.length; j++) {
    const delta = Math.abs(chromatic[i].hue - chromatic[j].hue);
    const weight = chromatic[i].weight * chromatic[j].weight;
    separation += Math.min(delta, 360 - delta) * weight;
    pairWeight += weight;
  }
  const raw = {
    luminanceRange: Math.max(...active.map(c => c.luminance)) - Math.min(...active.map(c => c.luminance)),
    saturationMean: colors.reduce((n, c) => n + c.weight * c.saturation, 0),
    hueDiversity: chromaticWeight ? Math.max(0, Math.min(1, 1 - Math.hypot(x, y) / chromaticWeight)) : null,
    hueSeparation: pairWeight ? separation / pairWeight : null,
  };
  const metrics = Object.fromEntries(Object.entries(raw).map(([key, value]) => {
    const [min, max] = input.targets[key];
    const distance = value === null ? null : Math.max(min - value, value - max, 0);
    const score = distance === null ? null : Math.max(0, 100 * (1 - distance / (bounds[key][1] - bounds[key][0])));
    return [key, { value, target: [min, max], score }];
  }));
  const pairs = input.pairs.map(pair => {
    if (!pair || typeof pair.name !== 'string' || !pair.name.trim() || ![3, 4.5, 7].includes(pair.req)) throw new Error('Each pair needs name, fg, bg and req (3, 4.5 or 7).');
    const ratio = getContrastRatio(pair.fg, pair.bg);
    return { ...pair, ratio, pass: ratio >= pair.req };
  });
  const scores = Object.values(metrics).filter(m => m.score !== null).map(m => m.score);
  return { method: 'local target fit; not a published harmony formula or design verdict', colors, metrics, fitScore: scores.reduce((a, b) => a + b, 0) / scores.length, omittedMetrics: Object.keys(raw).filter(k => raw[k] === null), contrastPass: pairs.every(p => p.pass), pairs };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length !== 2 || args[0] !== '--input') throw new Error('Usage: node scripts/score-palette.mjs --input <palette.json>');
    const result = scorePalette(JSON.parse(fs.readFileSync(args[1], 'utf8')));
    console.log(JSON.stringify(result, null, 2));
    if (!result.contrastPass) process.exitCode = 1;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
