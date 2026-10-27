import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { startStudio } from '../../packages/studio-engine/src/index.mjs';
import { connectStudio } from '../../packages/studio-agent-tools/src/client.mjs';
import { capturePage, collectReference } from '../../packages/studio-agent-tools/src/capture.mjs';
import { createServer } from 'node:http';
import { unparalleledStudio } from '../../packages/studio-adapters/src/vite.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));
let playwright;
try { playwright = createRequire(path.join(process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache'), 'unparalleled/playwright/package.json')).resolve('playwright'); } catch { /* optional tool */ }
let vite;
try { vite = createRequire(path.join(root, 'site/package.json')).resolve('vite'); } catch { /* legacy site tooling is optional */ }
const browserOptions = { skip: !playwright && 'Install the existing skill browser tooling to run browser integration tests.' };
async function temp(t) { const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'studio-browser-')); t.after(() => fs.rm(dir, { recursive: true, force: true })); return dir; }

test('browser selection, live inspection, source editing, review, undo and engine reconnect form one working loop', browserOptions, async t => {
  const dir = await temp(t);
  await fs.copyFile(path.join(root, 'examples/studio-demo/index.html'), path.join(dir, 'index.html'));
  let studio = await startStudio({ root: dir });
  const port = studio.server.address().port;
  let browser;
  t.after(async () => { if (browser) await browser.close(); if (studio) await studio.close(); });
  const browserModule = await import(pathToFileURL(playwright).href);
  browser = await (browserModule.chromium || browserModule.default.chromium).launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(studio.url);
  const overlay = page.locator('unparalleled-studio');
  await overlay.getByRole('button', { name: 'Pick', exact: true }).waitFor();
  await page.locator('#sample-action').click();
  assert.match(await page.locator('#sample-feedback').textContent(), /Normal page interaction/);
  await overlay.getByRole('button', { name: 'Pick', exact: true }).click();
  await page.locator('#sample-heading').click();
  assert.equal(await overlay.locator('.scope .target').textContent(), '#sample-heading');
  assert.equal(await overlay.getByRole('textbox').getAttribute('id'), 'studio-instruction');
  let client = await connectStudio(dir);
  const inspected = await client.call('/inspect?selector=%23sample-heading');
  assert.equal(inspected.text, 'Every branch tells you something.');
  assert.ok(inspected.rect.width > 0);
  assert.equal(inspected.sourceHint, 'index.html');
  await assert.rejects(client.call('/inspect?selector=p'), /exactly one/);
  await overlay.getByRole('textbox').fill('Shorten this heading. Keep the type and palette.');
  await overlay.getByRole('button', { name: 'Send to agent' }).click();
  await overlay.locator('.activity').getByText('Shorten this heading. Keep the type and palette.', { exact: true }).waitFor();
  const { request } = await client.call('/requests/claim', {});
  assert.equal(request.selection.selector, '#sample-heading');
  const source = await client.call('/source?file=index.html');
  await client.call(`/requests/${request.id}/patch`, { leaseToken: request.leaseToken, file: 'index.html', expectedHash: source.hash, summary: 'Shortened the heading without changing its style.', edits: [{ search: 'Every branch tells you something.', replace: 'Follow every branch.' }] });
  await page.waitForFunction(() => document.getElementById('sample-heading')?.textContent === 'Follow every branch.');
  await overlay.getByText('Ready for your review', { exact: true }).waitFor();
  await overlay.getByRole('button', { name: 'Undo source edit' }).click();
  await page.waitForFunction(() => document.getElementById('sample-heading')?.textContent === 'Every branch tells you something.');
  assert.match(await fs.readFile(path.join(dir, 'index.html'), 'utf8'), /Every branch tells you something\./);
  await overlay.getByText('Undone', { exact: true }).waitFor();
  await overlay.getByRole('button', { name: 'Page', exact: true }).click();
  await overlay.getByRole('textbox').fill('A draft that must survive reconnect.');
  await studio.close(); studio = null;
  studio = await startStudio({ root: dir, port });
  await page.waitForFunction(() => document.querySelector('unparalleled-studio')?.shadowRoot.querySelector('.notice')?.textContent.includes('Connected.'), { timeout: 15000 });
  assert.equal(await overlay.getByRole('textbox').inputValue(), 'A draft that must survive reconnect.');
  client = await connectStudio(dir);
  assert.equal((await client.call('/requests')).requests[0].status, 'undone');
  const capture = await capturePage(client.connection, { out: path.join(dir, 'capture.png'), selector: '#sample-heading' });
  assert.equal(capture.sameUserTab, false);
  assert.ok((await fs.stat(capture.file)).size > 1000);
  assert.deepEqual(errors, []);
});

test('Vite adapter attaches only during serve, protects runtime credentials, and leaves production HTML clean', { skip: (!vite || !playwright) && 'Existing Vite and browser tools are required.' }, async t => {
  const dir = await temp(t);
  await fs.writeFile(path.join(dir, 'index.html'), '<!doctype html><html><body><h1>Vite integration</h1><script type="module" src="/main.js"></script></body></html>');
  await fs.writeFile(path.join(dir, 'main.js'), 'document.body.dataset.loaded = "yes";');
  const { createServer, build } = await import(pathToFileURL(vite).href);
  const server = await createServer({ configFile: false, root: dir, logLevel: 'silent', plugins: [unparalleledStudio()], server: { host: '127.0.0.1', port: 0 } });
  t.after(() => server.close());
  await server.listen();
  // Connection file writes are asynchronous in Vite's listening callback.
  for (let i = 0; i < 30; i++) { try { await fs.access(path.join(dir, '.unparalleled/studio/connection.json')); break; } catch { await new Promise(resolve => setTimeout(resolve, 20)); } }
  const client = await connectStudio(dir);
  const html = await (await fetch(client.connection.url)).text();
  assert.ok(html.includes('data-unparalleled-studio'));
  const denied = await fetch(client.connection.url + '/@fs/' + path.join(dir, '.unparalleled/studio/connection.json'));
  assert.equal(denied.status, 403);
  assert.equal((await client.call('/status')).previewMode, 'vite');
  const browserModule = await import(pathToFileURL(playwright).href);
  const browser = await (browserModule.chromium || browserModule.default.chromium).launch();
  try {
    const page = await browser.newPage();
    await page.goto(client.connection.url);
    await page.locator('unparalleled-studio').getByRole('button', { name: 'Pick', exact: true }).waitFor();
    await page.locator('unparalleled-studio').getByRole('button', { name: 'Pick', exact: true }).click();
    await page.locator('h1').click();
    assert.equal((await client.call('/inspect?selector=h1')).text, 'Vite integration');
  } finally { await browser.close(); }
  await server.close();
  await build({ configFile: false, root: dir, logLevel: 'silent', plugins: [unparalleledStudio()], build: { outDir: path.join(dir, 'output') } });
  const production = await fs.readFile(path.join(dir, 'output/index.html'), 'utf8');
  assert.ok(!production.includes('unparalleled-studio'));
  await assert.rejects(fs.access(path.join(dir, '.unparalleled/studio/engine.lock')));
});

test('local composer queues an external page as a reference without treating it as editable source', browserOptions, async t => {
  const dir = await temp(t); await fs.copyFile(path.join(root, 'examples/studio-demo/index.html'), path.join(dir, 'index.html'));
  const studio = await startStudio({ root: dir });
  const module = await import(pathToFileURL(playwright).href);
  const browser = await (module.chromium || module.default.chromium).launch();
  t.after(async () => { await browser.close(); await studio.close(); });
  const page = await browser.newPage(); await page.goto(studio.url);
  const overlay = page.locator('unparalleled-studio');
  await overlay.getByRole('button', { name: 'Reference', exact: true }).click();
  await overlay.getByLabel('Reference page URL').fill('https://example.com/work');
  await overlay.getByLabel('Use it to…').selectOption('inspire');
  await overlay.getByRole('textbox', { name: 'What should the agent take from it?' }).fill('Use its visual rhythm for our process section.');
  await overlay.getByRole('button', { name: 'Send to agent' }).click();
  await overlay.locator('.activity').getByText('Use its visual rhythm for our process section.', { exact: true }).waitFor();
  const client = await connectStudio(dir); const { request } = await client.call('/requests/claim', {});
  assert.equal(request.kind, 'reference'); assert.equal(request.intent, 'inspire');
  assert.equal(request.reference.url, 'https://example.com/work');
  assert.equal(request.selection, null); assert.equal(request.pageUrl, studio.url);
});

test('browser companion loads in real Chromium, queues a picked element and reports actual screenshot capability', browserOptions, async t => {
  const dir = await temp(t); await fs.copyFile(path.join(root, 'examples/studio-demo/index.html'), path.join(dir, 'index.html'));
  const studio = await startStudio({ root: dir });
  const module = await import(pathToFileURL(playwright).href); const chromium = module.chromium || module.default.chromium;
  const extension = path.join(root, 'packages/studio-browser-extension');
  let context;
  t.after(async () => { if (context) await context.close(); await studio.close(); });
  context = await chromium.launchPersistentContext(path.join(dir, 'browser-profile'), { channel: 'chromium', headless: true, args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`] });
  const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
  const extensionId = worker.url().split('/')[2];
  await worker.evaluate(settings => chrome.storage.local.set(settings), { studioUrl: studio.url, referenceToken: studio.session.referenceToken });
  const page = await context.newPage(); await page.goto(studio.url); await page.bringToFront();
  // Local host permission permits the test to invoke the same picker without mocking Chrome APIs.
  const popup = await context.newPage(); await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  assert.equal(await popup.getByLabel('Use the reference to…').inputValue(), 'inspire');
  await page.bringToFront();
  const result = await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'pick-reference', intent: 'redesign', wholePage: false }));
  assert.equal(result.ok, true, result.message);
  await page.locator('#sample-heading').click();
  const picker = page.locator('unparalleled-reference-picker');
  await picker.getByLabel('What should the agent do?').fill('Use this heading structure for our local product.');
  await picker.getByRole('button', { name: 'Send reference', exact: true }).click();
  await page.waitForFunction(() => !document.querySelector('unparalleled-reference-picker')?.shadowRoot.querySelector('[data-send]')?.disabled);
  assert.match(await picker.locator('.notice').textContent(), /Reference saved|Saved without an image/);
  const client = await connectStudio(dir); const { request } = await client.call('/requests/claim', {});
  assert.equal(request.kind, 'reference'); assert.equal(request.intent, 'redesign');
  assert.equal(request.reference.selector, '#sample-heading');
  if (request.reference.captureFile) {
    assert.equal(request.reference.captureRuntime, 'user-tab-browser-companion');
    assert.ok((await fs.stat(request.reference.captureFile)).size > 1000);
  } else {
    // Headless automation did not invoke Chrome's native toolbar action, so
    // activeTab may not grant capture. Retain the reference and disclose it.
    assert.match(request.reference.captureWarning, /without an image/);
  }
});

test('heartbeat preserves action focus and Studio Escape does not interfere with underlying page controls', browserOptions, async t => {
  const dir = await temp(t); await fs.copyFile(path.join(root, 'examples/studio-demo/index.html'), path.join(dir, 'index.html'));
  const studio = await startStudio({ root: dir }); const module = await import(pathToFileURL(playwright).href);
  const browser = await (module.chromium || module.default.chromium).launch();
  t.after(async () => { await browser.close(); await studio.close(); });
  const page = await browser.newPage(); await page.goto(studio.url); const overlay = page.locator('unparalleled-studio');
  await overlay.getByRole('button', { name: 'Activity', exact: false }).click();
  const request = await studio.session.create({ instruction: 'Preserve action focus.' });
  const cancel = overlay.getByRole('button', { name: 'Cancel request', exact: true }); await cancel.waitFor(); await cancel.focus();
  const original = await cancel.elementHandle();
  studio.session.emit('update', {});
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.equal(await original.evaluate(node => node.isConnected && node.getRootNode().activeElement === node), true);
  await studio.session.create({ instruction: 'Another request.' });
  await page.waitForFunction(id => document.querySelector('unparalleled-studio').shadowRoot.activeElement?.dataset.requestId === id, request.id);
  await page.evaluate(() => { window.pageEscapes = 0; document.addEventListener('keydown', event => { if (event.key === 'Escape') window.pageEscapes++; }); });
  await page.locator('#sample-action').focus(); await page.keyboard.press('Escape');
  assert.equal(await overlay.locator('.panel').isVisible(), true);
  assert.equal(await page.evaluate(() => window.pageEscapes), 1);
  await cancel.first().focus(); await page.keyboard.press('Escape');
  assert.equal(await overlay.locator('.panel').isVisible(), false);
  assert.equal(await page.evaluate(() => window.pageEscapes), 1);
});


test('reference collector renders a separate origin and retains actual selected evidence without granting local source access', browserOptions, async t => {
  const dir = await temp(t); await fs.writeFile(path.join(dir, 'index.html'), '<h1>Local project</h1>');
  const studio = await startStudio({ root: dir });
  const remote = createServer((request, response) => { response.setHeader('Content-Type', 'text/html'); response.end('<title>Reference fixture</title><main><h1 id="picked">A particular reference</h1><p>Independent content</p><p>More content</p></main>'); });
  await new Promise(resolve => remote.listen(0, '127.0.0.1', resolve));
  t.after(async () => { await new Promise(resolve => remote.close(resolve)); await studio.close(); });
  const url = `http://127.0.0.1:${remote.address().port}/reference`;
  const evidence = await collectReference({ root: dir, url: studio.url }, { url, selector: '#picked' });
  assert.equal(evidence.reference.url, url); assert.equal(evidence.reference.title, 'Reference fixture');
  assert.equal(evidence.reference.text, 'A particular reference'); assert.equal(evidence.reference.selector, '#picked');
  assert.equal(evidence.captureRuntime, 'separate-playwright-render');
  assert.ok(Buffer.from(evidence.capture.split(',')[1], 'base64').length > 1000);
  const client = await connectStudio(dir);
  const saved = await client.call('/references', { ...evidence, instruction: 'Reinterpret this hierarchy using our content.', intent: 'inspire', pageUrl: studio.url });
  assert.equal(saved.reference.authority, 'untrusted-reference-material');
  assert.equal(saved.selection, null); assert.equal(saved.reference.captureRuntime, 'separate-playwright-render');
  await assert.rejects(collectReference({ root: dir, url: studio.url }, { url, selector: 'p' }), /exactly one/);
});
