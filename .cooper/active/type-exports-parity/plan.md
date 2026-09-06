# Implementation Plan: Type Export Parity & Self-Contained Component Declarations

Track ID: `type-exports-parity`
Status: `in_progress`

## Phase 1: Consumer Type Smoke Tests & Core Type Re-exports
- [x] Task 1: Living Capability Specs & Spec Deltas Verification (8a09a62)
  - [x] Sub-task: Verify living capability specs and spec deltas for `react-adapter`, `vue-adapter`, and `svelte-adapter`
- [x] Task 2: Consumer Type Smoke Test Suite (Red) (b6dbdd1)
  - [x] Sub-task: Author `tests/consumer-types.test.ts` verifying external consumer typecheck against built packages without ambient module shims (Red)
- [x] Task 3: Core Type Re-Exports in React & Svelte (Green & Refactor) (5275255)
  - [x] Sub-task: Re-export `Bounds` and `Direction` in `packages/react/src/index.ts`
  - [x] Sub-task: Re-export `Bounds`, `Direction`, `Segment`, and `ProjectedPoint` in `packages/svelte/src/types.ts`
  - [x] Sub-task: Run unit tests and verify re-exported types are accessible
- [x] Task 4: Phase 1 Verification & Checkpoint (02c0221)
  - [x] Sub-task: Verify workspace quality gates
  - [x] Sub-task: Synchronize rules with `git fetch origin main`
  - [x] Sub-task: Record checkpoint commit and attach verification report via `git notes`
  - [x] Sub-task: Push checkpoint to remote with `git push origin type-exports-parity`

## Phase 2: Standalone Component Declarations & Consumer Verification
- [x] Task 1: Vue Component Explicit Typing (7955edd)
  - [x] Sub-task: Explicitly type `Heelslide` in `packages/vue/src/index.ts` as `DefineComponent<HeelslideProps, ..., HeelslideEmits>`
- [ ] Task 2: Svelte Component Explicit Typing
  - [ ] Sub-task: Explicitly type `Heelslide` in `packages/svelte/src/index.ts` as `Component<HeelslideProps>`
- [ ] Task 3: Package Builds & Consumer Smoke Test Verification (Green & Refactor)
  - [ ] Sub-task: Rebuild all packages (`npm run build`)
  - [ ] Sub-task: Run `tests/consumer-types.test.ts` and verify 0 typecheck diagnostics
- [ ] Task 4: Phase 2 Verification & Track Finalization
  - [ ] Sub-task: Run full workspace CI suite locally (`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`)
  - [ ] Sub-task: Synchronize rules with `git fetch origin main`
  - [ ] Sub-task: Create final checkpoint commit and attach report via `git notes`
  - [ ] Sub-task: Push branch to `origin type-exports-parity`
