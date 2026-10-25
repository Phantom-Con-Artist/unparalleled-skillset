import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Served at unparalleled.pages.dev/soveriegn-quantum/, built straight into the Pages output folder.
export default defineConfig({
  base: '/soveriegn-quantum/',
  plugins: [react()],
  build: {
    outDir: fileURLToPath(new URL('../../public/soveriegn-quantum', import.meta.url)),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1200,
    // three.js only loads with the machine; keep it out of the first paint.
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [{ name: 'three', test: /node_modules[\\/](three|@react-three|three-stdlib|camera-controls|maath)/ }],
        },
      },
    },
  },
  server: { port: 5175 },
});
