# Implementation Plan: Accessibility & Keyboard Navigation

**Track ID:** `accessibility-keyboard-nav`
**Worktree:** `.worktrees/accessibility-keyboard-nav`
**Base:** `main` @ `e2a335c`

TDD is mandatory: every implementation sub-task is preceded by a failing test (Red), made to pass
(Green), then cleaned up with coverage verified (Refactor). Per-file coverage thresholds
(>80% line, branch, function) are enforced by `coverage.thresholds.perFile`, so no module may
free-ride on aggregate coverage.

---

## Phase 0: Harvest & Baseline

- [x] Task: Recover artifacts from the superseded `accessibility-fallback` branch (cab0d30)
  - [x] Sub-task: Extract `packages/core/src/accessibility.ts` from `origin/accessibility-fallback`, without merging the branch — quarantined as `harvest/accessibility.ts.ref` rather than placed in `packages/`, so Phase 1 implements under TDD instead of landing code ahead of its Red phase
  - [x] Sub-task: Extract `core/tests/accessibility.test.ts`, `core/tests/announcements.test.ts`, and `vue/tests/HeelslideAccessibility.test.ts` as test source material
  - [x] Sub-task: Audit every harvested assertion against current `main` — 23 of 36 kept, 1 rewritten, 3 discarded; see `harvest/AUDIT.md`
  - [x] Sub-task: Record in `git notes` which harvested assertions were kept, rewritten, or discarded, and why
  - [x] Sub-task (unplanned): Correct `design.md` and the `gesture-engine` delta for the unlock-parity defect the audit surfaced
- [x] Task: Establish the accessibility baseline (267c3f4)
  - [x] Sub-task: Write a failing test asserting each adapter's slider is keyboard-focusable and responds to `ArrowRight` (Red — 5 failing, 3 passing; documents the live SC 2.1.1 defect on `main`)
  - [x] Sub-task: Confirm the full existing suite is green on the untouched base — 279 passed, 0 failed
  - [x] Sub-task (unplanned): Rewrite specs to locate the widget by `[role="slider"]` rather than a hardcoded container, after the baseline revealed the adapters disagree on placement
  - [x] Sub-task (unplanned): Resolve the placement divergence and record the focus-visible defect (25045ce)
- [x] Task: Phase 0 Verification & Checkpoint [checkpoint: df33a4b]
  - [x] Sub-task: `git fetch origin main` to sync workflow rules and living specs — no upstream drift
  - [x] Sub-task: `CI=true npm test` — 282 passed, 5 intentional Red; `tsc -b` and `oxlint` clean
  - [x] Sub-task: `git notes add -m` phase summary; `git push origin accessibility-keyboard-nav`

---

## Phase 1: Core Accessible Stepping & Semantics

- [x] Task: Accessible types and step generation (75d103d)
  - [x] Sub-task: Write unit tests for `getAccessibleSteps()` — one entry per `track.segments` element, correct direction, endpoints, and `progressAtEnd` (Red)
  - [x] Sub-task: Write unit tests for `getAccessibleDescription()` across 0-turn, 1-turn, and 2-turn paths (Red)
  - [x] Sub-task: Implement `AccessibleStep` and `StepDirection` in `types.ts` and the generators in `accessibility.ts` (Green) — announcement types deferred to Task 3 so they land with their own tests rather than ahead of them
  - [x] Sub-task: Export from `index.ts`; `tsc -b`, `oxlint` and coverage clean (Refactor) — 100% on `accessibility.ts`
