# Proposal: Custom Handle Border Radius & Geometric Shapes (`handle-border-radius`)

## Context & Problem
Currently, the interactive draggable handle across all three component adapters (React, Vue, Svelte) is locked into a circular presentation:
1. **React (`@heelslide/react`)**: The handle renders as an HTML `div` with hardcoded `borderRadius: '50%'`.
2. **Vue (`@heelslide/vue`)**: The handle renders as an SVG `<circle class="heelslide-handle-circle">` with geometric radius `r: var(--heelslide-handle-radius)`.
3. **Svelte (`@heelslide/svelte`)**: The handle renders identically to Vue as an SVG `<circle class="heelslide-handle-circle">`.
4. **Ambiguous Theming Nomenclature**: The existing `--heelslide-handle-radius` CSS property represents the geometric circle radius ($r$) rather than a CSS `border-radius`. Consumers attempting to style square, rounded-square, or squircle handles with CSS `border-radius` find that the handle remains permanently circular.

## User Value & Goals
- **Configurable Handle Geometry**: Introduce `--heelslide-handle-border-radius` across React, Vue, and Svelte, allowing consumers to style the handle as a subtle rounded square (the new default of `8px`), a sharp square (`0px`), a pill/squircle (`12px`-`16px`), or a classic circle (`50%`).
- **Unified Adapter Parity**: Ensure that React, Vue, and Svelte render matching handle shapes when `--heelslide-handle-border-radius` is configured.
- **Playground & Code Generation**: Expose an interactive "Handle Corner Radius" control in the documentation playground (`apps/docs`), supporting instant visual preview, curated presets, and multi-framework code snippet generation.
- **Documentation Clarity**: Clearly document `--heelslide-handle-border-radius` in the CSS custom properties tables and README, distinguishing it from `--heelslide-handle-radius`.

## Scope Boundaries
- **In Scope**:
  - `packages/react`: Update `<Heelslide />` handle container style to consume `var(--heelslide-handle-border-radius, 8px)`. Update `style.css`.
  - `packages/vue`: Update `<Heelslide />` handle to render an SVG `<rect class="heelslide-handle-shape heelslide-handle-circle">` supporting `rx` / `ry` and `var(--heelslide-handle-border-radius, 8px)`. Update `style.css`.
  - `packages/svelte`: Update `<Heelslide />` handle to render an SVG `<rect class="heelslide-handle-shape heelslide-handle-circle">` supporting `rx` / `ry` and `var(--heelslide-handle-border-radius, 8px)`. Update `style.css`.
  - `apps/docs`: Add handle border radius control in `ConfigPanel.tsx` / `ThemeControls.tsx`, update `snippets.ts` code generation, update `DocsReference.tsx` and `README.md`.
  - Unit and integration tests covering the new `--heelslide-handle-border-radius` behavior across all three framework adapters and docs.
- **Out of Scope**:
  - Modifying the core gesture math engine (`@heelslide/core`)—hit testing and tolerance tracking remain based on coordinate distance to the path segment.
