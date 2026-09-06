# Proposal: Svelte 5 Component Adapter (`svelte-adapter`)

## Problem & Intent

Touchscreen applications executing sensitive, destructive, or high-consequence operations (such as payment authorization, critical data deletion, security rule updates, and device configuration) require deliberate, verified user confirmation. Conventional single-axis slide-to-unlock gestures are susceptible to pocket brushes, inadvertent thumb swipes, and accidental activations.

`@heelslide/core` provides the framework-agnostic geometric foundation, procedural rectilinear path generator with 90-degree turns ("heels"), and deterministic gesture state machine. Following the delivery of the React (`@heelslide/react`) and Vue 3 (`@heelslide/vue`) adapters, expanding Heelslide to Svelte 5 is the natural progression in fulfilling the project's multi-framework mandate.

Svelte 5 introduces universal Runes (`$state`, `$derived`, `$props`, `$effect`), moving Svelte from compile-time reactivity heuristics to fine-grained signal-based primitives. This track designs and implements `@heelslide/svelte`, offering first-class, idiomatic Svelte 5 support with complete API and behavioral parity to existing ecosystem adapters.

The package provides:
1. `createHeelslide(options)`: A headless Svelte 5 composable rune function wrapping `HeelslideEngine`, exposing fine-grained reactive signals (`state`, `progress`, `track`, `currentSegmentIndex`, `handlePosition`, `isDragging`), coordinate normalization, event processors, and engine controls.
2. `<Heelslide />`: An accessible, performant, and customizable presentation component built with modern Svelte 5 runes (`$props`), rendering procedural SVG tracks, progress highlights, heel corner indicators, and draggable handle elements supporting native PointerEvents with Pointer Capture.

## Multi-Framework Ecosystem Parity

| Feature | `@heelslide/react` | `@heelslide/vue` | `@heelslide/svelte` (Proposed) |
|---|---|---|---|
| Reactive Hook / Composable | `useHeelslide(options)` | `useHeelslide(options)` | `createHeelslide(options)` (Runes: `$state`, `$derived`) |
| Presentation Component | `<Heelslide />` | `<Heelslide />` | `<Heelslide />` (Runes: `$props()`) |
| Event Callbacks | `onUnlock`, `onReset`, etc. | `onUnlock` / `@unlock` | `onunlock`, `onreset`, etc. (Svelte 5 standard) |
| Procedural SVG Track | Rectilinear path + heels | Rectilinear path + heels | Rectilinear path + heels |
| Pointer Capture | `setPointerCapture` | `setPointerCapture` | `setPointerCapture` |
| Theming System | `--heelslide-*` CSS vars | `--heelslide-*` CSS vars | `--heelslide-*` CSS vars |
| Bundle Output | ESM, CJS, `.d.ts` | ESM, CJS, `.d.ts` | ESM, CJS, `.d.ts` |

## User & Developer Benefits

- **Idiomatic Svelte 5 Reactivity:** Leverages Svelte 5's fine-grained runes system without external state libraries, offering minimal memory overhead and zero tick lag.
- **Headless & Pre-Styled Flexibility:** Developers can drop in the ready-to-use `<Heelslide />` component or build completely custom UI interfaces using `createHeelslide()`.
- **Accidental Swipe Resistance:** Enforces genuine human intent via multi-directional 90-degree directional changes that cannot be satisfied by linear accidental motion.
- **Consistent Monorepo Standards:** Adheres to the established Cooper SDD lifecycle, rigorous TDD (>80% coverage), zero-dependency core usage, and full TypeScript type safety.

## Scope Guardrails

### In-Scope
- `packages/svelte` workspace package with `@heelslide/core` workspace dependency and `svelte` peerDependency (`^5.0.0`).
- Vite library mode bundling ESM (`dist/index.js`), CJS (`dist/index.cjs`), and TypeScript declarations (`dist/index.d.ts`).
- Headless composable `createHeelslide(options)` utilizing Svelte 5 runes (`$state`, `$derived`) for reactive state, coordinate projection, pointer handling, and path regeneration.
- Component `<Heelslide />` using Svelte 5 `$props()`, supporting callback props (`onunlock`, `onreset`, `onprogress`, `onstatechange`) with case-insensitive / camelCase fallback compatibility (`onUnlock`, etc.).
- Procedural SVG track rendering with 90-degree heel corner markers, progress fill overlay, and draggable handle.
- Visual styling via shared `--heelslide-*` CSS custom properties with resilient default fallbacks.
- Native PointerEvents tracking with pointer capture (`setPointerCapture` / `releasePointerCapture`) and unmount lifecycle teardown.
- Comprehensive unit and component testing with Vitest maintaining >80% code coverage.
- Monorepo typechecking (`tsc -b`) and linting (`oxlint .`).

### Out-of-Scope
- React or Vue adapter updates (handled in respective completed tracks).
- Interactive documentation playground update (`apps/docs`) — will consume `@heelslide/svelte` in an ecosystem demo track.
- Canvas or WebGL rendering pipelines (SVG provides clean scaling, vector crispness, and DOM accessibility).
