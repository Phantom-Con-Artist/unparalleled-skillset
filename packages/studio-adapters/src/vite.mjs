import fs from 'node:fs/promises';
import { StudioSession, createMiddleware, injectHTML, writeConnection } from '../../studio-engine/src/index.mjs';
export function unparalleledStudio(options = {}) {
  let session, middleware, connectionFile, closing, readyPromise = Promise.resolve();
  const cleanup = () => closing ||= (async () => {
    try { await readyPromise; }
    finally { middleware?.close(); if (connectionFile) await fs.rm(connectionFile, { force: true }); await session?.close(); }
  })();
  return {
    name: 'unparalleled-studio', apply: 'serve',
    config(config) {
      // Register before Vite compiles its filesystem deny matcher.
      const deny = ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/.unparalleled/**', ...(config.server?.fs?.deny || [])];
      return { server: { fs: { deny: [...new Set(deny)] } } };
    },
    configResolved(config) {
      if (config.server.host === true || (config.server.host && !['localhost', '127.0.0.1', '::1'].includes(config.server.host))) throw new Error('Studio requires a loopback-only Vite server.');
      if (config.server.https) throw new Error('This first Studio adapter supports local HTTP development servers only.');
    },
    async configureServer(server) {
      if (!server.httpServer) throw new Error('Studio currently requires Vite to own its HTTP server.');
      session = await new StudioSession({ root: server.config.root, skill: options.skill || 'website' }).open();
      session.previewMode = 'vite'; middleware = createMiddleware(session);
      server.httpServer.once('listening', () => {
        readyPromise = (async () => {
          const address = server.httpServer.address();
          const host = address.address === '::1' ? '[::1]' : '127.0.0.1';
          session.origin = `http://${host}:${address.port}`;
          session.allowedOrigins = new Set([session.origin, `http://localhost:${address.port}`]);
          connectionFile = await writeConnection(session);
          server.config.logger.info(`Studio attached at ${session.origin}. Agent connection: ${connectionFile}`);
        })();
        readyPromise.catch(error => server.config.logger.error(error.message));
      });
      server.middlewares.use((req, res, next) => {
        let pathname;
        try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400); return res.end('Invalid path.'); }
        if (pathname.split('/').includes('.unparalleled')) { res.writeHead(403); return res.end('Studio runtime files are private.'); }
        return middleware.handle(req, res, next);
      });
      server.httpServer.once('close', () => cleanup().catch(error => server.config.logger.error(error.message)));
    },
    transformIndexHtml(html) { return session ? injectHTML(html, session) : html; },
    async closeBundle() { await cleanup(); },
  };
}
