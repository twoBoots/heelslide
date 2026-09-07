## Summary

This PR implements the **Segmented Multi-Gesture Checkpoints** feature track across the Heelslide monorepo, providing an optional multi-gesture interaction model where users must release contact at each 90-degree heel corner before initiating a subsequent stroke toward the next segment or final destination.

### Key Capabilities & Changes

1. **Core Gesture Engine (`@heelslide/core`)**:
   - Added `segmented?: boolean`, `checkpointTimeoutMs?: number`, and `onCheckpoint?: (heelIndex: number, progress: number) => void` to `EngineOptions`.
   - Added `'checkpoint'` to `GestureState` union type.
   - Clamped handle trajectory at intermediate heel vertices in segmented mode, disallowing continuous advancement across turns within a single stroke.
   - Transition to `'checkpoint'` state upon pointer release at a heel vertex, emitting `onCheckpoint` and preserving progress.
   - Supported handle re-engagement at confirmed heel checkpoints via `startGesture(point)`.
   - Implemented mid-segment snapback to the last confirmed heel checkpoint (or origin if before the first heel) on deviation or premature release.
   - Implemented optional inactivity auto-reset (`checkpointTimeoutMs`) with complete lifecycle cleanup in `reset()` and `destroy()`.

2. **Framework Adapters (`@heelslide/react`, `@heelslide/vue`, `@heelslide/svelte`)**:
   - Full framework parity across React, Vue 3, and Svelte 5.
   - Added `segmented`, `checkpointTimeoutMs`, and checkpoint callbacks/emits to all components and composables/hooks.
   - Exposed `data-state="checkpoint"` and `.heelslide-checkpoint` CSS classes across all components.

3. **Documentation & Playground (`apps/docs`)**:
   - Added "Segmented Mode" toggle and "Checkpoint Inactivity Timeout" range slider in `ConfigPanel`.
   - Added glowing amber handle indicator styling for `[data-state="checkpoint"]` and `.status-tag.checkpoint`.
   - Updated snippet generator to produce copyable code samples with `segmented` and `checkpointTimeoutMs` across React, Vue, and Vanilla TS.

---

### Spec Delta Compliance

- **`gesture-engine`**:
  - `+` Configurable Segmented Mode: Clamps handle at heel vertex and prevents continuous stroke advancement.
  - `+` Checkpoint State on Gesture Release: Emits `onCheckpoint(heelIndex, progress)` and preserves progress.
  - `+` Checkpoint Re-engagement & Resumption: Validates touch within tolerance of heel coordinate.
  - `+` Mid-Segment Snapback: Reverts to last confirmed checkpoint on deviation or incomplete stroke.
  - `+` Checkpoint Inactivity Auto-Reset: Resets to origin upon timer expiry.
- **`react-adapter`**:
  - `+` Prop forwarding in `useHeelslide` and `<Heelslide />`.
  - `+` Container `data-state="checkpoint"` exposure.
- **`vue-adapter`**:
  - `+` Prop forwarding in `useHeelslide` and `<Heelslide />`.
  - `+` `@checkpoint` emit and `data-state="checkpoint"` exposure.
- **`svelte-adapter`**:
  - `+` Prop forwarding in `createHeelslide` and `<Heelslide />`.
  - `+` `oncheckpoint` / `onCheckpoint` callbacks and `data-state="checkpoint"` exposure.
- **`docs-playground`**:
  - `+` Segmented mode toggle and timeout controls in demo playground.

---

### Verification Results

- **Unit & Component Tests:** 167 / 167 passing across 21 test files (`CI=true npm test`).
- **Code Coverage:** 97.22% statements, 86.07% branches, 90.28% functions across monorepo packages.
  - `@heelslide/core`: 97.62% stmts
  - `@heelslide/react`: 98.76% stmts
  - `@heelslide/svelte`: 98.10% stmts
  - `@heelslide/vue`: 97.39% stmts
  - `@heelslide/docs`: 95.18% stmts
- **Linter:** `oxlint .` passed with 0 errors.
- **Typecheck:** `tsc -b` passed with 0 errors.
- **Builds:** `npm run build` cleanly compiled all packages.
- **Phase Checkpoints:**
  - Phase 1 (Core Engine): `06ded43`
  - Phase 2 (Framework Adapters): `3cb6572`
  - Phase 3 (Docs & Final Verification): `85c4ebd`
