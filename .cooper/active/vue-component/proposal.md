# Proposal: Vue 3 Component & Composable Adapter

## Problem & Intent
Touchscreen applications executing sensitive, destructive, or high-consequence operations (such as payment authorization, account deletion, and system resets) require deliberate, verified user confirmation. Standard 1D slide-to-unlock gestures are susceptible to accidental pocket brushes and unintentional touches.

`@heelslide/core` delivers framework-agnostic geometric calculation, procedural rectilinear path generation with 90-degree heels, and a finite state machine. However, Vue 3 developers need idiomatic Vue primitives that integrate seamlessly into Vue template syntax and the Composition API.

This track implements `@heelslide/vue`: a dedicated Vue 3 adapter package providing:
1. `useHeelslide(options)`: A headless Vue composable wrapping `HeelslideEngine` with reactive state (`progress`, `state`, `track`, `currentSegmentIndex`), pointer event handlers, coordinate normalization, and lifecycle management.
2. `<Heelslide />`: An accessible, customizable presentation component built with `<script setup lang="ts">`, rendering procedural SVG tracks, active progress fills, 90-degree heel indicators, and a draggable handle supporting native PointerEvents with pointer capture.

## Scope Guardrails

### In-Scope
- `packages/vue` workspace package with `@heelslide/core` workspace dependency and `vue` peerDependency (`^3.3.0`).
- Vite library mode bundling ESM (`dist/index.js`), CJS (`dist/index.cjs`), and TypeScript declarations (`dist/index.d.ts`).
- Headless composable `useHeelslide(options)` exposing reactive state, pointer interaction handlers, coordinate projection, and engine controls.
- Component `<Heelslide />` supporting dual callback props (`onUnlock`, `onReset`, `onProgress`, `onStateChange`) and Vue emits (`unlock`, `reset`, `progress`, `stateChange`).
- Procedural SVG track rendering with 90-degree heel direction changes and draggable handle.
- Complete visual styling via `--heelslide-*` CSS custom properties with sensible fallbacks.
- Native PointerEvents tracking with pointer capture (`setPointerCapture` / `releasePointerCapture`) and lifecycle teardown on unmount.
- Unit and component tests with Vitest and `@vue/test-utils` maintaining >80% coverage.
- Strict type checking (`tsc -b`) and linting (`oxlint .`).

### Out-of-Scope
- React component wrapper (`@heelslide/react`) — isolated to its dedicated track.
- Interactive documentation site and showcase application (`apps/docs`) — deferred to documentation track.
- Canvas or WebGL rendering backends — SVG provides ideal vector crispness and accessibility.
