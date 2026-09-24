import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The dev server proxies the API and the websocket so the browser only ever
// talks to one origin — no CORS or cookie surprises while developing.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:4000', ws: true },
    },
  },
});
