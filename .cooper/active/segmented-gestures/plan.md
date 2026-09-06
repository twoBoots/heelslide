# Implementation Plan: Segmented Multi-Gesture Checkpoints

## Phase 1: Core Engine Implementation (`packages/core`)

- [x] Task 1.1: Core Types & State Extensions (27d014d)
  - [x] Sub-task: Define `segmented?: boolean`, `checkpointTimeoutMs?: number`, `onCheckpoint?: (heelIndex: number, progress: number) => void` in `packages/core/src/types.ts`
  - [x] Sub-task: Add `'checkpoint'` to `GestureState` union

- [x] Task 1.2: Checkpoint Clamping, Resumption & Snapback (`packages/core/src/machine.ts`) (fcfc8bd)
  - [x] Sub-task: Write unit tests in `packages/core/tests/machine.test.ts` for clamping movement at heel vertex in segmented mode (Red)
  - [x] Sub-task: Implement movement clamping at heel vertices preventing continuous advancement without release (Green)
  - [x] Sub-task: Write unit tests for pointer release at heel transitioning to `'checkpoint'` state and emitting `onCheckpoint` (Red)
  - [x] Sub-task: Implement `end()` transition to `'checkpoint'` and callback dispatch (Green)
  - [x] Sub-task: Write unit tests for re-engaging handle at checkpoint vertex via `start()` and proceeding to next segment (Red)
  - [x] Sub-task: Implement checkpoint engagement in `start()` (Green)
  - [x] Sub-task: Write unit tests for mid-segment release snapping back to last reached checkpoint (Red)
  - [x] Sub-task: Implement mid-segment snapback in `end()` and `cancel()` (Green)
  - [x] Sub-task: Refactor & verify core state machine test coverage >80% (Refactor)

- [x] Task 1.3: Checkpoint Inactivity Timeout & Engine Integration (`packages/core/src/engine.ts`) (6b3447a)
  - [x] Sub-task: Write unit tests for `checkpointTimeoutMs` auto-reset to origin and timer cleanup on resumption/destroy (Red)
  - [x] Sub-task: Implement inactivity timer in machine/engine and ensure cleanup in `reset()` and `destroy()` (Green)
  - [x] Sub-task: Refactor & verify core engine test suite coverage >80% (Refactor)

- [x] Task 1.4: Phase 1 Verification & Checkpoint [checkpoint: 06ded43]
  - [x] Sub-task: Run Vitest across `packages/core` ensuring all tests pass with >80% coverage
  - [x] Sub-task: Sync upstream (`git fetch origin main`) and push checkpoint (`git push origin segmented-gestures`)

## Phase 2: Framework Adapters Integration (`packages/react`, `packages/vue`, `packages/svelte`)

- [x] Task 2.1: React Adapter Integration (`packages/react`) (8bac71f)
  - [x] Sub-task: Write component and hook tests for `segmented`, `checkpointTimeoutMs`, `onCheckpoint`, and `data-state="checkpoint"` in `packages/react/tests/` (Red)
  - [x] Sub-task: Implement prop forwarding and state synchronization in `useHeelslide` and `<Heelslide />` (Green)
  - [x] Sub-task: Refactor & verify React adapter test coverage >80% (Refactor)

- [x] Task 2.2: Vue Adapter Integration (`packages/vue`) (415f74b)
  - [x] Sub-task: Write component tests for `segmented` prop and `checkpoint` emit in `packages/vue/tests/` (Red)
  - [x] Sub-task: Implement props, emits, and state synchronization in Vue `<Heelslide />` component (Green)
  - [x] Sub-task: Refactor & verify Vue adapter test coverage >80% (Refactor)

- [~] Task 2.3: Svelte Adapter Integration (`packages/svelte`)
  - [ ] Sub-task: Write component tests for `segmented` and `oncheckpoint` in `packages/svelte/tests/` (Red)
  - [ ] Sub-task: Implement Svelte component prop forwarding and event dispatch (Green)
  - [ ] Sub-task: Refactor & verify Svelte adapter test coverage >80% (Refactor)

- [ ] Task 2.4: Phase 2 Verification & Checkpoint
  - [ ] Sub-task: Run Vitest across all packages (`npm run test`)
  - [ ] Sub-task: Sync upstream (`git fetch origin main`) and push checkpoint (`git push origin segmented-gestures`)

## Phase 3: Documentation Playground & Final Verification

- [ ] Task 3.1: Interactive Playground Configurator (`apps/docs`)
  - [ ] Sub-task: Add "Segmented Mode" toggle and "Checkpoint Timeout" controls to the live demo playground
  - [ ] Sub-task: Add visual cue/styling for `data-state="checkpoint"`
- [ ] Task 3.2: Linting, Type Checking & Build Verification
  - [ ] Sub-task: Run `oxlint` across workspace
  - [ ] Sub-task: Run `tsc --noEmit` across all workspace packages
  - [ ] Sub-task: Run production build across monorepo packages (`npm run build`)
- [ ] Task 3.3: Phase 3 Verification & Track Checkpoint
  - [ ] Sub-task: Verify overall test coverage >80% across all modified packages
  - [ ] Sub-task: Record final phase checkpoint Git Note
  - [ ] Sub-task: Push track branch to remote (`git push origin segmented-gestures`)
