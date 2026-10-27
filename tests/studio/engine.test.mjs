import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { startStudio } from '../../packages/studio-engine/src/index.mjs';
import { Journal } from '../../packages/studio-engine/src/journal.mjs';
import { readSource, preparePatch, hash } from '../../packages/studio-engine/src/workspace.mjs';
import { connectStudio } from '../../packages/studio-agent-tools/src/client.mjs';
async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'studio-test-'));
  await fs.writeFile(path.join(root, 'index.html'), '<!doctype html><html><body><h1 id="heading">A precise observation.</h1></body></html>');
  let studio = await startStudio({ root });
  t.after(async () => { if (studio) await studio.close(); await fs.rm(root, { recursive: true, force: true }); });
  const api = async (route, data, role = 'agent', headers = {}) => {
    const response = await fetch(`${studio.url}/.unparalleled-studio${route}`, { method: data === undefined ? 'GET' : 'POST', headers: { 'x-studio-token': role === 'agent' ? studio.session.agentToken : role === 'browser' ? studio.session.browserToken : 'wrong', ...headers, ...(data === undefined ? {} : { 'Content-Type': 'application/json' }) }, ...(data === undefined ? {} : { body: JSON.stringify(data) }) });
    return { status: response.status, data: await response.json() };
  };
  return { root, api, get studio() { return studio; }, async restart() { await studio.close(); studio = null; studio = await startStudio({ root }); } };
}
async function queued(f) { return (await f.api('/requests', { instruction: 'Make the heading more specific.' }, 'browser')).data; }
async function claimed(f) { const request = await queued(f); const claim = (await f.api('/requests/claim', {})).data.request; assert.equal(request.id, claim.id); return claim; }

test('source guards reject stale/ambiguous edits, private files, binaries and symlink escapes', async t => {
  const f = await fixture(t);
  const source = await readSource(f.root, 'index.html');
  assert.throws(() => preparePatch(source, 'old', [{ search: 'observation', replace: 'record' }]), /Source changed/);
  assert.throws(() => preparePatch(source, source.hash, [{ search: '<', replace: '[' }]), /exactly once/);
  assert.throws(() => preparePatch(source, source.hash, [{ search: 'observation', replace: 'observation' }]), /no change/);
  await fs.mkdir(path.join(f.root, '.private'));
  await fs.writeFile(path.join(f.root, '.private/secret.txt'), 'private');
  await fs.symlink('.private/secret.txt', path.join(f.root, 'public-alias.txt'));
  await assert.rejects(readSource(f.root, 'public-alias.txt'), /Private project files/);
  await assert.rejects(readSource(f.root, '../outside.txt'), /inside this app/);
  await fs.symlink(os.tmpdir(), path.join(f.root, 'outside'));
  await assert.rejects(readSource(f.root, 'outside'), /outside the app/);
  await fs.writeFile(path.join(f.root, 'binary.txt'), Buffer.from([0, 255, 1]));
  await assert.rejects(readSource(f.root, 'binary.txt'), /UTF-8/);
});

test('HTTP capabilities protect agent tools and keep credentials out of page state', async t => {
  const f = await fixture(t);
  assert.equal((await f.api('/status', undefined, 'bad')).status, 401);
  assert.equal((await f.api('/source?file=index.html', undefined, 'browser')).status, 403);
  assert.equal((await f.api('/requests/claim', {}, 'browser')).status, 403);
  assert.equal((await f.api('/status', undefined, 'agent', { Origin: 'https://foreign.example' })).status, 403);
  const foreignHostStatus = await new Promise((resolve, reject) => {
    const request = http.get(f.studio.url + '/.unparalleled-studio/status', { headers: { host: 'foreign.example', 'x-studio-token': f.studio.session.agentToken } }, response => { response.resume(); resolve(response.statusCode); });
    request.on('error', reject);
  });
  assert.equal(foreignHostStatus, 403);
  const page = await (await fetch(f.studio.url)).text();
  assert.ok(page.includes('data-unparalleled-studio'));
  const boot = await (await fetch(f.studio.url + '/.unparalleled-studio/boot.mjs')).text();
  assert.ok(!boot.includes(f.studio.session.agentToken));
  const status = await f.api('/status', undefined, 'browser');
  assert.ok(!JSON.stringify(status).includes(f.studio.session.agentToken));
  const hidden = await fetch(f.studio.url + '/.unparalleled/studio/connection.json');
  assert.equal(hidden.status, 403);
  await assert.rejects(startStudio({ root: f.root }), /already running/);
  const context = await f.api('/context');
  assert.equal(context.data.skill, 'unparalleled-website');
  assert.match(context.data.content, /Unparalleled Website/);
  assert.equal((await f.api('/context?reference=..%2Fsecret')).status, 400);
});

