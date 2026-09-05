# Implementation Plan: React Component Adapter & Headless Hook

Track ID: `react-component`

---

## Phase 1: Package Scaffolding & Tooling Infrastructure

- [x] **Task 1: Package Structure & Build Configuration** (d20c432)
  - [x] Sub-task: Create `packages/react/package.json` with `@heelslide/core` workspace dependency and `react` / `react-dom` peerDependencies
  - [x] Sub-task: Configure `packages/react/tsconfig.json` and update root references
  - [x] Sub-task: Setup `packages/react/vite.config.ts` for library mode bundling ESM, CJS, and `.d.ts`
- [x] **Task 2: Phase 1 Verification & Checkpoint** (a32d4cb) [checkpoint: a32d4cb]
  - [x] Sub-task: Verify workspace setup, typecheck, and build
  - [x] Sub-task: Workflow rule sync (`git fetch origin main`)
  - [x] Sub-task: Checkpoint commit & attach Git Note

---

## Phase 2: Headless Hook (`useHeelslide`)

- [x] **Task 3: Headless Hook Implementation** (d0eebe0)
  - [x] Sub-task: Unit tests for `useHeelslide` lifecycle, reactive states, and pointer handlers (Red)
  - [x] Sub-task: Implement `packages/react/src/useHeelslide.ts` and `packages/react/src/types.ts` (Green)
  - [x] Sub-task: Refactor & verify coverage >80% (Refactor)
- [x] **Task 4: Phase 2 Verification & Checkpoint** (933d0ee) [checkpoint: 933d0ee]
  - [x] Sub-task: Run Vitest test suite and verify hook coverage
  - [x] Sub-task: Workflow rule sync (`git fetch origin main`)
  - [x] Sub-task: Checkpoint commit & attach Git Note

---

## Phase 3: Presentation Component (`<Heelslide />`) & SVG Rendering

- [~] **Task 5: Presentation Component Implementation**
  - [ ] Sub-task: Component tests for SVG rendering, pointer capture, CSS vars, and forwardRef (Red)
  - [ ] Sub-task: Implement `packages/react/src/Heelslide.tsx` with procedural SVG and CSS vars (Green)
  - [ ] Sub-task: Refactor & verify coverage >80% (Refactor)
- [ ] **Task 6: Phase 3 Verification & Checkpoint**
  - [ ] Sub-task: Run full Vitest suite with >80% coverage on statements, branches, and functions
  - [ ] Sub-task: Workflow rule sync (`git fetch origin main`)
  - [ ] Sub-task: Checkpoint commit & attach Git Note

---

## Phase 4: Integration, Build, and Review

- [ ] **Task 7: Export Barrel & Full Workspace Verification**
  - [ ] Sub-task: Configure `packages/react/src/index.ts` public exports
  - [ ] Sub-task: Run full workspace build, typecheck (`tsc -b`), and lint (`oxlint .`)
  - [ ] Sub-task: Verify emitted ESM, CJS, and `.d.ts` bundles in `packages/react/dist/`
- [ ] **Task 8: Phase 4 Verification & Track Finalization**
  - [ ] Sub-task: Run full workspace validation
  - [ ] Sub-task: Final phase checkpoint commit, Git Note, and push branch
