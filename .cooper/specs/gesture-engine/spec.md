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

## Capability: Accessible Stepping & Semantic Navigation

### Requirement: Discrete Stepped Navigation
The engine MUST support discrete, non-pointer stepping along rectilinear track segments for keyboard and switch-device control, reusing the pointer path's distance-accumulation progress model.

- **GIVEN** an idle engine at progress 0
- **WHEN** `stepForward(amount)` is invoked
- **THEN** state MUST transition to `active`, progress MUST advance by `amount * totalLength` along the path, and `onProgress` MUST fire with the updated value.
- **GIVEN** an active engine on segment `K`
- **WHEN** cumulative stepping crosses the heel vertex terminating segment `K`
- **THEN** the active segment index MUST advance and subsequent forward steps MUST proceed along the new segment's direction.
- **GIVEN** an active engine at intermediate progress in non-segmented mode
- **WHEN** `stepBackward(amount)` is invoked
- **THEN** progress MUST decrement along the path, reverting across heel vertices, flooring at 0 and returning state to `idle`.
- **GIVEN** an active engine on the final segment at progress at or above the unlock threshold
- **WHEN** `stepForward()` advances progress further
- **THEN** the engine MUST NOT unlock; stepping MUST advance progress only.
- **GIVEN** any engine state
- **WHEN** a consumer seeks a single-keypress jump to the destination
- **THEN** no such API MUST exist; stepping MUST NOT provide a means to bypass traversal of the path.

### Requirement: Unlock Parity Between Keyboard and Pointer
Keyboard-driven unlock MUST be governed by exactly the same condition as pointer-driven unlock, evaluated through the same code path.

- **GIVEN** an engine advanced by stepping onto the final segment at progress at or above the unlock threshold
- **WHEN** the confirm action is invoked
- **THEN** the engine MUST unlock via the same `end()` transition pointer release uses, progress MUST become 1.0, and `onUnlock` MUST fire exactly once.
- **GIVEN** an engine advanced by stepping to aggregate progress at or above the unlock threshold while NOT on the final segment
- **WHEN** the confirm action is invoked
- **THEN** the engine MUST NOT unlock, preserving the conjunctive condition that closed the audit defect in which a `[100,100,5]` track unlocked at the end of segment 1 without the final segment being entered.
- **GIVEN** a keyboard user at progress at or above the unlock threshold who has not yet confirmed
- **WHEN** `stepBackward()` is invoked
- **THEN** progress MUST decrement without unlocking, preserving the ability to withdraw before committing that a pointer user has by dragging back before release.

### Requirement: Step-to-Next-Heel Navigation
The engine MUST support jumping directly to the next heel vertex for efficient stepped navigation.

- **GIVEN** an active or idle engine on segment `K`
- **WHEN** `stepToNextHeel()` is invoked
- **THEN** progress MUST advance to the vertex terminating segment `K` and the same checkpoint transitions as incremental stepping MUST apply.

### Requirement: Stepped Navigation Under Segmented Mode
Stepping MUST honour segmented-mode checkpoint semantics identically to pointer traversal.

- **GIVEN** an engine with `segmented: true` stepping across the heel vertex terminating segment `K`
- **WHEN** the vertex is crossed
- **THEN** state MUST transition to `checkpoint`, `onCheckpoint` MUST fire with heel index `K` and the updated progress, and the confirmed checkpoint index MUST advance.
- **GIVEN** an engine with `segmented: true` at a confirmed checkpoint
- **WHEN** `stepBackward(amount)` is invoked
- **THEN** progress MUST floor at the confirmed checkpoint distance and MUST NOT rewind into a previously confirmed segment.

### Requirement: Heel Feedback Parity For Stepping
Negotiating a heel by stepping MUST produce the same turn notification and feedback as negotiating it by pointer.

- **GIVEN** an engine stepping across a heel vertex
- **WHEN** the vertex is crossed
- **THEN** `onTurn` MUST fire with the heel index and turn feedback MUST be triggered.
- **GIVEN** a single step spanning more than one heel
- **WHEN** it is applied
- **THEN** `onTurn` MUST fire exactly once per heel negotiated, in order.
- **GIVEN** a backward step crossing a heel vertex
- **WHEN** it is applied
- **THEN** `onTurn` MUST NOT fire; retreating past a corner is not negotiating it.

