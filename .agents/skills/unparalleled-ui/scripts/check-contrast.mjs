#!/usr/bin/env node

/**
 * WCAG 2.1 Contrast Checker Script
 * Computes luminance and relative contrast ratios between foreground and background colors.
 * Zero external dependencies.
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

// Default evaluation palette for software UI
const testPairs = [
  { name: 'Dark Mode Primary Text on Canvas', fg: '#f4f4f5', bg: '#09090b', req: 4.5 },
  { name: 'Dark Mode Secondary Text on Card', fg: '#a1a1aa', bg: '#18181b', req: 4.5 },
  { name: 'Dark Mode Subtle Caption on Card', fg: '#71717a', bg: '#18181b', req: 3.0 },
  { name: 'Emerald Accent Button Text', fg: '#09090b', bg: '#10b981', req: 4.5 },
  { name: 'Danger Status on Dark Card', fg: '#f87171', bg: '#18181b', req: 3.0 },
  { name: 'Light Mode Primary Text on Canvas', fg: '#09090b', bg: '#fafaf9', req: 4.5 },
  { name: 'Light Mode Secondary Text on Canvas', fg: '#52525b', bg: '#fafaf9', req: 4.5 },
];

console.log('\n🎨 WCAG 2.1 Contrast Ratio Verification');
console.log('------------------------------------------------------------');

let allPassed = true;

for (const pair of testPairs) {
  const ratio = getContrastRatio(pair.fg, pair.bg);
  const passed = ratio >= pair.req;
  if (!passed) allPassed = false;
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} | ${pair.name.padEnd(38)} | Ratio: ${ratio.toFixed(2)}:1 (Min: ${pair.req}:1)`);
}

console.log('------------------------------------------------------------');
if (allPassed) {
  console.log('✨ All evaluated color pairs satisfy WCAG standards.\n');
  process.exit(0);
} else {
  console.error('⚠️  Some color pairs fail contrast criteria. Adjust lightness/chroma.\n');
  process.exit(1);
}
