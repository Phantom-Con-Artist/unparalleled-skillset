import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { startStudio } from '../../packages/studio-engine/src/index.mjs';
import { readSource, preparePatch, hash } from '../../packages/studio-engine/src/workspace.mjs';

const INDEX = '<!doctype html><html><body><h1 id="heading">A precise observation.</h1><p class="lede">One sentence.</p></body></html>';
const STYLES = 'h1 { color: #222; }\n.lede { color: #444; }\n';

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'studio-multi-'));
  await fs.writeFile(path.join(root, 'index.html'), INDEX);
  await fs.writeFile(path.join(root, 'styles.css'), STYLES);
  let studio = await startStudio({ root });
  t.after(async () => { if (studio) await studio.close(); await fs.rm(root, { recursive: true, force: true }); });
  const api = async (route, data, role = 'agent') => {
    const response = await fetch(`${studio.url}/.unparalleled-studio${route}`, { method: data === undefined ? 'GET' : 'POST', headers: { 'x-studio-token': role === 'agent' ? studio.session.agentToken : studio.session.browserToken, ...(data === undefined ? {} : { 'Content-Type': 'application/json' }) }, ...(data === undefined ? {} : { body: JSON.stringify(data) }) });
    return { status: response.status, data: await response.json() };
  };
  const claim = async () => { await studio.session.create({ instruction: 'Change the heading and its colour.' }); return (await api('/requests/claim', {})).data.request; };
  const hashes = async () => ({ index: (await api('/source?file=index.html')).data.hash, styles: (await api('/source?file=styles.css')).data.hash });
  return { root, api, claim, hashes, get studio() { return studio; }, async restart() { await studio.close(); studio = null; studio = await startStudio({ root }); } };
}
const read = (f, name) => fs.readFile(path.join(f.root, name), 'utf8');