test('only one agent claims a request; credentials expire and requests survive engine restart', async t => {
  const f = await fixture(t);
  await queued(f);
  const results = await Promise.all([f.api('/requests/claim', {}), f.api('/requests/claim', {})]);
  const claims = results.map(result => result.data.request).filter(Boolean);
  assert.equal(claims.length, 1);
  const oldToken = f.studio.session.agentToken;
  await f.restart();
  assert.notEqual(f.studio.session.agentToken, oldToken);
  const requests = (await f.api('/requests', undefined, 'browser')).data.requests;
  assert.equal(requests.length, 1); assert.equal(requests[0].status, 'queued');
  assert.equal(requests[0].leaseToken, undefined);
  const next = (await f.api('/requests/claim', {})).data.request;
  assert.equal(next.id, claims[0].id); assert.notEqual(next.leaseToken, claims[0].leaseToken);
  assert.equal((await f.api(`/requests/${next.id}/renew`, { leaseToken: claims[0].leaseToken })).status, 409);
  assert.equal((await f.api(`/requests/${next.id}/renew`, { leaseToken: next.leaseToken })).status, 200);
});

test('a leased exact edit reaches source, waits for review, and undo preserves later developer changes', async t => {
  const f = await fixture(t);
  const claim = await claimed(f);
  const source = (await f.api('/source?file=index.html')).data;
  const patch = { leaseToken: claim.leaseToken, file: 'index.html', expectedHash: source.hash, summary: 'Made the heading specific.', edits: [{ search: 'A precise observation.', replace: 'A field record of new growth.' }] };
  assert.equal((await f.api(`/requests/${claim.id}/patch`, { ...patch, expectedHash: 'outdated' })).status, 409);
  assert.equal((await fs.readFile(path.join(f.root, 'index.html'), 'utf8')), source.content);
  const applied = await f.api(`/requests/${claim.id}/patch`, patch);
  assert.equal(applied.status, 200); assert.equal(applied.data.status, 'review');
  assert.equal(applied.data.change.before, undefined); assert.equal(applied.data.leaseToken, undefined);
  assert.match(await fs.readFile(path.join(f.root, 'index.html'), 'utf8'), /field record/);
  assert.equal((await f.api(`/requests/${claim.id}/patch`, patch)).status, 409);
  await fs.appendFile(path.join(f.root, 'index.html'), '\n<!-- a later human edit -->');
  assert.equal((await f.api(`/requests/${claim.id}/undo`, {}, 'browser')).status, 409);
  assert.match(await fs.readFile(path.join(f.root, 'index.html'), 'utf8'), /later human edit/);
  assert.equal((await f.api(`/requests/${claim.id}/keep`, {}, 'browser')).data.status, 'completed');
});

