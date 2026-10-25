#!/usr/bin/env node
// Explicit sRGB pairs or clearly labeled reference fixtures; not a site audit.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function luminance(hex) {
  if (typeof hex !== 'string' || !/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) {
    throw new Error(`Expected an opaque #RGB or #RRGGBB color: ${hex}`);
  }
  let value = hex.slice(1);
  if (value.length === 3) value = [...value].map(c => c + c).join('');
  const channels = [0, 2, 4].map(i => parseInt(value.slice(i, i + 2), 16) / 255)
    .map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
export function getContrastRatio(fg, bg) {
  const a = luminance(fg), b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
function main() {
  const args = process.argv.slice(2);
  let pairs;
  if (!args.length) {
    console.log('Reference fixtures only. These results do not certify any generated design.');
    pairs = [
      { name: 'Reference dark text', fg: '#000000', bg: '#ffffff', req: 4.5 },
      { name: 'Reference light text', fg: '#ffffff', bg: '#000000', req: 4.5 },
    ];
  } else if (args.length === 2 && args[0] === '--pairs') {
    pairs = JSON.parse(fs.readFileSync(args[1], 'utf8'));
    console.log('Checking supplied opaque sRGB pairs; verify compositing and usage in the browser.');
  } else throw new Error('Usage: node check-contrast.mjs [--pairs <pairs.json>]');
  if (!Array.isArray(pairs) || !pairs.length) throw new Error('Pairs must be a nonempty array.');
  let failed = false;
  for (const pair of pairs) {
    if (!pair || typeof pair.name !== 'string' || !pair.name.trim() || ![3, 4.5, 7].includes(pair.req)) {
      throw new Error('Each pair needs name, fg, bg, and req (3, 4.5, or 7). Ordinary text requires 4.5.');
    }
    const ratio = getContrastRatio(pair.fg, pair.bg);
    const pass = ratio >= pair.req;
    failed ||= !pass;
    console.log(`${pass ? 'PASS' : 'FAIL'} ${pair.name}: ${ratio.toFixed(2)}:1 (required ${pair.req}:1)`);
  }
  if (failed) process.exitCode = 1;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
