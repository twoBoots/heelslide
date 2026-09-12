# Implementation Plan: Whole-Project Audit Remediation

Strict TDD throughout: each task writes a failing test that reproduces the finding (Red),
makes it pass (Green), then tidies (Refactor). Tests that encode current incorrect behaviour
are updated in the same task that changes the behaviour.

## Phase 1 — Engine Correctness (`gesture-engine`)

- [ ] **1.1 (H1)** Unlock requires the final segment.
      Red: `[100,100,5]` track, release at end of segment 1 → expect not `unlocked`.
      Green: make the `end()` condition conjunctive on `currentSegmentIndex`.
- [ ] **1.2 (H4/H5)** Reset semantics.
      Red: breach emits `onStateChange('reset')` then `('idle')`; `initialState:'unlocked'`
      breach settles in `idle`, progress 0.
      Green: route `resetState()` through `setState()`; always target `idle`; pass through
      `'reset'` on rejection.
- [ ] **1.3 (M6)** Corner-cutting.
      Red: from `(50,0)` jump to `(100,50)` with tolerance 24 → expect no advance.
      Green: add `projection.distance <= tolerance` conjunct.
- [ ] **1.4 (H2)** Generator self-overlap.
      Red: scan seeded tracks for non-adjacent cross/overlap/touch → expect zero.
      Green: adjacency-aware intersection test.
- [ ] **1.5 (M4)** `regeneratePath()` destroys the superseded machine.
- [ ] **1.6 (M5)** No `AudioContext` unless sound is enabled.
- [ ] **1.7** Reconcile existing core tests with corrected behaviour.

## Phase 2 — Adapter Parity (`react-adapter`, `vue-adapter`, `svelte-adapter`)

- [ ] **2.1 (H3)** React hook render stability. Red: inline generator + one parent update →
      bounded renders. Green: structural memo signature.
- [ ] **2.2 (M7)** React accepts `bounds`/`track`; Vue and Svelte accept
      `initialState`/`initialProgress`; `width`/`height` retained as aliases.
- [ ] **2.3 (M8)** React progress overlay path + `style.css` + `./style.css` export.
- [ ] **2.4 (L3)** Type Svelte `children` as `Snippet`; remove `any` from Vue `index.ts`.

## Phase 3 — Release & Versioning (`release-pipeline`)

- [ ] **3.1 (M2)** Version tests assert export against own `package.json`.
- [ ] **3.2 (M3)** Pin `@heelslide/core` to an exact version in all three adapters.

## Phase 4 — Tooling & Gates (`ci-pipeline`)

- [ ] **4.1 (L1)** Remove skip-on-missing guards; make `format:check` able to fail.
- [ ] **4.2 (L3)** Enable `no-explicit-any` and the react plugin in `.oxlintrc.json`.
- [ ] **4.3 (L4)** Add per-file coverage thresholds.
- [ ] **4.4 (L6)** Pass workflow outputs via `env:`.
- [ ] **4.5 (L2)** Reconcile `tech-stack.md` with the installed toolchain.

## Phase 5 — Cooper Hygiene

- [ ] **5.1 (L5)** Promote the `release-pipeline` living spec; archive merged tracks;
      reconcile `tracks.md`; register `accessibility-fallback`; tear down stale worktrees.
- [ ] **5.2** Merge this track's spec deltas into `.cooper/specs/`.

## Blocked

- **M1** — `NPM_TOKEN` is missing or invalid; every push to `main` fails with `ENEEDAUTH` and
  all four packages 404 on the registry. Requires a repository administrator to add a valid
  npm automation token. Phase 3 makes the pipeline correct; it cannot make it authenticate.
