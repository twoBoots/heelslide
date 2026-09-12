# Technical Design: Accessibility & Keyboard Navigation

**Track ID:** `accessibility-keyboard-nav`
**Base:** `main` @ `e2a335c`

---

## Architectural Overview

Three coordinated layers, each independently testable:

1. **Core semantic layer (`@heelslide/core`)** — discrete distance-based stepping along the
   rectilinear path, semantic step/description generation, and a structured announcement
   lifecycle. Framework-agnostic, zero new runtime dependencies.
2. **Modality layer (`@heelslide/core` state machine)** — an explicit notion of which input
   modality is currently driving progress, used to suspend the checkpoint inactivity timer under
   keyboard control.
3. **Adapter layer (`react`, `vue`, `svelte`)** — keyboard event binding, complete ARIA semantics,
   a polite live region, and the two fallback modes.

The guiding constraint: **pointer behaviour must not change.** Stepping reuses the existing
distance-accumulation model rather than introducing a parallel progress path, so tolerance,
snapback, and unlock semantics stay in one place.

---

## 1. Input Modality & the Auto-Reset Collision

### The problem

`packages/core/src/machine.ts` arms an inactivity timer whenever a checkpoint is reached in
segmented mode:

```ts
// machine.ts:76
if (segmented && checkpointTimeoutMs > 0) {
  checkpointTimer = setTimeout(() => { /* snapback / reset */ }, checkpointTimeoutMs);
}
```

Under pointer control this is correct: an abandoned half-traced gesture should not hold a
checkpoint open indefinitely. Under keyboard control it is a **WCAG 2.2 SC 2.2.1 (Timing
Adjustable)** failure. A screen-reader user who pauses at a checkpoint to listen to the
announcement — precisely the behaviour the announcement exists to produce — loses progress.

### The design

Introduce an explicit modality, tracked by the state machine:

```ts
export type InputModality = 'pointer' | 'keyboard';
```

**Transition rules:**

| Event | Resulting modality |
| :--- | :--- |
| `start(point)` / `update(point)` — pointer entry points | `'pointer'` |
| `stepForward` / `stepBackward` / `stepToNextHeel` | `'keyboard'` |
| `reset()` | `'pointer'` (default) |

**Timer rule:** `startCheckpointTimer()` becomes a no-op when `modality === 'keyboard'`. Any
already-armed timer is cleared on transition into `'keyboard'`. Transitioning back to `'pointer'`
mid-gesture — a user who steps, then grabs the handle — re-arms the timer only on the *next*
checkpoint, never retroactively.

This is deliberately a machine-level concern rather than an engine-level flag: the timer lives in
the machine, and keeping the suspension adjacent to the arming logic avoids a second source of
truth about whether a timer should exist.

### Why not the alternatives

- *Each keypress resets the timer* — preserves the failure mode. A user paused mid-announcement
  still loses the checkpoint.
- *Configurable timeout with an extend-on-warn prompt* — satisfies 2.2.1 via the extension
  provision, but adds a config surface, a new announcement type, and dismissible UI to four
  adapters, for a population that has no reason to be timed at all.

---

## 2. Core Stepping API

### Distance model

Stepping operates on the same `accumulatedDistance / track.totalLength` progress model the pointer
path uses. A step of `amount` (normalised, default `0.1`) advances
`amount * track.totalLength` along the path, crossing segment boundaries as required.

```ts
public stepForward(amount?: number): number;   // returns new progress
public stepBackward(amount?: number): number;  // returns new progress
public stepToNextHeel(): number;               // jumps to the vertex ending the current segment
```

**Boundary semantics:**

- Forward stepping that reaches `totalLength` sets `progress = 1.0`, transitions to `unlocked`,
  and fires `onUnlock`. There is no `End`-key shortcut to this state — a single keypress must not
  bypass intent validation, which would defeat the primitive's purpose.
- Forward stepping across a heel vertex in **segmented** mode sets `checkpoint` state and fires
  `onCheckpoint`, exactly as pointer traversal does — but does **not** arm the inactivity timer
  (§1).
- Backward stepping in **segmented** mode floors at the last confirmed checkpoint, matching
  `snapbackToCheckpoint()` semantics. A confirmed checkpoint is not rewindable, by keyboard or
  pointer.
- Backward stepping in **non-segmented** mode floors at `0` and returns state to `idle`.

### Semantic description

```ts
export interface AccessibleStep {
  segmentIndex: number;
  direction: Direction;          // 'horizontal' | 'vertical' — reuses existing core type
  startPoint: Point2D;
  endPoint: Point2D;
  instruction: string;           // "Step 1 of 3: move right to the first turn"
  progressAtEnd: number;
}

public getAccessibleSteps(): AccessibleStep[];      // length === track.segments.length
public getAccessibleDescription(): string;
```

`getAccessibleDescription()` returns a single sentence suitable for `aria-describedby`, derived
from the segment vector sequence — e.g. `"Security gate with 2 turns: move right, then down, then
right to unlock."`

> **Correction against PR #9:** its delta specified `getAccessibleSteps()` returning `N + 1`
> objects for `N` heels while its PR body named the methods `stepNext`/`stepPrevious`. A path with
> `N` heels has exactly `N + 1` *segments*, and `track.segments` is already that array — so the
> return length is `track.segments.length`, expressed against the real field rather than a
> recomputed count. Method naming follows the delta (`stepForward`/`stepBackward`), not the PR body.

### Announcements

