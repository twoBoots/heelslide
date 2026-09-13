# Plan: Temporarily Disable npm Publishing in Release Workflow

## Phase 1: Test & Workflow Configuration
- [ ] Task: Release Workflow Publishing Assertion (Red)
  - [ ] Sub-task: Add test to `tests/release-pipeline.test.ts` asserting npm publish is disabled in `.github/workflows/release.yml`
  - [ ] Sub-task: Verify test failure (Red)
- [ ] Task: Disable npm Publish in Release Workflow (Green)
  - [ ] Sub-task: Comment out `publish: npm run release` in `.github/workflows/release.yml`
  - [ ] Sub-task: Verify test suite passes (Green)
- [ ] Task: Phase 1 Verification & Checkpoint
  - [ ] Sub-task: Run full test suite (`npm test`)
  - [ ] Sub-task: Run linter (`npm run lint`)
  - [ ] Sub-task: Confirm working tree status
