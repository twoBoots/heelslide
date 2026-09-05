# Implementation Plan: Interactive Documentation & Demo Playground

## Phase 1: Workspace Scaffolding & Tooling Setup
- [x] **Task 1: Apps Workspace Configuration** (f69fb77)
  - [x] Sub-task: Create `apps/docs/package.json` with `@heelslide/core` and `@heelslide/react` dependencies
  - [x] Sub-task: Configure `apps/docs/tsconfig.json` and root `tsconfig.json` references
  - [x] Sub-task: Configure `apps/docs/vite.config.ts` and `apps/docs/index.html`
- [x] **Task 2: Phase 1 Verification & Checkpoint** (055cdd2) [checkpoint: 055cdd2]
  - [x] Sub-task: Verify workspace dependency resolution and build command
  - [x] Sub-task: Workflow rule sync (`git fetch origin main`)
  - [x] Sub-task: Checkpoint commit & attach Git Note

---

## Phase 2: Interactive Playground & Configurator UI
- [ ] **Task 3: Live Configurator & Dynamic Preview**
  - [ ] Sub-task: Write unit tests for playground state management and snippet generation (Red)
  - [ ] Sub-task: Implement `Playground`, `ConfigPanel`, and `SimulationCard` (Green)
  - [ ] Sub-task: Refactor & verify test coverage >80% (Refactor)
- [ ] **Task 4: Framework Tabs & Code Generator**
  - [ ] Sub-task: Write component tests for `FrameworkTabs` and code generator (Red)
  - [ ] Sub-task: Implement dynamic code snippets for Vanilla, React, and Vue (Green)
  - [ ] Sub-task: Refactor & verify test coverage >80% (Refactor)
- [ ] **Task 5: Phase 2 Verification & Checkpoint**
  - [ ] Sub-task: Run Vitest test suite and typecheck
  - [ ] Sub-task: Workflow rule sync (`git fetch origin main`)
  - [ ] Sub-task: Checkpoint commit & attach Git Note

---

## Phase 3: Integration, GitHub Pages Build & Quality Gates
- [ ] **Task 6: Static Deployment & Full Build Verification**
  - [ ] Sub-task: Build `apps/docs` for production and verify output in `apps/docs/dist/`
  - [ ] Sub-task: Run full workspace test suite (`vitest run --coverage >80%`), `tsc -b`, and `oxlint .`
  - [ ] Sub-task: Verify asset URLs and GitHub Pages subpath compatibility
- [ ] **Task 7: Phase 3 Verification & Track Finalization**
  - [ ] Sub-task: Complete track metadata and tracks registry
  - [ ] Sub-task: Final checkpoint commit, Git Note, and remote push
  - [ ] Sub-task: Open GitHub Pull Request
