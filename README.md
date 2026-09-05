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
- **Testing & Quality**: Strict >80% test coverage via Vitest, visual regression tests via Playwright, and linting/formatting via Oxc.

---

## Repository Structure

```text
heelslide/
├── packages/
│   ├── core/      # Framework-agnostic engine and path generator
│   ├── react/     # React 18/19 wrapper
│   └── vue/       # Vue 3 wrapper
├── apps/
│   └── docs/      # Live documentation, configurator, and GitHub Pages demo
├── .cooper/       # Living specs and SDD track history
└── .worktrees/    # Troop worktree isolation canopy
```

---

## Styling

All component styling is customised using namespaced CSS custom properties:

```css
:root {
  --heelslide-track-bg: #1e293b;
  --heelslide-track-active: #3b82f6;
  --heelslide-slider-bg: #ffffff;
  --heelslide-slider-size: 48px;
  --heelslide-heel-indicator: #60a5fa;
  --heelslide-border-radius: 24px;
}
```

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
