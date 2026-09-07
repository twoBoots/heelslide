# Proposal: Type Export Parity & Self-Contained Component Declarations

## 1. Context & Problem Statement
A detailed inspection of the distribution artifacts (`dist/index.d.ts`) and type manifests across the monorepo packages revealed two issues impacting external TypeScript consumers:

1. **Incomplete Re-exports of Core Types**:
   - In [`@heelslide/svelte`](../../../packages/svelte/src/types.ts): `Segment`, `Direction`, `Bounds`, and `ProjectedPoint` are omitted from the re-exports, despite `TrackPath` exposing `segments: Segment[]` and props accepting `bounds: Bounds`.
   - In [`@heelslide/react`](../../../packages/react/src/index.ts): `Bounds` and `Direction` are omitted from the re-exports, despite `GeneratorOptions` requiring `bounds: Bounds`.
   - Consumers in Svelte and React currently have to manually install and import from `@heelslide/core` just to type bounds or track segments.

2. **Dangling Relative SFC Imports in Built Declarations**:
   - [`@heelslide/vue`](../../../packages/vue/src/index.ts) re-exports `Heelslide.vue` directly (`export { default as Heelslide } from './Heelslide.vue'`). Because `dist/` contains no `.vue` or `Heelslide.vue.d.ts` file, any consumer TypeScript project without ambient module declarations (`*.vue`) fails with `Cannot find module './Heelslide.vue' or its corresponding type declarations`.
   - [`@heelslide/svelte`](../../../packages/svelte/src/index.ts) similarly outputs `export { default as Heelslide, default } from './Heelslide.svelte'`.
   - Consumers importing these packages into standard TypeScript projects receive compile-time declaration resolution errors unless they maintain custom ambient shims.

## 2. Proposed Solution
1. **Re-Export Parity**:
   - Update `packages/svelte/src/types.ts` to re-export `Bounds`, `Direction`, `Segment`, and `ProjectedPoint`.
   - Update `packages/react/src/index.ts` to re-export `Bounds` and `Direction`.

2. **Self-Contained Component Typing in Vue & Svelte**:
   - In `packages/vue/src/index.ts`, explicitly declare the exported `Heelslide` component type using Vue's `DefineComponent<HeelslideProps, ..., HeelslideEmits>`, eliminating the dangling `./Heelslide.vue` declaration import.
   - In `packages/svelte/src/index.ts`, explicitly declare the exported `Heelslide` component type using Svelte 5's `Component<HeelslideProps>`, eliminating the dangling `./Heelslide.svelte` declaration import.

3. **Consumer Type Smoke Testing**:
   - Add a test suite (`tests/consumer-types.test.ts`) that verifies the built `dist/index.d.ts` files across all packages can be cleanly imported and resolved by TypeScript without external ambient shims.

## 3. Scope Boundaries
- **In Scope**:
  - Re-exports in `@heelslide/svelte` and `@heelslide/react`.
  - Component typing in `@heelslide/vue` and `@heelslide/svelte`.
  - Consumer-facing TypeScript declaration verification tests.
- **Out of Scope**:
  - Modifying component runtime implementations (only entrypoint types and manifests are adjusted).
