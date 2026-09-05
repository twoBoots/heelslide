# Implementation Plan: Monorepo Scaffolding & Core Gesture Engine

Track ID: `core-engine-foundation`

---

## Phase 1: Monorepo Tooling & Workspace Infrastructure

- [x] **Task 1: Root Workspace & Monorepo Tooling** (bf27e72)
  - [x] Sub-task: Create root `package.json` with npm workspaces (`packages/*`, `apps/*`) and root scripts
  - [x] Sub-task: Configure TypeScript root configuration (`tsconfig.base.json`, `tsconfig.json`)
  - [x] Sub-task: Configure Oxc (`.oxlintrc.json`) and formatting verification
- [ ] **Task 2: Core Package Skeleton & Vitest Suite**
  - [ ] Sub-task: Initialise `packages/core/package.json` and `packages/core/tsconfig.json`
  - [ ] Sub-task: Configure `vitest.config.ts` with >80% coverage threshold
  - [ ] Sub-task: Setup Vite build pipeline for ESM/CJS/.d.ts bundling in `packages/core`
- [ ] **Task 3: Phase 1 Verification & Checkpoint**
  - [ ] Sub-task: Execute root lint, typecheck, and test runner
  - [ ] Sub-task: Workflow rule sync (`git fetch origin main`)
  - [ ] Sub-task: Checkpoint commit & attach Git Note

---

## Phase 2: Geometry & Procedural Rectilinear Path Generator

- [ ] **Task 4: 2D Geometry & Projection Helpers**
  - [ ] Sub-task: Unit tests for point distance, segment projection, and angle calculation (Red)
  - [ ] Sub-task: Implement `packages/core/src/geometry.ts` (Green)
  - [ ] Sub-task: Refactor and verify test coverage >80% (Refactor)
- [ ] **Task 5: Procedural Rectilinear Path Generator**
  - [ ] Sub-task: Unit tests for fixed heel counts, `[min, max]` range, non-intersection, and PRNG seeds (Red)
  - [ ] Sub-task: Implement `packages/core/src/generator.ts` (Green)
  - [ ] Sub-task: Refactor and verify test coverage >80% (Refactor)
- [ ] **Task 6: Phase 2 Verification & Checkpoint**
  - [ ] Sub-task: Run Vitest test suite and verify >80% coverage across geometry & generator
  - [ ] Sub-task: Workflow rule sync (`git fetch origin main`)
  - [ ] Sub-task: Checkpoint commit & attach Git Note

---

## Phase 3: Gesture State Machine & Engine Orchestration

- [ ] **Task 7: Gesture State Machine**
  - [ ] Sub-task: Unit tests for states (`idle`, `active`, `unlocked`, `reset`) and tolerance checks (Red)
  - [ ] Sub-task: Implement `packages/core/src/machine.ts` (Green)
  - [ ] Sub-task: Refactor and verify test coverage >80% (Refactor)
- [ ] **Task 8: HeelslideEngine Orchestrator & Public API**
  - [ ] Sub-task: Integration tests for gesture tracing, heel navigation, early release, and unlock events (Red)
  - [ ] Sub-task: Implement `packages/core/src/engine.ts` and `packages/core/src/index.ts` (Green)
  - [ ] Sub-task: Refactor and verify test coverage >80% (Refactor)
- [ ] **Task 9: Phase 3 Verification & Track Checkpoint**
  - [ ] Sub-task: Run full workspace lint, typecheck, and Vitest coverage
  - [ ] Sub-task: Build `@heelslide/core` and verify ESM, CJS, and `.d.ts` outputs
  - [ ] Sub-task: Final phase checkpoint commit, Git Note, and push branch
