import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { StudioError, validateReference } from '../../studio-protocol/src/index.mjs';

const inspectorFile = fileURLToPath(new URL('../../studio-overlay/src/inspector.mjs', import.meta.url));
const IDLE_LIMIT_MS = 20 * 60 * 1000;

async function resolvePlaywright(root) {
  const cache = path.join(process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache'), 'unparalleled/playwright/package.json');
  for (const base of [path.join(root, 'package.json'), import.meta.url, cache]) {
    for (const name of ['playwright', 'playwright-core']) {
      try { return createRequire(base).resolve(name); } catch { /* try the next installed browser tool */ }
    }
  }
  return null;
}

// Runs inside the other site, in a page the user chose. It only reports what the user explicitly picks.
const toolbar = inspector => `(() => {
  if (window.top !== window || window.__unparalleledPicker) return;
  window.__unparalleledPicker = true;
  ${inspector.replace(/^export /gm, '')}
  let picking = false, chosen = null, root;
  const mount = () => {
    const host = document.createElement('unparalleled-ref-picker');
    host.style.cssText = 'all:initial;position:fixed;inset:0;z-index:2147483647;pointer-events:none';
    root = host.attachShadow({ mode: 'open' });
    root.innerHTML = '<style>*{box-sizing:border-box}.bar{pointer-events:auto;position:fixed;left:50%;top:12px;translate:-50% 0;display:flex;flex-wrap:wrap;align-items:center;gap:8px;width:max-content;max-width:min(780px,calc(100vw - 24px));padding:8px 10px;background:#1b1d19;color:#f2f2ed;font:13px/1.4 system-ui,sans-serif;box-shadow:0 6px 24px #0007}.msg{flex:1 1 22ch;min-width:0;overflow-wrap:anywhere}button{font:inherit;white-space:nowrap;color:#1b1d19;background:#f2f2ed;border:1px solid #f2f2ed;padding:5px 10px;cursor:pointer}button[aria-pressed=true]{background:#e9b949;border-color:#e9b949}button:disabled{opacity:.45;cursor:not-allowed}button:focus-visible{outline:2px solid #e9b949;outline-offset:2px}.outline{position:fixed;border:2px solid #e9b949;outline:1px solid #1b1d19;pointer-events:none}</style><div class="outline" hidden></div><div class="bar" role="toolbar" aria-label="Unparalleled reference picker"><span class="msg" role="status">Browse to the page you want, then press Pick a component.</span><button data-pick aria-pressed="false">Pick a component</button><button data-use disabled>Use this component</button><button data-cancel>Cancel</button></div>';
    document.documentElement.append(host);
    const outline = root.querySelector('.outline'), message = root.querySelector('.msg'), pick = root.querySelector('[data-pick]'), use = root.querySelector('[data-use]');
    const show = element => { if (!element) return void (outline.hidden = true); const r = element.getBoundingClientRect(); Object.assign(outline.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' }); outline.hidden = false; };
    const setPicking = value => { picking = value; pick.setAttribute('aria-pressed', String(value)); if (value) message.textContent = 'Click the component you want. Escape stops picking.'; else outline.hidden = chosen === null; };
    pick.addEventListener('click', () => setPicking(!picking));
    root.querySelector('[data-cancel]').addEventListener('click', () => window.__unparalleledCancel());
    use.addEventListener('click', () => { if (!chosen?.isConnected) return; const data = inspectElement(chosen, 'reference'); window.__unparalleledPick({ url: location.href, title: document.title, selector: data.selector, text: data.text, html: chosen.outerHTML.slice(0, 24000), styles: data.styles, rect: data.rect }); });
    const target = event => { const path = event.composedPath(); return path.includes(host) ? null : (document.elementFromPoint(event.clientX, event.clientY) || event.target); };
    addEventListener('mousemove', event => { if (picking) show(target(event)); }, true);
    for (const type of ['pointerdown', 'mousedown', 'mouseup', 'touchstart']) addEventListener(type, event => { if (picking && target(event)) event.stopImmediatePropagation(); }, true);
    addEventListener('click', event => {
      if (!picking) return;
      const element = target(event); if (!element) return;
      event.preventDefault(); event.stopImmediatePropagation();
      chosen = element; setPicking(false); show(chosen); use.disabled = false;
      message.textContent = 'Selected ' + selectorFor(chosen) + '. Press Use this component.';
    }, true);
    addEventListener('keydown', event => { if (event.key === 'Escape' && picking) { event.stopImmediatePropagation(); setPicking(false); message.textContent = 'Stopped picking.'; } }, true);
  };
  if (document.documentElement) mount(); else addEventListener('DOMContentLoaded', mount, { once: true });
})();`;

/**
 * Open a real browser window on a site the user names and let them pick one component on it. The result becomes an
 * untrusted reference the user can attach to a local element. Nothing from the other site gains authority to edit files.
 */
export async function startReferencePicker(session, { url, headless = process.env.UNPARALLELED_STUDIO_PICKER_HEADLESS === '1' }) {
  if (session.picker) throw new StudioError('picker_open', 'A reference window is already open. Pick a component there, or cancel it.', 409);
  const target = validateReference({ url }).url;
  const resolved = await resolvePlaywright(session.root);
  if (!resolved) throw new StudioError('browser_tool_missing', 'Picking from another site needs Playwright. Run: node .agents/skills/unparalleled-website/scripts/capture.mjs --install --url <any page> --out <folder>   (Studio never installs a browser silently.)', 424);
  const module = await import(pathToFileURL(resolved).href);
  let browser;
  try { browser = await (module.chromium || module.default.chromium).launch({ headless }); }
  catch (error) { throw new StudioError('browser_unavailable', `The reference window could not open: ${String(error.message).split('\n')[0]}. Run Studio where a display is available, or send the reference from the browser companion.`, 424); }
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();
  const picker = { page, browser, closed: false };
  const close = async () => {
    if (picker.closed) return; picker.closed = true; clearTimeout(timer);
    if (session.picker === picker) session.picker = null;
    await browser.close().catch(() => {}); session.emit('update', {});
  };
  picker.close = close;
  const timer = setTimeout(close, IDLE_LIMIT_MS); timer.unref();
  browser.on('disconnected', () => { if (!picker.closed) { picker.closed = true; clearTimeout(timer); if (session.picker === picker) session.picker = null; session.emit('update', {}); } });
  session.picker = picker;
  try {
    await context.exposeBinding('__unparalleledCancel', async () => { setImmediate(close); });
    await context.exposeBinding('__unparalleledPick', async (_source, payload) => {
      try {
        const reference = validateReference({ url: payload?.url, title: payload?.title, selector: payload?.selector, text: payload?.text, html: payload?.html });
        reference.styles = Object.fromEntries(Object.entries(payload?.styles || {}).slice(0, 30).map(([key, value]) => [String(key).slice(0, 80), String(value).slice(0, 500)]));
        reference.rect = Object.fromEntries(['x', 'y', 'width', 'height'].map(key => [key, Number.isFinite(payload?.rect?.[key]) ? payload.rect[key] : 0]));
        let image = null, warning = null;
        try {
          const locator = page.locator(reference.selector);
          if (await locator.count() === 1) image = await locator.screenshot({ type: 'jpeg', quality: 70, timeout: 10000 });
          else warning = 'The picked element could not be isolated for a screenshot.';
        } catch (error) { warning = `The screenshot failed: ${String(error.message).split('\n')[0]}`; }
        await session.addPickedReference({ reference, image, warning });
      } finally { setImmediate(close); }
    });
    await context.addInitScript(toolbar(await fs.readFile(inspectorFile, 'utf8')));
    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (error) {
    await close();
    throw error instanceof StudioError ? error : new StudioError('reference_unreachable', `Could not open ${target}: ${String(error.message).split('\n')[0]}`, 502);
  }
  session.emit('update', {});
  return picker;
}
export const newId = () => crypto.randomUUID();
