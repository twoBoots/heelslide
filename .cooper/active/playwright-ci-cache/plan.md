# Implementation Plan: Playwright CI Browser Caching & Job Parallelization

Track ID: `playwright-ci-cache`
Status: `in_progress`

## Phase 1: CI Workflow Decomposition & Parallelization
- [~] Task 1: Living Capability Spec & Spec Delta Verification
  - [ ] Sub-task: Verify living capability spec `.cooper/specs/ci-pipeline/spec.md`
  - [ ] Sub-task: Verify spec delta `.cooper/active/playwright-ci-cache/spec-deltas/ci-pipeline/spec.md`
- [ ] Task 2: Separate `validate` Job
  - [ ] Sub-task: Remove Playwright visual steps and report upload from `validate` job
  - [ ] Sub-task: Verify `validate` job focuses purely on lint, typecheck, build, and Vitest coverage
- [ ] Task 3: Implement Dedicated `visual-regression` Job with Caching
  - [ ] Sub-task: Add `visual-regression` parallel job definition in `.github/workflows/ci.yml`
  - [ ] Sub-task: Configure Node 24 setup with npm cache and dependencies installation
  - [ ] Sub-task: Implement Playwright version resolution step
  - [ ] Sub-task: Implement `actions/cache@v4` on `~/.cache/ms-playwright` keyed by OS and version
  - [ ] Sub-task: Implement OS dependency installation (`npx playwright install-deps`) and conditional browser installation
  - [ ] Sub-task: Add workspace build, `test:visual` execution, and failure artifact upload
- [ ] Task 4: Phase 1 Verification & Checkpoint
  - [ ] Sub-task: Validate workflow YAML syntax and run local visual tests and builds
  - [ ] Sub-task: Synchronize rules with `git fetch origin main`
  - [ ] Sub-task: Create checkpoint commit and attach verification report via `git notes`
  - [ ] Sub-task: Push checkpoint to remote with `git push origin playwright-ci-cache`
