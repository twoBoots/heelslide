# Capability Specification: Vue 3 Adapter (`vue-adapter`)

## Capability: Headless Composable (`useHeelslide`)

### Requirement: Reactive State Binding
The composable MUST expose reactive refs tracking the underlying `HeelslideEngine` state.

- **GIVEN** an initialized `useHeelslide()` composable
- **WHEN** engine lifecycle transitions occur (start, update, unlock, reset)
- **THEN** `state`, `progress`, `track`, and `currentSegmentIndex` MUST reactively update their values.

### Requirement: Coordinate Extraction & Event Normalization
The composable MUST accept either native `PointerEvent` objects or explicit `{ x, y }` coordinates.

- **GIVEN** a pointer event targeted at or inside the container element
- **WHEN** `startGesture(event)` or `updateGesture(event)` is invoked
- **THEN** coordinates MUST be normalized relative to the container's bounding rectangle before invoking engine tracking.

### Requirement: Path Regeneration & Reset Controls
- **GIVEN** an active or completed composable instance
- **WHEN** `reset()` is called
- **THEN** the engine MUST revert to `idle` state and progress MUST return to 0.
- **WHEN** `regeneratePath()` is called
- **THEN** a new track MUST be generated, resetting state and updating the `track` ref.

### Requirement: Feedback Composable Options
The composable MUST support `haptics`, `sound`, and `onTurn` options in its initialization arguments.

- **GIVEN** `useHeelslide({ haptics: true, sound: true, onTurn: handleTurn })`
- **WHEN** gesture tracking navigates heels or triggers state changes
- **THEN** feedback effects MUST execute and the `onTurn` callback MUST be invoked.

## Capability: Presentation Component (`<Heelslide />`)

### Requirement: Procedural SVG Path Rendering
The component MUST render an SVG representation of the rectilinear track with distinct visual markers.

- **GIVEN** a valid track configuration
- **WHEN** `<Heelslide />` is mounted
- **THEN** it MUST render an SVG element containing background track segments, heel corner markers, and destination target.

### Requirement: Visual Progress Highlighting
- **GIVEN** an active gesture with progress > 0
- **WHEN** the handle is dragged along the track
- **THEN** a progress path overlay MUST visually reflect the exact traversed length up to the current handle position.

### Requirement: Dual Props Callbacks and Emits Support
The component MUST support both callback props (`onUnlock`, `onReset`, `onProgress`, `onStateChange`) and standard Vue emits (`unlock`, `reset`, `progress`, `stateChange`).

- **GIVEN** a `<Heelslide @unlock="handleUnlock" :onUnlock="propUnlock" />` component
- **WHEN** the slider reaches the destination
- **THEN** both the `@unlock` event MUST be emitted and the `:onUnlock` callback MUST be invoked.

### Requirement: Native Pointer Capture & Teardown
The component MUST maintain uninterrupted gesture tracking via Pointer Capture and cleanly release resources on unmount.

- **GIVEN** a pointer down event on the slider handle
- **WHEN** the pointer moves outside the component bounding box
- **THEN** pointer capture MUST remain retained on the handle element until gesture completion or cancellation.
- **GIVEN** an active gesture
- **WHEN** the component is unmounted
- **THEN** all pointer listeners and active captures MUST be safely released without memory leaks or uncaught exceptions.

### Requirement: CSS Custom Properties Customization
The component MUST expose and adhere to expanded canonical `--heelslide-handle-*`, heel, target heel, goal, and typography CSS variables with built-in fallbacks and dynamic state transitions.

- **GIVEN** custom CSS properties defined on the container or ancestor (`--heelslide-track-width`, `--heelslide-track-start-radius`, `--heelslide-track-end-radius`, `--heelslide-track-heel-radius`, `--heelslide-heel-radius`, `--heelslide-heel-bg`, `--heelslide-heel-border-color`, `--heelslide-heel-border-width`, `--heelslide-heel-padding`, `--heelslide-target-heel-bg`, `--heelslide-target-heel-border-color`, `--heelslide-target-heel-border-width`, `--heelslide-target-heel-scale`, `--heelslide-goal-bg`, `--heelslide-goal-border-color`, `--heelslide-goal-border-width`, `--heelslide-heel-font-family`, `--heelslide-heel-font-size`, `--heelslide-heel-font-weight`, `--heelslide-heel-text-color`, `--heelslide-target-heel-text-color`, `--heelslide-heel-completed-color`, `--heelslide-handle-bg`, `--heelslide-handle-border-color`, `--heelslide-handle-border-width`, `--heelslide-handle-active-bg`, `--heelslide-handle-checkpoint-bg`, `--heelslide-handle-active-scale`, `--heelslide-success-color`, `--heelslide-error-color`)
- **WHEN** the component is rendered
- **THEN** styles MUST cascade to the SVG track stroke, corner and endpoint markers, typography, and handle circle with backwards-compatible fallbacks.

### Requirement: Numbered Heels & CSS Counter Integration
The component MUST support numbering heel markers via prop and standard CSS counters.

- **GIVEN** `numberedHeels` prop enabled on `<Heelslide />`
- **WHEN** the component is rendered
- **THEN** each heel marker MUST render within a group element exposing `counter-increment: heelslide-heel` and containing centered SVG `<text class="heelslide-heel-text">` displaying the 1-based heel sequence number.
- **AND** the container MUST declare `counter-reset: heelslide-heel`.
- **AND** the active upcoming heel marker MUST receive `data-target="true"` and class `.heelslide-target`.

### Requirement: Dual Feedback Props and Emits Support
The component MUST expose `haptics`, `sound`, and `onTurn` props alongside a `@turn` emit.

- **GIVEN** `<Heelslide :haptics="true" :sound="true" @turn="onTurn" :onTurn="propTurn" />`
- **WHEN** a heel vertex is crossed
- **THEN** both the `@turn` event MUST be emitted with the heel index and the `:onTurn` callback MUST be invoked.
- **WHEN** unlock or reset conditions occur
- **THEN** audio and haptic feedback cues MUST execute according to configured options.

## Capability: Segmented Multi-Gesture Support

### Requirement: Segmented Props & Emits
The Vue `<Heelslide />` component and composable MUST support `segmented` and `checkpointTimeoutMs` props and emit `checkpoint` events.

- **GIVEN** `<Heelslide :segmented="true" :checkpoint-timeout-ms="3000" @checkpoint="onCheckpoint" />`
- **WHEN** mounted and interacted with
- **THEN** segmented behavior MUST be enforced and the `checkpoint` event emitted upon reaching and releasing at heel vertices.

### Requirement: Checkpoint State Synchronization
- **GIVEN** an active gesture pausing at a heel in segmented mode
- **WHEN** pointer release occurs
- **THEN** the root container element MUST reflect `data-state="checkpoint"`.