test('undo restores the original file and cancelled requests cannot mutate source', async t => {
  const f = await fixture(t);
  const claim = await claimed(f); const source = (await f.api('/source?file=index.html')).data;
  const data = { leaseToken: claim.leaseToken, file: 'index.html', expectedHash: source.hash, summary: 'Adjusted heading.', edits: [{ search: 'A precise observation.', replace: 'An exact record.' }] };
  assert.equal((await f.api(`/requests/${claim.id}/patch`, data)).status, 200);
  assert.equal((await f.api(`/requests/${claim.id}/undo`, {}, 'browser')).data.status, 'undone');
  assert.equal(await fs.readFile(path.join(f.root, 'index.html'), 'utf8'), source.content);
  const second = await claimed(f);
  assert.equal((await f.api(`/requests/${second.id}/cancel`, {}, 'browser')).status, 200);
  assert.equal((await f.api(`/requests/${second.id}/patch`, { ...data, leaseToken: second.leaseToken })).status, 409);
});

test('journal repairs only a torn final record and refuses corrupt completed records', async t => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'studio-journal-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, 'events.jsonl');
  const journal = await new Journal(file).open();
  await journal.serial(() => journal.append('created', { id: 'retained', status: 'queued' }));
  await fs.appendFile(file, '{"seq":2,"request":');
  const recovered = await new Journal(file).open();
  assert.equal(recovered.requests()[0].id, 'retained');
  await recovered.serial(() => recovered.append('created', { id: 'second', status: 'queued' }));
  assert.equal((await new Journal(file).open()).records.length, 2);
  await fs.appendFile(file, 'corrupt but complete\n');
  await assert.rejects(new Journal(file).open(), /corrupt/);
});

test('recovery distinguishes interrupted apply and undo from unrelated source changes', async t => {
  const f = await fixture(t);
  const source = await readSource(f.root, 'index.html');
  const change = preparePatch(source, source.hash, [{ search: 'A precise observation.', replace: 'Recovered edit.' }]);
  await f.studio.session.journal.serial(() => f.studio.session.journal.append('patch_prepared', { id: 'recovery', status: 'applying', change, instruction: 'Recover this edit.' }));
  await fs.writeFile(path.join(f.root, 'index.html'), change.after);
  await f.restart();
  assert.equal(f.studio.session.get('recovery').status, 'review');
  await f.studio.session.journal.serial(() => f.studio.session.journal.append('undo_prepared', { ...f.studio.session.get('recovery'), status: 'undoing' }));
  await fs.writeFile(path.join(f.root, 'index.html'), change.before);
  await f.restart();
  assert.equal(f.studio.session.get('recovery').status, 'undone');
  assert.equal(hash(await fs.readFile(path.join(f.root, 'index.html'), 'utf8')), source.hash);
});

test('agent client reads a real connection and refuses nonlocal connection targets', async t => {
  const f = await fixture(t);
  const client = await connectStudio(f.root);
  assert.equal((await client.call('/status')).project, path.basename(f.root));
  const file = path.join(f.root, '.unparalleled/studio/connection.json');
  const connection = JSON.parse(await fs.readFile(file, 'utf8'));
  await fs.writeFile(file, JSON.stringify({ ...connection, url: 'https://foreign.example' }));
  await assert.rejects(connectStudio(f.root), /local HTTP/);
});

