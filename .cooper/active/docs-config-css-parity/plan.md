# Implementation Plan: Docs Demo Full Configuration & CSS Variable Parity

## Phase 1: Snippet Generator & Theme Models (TDD)
- [ ] Task: Snippet Generator CSS Variable Parity
  - [ ] Sub-task: Write unit tests in `apps/docs/src/utils/generatorSnippet.test.ts` verifying `--heelslide-width`, `--heelslide-height`, border widths, and state colors are formatted into React, Vue, and Svelte snippets (Red)
  - [ ] Sub-task: Update `ThemeConfig`, `formatReactStyles`, and `formatCssDeclarations` in `apps/docs/src/utils/snippets.ts` (Green)
  - [ ] Sub-task: Refactor and verify test coverage >80% (Refactor)
- [ ] Task: Phase 1 Verification & Checkpoint
  - [ ] Sub-task: Run unit tests and attach checkpoint notes

## Phase 2: ConfigPanel & Playground Controls (TDD)
- [ ] Task: ConfigPanel Additional Controls
  - [ ] Sub-task: Add test coverage in `apps/docs/src/components/coverage.test.tsx` for `gridStep`, `margin`, border widths, and state colors (Red)
  - [ ] Sub-task: Implement control inputs in `ConfigPanel.tsx` and wire CSS variables into `Playground.tsx` container styles (Green)
  - [ ] Sub-task: Verify live interactive simulator behavior (Refactor)
- [ ] Task: Phase 2 Verification & Checkpoint
  - [ ] Sub-task: Run test suite and attach checkpoint notes

## Phase 3: On-Page API & CSS Reference Section (TDD)
- [ ] Task: DocsReference Component
  - [ ] Sub-task: Write tests for `DocsReference.tsx` checking rendering of props table and CSS tokens table (Red)
  - [ ] Sub-task: Implement `DocsReference.tsx` with comprehensive tables for all options and CSS custom properties (Green)
  - [ ] Sub-task: Integrate into `App.tsx` and verify layout styling (Refactor)
- [ ] Task: Phase 3 Verification & Checkpoint
  - [ ] Sub-task: Build production bundle (`npm run build` in `apps/docs`) and verify static artifacts

## Phase 4: Track Finalization & Review
- [ ] Task: Final Quality Audit
  - [ ] Sub-task: Run lint, format, typecheck, and full test suite
  - [ ] Sub-task: Sync capability spec `.cooper/specs/docs-playground/spec.md` with approved deltas
  - [ ] Sub-task: Push checkpoint to remote
