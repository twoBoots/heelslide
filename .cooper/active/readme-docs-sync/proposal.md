# Proposal: Repository README & GitHub Pages Synchronization

## Context & Problem
Over recent release cycles, Heelslide has expanded into a mature, production-grade 2D intentional gesture gate across React, Vue, Svelte, and vanilla TypeScript. Major capabilities recently merged include:
1. **Interactive Documentation & Playground**: An adaptive GitHub Pages application (`https://twoboots.github.io/heelslide/`) featuring live slider manipulation, design presets, real-time CSS variable tuning, multi-framework code snippet generation, and reference guides.
2. **Mobile Responsiveness**: Complete touch-friendly viewport adaptations for the documentation site (PR #27), eliminating horizontal overflow on mobile screens.
3. **Handle Customization**: Nested icon children and scoped slots across all adapters (PR #24), allowing developers to embed lock icons, status spinners, or custom SVGs directly inside the draggable handle.
4. **Segmented Multi-Gesture Checkpoints**: Checkpoint-based authentication allowing users to lift and resume pointer contacts at turns without losing gesture state (PR #13).
5. **Expanded CSS Custom Properties**: New design tokens including `--heelslide-handle-size`, `--heelslide-handle-shadow`, `--heelslide-handle-checkpoint-shadow`, and `--heelslide-handle-checkpoint-border-color`.

However, the repository root `README.md` has fallen behind these developments:
- **No Prominent Demo Link**: Visitors landing on GitHub cannot quickly access the live interactive demo at `https://twoboots.github.io/heelslide/`. The URL is buried in docs app config files and CI workflows.
- **Missing Quick Start Guide**: There are no copyable package installation commands (`npm i @heelslide/react @heelslide/core`) or starter code snippets in the README.
- **Undocumented Handle Slots**: The handle customization API (`children` in React/Svelte, `#handle` scoped slot in Vue) and its CSS tokens are omitted.
- **Undocumented Segmented Gestures**: The `mode="segmented"` option and `checkpointTimeoutMs` are not featured in the overview or capabilities list.

## User Value & Goals
- **Instant Live Demonstration**: Provide a prominent GitHub Pages badge and tip callout directly at the top of the README, allowing developers, security reviewers, and open-source visitors to immediately test the component in action.
- **Fast Developer Onboarding**: Offer copyable installation commands and clean, idiomatic quick-start code snippets for React, Vue, and Svelte directly on the README.
- **Accurate Feature Representation**: Document recent high-value capabilities (handle customization slots, segmented gestures, mobile responsiveness, and new CSS tokens) while preserving the comprehensive Accessibility and CSS documentation.

## Scope Boundaries
- **In Scope**:
  - `README.md`: Add live demo badge and prominent hero tip banner; add Quick Start & Installation section with multi-framework snippets; document Handle Customization (React, Vue, Svelte); document Segmented Multi-Gesture Checkpoints; add mobile responsiveness to Core Capabilities; update CSS Custom Properties table with new handle tokens.
  - Automated test in `apps/docs/src/__tests__/readme.test.ts` (or equivalent) validating `README.md` contains the active demo URL, all published packages, and documented handle slots.
  - Spec Delta: `.cooper/active/readme-docs-sync/spec-deltas/docs-playground/spec.md`.
- **Out of Scope**:
  - Modifying source code or build configuration in `@heelslide/core`, `@heelslide/react`, `@heelslide/vue`, `@heelslide/svelte`, or `apps/docs`.
