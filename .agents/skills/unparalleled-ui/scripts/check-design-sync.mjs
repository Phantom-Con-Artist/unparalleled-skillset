#!/usr/bin/env node
// Checks that a rendered page matches the design system written in design.md.
// Used twice in the flow: design.html against design.md before human design review, and the
// built site or screen against design.md before human delivery review.
// Usage: node scripts/check-design-sync.mjs --design <design.md> --url <url|file> [--viewport desktop|phone|...] [--out report.json] [--json]
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { VIEWPORTS, auditPage, locatePlaywright, resolveTarget } from './capture.mjs';

const BUDGET_KEYS = { fontSizes: n => n.fontSizes, textColors: n => n.textColors, radii: n => n.radii, shadows: n => n.shadows, spacingValues: n => n.spacingValues, focalCandidates: n => n.firstViewport.focalCandidates };

export function parseDesignTokens(markdown) {
  const match = markdown.match(/```json\s+design-tokens\s*\r?\n([\s\S]*?)```/);
  if (!match) throw new Error('design.md has no ```json design-tokens block (see references/design-md.md).');
  const data = JSON.parse(match[1]);
  const tokens = data.tokens && typeof data.tokens === 'object' ? data.tokens : {};
  if (!Object.keys(tokens).length) throw new Error('design-tokens.tokens is empty: declare the CSS custom properties the design uses.');
  for (const name of Object.keys(tokens)) if (!name.startsWith('--')) throw new Error(`Token ${name} must be a CSS custom property name starting with --.`);
  const fonts = Array.isArray(data.fonts) ? data.fonts.filter(f => typeof f === 'string' && f.trim()) : [];
  const budget = data.noise_budget && typeof data.noise_budget === 'object' ? data.noise_budget : {};
  for (const [key, value] of Object.entries(budget)) {
    if (!BUDGET_KEYS[key]) throw new Error(`noise_budget.${key} is not a known measure (${Object.keys(BUDGET_KEYS).join(', ')}).`);
    if (!Number.isFinite(value) || value < 1) throw new Error(`noise_budget.${key} must be a positive number.`);
  }
  return { tokens, fonts, budget };
}

function inspect({ tokens, fonts }) {
  const probe = document.createElement('span');
  document.body.append(probe);
  const asColor = value => {
    probe.style.color = '';
    probe.style.color = value;
    return probe.style.color ? getComputedStyle(probe).color : null;
  };
  const norm = value => String(value).trim().replace(/\s+/g, ' ').toLowerCase();
  const root = getComputedStyle(document.documentElement);
  const tokenResults = Object.entries(tokens).map(([name, expected]) => {
    const actual = root.getPropertyValue(name).trim();
    if (!actual) return { name, expected, actual: null, ok: false, reason: 'not defined on :root' };
    const [a, e] = [asColor(actual), asColor(expected)];
    const ok = a && e ? a === e : norm(actual) === norm(expected);
    return { name, expected, actual, ok, reason: ok ? '' : 'value differs' };
  });
  probe.remove();
  const loaded = new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/["']/g, '').trim().toLowerCase()));
  const used = new Set();
  for (const el of document.querySelectorAll('body, body *')) {
    if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
    used.add(getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim().toLowerCase());
  }
  const fontResults = fonts.map(family => {
    const key = family.toLowerCase();
    const isUsed = used.has(key);
    const isLoaded = loaded.has(key);
    return { family, used: isUsed, loaded: isLoaded, ok: isUsed, reason: !isUsed ? 'not the primary family of any text element' : isLoaded ? '' : 'used but not loaded through @font-face; confirm it exists on target devices' };
  });
  return { tokenResults, fontResults };
}

export async function checkDesignSync({ design, url, viewport = 'desktop' }) {
  const spec = parseDesignTokens(fs.readFileSync(design, 'utf8'));
  const resolved = locatePlaywright();
  if (!resolved) { const error = new Error('Playwright is not available. Run node scripts/capture.mjs --install, or install playwright in the project.'); error.code = 'NO_PLAYWRIGHT'; throw error; }
  const playwright = await import(pathToFileURL(resolved).href);
  const chromium = playwright.chromium || playwright.default?.chromium;
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: VIEWPORTS[viewport] ?? VIEWPORTS.desktop });
    await page.goto(resolveTarget(url), { waitUntil: 'load', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await page.evaluate(() => document.fonts.ready);
    const { tokenResults, fontResults } = await page.evaluate(inspect, spec);
    const audit = await page.evaluate(auditPage);
    const budgetResults = Object.entries(spec.budget).map(([key, limit]) => {
      const actual = BUDGET_KEYS[key](audit.noise);
      return { measure: key, budget: limit, actual, ok: actual <= limit };
    });
    const failures = [...tokenResults, ...fontResults, ...budgetResults].filter(r => !r.ok).length;
    return { design: path.resolve(design), url, viewport, checkedAt: new Date().toISOString(), verdict: failures ? 'FAIL' : 'PASS', tokens: tokenResults, fonts: fontResults, noise_budget: budgetResults, noise: audit.noise };
  } finally {
    await browser.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const option = name => { const i = args.indexOf(name); return i === -1 ? undefined : args[i + 1]; };
  if (args.includes('--help') || !option('--design') || !option('--url')) {
    console.log('Usage: node scripts/check-design-sync.mjs --design <design.md> --url <url|file> [--viewport desktop|laptop|tablet|phone|narrow] [--out report.json] [--json]\n\nExit 0: every token, declared font and noise budget matches. Exit 1: mismatch. Exit 2: usage, design.md or Playwright problem.\nA pass proves the page implements the written system; it does not prove the system is good or approved.');
    process.exit(args.includes('--help') ? 0 : 2);
  }
  let report;
  try { report = await checkDesignSync({ design: option('--design'), url: option('--url'), viewport: option('--viewport') }); }
  catch (error) { console.error(error.message); process.exit(2); }
  if (option('--out')) fs.writeFileSync(option('--out'), JSON.stringify(report, null, 2) + '\n');
  if (args.includes('--json')) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`${report.verdict} design sync: ${report.url} against ${report.design}`);
    for (const t of report.tokens.filter(r => !r.ok)) console.log(`  - token ${t.name}: expected ${t.expected}, found ${t.actual ?? 'nothing'} (${t.reason})`);
    for (const f of report.fonts) if (!f.ok || f.reason) console.log(`  ${f.ok ? '~' : '-'} font ${f.family}: ${f.reason}`);
    for (const b of report.noise_budget.filter(r => !r.ok)) console.log(`  - noise ${b.measure}: ${b.actual} exceeds budget ${b.budget}`);
    console.log(`  ${report.tokens.filter(t => t.ok).length}/${report.tokens.length} tokens, ${report.fonts.filter(f => f.ok).length}/${report.fonts.length} fonts, ${report.noise_budget.filter(b => b.ok).length}/${report.noise_budget.length} budgets match.`);
  }
  process.exit(report.verdict === 'PASS' ? 0 : 1);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
