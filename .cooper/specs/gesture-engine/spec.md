# Capability Specification: Gesture Engine (`gesture-engine`)

## Capability: Rectilinear Track & Heel Generation

### Requirement: Configurable Heel Counts
The engine MUST generate a 2D track containing 90-degree direction changes ("heels") matching configured bounds.

- **GIVEN** a fixed heel configuration of `N`
- **WHEN** `generateTrack()` is invoked
- **THEN** the returned path MUST contain exactly `N` 90-degree direction changes.

- **GIVEN** a range configuration `{ min: M, max: N }`
- **WHEN** `generateTrack()` is invoked
- **THEN** the returned path MUST contain between `M` and `N` (inclusive) 90-degree direction changes.

### Requirement: Non-Self-Intersecting Paths
Procedurally generated paths MUST remain strictly rectilinear and non-self-intersecting within
container bounds. Collinear overlap and single-point contact between non-adjacent segments MUST
both be rejected, not only strict crossings.

- **GIVEN** a grid step and bounding box
- **WHEN** a path is computed
- **THEN** no segment of the path MAY cross, overlap, or touch any non-adjacent segment.

- **GIVEN** two consecutive (adjacent) segments of a generated path
- **WHEN** the path is inspected
- **THEN** they MUST share exactly their common heel vertex and no other point.

### Requirement: Deterministic Seeded Generation
- **GIVEN** an identical numeric seed and configuration
- **WHEN** `generateTrack()` is invoked multiple times
- **THEN** the resulting path coordinates MUST be bit-identical across runs.

## Capability: Gesture Tracking & Tolerance Enforcement

### Requirement: Handle Engagement
- **GIVEN** an idle engine at progress 0
- **WHEN** `startGesture(point)` is called with coordinates within handle radius of the start point
- **THEN** state MUST transition to `active` and emit state change.

### Requirement: Path Trajectory Validation & Tolerance
Rejection MUST be observable. The engine MUST pass through the `'reset'` state and MUST notify
`onStateChange` subscribers of every transition it makes, including transitions into and out of
`'reset'`.

- **GIVEN** an active gesture tracking along segment `K`
- **WHEN** `updateGesture(point)` is called with coordinates deviating beyond `tolerance` from
  the segment
- **THEN** state MUST transition to `'reset'`, emit `onReset`, emit `onStateChange('reset')`
  followed by `onStateChange('idle')`, and revert progress to 0.

- **GIVEN** an engine constructed with any `initialState`, including `'unlocked'`
- **WHEN** a gesture is rejected for trajectory deviation
- **THEN** the engine MUST settle in `'idle'` with progress 0 and MUST NOT return to the
  configured `initialState`. `initialState` seeds construction only and MUST NOT be treated as a
  reset target.

### Requirement: Heel Navigation & Segment Advancement
Advancement across a heel MUST require continuity with the segment being left as well as the
segment being joined, so that a discontinuous jump cannot bypass the corner.

- **GIVEN** an active gesture near a heel corner vertex
- **WHEN** `updateGesture(point)` reaches within vertex tolerance and proceeds in the direction
  of the next segment
- **THEN** the active segment index MUST increment and overall progress MUST update
  continuously.

- **GIVEN** an active gesture tracking segment `K`
- **WHEN** `updateGesture(point)` supplies coordinates within `tolerance` of segment `K + 1`
  without ever having come within `tolerance` of the heel vertex terminating segment `K`
- **THEN** the engine MUST NOT advance to segment `K + 1`, and the trajectory deviation
  behaviour MUST apply.

### Requirement: Incomplete Slide Cancellation
- **GIVEN** an active gesture at intermediate progress (< 1.0)
- **WHEN** `endGesture()` or `cancelGesture()` is triggered before reaching the final endpoint
- **THEN** state MUST transition to `reset`, invoke `onReset`, and return to `idle`.

### Requirement: Successful Intent Confirmation (Unlock)
Unlock MUST require the gesture to be tracking the final segment. Aggregate progress alone MUST
NOT satisfy the gate, because a track whose trailing segments are short relative to total length
can exceed the progress threshold at an earlier heel.

- **GIVEN** an active gesture tracking the final segment
- **WHEN** `endGesture()` is called at or beyond 95% of total track length
- **THEN** state MUST transition to `unlocked` and trigger `onUnlock`.

- **GIVEN** an active gesture at or beyond 95% of total track length but tracking a segment that
  is NOT the final segment
- **WHEN** `endGesture()` is called
- **THEN** state MUST NOT transition to `unlocked`, and the incomplete-slide cancellation
  behaviour MUST apply instead.

### Requirement: Heel Navigation Event Notification (`onTurn`)
The engine MUST emit an `onTurn` callback whenever a gesture successfully advances past a heel corner vertex onto a new segment.

- **GIVEN** an active gesture tracking segment `K`
- **WHEN** pointer coordinates reach within vertex tolerance of a heel corner and advance onto segment `K+1`
- **THEN** the engine MUST invoke the `onTurn(heelIndex)` callback passing the zero-indexed index of the navigated heel.

### Requirement: Built-in Haptic Feedback Triggers
When enabled, the engine MUST trigger haptic vibration pulses via the Web Vibration API at gesture state transitions and heel turns.

