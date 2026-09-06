import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@heelslide/core': path.resolve(__dirname, '../../packages/core/src'),
      '@heelslide/react': path.resolve(__dirname, '../../packages/react/src'),
      '@heelslide/vue': path.resolve(__dirname, '../../packages/vue/src')
    }
  },
  base: process.env.GITHUB_PAGES === 'true' ? '/heelslide/' : '/',
  server: {
    port: 5173,
    host: true
  }
});
