# Heelslide

> Intentional-gesture security gate UI component for touchscreen web applications.

[![CI](https://github.com/twoBoots/heelslide/actions/workflows/ci.yml/badge.svg)](https://github.com/twoBoots/heelslide/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-2ea44f?logo=github&style=flat-square)](https://twoboots.github.io/heelslide/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Cooper SDD](https://img.shields.io/badge/SDD-Cooper%20Framework-brightgreen)](.cooper/index.md)
[![Troop Canopy](https://img.shields.io/badge/Worktrees-Troop-orange)](https://github.com/twoBoots/troop)

> [!TIP]
> **[🚀 Explore the Live Interactive Playground & Configurator →](https://twoboots.github.io/heelslide/)**
> Test procedural 2D paths, experiment with design presets and CSS custom properties, try keyboard navigation, and export copy-paste code across React, Vue, and Svelte in real time.

---

## Overview

Standard slide-to-unlock components require a simple 1D linear swipe. On touchscreen devices, 1D swipes frequently trigger unintentionally inside pockets or from accidental screen contact.

Heelslide acts as a security gate for destructive or sensitive operations (e.g. payments, account deletions, production deployments). Rather than a straight line, Heelslide generates a 2D path containing 90-degree directional changes ("heels"). The user must guide the thumb through each heel to confirm intent and complete the action.

---

## Quick Start & Installation

Install the package for your framework along with the core engine:

```bash
# React 18 / 19
npm install @heelslide/react @heelslide/core

# Vue 3
npm install @heelslide/vue @heelslide/core

# Svelte 5
npm install @heelslide/svelte @heelslide/core

# Vanilla JS / Core Engine
npm install @heelslide/core
```

### Basic Usage

#### React
```tsx
import { Heelslide } from '@heelslide/react';

export function ConfirmPayment() {
  return (
    <Heelslide
      heelCount={3}
      onUnlock={() => console.log('Payment confirmed!')}
    />
  );
}
```

#### Vue 3
```vue
<script setup lang="ts">
import { Heelslide } from '@heelslide/vue';

function handleUnlock() {
  console.log('Action confirmed!');
}
</script>

<template>
  <Heelslide :heel-count="3" @unlock="handleUnlock" />
</template>
```

#### Svelte 5
```svelte
<script lang="ts">
  import { Heelslide } from '@heelslide/svelte';

  function handleUnlock() {
    console.log('Action confirmed!');
  }
</script>

<Heelslide heelCount={3} onunlock={handleUnlock} />
```

---

## Core Capabilities

- **Configurable Heels**: Set a fixed heel count or a `[min, max]` range for procedural track generation.
- **Gesture Verification**: PointerEvents tracking that validates continuous movement along the generated path within tolerance bounds.
- **Segmented Multi-Gesture Checkpoints**: Support for lift-and-resume authentication where users can lift their finger at turns and resume within an adjustable timeout window. See [Segmented Multi-Gesture Checkpoints](#segmented-multi-gesture-checkpoints).
- **Custom Handle Icons & Slots**: Embed custom SVG icons, status spinners, or custom children directly inside the draggable handle across React, Vue, and Svelte. See [Handle Customization & Slots](#handle-customization--slots).
- **Touchscreen & Mobile Responsiveness**: Fluid, adaptive layouts and viewport-safe bounding optimized for mobile phones and tablets.
- **CSS Customisation**: Zero runtime CSS-in-JS. Visual styling is configured via namespaced CSS variables (`--heelslide-*`).
- **Multi-Framework Adapters**:
  - `@heelslide/core`: Zero-dependency gesture engine, geometry validation, and path generator.
  - `@heelslide/react`: React 18/19 component wrapper (`<Heelslide />`) and `useHeelslide` hook.
  - `@heelslide/vue`: Vue 3 component wrapper (`<Heelslide />`) and `useHeelslide` composable.
  - `@heelslide/svelte`: Svelte 5 component wrapper (`<Heelslide />`) and `createHeelslide` rune composable.
- **Keyboard & Assistive Technology**: Full keyboard operation, ARIA slider semantics, and live-region announcements across every adapter. See [Accessibility](#accessibility).
- **Testing & Quality**: Strict >80% test coverage via Vitest, visual regression tests via Playwright, and linting/formatting via Oxc.

---

## Handle Customization & Slots

Heelslide allows embedding arbitrary children or scoped template content directly inside the interactive slider handle (e.g. security lock icons, loading indicators, custom SVGs).

### React
Pass custom elements or icons as children to `<Heelslide />`:

```tsx
import { Heelslide } from '@heelslide/react';
import { LockIcon } from './icons';

export function LockedGate() {
  return (
    <Heelslide heelCount={3}>
      <LockIcon className="handle-icon" />
    </Heelslide>
  );
}
```

### Vue 3
Use the `#handle` scoped slot to access interaction state:

```vue
<script setup lang="ts">
import { Heelslide } from '@heelslide/vue';
import LockIcon from './LockIcon.vue';
</script>

<template>
  <Heelslide :heel-count="3">
    <template #handle="{ state }">
      <LockIcon :is-active="state.status === 'active'" />
    </template>
  </Heelslide>
</template>
```

### Svelte 5
Pass child elements directly inside `<Heelslide>`:

```svelte
<script lang="ts">
  import { Heelslide } from '@heelslide/svelte';
  import LockIcon from './LockIcon.svelte';
</script>

<Heelslide heelCount={3}>
  <LockIcon />
</Heelslide>
```

---

## Segmented Multi-Gesture Checkpoints

For complex verification paths with multiple turns, standard continuous gestures can strain user hand ergonomics. Segmented mode introduces checkpoint milestones at each heel, allowing the user to lift their finger and re-engage comfortably without losing progress.

```tsx
<Heelslide
  mode="segmented"
  checkpointTimeoutMs={4000}
  onCheckpointReach={(checkpoint) => {
    console.log(`Reached checkpoint ${checkpoint.index + 1} of ${checkpoint.total}`);
  }}
  onUnlock={() => console.log('Gesture completed!')}
/>
```

### Checkpoint Mechanics
- **Lift & Resume**: When reaching a turn checkpoint, the handle locks in place and waits for the next touch contact.
- **Configurable Expiry**: If `checkpointTimeoutMs` expires without re-engagement, the gate resets back to start (default: no timeout / indefinite).
- **Keyboard Exemption**: In accordance with WCAG 2.2 SC 2.2.1, checkpoint expiration timers are automatically suspended when operating via keyboard navigation.

---

## Accessibility

Heelslide is an intent-confirmation primitive, so it has to be operable by everyone the
confirmation applies to — not only by people who can trace a path with a pointer.

### Keyboard

Every adapter binds the same key map, resolved by a single function in `@heelslide/core` so the
frameworks cannot drift apart.

| Key | Action |
| :--- | :--- |
| `Tab` | Move focus to the gate |
| `ArrowRight` / `ArrowDown` | Advance along the path |
| `ArrowLeft` / `ArrowUp` | Retreat along the path |
| `Home` | Return to the start |
| `Enter` / `Space` | Confirm — unlocks once the destination is reached |
| `Escape` | Cancel the gesture in progress; focus is not trapped |
| `End` | **Deliberately unbound** — see below |

`End` has no binding on purpose. Jumping straight to the destination would let a single keypress
bypass path traversal, which is the entire point of the gate.

Both arrow axes move in the same direction rather than being filtered by the current segment's
orientation. Making someone track which axis they are on before choosing a key would make the gate
harder to operate for precisely the people it serves; the real direction is still narrated through
`aria-valuetext` and the live region.

### Announcements

Configure `onAnnouncement` (or the `announcement` event in Vue) to observe milestones — gesture
start, each step, heel arrivals, checkpoint confirmations, unlock and reset. Each adapter also
renders a visually hidden `role="status"` region with `aria-live="polite"`, so announcements never
interrupt a screen-reader user mid-sentence.

Messages can be overridden per type via `accessible.announceMessages`, and disabled entirely with
`accessible.enabled: false`.

### Fallback modes

```tsx
<Heelslide accessibleFallback="stepped" />  {/* default: keys bound, live region rendered */}
<Heelslide accessibleFallback="custom" />   {/* no keys, no live region — you build the flow */}
```

In `custom` mode the hook or composable hands you `stepForward`, `stepBackward`, `stepToNextHeel`,
`steps` and `description` so a host application can render its own accessible confirmation.

### Focus

Focus lives on the container, which carries `role="slider"`. Style the indicator with
`--heelslide-focus-color`, `--heelslide-focus-width` and `--heelslide-focus-offset`; it defaults to
the `Highlight` system colour so it respects the viewer's OS and contrast settings.

### Timing

In segmented mode a checkpoint normally expires after `checkpointTimeoutMs`. Under keyboard
control that timer is suspended entirely: pausing to listen to an announcement must never cost
someone their progress.

### Conformance

Targets WCAG 2.2 Level AA for the following success criteria:

| SC | Level | How |
| :--- | :--- | :--- |
| 2.1.1 Keyboard | A | Full key map on every adapter |
| 2.1.2 No Keyboard Trap | A | `Escape` cancels without capturing focus |
| 2.2.1 Timing Adjustable | A | Checkpoint timeout suspended under keyboard control |
| 2.4.7 Focus Visible | AA | Themeable focus indicator on the container |
| 2.5.1 Pointer Gestures | A | Stepping is a non-path alternative to the gesture |
| 4.1.2 Name, Role, Value | A | Complete ARIA slider semantics, kept in sync with state |

---

## Repository Structure

```text
heelslide/
├── packages/
│   ├── core/      # Framework-agnostic engine and path generator
│   ├── react/     # React 18/19 wrapper
│   ├── vue/       # Vue 3 wrapper
│   └── svelte/    # Svelte 5 wrapper
├── apps/
│   └── docs/      # Live documentation, configurator, and GitHub Pages demo
├── .cooper/       # Living specs and SDD track history
└── .worktrees/    # Troop worktree isolation canopy
```

---

## Styling & CSS Custom Properties

All component styling is customized via standard, namespaced CSS custom properties (`--heelslide-*`). No CSS-in-JS runtime is required.

### CSS Custom Properties Reference

| Custom Property | Default | Description |
| :--- | :--- | :--- |
| **Geometry & Track** | | |
| `--heelslide-width` | `300px` | Container width |
| `--heelslide-height` | `150px` | Container height |
| `--heelslide-track-bg` | `#e2e8f0` | Inactive track stroke color |
| `--heelslide-track-progress` | `#3b82f6` | Active traversed track stroke color (alias: `--heelslide-track-active`) |
| `--heelslide-track-width` | `12px` | Track stroke width |
| `--heelslide-track-cap` | `round` | Track stroke cap style (`round`, `butt`, `square`) |
| `--heelslide-track-start-radius` | `6px` | Track origin buffer radius |
| `--heelslide-track-end-radius` | `6px` | Track destination buffer radius |
| `--heelslide-track-heel-radius` | `4px` | Turn corner vertex radius |
| **Handle Tokens** | | |
| `--heelslide-handle-size` | `36px` | Handle diameter width and height |
| `--heelslide-handle-radius` | `18px` | Handle circle radius |
| `--heelslide-handle-bg` | `#ffffff` | Handle fill color (aliases: `--heelslide-slider-bg`, `--heelslide-handle-color`) |
| `--heelslide-handle-border-color` | `#3b82f6` | Handle border stroke color |
| `--heelslide-handle-border-width` | `2px` | Handle border stroke width |
| `--heelslide-handle-shadow` | `none` | Drop shadow applied to the handle container |
| `--heelslide-handle-active-scale` | `1.05` | Transform scale during active pointer drag |
| `--heelslide-handle-active-bg` | `--heelslide-handle-bg` | Handle fill color while actively dragging |
| `--heelslide-handle-checkpoint-bg` | `--heelslide-handle-active-bg` | Handle fill color when paused at a checkpoint |
| `--heelslide-handle-checkpoint-border-color` | `--heelslide-handle-border-color` | Handle border stroke color when paused at a checkpoint |
| `--heelslide-handle-checkpoint-shadow` | `none` | Box/drop shadow when paused at a checkpoint |
| **Heel Turn Markers** | | |
| `--heelslide-heel-radius` | `4px` | Radius of turn corner marker circles |
| `--heelslide-heel-bg` | `#94a3b8` | Heel turn marker fill color (alias: `--heelslide-heel-color`) |
| `--heelslide-heel-border-color` | `transparent` | Heel marker border stroke color |
| `--heelslide-heel-border-width` | `0px` | Heel marker border stroke width |
| `--heelslide-heel-padding` | `0px` | Clearance buffer ring width around heel marker |
| `--heelslide-heel-completed-color` | `#3b82f6` | Fill color for navigated / cleared heels |
| **Active Target Heel** | | |
| `--heelslide-target-heel-bg` | `#3b82f6` | Fill color for the upcoming active target heel |
| `--heelslide-target-heel-border-color` | `#ffffff` | Border stroke color for the upcoming target heel |
| `--heelslide-target-heel-border-width` | `2px` | Border stroke width for the upcoming target heel |
| `--heelslide-target-heel-scale` | `1.1` | Transform scale for the upcoming target heel |
| **Target Goal Indicator** | | |
| `--heelslide-goal-bg` | `#10b981` | Final destination marker fill color (alias: `--heelslide-end-color`) |
| `--heelslide-goal-border-color` | `transparent` | Destination marker border stroke color |
| `--heelslide-goal-border-width` | `0px` | Destination marker border stroke width |
| **Typography & Numbered Heels** | | |
| `--heelslide-heel-font-family` | `system-ui, -apple-system, sans-serif` | Font family for numbered heel labels |
| `--heelslide-heel-font-size` | `10px` | Font size for numbered heel labels |
| `--heelslide-heel-font-weight` | `600` | Font weight for numbered heel labels |
| `--heelslide-heel-text-color` | `#475569` | Text color for inactive numbered heels |
| `--heelslide-target-heel-text-color` | `#ffffff` | Text color for the active upcoming target heel |
| **Interaction States** | | |
| `--heelslide-success-color` | `#10b981` | Accent color applied upon successful unlock |
| `--heelslide-error-color` | `#ef4444` | Accent color applied on reset deviation |
| `--heelslide-cursor` | `grab` | Idle cursor style |
| `--heelslide-cursor-active` | `grabbing` | Active drag cursor style |

---

## Numbered Heels & CSS Counters

To assist users navigating multi-turn paths, enable the `numberedHeels` prop:

- **React**: `<Heelslide numberedHeels={true} />`
- **Vue**: `<Heelslide :numbered-heels="true" />`
- **Svelte**: `<Heelslide numberedHeels={true} />`

When enabled, each heel marker renders a centered SVG `<text class="heelslide-heel-text">` showing its 1-based sequence index.

Additionally, every `.heelslide-container` defines standard CSS counters:
- `counter-reset: heelslide-heel;` on `.heelslide-container`
- `counter-increment: heelslide-heel;` on `.heelslide-heel-group`

This enables pure CSS custom styling or pseudo-elements without requiring manual DOM counting.

---

## Development

Heelslide uses the **Cooper Spec-Driven Development (SDD)** lifecycle and **[Troop](https://github.com/twoBoots/troop)** worktree isolation:

1. **Start a track**:
   ```bash
   git agent-start <track_id>
   ```
2. **Execution standards**:
   - TDD Red -> Green -> Refactor cycle.
   - Vitest line/branch/function coverage >80%.
   - Format and lint checks via `oxlint` and `oxc`.
3. **CI & Release**:
   - CI runs on open Pull Requests targeting `main`.
   - Merges to `main` trigger automated SemVer release packaging and GitHub Pages demo deployment.

See [AGENTS.md](AGENTS.md) and [.cooper/index.md](.cooper/index.md) for workflow details.

---

## License

MIT © [twoBoots](https://github.com/twoBoots)
