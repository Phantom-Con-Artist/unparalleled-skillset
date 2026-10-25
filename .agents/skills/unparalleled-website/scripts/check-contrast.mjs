#!/usr/bin/env node

/**
 * WCAG 2.1 Contrast Checker Script for Unparalleled Website
 */

function parseHex(hex) {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function sRGBtoLinear(c) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function getRelativeLuminance({ r, g, b }) {
  const rL = sRGBtoLinear(r);
  const gL = sRGBtoLinear(g);
  const bL = sRGBtoLinear(b);
  return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
}

export function getContrastRatio(hex1, hex2) {
  const lum1 = getRelativeLuminance(parseHex(hex1));
  const lum2 = getRelativeLuminance(parseHex(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

const websitePairs = [
  { name: 'Dark Hero Headline on Canvas', fg: '#fafafa', bg: '#09090b', req: 4.5 },
  { name: 'Dark Body Copy on Canvas', fg: '#d4d4d8', bg: '#09090b', req: 4.5 },
  { name: 'Dark Card Subtitle on Card', fg: '#a1a1aa', bg: '#141417', req: 4.5 },
  { name: 'Emerald CTA Text on Accent', fg: '#09090b', bg: '#10b981', req: 4.5 },
  { name: 'Editorial Luxe Serif on Warm Canvas', fg: '#1c1917', bg: '#faf7f2', req: 4.5 },
  { name: 'Editorial Luxe Body on Warm Canvas', fg: '#44403c', bg: '#faf7f2', req: 4.5 },
];

console.log('\n🎨 WCAG 2.1 Contrast Verification: Unparalleled Website');
console.log('------------------------------------------------------------');

let allPassed = true;
for (const pair of websitePairs) {
  const ratio = getContrastRatio(pair.fg, pair.bg);
  const passed = ratio >= pair.req;
  if (!passed) allPassed = false;
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} | ${pair.name.padEnd(38)} | Ratio: ${ratio.toFixed(2)}:1 (Min: ${pair.req}:1)`);
}

console.log('------------------------------------------------------------');
if (allPassed) {
  console.log('✨ All evaluated website color pairs pass WCAG AA.\n');
  process.exit(0);
} else {
  console.error('⚠️ Some pairs fail WCAG standards.\n');
  process.exit(1);
}
