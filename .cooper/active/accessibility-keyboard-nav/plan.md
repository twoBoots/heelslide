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

- [~] Task: Recover artifacts from the superseded `accessibility-fallback` branch
  - [ ] Sub-task: Extract `packages/core/src/accessibility.ts` from `origin/accessibility-fallback` into the worktree as a starting point, without merging the branch
  - [ ] Sub-task: Extract `core/tests/accessibility.test.ts`, `core/tests/announcements.test.ts`, and `vue/tests/HeelslideAccessibility.test.ts` as test source material
  - [ ] Sub-task: Audit every harvested assertion against current `main` — the segmented-checkpoint capability, the four-adapter surface, and existing ARIA on `main` invalidate a subset; delete or rewrite rather than carry forward
  - [ ] Sub-task: Record in `git notes` which harvested assertions were kept, rewritten, or discarded, and why
- [ ] Task: Establish the accessibility baseline
  - [ ] Sub-task: Write a failing test asserting each adapter's container is keyboard-focusable and responds to `ArrowRight` (Red — documents the live SC 2.1.1 defect on `main`)
  - [ ] Sub-task: Confirm the full existing suite is green on the untouched base, so later failures are attributable to this track
- [ ] Task: Phase 0 Verification & Checkpoint
  - [ ] Sub-task: `git fetch origin main` to sync workflow rules and living specs
  - [ ] Sub-task: `CI=true npm test` — baseline green except the intentional Red specs
  - [ ] Sub-task: `git notes add -m` phase summary; `git push origin accessibility-keyboard-nav`

---

## Phase 1: Core Accessible Stepping & Semantics

- [ ] Task: Accessible types and step generation
  - [ ] Sub-task: Write unit tests for `getAccessibleSteps()` — one entry per `track.segments` element, correct direction, endpoints, and `progressAtEnd` (Red)
  - [ ] Sub-task: Write unit tests for `getAccessibleDescription()` across 1-heel, 2-heel, and max-heel paths (Red)
  - [ ] Sub-task: Implement `AccessibleStep`, `AccessibleAnnouncement`, `AccessibleOptions`, `AnnouncementContext` in `types.ts` and the generators in `accessibility.ts` (Green)
  - [ ] Sub-task: Verify `typescript/no-explicit-any` passes — the harvested `(context: any)` signature must be replaced with `AnnouncementContext` (Refactor)
- [ ] Task: Discrete stepping on the engine
  - [ ] Sub-task: Write unit tests for `stepForward` / `stepBackward` — within-segment advance, crossing a heel vertex, multi-segment traversal, flooring at 0 (Red)
  - [ ] Sub-task: Write unit tests asserting stepping NEVER unlocks on its own, and that confirm unlocks only via `end()` under the conjunctive final-segment condition — including the `[100,100,5]` regression case from audit commit `6c8c6fb` (Red)
  - [ ] Sub-task: Write a unit test asserting no API exists to jump straight to the destination (Red)
  - [ ] Sub-task: Write unit tests for `stepToNextHeel()` landing exactly on the terminating vertex (Red)
  - [ ] Sub-task: Implement stepping against the existing `accumulatedDistance / totalLength` model, reusing the pointer progress path rather than duplicating it (Green)
  - [ ] Sub-task: Refactor shared distance arithmetic out of the pointer and stepping paths; verify per-file coverage >80% (Refactor)
- [ ] Task: Announcement lifecycle
  - [ ] Sub-task: Write unit tests for `onAnnouncement` firing on start, step, heel_reached, checkpoint, unlock, reset, with correct type, progress, and timestamp (Red)
  - [ ] Sub-task: Write unit tests for `announceMessages` overrides and for `accessible.enabled: false` suppressing all announcements (Red)
  - [ ] Sub-task: Implement announcement emission and override resolution (Green)
  - [ ] Sub-task: Export the new surface from `packages/core/src/index.ts` and verify `tsc -b` (Refactor)
- [ ] Task: Phase 1 Verification & Checkpoint
  - [ ] Sub-task: `git fetch origin main`
  - [ ] Sub-task: `CI=true npm test -w @heelslide/core` with coverage gate
  - [ ] Sub-task: `npx oxlint` and `npx tsc -b`
  - [ ] Sub-task: `git notes add -m` phase summary; `git push origin accessibility-keyboard-nav`

---

## Phase 2: Input Modality & Timing Compliance

> The novel work of this track. PR #9 had no equivalent — segmented checkpoints did not exist
> when it was written.

- [ ] Task: Input modality tracking
  - [ ] Sub-task: Write unit tests asserting modality is `pointer` after `startGesture`/`updateGesture` and `keyboard` after any step call (Red)
  - [ ] Sub-task: Write a unit test asserting `reset()` returns modality to `pointer` (Red)
  - [ ] Sub-task: Implement `InputModality` in the state machine with transitions on both entry paths (Green)
- [ ] Task: Checkpoint inactivity suspension (WCAG 2.2 SC 2.2.1)
  - [ ] Sub-task: Write a **fake-timer** test: with `segmented: true` and `checkpointTimeoutMs` set, reach a checkpoint by stepping, advance timers well past the timeout, assert progress is unchanged and no reset or snapback fired (Red)
  - [ ] Sub-task: Write a fake-timer test: arm the timer under pointer control, transition to keyboard, assert the armed timer is cleared without firing (Red)
  - [ ] Sub-task: Write a fake-timer test: step under keyboard, return to pointer, reach a further checkpoint, assert the timer arms for that checkpoint only (Red)
  - [ ] Sub-task: Make `startCheckpointTimer()` a no-op under keyboard modality and clear on transition (Green)
  - [ ] Sub-task: Verify no timer leaks — `destroy()` clears any armed timer under either modality (Refactor)
