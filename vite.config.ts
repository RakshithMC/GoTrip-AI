import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin to ensure client-side HTML route requests serve index.html instead of matching source files (e.g. App.tsx)
const spaFallbackPlugin = (): Plugin => ({
  name: 'spa-fallback-plugin',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.method === 'GET') {
        const rawUrl = req.url ? req.url.split('?')[0] : '';
        const accept = req.headers.accept || '';

        // Ignore Vite internal paths, HMR, node_modules, and virtual modules
        const isViteInternal = rawUrl.startsWith('/@') || rawUrl.startsWith('/node_modules') || rawUrl.startsWith('/__vite');
        const isAsset = rawUrl.match(/\.(js|ts|tsx|jsx|css|png|jpg|jpeg|gif|svg|ico|json|woff2?|ttf|eot)$/i);

        // Only rewrite HTML document requests for application routes
        if (!isViteInternal && !isAsset && accept.includes('text/html')) {
          const isAppRoute = rawUrl === '/app' || rawUrl === '/account' || rawUrl === '/login' || rawUrl === '/';
          if (isAppRoute || !rawUrl.includes('.')) {
            req.url = '/index.html';
          }
        }
      }
      next();
    });
  }
});

export default defineConfig({
  plugins: [react(), spaFallbackPlugin()],
  server: {
    port: 3000,
    open: true
  }
});
