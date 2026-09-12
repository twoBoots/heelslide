# Spec Delta: Gesture Engine (`gesture-engine`)

## Modified Requirements

### Requirement: Successful Intent Confirmation (Unlock)

- ### Requirement: Successful Intent Confirmation (Unlock)
- - **GIVEN** an active gesture reaching the final destination coordinate within tolerance
- - **WHEN** the user reaches the end of the final segment
- - **THEN** state MUST transition to `unlocked` and trigger `onUnlock`.

+ ### Requirement: Successful Intent Confirmation (Unlock)
+ Unlock MUST require the gesture to be tracking the final segment. Aggregate progress alone
+ MUST NOT satisfy the gate, because a track whose trailing segments are short relative to
+ total length can exceed the progress threshold at an earlier heel.
+
+ - **GIVEN** an active gesture tracking the final segment
+ - **WHEN** `endGesture()` is called at or beyond 95% of total track length
+ - **THEN** state MUST transition to `unlocked` and trigger `onUnlock`.
+
+ - **GIVEN** an active gesture at or beyond 95% of total track length but tracking a segment
+   that is NOT the final segment
+ - **WHEN** `endGesture()` is called
+ - **THEN** state MUST NOT transition to `unlocked`, and the incomplete-slide cancellation
+   behaviour MUST apply instead.

### Requirement: Non-Self-Intersecting Paths

- ### Requirement: Non-Self-Intersecting Paths
- - **GIVEN** a grid step and bounding box
- - **WHEN** a path is computed
- - **THEN** no segment of the path MAY intersect or overlap any non-adjacent segment.

+ ### Requirement: Non-Self-Intersecting Paths
+ Procedurally generated paths MUST remain strictly rectilinear and non-self-intersecting
+ within container bounds. Collinear overlap and single-point contact between non-adjacent
+ segments MUST both be rejected, not only strict crossings.
+
+ - **GIVEN** a grid step and bounding box
+ - **WHEN** a path is computed
+ - **THEN** no segment of the path MAY cross, overlap, or touch any non-adjacent segment.
+
+ - **GIVEN** two consecutive (adjacent) segments of a generated path
+ - **WHEN** the path is inspected
+ - **THEN** they MUST share exactly their common heel vertex and no other point.

### Requirement: Path Trajectory Validation & Tolerance

- ### Requirement: Path Trajectory Validation & Tolerance
- - **GIVEN** an active gesture tracking along segment `K`
- - **WHEN** `updateGesture(point)` is called with coordinates deviating beyond `tolerance` from the segment
- - **THEN** state MUST immediately transition to `reset`, emit `onReset`, and revert progress to 0.

+ ### Requirement: Path Trajectory Validation & Tolerance
+ Rejection MUST be observable. The engine MUST pass through the `'reset'` state and MUST
+ notify `onStateChange` subscribers of every transition it makes, including transitions into
+ and out of `'reset'`.
+
+ - **GIVEN** an active gesture tracking along segment `K`
+ - **WHEN** `updateGesture(point)` is called with coordinates deviating beyond `tolerance`
+   from the segment
+ - **THEN** state MUST transition to `'reset'`, emit `onReset`, emit `onStateChange('reset')`
+   followed by `onStateChange('idle')`, and revert progress to 0.
+
+ - **GIVEN** an engine constructed with any `initialState`, including `'unlocked'`
+ - **WHEN** a gesture is rejected for trajectory deviation
+ - **THEN** the engine MUST settle in `'idle'` with progress 0 and MUST NOT return to the
+   configured `initialState`. `initialState` seeds construction only and MUST NOT be treated
+   as a reset target.

### Requirement: Heel Navigation & Segment Advancement

- ### Requirement: Heel Navigation & Segment Advancement
- - **GIVEN** an active gesture near a heel corner vertex
- - **WHEN** `updateGesture(point)` reaches within vertex tolerance and proceeds in the direction of the next segment
- - **THEN** the active segment index MUST increment and overall progress MUST update continuously.

+ ### Requirement: Heel Navigation & Segment Advancement
+ Advancement across a heel MUST require continuity with the segment being left as well as the
+ segment being joined, so that a discontinuous jump cannot bypass the corner.
+
+ - **GIVEN** an active gesture near a heel corner vertex
+ - **WHEN** `updateGesture(point)` reaches within vertex tolerance, remains within `tolerance`
+   of the current segment, and proceeds in the direction of the next segment
+ - **THEN** the active segment index MUST increment and overall progress MUST update
+   continuously.
+
+ - **GIVEN** an active gesture tracking segment `K`
+ - **WHEN** `updateGesture(point)` supplies coordinates within `tolerance` of segment `K + 1`
+   but beyond `tolerance` of segment `K`
+ - **THEN** the engine MUST NOT advance to segment `K + 1`, and the trajectory deviation
+   behaviour MUST apply.

## Added Requirements

+ ### Requirement: Path Regeneration Lifecycle
+ Regenerating a track MUST fully retire the superseded gesture state machine, including any
+ armed checkpoint timer, so that a discarded machine cannot emit callbacks afterwards.
+
+ - **GIVEN** an engine in `'checkpoint'` state with an armed `checkpointTimeoutMs` timer
+ - **WHEN** `regeneratePath()` is called
+ - **THEN** the superseded timer MUST be cleared, and `onReset` MUST NOT fire when the
+   original timeout would have elapsed.

+ ### Requirement: Audio Context Deferral
+ The engine MUST NOT construct an `AudioContext` unless sound is enabled, so that consumers
+ who never opt into audio do not consume a document's limited AudioContext budget.
+
+ - **GIVEN** an engine configured without sound, or with `sound: false`
+ - **WHEN** `startGesture()` is called
+ - **THEN** no `AudioContext` MUST be constructed.
+
+ - **GIVEN** an engine configured with sound enabled
+ - **WHEN** `startGesture()` is called
+ - **THEN** the engine MUST create and resume the `AudioContext` as before.
