import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages':      path.resolve(__dirname, './src/pages'),
      '@context':    path.resolve(__dirname, './src/context'),
      '@hooks':      path.resolve(__dirname, './src/hooks'),
      '@services':   path.resolve(__dirname, './src/services'),
      '@utils':      path.resolve(__dirname, './src/utils'),
      '@styles':     path.resolve(__dirname, './src/styles'),
    },
  },

  server: {
    port: 5173,
    proxy: {
      // Proxy all /api calls to backend during development
      '/api': {
        target:       'http://localhost:5000',
        changeOrigin: true,
        secure:       false,
      },
      // Proxy Socket.IO
      '/socket.io': {
        target:    'http://localhost:5000',
        ws:        true,
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir:        'dist',
    sourcemap:     false,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:         ['react', 'react-dom'],
          router:         ['react-router-dom'],
          motion:         ['framer-motion'],
          socket:         ['socket.io-client'],
        },
      },
    },
  },
});