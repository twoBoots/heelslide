import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import dts from 'vite-plugin-dts';

export default defineConfig({
  resolve: {
    conditions: ['browser']
  },
  plugins: [
    svelte(),
    dts({
      rollupTypes: true,
      tsconfigPath: resolve(__dirname, 'tsconfig.json')
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'HeelslideSvelte',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      external: ['svelte', /^svelte\/.*/, '@heelslide/core'],
      output: {
        exports: 'named',
        assetFileNames: 'style.[ext]',
        globals: {
          svelte: 'Svelte',
          '@heelslide/core': 'HeelslideCore'
        }
      }
    }
  }
});