- [x] Task: Discrete stepping on the engine (68fcc83)
  - [x] Sub-task: Write unit tests for `stepForward` / `stepBackward` — within-segment advance, crossing a heel vertex, multi-segment traversal, flooring at 0 (Red)
  - [x] Sub-task: Write unit tests asserting stepping NEVER unlocks on its own, and that confirm unlocks only via `end()` under the conjunctive final-segment condition — including the `[100,100,5]` regression case from audit commit `6c8c6fb` (Red)
  - [x] Sub-task: Write a unit test asserting no API exists to jump straight to the destination (Red)
  - [x] Sub-task: Write unit tests for `stepToNextHeel()` landing exactly on the terminating vertex (Red)
  - [x] Sub-task: Implement stepping against the existing `accumulatedDistance / totalLength` model, reusing the pointer progress path rather than duplicating it (Green) — position derives from `progress`, so there is no second source of truth
  - [x] Sub-task: Refactor shared distance arithmetic out of the pointer and stepping paths; verify per-file coverage >80% (Refactor) — `machine.ts` branches 82.35%, `engine.ts` 96.96%
- [x] Task: Announcement lifecycle (75ead3e)
  - [x] Sub-task: Write unit tests for `onAnnouncement` firing on start, step, heel_reached, unlock, reset, with correct type, progress, and timestamp (Red) — `checkpoint` emission deferred to Phase 2, where stepping drives segmented transitions; its message builder is unit-tested here
  - [x] Sub-task: Write unit tests for `announceMessages` overrides and for `accessible.enabled: false` suppressing all announcements (Red)
  - [x] Sub-task: Implement announcement emission and override resolution (Green) — reset announces from `resetState`, not `triggerReset`, so the programmatic `Home` path is narrated too
  - [x] Sub-task: Export the new surface from `packages/core/src/index.ts` and verify `tsc -b` (Refactor)
- [x] Task: Phase 1 Verification & Checkpoint [checkpoint: 3a3df93]
  - [x] Sub-task: `git fetch origin main` — no upstream drift
  - [x] Sub-task: `CI=true npm test` with coverage gate — 347 passed, 5 intentional Red; all core files above the per-file gate
  - [x] Sub-task: `npx oxlint` and `npx tsc -b` — both clean
  - [x] Sub-task: `git notes add -m` phase summary; `git push origin accessibility-keyboard-nav`

---

## Phase 2: Input Modality & Timing Compliance

> The novel work of this track. PR #9 had no equivalent — segmented checkpoints did not exist
> when it was written.

- [x] Task: Input modality tracking (aceea28)
  - [x] Sub-task: Write unit tests asserting modality is `pointer` after `startGesture`/`updateGesture` and `keyboard` after any step call (Red)
  - [x] Sub-task: Write a unit test asserting `reset()` returns modality to `pointer` (Red)
  - [x] Sub-task: Implement `InputModality` in the state machine with transitions on both entry paths (Green)
- [x] Task: Checkpoint inactivity suspension (WCAG 2.2 SC 2.2.1) (aceea28)
  > Landed with modality tracking: the two are one mechanism, and modality without the timer rule
  > would have been dead state.
  - [x] Sub-task: Fake-timer test — reach a checkpoint by stepping, advance well past the timeout, assert progress unchanged and no reset (Red)
  - [x] Sub-task: Fake-timer test — arm under pointer, switch to keyboard, assert the armed timer is cleared without firing (Red)
  - [x] Sub-task: Fake-timer test — step under keyboard, return to pointer, assert the timer arms for that checkpoint only (Red)
  - [x] Sub-task: Make `startCheckpointTimer()` a no-op under keyboard modality and clear on transition (Green)
  - [x] Sub-task: Verify no timer leaks — `destroy()` clears any armed timer under either modality (Refactor)
  - [x] Sub-task (unplanned): Assert pointer abandonment still times out, so the fix does not disable the behaviour segmented mode exists to provide
- [x] Task: Stepping under segmented mode (49755e1)
  - [x] Sub-task: Write unit tests asserting a stepped heel crossing sets `checkpoint` state and fires `onCheckpoint` identically to pointer traversal (Red)
  - [x] Sub-task: Write unit tests asserting `stepBackward` floors at the confirmed checkpoint and cannot rewind into a confirmed segment (Red)
  - [x] Sub-task: Implement segmented-aware stepping transitions (Green)
  - [x] Sub-task (unplanned): Fix the Phase 1 boundary-resolution defect the Red run exposed — `stepToNextHeel` landed exactly on a vertex, which the resolver read as still inside the previous segment, so that method never registered a heel crossing at all
