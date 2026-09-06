# Spec Delta: React Adapter (`react-adapter`)

## Capability: Presentation Component (`<Heelslide />`)

### Requirement: Theming via CSS Custom Properties
The component MUST style its SVG, markers, typography, and handle elements using expanded `--heelslide-*` CSS custom properties with resilient default fallbacks and state-driven styling.

- - **GIVEN** custom CSS properties defined on the component (e.g., `--heelslide-track-active`, `--heelslide-handle-bg`)
- - **WHEN** rendered in the DOM
- - **THEN** styles MUST consume the CSS custom properties falling back to default theme values if unset.
+ - **GIVEN** custom CSS variables defined for track width, radii, heel clearance padding, heel background/borders, target heel background/border, target goal background/border, heel typography, canonical handle tokens, and interaction states (`--heelslide-track-width`, `--heelslide-track-start-radius`, `--heelslide-track-end-radius`, `--heelslide-track-heel-radius`, `--heelslide-heel-radius`, `--heelslide-heel-bg`, `--heelslide-heel-border-color`, `--heelslide-heel-border-width`, `--heelslide-heel-padding`, `--heelslide-target-heel-bg`, `--heelslide-target-heel-border-color`, `--heelslide-target-heel-border-width`, `--heelslide-target-heel-scale`, `--heelslide-goal-bg`, `--heelslide-goal-border-color`, `--heelslide-goal-border-width`, `--heelslide-heel-font-family`, `--heelslide-heel-font-size`, `--heelslide-heel-font-weight`, `--heelslide-heel-text-color`, `--heelslide-target-heel-text-color`, `--heelslide-heel-completed-color`, `--heelslide-handle-bg`, `--heelslide-handle-border-color`, `--heelslide-handle-border-width`, `--heelslide-handle-active-bg`, `--heelslide-handle-checkpoint-bg`, `--heelslide-handle-active-scale`, `--heelslide-success-color`, `--heelslide-error-color`)
+ - **WHEN** rendered in the DOM
+ - **THEN** styles MUST consume the custom properties on track paths, markers, and handle elements with backwards-compatible fallbacks to legacy handle and endpoint variables, reflecting active, target, and checkpoint states dynamically.

### Requirement: Numbered Heels & CSS Counter Integration
The component MUST support numbering heel markers via an optional prop and standard CSS counters.

+ - **GIVEN** `numberedHeels={true}` set on `<Heelslide />` or CSS counter styles applied
+ - **WHEN** the component renders heel direction markers
+ - **THEN** each heel marker MUST render within a group element exposing `counter-increment: heelslide-heel` and containing centered SVG `<text class="heelslide-heel-text">` displaying the 1-based heel sequence number.
+ - **AND** the container MUST declare `counter-reset: heelslide-heel` to support pure CSS counter styling.
+ - **AND** the active upcoming heel marker MUST receive `data-target="true"` and class `.heelslide-target` to enable target typography and border styling.
