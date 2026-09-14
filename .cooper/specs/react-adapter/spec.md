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

## Capability: Segmented Multi-Gesture Support

### Requirement: Segmented Props Forwarding
`<Heelslide />` and `useHeelslide` MUST accept and pass `segmented`, `checkpointTimeoutMs`, and `onCheckpoint` configuration options to the core engine.

- **GIVEN** `<Heelslide segmented={true} checkpointTimeoutMs={5000} onCheckpoint={fn} />`
- **WHEN** the component mounts
- **THEN** the underlying `HeelslideEngine` MUST be initialized with segmented mode enabled, the specified timeout, and callback hook.

### Requirement: Checkpoint DOM Data Attribute
The component root element MUST expose `data-state="checkpoint"` when resting at an intermediate heel checkpoint.

- **GIVEN** an active gesture reaching a heel in segmented mode and releasing pointer
- **WHEN** the engine transitions to `'checkpoint'` state
- **THEN** the container element MUST have attribute `data-state="checkpoint"`.

### Requirement: Visual Progress Highlighting
The component MUST render a progress overlay path reflecting traversed length, matching the
requirement already carried by the Vue and Svelte adapter specifications.

- **GIVEN** an active gesture at progress `P`
- **WHEN** the component renders
- **THEN** an overlay progress path MUST visually reflect the exact traversed length up to the
  current handle position.

- **GIVEN** a gesture that resets to progress 0
- **WHEN** the component renders
- **THEN** the overlay progress path MUST collapse to zero traversed length.

### Requirement: Stable Headless Hook Identity
`useHeelslide` MUST tolerate option objects constructed inline at call time. The hook MUST NOT
rebuild its engine on every render merely because an options object has a new reference, because
doing so drives an unbounded render loop through the hook's own state synchronisation effect.

- **GIVEN** a consumer calling `useHeelslide({ generator: { ... } })` with an inline object
  literal recreated on each render
- **WHEN** the consuming component re-renders for any ordinary reason
- **THEN** the hook MUST settle after a bounded number of renders and MUST NOT re-enter
  rendering indefinitely.

- **GIVEN** a consumer whose generator configuration values are unchanged between renders
- **WHEN** the component re-renders
- **THEN** the hook MUST preserve engine identity and MUST NOT regenerate the track.

- **GIVEN** a consumer who changes a generator configuration value
- **WHEN** the component re-renders
- **THEN** the hook MUST rebuild the engine and regenerate the track.

### Requirement: Cross-Adapter Prop Parity
Component props MUST remain consistent with `@heelslide/vue` and `@heelslide/svelte` as required
by the adapter styleguides.

- **GIVEN** the `HeelslideProps` interface
- **WHEN** compared against the Vue and Svelte adapters
- **THEN** it MUST accept `bounds`, `track`, `initialState`, and `initialProgress` with identical
  semantics.

- **GIVEN** a consumer passing the legacy `width` and `height` props
- **WHEN** the component renders
- **THEN** they MUST continue to be honoured as aliases for `bounds`, with `bounds` taking
  precedence when both are supplied.

### Requirement: Distributable Stylesheet
The package MUST ship a stylesheet exposing the `--heelslide-*` default cascade, exported as
`./style.css`, matching the Vue and Svelte adapters.

- **GIVEN** a consumer importing `@heelslide/react/style.css`
- **WHEN** the bundle resolves
- **THEN** the stylesheet MUST resolve and define the documented `--heelslide-*` defaults.

## Capability: Keyboard Operation & Accessible Semantics

### Requirement: Slider Element Normalization
The `role="slider"` contract MUST be carried by the container element, matching the Vue and Svelte adapters.

- **GIVEN** a rendered component
- **WHEN** the accessibility tree is inspected
- **THEN** exactly one element MUST carry `role="slider"`, and it MUST be the container carrying `data-heelslide-container`.
- **GIVEN** the handle element
- **WHEN** the component is rendered
- **THEN** the handle MUST be presentational, carrying no `role="slider"`, no `tabindex`, and no `aria-value*` attributes.

### Requirement: Keyboard Navigation Bindings
The component MUST be fully operable by keyboard, satisfying WCAG 2.2 SC 2.1.1 (Keyboard).

