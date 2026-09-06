# Spec Delta: React Adapter (`react-adapter`)

## Capability: Presentation Component (`<Heelslide />`)

### Requirement: Theming via CSS Custom Properties
The component MUST style its SVG and container elements using expanded `--heelslide-*` CSS custom properties with resilient default fallbacks.

- - **GIVEN** custom CSS properties defined on the component (e.g., `--heelslide-track-active`, `--heelslide-handle-bg`)
- - **WHEN** rendered in the DOM
- - **THEN** styles MUST consume the CSS custom properties falling back to default theme values if unset.
+ - **GIVEN** custom CSS variables defined for track width, radii, heel padding, and slider appearance (`--heelslide-track-width`, `--heelslide-track-start-radius`, `--heelslide-track-end-radius`, `--heelslide-track-heel-radius`, `--heelslide-heel-radius`, `--heelslide-heel-padding`, `--heelslide-slider-border-color`, `--heelslide-slider-bg`)
+ - **WHEN** rendered in the DOM
+ - **THEN** styles MUST consume the custom properties on track paths, markers, and handle elements with backwards-compatible fallbacks to legacy handle and endpoint variables.
