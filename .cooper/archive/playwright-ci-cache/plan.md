# Implementation Plan: Playwright CI Browser Caching & Job Parallelization

Track ID: `playwright-ci-cache`
Status: `in_progress`

## Phase 1: CI Workflow Decomposition & Parallelization
- [x] Task 1: Living Capability Spec & Spec Delta Verification (4f9288c)
  - [x] Sub-task: Verify living capability spec `.cooper/specs/ci-pipeline/spec.md`
  - [x] Sub-task: Verify spec delta `.cooper/active/playwright-ci-cache/spec-deltas/ci-pipeline/spec.md`
- [x] Task 2: Separate `validate` Job (070a51c)
  - [x] Sub-task: Remove Playwright visual steps and report upload from `validate` job
  - [x] Sub-task: Verify `validate` job focuses purely on lint, typecheck, build, and Vitest coverage
- [x] Task 3: Implement Dedicated `visual-regression` Job with Caching (d1e7d15)
  - [x] Sub-task: Add `visual-regression` parallel job definition in `.github/workflows/ci.yml`
  - [x] Sub-task: Configure Node 24 setup with npm cache and dependencies installation
  - [x] Sub-task: Implement Playwright version resolution step
  - [x] Sub-task: Implement `actions/cache@v4` on `~/.cache/ms-playwright` keyed by OS and version
  - [x] Sub-task: Implement OS dependency installation (`npx playwright install-deps`) and conditional browser installation
  - [x] Sub-task: Add workspace build, `test:visual` execution, and failure artifact upload
- [x] Task 4: Phase 1 Verification & Checkpoint (c03e07d)
  - [x] Sub-task: Validate workflow YAML syntax and run local visual tests and builds
  - [x] Sub-task: Synchronize rules with `git fetch origin main`
  - [x] Sub-task: Create checkpoint commit and attach verification report via `git notes`
  - [x] Sub-task: Push checkpoint to remote with `git push origin playwright-ci-cache`
