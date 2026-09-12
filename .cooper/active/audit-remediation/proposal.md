# Proposal: Whole-Project Audit Remediation

## Motivation & Rationale

A whole-project Principal Engineer review of `main` @ `e9b064b` found that the repository's
automated gates (197 passing tests, clean `tsc -b`, clean `oxlint`, 96.6% statement coverage)
were all green while three `MUST` requirements in the living `gesture-engine` specification
were violated by shipped code, the React adapter contained an unbounded render loop in its
documented headless API, and the release pipeline had never successfully published a package.

Every defect in scope was reproduced by execution before being accepted as real. Two initial
hypotheses were disproved by that same process and are deliberately **not** in scope:
`var()` does resolve inside SVG presentation attributes (verified in Chrome 152, including
geometry attributes and fallback values), and the generator's reported `heelCount` does not
drift from the real turn count.

The common thread is that the gates measure the wrong things: coverage thresholds are global
(masking 6.7%-branch files), version assertions compare a literal to itself, lint does not
enforce the rules the styleguides mandate, and several CI steps degrade to a passing skip when
a script is renamed. Fixing the defects without closing those gaps would leave the same class
of regression free to reappear.

## User & Developer Benefits

- **The gate actually gates.** The unlock condition requires reaching the end of the final
  segment, and a rejected gesture can no longer report success.
- **Tracks look like tracks.** Roughly a third of generated paths currently retrace themselves;
  after this change none do.
- **The headless API is safe to call.** `useHeelslide` no longer melts down when handed an
  inline options object, which is the natural way to call it.
- **Releases can ship.** Version exports stop drifting from their manifests and adapters stop
  declaring an unbounded dependency on core.
- **Regressions get caught.** The gates are tightened so each fixed defect stays fixed.

## Scope Boundaries

**In scope** — the 19 findings from the review, grouped into five phases:

| Phase | Findings | Capability |
|---|---|---|
| 1. Engine correctness | H1, H2, H4, H5, M4, M5, M6 | `gesture-engine` |
| 2. Adapter parity | H3, M7, M8 | `react-adapter`, `vue-adapter`, `svelte-adapter` |
| 3. Release & versioning | M2, M3 | `release-pipeline` |
| 4. Tooling & gates | L1, L2, L3, L4, L6 | `ci-pipeline` |
| 5. Cooper hygiene | L5 | — |

**Out of scope / blocked:**

- **M1 (release pipeline `ENEEDAUTH`)** cannot be fixed from the repository. The `NPM_TOKEN`
  repository secret is missing or invalid; every push to `main` fails at
  `changesets/action@v1` with
  `ENEEDAUTH: This command requires you to be logged in to https://registry.npmjs.org/`,
  and all four packages return `E404` from the registry. This requires a repository
  administrator to add a valid npm automation token. Phase 3 makes the pipeline *correct* so
  that it publishes properly once the secret is supplied; it cannot make it *succeed*.
- **PR #9 (`accessibility-fallback`)** is open, unreviewed and unregistered in `tracks.md`.
  Phase 5 registers it so it stops being invisible, but does not review or merge it.
- No new product features. No redesign of the gesture model beyond what the living specs
  already require.

## Risk & Behavioural Impact

Phases 1 and 2 intentionally change observable behaviour, so existing tests that encode the
current (incorrect) behaviour will be updated alongside the fixes:

- Gestures released before the final segment now reset instead of unlocking.
- `onStateChange` now fires on reset, emitting `'reset'` before settling on `'idle'`.
- `reset()` always returns to `'idle'`, never to a caller-supplied `initialState`.
- Generated paths change for a given seed, because overlapping candidates are now rejected.
  Seeded determinism is preserved (same seed, same path), but paths differ from 0.2.0.

The last of these is the only consumer-visible break for anyone pinning a seed; it is
unavoidable given that the current output violates the spec, and nothing is published yet.
