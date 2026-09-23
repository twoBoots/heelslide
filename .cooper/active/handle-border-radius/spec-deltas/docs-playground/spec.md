# Spec Delta: Documentation & Playground (`docs-playground`)

## Capability: Interactive Demonstration Playground

### Requirement: Expanded CSS Variable Customization Controls
The playground MUST provide granular sliders and color pickers for all expanded component geometry and theming variables.

+ - **GIVEN** the theme configuration section in the playground
+ - **WHEN** adjusting the handle border radius control
+ - **THEN** the live simulator container and generated code snippets MUST reflect `--heelslide-handle-border-radius` in real time.
+ - **WHEN** selecting design presets or inspecting the CSS reference table
+ - **THEN** `--heelslide-handle-border-radius` MUST be documented with default `8px` and category `Handle Tokens`.