### Requirement: Input Modality Tracking
The engine MUST track which input modality is currently driving progress.

- **GIVEN** an engine in any state
- **WHEN** `startGesture` or `updateGesture` is invoked
- **THEN** the active input modality MUST be `pointer`.
- **GIVEN** an engine in any state
- **WHEN** `stepForward`, `stepBackward`, or `stepToNextHeel` is invoked
- **THEN** the active input modality MUST be `keyboard`.
- **GIVEN** an engine under `keyboard` modality
- **WHEN** `reset()` is invoked
- **THEN** the active input modality MUST return to `pointer`.

### Requirement: Checkpoint Inactivity Suspension Under Keyboard Control
The engine MUST NOT impose a time limit on progress driven by keyboard stepping, satisfying WCAG 2.2 SC 2.2.1 (Timing Adjustable).

- **GIVEN** an engine with `segmented: true` and `checkpointTimeoutMs` greater than 0
- **WHEN** a checkpoint is reached under `keyboard` modality
- **THEN** the checkpoint inactivity timer MUST NOT be armed, and progress MUST remain at the checkpoint indefinitely regardless of elapsed time.
- **GIVEN** an engine with an armed checkpoint inactivity timer under `pointer` modality
- **WHEN** the modality transitions to `keyboard`
- **THEN** the armed timer MUST be cleared without triggering snapback or reset.
- **GIVEN** an engine that transitioned from `keyboard` back to `pointer` modality mid-gesture
- **WHEN** a subsequent checkpoint is reached under `pointer` modality
- **THEN** the inactivity timer MUST be armed for that checkpoint only.

### Requirement: Semantic Path Description & Step Breakdown
The engine MUST expose machine-readable and screen-reader-friendly descriptions of the rectilinear path.

- **GIVEN** a generated track
- **WHEN** `getAccessibleSteps()` is called
- **THEN** it MUST return one step object per entry in `track.segments`, each detailing segment index, direction, start and end points, a human-readable instruction, and the progress value at that segment's end.
- **GIVEN** a generated track with `N` heels
- **WHEN** `getAccessibleDescription()` is called
- **THEN** it MUST return a single human-readable sentence summarising the turn count and direction sequence, suitable for `aria-describedby`.

### Requirement: Real-Time Announcement Events
The engine MUST emit structured accessibility announcement events on state milestones.

- **GIVEN** an engine configured with an `onAnnouncement` callback
- **WHEN** a gesture starts, a step is taken, a heel vertex is reached, a checkpoint is confirmed, the gate unlocks, or a reset occurs
- **THEN** `onAnnouncement` MUST fire with an `AccessibleAnnouncement` containing the event type, a human-readable message, the current progress, and a timestamp.
- **GIVEN** a heel arrival announcement
- **WHEN** its message is generated
- **THEN** it MUST name the heel just negotiated, not the count of segments occupied.
- **GIVEN** an engine configured with `accessible.announceMessages` overrides
- **WHEN** an announcement of an overridden type is emitted
- **THEN** the override MUST produce the message, receiving a typed announcement context rather than an untyped value.
- **GIVEN** an engine configured with `accessible.enabled: false`
- **WHEN** any milestone occurs
- **THEN** no announcement MUST be emitted.

### Requirement: Shared Keyboard Action Resolution
The mapping from key to gate action MUST live in the core so framework adapters cannot diverge.

- **GIVEN** a `KeyboardEvent.key` value
- **WHEN** `resolveKeyAction` is called with it
- **THEN** it MUST return `forward` for `ArrowRight`/`ArrowDown`, `backward` for `ArrowLeft`/`ArrowUp`, `reset` for `Home`, `confirm` for `Enter`/`Space`, `cancel` for `Escape`, and null otherwise.
- **GIVEN** the key `End`
- **WHEN** `resolveKeyAction` is called
- **THEN** it MUST return null, so no single keypress can bypass path traversal.

### Requirement: Pointer Gesture Invariance
The introduction of stepped navigation MUST NOT alter pointer gesture behaviour.

- **GIVEN** an engine driven exclusively by `startGesture`, `updateGesture`, and `endGesture`
- **WHEN** any gesture is performed
- **THEN** tolerance enforcement, heel advancement, checkpoint arming, snapback, unlock, and reset behaviour MUST be identical to the behaviour before accessible stepping existed.
