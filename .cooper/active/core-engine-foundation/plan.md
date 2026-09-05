# Implementation Plan: Monorepo Scaffolding & Core Gesture Engine

Track ID: `core-engine-foundation`

---

## Phase 1: Monorepo Tooling & Workspace Infrastructure

- [x] **Task 1: Root Workspace & Monorepo Tooling** (bf27e72)
  - [x] Sub-task: Create root `package.json` with npm workspaces (`packages/*`, `apps/*`) and root scripts
  - [x] Sub-task: Configure TypeScript root configuration (`tsconfig.base.json`, `tsconfig.json`)
  - [x] Sub-task: Configure Oxc (`.oxlintrc.json`) and formatting verification
- [x] **Task 2: Core Package Skeleton & Vitest Suite** (988bc8c)
  - [x] Sub-task: Initialise `packages/core/package.json` and `packages/core/tsconfig.json`
  - [x] Sub-task: Configure `vitest.config.ts` with >80% coverage threshold
  - [x] Sub-task: Setup Vite build pipeline for ESM/CJS/.d.ts bundling in `packages/core`
- [x] **Task 3: Phase 1 Verification & Checkpoint** (83cdd0c) [checkpoint: 83cdd0c]
  - [x] Sub-task: Execute root lint, typecheck, and test runner
  - [x] Sub-task: Workflow rule sync (`git fetch origin main`)
  - [x] Sub-task: Checkpoint commit & attach Git Note

---

## Phase 2: Geometry & Procedural Rectilinear Path Generator

- [x] **Task 4: 2D Geometry & Projection Helpers** (b18cf30)
  - [x] Sub-task: Unit tests for point distance, segment projection, and angle calculation (Red)
  - [x] Sub-task: Implement `packages/core/src/geometry.ts` (Green)
  - [x] Sub-task: Refactor and verify test coverage >80% (Refactor)
- [x] **Task 5: Procedural Rectilinear Path Generator** (6692e72)
  - [x] Sub-task: Unit tests for fixed heel counts, `[min, max]` range, non-intersection, and PRNG seeds (Red)
  - [x] Sub-task: Implement `packages/core/src/generator.ts` (Green)
  - [x] Sub-task: Refactor and verify test coverage >80% (Refactor)
- [x] **Task 6: Phase 2 Verification & Checkpoint** (1999c68) [checkpoint: 1999c68]
  - [x] Sub-task: Run Vitest test suite and verify >80% coverage across geometry & generator
  - [x] Sub-task: Workflow rule sync (`git fetch origin main`)
  - [x] Sub-task: Checkpoint commit & attach Git Note

---

## Phase 3: Gesture State Machine & Engine Orchestration

- [x] **Task 7: Gesture State Machine** (2fe8575)
  - [x] Sub-task: Unit tests for states (`idle`, `active`, `unlocked`, `reset`) and tolerance checks (Red)
  - [x] Sub-task: Implement `packages/core/src/machine.ts` (Green)
  - [x] Sub-task: Refactor and verify test coverage >80% (Refactor)
- [x] **Task 8: HeelslideEngine Orchestrator & Public API** (5e09f52)
  - [x] Sub-task: Integration tests for gesture tracing, heel navigation, early release, and unlock events (Red)
  - [x] Sub-task: Implement `packages/core/src/engine.ts` and `packages/core/src/index.ts` (Green)
  - [x] Sub-task: Refactor and verify test coverage >80% (Refactor)
- [~] **Task 9: Phase 3 Verification & Track Checkpoint**
  - [ ] Sub-task: Run full workspace lint, typecheck, and Vitest coverage
  - [ ] Sub-task: Build `@heelslide/core` and verify ESM, CJS, and `.d.ts` outputs
  - [ ] Sub-task: Final phase checkpoint commit, Git Note, and push branch
