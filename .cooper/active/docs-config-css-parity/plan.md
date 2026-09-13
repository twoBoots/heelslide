# Implementation Plan: Docs Demo Full Configuration & CSS Variable Parity

## Phase 1: Snippet Generator & Theme Models (TDD)
- [x] Task: Snippet Generator CSS Variable Parity (297f569)
  - [x] Sub-task: Write unit tests in `apps/docs/src/utils/generatorSnippet.test.ts` verifying `--heelslide-width`, `--heelslide-height`, border widths, and state colors are formatted into React, Vue, and Svelte snippets (Red)
  - [x] Sub-task: Update `ThemeConfig`, `formatReactStyles`, and `formatCssDeclarations` in `apps/docs/src/utils/snippets.ts` (Green)
  - [x] Sub-task: Refactor and verify test coverage >80% (Refactor)
- [x] Task: Phase 1 Verification & Checkpoint [checkpoint: f2456b1]
  - [x] Sub-task: Run unit tests and attach checkpoint notes

## Phase 2: ConfigPanel & Playground Controls (TDD)
- [x] Task: ConfigPanel Additional Controls (92f0e9f)
  - [x] Sub-task: Add test coverage in `apps/docs/src/components/coverage.test.tsx` for `gridStep`, `margin`, border widths, and state colors (Red)
  - [x] Sub-task: Implement control inputs in `ConfigPanel.tsx` and wire CSS variables into `Playground.tsx` container styles (Green)
  - [x] Sub-task: Verify live interactive simulator behavior (Refactor)
- [x] Task: Phase 2 Verification & Checkpoint [checkpoint: 028fa0d]
  - [x] Sub-task: Run test suite and attach checkpoint notes

## Phase 3: On-Page API & CSS Reference Section (TDD)
- [x] Task: DocsReference Component (4ee3d45)
  - [x] Sub-task: Write tests for `DocsReference.tsx` checking rendering of props table and CSS tokens table (Red)
  - [x] Sub-task: Implement `DocsReference.tsx` with comprehensive tables for all options and CSS custom properties (Green)
  - [x] Sub-task: Integrate into `App.tsx` and verify layout styling (Refactor)
- [ ] Task: Phase 3 Verification & Checkpoint
  - [ ] Sub-task: Build production bundle (`npm run build` in `apps/docs`) and verify static artifacts

## Phase 4: Track Finalization & Review
- [ ] Task: Final Quality Audit
  - [ ] Sub-task: Run lint, format, typecheck, and full test suite
  - [ ] Sub-task: Sync capability spec `.cooper/specs/docs-playground/spec.md` with approved deltas
  - [ ] Sub-task: Push checkpoint to remote
