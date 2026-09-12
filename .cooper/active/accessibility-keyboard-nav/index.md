# Track: Accessibility & Keyboard Navigation

**Track ID:** `accessibility-keyboard-nav`
**Status:** `new`
**Worktree:** `.worktrees/accessibility-keyboard-nav`
**Base:** `main` @ `e2a335c`
**Supersedes:** `accessibility-fallback` / PR [#9](https://github.com/twoBoots/heelslide/pull/9)

---

## Artifacts

- [Proposal](./proposal.md) — rationale, why PR #9 was superseded, scope boundaries
- [Design](./design.md) — modality model, stepping API, ARIA tree, key map, adapter parity matrix
- [Plan](./plan.md) — six TDD phases with checkpoint meta-tasks
- [Metadata](./metadata.json)

## Spec Deltas

- [`gesture-engine`](./spec-deltas/gesture-engine/spec.md) — stepping, announcements, input modality, timing suspension
- [`react-adapter`](./spec-deltas/react-adapter/spec.md) — keyboard bindings, ARIA completion, live region
- [`vue-adapter`](./spec-deltas/vue-adapter/spec.md) — as above, plus `aria-disabled` parity gap
- [`svelte-adapter`](./spec-deltas/svelte-adapter/spec.md) — as above; adapter post-dates PR #9 entirely
- [`docs-playground`](./spec-deltas/docs-playground/spec.md) — keyboard showcase, fallback control, snippets
- [`ci-pipeline`](./spec-deltas/ci-pipeline/spec.md) — Playwright keyboard gate, baseline stability

## WCAG 2.2 Targets

| SC | Level | Current state on `main` |
| :--- | :--- | :--- |
| 2.1.1 Keyboard | A | **Failing** — `role="slider"` with no key handlers on any adapter |
| 2.1.2 No Keyboard Trap | A | Untested |
| 2.2.1 Timing Adjustable | A | **At risk** — checkpoint inactivity auto-reset would time keyboard users |
| 2.5.1 Pointer Gestures | A | **Failing** — no non-path alternative to the unlock gesture |
| 2.4.7 Focus Visible | AA | **Failing** — `style.css` sets `outline: none` on the only focusable element in Vue and Svelte |
| 4.1.2 Name, Role, Value | A | **Partial** — role declared, interaction contract unimplemented; placement diverges across adapters |

## Key Decisions

1. **New track, not a rebase of PR #9.** 118 commits behind, `CONFLICTING`, all 22 touched source
   files drifted, and the design predates both segmented checkpoints and the svelte adapter.
   Artifacts harvested; branch abandoned.
2. **Inactivity timer suspended under keyboard modality**, rather than reset-per-keypress or an
   extendable timeout. A keyboard user has no reason to be timed at all.
3. **`stepped` + `custom` fallback modes; `dialog` deferred** to a follow-up track — its focus trap
   and modal semantics are separable from the urgent SC 2.1.1 fix.
4. **Playwright keyboard E2E in scope; axe-core deferred** — the Playwright matrix already exists,
   whereas axe-core needs a dependency and a `tech-stack.md` amendment first.
5. **`role="slider"` normalized onto the container `<div>`** in all three adapters. `main` diverges:
   React on the container with no `tabindex`, Vue and Svelte on an SVG `<g>` with `tabindex="0"`.
   A `div` is reliably focusable everywhere; `tabindex` on SVG container elements is not,
   particularly in WebKit — which the CI matrix tests. Decided in Phase 0.
6. **Unlock routes through `end()` for both modalities.** Stepping advances progress only; confirm
   unlocks, under the same conjunctive final-segment condition pointer release uses. Prevents a
   keyboard user doing more work than a pointer user, and avoids reintroducing the audit defect
   `6c8c6fb` closed. Decided in Phase 0 during the harvest audit.
