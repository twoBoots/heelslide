import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [vue(), svelte()],
  resolve: {
    conditions: ['browser'],
    alias: {
      '@heelslide/core': resolve(__dirname, 'packages/core/src/index.ts')
    }
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['{packages,apps}/*/tests/**/*.test.{ts,tsx}', 'tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      },
      include: ['{packages,apps}/*/src/**/*.{ts,tsx,vue,svelte}'],
      exclude: [
        'packages/*/src/index.ts',
        'packages/*/src/types.ts',
        'apps/*/src/main.tsx',
        '**/*.d.ts'
      ]
    }
  }
});
