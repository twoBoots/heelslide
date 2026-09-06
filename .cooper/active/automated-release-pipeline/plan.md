# Implementation Plan: Automated SemVer Release Pipeline & Package Publishing

Track ID: `automated-release-pipeline`
Status: `in_progress`

## Phase 1: Tooling Scaffolding, Package Manifests & Configuration
- [x] Task 1: Living Capability Spec & Spec Delta Verification (b76e161)
  - [x] Sub-task: Verify living capability specs and spec delta `.cooper/active/automated-release-pipeline/spec-deltas/release-pipeline/spec.md`
- [ ] Task 2: Release Configuration Validation Tests (Red)
  - [ ] Sub-task: Write unit test suite `tests/release-pipeline.test.ts` verifying Changesets config schema, public package manifests, and root release scripts (Red)
- [ ] Task 3: Changesets Setup, Configuration & Package Manifest Updates (Green & Refactor)
  - [ ] Sub-task: Install `@changesets/cli` and configure `.changeset/config.json` with fixed grouping for all public packages (`@heelslide/core`, `@heelslide/react`, `@heelslide/svelte`, `@heelslide/vue`) and ignore `@heelslide/docs`
  - [ ] Sub-task: Add `publishConfig: { "access": "public" }` across all public package manifests
  - [ ] Sub-task: Add `changeset`, `version-packages`, and `release` scripts to root `package.json`
  - [ ] Sub-task: Run `tests/release-pipeline.test.ts` and verify all tests pass (Green) and refactor (Refactor)
- [ ] Task 4: Phase 1 Verification & Checkpoint
  - [ ] Sub-task: Run workspace quality gates (lint, typecheck, tests)
  - [ ] Sub-task: Synchronize rules with `git fetch origin main`
  - [ ] Sub-task: Record checkpoint commit and attach verification report via `git notes`
  - [ ] Sub-task: Push checkpoint to remote with `git push origin automated-release-pipeline`

## Phase 2: Workflow Automation, Tarball Bundling & Initial Release Changeset
- [ ] Task 1: GitHub Actions Release Workflow Modernization
  - [ ] Sub-task: Update `.github/workflows/release.yml` with Changesets publication using `NODE_AUTH_TOKEN` and `GITHUB_TOKEN`
  - [ ] Sub-task: Add step to pack `.tgz` tarballs (`npm pack`) for all public workspaces
  - [ ] Sub-task: Add step to create/update GitHub Releases with changelog notes and upload `.tgz` archive assets
- [ ] Task 2: Initial Release Changeset Generation & Packaging Verification
  - [ ] Sub-task: Generate initial changeset for `@heelslide/core`, `@heelslide/react`, `@heelslide/svelte`, `@heelslide/vue`
  - [ ] Sub-task: Verify `npm run build` and `npm pack --dry-run` across all workspaces to guarantee packaging integrity
  - [ ] Sub-task: Verify `npx changeset status` detects the pending release
- [ ] Task 3: Phase 2 Verification & Track Finalization
  - [ ] Sub-task: Run full workspace CI suite locally (`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`)
  - [ ] Sub-task: Synchronize rules with `git fetch origin main`
  - [ ] Sub-task: Create final checkpoint commit and attach report via `git notes`
  - [ ] Sub-task: Push branch to `origin automated-release-pipeline`
