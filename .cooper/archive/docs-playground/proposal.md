# Proposal: Interactive Documentation & Demo Playground

## 1. Problem Statement
Heelslide is an intentional-gesture security gate component system with a procedural 2D rectilinear track engine and framework adapters (`@heelslide/core`, `@heelslide/react`, `@heelslide/vue`). While packages are tested, developers and security engineers need an interactive, browser-based demonstration application to:
1. Experience the physical security gate interaction directly on touchscreen and pointer devices.
2. Interactively tweak parameters (heel counts, tolerances, dimensions, seeds, CSS variables).
3. Test edge scenarios (pocket swipe simulation, accidental tap rejection, tolerance breaches).
4. Inspect copy-pasteable installation and integration snippets across vanilla TypeScript, React, and Vue.
5. Deploy continuously to GitHub Pages to serve as the live public showcase.

## 2. Intent & Goals
- Scaffold `apps/docs` as a high-performance web application built with Vite and React, consuming `@heelslide/react` and demonstrating `@heelslide/vue` and `@heelslide/core`.
- Provide an interactive configurator for real-time manipulation of all engine and UI parameters.
- Provide a responsive layout adhering to the `twoBoots` radical conciseness and industrial aesthetic.
- Include unit/component tests for documentation features and verify clean production builds targeting GitHub Pages (`apps/docs/dist`).

## 3. Scope Boundaries
- In-Scope:
  - `apps/docs` workspace package setup with Vite and TypeScript.
  - Interactive playground UI with live slider preview, unlock feedback, and reset counter.
  - Controls panel for heels count (1-4), tolerance, width, height, seed, disabled mode, and CSS variables.
  - Framework tab switcher displaying code snippets for Core, React, and Vue.
  - Production build pipeline outputting static assets compatible with GitHub Pages base path (`/heelslide/`).
- Out-of-Scope:
  - Backend server / database (docs app is fully static client-side).
  - External telemetry or third-party analytics trackers.