- [x] Task: Heel feedback parity for stepping (49755e1)
  - [x] Sub-task: Write tests asserting `onTurn` and `FeedbackController.triggerTurn` fire when stepping crosses a heel, matching pointer traversal (Red)
  - [x] Sub-task: Fire `onTurn` and turn feedback from the stepping path (Green)
  - [x] Sub-task: Assert one `onTurn` per heel when a single step spans more than one (Refactor) — and none when stepping backward across a heel
- [x] Task: Pointer invariance regression guard (e841c5d)
  - [x] Sub-task: Tests asserting tolerance, snapback, checkpoint arming, unlock, and reset are unchanged under pointer-only operation (Red/Green) — all 10 pass unchanged, which is the point
  - [x] Sub-task (unplanned): Assert a pointer-only gesture never reports keyboard modality, the condition that would silently disable the pointer inactivity timeout
- [x] Task: Phase 2 Verification & Checkpoint [checkpoint: 9c3dca8]
  - [x] Sub-task: `git fetch origin main` — **drift found**, see sync task below
  - [x] Sub-task: `CI=true npm test` with coverage gate — 383 passed, 5 intentional Red; `machine.ts` branches 88.39%
  - [x] Sub-task: `git notes add -m` phase summary; `git push origin accessibility-keyboard-nav`
