import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

// Vite 配置
export default defineConfig({
  plugins: [vue()],
  root: 'frontend',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./frontend/src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5174',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: '../dist'
  }
});
