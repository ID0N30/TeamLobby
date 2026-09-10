import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/steam-search': {
        target: 'https://store.steampowered.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/steam-search\/?/, '/api/storesearch'),
        configure: (proxy) => {
          proxy.on('error', (_err, _req, res) => {
            if ('writeHead' in res) {
              (res as any).writeHead(200, { 'Content-Type': 'application/json' });
              (res as any).end(JSON.stringify({ items: [] }));
            }
          });
        }
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/compat/app', 'firebase/compat/database', 'firebase/compat/auth'],
          'vendor-icons': ['lucide-react']
        }
      }
    }
  }
})