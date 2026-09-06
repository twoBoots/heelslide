# Spec Delta: Vue 3 Adapter (`vue-adapter`)

## Capability: Presentation Component (`<Heelslide />`)

### Requirement: CSS Custom Properties Customization
The component MUST expose and adhere to expanded `--heelslide-*` CSS variables with built-in fallbacks.

- - **GIVEN** custom `--heelslide-track-bg` or `--heelslide-track-progress` styles applied to the container or ancestor
- - **WHEN** the component is rendered
- - **THEN** styles MUST cascade to the SVG track elements.
+ - **GIVEN** custom CSS properties defined on the container or ancestor (`--heelslide-track-width`, `--heelslide-track-start-radius`, `--heelslide-track-end-radius`, `--heelslide-track-heel-radius`, `--heelslide-heel-radius`, `--heelslide-heel-padding`, `--heelslide-slider-border-color`, `--heelslide-slider-bg`)
+ - **WHEN** the component is rendered
+ - **THEN** styles MUST cascade to the SVG track stroke, corner and endpoint markers, and handle circle with backwards-compatible fallbacks.
