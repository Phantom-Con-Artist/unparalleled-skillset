#!/usr/bin/env node
// Capture a rendered page at review viewports and audit it for generic-template tells.
// Usage: node scripts/capture.mjs --url <url|file> --out <dir> [--round <n>] [--viewports a,b] [--reduced-motion] [--install]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  laptop: { width: 1366, height: 768 },
  tablet: { width: 834, height: 1112 },
  phone: { width: 390, height: 844 },
  narrow: { width: 320, height: 640 },
};
const cacheDir = path.join(process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache'), 'unparalleled', 'playwright');

export function parseArgs(argv) {
  const options = { round: 1, viewports: Object.keys(VIEWPORTS), reducedMotion: false, install: false };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    const value = () => {
      const next = argv[++i];
      if (next === undefined || next.startsWith('--')) throw new Error(`${flag} needs a value`);
      return next;
    };
    if (flag === '--url') options.url = value();
    else if (flag === '--out') options.out = value();
    else if (flag === '--round') options.round = Number(value());
    else if (flag === '--viewports') options.viewports = value().split(',').map(name => name.trim()).filter(Boolean);
    else if (flag === '--reduced-motion') options.reducedMotion = true;
    else if (flag === '--install') options.install = true;
    else throw new Error(`Unknown option: ${flag}`);
  }
  if (!options.install || options.url || options.out) {
    if (!options.url || !options.out) throw new Error('Both --url and --out are required.');
    if (!Number.isInteger(options.round) || options.round < 1) throw new Error('--round must be a positive integer.');
    const unknown = options.viewports.filter(name => !VIEWPORTS[name]);
    if (unknown.length || !options.viewports.length) throw new Error(`Unknown viewport: ${unknown.join(', ') || '(none)'}. Use ${Object.keys(VIEWPORTS).join(', ')}.`);
  }
  return options;
}

export function resolveTarget(url) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return url;
  const file = path.resolve(url);
  if (!fs.existsSync(file)) throw new Error(`No such file: ${file}`);
  return pathToFileURL(file).href;
}

function locatePlaywright() {
  const bases = [path.join(process.cwd(), 'package.json'), path.join(cacheDir, 'package.json')];
  for (const base of bases) {
    for (const name of ['playwright', 'playwright-core', '@playwright/test']) {
      try { return createRequire(base).resolve(name); } catch { /* try the next location */ }
    }
  }
  return null;
}

function install() {
  fs.mkdirSync(cacheDir, { recursive: true });
  if (!fs.existsSync(path.join(cacheDir, 'package.json'))) fs.writeFileSync(path.join(cacheDir, 'package.json'), '{"private":true}\n');
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  console.log(`Installing Playwright into ${cacheDir} (the project's package.json is not touched).`);
  const added = spawnSync(npm, ['install', '--no-audit', '--no-fund', '--prefix', cacheDir, 'playwright@1'], { stdio: 'inherit' });
  if (added.status !== 0) throw new Error('npm could not install Playwright. Check network permission, then retry.');
  const cli = path.join(path.dirname(createRequire(path.join(cacheDir, 'package.json')).resolve('playwright/package.json')), 'cli.js');
  const browser = spawnSync(process.execPath, [cli, 'install', 'chromium'], { stdio: 'inherit' });
  if (browser.status !== 0) throw new Error('Chromium download failed. On Linux, missing system libraries may need: npx playwright install-deps chromium');
}

