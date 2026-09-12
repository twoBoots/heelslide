---
"@heelslide/core": minor
"@heelslide/react": minor
"@heelslide/svelte": minor
"@heelslide/vue": minor
---

Close the correctness, parity and release defects found in the whole-project audit.

**Behavioural changes**

- **Unlock requires the final segment.** `endGesture()` previously unlocked on aggregate
  progress alone, which is satisfiable at an earlier heel when the trailing segments are short
  relative to total length. Gestures released before reaching the final segment now reset.
- **Reset is observable and always fail-safe.** `onStateChange` now fires for resets, emitting
  `'reset'` before settling on `'idle'`. `initialState` seeds construction only and is no longer
  a reset target, so an engine seeded as `'unlocked'` can no longer report success after a
  rejected gesture.
- **Heels must actually be reached.** Advancing across a heel now requires the pointer to have
  come within tolerance of the heel vertex, so a discontinuous jump cannot bypass the corner.
- **Generated paths no longer overlap themselves.** The self-intersection filter previously
  ignored collinear overlap, which affected roughly a third of seeds. Paths for a given seed
  differ from 0.2.0 as a result; seeded determinism is unchanged.

**Fixes**

- `useHeelslide` (React) no longer rebuilds its engine on every render when handed an inline
  options object, which drove an unbounded render loop on the first re-render.
- `regeneratePath()` retires the superseded state machine, so an armed checkpoint timer can no
  longer fire `onReset` against a discarded machine.
- No `AudioContext` is constructed unless sound is enabled.

**Additions**

- React accepts `bounds` and `track`; `width`/`height` remain as deprecated aliases, with
  `bounds` taking precedence when both are supplied.
- Vue and Svelte accept `initialState` and `initialProgress`.
- React renders a progress overlay path and ships an optional `./style.css` export.
- Adapters pin an exact `@heelslide/core` dependency instead of a wildcard range.
