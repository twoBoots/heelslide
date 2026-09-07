# Technical Design: Type Export Parity & Self-Contained Component Declarations

## 1. Component Typing Strategy

### Vue 3 Adapter (`packages/vue/src/index.ts`)
Instead of letting Vite emit a relative import to `./Heelslide.vue` in `dist/index.d.ts`, the component export is typed explicitly:

```ts
import type { DefineComponent } from 'vue';
import HeelslideComponent from './Heelslide.vue';
import type { HeelslideEmits, HeelslideProps } from './types.js';

export const Heelslide: DefineComponent<HeelslideProps, {}, {}, {}, {}, any, any, HeelslideEmits> =
  HeelslideComponent as unknown as DefineComponent<HeelslideProps, {}, {}, {}, {}, any, any, HeelslideEmits>;
```

**Benefits**:
- Emits fully resolved `DefineComponent<HeelslideProps, ..., HeelslideEmits>` in `dist/index.d.ts`.
- Consumers do NOT need `declare module '*.vue'` in their projects.
- Full type safety and IDE autocompletion for props and emits.

### Svelte 5 Adapter (`packages/svelte/src/index.ts`)
Instead of `export { default as Heelslide, default } from './Heelslide.svelte';`, type the export using Svelte 5's `Component<Props>`:

```ts
import type { Component } from 'svelte';
import HeelslideComponent from './Heelslide.svelte';
import type { HeelslideProps } from './types.js';

export const Heelslide: Component<HeelslideProps> =
  HeelslideComponent as unknown as Component<HeelslideProps>;
export default Heelslide;
```

**Benefits**:
- Emits fully resolved `Component<HeelslideProps>` in `dist/index.d.ts`.
- Consumers do NOT need `declare module '*.svelte'` in their projects.
- Standard Svelte 5 rune and component prop typing.

---

## 2. Re-Export Parity

### `@heelslide/svelte` (`packages/svelte/src/types.ts`)
Import and re-export:
- `Bounds`
- `Direction`
- `Segment`
- `ProjectedPoint`

### `@heelslide/react` (`packages/react/src/index.ts`)
Import and re-export:
- `Bounds`
- `Direction`

---

## 3. Consumer Type Smoke Testing (`tests/consumer-types.test.ts`)

A dedicated Vitest test suite that acts as an external consumer:
- Creates a virtual in-memory TypeScript program with `ts.createProgram`.
- Imports `Heelslide`, hook/composable functions, and types from each built package (`@heelslide/core`, `@heelslide/react`, `@heelslide/vue`, `@heelslide/svelte`).
- Compiles the virtual consumer file and asserts `ts.getPreEmitDiagnostics` produces **zero** type errors, guaranteeing consumers will never experience declaration resolution issues.
