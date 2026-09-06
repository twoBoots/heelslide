# Spec Delta: Svelte 5 Adapter (`svelte-adapter`)

## Added Requirements

+ ### Capability: Headless Rune Composable (`createHeelslide`)
+ 
+ #### Requirement: Rune-Based Reactive State Binding
+ The composable MUST expose fine-grained reactive state backed by Svelte 5 runes (`$state`, `$derived`) tracking the underlying `HeelslideEngine`.
+ 
+ - **GIVEN** an initialized `createHeelslide()` composable
+ - **WHEN** engine lifecycle transitions occur (`start`, `update`, `unlock`, `reset`)
+ - **THEN** reactive state (`state`, `progress`, `track`, `currentSegmentIndex`, `handlePosition`, `isDragging`) MUST update reactively without requiring manual polling or store subscriptions.
+ 
+ #### Requirement: Coordinate Extraction & Event Normalization
+ The composable MUST accept either native `PointerEvent` objects or explicit `{ x, y }` coordinates.
+ 
+ - **GIVEN** a pointer event targeted at or within the container element
+ - **WHEN** `startGesture(event)` or `updateGesture(event)` is invoked
+ - **THEN** coordinates MUST be normalized relative to the container element's bounding client rectangle before invoking engine tracking.
+ 
+ #### Requirement: Path Regeneration & Reset Controls
+ - **GIVEN** an active or completed composable instance
+ - **WHEN** `reset()` is called
+ - **THEN** the engine MUST revert to `idle` state, progress MUST return to 0, and `isDragging` MUST be false.
+ - **WHEN** `regeneratePath()` is called
+ - **THEN** a new rectilinear track MUST be generated, resetting state, zeroing progress, and updating the reactive `track` signal.
+ 
+ ### Capability: Presentation Component (`<Heelslide />`)
+ 
+ #### Requirement: Procedural SVG Path Rendering
+ The component MUST render an SVG representation of the rectilinear track with distinct visual markers using Svelte 5 `$props()`.
+ 
+ - **GIVEN** a valid track configuration
+ - **WHEN** `<Heelslide />` is mounted in the DOM
+ - **THEN** it MUST render an SVG element containing background track segments, heel corner markers at each 90-degree turn, and a destination target indicator.
+ 
+ #### Requirement: Visual Progress Highlighting
+ - **GIVEN** an active gesture with progress > 0
+ - **WHEN** the handle is dragged along the track
+ - **THEN** an overlay progress path MUST visually reflect the exact traversed length up to the current handle position.
+ 
+ #### Requirement: Svelte 5 Event Callback Bridging
+ The component MUST support standard Svelte 5 event callback props (`onunlock`, `onreset`, `onprogress`, `onstatechange`) while maintaining fallback compatibility for camelCase variants (`onUnlock`, `onReset`, `onProgress`, `onStateChange`).
+ 
+ - **GIVEN** a `<Heelslide onunlock={handleUnlock} onUnlock={fallbackUnlock} />` component
+ - **WHEN** the slider completes the gesture path to unlock
+ - **THEN** the configured callback functions MUST be invoked.
+ 
+ #### Requirement: Native Pointer Capture & Teardown
+ The component MUST maintain continuous gesture tracking via Pointer Capture and cleanly release resources on unmount.
+ 
+ - **GIVEN** a pointer down event on the slider handle
+ - **WHEN** the pointer moves outside the component bounding box
+ - **THEN** pointer capture MUST remain retained on the handle element via `setPointerCapture` until gesture completion or cancellation.
+ - **GIVEN** an active gesture or mounted component
+ - **WHEN** the component is unmounted
+ - **THEN** active pointer captures MUST be released and all event listeners cleaned up without memory leaks.
+ 
+ #### Requirement: CSS Custom Properties Theming Parity
+ The component MUST adhere to shared `--heelslide-*` CSS custom properties with resilient default fallbacks matching the core design system.
+ 
+ - **GIVEN** custom `--heelslide-*` CSS variables applied to the container or ancestor
+ - **WHEN** the component is rendered
+ - **THEN** styles MUST cascade to the SVG track, heel markers, handle, and progress paths.
+ 
+ #### Requirement: Disabled State & Accessibility Support
+ - **GIVEN** `<Heelslide disabled={true} />`
+ - **WHEN** pointer interactions occur on the component
+ - **THEN** gestures MUST NOT start and state MUST remain `idle`.
+ - **GIVEN** `<Heelslide ariaLabel="Authorize Payment" />`
+ - **WHEN** rendered in the DOM
+ - **THEN** appropriate ARIA attributes (`role="slider"`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuenow`, `aria-disabled`, `aria-label`) MUST be set on the interactive container/handle.
+ 
+ #### Requirement: Haptic & Audio Feedback Configuration
+ The composable and component MUST accept haptic and audio feedback configuration options and forward them to the underlying engine.
+ 
+ - **GIVEN** `createHeelslide({ haptics: true, sound: true })` or `<Heelslide haptics={true} sound={true} />`
+ - **WHEN** gestures advance across heels, reset, or unlock
+ - **THEN** tactile vibrations and synthesized audio cues MUST trigger via the core feedback controller.
+ 
+ #### Requirement: Turn Callback Support
+ The composable and component MUST support turn callbacks (`onturn` / `onTurn`) when rounding heel vertices.
+ 
+ - **GIVEN** `<Heelslide onturn={handleTurn} />` or `<Heelslide onTurn={handleTurn} />`
+ - **WHEN** a heel vertex is navigated during active dragging
+ - **THEN** `onturn(heelIndex)` and `onTurn(heelIndex)` MUST be invoked with the completed heel index.