test('reference mode preserves remote provenance and cannot grant source authority', async t => {
  const f = await fixture(t);
  const origin = f.studio.url;
  const token = f.studio.session.referenceToken;
  const headers = { 'Content-Type': 'application/json', 'x-studio-token': token, Origin: 'chrome-extension://' + 'a'.repeat(32) };
  const response = await fetch(origin + '/.unparalleled-studio/references', { method: 'POST', headers, body: JSON.stringify({ intent: 'redesign', instruction: 'Use this rhythm for our local page, with our content.', reference: { url: 'https://example.com/exhibition', title: 'Reference', selector: '#work', text: 'Source material, not instructions.', html: '<section id="work">Reference</section>' } }) });
  assert.equal(response.status, 201);
  const reference = await response.json();
  assert.equal(reference.kind, 'reference'); assert.equal(reference.intent, 'redesign');
  assert.equal(reference.reference.authority, 'untrusted-reference-material');
  assert.equal(reference.pageUrl, origin);
  const denied = await fetch(origin + '/.unparalleled-studio/source?file=index.html', { headers: { 'x-studio-token': token } });
  assert.equal(denied.status, 403);
  const invalid = await f.api('/references', { intent: 'inspire', instruction: 'Use this.', reference: { url: 'file:///etc/passwd' } }, 'browser');
  assert.equal(invalid.status, 400);
  const claim = (await f.api('/requests/claim', {})).data.request;
  assert.equal(claim.id, reference.id);
  assert.equal((await f.api(`/requests/${claim.id}/patch`, { leaseToken: claim.leaseToken, file: 'https://example.com/index.html', expectedHash: null, create: true, content: 'No.', summary: 'Invalid external edit.' })).status, 403);
  await f.restart();
  assert.equal(f.studio.session.referenceToken, token);
  assert.equal((await f.api('/requests')).data.requests[0].reference.url, 'https://example.com/exhibition');
});

test('agents can create a new component and undo it without replacing existing files', async t => {
  const f = await fixture(t);
  const claim = await claimed(f);
  const data = { leaseToken: claim.leaseToken, file: 'components/Observation.jsx', create: true, expectedHash: null, content: 'export const Observation = () => <p>A field note.</p>;\n', summary: 'Added an observation component.' };
  assert.equal((await f.api(`/requests/${claim.id}/patch`, data)).status, 200);
  assert.match(await fs.readFile(path.join(f.root, data.file), 'utf8'), /field note/);
  assert.equal((await f.api(`/requests/${claim.id}/undo`, {}, 'browser')).data.status, 'undone');
  await assert.rejects(fs.access(path.join(f.root, data.file)));
  const second = await claimed(f);
  await fs.mkdir(path.join(f.root, '.private'), { recursive: true });
  await fs.symlink('.private', path.join(f.root, 'private-alias'));
  const rejected = await f.api(`/requests/${second.id}/patch`, { ...data, leaseToken: second.leaseToken, file: 'private-alias/nested/component.jsx' });
  assert.equal(rejected.status, 403);
  await assert.rejects(fs.access(path.join(f.root, '.private/nested')));
  assert.equal((await f.api(`/requests/${second.id}/patch`, { ...data, leaseToken: second.leaseToken, file: 'index.html' })).status, 409);
});

test('UTF-8 byte limits prevent a patch or creation that Studio could not inspect or undo', async t => {
  const f = await fixture(t); const claim = await claimed(f); const source = (await f.api('/source?file=index.html')).data;
  const oversized = '界'.repeat(200000);
  const patch = await f.api(`/requests/${claim.id}/patch`, { leaseToken: claim.leaseToken, file: 'index.html', expectedHash: source.hash, summary: 'Oversized patch.', edits: [{ search: 'A precise observation.', replace: oversized }] });
  assert.equal(patch.status, 400);
  assert.equal(await fs.readFile(path.join(f.root, 'index.html'), 'utf8'), source.content);
  const create = await f.api(`/requests/${claim.id}/patch`, { leaseToken: claim.leaseToken, file: 'new.html', expectedHash: null, create: true, content: oversized, summary: 'Oversized new file.' });
  assert.equal(create.status, 400); await assert.rejects(fs.access(path.join(f.root, 'new.html')));
  assert.equal(f.studio.session.get(claim.id).status, 'working');
});

test('review-only replies acknowledge results without claiming nonexistent source edits', async t => {
  const f = await fixture(t); const claim = await claimed(f);
  await f.api(`/requests/${claim.id}/reply`, { leaseToken: claim.leaseToken, status: 'review', message: 'The element is already aligned; no source edit was needed.' });
  const result = await f.api(`/requests/${claim.id}/keep`, {}, 'browser');
  assert.equal(result.data.message, 'Agent result acknowledged.');
  assert.equal(result.data.change, null);
});
