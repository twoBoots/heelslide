# Implementation Plan: Dynamic Documentation Version & Package Export Synchronization

## Phase 1: Package Version Exports & Resilient Unit Tests
- [x] Task 1: Update Package Version Exports & Tests (550f8b7)
  - [x] Sub-task: Update `packages/*/tests/index.test.ts` to assert version `0.2.0` (Red)
  - [x] Sub-task: Update `export const VERSION = '0.2.0'` in `@heelslide/core`, `@heelslide/react`, `@heelslide/vue`, and `@heelslide/svelte` (Green)
  - [x] Sub-task: Verify tests pass with 100% export coverage (Refactor)
- [x] Task 2: Phase 1 Verification & Checkpoint (550f8b7)
  - [x] Sub-task: Run Vitest across packages (`npm test --workspace=packages/core --workspace=packages/react --workspace=packages/vue --workspace=packages/svelte`)
  - [x] Sub-task: Record Git Notes checkpoint

## Phase 2: Documentation Header Dynamic Version & Manifest Sync
- [x] Task 1: Dynamic Version Badge in Header (9634bf4)
  - [x] Sub-task: Update `apps/docs/tests/App.test.tsx` to assert `.header-badge` displays `v${VERSION}` (Red)
  - [x] Sub-task: Update `apps/docs/src/components/Header.tsx` to consume `VERSION` from `@heelslide/core` (Green)
  - [x] Sub-task: Synchronize root `package.json` and `apps/docs/package.json` to `0.2.0` (Refactor)
- [x] Task 2: Phase 2 Verification & Checkpoint (9634bf4)
  - [x] Sub-task: Run full test suite (`npm test`), lint (`npm run lint`), typecheck (`npm run typecheck`), and docs build (`npm run docs:build`)
  - [x] Sub-task: Record Git Notes checkpoint

## Phase 3: Playground Expanded CSS Variable Controls & Presets
- [x] Task 1: ThemeConfig Interface & Snippet Generator Expansion
  - [x] Sub-task: Add unit tests in `apps/docs/tests/generatorSnippet.test.ts` for geometry variables and new color pickers (Red)
  - [x] Sub-task: Expand `ThemeConfig` and generator helpers in `apps/docs/src/utils/snippets.ts` (Green)
  - [x] Sub-task: Update `apps/docs/src/components/Playground.tsx` with CSS property bindings (Green)
- [x] Task 2: ConfigPanel Sliders, Color Pickers & App Defaults
  - [x] Sub-task: Add tests in `apps/docs/tests/App.test.tsx` verifying geometry sliders and theme updates (Red)
  - [x] Sub-task: Implement sliders and color pickers in `apps/docs/src/components/ConfigPanel.tsx` (Green)
  - [x] Sub-task: Update `apps/docs/src/App.tsx` default theme config with full preset parity (Green)
- [x] Task 3: Phase 3 Verification & Checkpoint
  - [x] Sub-task: Run Vitest, ESLint, TypeScript check, and static docs build
  - [x] Sub-task: Record Git Notes checkpoint

## Phase 4: Living Spec Reconciliation & Review Preparation
- [x] Task 1: Reconcile Living Capability Specs & Review Readiness
  - [x] Sub-task: Merge spec delta into `.cooper/specs/docs-playground/spec.md`
  - [x] Sub-task: Mark track completed and ready for PR review

