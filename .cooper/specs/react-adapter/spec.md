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
The component MUST style its SVG and container elements using `--heelslide-*` CSS custom properties with resilient default fallbacks.

- **GIVEN** custom CSS properties defined on the component (e.g., `--heelslide-track-active`, `--heelslide-handle-bg`)
- **WHEN** rendered in the DOM
- **THEN** styles MUST consume the CSS custom properties falling back to default theme values if unset.

### Requirement: Ref Forwarding
- **GIVEN** a ref passed to `<Heelslide ref={ref} />`
- **WHEN** the component mounts
- **THEN** the ref MUST reference the container HTMLDivElement.

### Requirement: Feedback Component Props
`<Heelslide />` MUST expose `haptics`, `sound`, and `onTurn` as first-class component props.

- **GIVEN** `<Heelslide haptics={true} sound={{ volume: 0.5 }} onTurn={handleTurn} />`
- **WHEN** pointer interactions occur on the component
- **THEN** feedback triggers and turn callbacks MUST be executed without requiring custom hook orchestration.
