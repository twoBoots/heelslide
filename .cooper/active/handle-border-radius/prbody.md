# Pull Request: Support `--heelslide-handle-border-radius` across Adapters and Playground (`handle-border-radius`)

## Overview
This PR implements Cooper track `handle-border-radius`, introducing `--heelslide-handle-border-radius` (defaulting to `8px` rounded square) across all presentation adapters (React, Vue, Svelte), adding full configurator and preset support to the documentation playground, and documenting the variable in reference tables and `README.md`.

Previously, `--heelslide-handle-radius` configured the circle radius ($r$) for SVG adapters, but the handle was always rendered as a circle without corner radius customization. Now, consumers can fully customize the handle aesthetic from a sharp square (`0px`) to a subtle rounded square (`8px`, default) to a squircle (`12px-16px`) up to a full circle (`50%` or matching half-size).

## Spec Delta Summary

### Presentation Adapters (`react-adapter`, `vue-adapter`, `svelte-adapter`)
- **Added (`+`)**: Support custom corner radius via `--heelslide-handle-border-radius`, defaulting to `8px` (rounded square) with support for `0px` (square) to `50%` (circle).
- **Added (`+`)**: In SVG adapters (Vue and Svelte), the handle element renders as a centered SVG `<rect>` carrying classes `.heelslide-handle-shape` and `.heelslide-handle-circle` with matching width/height dimensions (`32`) and corner radius attributes (`rx`/`ry`), preserving full backwards compatibility for existing CSS selectors.

### Documentation & Playground (`docs-playground`)
- **Added (`+`)**: Added `Handle Corner Radius` slider (`#ctrl-handle-border-radius`) and preset updates to `apps/docs/src/components/ConfigPanel.tsx`.
- **Added (`+`)**: Real-time styling updates on live stage simulator viewport and code snippet generation for React, Vue, and Svelte.
- **Added (`+`)**: Documented `--heelslide-handle-border-radius` in `DocsReference.tsx` and root `README.md` CSS Custom Properties tables, and added `.heelslide-handle-shape` to the CSS Selectors Reference table.

## Completed Phases & Checkpoints
- **Phase 1: Multi-Adapter Presentation Components**
  - Commit `f7ea2be`: React adapter border radius support
  - Commit `4dcc0dc`: Vue adapter SVG rect handle shape and border radius support
  - Commit `09eca98`: Svelte adapter SVG rect handle shape and border radius support
  - Commit `d7e7986`: Phase 1 Checkpoint
- **Phase 2: Docs Playground, Configurator & Snippet Generation**
  - Commit `95f69e1`: Handle border radius slider, presets, live stage styling, and code snippet generation
  - Commit `f715bd0`: Phase 2 Checkpoint
- **Phase 3: Reference Documentation, README & Final Verification**
  - Commit `9fa56eb`: Documented `--heelslide-handle-border-radius` in `README.md` and `DocsReference.tsx`
  - Commit `b3033f3`: Phase 3 Checkpoint

## Verification Results
- **Unit & Component Tests**: 49 test files, 505 tests passing (`CI=true npm test`).
- **Static Analysis**: Oxlint clean (0 errors, 0 warnings across 94 files).
- **TypeScript**: `npm run typecheck` clean (0 errors).
- **Monorepo Build**: `npm run build` completed successfully across `@heelslide/core`, `@heelslide/react`, `@heelslide/svelte`, `@heelslide/vue`, and `@heelslide/docs`.