- [x] Task: Sync with `origin/main` at the phase boundary (fdbe381)
  > The Phase 2 fetch found `.cooper/specs/docs-playground/spec.md` changed upstream. Two tracks had
  > merged: `docs-config-css-parity` (PR #23) and `disable-npm-release`. Synced immediately rather
  > than at Phase 4 — `apps/docs` was substantially rewritten, and Phase 4 touches the same files
  > that left PR #9 unmergeable.
  - [x] Sub-task: Merge `origin/main`; resolve the `tracks.md` conflict by combining both sides
  - [x] Sub-task: Adopt the new colocated test convention — all packages moved `<pkg>/tests/` to `<pkg>/src/*.test.ts`; relocate this track's nine test files and rewrite their relative imports
  - [x] Sub-task: Verify the same five Red specs still fail by identity, not merely by count — 392 passed, 5 failed; `tsc` and `oxlint` clean

---

## Phase 3: Framework Adapter Parity

> All three adapters land together. `type-exports-parity` and `expand-css-variables` established
> that adapters do not ship at different capability levels.

- [x] Task: Normalize the slider element across adapters (3beac05, 40cf6c7)
  > Decided during Phase 0 after the baseline surfaced the divergence. Must land before handlers
  > are bound, since handlers belong on whichever element carries the role.
  - [ ] Sub-task: Write tests asserting exactly one `[role="slider"]` per adapter and that it is the container (Red)
  - [ ] Sub-task: Write tests asserting the handle is presentational — no `role`, no `tabindex`, no `aria-value*` (Red)
  - [ ] Sub-task: Move `role`, `tabindex`, and `aria-*` from the SVG `<g>` handle to the container in Vue and Svelte (Green)
  - [ ] Sub-task: Add the missing `tabindex` to the React container (Green)
  - [ ] Sub-task: Confirm visual regression baselines are unaffected — `tabindex` and `role` paint nothing
- [x] Task: Visible focus indicator (WCAG SC 2.4.7) (3beac05, 40cf6c7)
  - [x] Sub-task: Implement a themeable `--heelslide-focus-*` indicator with a `Highlight` system-colour fallback, so it respects OS and user contrast settings (Green)
  - [x] Sub-task: Verify the `.heelslide-handle { outline: none }` rule no longer suppresses the indicator (Refactor) — focus moved to the container, making the rule inert
  - [x] Sub-task (adjusted): Defined outside `:where()` in React so it carries normal specificity and cannot be overridden into invisibility
- [x] Task: React adapter keyboard and ARIA (3f56365)
  - [x] Sub-task: Component tests for every key binding, including `End` as a no-op and `disabled` inertness (Red)
  - [x] Sub-task: Tests for `tabindex`, `aria-valuetext`, `aria-orientation`, `aria-keyshortcuts`, `aria-describedby` (Red)
  - [x] Sub-task: Tests for the polite live region and `onAnnouncement` prop (Red)
  - [x] Sub-task: Tests for `accessibleFallback="custom"` binding no handlers and rendering no live region (Red)
  - [x] Sub-task: Tests asserting `useHeelslide` stepping primitives have stable identities across renders (Red)
  - [x] Sub-task: Implement in `useHeelslide.ts`, `Heelslide.tsx`, `types.ts` (Green)
  - [x] Sub-task: Verify `react-hooks/rules-of-hooks` passes and coverage >80% per file (Refactor)
  - [x] Sub-task (unplanned): Move the key map into `@heelslide/core` as `resolveKeyAction`, so the three adapters cannot drift
- [x] Task: Vue adapter keyboard and ARIA (3beac05)
  - [x] Sub-task: `@vue/test-utils` tests mirroring the React key-binding and ARIA matrix (Red)
  - [x] Sub-task: Test for the missing `aria-disabled` parity gap on this adapter (Red)
  - [x] Sub-task: Tests for the `announcement` emit and reactive `steps`/`description` (Red)
  - [x] Sub-task: Implement in `useHeelslide.ts`, `Heelslide.vue`, `types.ts` (Green)
  - [x] Sub-task: Refactor; verify coverage (Refactor)
- [x] Task: Svelte adapter keyboard and ARIA (40cf6c7)
  - [x] Sub-task: Tests mirroring the same matrix on the Svelte harness (Red)
  - [x] Sub-task: Tests for `createHeelslide` exposing stepping primitives via runes, with derived `steps`/`description` (Red)
  - [x] Sub-task: Implement in `Heelslide.svelte`, the rune composable, and `types.ts` (Green)
  - [x] Sub-task: Refactor; verify coverage (Refactor)
- [x] Task: Cross-adapter parity audit (46b5e9b, 4dfc239, 57c22e4)
  - [x] Sub-task: Diff the three adapters' ARIA output and key handling; assert no capability gaps — 21 of 21 features present in all three
  - [x] Sub-task: Verify type export parity across all three `types.ts` per the `type-exports-parity` norm — **gap found**: `AccessibleFallbackMode` shipped from Svelte only, since it wildcards its type exports while React and Vue enumerate
  - [x] Sub-task (unplanned): Resolve the `aria-hidden` asymmetry downward, not upward — the handle subtree carries author children in all three adapters
  - [x] Sub-task (unplanned): Mark the handle `role="presentation"`, fixing a Svelte compiler warning introduced by removing its slider role
- [x] Task: Phase 3 Verification & Checkpoint [checkpoint: 53896b9]
  - [x] Sub-task: `git fetch origin main` — no upstream drift
  - [x] Sub-task: `CI=true npm test` across all workspaces with coverage gate — **468 passed, 0 failed**; every Phase 0 Red baseline spec now green
  - [x] Sub-task: `npx oxlint` and `npx tsc -b` — both clean, no Svelte compiler warnings
  - [x] Sub-task: `git notes add -m` phase summary; `git push origin accessibility-keyboard-nav`

---

## Phase 4: Documentation Playground

- [x] Task: Reconcile the spec delta with the living spec (4b6a244)
  > PR #23 added an on-page reference with a tab pattern while this track was in flight. The
  > key-binding docs land as a third tab there rather than as the standalone section originally
  > specified.
- [x] Task: Keyboard showcase and announcement inspector (ff030e5)
  - [x] Sub-task: Write tests for the visible `aria-valuetext` / live-announcement readout (Red)
  - [x] Sub-task: Implement the showcase panel in `Playground.tsx` (Green) — reads `aria-valuetext` off the real slider via `MutationObserver` rather than deriving it again, so the demo cannot drift from what the widget exposes
- [x] Task: Accessible fallback mode control (ff030e5)
  - [x] Sub-task: Write tests for the `accessibleFallback` control re-rendering the demo (Red)
  - [x] Sub-task: Implement the control in `ConfigPanel.tsx` (Green)
- [x] Task: Snippet generator parity (ff030e5)
  - [x] Sub-task: Write tests asserting React, Vue, and Svelte snippets each emit the accessibility props idiomatically (Red) — and that the prop is omitted at the default
  - [x] Sub-task: Implement in `utils/snippets.ts` (Green)
- [x] Task: Key binding documentation (ff030e5)
  - [x] Sub-task: Document the full key table, including why `End` is unbound — as a `Keyboard & Accessibility` tab in the existing reference
  - [x] Sub-task: Update `README.md` with the accessibility section and WCAG conformance claims
- [x] Task: Phase 4 Verification & Checkpoint [checkpoint: pending]
  - [x] Sub-task: `git fetch origin main` — no upstream drift
  - [x] Sub-task: `CI=true npm test` with coverage gate — 478 passed, 0 failed; docs files all above the per-file gate
  - [x] Sub-task: `npm run docs:build` — clean
  - [x] Sub-task: `git notes add -m` phase summary; `git push origin accessibility-keyboard-nav`

---

## Phase 5: Browser Verification & Release

- [ ] Task: Playwright keyboard end-to-end specs
  - [ ] Sub-task: Write a spec completing full traversal to unlock using only `page.keyboard.press()` (Red)
  - [ ] Sub-task: Write a spec asserting `Escape` releases focus and `Tab` continues past the widget — no keyboard trap (Red)
  - [ ] Sub-task: Write a spec asserting `Tab` order reaches the component from page load (Red)
  - [ ] Sub-task: Make the specs pass across Chromium, WebKit mobile, and Firefox (Green)
  - [ ] Sub-task: Wire the spec into `ci.yml` such that a missing or renamed spec fails the gate rather than skipping, per the existing quality-gate prohibition
- [ ] Task: Visual regression confirmation
  - [ ] Sub-task: Run the visual suite and confirm **no** baseline changes; investigate any diff as a real regression rather than updating snapshots
- [ ] Task: Manual assistive technology verification
  - [ ] Sub-task: Verify with VoiceOver on macOS/Safari that the path description is announced on focus and progress is announced at each heel
  - [ ] Sub-task: Verify keyboard-only completion with no pointer, including a deliberate long pause at a checkpoint to confirm no timeout occurs
- [ ] Task: Release preparation
  - [ ] Sub-task: Add a changeset covering `@heelslide/core`, `react`, `vue`, `svelte` (minor — additive, no breaking change)
  - [ ] Sub-task: Merge spec deltas into the six living capability specs under `.cooper/specs/`
  - [ ] Sub-task: Close PR #9 with a comment pointing at this track as its successor
  - [ ] Sub-task: Move the track to `.cooper/archive/` and update `.cooper/tracks.md`
- [ ] Task: Phase 5 Verification & Checkpoint
  - [ ] Sub-task: `git fetch origin main`
  - [ ] Sub-task: Full gate run — `oxlint`, `tsc -b`, `CI=true npm test`, Playwright unit and visual suites
  - [ ] Sub-task: `git notes add -m` final summary; `git push origin accessibility-keyboard-nav`
  - [ ] Sub-task: Open the pull request

---

## Known Follow-Ups (not in this track)

- `accessibleFallback="dialog"` — modal confirmation with focus trap and `aria-modal`, four adapters.
- axe-core automated audit in CI — requires a dev dependency and a `tech-stack.md` amendment first,
  per workflow rule 3.
- Housekeeping surfaced during assessment: `.cooper/tracks.md` still lists `audit-remediation` as
  active though it merged as PR #17 on 2026-09-12, and nine worktrees for merged tracks remain
  un-torn-down.
