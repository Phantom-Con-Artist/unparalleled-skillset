#!/usr/bin/env node
// Run against an already running Studio page. Artifacts remain outside source by default.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { getContrastRatio } from '../.agents/skills/unparalleled-ui/scripts/check-contrast.mjs';
const target = process.argv[2] || 'http://127.0.0.1:4310';
const out = path.resolve(process.argv[3] || '/tmp/studio-review/round-2');
let resolved;
for (const base of [new URL('../package.json', import.meta.url), path.join(process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache'), 'unparalleled/playwright/package.json')]) {
  try { resolved = createRequire(base).resolve('playwright'); break; } catch { /* try the existing skill browser cache */ }
}
if (!resolved) throw new Error('Use the existing skill browser setup before running rendered review.');
const module = await import(pathToFileURL(resolved).href);
const browser = await (module.chromium || module.default.chromium).launch();
const report = { target, capturedAt: new Date().toISOString(), views: [], contrast: [], limits: 'DOM heuristics do not inspect Shadow DOM craft; open these captures and exercise the real task.' };
const allViews = [['desktop',1440,900],['laptop',1366,768],['tablet',834,1112],['phone',390,844],['narrow',320,640],['reduced',1440,900]];
const names = process.argv[4]?.split(',');
const views = allViews.filter(([name]) => !names || names.includes(name));
if (!views.length) throw new Error('No valid review viewports were selected.');
await fs.mkdir(out, { recursive: true });
try {
  for (const [name,width,height] of views) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: name === 'reduced' ? 'reduce' : 'no-preference' });
    const page = await context.newPage(); const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(target);
    const studio = page.locator('unparalleled-studio');
    await studio.getByRole('button', { name: 'Pick', exact: true }).click();
    await page.locator('#sample-heading').click();
    await studio.getByRole('textbox', { name: 'What should change?' }).fill('Make the heading shorter. Keep the existing type and palette.');
    await page.evaluate(() => document.fonts.ready);
    const first = path.join(out, `${name}-first.png`), full = path.join(out, `${name}-full.png`);
    await page.screenshot({ path: first }); await page.screenshot({ path: full, fullPage: true });
    const measured = await page.evaluate(() => {
      const shadow = document.querySelector('unparalleled-studio').shadowRoot;
      const hex = value => '#' + value.match(/[\d.]+/g).slice(0,3).map(x => Math.round(Number(x)).toString(16).padStart(2,'0')).join('');
      const pair = (name, selector, backgroundSelector = selector) => ({ name, fg: hex(getComputedStyle(shadow.querySelector(selector)).color), bg: hex(getComputedStyle(shadow.querySelector(backgroundSelector)).backgroundColor), req: 4.5 });
      return { overflow: document.documentElement.scrollWidth > innerWidth + 1,
        fonts: [...document.fonts].filter(font => font.family.startsWith('Studio')).map(font => ({ family: font.family, status: font.status })),
        pairs: [pair('Composer text', 'h2', '.panel'), pair('Primary action', '.primary'), pair('Toolbar state', '.bar button', '.bar'), pair('Notice', '.notice')]
      };
    });
    if (measured.overflow || errors.length) throw new Error(`${name}: overflow or browser errors: ${JSON.stringify(errors)}`);
    for (const pair of measured.pairs) { const ratio = getContrastRatio(pair.fg, pair.bg); if (ratio < pair.req) throw new Error(`${name}: contrast failed: ${pair.name} ${ratio}`); report.contrast.push({ viewport:name, ...pair, ratio }); }
    report.views.push({ name, width, height, first, full, errors, fonts: measured.fonts });
    await context.close();
  }
} finally { await browser.close(); }
await fs.writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`Studio: ${views.length} viewport/motion captures, ${report.contrast.length} actual contrast pairs passed. Open every image in ${out}.`);
