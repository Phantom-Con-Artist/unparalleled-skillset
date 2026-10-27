import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { StudioSession } from './session.mjs';
import { createMiddleware, injectHTML } from './http.mjs';
import { resolveFile } from './workspace.mjs';
export { StudioSession } from './session.mjs';
export { createMiddleware, injectHTML } from './http.mjs';
export async function writeConnection(session) {
  const file = path.join(session.stateDir, 'connection.json');
  await fs.writeFile(file, JSON.stringify({ version: 1, url: session.origin, root: session.root, token: session.agentToken, referenceToken: session.referenceToken, sessionId: session.id }, null, 2) + '\n', { mode: 0o600 });
  return file;
}
export async function startStudio({ root = process.cwd(), port = 0, stateDir, skill = 'website' } = {}) {
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Port must be an integer from 0 to 65535.');
  if (!['website', 'ui'].includes(skill)) throw new Error('Skill must be website or ui.');
  const session = await new StudioSession({ root: path.resolve(root), stateDir, skill }).open();
  let middleware;
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2' };
  const server = http.createServer((req, res) => {
    middleware.handle(req, res, async () => {
      try {
        if (req.headers.host !== new URL(session.origin).host) { res.writeHead(403); return res.end('Host is not allowed.'); }
        if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end('Method not allowed.'); }
        const url = new URL(req.url, session.origin);
        let relative = decodeURIComponent(url.pathname).replace(/^\//, '') || 'index.html';
        if (relative.endsWith('/')) relative += 'index.html';
        const file = await resolveFile(session.root, relative);
        const stat = await fs.stat(file);
        if (!stat.isFile() || stat.size > 10 * 1024 * 1024) { res.writeHead(413); return res.end('File cannot be served.'); }
        const type = types[path.extname(file)];
        if (!type) { res.writeHead(403); return res.end('This file type is not served by the static preview.'); }
        let content = await fs.readFile(file);
        if (path.extname(file) === '.html') content = Buffer.from(injectHTML(content.toString('utf8'), session));
        res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
        res.end(req.method === 'HEAD' ? undefined : content);
      } catch (error) { res.writeHead(error.status || 404); res.end(error.status === 403 ? 'File is not available to the preview.' : 'Page not found.'); }
    });
  });
  try {
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
    session.origin = `http://127.0.0.1:${server.address().port}`;
    session.previewMode = 'static';
    middleware = createMiddleware(session);
    const connectionFile = await writeConnection(session);
    return { session, server, connectionFile, url: session.origin, async close() {
      middleware.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
      await fs.rm(connectionFile, { force: true }); await session.close();
    } };
  } catch (error) { if (server.listening) server.close(); await session.close(); throw error; }
}