- [ ] Task: Stepping under segmented mode
  - [ ] Sub-task: Write unit tests asserting a stepped heel crossing sets `checkpoint` state and fires `onCheckpoint` identically to pointer traversal (Red)
  - [ ] Sub-task: Write unit tests asserting `stepBackward` floors at the confirmed checkpoint and cannot rewind into a confirmed segment (Red)
  - [ ] Sub-task: Implement segmented-aware stepping transitions (Green)
- [ ] Task: Pointer invariance regression guard
  - [ ] Sub-task: Write tests asserting tolerance, snapback, checkpoint arming, unlock, and reset are byte-for-byte unchanged under pointer-only operation (Red/Green)
- [ ] Task: Phase 2 Verification & Checkpoint
  - [ ] Sub-task: `git fetch origin main`
  - [ ] Sub-task: `CI=true npm test -w @heelslide/core` with coverage gate
  - [ ] Sub-task: `git notes add -m` phase summary; `git push origin accessibility-keyboard-nav`

---

## Phase 3: Framework Adapter Parity

> All three adapters land together. `type-exports-parity` and `expand-css-variables` established
> that adapters do not ship at different capability levels.

- [ ] Task: React adapter keyboard and ARIA
  - [ ] Sub-task: Write component tests for every key binding, including `End` as a no-op and `disabled` inertness (Red)
  - [ ] Sub-task: Write tests for `tabindex`, `aria-valuetext`, `aria-orientation`, `aria-keyshortcuts`, `aria-describedby` at representative states (Red)
  - [ ] Sub-task: Write tests for the polite live region and `onAnnouncement` prop (Red)
  - [ ] Sub-task: Write tests for `accessibleFallback="custom"` binding no handlers and rendering no live region (Red)
  - [ ] Sub-task: Write tests asserting `useHeelslide` stepping primitives have stable identities across renders (Red)
  - [ ] Sub-task: Implement in `useHeelslide.ts`, `Heelslide.tsx`, `types.ts` (Green)
  - [ ] Sub-task: Verify `react-hooks/rules-of-hooks` passes and coverage >80% per file (Refactor)
- [ ] Task: Vue adapter keyboard and ARIA
  - [ ] Sub-task: Write `@vue/test-utils` tests mirroring the React key-binding and ARIA matrix (Red)
  - [ ] Sub-task: Write a test for the missing `aria-disabled` parity gap on this adapter (Red)
  - [ ] Sub-task: Write tests for the `announcement` emit and for reactive `steps`/`description` updating on path regeneration (Red)
  - [ ] Sub-task: Implement in `useHeelslide.ts`, `Heelslide.vue`, `types.ts` (Green)
  - [ ] Sub-task: Refactor; verify coverage (Refactor)
- [ ] Task: Svelte adapter keyboard and ARIA
  - [ ] Sub-task: Write tests mirroring the same matrix using the existing `react-dom/client`-style harness for Svelte (Red)
  - [ ] Sub-task: Write tests for `createHeelslide` exposing stepping primitives via runes, and derived `steps`/`description` updating on regeneration (Red)
  - [ ] Sub-task: Implement in `Heelslide.svelte`, the rune composable, and `types.ts` (Green)
  - [ ] Sub-task: Refactor; verify coverage (Refactor)
- [ ] Task: Cross-adapter parity audit
  - [ ] Sub-task: Diff the three adapters' ARIA output and key handling; assert no capability gaps
  - [ ] Sub-task: Verify type export parity across all three `types.ts` per the `type-exports-parity` norm
- [ ] Task: Phase 3 Verification & Checkpoint
  - [ ] Sub-task: `git fetch origin main`
  - [ ] Sub-task: `CI=true npm test` across all workspaces with coverage gate
  - [ ] Sub-task: `npx oxlint` and `npx tsc -b`
  - [ ] Sub-task: `git notes add -m` phase summary; `git push origin accessibility-keyboard-nav`

---

## Phase 4: Documentation Playground

- [ ] Task: Keyboard showcase and announcement inspector
  - [ ] Sub-task: Write tests for the visible `aria-valuetext` / live-announcement readout (Red)
  - [ ] Sub-task: Implement the showcase panel in `Playground.tsx` (Green)
- [ ] Task: Accessible fallback mode control
  - [ ] Sub-task: Write tests for the `accessibleFallback` control re-rendering the demo (Red)
  - [ ] Sub-task: Implement the control in `ConfigPanel.tsx` (Green)
- [ ] Task: Snippet generator parity
  - [ ] Sub-task: Write tests asserting React, Vue, and Svelte snippets each emit the accessibility props idiomatically (Red)
  - [ ] Sub-task: Implement in `utils/snippets.ts` (Green)
- [ ] Task: Key binding documentation
  - [ ] Sub-task: Document the full key table, including why `End` is unbound
  - [ ] Sub-task: Update `README.md` with the accessibility section and WCAG conformance claims
- [ ] Task: Phase 4 Verification & Checkpoint
  - [ ] Sub-task: `git fetch origin main`
  - [ ] Sub-task: `CI=true npm test -w docs` with coverage gate
  - [ ] Sub-task: `git notes add -m` phase summary; `git push origin accessibility-keyboard-nav`

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
