import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in middleware mode (Express integration) and sandboxed preview environments.
      // Set DISABLE_HMR=false in your local .env to enable HMR during standalone Vite dev server usage.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Suppress WebSocket connection errors in environments that block WebSocket upgrades
      ws: process.env.DISABLE_HMR === 'true' ? (false as const) : undefined,
    },
  };
});
