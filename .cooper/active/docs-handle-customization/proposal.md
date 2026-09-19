# Track Proposal: Documentation for Handle Customization & Headless API (`docs-handle-customization`)

## Context & Motivation
Heelslide supports rich customization of the draggable handle across multiple layers:
1. **CSS Custom Properties**: Canonical handle tokens for sizes, colors, active scales, checkpoint backgrounds, checkpoint border colors, and drop shadows (`--heelslide-handle-shadow`, `--heelslide-handle-checkpoint-shadow`, `--heelslide-handle-checkpoint-border-color`).
2. **Component Children & Scoped Slots**: React and Svelte support nested children for custom icons/badges (e.g. `<Heelslide><LockIcon /></Heelslide>`), while Vue provides a scoped `#handle` slot receiving `{ position, progress, state }`.
3. **Headless Engine & Hook API**: React's `useHeelslide` and Svelte's `createHeelslide` return `getHandleProps()` and `handlePosition` `{ x, y }`, enabling developers to build completely custom handle elements from scratch.
4. **CSS Selectors**: Standard selectors (`[data-heelslide-handle]`, `.heelslide-handle`, `.heelslide-handle-circle`) for advanced styling and CSS keyframe animations.

However, the existing GitHub Pages documentation app (`apps/docs`) currently omits these advanced handle capabilities from its tables and guides. Developers visiting the docs only see a subset of CSS variables and standard component props, leaving custom handle icon injection, shadows, checkpoint styling, and headless composition undocumented.

## Scope & Objectives
- **Complete CSS Custom Properties Reference**: Add entries and descriptions for `--heelslide-handle-shadow`, `--heelslide-handle-checkpoint-shadow`, `--heelslide-handle-checkpoint-border-color`, and explicitly differentiate `--heelslide-handle-size` (React DOM) and `--heelslide-handle-radius` (SVG circle).
- **Props & Slots Documentation**: Document `children` (React/Svelte) and the `#handle` slot (Vue with scoped parameters) in the API reference table.
- **Dedicated Handle Customization Section**: Add an in-depth reference and guide section in `apps/docs` detailing:
  - Custom handle icon/badge injection with copyable code snippets for React, Vue, and Svelte.
  - Headless composition using `useHeelslide` / `createHeelslide` and `getHandleProps()`.
  - Direct CSS selector targeting (`[data-heelslide-handle]`, `.heelslide-handle`, `.heelslide-handle-circle`).
- **Interactive Handle Customization Toggle**: Support previewing a custom icon (e.g. lock/slider icon) in the playground handle and updating code snippets accordingly.
- **TDD Test Suite Coverage**: Unit tests in `DocsReference.test.tsx` and `generatorSnippet.test.ts` verifying all new handle documentation, tabs, props, and code snippet outputs.
