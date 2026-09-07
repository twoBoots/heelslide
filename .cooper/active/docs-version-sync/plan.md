# Implementation Plan: Dynamic Documentation Version & Package Export Synchronization

## Phase 1: Package Version Exports & Resilient Unit Tests
- [ ] Task 1: Update Package Version Exports & Tests
  - [ ] Sub-task: Update `packages/*/tests/index.test.ts` to assert version `0.2.0` (Red)
  - [ ] Sub-task: Update `export const VERSION = '0.2.0'` in `@heelslide/core`, `@heelslide/react`, `@heelslide/vue`, and `@heelslide/svelte` (Green)
  - [ ] Sub-task: Verify tests pass with 100% export coverage (Refactor)
- [ ] Task 2: Phase 1 Verification & Checkpoint
  - [ ] Sub-task: Run Vitest across packages (`npm test --workspace=packages/core --workspace=packages/react --workspace=packages/vue --workspace=packages/svelte`)
  - [ ] Sub-task: Record Git Notes checkpoint

## Phase 2: Documentation Header Dynamic Version & Manifest Sync
- [ ] Task 1: Dynamic Version Badge in Header
  - [ ] Sub-task: Update `apps/docs/tests/App.test.tsx` to assert `.header-badge` displays `v${VERSION}` (Red)
  - [ ] Sub-task: Update `apps/docs/src/components/Header.tsx` to consume `VERSION` from `@heelslide/core` (Green)
  - [ ] Sub-task: Synchronize root `package.json` and `apps/docs/package.json` to `0.2.0` (Refactor)
- [ ] Task 2: Phase 2 Verification & Checkpoint
  - [ ] Sub-task: Run full test suite (`npm test`), lint (`npm run lint`), typecheck (`npm run typecheck`), and docs build (`npm run docs:build`)
  - [ ] Sub-task: Record Git Notes checkpoint

## Phase 3: Living Spec Reconciliation & Review Preparation
- [ ] Task 1: Reconcile Living Capability Specs
  - [ ] Sub-task: Merge spec delta into `.cooper/specs/docs-playground/spec.md`
  - [ ] Sub-task: Mark track completed and ready for PR review
