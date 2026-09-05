# Implementation Plan: Playwright Visual Regression Testing Suite

## Phase 1: Visual Fixture Harness & Playwright Setup
- [ ] **Task 1: Deterministic Visual Fixture in `apps/docs`**
  - [ ] Sub-task: Write unit tests for `VisualFixture` query parameter parsing and state rendering (Red)
  - [ ] Sub-task: Implement `VisualFixture` component with deterministic seed pinning and animation suppression in `apps/docs` (Green)
  - [ ] Sub-task: Refactor & verify test coverage >80% (Refactor)
- [ ] **Task 2: Playwright Tooling & Workspace Configuration**
  - [ ] Sub-task: Configure `@playwright/test` devDependencies in monorepo root
  - [ ] Sub-task: Create `playwright.config.ts` with desktop/mobile viewports, webServer configuration, and snapshot tolerances
  - [ ] Sub-task: Add `test:visual`, `test:visual:update`, and `test:visual:report` scripts to root `package.json`
- [ ] **Task 3: Phase 1 Verification & Checkpoint**
  - [ ] Sub-task: Run Vitest test suite and typecheck
  - [ ] Sub-task: Workflow rule sync (`git fetch origin main`)
  - [ ] Sub-task: Checkpoint commit & attach Git Note

---

## Phase 2: Visual Regression Specs & Snapshot Baselines
- [ ] **Task 4: Core Lifecycle States Visual Regression Specs**
  - [ ] Sub-task: Write Playwright visual test specs for idle, active, unlocked, and disabled states (Red)
  - [ ] Sub-task: Generate initial baseline snapshots across desktop (Chromium, Firefox) and mobile (WebKit) viewports (Green)
  - [ ] Sub-task: Refactor visual test helpers and verify snapshot comparison assertions (Refactor)
- [ ] **Task 5: Heel Geometry & CSS Custom Property Theming Specs**
  - [ ] Sub-task: Write Playwright visual test specs for 1-heel, 2-heel, 4-heel configurations and `--heelslide-*` CSS overrides (Red)
  - [ ] Sub-task: Generate baseline snapshots for path geometries and custom color palettes (Green)
  - [ ] Sub-task: Refactor & verify visual test execution stability (Refactor)
- [ ] **Task 6: Phase 2 Verification & Checkpoint**
  - [ ] Sub-task: Run full visual regression suite (`npm run test:visual`)
  - [ ] Sub-task: Workflow rule sync (`git fetch origin main`)
  - [ ] Sub-task: Checkpoint commit & attach Git Note

---

## Phase 3: CI Workflow Integration & Quality Gates
- [ ] **Task 7: GitHub Actions CI Integration & Artifact Reporting**
  - [ ] Sub-task: Update `.github/workflows/ci.yml` Playwright execution step and failure artifact upload
  - [ ] Sub-task: Execute end-to-end verification pipeline (`npm run lint`, `npm run typecheck`, `npm run test:coverage`, `npm run test:visual`)
- [ ] **Task 8: Phase 3 Verification & Track Finalization**
  - [ ] Sub-task: Complete track metadata and update tracks registry
  - [ ] Sub-task: Final checkpoint commit, Git Note, and remote push (`git push origin visual-regression-testing`)
  - [ ] Sub-task: Open GitHub Pull Request
