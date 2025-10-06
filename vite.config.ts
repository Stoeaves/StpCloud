import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2015',
  },
  server: {
    port: 3000,
  },
  define: {
    __API_URL__: JSON.stringify('https://cloud-service.seave.top'),
    __CHUNK_SIZE__: JSON.stringify(1024 * 1024 * 1), // 1MB
  },
});
