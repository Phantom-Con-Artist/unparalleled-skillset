import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { StudioError, PREFIX, VERSION, requireString, validateSelection } from '../../studio-protocol/src/index.mjs';
import { readSource } from './workspace.mjs';
import { agentInstruction, mcpSetup } from './instruction.mjs';
import { startReferencePicker } from './picker.mjs';
const overlay = fileURLToPath(new URL('../../studio-overlay/', import.meta.url));
const skills = fileURLToPath(new URL('../../../.agents/skills/', import.meta.url));
const MIME = { '.mjs': 'text/javascript', '.woff2': 'font/woff2' };
export function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(data));
}
async function body(req, limit = 1024 * 1024) {
  let size = 0; const chunks = [];
  for await (const chunk of req) { size += chunk.length; if (size > limit) throw new StudioError('body_too_large', 'Request exceeds the allowed size.', 413); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { throw new StudioError('invalid_json', 'Request must contain valid JSON.'); }
}
function equal(a, b) { return typeof a === 'string' && a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b)); }
export function bootstrap(session) {
  return `<script type="module" data-unparalleled-studio src="${PREFIX}/boot.mjs"></script>`;
}
export function injectHTML(html, session) {
  if (html.includes('data-unparalleled-studio')) return html;
  const tag = bootstrap(session);
  return /<\/body\s*>/i.test(html) ? html.replace(/<\/body\s*>/i, tag + '</body>') : html + tag;
}
export function createMiddleware(session) {
  const streams = new Set();
  const broadcast = (type, payload) => { for (const stream of streams) stream.write(`event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`); };
  const update = record => {
    broadcast('state', snapshot());
    if (session.previewMode === 'static' && ['patched', 'undo'].includes(record?.type)) broadcast('source', { file: record.request.change?.file });
  };
  const command = value => broadcast('command', value);
  session.on('update', update); session.on('command', command);
  const heartbeat = setInterval(() => broadcast('state', snapshot()), 10000);
  heartbeat.unref();
  function snapshot() { return { version: VERSION, sessionId: session.id, project: path.basename(session.root), origin: session.origin, previewMode: session.previewMode, requests: session.list(), agentListening: session.waitingAgents > 0, browserCount: streams.size, pickerOpen: Boolean(session.picker), pickedReferences: [...session.pickedReferences.values()].map(item => ({ id: item.id, url: item.url, host: new URL(item.url).host, selector: item.selector, text: item.text.slice(0, 80), hasImage: Boolean(item.captureFile) })) }; }
  async function handle(req, res, next = () => sendJSON(res, 404, { error: 'not_found' })) {
    let url;
    try {
      url = new URL(req.url, session.origin);
      if (!url.pathname.startsWith(PREFIX + '/')) return next();
      const route = url.pathname.slice(PREFIX.length);
      const origins = session.allowedOrigins || new Set([session.origin]);
      const extensionOrigin = /^chrome-extension:\/\/[a-p]{32}$/.test(req.headers.origin || '') && route === '/references';
      if (![...origins].some(origin => new URL(origin).host === req.headers.host) || (req.headers.origin && !origins.has(req.headers.origin) && !extensionOrigin)) throw new StudioError('origin_forbidden', 'Studio accepts only this development origin.', 403);
      if (extensionOrigin) {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin); res.setHeader('Vary', 'Origin');
        if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type, x-studio-token' }); return res.end(); }
      }
      // These resources carry only browser capabilities; source-edit credentials stay on disk.
      if (req.method === 'GET' && route === '/browser-session') return sendJSON(res, 200, { sessionId: session.id });
      if (req.method === 'GET' && route === '/boot.mjs') {
        res.writeHead(200, { 'Content-Type': 'text/javascript', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
        return res.end(`import { mountStudio } from '${PREFIX}/assets/index.mjs';\nmountStudio(${JSON.stringify({ prefix: PREFIX, token: session.browserToken, sessionId: session.id })});`);
      }
      const asset = /^\/assets\/(index\.mjs|inspector\.mjs|styles\.mjs|archivo\.woff2|martian\.woff2)$/.exec(route);
      if (req.method === 'GET' && asset) {
        const name = asset[1];
        const content = await fs.readFile(path.join(overlay, name.endsWith('.woff2') ? 'assets' : 'src', name));
        res.writeHead(200, { 'Content-Type': MIME[path.extname(name)], 'Cache-Control': name.endsWith('.woff2') ? 'public, max-age=86400' : 'no-store', 'X-Content-Type-Options': 'nosniff' }); return res.end(content);
      }
      const supplied = req.headers['x-studio-token'] || (route === '/events' ? url.searchParams.get('token') : null);
      const agent = equal(supplied, session.agentToken);
      const referenceOnly = equal(supplied, session.referenceToken);
      if (!agent && !referenceOnly && !equal(supplied, session.browserToken)) throw new StudioError('unauthorized', 'Studio credentials are missing or expired.', 401);
      if (referenceOnly && !(route === '/references' && req.method === 'POST')) throw new StudioError('reference_only', 'Browser companion credentials can only submit references.', 403);
      const needAgent = () => { if (!agent) throw new StudioError('agent_required', 'This operation is available only to the IDE agent.', 403); };
      if (route === '/references' && req.method === 'POST') return sendJSON(res, 201, await session.createReference(await body(req, 6 * 1024 * 1024)));
      if (route === '/events' && req.method === 'GET') {
        const documentId = requireString(url.searchParams.get('documentId'), 'document identity', 100);
        res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', 'Connection': 'keep-alive', 'X-Accel-Buffering': 'no' });
        streams.add(res); session.documents.add(documentId); update();
        req.on('close', () => { streams.delete(res); if (![...streams].some(stream => stream.studioDocumentId === documentId)) session.documents.delete(documentId); });
        res.studioDocumentId = documentId;
        return;
      }
      if (route === '/status' && req.method === 'GET') { if (agent) session.agentSeenAt = Date.now(); return sendJSON(res, 200, snapshot()); }
      if (route === '/agent-instruction' && req.method === 'GET') return sendJSON(res, 200, { text: agentInstruction(session.root), mcp: mcpSetup(session.root) });
      if (route === '/reference-picker' && req.method === 'POST') { await startReferencePicker(session, { url: (await body(req)).url }); return sendJSON(res, 201, { ok: true }); }
      if (route === '/reference-picker/close' && req.method === 'POST') { await session.picker?.close(); return sendJSON(res, 200, { ok: true }); }
      if (route === '/reference-picker/discard' && req.method === 'POST') return sendJSON(res, 200, { ok: session.discardPickedReference(requireString((await body(req)).id, 'reference id', 100)) });
      if (route === '/requests' && req.method === 'GET') return sendJSON(res, 200, { requests: session.list() });
      if (route === '/requests' && req.method === 'POST') return sendJSON(res, 201, await session.create(await body(req)));
      if (route === '/selection' && req.method === 'POST') {
        const selection = validateSelection(await body(req));
        if (!origins.has(new URL(selection.pageUrl).origin) || !session.documents.has(selection.documentId)) throw new StudioError('stale_selection', 'Selection is not from a connected page.', 409);
        session.selection = selection; return sendJSON(res, 200, { ok: true });
      }
      if (route === '/browser/reply' && req.method === 'POST') return sendJSON(res, 200, session.browserReply(await body(req)));
      if (route === '/inspect' && req.method === 'GET') { needAgent(); return sendJSON(res, 200, await session.inspect(url.searchParams.get('selector'), url.searchParams.get('documentId'))); }
      if (route === '/source' && req.method === 'GET') { needAgent(); return sendJSON(res, 200, await readSource(session.root, url.searchParams.get('file'))); }
      if (route === '/context' && req.method === 'GET') {
        needAgent();
        const name = session.skill === 'ui' ? 'unparalleled-ui' : 'unparalleled-website';
        const reference = url.searchParams.get('reference');
        if (reference && !/^[a-z][a-z0-9-]*$/.test(reference)) throw new StudioError('invalid_reference', 'Use a reference name without a path.');
        const file = path.join(skills, name, reference ? `references/${reference}.md` : 'SKILL.md');
        const content = await fs.readFile(file, 'utf8').catch(() => { throw new StudioError('not_found', 'Skill reference not found.', 404); });
        return sendJSON(res, 200, { skill: name, file, content, projectRoot: session.root, guidance: 'Read the applicable skill, preserve approved scope and inspect the rendered change. A queued request is not permission to publish.' });
      }
      if (route === '/requests/claim' && req.method === 'POST') {
        needAgent(); const data = await body(req);
        const wait = Number(data.waitMs || 0);
        if (!Number.isInteger(wait) || wait < 0 || wait > 25000) throw new StudioError('invalid_timeout', 'waitMs must be 0–25000.');
        const since = session.journal.records.length;
        let request = await session.claim();
        if (!request && wait && session.journal.records.length === since) {
          session.waitingAgents++; session.emit('update', {});
          await new Promise(resolve => {
            let timer;
            const done = () => { clearTimeout(timer); session.journal.off('change', done); res.off('close', done); resolve(); };
            session.journal.once('change', done); res.once('close', done); timer = setTimeout(done, wait);
            if (session.journal.records.length !== since) done();
          });
          session.waitingAgents--; session.emit('update', {});
          if (res.destroyed) return;
          request = await session.claim();
        }
        return sendJSON(res, 200, { request });
      }
      const match = /^\/requests\/([a-f0-9-]+)\/(patch|reply|renew|keep|undo|cancel)$/.exec(route);
      if (match && req.method === 'POST') {
        const [, id, action] = match;
        const data = await body(req);
        if (['patch', 'reply', 'renew'].includes(action)) needAgent();
        const result = action === 'patch' ? await session.patch(id, data) : action === 'reply' ? await session.reply(id, data) : action === 'renew' ? await session.renew(id, data.leaseToken) : await session.decide(id, action);
        return sendJSON(res, 200, result);
      }
      throw new StudioError('not_found', 'Studio endpoint not found.', 404);
    } catch (error) {
      if (!res.headersSent) sendJSON(res, error.status || 500, { error: error.code || 'internal_error', message: error.status ? error.message : 'Studio could not complete the operation. Check the engine terminal.' });
      else res.end();
      if (!error.status) console.error(error);
    }
  }
  return { handle, snapshot, close() { clearInterval(heartbeat); session.off('update', update); session.off('command', command); for (const stream of streams) stream.end(); streams.clear(); session.documents.clear(); } };
}
