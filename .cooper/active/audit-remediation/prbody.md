## Summary

Remediation of the whole-project audit of `main` @ `e9b064b`. The repository's gates were all
green — 197 passing tests, clean `tsc -b`, clean `oxlint`, 96.6% statement coverage — while
three `MUST` requirements in the living `gesture-engine` specification were violated by shipped
code, the React adapter carried an unbounded render loop in its documented headless API, and the
release pipeline had never successfully published.

Every defect was reproduced by execution before being accepted. Two initial hypotheses were
**disproved** by that same process and are deliberately not addressed: `var()` does resolve
inside SVG presentation attributes (verified in Chrome 152, including geometry attributes and
fallbacks), and the generator's reported `heelCount` does not drift from the real turn count.

**Track:** `audit-remediation` · 19 findings · 18 fixed, 1 blocked.

## Spec Deltas

`gesture-engine` — 4 requirements modified, 2 added
`react-adapter` — 4 added · `vue-adapter` — 1 added · `svelte-adapter` — 2 added
`ci-pipeline` — 1 modified, 3 added · `release-pipeline` — living spec promoted, 2 added

## What changed

### High

| | Defect | Fix |
|---|---|---|
| H1 | `endGesture()` unlocked on aggregate progress alone — verified unlocking at the end of segment 1 of 3 with the final segment never entered | Condition made conjunctive on `currentSegmentIndex` |
| H2 | Self-intersection filter ran in `excludeEndpoints` mode, which reports only strict crossings — 99 collinear overlaps and 227 touches across 400 seeds, 136 seeds affected | Adjacency-aware test: the preceding segment may share its heel vertex, earlier segments no point at all |
| H3 | `useHeelslide` keyed its engine memo on object identity, so an inline options literal looped unboundedly on the first re-render (aborted at 82 renders; exhausted the heap unguarded) | Keyed on a structural signature of configuration values |
| H4 | `resetState()` assigned `state` then called `setState` with the same value, so `onStateChange` never fired for a reset and `'reset'` was unreachable | Routed through `setState`, passing through `'reset'` before `'idle'` |
| H5 | Reset restored `options.initialState`, so an engine seeded `'unlocked'` returned to `'unlocked'` with progress 1.0 after a rejected gesture | `initialState` seeds construction only |

### Medium

- **M2** Version assertions compared a literal to itself and could never fail; each now reads its
  own `package.json`. Confirmed by simulating a bump to 0.3.0 — the suite fails, then passes on
  revert.
- **M3** `"@heelslide/core": "*"` pinned to an exact version, with a test rejecting a wildcard.
- **M4** `regeneratePath()` retires the superseded machine instead of orphaning its timer.
- **M5** No `AudioContext` unless sound is enabled.
- **M6** Heel advancement requires reaching vertex tolerance, per the spec's own wording.
- **M7** React gains `bounds`/`track`; Vue and Svelte gain `initialState`/`initialProgress`;
  `width`/`height` retained as deprecated aliases.
- **M8** React renders a progress overlay and ships an optional `./style.css`.

### Low

CI gates no longer degrade to a passing skip (L1); `no-explicit-any` and `react-hooks` rules
enabled, which immediately caught four conditional `useState` calls in the docs app (L3);
per-file coverage thresholds enabled and every resulting gap closed (L4); workflow output passed
via `env:` (L6); `tech-stack.md` reconciled with the installed toolchain (L2); Cooper registry
reconciled and the `release-pipeline` living spec promoted (L5).

## Verification

| Gate | Result |
|---|---|
| Unit tests | **276 passed** (30 files), up from 197 |
| Coverage | **98.5% stmts / 92.7% branches / 99.0% funcs**, now enforced **per file** |
| Typecheck | clean |
| Lint | clean, with the styleguides' rules now actually enforced |
| Build | all workspaces |
| Visual regression | **30 passed** across Chromium, WebKit-mobile, Firefox |

Six baselines were intentionally refreshed — `active` and `unlocked` across all three browsers —
because React now draws a progress overlay. The other 24 are untouched, confirming default
appearance is unchanged.

Browser verification also caught two defects in this PR's own first attempt at the React
stylesheet: the overlay computed to `stroke: none` because the copied Vue class rule beat React's
presentation attributes, and importing shared defaults silently restyled React's handle. The
sheet is now opt-in, variables-only, and scoped to `[data-heelslide-container]`.

## Blocked — needs a repository administrator

**M1: the release pipeline has never published.** Every push to `main` fails at
`changesets/action@v1` with
`ENEEDAUTH: This command requires you to be logged in to https://registry.npmjs.org/`, and all
four packages return `E404` from the registry. The `NPM_TOKEN` repository secret is missing or
invalid. This PR makes the pipeline correct — pinned dependency ranges, version assertions that
can fail, hardened output handling — but it cannot make it authenticate. **A valid npm automation
token must be added to repository secrets before any release can succeed.**

## Not addressed

PR #9 (`accessibility-fallback`) is open, unreviewed, and was absent from `tracks.md`. It is now
registered as an active track, but reviewing and merging it is out of scope here.

## Behavioural impact for consumers

- Gestures released before the final segment now reset rather than unlock.
- `onStateChange` now emits `'reset'` before `'idle'`.
- `reset()` always returns to `'idle'`.
- Generated paths differ for a given seed, because overlapping candidates are now rejected.
  Seeded determinism is preserved. This is the only break for anyone pinning a seed, and is
  unavoidable given the previous output violated the spec.
