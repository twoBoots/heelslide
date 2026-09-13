# Tracks Registry

All active and completed Cooper tracks are registered below.

---

## Active Tracks
- [x] **Track: Temporarily Disable npm Publishing in Release Workflow**
  - Worktree: `.worktrees/disable-npm-release`
- [ ] **Track: Docs Demo Full Configuration & CSS Variable Parity**
  - Worktree: `.worktrees/docs-config-css-parity`
  - Link: [.cooper/active/docs-config-css-parity/index.md](.cooper/active/docs-config-css-parity/index.md)
- [ ] **Track: Whole-Project Audit Remediation**
  - Worktree: `.worktrees/audit-remediation`
  - Link: [.cooper/active/audit-remediation/index.md](.cooper/active/audit-remediation/index.md)
- [ ] **Track: Accessibility & Keyboard Navigation Fallback**
  - Worktree: _(not provisioned; branch `accessibility-fallback` only)_
  - PR: [#9](https://github.com/twoBoots/heelslide/pull/9) — open, awaiting review
  - Spec deltas live on the branch at `.cooper/active/accessibility-fallback/spec-deltas/`

## Completed Archive
- [x] **Track: Dynamic Documentation Version & Package Export Synchronization**
  - Completed: 2026-09-07 (PR #16)
  - Archive: [.cooper/archive/docs-version-sync/index.md](.cooper/archive/docs-version-sync/index.md)
- [x] **Track: Expanded CSS Custom Properties, Heel Theming & Svelte/Vue/React Parity**
  - Completed: 2026-09-07 (PR #14)
  - Archive: [.cooper/archive/expand-css-variables/index.md](.cooper/archive/expand-css-variables/index.md)
- [x] **Track: Segmented Multi-Gesture Checkpoints**
  - Completed: 2026-09-07 (PR #13)
  - Archive: [.cooper/archive/segmented-gestures/index.md](.cooper/archive/segmented-gestures/index.md)
- [x] **Track: Type Export Parity & Self-Contained Component Declarations**
  - Completed: 2026-09-06 (PR #12)
  - Archive: [.cooper/archive/type-exports-parity/index.md](.cooper/archive/type-exports-parity/index.md)
- [x] **Track: Automated SemVer Release Pipeline & Package Publishing**
  - Completed: 2026-09-06 (PR #11)
  - Archive: [.cooper/archive/automated-release-pipeline/index.md](.cooper/archive/automated-release-pipeline/index.md)
- [x] **Track: Playwright CI Browser Caching & Job Parallelization**
  - Completed: 2026-09-06 (PR #10)
  - Archive: [.cooper/archive/playwright-ci-cache/index.md](.cooper/archive/playwright-ci-cache/index.md)
- [x] **Track: Playwright Visual Regression Testing Suite**
  - Completed: 2026-09-06 (PR #8)
  - Archive: [.cooper/archive/visual-regression-testing/index.md](.cooper/archive/visual-regression-testing/index.md)
- [x] **Track: Svelte 5 Component Adapter**
  - Completed: 2026-09-06 (PR #7)
  - Archive: [.cooper/archive/svelte-adapter/index.md](.cooper/archive/svelte-adapter/index.md)
- [x] **Track: Haptic & Audio Feedback System**
  - Completed: 2026-09-06 (PR #6)
  - Archive: [.cooper/archive/haptic-audio-feedback/index.md](.cooper/archive/haptic-audio-feedback/index.md)
- [x] **Track: Interactive Documentation & Demo Playground**
  - Completed: 2026-09-05 (PR #5)
  - Archive: [.cooper/archive/docs-playground/index.md](.cooper/archive/docs-playground/index.md)
- [x] **Track: Vue 3 Component & Composable Adapter**
  - Completed: 2026-09-05 (PR #4)
  - Archive: [.cooper/archive/vue-component/index.md](.cooper/archive/vue-component/index.md)
- [x] **Track: React Component Adapter & Headless Hook**
  - Completed: 2026-09-05 (PR #3)
  - Archive: [.cooper/archive/react-component/index.md](.cooper/archive/react-component/index.md)
- [x] **Track: Monorepo Scaffolding & Core Gesture Engine**
  - Completed: 2026-09-05 (PR #2)
  - Archive: [.cooper/archive/core-engine-foundation/index.md](.cooper/archive/core-engine-foundation/index.md)

---

## Registry Notes

Living capability specifications under `.cooper/specs/` are the merged product of every archived
track's spec deltas. The `release-pipeline` capability spec was promoted during the
`audit-remediation` track: its delta merged with PR #11 but was never written to `.cooper/specs/`,
leaving the release capability with no living specification.

Stale worktrees for merged tracks should be torn down with `git agent-stop <track_id>`.
