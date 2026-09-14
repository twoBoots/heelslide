# @heelslide/react

## 0.4.0

### Minor Changes

- 20341d2: Add keyboard operation and complete ARIA semantics across every adapter.
  
  All adapters declared `role="slider"` while binding no keyboard handlers, so the accessibility
  tree advertised an operable range widget that could not be operated without a pointer. That is now
  closed.
  
  **Core** gains discrete stepping (`stepForward`, `stepBackward`, `stepToNextHeel`), semantic path
  description (`getAccessibleSteps`, `getAccessibleDescription`), a structured announcement lifecycle
  (`onAnnouncement`), and a shared key map (`resolveKeyAction`) so the adapters cannot drift apart.
  
  **React, Vue and Svelte** gain the full key map, `tabindex`, `aria-valuetext`, `aria-orientation`,
  `aria-keyshortcuts`, `aria-describedby`, a polite live region, a themeable focus indicator, and an
  `accessibleFallback` prop (`stepped` | `custom`). The slider contract now sits on the container in
  all three; the handle is presentational. Vue additionally gains the `aria-disabled` it was missing.
  
  Stepping advances progress only — unlock still requires an explicit confirm through the same code
  path pointer release uses, so both input modes share one unlock condition.
  
  In segmented mode the checkpoint inactivity timer is suspended while the keyboard is driving, so
  pausing to hear an announcement never costs progress.
  
  Additive and backwards compatible: pointer behaviour and rendered output are unchanged.
  
  Targets WCAG 2.2 SC 2.1.1, 2.1.2, 2.2.1, 2.4.7, 2.5.1 and 4.1.2.

### Patch Changes

- Updated dependencies [20341d2]
  - @heelslide/core@0.4.0

## 0.3.0

### Minor Changes

- ab71412: Close the correctness, parity and release defects found in the whole-project audit.
  
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

### Patch Changes

- Updated dependencies [ab71412]
  - @heelslide/core@0.3.0

## 0.2.0

### Minor Changes

- a178f14: Expanded CSS custom properties, heel theming, target heel & goal markers, and numbered heels support across React, Vue, and Svelte.

### Patch Changes

- d104434: Configure automated SemVer release pipeline, package manifests, and GitHub Releases with downloadable tarball assets.
- Updated dependencies [d104434]
  - @heelslide/core@0.2.0
