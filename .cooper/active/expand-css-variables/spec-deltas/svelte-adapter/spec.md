# Spec Delta: Svelte 5 Adapter (`svelte-adapter`)

## Capability: Presentation Component (`<Heelslide />`)

### Requirement: CSS Custom Properties Theming Parity
The component MUST expose and adhere to expanded canonical `--heelslide-handle-*`, heel, target heel, goal, and typography CSS variables with built-in fallbacks and dynamic state transitions.

- - **GIVEN** custom `--heelslide-*` CSS variables applied to the container or ancestor
- - **WHEN** the component is rendered
- - **THEN** styles MUST cascade to the SVG track, heel markers, handle, and progress paths.
+ - **GIVEN** custom CSS properties defined on the container or ancestor (`--heelslide-track-width`, `--heelslide-track-start-radius`, `--heelslide-track-end-radius`, `--heelslide-track-heel-radius`, `--heelslide-heel-radius`, `--heelslide-heel-bg`, `--heelslide-heel-border-color`, `--heelslide-heel-border-width`, `--heelslide-heel-padding`, `--heelslide-target-heel-bg`, `--heelslide-target-heel-border-color`, `--heelslide-target-heel-border-width`, `--heelslide-target-heel-scale`, `--heelslide-goal-bg`, `--heelslide-goal-border-color`, `--heelslide-goal-border-width`, `--heelslide-heel-font-family`, `--heelslide-heel-font-size`, `--heelslide-heel-font-weight`, `--heelslide-heel-text-color`, `--heelslide-target-heel-text-color`, `--heelslide-heel-completed-color`, `--heelslide-handle-bg`, `--heelslide-handle-border-color`, `--heelslide-handle-border-width`, `--heelslide-handle-active-bg`, `--heelslide-handle-checkpoint-bg`, `--heelslide-handle-active-scale`, `--heelslide-success-color`, `--heelslide-error-color`)
+ - **WHEN** the component is rendered
+ - **THEN** styles MUST cascade to the SVG track stroke, corner and endpoint markers, typography, and handle circle with backwards-compatible fallbacks to legacy `--heelslide-handle-color` and `--heelslide-slider-*` tokens.

### Requirement: Numbered Heels & CSS Counter Integration
The component MUST support numbering heel markers via prop and standard CSS counters.

+ - **GIVEN** `numberedHeels={true}` set on `<Heelslide />`
+ - **WHEN** the component is rendered
+ - **THEN** each heel marker MUST render within a group element exposing `counter-increment: heelslide-heel` and containing centered SVG `<text class="heelslide-heel-text">` displaying the 1-based heel sequence number.
+ - **AND** the container MUST declare `counter-reset: heelslide-heel`.
+ - **AND** the active upcoming heel marker MUST receive `data-target="true"` and class `.heelslide-target`.