```ts
export type AccessibleAnnouncementType =
  | 'start' | 'step' | 'heel_reached' | 'checkpoint' | 'progress' | 'unlock' | 'reset';

export interface AccessibleAnnouncement {
  type: AccessibleAnnouncementType;
  message: string;
  progress: number;
  timestamp: number;
}

export interface AccessibleOptions {
  enabled?: boolean;          // default true
  stepIncrement?: number;     // default 0.1
  announceMessages?: Partial<Record<AccessibleAnnouncementType, (ctx: AnnouncementContext) => string>>;
}
```

`'checkpoint'` is added to PR #9's taxonomy — segmented mode did not exist when that list was
drawn up, and a checkpoint is semantically distinct from a plain heel arrival (it is *confirmed*
and non-rewindable).

`announceMessages` is typed against a concrete `AnnouncementContext` rather than PR #9's
`(context: any)`; `.oxlintrc.json` enforces `typescript/no-explicit-any` on package sources, so
the original signature would not lint.

Wired into `HeelslideEngineOptions` as `accessible?: AccessibleOptions` and
`onAnnouncement?: (a: AccessibleAnnouncement) => void`, both optional — no behavioural change for
existing consumers.

---

## 3. ARIA Semantics

`main` already ships `role="slider"`, `aria-label`, `aria-valuemin`, `aria-valuemax`,
`aria-valuenow`, and `aria-disabled` across all adapters. This track **completes** that tree
rather than re-declaring it:

| Attribute | Status | Value |
| :--- | :--- | :--- |
| `role="slider"` | exists | unchanged |
| `aria-valuemin` / `max` / `now` | exists | unchanged |
| `aria-label` | exists | unchanged |
| `aria-disabled` | exists (vue: missing) | add to vue for parity |
| `tabindex="0"` | **add** | focusable when not disabled; `-1` when disabled |
| `aria-valuetext` | **add** | `"50% complete. First turn reached. Move down to continue."` |
| `aria-orientation` | **add** | derived from the active segment's `direction` |
| `aria-keyshortcuts` | **add** | `"ArrowRight ArrowLeft ArrowUp ArrowDown Home Enter Escape"` |
| `aria-describedby` | **add** | points at a hidden node holding `getAccessibleDescription()` |

**Live region** (`data-heelslide-live-region`): `role="status"`, `aria-live="polite"`,
`aria-atomic="true"`, visually hidden via the standard 1px-clip pattern. Announcements are
`polite`, never `assertive` — an unlock gate should not interrupt a user mid-sentence.

---

## 4. Key Map

| Key | Action |
| :--- | :--- |
| `Tab` | Focus the slider (native, via `tabindex="0"`) |
| `ArrowRight` / `ArrowDown` | `stepForward()` |
| `ArrowLeft` / `ArrowUp` | `stepBackward()` |
| `Home` | `reset()` — return to `idle`, progress `0` |
| `End` | **No-op.** Deliberately unbound; jumping to the destination would bypass intent validation |
| `Enter` / `Space` | Engage from `idle`; confirm unlock when at destination |
| `Escape` | Cancel the in-progress gesture and release focus — no keyboard trap (SC 2.1.2) |

Arrow keys call `preventDefault()` only when the widget is focused and enabled, so page scrolling
is unaffected elsewhere.

**Orientation note:** both `ArrowRight`/`ArrowDown` map to forward rather than being filtered by
the current segment's axis. Requiring the user to track which axis the current segment runs along
— and press a *different* key accordingly — would make the widget substantially harder to operate
for exactly the users it serves. The `aria-valuetext` and live-region messages still narrate the
true direction, so the spatial model is communicated without being enforced as input.

---

## 5. Fallback Modes

```ts
export type AccessibleFallbackMode = 'stepped' | 'custom';
```

- **`'stepped'`** (default when `accessible.enabled !== false`) — the key map above, bound by the
  adapter to the container element.
- **`'custom'`** — the adapter binds no key handlers and renders no live region, instead exposing
  `stepForward`, `stepBackward`, `stepToNextHeel`, `steps`, `description`, and the announcement
  stream through the hook/composable/rune return value, so the host can render its own accessible
  flow.

`'dialog'` is deferred (see `proposal.md`); the union is written to accept a third member later
without a breaking change.

---

## 6. Adapter Parity Matrix

| Concern | `react` | `vue` | `svelte` |
| :--- | :--- | :--- | :--- |
| Keyboard binding | `onKeyDown` on container | `@keydown` on container | `onkeydown` on container |
| Reactive state | `useState` + `useCallback` | `ref` / `computed` | `$state` / `$derived` runes |
| Live region | JSX node | template node | markup node |
| Headless surface | `useHeelslide` | `useHeelslide` | `createHeelslide` |
| Announcement stream | callback prop `onAnnouncement` | emit `announcement` | callback prop `onAnnouncement` |

Vue uses an `emit` for the announcement stream to match its existing event convention; React and
Svelte use callback props to match theirs. The underlying core contract is identical.

---

## 7. Testing Strategy

- **Core (vitest):** stepping arithmetic across segment boundaries, checkpoint interaction,
  backward flooring, unlock at end-of-path, description generation, announcement emission,
  and — critically — an assertion with **fake timers** that advancing past `checkpointTimeoutMs`
  after a keyboard step does **not** reset progress.
- **Adapters (vitest + happy-dom):** key dispatch on the container, ARIA attribute correctness at
  each state, live-region text updates, `custom` mode binding nothing, disabled-state inertness.
- **Playwright keyboard E2E:** real `page.keyboard.press()` sequences against the docs playground
  on Chromium, WebKit mobile, and Firefox — covering full traversal to unlock, `Escape` releasing
  focus without trapping, and `Tab` order. Simulated DOM events are weak evidence for a keyboard
  claim; focus and event ordering are where real browsers diverge.
- **Visual regression:** existing baselines must hold unchanged. The live region is visually
  hidden and `tabindex` paints nothing, so any baseline diff is a genuine regression.