- **GIVEN** haptics enabled in engine configuration (`haptics: true` or `{ enabled: true }`)
- **WHEN** a heel corner is negotiated (`onTurn`)
- **THEN** `navigator.vibrate` MUST be invoked with the configured turn pattern (default: `15ms`).
- **GIVEN** haptics enabled
- **WHEN** a gesture resets due to deviation or premature release (`onReset`)
- **THEN** `navigator.vibrate` MUST be invoked with the configured reset pattern (default: `[40, 60, 40]`).
- **GIVEN** haptics enabled
- **WHEN** a gesture successfully completes (`onUnlock`)
- **THEN** `navigator.vibrate` MUST be invoked with the configured unlock pattern (default: `[30, 50, 80]`).
- **GIVEN** an environment where `navigator.vibrate` is unavailable or throws an error
- **WHEN** haptic triggers fire
- **THEN** the engine MUST degrade silently without throwing exceptions or interrupting gesture tracking.

### Requirement: Built-in Synthesized Audio Cues
When enabled, the engine MUST synthesize auditory micro-cues via the Web Audio API without external audio file assets.

- **GIVEN** sound enabled in engine configuration (`sound: true` or `{ enabled: true }`)
- **WHEN** a heel corner is navigated
- **THEN** a short, high-frequency audio click MUST be synthesized and played through `AudioContext`.
- **GIVEN** sound enabled
- **WHEN** a gesture resets
- **THEN** a low-frequency error tone MUST be synthesized and played through `AudioContext`.
- **GIVEN** sound enabled
- **WHEN** a gesture unlocks
- **THEN** an ascending multi-tone harmonic chime MUST be synthesized and played through `AudioContext`.
- **GIVEN** a browser requiring user activation for Web Audio
- **WHEN** the first gesture starts (`startGesture`)
- **THEN** the engine MUST resume any suspended `AudioContext`.

### Requirement: Feedback Configuration & Override
- **GIVEN** custom options passed to `HeelslideEngine`
- **WHEN** `haptics` or `sound` configurations provide custom patterns, volumes, or frequencies
- **THEN** the engine MUST apply custom parameters overriding system defaults.

## Capability: Segmented Multi-Gesture Checkpoints

### Requirement: Configurable Segmented Mode
The gesture state machine MUST support an optional segmented mode requiring release of contact at each heel before continuing.

- **GIVEN** an engine configured with `{ segmented: true }`
- **WHEN** an active gesture moves the slider handle along segment `K` toward the heel vertex terminating segment `K`
- **THEN** the handle position MUST clamp at the heel vertex, and further pointer movement along segment `K + 1` MUST be blocked during that same gesture stroke.

### Requirement: Checkpoint State on Gesture Release
- **GIVEN** an active gesture in segmented mode resting at a heel vertex
- **WHEN** `endGesture()` is called
- **THEN** state MUST transition to `'checkpoint'`, progress MUST remain preserved at the heel vertex, and `onCheckpoint` MUST be emitted with the heel index and progress.

### Requirement: Checkpoint Re-engagement & Resumption
- **GIVEN** an engine in `'checkpoint'` state at heel `K`
- **WHEN** `startGesture(point)` is invoked within handle tolerance of heel vertex `K`
- **THEN** state MUST transition to `'active'`, and subsequent movements MUST track along segment `K + 1`.

- **GIVEN** an engine in `'checkpoint'` state at heel `K`
- **WHEN** `startGesture(point)` is invoked outside tolerance of heel vertex `K`
- **THEN** `startGesture` MUST return `false` and state MUST remain in `'checkpoint'`.

### Requirement: Mid-Segment Snapback to Last Checkpoint
- **GIVEN** an active gesture in segmented mode traversing segment `K + 1` (where heel `K` was previously confirmed)
- **WHEN** `endGesture()` or `cancelGesture()` is triggered before reaching the next heel or destination
- **THEN** progress MUST snap back to the progress coordinate of heel `K`, state MUST transition to `'checkpoint'`, and reset feedback MUST fire.

- **GIVEN** an active gesture in segmented mode traversing segment 0 (before the first heel)
- **WHEN** `endGesture()` or `cancelGesture()` is triggered before reaching the first heel
- **THEN** progress MUST snap back to 0 and state MUST transition to `'idle'`.

### Requirement: Checkpoint Inactivity Auto-Reset
- **GIVEN** an engine configured with `{ segmented: true, checkpointTimeoutMs: T }` where `T > 0`
- **WHEN** the engine remains in `'checkpoint'` state without user interaction for `T` milliseconds
- **THEN** progress MUST reset to 0, state MUST transition to `'idle'`, and `onReset` MUST fire.

### Requirement: Path Regeneration Lifecycle
Regenerating a track MUST fully retire the superseded gesture state machine, including any armed
checkpoint timer, so that a discarded machine cannot emit callbacks afterwards.

- **GIVEN** an engine in `'checkpoint'` state with an armed `checkpointTimeoutMs` timer
- **WHEN** `regeneratePath()` is called
- **THEN** the superseded timer MUST be cleared, and `onReset` MUST NOT fire when the original
  timeout would have elapsed.

### Requirement: Audio Context Deferral
The engine MUST NOT construct an `AudioContext` unless sound is enabled, so that consumers who
never opt into audio do not consume a document's limited AudioContext budget.

- **GIVEN** an engine configured without sound, or with `sound: false`
- **WHEN** `startGesture()` is called
- **THEN** no `AudioContext` MUST be constructed.

- **GIVEN** an engine configured with sound enabled
- **WHEN** `startGesture()` is called
- **THEN** the engine MUST create and resume the `AudioContext` as before.
