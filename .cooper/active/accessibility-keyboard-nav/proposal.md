# Proposal: Accessibility & Keyboard Navigation

**Track ID:** `accessibility-keyboard-nav`
**Type:** Feature (accessibility remediation)
**Supersedes:** `accessibility-fallback` (PR #9, closed unmerged)

---

## Rationale

### The live defect

`main` ships `role="slider"` on all four adapters (`react`, `vue`, `svelte`, and the docs
playground) with **zero keyboard handlers**:

```
git grep -lE 'onKeyDown|keydown|ArrowRight|KeyboardEvent' -- packages/   # no matches
```

A `role="slider"` with no key bindings is not merely an omission. It is an affirmative
misrepresentation to assistive technology: the accessibility tree advertises an operable range
widget, and a screen-reader or switch-device user who focuses it and presses an arrow key gets
nothing. This fails:

- **WCAG 2.2 SC 2.1.1 (Keyboard, Level A)** — no keyboard operation of the unlock gesture exists.
- **WCAG 2.2 SC 4.1.2 (Name, Role, Value, Level A)** — the declared role's expected interaction
  contract is unimplemented.
- **WCAG 2.2 SC 2.5.1 (Pointer Gestures, Level A)** — the unlock is a multi-point path-based
  gesture with no single-pointer, non-path alternative.

Heelslide is an *intent confirmation* primitive. A confirmation gate that cannot be operated
without tracing a rectilinear path with a pointer excludes keyboard-only, switch-access, and
screen-reader users from the very actions it guards.

### Why a new track rather than reviving PR #9

PR #9 (`accessibility-fallback`, opened 2026-09-06) addressed this need but is unmergeable and,
more importantly, **designed against an engine that no longer exists**:

| Signal | State at assessment (2026-09-13) |
| :--- | :--- |
| Divergence from `main` | 118 behind / 32 ahead |
| Mergeability | `CONFLICTING` / `DIRTY` |
| Source files touched that have since drifted | 22 of 22 (2–8 commits each) |
| Adapters covered | 3 — `packages/svelte` did not yet exist |

Three substantive invalidations, beyond mere textual conflict:

1. **The engine gained segmented checkpoints.** PR #13 added the `Segmented Multi-Gesture
   Checkpoints` capability — checkpoint-on-release, mid-segment snapback, and **checkpoint
   inactivity auto-reset**. PR #9's stepping design predates all of it and has no answer for how
   discrete stepping interacts with a checkpoint, nor for the fact that an inactivity timer
   running during slow keyboard stepping is itself a fresh **WCAG 2.2 SC 2.2.1 (Timing
   Adjustable)** failure.
2. **A fourth adapter landed.** `packages/svelte` arrived in PR #7 after PR #9 forked, and the
   `type-exports-parity` and `expand-css-variables` tracks have since made cross-adapter parity an
   enforced norm rather than an aspiration.
3. **`main` grew overlapping ARIA independently.** All four adapters now carry
   `role="slider"` + `aria-valuemin/max/now` + `aria-label`. PR #9 adds the same attributes to
   files that already have them — a semantic conflict, not a textual one.

Rebasing would mean hand-resolving 22 drifted files in order to arrive at a design that then has
to be reworked anyway. PR #9's *artifacts* remain valuable and are harvested (see below); its
*branch* is not.

### Harvested from PR #9

Reused as source material, re-derived against current `main`:

- `packages/core/src/accessibility.ts` (105 lines) — step/description generation, untouched by `main`
- `packages/core/tests/accessibility.test.ts` (187 lines)
- `packages/core/tests/announcements.test.ts` (165 lines)
- `packages/vue/tests/HeelslideAccessibility.test.ts` (154 lines)
- `proposal.md`, `design.md`, and the three spec deltas (ARIA tree, key map, announcement taxonomy)

---

## User Benefit

- **Keyboard-only users** can complete an intent confirmation using arrow keys, `Home`, `Enter`,
  and `Escape`, with no pointer required.
- **Screen-reader users** receive the path shape up front (`"Security gate with 2 turns: move
  right, then down, then right to unlock"`) and live progress announcements at each heel.
- **Switch-access and assistive-device users** get a non-path-based alternative, satisfying the
  SC 2.5.1 exemption.
- **Host applications** get headless primitives (`custom` mode) to render bespoke accessible
  confirmation flows without reimplementing the stepping engine.
- **Users who pause** — to read an announcement, or because motor control requires it — do not
  silently lose progress to an inactivity timer.

---

## Scope

### In scope

- Discrete stepping API on `@heelslide/core` (`stepForward`, `stepBackward`, `stepToNextHeel`).
- Semantic path description (`getAccessibleSteps`, `getAccessibleDescription`).
- Structured announcement event lifecycle (`onAnnouncement`).
- **Input-modality awareness**: checkpoint inactivity auto-reset is suspended under keyboard
  control.
- Keyboard event handling and complete ARIA semantics in **all four** adapters — `react`, `vue`,
  `svelte` — plus a polite live region.
- Two accessible fallback modes: `'stepped'` (default) and `'custom'` (headless primitives).
- Docs playground keyboard-navigation demonstration.
- Playwright keyboard E2E specs across the existing Chromium / WebKit-mobile / Firefox matrix.

### Out of scope (explicitly deferred)

- **`'dialog'` fallback mode** — the modal confirmation dialog from PR #9, with its focus trap,
  `aria-modal` semantics, and four-adapter test matrix. Separable from the urgent SC 2.1.1 fix;
  proposed as a follow-up track.
- **axe-core CI integration** — would require a new dev dependency and a `tech-stack.md`
  amendment under workflow rule 3. Proposed as a follow-up.
- Internationalisation of announcement strings beyond the existing override hook.
- Any change to pointer-gesture tolerance, path generation, or checkpoint semantics under pointer
  control.

---

## Capability Impact

This track is additive across six living capability specs. It is not an architecture shift — each
delta adds requirements without removing existing pointer behaviour — but the breadth is noted
for reviewer awareness:

| Capability | Nature of change |
| :--- | :--- |
| `gesture-engine` | Stepping API, announcements, input-modality suspension of auto-reset |
| `react-adapter` | Keyboard handlers, ARIA completion, live region, fallback modes |
| `vue-adapter` | As above |
| `svelte-adapter` | As above |
| `docs-playground` | Keyboard navigation demo |
| `ci-pipeline` | Playwright keyboard E2E gate |

---

## Success Criteria

1. Every adapter's `role="slider"` is fully operable by keyboard: SC 2.1.1 satisfied.
2. No keyboard interaction is subject to a time limit: SC 2.2.1 satisfied.
3. A non-path-based confirmation alternative exists: SC 2.5.1 satisfied.
4. `aria-valuenow` / `aria-valuetext` track real progress and announce meaningfully: SC 4.1.2
   satisfied.
5. No keyboard trap in any mode: SC 2.1.2 satisfied.
6. >80% per-file line, branch, and function coverage maintained across all touched modules.
7. Playwright keyboard specs pass on Chromium, WebKit mobile, and Firefox.
8. Pointer-gesture behaviour is unchanged — existing visual regression baselines hold.
