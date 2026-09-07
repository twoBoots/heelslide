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

## Phase 3: Living Spec Reconciliation & Review Preparation
- [x] Task 1: Reconcile Living Capability Specs (pending commit)
  - [x] Sub-task: Merge spec delta into `.cooper/specs/docs-playground/spec.md`
  - [x] Sub-task: Mark track completed and ready for PR review
