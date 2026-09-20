# Spec Delta: Documentation & Playground (`docs-playground`)

## Capability: Interactive Demonstration Playground

### Requirement: Multi-Framework Code Snippets
The app MUST generate and display copyable code examples matching the current playground parameters across Vanilla JS/TS, React, Vue, and Svelte, adhering to framework-specific style conventions.

- **GIVEN** any active framework tab (React, Vue, Svelte)
- **WHEN** width and height are configured in the playground
- **THEN** `--heelslide-width` and `--heelslide-height` MUST be output as live-updated CSS custom properties alongside other theme variables.
+ - **WHEN** `customHandleIcon` is enabled in the playground
+ - **THEN** React snippets MUST render custom icon children within `<Heelslide>`, Vue snippets MUST render `<template #handle="{ state }">`, and Svelte snippets MUST render child icon markup.

### Requirement: On-Page Configuration & CSS Variables Reference
The documentation application MUST render a comprehensive reference guide documenting all engine/component options and CSS custom properties directly on the page.

- **GIVEN** the documentation page loaded in a browser
- **WHEN** the user scrolls to the documentation reference section
- **THEN** complete tables of component props, event callbacks, and `--heelslide-*` CSS custom properties MUST be visible with types, default values, and usage descriptions.
+ - **AND** the CSS custom properties reference table MUST include entries for `--heelslide-handle-size`, `--heelslide-handle-radius`, `--heelslide-handle-shadow`, `--heelslide-handle-checkpoint-shadow`, and `--heelslide-handle-checkpoint-border-color`.
+ - **AND** the component API reference table MUST document the `children` prop and Vue `#handle` scoped slot for handle customization.
+ - **AND** a dedicated Handle & Headless guide tab MUST display copyable code examples for custom handle icons across React, Vue, and Svelte, headless hook usage (`useHeelslide` / `getHandleProps`), and standard CSS selectors (`[data-heelslide-handle]`, `.heelslide-handle`, `.heelslide-handle-circle`).

### Requirement: Interactive Handle Customization Controls
+ The documentation playground MUST provide an interactive control to toggle custom handle content and preview nested icons in real time.
+ 
+ - **GIVEN** the interactive control panel in `apps/docs`
+ - **WHEN** the user toggles the "Custom Handle Icon" control
+ - **THEN** the live preview handle MUST render a centered lock icon and framework code snippets MUST reflect the corresponding children or slot markup.
