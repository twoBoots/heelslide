# Spec Delta: Documentation & Playground (`docs-playground`)

## Capability: Interactive Demonstration Playground

### Requirement: Dynamic Configuration Controls
The app MUST provide interactive controls adjusting heel count, tolerance, dimensions, grid step, margin, and seed.

- **GIVEN** the control panel
- **WHEN** the user selects a different heel count, tolerance, width, height, grid step, or margin
- **THEN** the track MUST regenerate immediately reflecting the chosen parameters.
+ - **WHEN** the user adjusts the `gridStep` slider (e.g. 16 to 48px) or `margin` slider (e.g. 8 to 32px)
+ - **THEN** the track geometry MUST regenerate to match the updated cell constraints.

### Requirement: Expanded CSS Variable Customization Controls
The playground MUST provide granular sliders and color pickers for all expanded component geometry and theming variables.

- **GIVEN** the theme configuration section in the playground
- **WHEN** adjusting track width, handle size, heel radius, clearance padding, or target heel scale sliders
- **THEN** the live simulator container and generated code snippets MUST reflect the corresponding `--heelslide-*` CSS custom properties in real time.
+ - **WHEN** adjusting border widths or state colors (`successColor`, `errorColor`)
+ - **THEN** `--heelslide-handle-border-width`, `--heelslide-heel-border-width`, `--heelslide-target-heel-border-width`, `--heelslide-goal-border-width`, `--heelslide-success-color`, and `--heelslide-error-color` MUST update on the container and appear in code snippets.

### Requirement: Multi-Framework Code Snippets
The app MUST generate and display copyable code examples matching the current playground parameters across Vanilla JS/TS, React, Vue, and Svelte, adhering to framework-specific style conventions.

+ - **GIVEN** any active framework tab (React, Vue, Svelte)
+ - **WHEN** width and height are configured in the playground
+ - **THEN** `--heelslide-width` and `--heelslide-height` MUST be output as live-updated CSS custom properties alongside other theme variables.

+ ### Requirement: On-Page Configuration & CSS Variables Reference
+ The documentation application MUST render a comprehensive reference guide documenting all engine/component options and CSS custom properties directly on the page.
+ 
+ - **GIVEN** the documentation page loaded in a browser
+ - **WHEN** the user scrolls to the documentation reference section
+ - **THEN** complete tables of component props, event callbacks, and `--heelslide-*` CSS custom properties MUST be visible with types, default values, and usage descriptions.
