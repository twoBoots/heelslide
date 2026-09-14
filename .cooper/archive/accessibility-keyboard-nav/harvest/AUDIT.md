# Harvest Audit: `accessibility-fallback` → `accessibility-keyboard-nav`

**Date:** 2026-09-13
**Source:** `origin/accessibility-fallback` @ PR [#9](https://github.com/twoBoots/heelslide/pull/9)
**Auditor task:** Phase 0 · Task 1

Files in this directory carry a `.ref` suffix so no build, test, or typecheck tooling treats them
as inputs. They are **reference material only**. Production code and tests are written fresh in
Phase 1+ under TDD, driven by failing tests — harvested code is never promoted directly, which
would put implementation ahead of its Red phase.

---

## Verdict Summary

| Artifact | Lines | Keep | Rewrite | Discard |
| :--- | ---: | ---: | ---: | ---: |
| `accessibility.ts` | 105 | 3 of 4 functions | 1 function | — |
| `accessibility.test.ts` | 187 | 9 of 12 tests | 1 test | 2 superseded |
| `announcements.test.ts` | 165 | 7 of 7 tests | — | — |
| `HeelslideAccessibility.test.ts` | 154 | 4 of 5 tests | — | 1 test (~31 lines) |

---

## 1. `accessibility.ts`

**KEEP — valid against current `main`:**

- `getStepDirection()` — pure geometry over `Point2D` / `Direction`, both unchanged since the fork.
- `getAccessibleSteps()` — already returns one entry per `track.segments` element. Note this
  contradicts the *prose* of PR #9's own spec delta, which claimed `N + 1` objects for `N` heels;
  the code was right and the delta wrong. Our delta follows the code.
- `getAccessibleDescription()` — valid; `segments`, `totalLength` fields intact.

**REWRITE — `createDefaultAnnouncementMessage()`:**

1. **Missing `'checkpoint'` case.** Segmented checkpoints (PR #13) post-date this file entirely. A
   confirmed, non-rewindable checkpoint is semantically distinct from a plain heel arrival and
   needs its own message.
2. **Inline type import.** Uses `import('./types.js').AccessibleAnnouncementType` mid-signature;
   replace with a top-level named import.
3. **Untyped context.** `context: { progress: number; currentSegmentIndex?: number }` is an
   anonymous inline shape. Promote to an exported `AnnouncementContext`. PR #9's spec delta went
   further and specified `(context: any)` for the override hook, which `.oxlintrc.json` now
   rejects on package sources via `typescript/no-explicit-any`.

---

## 2. `accessibility.test.ts`

**KEEP (9):** both `getAccessibleSteps` cases including the 0-heel path, both
`getAccessibleDescription` cases, the engine-accessor test, and the four stepping tests
(`stepForward`, `stepBackward`, `stepToNextHeel`, engine delegation).

**REWRITE (1) — `unlocks when stepping forward reaches >= 0.95`:**

This test encodes a defect that `main` has since fixed. Commit `6c8c6fb`
(`fix(core): Close unlock, reset and path-generation defects found in audit`) made the unlock
condition **conjunctive**:

```ts
// machine.ts:285 — current main
const isAtEnd =
  track.segments.length > 0 &&
  currentSegmentIndex === track.segments.length - 1 &&
  progress >= 0.95;
```

The commit message documents the original defect: on a `[100,100,5]` track, aggregate progress
`0.9756` was reachable at the end of segment 1, unlocking without the final segment ever being
entered. A stepping API that unlocks on the progress threshold alone would **reintroduce that
exact defect through a new entry point**.

**DISCARD (2):** assertions tied to the standalone `>= 0.95` progress threshold as a sufficient
unlock condition.

**COVERAGE GAP:** the file has no segmented-mode tests at all — no checkpoint interaction, no
backward flooring at a confirmed checkpoint, no timer behaviour. Phase 2 supplies these.

---

## 3. `announcements.test.ts`

**KEEP (7):** all tests are structurally valid — `start`, `step`, `heel_reached`, `unlock`,
`reset`, custom `announceMessages` overrides, and `accessible.enabled: false` suppression.

**COVERAGE GAP:** no `'checkpoint'` announcement test, matching the missing case in
`accessibility.ts`.

---

## 4. `HeelslideAccessibility.test.ts` (Vue)

**KEEP (4):** ARIA slider attributes and `aria-keyshortcuts`, the visually hidden live region and
`#announcer` slot, the custom `#fallback` slot, and `@keydown` container navigation.

**DISCARD (1, ~31 lines) — `renders accessible fallback button and dialog when accessibleFallback="dialog"`:**
the `'dialog'` mode is explicitly deferred out of this track. Retained here as reference for the
follow-up track that implements it.

**COVERAGE GAPS:** no React or Svelte equivalents of this matrix, and no test for the
`aria-disabled` parity gap — `main`'s Vue adapter omits it while React and Svelte both ship it.

---

## 5. Design Correction Arising From This Audit

> This finding changes `design.md` and the `gesture-engine` spec delta. Both were written before
> `machine.ts:285` was read closely, and both are corrected in the same commit as this audit.

**As originally drafted:** stepping unlocks when accumulated distance reaches `totalLength`
(progress `1.0`).

**Why that is wrong:** pointer users unlock at `progress >= 0.95` *on the final segment*, via
`end()` on release. Requiring keyboard users to traverse the full `100%` would make them do
strictly more work than pointer users to accomplish the same action — an accessibility defect
introduced by the accessibility feature itself.

**Corrected design:** stepping advances progress only. Unlock happens through an explicit confirm
(`Enter` / `Space`) that invokes the **same** `end()` path and is therefore subject to the same
conjunctive condition. This gives exact parity on the unlock threshold, preserves the
intent-confirmation purpose of the primitive, and — because pointer users can drag back before
releasing — preserves the keyboard user's equivalent ability to step back before committing.
Auto-unlocking mid-step would silently remove that.