test('one request changes two files and creates a third, shows all of them for review, and undo restores every file', async t => {
  const f = await fixture(t); const request = await f.claim(); const h = await f.hashes();
  const applied = await f.api(`/requests/${request.id}/patch`, {
    leaseToken: request.leaseToken, summary: 'Reworded the heading, recoloured it, and added a theme file.',
    files: [
      { file: 'index.html', expectedHash: h.index, edits: [{ search: 'A precise observation.', replace: 'A field record.' }] },
      { file: 'styles.css', expectedHash: h.styles, edits: [{ search: 'h1 { color: #222; }', replace: 'h1 { color: #1d3a2f; }' }] },
      { file: 'theme.css', create: true, expectedHash: null, content: ':root { --ink: #1d3a2f; }\n' }
    ]
  });
  assert.equal(applied.status, 200);
  assert.equal(applied.data.status, 'review');
  assert.deepEqual(applied.data.change.files.map(item => item.file), ['index.html', 'styles.css', 'theme.css']);
  assert.equal(applied.data.change.file, 'index.html', 'the first file stays the headline for older readers');
  assert.equal(applied.data.change.before, undefined, 'file contents never leave the engine');
  assert.match(await read(f, 'index.html'), /A field record\./);
  assert.match(await read(f, 'styles.css'), /#1d3a2f/);
  assert.match(await read(f, 'theme.css'), /--ink/);
  const undone = await f.api(`/requests/${request.id}/undo`, {}, 'browser');
  assert.equal(undone.data.status, 'undone');
  assert.equal(await read(f, 'index.html'), INDEX);
  assert.equal(await read(f, 'styles.css'), STYLES);
  await assert.rejects(read(f, 'theme.css'), /ENOENT/, 'the created file is removed');
});

test('a bad edit in any file means no file is written', async t => {
  const f = await fixture(t); const request = await f.claim(); const h = await f.hashes();
  const result = await f.api(`/requests/${request.id}/patch`, {
    leaseToken: request.leaseToken, summary: 'Two files, one of them wrong.',
    files: [
      { file: 'index.html', expectedHash: h.index, edits: [{ search: 'A precise observation.', replace: 'Changed.' }] },
      { file: 'styles.css', expectedHash: h.styles, edits: [{ search: 'color', replace: 'colour' }] }
    ]
  });
  assert.equal(result.status, 409);
  assert.equal(result.data.error, 'ambiguous_edit');
  assert.equal(await read(f, 'index.html'), INDEX, 'the valid first file was not touched');
  assert.equal(await read(f, 'styles.css'), STYLES);
  assert.equal((await f.api(`/requests/${request.id}/patch`, { leaseToken: request.leaseToken, summary: 'Retry', file: 'index.html', expectedHash: h.index, edits: [{ search: 'A precise observation.', replace: 'Retried.' }] })).status, 200, 'the lease is still usable after a rejected patch');
});

test('a failure while writing restores the files already written', { skip: process.getuid?.() === 0 && 'Permissions are not enforced for root.' }, async t => {
  const f = await fixture(t); const request = await f.claim(); const h = await f.hashes();
  await fs.mkdir(path.join(f.root, 'locked'));
  await fs.chmod(path.join(f.root, 'locked'), 0o555);
  t.after(() => fs.chmod(path.join(f.root, 'locked'), 0o755).catch(() => {}));
  const originalError = console.error; console.error = () => {};
  const result = await f.api(`/requests/${request.id}/patch`, {
    leaseToken: request.leaseToken, summary: 'The second file cannot be written.',
    files: [
      { file: 'index.html', expectedHash: h.index, edits: [{ search: 'A precise observation.', replace: 'Half applied.' }] },
      { file: 'locked/new.css', create: true, expectedHash: null, content: 'a { color: red; }\n' }
    ]
  });
  console.error = originalError;
  assert.equal(result.status, 500);
  assert.equal(await read(f, 'index.html'), INDEX, 'the first file was put back');
  const state = (await f.api('/requests')).data.requests.find(item => item.id === request.id);
  assert.equal(state.status, 'conflict');
  assert.match(state.message, /No file was changed|Restoring the earlier files/);
});

test('undo refuses when any one of the files has newer edits, and changes nothing', async t => {
  const f = await fixture(t); const request = await f.claim(); const h = await f.hashes();
  await f.api(`/requests/${request.id}/patch`, { leaseToken: request.leaseToken, summary: 'Two files.', files: [
    { file: 'index.html', expectedHash: h.index, edits: [{ search: 'A precise observation.', replace: 'Edited.' }] },
    { file: 'styles.css', expectedHash: h.styles, edits: [{ search: 'h1 { color: #222; }', replace: 'h1 { color: red; }' }] }
  ] });
  await fs.appendFile(path.join(f.root, 'styles.css'), '/* a later human edit */\n');
  const refused = await f.api(`/requests/${request.id}/undo`, {}, 'browser');
  assert.equal(refused.status, 409);
  assert.match(await read(f, 'index.html'), /Edited\./, 'the untouched file was not rolled back alone');
  assert.match(await read(f, 'styles.css'), /later human edit/);
  assert.equal((await f.api(`/requests/${request.id}/keep`, {}, 'browser')).data.status, 'completed');
});

test('the file list is bounded and each file appears once', async t => {
  const f = await fixture(t); const request = await f.claim(); const h = await f.hashes();
  const twice = await f.api(`/requests/${request.id}/patch`, { leaseToken: request.leaseToken, summary: 'Duplicate.', files: [
    { file: 'index.html', expectedHash: h.index, edits: [{ search: 'A precise observation.', replace: 'One.' }] },
    { file: 'index.html', expectedHash: h.index, edits: [{ search: 'One sentence.', replace: 'Two.' }] }
  ] });
  assert.equal(twice.status, 400);
  const many = await f.api(`/requests/${request.id}/patch`, { leaseToken: request.leaseToken, summary: 'Too many.', files: Array.from({ length: 13 }, (_, i) => ({ file: `n${i}.css`, create: true, expectedHash: null, content: 'a{}\n' })) });
  assert.equal(many.status, 400);
  assert.equal((await f.api(`/requests/${request.id}/patch`, { leaseToken: request.leaseToken, summary: 'Empty.', files: [] })).status, 400);
});

test('recovery of an interrupted multi-file apply tells finished, untouched and half-applied apart', async t => {
  const f = await fixture(t);
  const [index, styles] = [await readSource(f.root, 'index.html'), await readSource(f.root, 'styles.css')];
  const a = preparePatch(index, index.hash, [{ search: 'A precise observation.', replace: 'Recovered.' }]);
  const b = preparePatch(styles, styles.hash, [{ search: 'h1 { color: #222; }', replace: 'h1 { color: green; }' }]);
  const record = id => f.studio.session.journal.serial(() => f.studio.session.journal.append('patch_prepared', { id, status: 'applying', instruction: 'Recover.', change: { ...a, summary: 'Two files', changes: [a, b] } }));
  await record('half');
  await fs.writeFile(path.join(f.root, 'index.html'), a.after);
  await f.restart();
  assert.equal(f.studio.session.get('half').status, 'conflict', 'one file written and one not is a conflict, never a silent success');
  await fs.writeFile(path.join(f.root, 'index.html'), INDEX);
  await record('none');
  await f.restart();
  assert.equal(f.studio.session.get('none').status, 'queued', 'nothing was written, so the request returns to the queue');
  await fs.writeFile(path.join(f.root, 'index.html'), a.after);
  await fs.writeFile(path.join(f.root, 'styles.css'), b.after);
  await record('all');
  await f.restart();
  assert.equal(f.studio.session.get('all').status, 'review', 'every file written means the change is ready for review');
  assert.equal(hash(await read(f, 'styles.css')), b.afterHash);
});
