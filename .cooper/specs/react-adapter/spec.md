# Capability Specification: React Adapter (`react-adapter`)

## Capability: Headless Hook (`useHeelslide`)

### Requirement: Engine Initialization & Reactive State
The hook MUST initialize a `HeelslideEngine` instance and expose reactive state that synchronizes with engine callbacks.

- **GIVEN** hook options with bounds, heels, or tolerance
- **WHEN** `useHeelslide(options)` mounts
- **THEN** it MUST return initial state with `state: 'idle'`, `progress: 0`, a valid `track` path, and `handlePosition` at the start point.

### Requirement: Gesture Tracking & Event Prop Generators
The hook MUST provide event handler generators for container and handle interactions.

- **GIVEN** an idle hook instance
- **WHEN** `getContainerProps().onPointerDown` or `getHandleProps().onPointerDown` is called within handle bounds
- **THEN** state MUST transition to `active` and `isDragging` MUST be true.

- **GIVEN** an active gesture
- **WHEN** `getContainerProps().onPointerMove` is invoked with valid coordinates along the track
- **THEN** `progress` and `handlePosition` MUST update reactively.

- **GIVEN** an active gesture
- **WHEN** `getContainerProps().onPointerUp` is called before completion or pointer deviates beyond tolerance
- **THEN** state MUST reset to `idle`, `progress` MUST revert to 0, and `isDragging` MUST be false.

### Requirement: Path Regeneration
- **GIVEN** an existing hook instance
- **WHEN** `regenerate(options)` is called
- **THEN** the track MUST be recomputed, progress reset to 0, and handle position returned to the new starting coordinate.

### Requirement: Haptic & Audio Hook Configuration
The hook MUST accept haptic and audio feedback configuration options and forward them to the underlying engine.

- **GIVEN** `useHeelslide({ haptics: true, sound: true })`
- **WHEN** gestures advance across heels, reset, or unlock
- **THEN** tactile vibrations and synthesized audio cues MUST trigger in accordance with engine specifications.

### Requirement: Turn Callback Support
- **GIVEN** `useHeelslide({ onTurn: fn })`
- **WHEN** a heel vertex is navigated during active dragging
- **THEN** `onTurn(heelIndex)` MUST be invoked with the completed heel index.

## Capability: Presentation Component (`<Heelslide />`)

### Requirement: Procedural SVG Track Rendering
The component MUST render an SVG representation of the generated rectilinear track including all 90-degree heels.

- **GIVEN** `<Heelslide />` rendered with configured dimensions and heel count
- **WHEN** the component is mounted
- **THEN** it MUST render an SVG containing a `<path>` matching the rectilinear coordinates, circular markers at turn vertices ("heels"), and a handle element.

### Requirement: PointerEvents & Pointer Capture Integration
The component MUST bind PointerEvents with pointer capture for continuous touch tracking across viewport boundaries.

- **GIVEN** a rendered `<Heelslide />`
- **WHEN** a pointer down event fires on the handle
- **THEN** pointer capture MUST be invoked via `setPointerCapture` and released on pointer up/cancel.

### Requirement: Disabled State Support
- **GIVEN** `<Heelslide disabled={true} />`
- **WHEN** pointer interactions occur on the component
- **THEN** gestures MUST NOT start and state MUST remain `idle`.

### Requirement: Theming via CSS Custom Properties
The component MUST style its SVG, markers, typography, and handle elements using expanded `--heelslide-*` CSS custom properties with resilient default fallbacks and state-driven styling.

- **GIVEN** custom CSS variables defined for track width, radii, heel clearance padding, heel background/borders, target heel background/border, target goal background/border, heel typography, canonical handle tokens, and interaction states (`--heelslide-track-width`, `--heelslide-track-start-radius`, `--heelslide-track-end-radius`, `--heelslide-track-heel-radius`, `--heelslide-heel-radius`, `--heelslide-heel-bg`, `--heelslide-heel-border-color`, `--heelslide-heel-border-width`, `--heelslide-heel-padding`, `--heelslide-target-heel-bg`, `--heelslide-target-heel-border-color`, `--heelslide-target-heel-border-width`, `--heelslide-target-heel-scale`, `--heelslide-goal-bg`, `--heelslide-goal-border-color`, `--heelslide-goal-border-width`, `--heelslide-heel-font-family`, `--heelslide-heel-font-size`, `--heelslide-heel-font-weight`, `--heelslide-heel-text-color`, `--heelslide-target-heel-text-color`, `--heelslide-heel-completed-color`, `--heelslide-handle-bg`, `--heelslide-handle-border-color`, `--heelslide-handle-border-width`, `--heelslide-handle-active-bg`, `--heelslide-handle-checkpoint-bg`, `--heelslide-handle-active-scale`, `--heelslide-success-color`, `--heelslide-error-color`)
- **WHEN** rendered in the DOM
- **THEN** styles MUST consume the custom properties on track paths, markers, and handle elements with backwards-compatible fallbacks to legacy handle and endpoint variables, reflecting active, target, and checkpoint states dynamically.

### Requirement: Numbered Heels & CSS Counter Integration
The component MUST support numbering heel markers via an optional prop and standard CSS counters.

- **GIVEN** `numberedHeels={true}` set on `<Heelslide />` or CSS counter styles applied
- **WHEN** the component renders heel direction markers
- **THEN** each heel marker MUST render within a group element exposing `counter-increment: heelslide-heel` and containing centered SVG `<text class="heelslide-heel-text">` displaying the 1-based heel sequence number.
- **AND** the container MUST declare `counter-reset: heelslide-heel` to support pure CSS counter styling.
- **AND** the active upcoming heel marker MUST receive `data-target="true"` and class `.heelslide-target` to enable target typography and border styling.

### Requirement: Ref Forwarding
- **GIVEN** a ref passed to `<Heelslide ref={ref} />`
- **WHEN** the component mounts
- **THEN** the ref MUST reference the container HTMLDivElement.

### Requirement: Feedback Component Props
`<Heelslide />` MUST expose `haptics`, `sound`, and `onTurn` as first-class component props.

- **GIVEN** `<Heelslide haptics={true} sound={{ volume: 0.5 }} onTurn={handleTurn} />`
- **WHEN** pointer interactions occur on the component
- **THEN** feedback triggers and turn callbacks MUST be executed without requiring custom hook orchestration.
