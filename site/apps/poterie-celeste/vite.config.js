import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Served at unparalleled.pages.dev/poterie-celeste/, built straight into the Pages output folder.
export default defineConfig({
  base: '/poterie-celeste/',
  plugins: [react()],
  build: {
    outDir: fileURLToPath(new URL('../../public/poterie-celeste', import.meta.url)),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1200,
    // three.js is shared by both lazy 3D scenes; keep it out of the first paint.
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [{ name: 'three', test: /node_modules[\\/](three|@react-three|three-stdlib|camera-controls|maath)/ }],
        },
      },
    },
  },
  server: { port: 5173 },
});
