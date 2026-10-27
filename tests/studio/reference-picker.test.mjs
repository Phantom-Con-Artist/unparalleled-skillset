import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { startStudio } from '../../packages/studio-engine/src/index.mjs';

let playwright;
try { playwright = createRequire(path.join(process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache'), 'unparalleled/playwright/package.json')).resolve('playwright'); } catch { /* optional tool */ }
const options = { skip: !playwright && 'Install the existing skill browser tooling to run browser integration tests.' };

const LOCAL = '<!doctype html><html><body><h1 id="title">Fieldwork</h1><button id="local" style="padding:8px 14px">Save</button></body></html>';
const REMOTE = '<!doctype html><html><head><title>Pricing</title></head><body><h2>Pricing</h2><button class="cta" id="buy" style="background:#0a7a4b;color:#fff;border:0;border-radius:999px;padding:12px 28px;font:600 16px system-ui">Buy now</button><a id="next" href="/other">Other page</a></body></html>';

async function world(t) {
  process.env.UNPARALLELED_STUDIO_PICKER_HEADLESS = '1';
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'studio-picker-'));
  await fs.writeFile(path.join(dir, 'index.html'), LOCAL);
  const remote = createServer((req, res) => { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(req.url === '/other' ? '<h1>Other</h1>' : REMOTE); });
  await new Promise(resolve => remote.listen(0, '127.0.0.1', resolve));
  const remoteUrl = `http://127.0.0.1:${remote.address().port}/`;
  const studio = await startStudio({ root: dir });
  const module = await import(pathToFileURL(playwright).href);
  const browser = await (module.chromium || module.default.chromium).launch();
  t.after(async () => { delete process.env.UNPARALLELED_STUDIO_PICKER_HEADLESS; await browser.close(); await studio.close(); remote.closeAllConnections(); await new Promise(resolve => remote.close(resolve)); await fs.rm(dir, { recursive: true, force: true }); });
  const api = async (route, data, role = 'browser') => {
    const response = await fetch(`${studio.url}/.unparalleled-studio${route}`, { method: data === undefined ? 'GET' : 'POST', headers: { 'x-studio-token': role === 'agent' ? studio.session.agentToken : studio.session.browserToken, ...(data === undefined ? {} : { 'Content-Type': 'application/json' }) }, ...(data === undefined ? {} : { body: JSON.stringify(data) }) });
    return { status: response.status, data: await response.json() };
  };
  return { dir, studio, browser, remoteUrl, api };
}
const until = async (check, what) => { for (let i = 0; i < 100; i++) { if (await check()) return; await new Promise(resolve => setTimeout(resolve, 50)); } assert.fail(`Timed out waiting for ${what}.`); };

test('pick a local button, pick a component on another site, choose recreate, add instructions, and the agent receives both', options, async t => {
  const { dir, studio, browser, remoteUrl, api } = await world(t);
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(studio.url);
  const overlay = page.locator('unparalleled-studio');
  await overlay.getByRole('button', { name: 'Pick', exact: true }).click();
  await page.locator('#local').click();
  await overlay.getByRole('button', { name: 'Look like a component on another site…' }).click();
  await overlay.getByLabel('Site to take it from').fill(remoteUrl);
  await overlay.getByRole('button', { name: 'Open it and pick a component' }).click();
  await until(() => studio.session.picker, 'the reference window');
  const remote = studio.session.picker.page;
  const bar = remote.locator('unparalleled-ref-picker');
  await bar.getByRole('button', { name: 'Pick a component' }).click();
  await remote.locator('#buy').click();
  assert.equal(new URL(remote.url()).pathname, '/', 'picking does not trigger the page\'s own click behaviour');
  await bar.getByRole('button', { name: 'Use this component' }).click();
  await until(() => !studio.session.picker, 'the reference window to close after a pick');
  const chip = overlay.locator('[data-look-chip]');
  await chip.waitFor({ state: 'visible' });
  assert.match(await chip.textContent(), /#buy/);
  await overlay.getByLabel('How should the agent use that component?').selectOption('recreate');
  await overlay.locator('#studio-instruction').fill('Keep my label text and use my brand green.');
  await overlay.getByRole('button', { name: 'Send to agent' }).click();
  await overlay.locator('.activity').getByText('Keep my label text and use my brand green.', { exact: true }).waitFor();
  const { request } = (await api('/requests/claim', {}, 'agent')).data;
  assert.equal(request.selection.selector, '#local', 'the local element is the target');
  assert.equal(request.intent, 'recreate');
  assert.equal(request.reference.selector, '#buy');
  assert.equal(request.reference.text, 'Buy now');
  assert.ok(request.reference.url.startsWith(remoteUrl));
  assert.equal(request.reference.authority, 'untrusted-reference-material');
  assert.match(request.reference.styles.backgroundColor, /10, 122, 75/, 'computed styles travel with the reference');
  assert.match(request.reference.html, /Buy now/);
  assert.equal(request.instruction, 'Keep my label text and use my brand green.');
  const image = await fs.readFile(request.reference.captureFile);
  assert.deepEqual([...image.subarray(0, 3)], [255, 216, 255], 'a real JPEG of the component was saved');
  assert.equal(studio.session.pickedReferences.size, 0, 'the reference is consumed by the request it was attached to');
  await chip.waitFor({ state: 'hidden' });
  assert.equal(await fs.readFile(path.join(dir, 'index.html'), 'utf8'), LOCAL, 'nothing was edited by picking or sending');
});

test('a reference with no extra words still sends a clear instruction, and discarding removes it', options, async t => {
  const { studio, browser, remoteUrl, api } = await world(t);
  const page = await browser.newPage(); await page.goto(studio.url);
  const overlay = page.locator('unparalleled-studio');
  await overlay.getByRole('button', { name: 'Pick', exact: true }).click(); await page.locator('#local').click();
  await overlay.getByRole('button', { name: 'Look like a component on another site…' }).click();
  await overlay.getByLabel('Site to take it from').fill(remoteUrl);
  await overlay.getByRole('button', { name: 'Open it and pick a component' }).click();
  await until(() => studio.session.picker, 'the reference window');
  const bar = studio.session.picker.page.locator('unparalleled-ref-picker');
  await bar.getByRole('button', { name: 'Pick a component' }).click(); await studio.session.picker.page.locator('#buy').click();
  await bar.getByRole('button', { name: 'Use this component' }).click();
  await overlay.locator('[data-look-chip]').waitFor({ state: 'visible' });
  await overlay.getByRole('button', { name: 'Remove the reference component' }).click();
  await overlay.locator('[data-look-chip]').waitFor({ state: 'hidden' });
  assert.equal(studio.session.pickedReferences.size, 0);
  assert.equal((await api('/requests', { instruction: 'x', referenceId: 'gone', intent: 'inspire' })).data.error, 'reference_missing');
});

test('only one reference window at a time, cancel adds nothing, and bad addresses are refused', options, async t => {
  const { studio, remoteUrl, api } = await world(t);
  assert.equal((await api('/reference-picker', { url: remoteUrl })).status, 201);
  const second = await api('/reference-picker', { url: remoteUrl });
  assert.equal(second.status, 409); assert.equal(second.data.error, 'picker_open');
  await studio.session.picker.page.locator('unparalleled-ref-picker').getByRole('button', { name: 'Cancel' }).click();
  await until(() => !studio.session.picker, 'cancel to close the window');
  assert.equal(studio.session.pickedReferences.size, 0, 'cancelling picks nothing');
  for (const url of ['file:///etc/passwd', 'javascript:alert(1)', 'https://user:secret@example.com/', 'not a url']) {
    const refused = await api('/reference-picker', { url });
    assert.equal(refused.status, 400, url); assert.equal(refused.data.error, 'invalid_reference');
  }
  assert.equal(studio.session.picker, null);
  const agentOnly = await api('/requests', { instruction: 'x', referenceId: 'nope', intent: 'bogus' });
  assert.ok([400, 409].includes(agentOnly.status));
});
