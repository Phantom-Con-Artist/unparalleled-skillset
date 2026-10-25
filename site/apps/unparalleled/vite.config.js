import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('../../../', import.meta.url));
const STATIC_DEMOS = { '/claude/': 'site/demos/claude/index.html' };

// In development, serve the single-file demos at the paths they have in production.
const staticDemos = {
  name: 'serve-static-demos',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = req.url.split('?')[0];
      const file = STATIC_DEMOS[url] || STATIC_DEMOS[`${url}/`];
      if (!file) return next();
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(fs.readFileSync(repo + file));
    });
  },
};

// The root app of the Pages site. site/scripts/build.mjs empties site/public before building,
// so this build never clears the demo apps that sit in their own folders beside it.
export default defineConfig({
  base: '/',
  plugins: [react(), staticDemos],
  build: {
    outDir: fileURLToPath(new URL('../../public', import.meta.url)),
    emptyOutDir: false,
  },
  server: {
    port: 5174,
    // `npm run site:dev` runs the demo servers on 5173 and 5175; reach them through this one.
    proxy: {
      '/poterie-celeste': { target: 'http://localhost:5173', ws: true, changeOrigin: true },
      '/soveriegn-quantum': { target: 'http://localhost:5175', ws: true, changeOrigin: true },
    },
  },
});
