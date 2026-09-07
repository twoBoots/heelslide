# Heelslide

> Intentional-gesture security gate UI component for touchscreen web applications.

[![CI](https://github.com/twoBoots/heelslide/actions/workflows/ci.yml/badge.svg)](https://github.com/twoBoots/heelslide/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Cooper SDD](https://img.shields.io/badge/SDD-Cooper%20Framework-brightgreen)](.cooper/index.md)
[![Troop Canopy](https://img.shields.io/badge/Worktrees-Troop-orange)](https://github.com/twoBoots/troop)

---

## Overview

Standard slide-to-unlock components require a simple 1D linear swipe. On touchscreen devices, 1D swipes frequently trigger unintentionally inside pockets or from accidental screen contact.

Heelslide acts as a security gate for destructive or sensitive operations (e.g. payments, account deletions, production deployments). Rather than a straight line, Heelslide generates a 2D path containing 90-degree directional changes ("heels"). The user must guide the thumb through each heel to confirm intent and complete the action.

---

## Core Capabilities

- **Configurable Heels**: Set a fixed heel count or a `[min, max]` range for procedural track generation.
- **Gesture Verification**: PointerEvents tracking that validates continuous movement along the generated path within tolerance bounds.
- **CSS Customisation**: Zero runtime CSS-in-JS. Visual styling is configured via namespaced CSS variables (`--heelslide-*`).
- **Multi-Framework Adapters**:
  - `@heelslide/core`: Zero-dependency gesture engine, geometry validation, and path generator.
  - `@heelslide/react`: React 18/19 component wrapper (`<Heelslide />`) and `useHeelslide` hook.
  - `@heelslide/vue`: Vue 3 component wrapper (`<Heelslide />`) and `useHeelslide` composable.
  - `@heelslide/svelte`: Svelte 5 component wrapper (`<Heelslide />`) and `createHeelslide` rune composable.
- **Testing & Quality**: Strict >80% test coverage via Vitest, visual regression tests via Playwright, and linting/formatting via Oxc.

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
| `--heelslide-handle-radius` | `18px` | Handle circle radius |
| `--heelslide-handle-bg` | `#ffffff` | Handle fill color (aliases: `--heelslide-slider-bg`, `--heelslide-handle-color`) |
| `--heelslide-handle-border-color` | `#3b82f6` | Handle border stroke color |
| `--heelslide-handle-border-width` | `2px` | Handle border stroke width |
| `--heelslide-handle-active-scale` | `1.05` | Transform scale during active pointer drag |
| `--heelslide-handle-active-bg` | `--heelslide-handle-bg` | Handle fill color while actively dragging |
| `--heelslide-handle-checkpoint-bg` | `--heelslide-handle-active-bg` | Handle fill color when paused at a checkpoint |
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