// Runs inside the page. Heuristics only: each finding is a prompt to justify or remove, not a verdict.
function auditPage() {
  const visible = el => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && Number(s.opacity) > 0.05;
  };
  const label = el => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''} "${(el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 40)}"`;
  const rgb = value => {
    const m = value.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return a < 0.1 ? null : [r, g, b];
  };
  const oklch = ([r, g, b]) => {
    const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
    const [R, G, B] = [lin(r), lin(g), lin(b)];
    const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
    const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
    const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
    const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
    const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const Bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    return { L, C: Math.hypot(A, Bb), H: (Math.atan2(Bb, A) * 180 / Math.PI + 360) % 360 };
  };
  const all = [...document.body.querySelectorAll('*')].filter(visible);
  const findings = [];
  const add = (kind, detail, samples = []) => findings.push({ kind, detail, samples: samples.slice(0, 6) });

  const pills = all.filter(el => {
    const r = el.getBoundingClientRect();
    const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
    return r.height >= 14 && r.width > r.height * 1.4 && radius >= r.height / 2 - 1;
  });
  if (pills.length) add('pill-shape', `${pills.length} element(s) with fully rounded ends (pill buttons, badges, chips, tags).`, pills.map(label));

  const isPanel = el => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const framed = parseFloat(s.borderTopWidth) > 0 || s.boxShadow !== 'none' || (rgb(s.backgroundColor) && el.parentElement && s.backgroundColor !== getComputedStyle(el.parentElement).backgroundColor);
    return framed && parseFloat(s.borderTopLeftRadius) >= 4 && r.width >= 120 && r.height >= 80;
  };
  const cardRows = new Set();
  const kanban = new Set();
  for (const parent of new Set(all.map(el => el.parentElement).filter(Boolean))) {
    const kids = [...parent.children].filter(el => visible(el) && isPanel(el));
    if (kids.length >= 3) {
      const widths = kids.map(el => el.getBoundingClientRect().width);
      if (Math.max(...widths) / Math.min(...widths) < 1.6) cardRows.add(parent);
    }
    const panelsIn = col => [...col.children].flatMap(child => [child, ...child.children]).filter(el => visible(el) && isPanel(el)).length;
    const stacked = [...parent.children].filter(col => visible(col) && panelsIn(col) >= 2);
    const tops = stacked.map(col => Math.round(col.getBoundingClientRect().top));
    if (stacked.length >= 3 && new Set(tops).size === 1) kanban.add(parent);
  }
  if (cardRows.size) add('card-grid', `${cardRows.size} group(s) of 3+ similar framed, rounded boxes (feature cards, tiles, bento cells).`, [...cardRows].map(label));
  if (kanban.size) add('kanban-columns', `${kanban.size} row(s) of side-by-side columns each stacking framed cards.`, [...kanban].map(label));

  const families = new Map();
  for (const el of [document.body, ...document.querySelectorAll('h1,h2,h3,p,a,button,label,li')].filter(visible).slice(0, 400)) {
    const first = getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim();
    families.set(first, (families.get(first) || 0) + 1);
  }
  const generic = [...families.keys()].filter(f => /^(inter|inter var|geist|roboto|arial|helvetica|helvetica neue|system-ui|-apple-system|blinkmacsystemfont|segoe ui|sans-serif|open sans|poppins|montserrat|lato)$/i.test(f));
  if (generic.length) add('generic-type', `Primary family is a default or overused face: ${generic.join(', ')}.`);
  if (families.size > 3) add('type-sprawl', `${families.size} different primary families in use.`, [...families.keys()]);

  const eyebrows = all.filter(el => {
    const s = getComputedStyle(el);
    return s.textTransform === 'uppercase' && parseFloat(s.fontSize) <= 14 && parseFloat(s.letterSpacing) >= 0.6 && [...el.childNodes].some(node => node.nodeType === 3 && node.textContent.trim().length > 2);
  });
  if (eyebrows.length >= 3) add('eyebrow-labels', `${eyebrows.length} tiny tracked uppercase labels above sections or panels.`, eyebrows.map(label));

  const dots = all.filter(el => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    const c = rgb(s.backgroundColor);
    return r.width <= 10 && r.width >= 4 && Math.abs(r.width - r.height) < 1 && parseFloat(s.borderTopLeftRadius) >= r.width / 2 - 0.5 && c && oklch(c).C > 0.1;
  });
  if (dots.length) add('status-dots', `${dots.length} small saturated dot(s) used as "live" ornaments.`, dots.map(el => label(el.parentElement || el)));

  const page = rgb(getComputedStyle(document.body).backgroundColor) || rgb(getComputedStyle(document.documentElement).backgroundColor) || [255, 255, 255];
  const pageColor = oklch(page);
  const accents = new Map();
  for (const el of all) {
    const s = getComputedStyle(el);
    for (const value of [s.backgroundColor, s.color, s.borderTopColor]) {
      const c = rgb(value);
      if (!c) continue;
      const o = oklch(c);
      if (o.C < 0.09) continue;
      const family = o.H >= 255 && o.H < 315 ? 'indigo/violet' : o.H >= 160 && o.H < 235 ? 'cyan/teal' : o.H >= 135 && o.H < 160 ? 'emerald' : null;
      if (family) accents.set(family, (accents.get(family) || 0) + 1);
    }
    const bg = s.backgroundImage;
    if (bg.includes('gradient')) {
      const stops = [...bg.matchAll(/rgba?\([^)]+\)/g)].map(m => rgb(m[0])).filter(Boolean).map(oklch);
      if (stops.some(o => o.C > 0.08 && o.H >= 255 && o.H < 330) && stops.some(o => o.C > 0.08 && (o.H >= 200 && o.H < 330))) accents.set('purple/blue gradient', (accents.get('purple/blue gradient') || 0) + 1);
    }
  }
  if (accents.size) add('saas-palette', `Stock SaaS hue families present: ${[...accents].map(([k, n]) => `${k} x${n}`).join(', ')}.`);
  if (pageColor.L < 0.28 && pageColor.C < 0.04 && pageColor.H > 220 && pageColor.H < 290 && accents.size) add('dark-slate-neon', 'Blue-grey near-black canvas carrying saturated indigo, cyan, or emerald accents.');

  // Content and layout signals require human context; these are never automatic verdicts.
  const copyNodes = all.filter(el => el.matches('h1,h2,h3,h4,p,figcaption,button,a') && !el.closest('pre,code,[contenteditable="true"]'));
  const buzzwords = copyNodes.filter(el => /\b(revolutionary|game[ -]changing|cutting[ -]edge|next[ -]gen|seamless|supercharge|unlock your potential|best[ -]in[ -]class|all[ -]in[ -]one|where .{1,40} meets .{1,40})\b/i.test(el.innerText));
  if (buzzwords.length) add('generic-copy', `${buzzwords.length} copy element(s) contain stock promise language; verify literal meaning or rewrite with product facts.`, buzzwords.map(label));
  const placeholders = copyNodes.filter(el => /\b(lorem ipsum|dolor sit amet|your (company|product) (name|here)|insert (headline|testimonial)|placeholder (text|content))\b/i.test(el.innerText));
  if (placeholders.length) add('placeholder-copy', `${placeholders.length} unresolved placeholder copy element(s).`, placeholders.map(label));

  const rhythms = new Map();
  for (const el of [...document.querySelectorAll('main > section, main > article > section')].filter(visible)) {
    const s = getComputedStyle(el);
    const top = parseFloat(s.paddingTop), bottom = parseFloat(s.paddingBottom);
    if (top < 64 || bottom < 64 || !el.querySelector('h1,h2,h3')) continue;
    const key = `${Math.round(top / 8)}:${Math.round(bottom / 8)}`;
    if (!rhythms.has(key)) rhythms.set(key, []);
    rhythms.get(key).push(el);
  }
  const uniformSections = [...rhythms.values()].filter(group => group.length >= 3).flat();
  if (uniformSections.length) add('uniform-section-spacing', `${uniformSections.length} sections repeat large padding; inspect information grouping and density rather than assuming uniform whitespace is authored rhythm.`, uniformSections.map(label));
  const gradients = all.filter(el => {
    const r = el.getBoundingClientRect();
    return r.width >= 160 && r.height >= 40 && getComputedStyle(el).backgroundImage.includes('gradient(');
  });
  if (gradients.length >= 3) add('gradient-overuse', `${gradients.length} substantial gradient surfaces; verify product/material/data purpose and contrast.`, gradients.map(label));

  const moving = document.getAnimations().filter(animation => {
    const el = animation.effect?.target;
    return el instanceof Element && visible(el) && !el.closest('button,input,select,textarea,[role="progressbar"]');
  });
  const motionGroups = new Map();
  for (const animation of moving) {
    const frames = animation.effect.getKeyframes();
    if (!frames.some(frame => frame.transform && frame.transform !== 'none' || frame.opacity !== undefined)) continue;
    const signature = JSON.stringify({ frames, duration: animation.effect.getTiming().duration });
    if (!motionGroups.has(signature)) motionGroups.set(signature, []);
    motionGroups.get(signature).push(animation.effect.target);
  }
  const repeated = [...motionGroups.values()].filter(group => group.length >= 3).flat();
  if (repeated.length) add('repeated-motion', `${repeated.length} elements share identical transform/opacity animation; inspect whether this is an unmotivated universal reveal or loop.`, repeated.map(label));
  const looping = moving.filter(animation => animation.playState === 'running' && animation.effect.getTiming().iterations === Infinity);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches && looping.length) add('reduced-motion-loop', `${looping.length} continuous animation(s) still running with reduced motion; verify necessity or provide a static equivalent.`, looping.map(animation => label(animation.effect.target)));

  const text = document.body.innerText;
  const emoji = text.match(/\p{Extended_Pictographic}/gu) || [];
  if (emoji.length) add('emoji', `${emoji.length} emoji or pictograph character(s) in visible text.`, [...new Set(emoji)]);
  const dashes = (text.match(/—/g) || []).length;
  const words = text.split(/\s+/).length;
  if (dashes > 2 && dashes / Math.max(words, 1) > 1 / 250) add('em-dashes', `${dashes} em dashes across ${words} words.`);
  if (document.documentElement.scrollWidth > window.innerWidth + 1) add('horizontal-overflow', `Page is ${document.documentElement.scrollWidth}px wide in a ${window.innerWidth}px viewport.`);

  const h1 = document.querySelector('h1');
  return {
    title: document.title,
    h1: h1 ? h1.innerText.trim().slice(0, 120) : null,
    pageHeight: document.documentElement.scrollHeight,
    families: Object.fromEntries(families),
    findings,
  };
}

export async function capture(options) {
  const resolved = locatePlaywright();
  if (!resolved) {
    const error = new Error('Playwright is not available. Rerun with --install, or use the agent\'s Playwright browser tools (see references/visual-review-loop.md).');
    error.code = 'NO_PLAYWRIGHT';
    throw error;
  }
  const playwright = await import(pathToFileURL(resolved).href);
  const chromium = playwright.chromium || playwright.default?.chromium;
  const target = resolveTarget(options.url);
  const dir = path.resolve(options.out, `round-${options.round}`);
  fs.mkdirSync(dir, { recursive: true });
  let browser;
  try {
    browser = await chromium.launch();
  } catch (error) {
    throw new Error(`Chromium could not launch: ${error.message.split('\n')[0]}. Rerun with --install to download it.`);
  }
  const report = { url: target, round: options.round, reducedMotion: options.reducedMotion, capturedAt: new Date().toISOString(), viewports: {} };
  try {
    for (const name of options.viewports) {
      const context = await browser.newContext({ viewport: VIEWPORTS[name], reducedMotion: options.reducedMotion ? 'reduce' : 'no-preference' });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      page.on('requestfailed', request => errors.push(`Failed request: ${request.url()}`));
      await page.goto(target, { waitUntil: 'load', timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(700);
      const suffix = options.reducedMotion ? '-reduced' : '';
      const first = path.join(dir, `${name}${suffix}-first.png`);
      const full = path.join(dir, `${name}${suffix}-full.png`);
      await page.screenshot({ path: first });
      await page.screenshot({ path: full, fullPage: true });
      report.viewports[name] = { ...VIEWPORTS[name], screenshots: { first, full }, errors, ...(await page.evaluate(auditPage)) };
      await context.close();
    }
  } finally {
    await browser.close();
  }
  fs.writeFileSync(path.join(dir, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  return { dir, report };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.install) install();
  if (!options.url) return;
  const { dir, report } = await capture(options);
  console.log(`Round ${report.round} captured in ${dir}`);
  for (const [name, view] of Object.entries(report.viewports)) {
    console.log(`\n${name} ${view.width}x${view.height}: first-frame ${view.screenshots.first}`);
    if (view.errors.length) console.log(`  runtime errors: ${view.errors.length} (see report.json)`);
    for (const finding of view.findings) console.log(`  [${finding.kind}] ${finding.detail}`);
    if (!view.findings.length) console.log('  no template tells detected; still look at the screenshots.');
  }
  console.log('\nThe audit flags candidates. Open every screenshot and judge the composition yourself.');
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = error.code === 'NO_PLAYWRIGHT' ? 2 : 1;
  });
}
