# Proposal: React Component Adapter & Headless Hook

## Problem & Intent
Touchscreen confirmation patterns require deliberate, high-intent gestures to prevent accidental triggering. `@heelslide/core` provides the geometric algorithms, procedural 90-degree rectilinear path generation, and finite state machine for this pattern, but lacks direct UI bindings for modern web frameworks.

This track implements `@heelslide/react` in `packages/react/`. It delivers an ergonomic, headless React hook (`useHeelslide`) and a fully styled presentational component (`<Heelslide />`) compatible with both React 18 and React 19.

## Scope Guardrails

### In-Scope
- `packages/react/` package setup with `@heelslide/core` workspace dependency and `react` / `react-dom` peerDependencies (`^18.0.0 || ^19.0.0`).
- Build pipeline configured for library mode emitting ESM, CJS, and `.d.ts` definitions via Vite and `vite-plugin-dts`.
- Headless hook `useHeelslide(options)` providing reactive engine state (`idle`, `active`, `unlocked`, `reset`), progress tracking, and pointer event handlers.
- Presentation component `<Heelslide />` with `React.forwardRef` forwarding to the outer container element.
- Responsive procedural SVG track rendering displaying the rectilinear path, turn vertices ("heels"), and draggable handle.
- PointerEvents management with pointer capture (`setPointerCapture` / `releasePointerCapture`) and lifecycle teardown on unmount.
- Theming via `--heelslide-*` CSS custom properties with resilient default fallbacks.
- Unit and component tests in Vitest ensuring >80% code coverage across statements, branches, and functions.

### Out-of-Scope
- Vue 3 component adapter (`@heelslide/vue`) — separate track.
- Documentation site and live interactive playground (`apps/docs`) — subsequent track.
- Native mobile integrations (React Native) — outside current scope.
