# Spec Delta: React Adapter (`react-adapter`)

## Capability: Presentation Component (`<Heelslide />`)

### Requirement: Theming via CSS Custom Properties
The component MUST style its SVG, markers, typography, and handle elements using expanded `--heelslide-*` CSS custom properties with resilient default fallbacks and state-driven styling.

- - **THEN** styles MUST consume the custom properties on track paths, markers, and handle elements with backwards-compatible fallbacks to legacy handle and endpoint variables, reflecting active, target, and checkpoint states dynamically.
+ - **THEN** styles MUST consume the custom properties on track paths, markers, and handle elements with backwards-compatible fallbacks to legacy handle and endpoint variables, reflecting active, target, and checkpoint states dynamically.
+ - **AND** the handle container `[data-heelslide-handle]` MUST apply `borderRadius: var(--heelslide-handle-border-radius, 8px)`, defaulting to an 8px rounded square and allowing custom values (0px for sharp square, 12px-16px for squircle, 50% for circle).
