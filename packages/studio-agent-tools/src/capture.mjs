import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
export async function capturePage(connection, options = {}) {
  let resolved;
  for (const base of [path.join(connection.root, 'package.json'), import.meta.url, path.join(process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache'), 'unparalleled/playwright/package.json')]) {
    for (const name of ['playwright', 'playwright-core', '@playwright/test']) {
      try { resolved = createRequire(base).resolve(name); break; } catch { /* try available browser tooling */ }
    }
    if (resolved) break;
  }
  if (!resolved) throw new Error('Playwright is not available. Use the skill capture.mjs --install setup or a connected IDE browser; Studio does not silently install a browser.');
  const target = new URL(options.url || connection.url);
  if (target.origin !== new URL(connection.url).origin) throw new Error('Capture is limited to this local Studio app.');
  const module = await import(pathToFileURL(resolved).href);
  const browser = await (module.chromium || module.default.chromium).launch();
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(target.href, { waitUntil: 'load', timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    const out = path.resolve(options.out || path.join(connection.root, '.unparalleled/studio/artifacts', `capture-${Date.now()}.png`));
    await fs.mkdir(path.dirname(out), { recursive: true });
    if (options.selector) {
      const locator = page.locator(options.selector);
      if (await locator.count() !== 1) throw new Error('The screenshot selector must identify exactly one element.');
      await locator.screenshot({ path: out, timeout: 15000 });
    } else await page.screenshot({ path: out, timeout: 15000 });
    return { file: out, pageUrl: target.href, runtime: 'separate-playwright-render', sameUserTab: false, reducedMotion: true, capturedAt: new Date().toISOString() };
  } finally { await browser.close(); }
}
export async function collectReference(connection, options) {
  const url = new URL(options.url);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Use an HTTP or HTTPS reference without embedded credentials.');
  let resolved;
  for (const base of [path.join(connection.root, 'package.json'), import.meta.url, path.join(process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache'), 'unparalleled/playwright/package.json')]) {
    try { resolved = createRequire(base).resolve('playwright'); break; } catch { /* try another installed browser tool */ }
  }
  if (!resolved) throw new Error('Reference collection needs an available Playwright installation or the browser companion.');
  const module = await import(pathToFileURL(resolved).href);
  const browser = await (module.chromium || module.default.chromium).launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await page.goto(url.href, { waitUntil: 'load', timeout: 30000 });
    const selector = options.selector || 'body';
    const element = page.locator(selector);
    if (await element.count() !== 1) throw new Error('Pick a selector that identifies exactly one reference element.');
    const reference = await element.evaluate((node, selector) => ({ url: location.href, title: document.title, selector, text: node.textContent.trim().slice(0, 8000), html: node.outerHTML.slice(0, 24000) }), selector);
    const image = await element.screenshot({ type: 'jpeg', quality: 70, timeout: 15000 });
    return { reference, capture: 'data:image/jpeg;base64,' + image.toString('base64'), captureRuntime: 'separate-playwright-render' };
  } finally { await browser.close(); }
}
