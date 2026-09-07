# Spec Delta: Documentation & Playground (`docs-playground`)

## Capability: Interactive Demonstration Playground

### Requirement: Documentation Header Version Badge
The documentation header MUST dynamically display the active version of the Heelslide package suite.

+ - **GIVEN** the documentation header loaded in the browser
+ - **WHEN** the header renders the title group badge
+ - **THEN** it MUST display `v` followed by the exported `VERSION` constant from `@heelslide/core`.

### Requirement: Expanded CSS Variable Customization Controls
The playground MUST provide granular sliders and color pickers for all expanded component geometry and theming variables.

+ - **GIVEN** the theme configuration section in the playground
+ - **WHEN** adjusting track width, handle size, heel radius, clearance padding, or target heel scale sliders
+ - **THEN** the live simulator container and generated code snippets MUST reflect the corresponding `--heelslide-*` CSS custom properties in real time.
+ - **WHEN** picking colors for handle border, heel border, target heel border, goal border, or heel text
+ - **THEN** the live simulator container and generated code snippets MUST update with the selected colors.