- **GIVEN** a rendered, enabled component with `accessibleFallback="stepped"`
- **WHEN** the container receives focus and `ArrowRight` or `ArrowDown` is pressed
- **THEN** progress MUST advance.
- **GIVEN** a focused component at intermediate progress
- **WHEN** `ArrowLeft` or `ArrowUp` is pressed
- **THEN** progress MUST decrement subject to engine flooring rules.
- **GIVEN** a focused component at any progress
- **WHEN** `Home` is pressed
- **THEN** the engine MUST reset to `idle` at progress 0.
- **GIVEN** a focused component at any progress
- **WHEN** `End` is pressed
- **THEN** no state change MUST occur.
- **GIVEN** a focused component whose progress has reached the destination
- **WHEN** `Enter` or `Space` is pressed
- **THEN** the gate MUST unlock and `onUnlock` MUST fire.
- **GIVEN** a focused component with an in-progress keyboard gesture
- **WHEN** `Escape` is pressed
- **THEN** the gesture MUST cancel and focus MUST NOT be trapped, per SC 2.1.2.
- **GIVEN** a component rendered with `disabled`
- **WHEN** any bound key is pressed
- **THEN** no engine method MUST be invoked.
- **GIVEN** a focused, enabled component
- **WHEN** a bound key is pressed
- **THEN** `preventDefault()` MUST be called, and MUST NOT be called for unbound keys.

### Requirement: Complete ARIA Slider Semantics
The component MUST complete the `role="slider"` contract it declares, satisfying WCAG 2.2 SC 4.1.2.

- **GIVEN** an enabled component
- **WHEN** it is rendered
- **THEN** the container MUST expose `tabindex="0"`, and `tabindex="-1"` when `disabled`.
- **GIVEN** a component at any progress
- **WHEN** progress changes
- **THEN** `aria-valuetext` MUST update to a descriptive string stating percentage complete and the next required direction.
- **GIVEN** a component on an active segment
- **WHEN** the segment direction is `horizontal` or `vertical`
- **THEN** `aria-orientation` MUST reflect that direction.
- **GIVEN** an enabled component with `accessibleFallback="stepped"`
- **WHEN** it is rendered
- **THEN** `aria-keyshortcuts` MUST enumerate the bound keys and `aria-describedby` MUST reference a node containing the engine's accessible path description.

### Requirement: Visible Focus Indicator
The slider MUST present a visible focus indicator when focused by keyboard, satisfying WCAG 2.2 SC 2.4.7.

- **GIVEN** an enabled component
- **WHEN** the slider receives keyboard focus
- **THEN** a visible focus indicator MUST be rendered on the container, themeable via `--heelslide-focus-*` with a system-colour fallback.

### Requirement: Polite Live Region Announcements
The component MUST announce progress without interrupting the user.

- **GIVEN** a component with `accessibleFallback="stepped"`
- **WHEN** it is rendered
- **THEN** it MUST render a visually hidden node carrying `role="status"`, `aria-live="polite"`, and `aria-atomic="true"`.
- **GIVEN** a rendered live region
- **WHEN** the engine emits an announcement
- **THEN** the region's text MUST update to the announcement message, and `aria-live` MUST NOT be `assertive`.
- **GIVEN** a consumer supplying an `onAnnouncement` callback prop
- **WHEN** the engine emits an announcement
- **THEN** the callback MUST receive the `AccessibleAnnouncement`.

### Requirement: Accessible Fallback Modes
The adapter MUST support stepped and custom accessible fallback modes.

- **GIVEN** `accessibleFallback` is unset or `"stepped"`
- **WHEN** the component renders
- **THEN** key bindings and the live region MUST be active.
- **GIVEN** `accessibleFallback="custom"`
- **WHEN** the component renders
- **THEN** no key handlers MUST be bound and no live region MUST be rendered.

### Requirement: Headless Stepping Primitives
The `useHeelslide` hook MUST expose stepping primitives for host-rendered accessible flows.

- **GIVEN** a consumer calling `useHeelslide`
- **WHEN** the hook returns
- **THEN** it MUST expose `stepForward`, `stepBackward`, `stepToNextHeel`, `confirm`, `steps`, `description` and `announcement`.
- **GIVEN** returned stepping primitives
- **WHEN** they are referenced across renders
- **THEN** their identities MUST be stable, so consumers may use them in dependency arrays without re-subscription loops.
- **GIVEN** a regenerated track
- **WHEN** the new path is installed
- **THEN** `steps` and `description` MUST recompute to describe it.
