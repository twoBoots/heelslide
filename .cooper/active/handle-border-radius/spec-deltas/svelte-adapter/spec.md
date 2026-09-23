# Spec Delta: Svelte Adapter (`svelte-adapter`)

## Capability: Presentation Component (`<Heelslide />`)

### Requirement: Theming via CSS Custom Properties
The component MUST style its SVG, markers, typography, and handle elements using expanded `--heelslide-*` CSS custom properties with resilient default fallbacks and state-driven styling.

- - **THEN** styles MUST consume custom properties for track paths, markers, and handle elements with backwards-compatible fallbacks, reflecting active, target, and checkpoint states.
+ - **THEN** styles MUST consume custom properties for track paths, markers, and handle elements with backwards-compatible fallbacks, reflecting active, target, and checkpoint states.
+ - **AND** the handle MUST support custom corner radius via `--heelslide-handle-border-radius`, defaulting to 8px (rounded square) and supporting 0px (square) up to 50% (circle).
+ - **AND** the handle element MUST render as an SVG shape carrying classes `.heelslide-handle-shape` and `.heelslide-handle-circle`, centered at the current handle coordinates with matching width/height dimensions.
