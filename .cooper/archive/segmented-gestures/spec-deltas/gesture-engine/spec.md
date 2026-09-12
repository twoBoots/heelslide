# Spec Delta: Gesture Engine (`gesture-engine`)

## Added Requirements

+ ### Capability: Segmented Multi-Gesture Checkpoints
+
+ #### Requirement: Configurable Segmented Mode
+ The gesture state machine MUST support an optional segmented mode requiring release of contact at each heel before continuing.
+
+ - **GIVEN** an engine configured with `{ segmented: true }`
+ - **WHEN** an active gesture moves the slider handle along segment `K` toward the heel vertex terminating segment `K`
+ - **THEN** the handle position MUST clamp at the heel vertex, and further pointer movement along segment `K + 1` MUST be blocked during that same gesture stroke.
+
+ #### Requirement: Checkpoint State on Gesture Release
+ - **GIVEN** an active gesture in segmented mode resting at a heel vertex
+ - **WHEN** `endGesture()` is called
+ - **THEN** state MUST transition to `'checkpoint'`, progress MUST remain preserved at the heel vertex, and `onCheckpoint` MUST be emitted with the heel index and progress.
+
+ #### Requirement: Checkpoint Re-engagement & Resumption
+ - **GIVEN** an engine in `'checkpoint'` state at heel `K`
+ - **WHEN** `startGesture(point)` is invoked within handle tolerance of heel vertex `K`
+ - **THEN** state MUST transition to `'active'`, and subsequent movements MUST track along segment `K + 1`.
+
+ - **GIVEN** an engine in `'checkpoint'` state at heel `K`
+ - **WHEN** `startGesture(point)` is invoked outside tolerance of heel vertex `K`
+ - **THEN** `startGesture` MUST return `false` and state MUST remain in `'checkpoint'`.
+
+ #### Requirement: Mid-Segment Snapback to Last Checkpoint
+ - **GIVEN** an active gesture in segmented mode traversing segment `K + 1` (where heel `K` was previously confirmed)
+ - **WHEN** `endGesture()` or `cancelGesture()` is triggered before reaching the next heel or destination
+ - **THEN** progress MUST snap back to the progress coordinate of heel `K`, state MUST transition to `'checkpoint'`, and reset feedback MUST fire.
+
+ - **GIVEN** an active gesture in segmented mode traversing segment 0 (before the first heel)
+ - **WHEN** `endGesture()` or `cancelGesture()` is triggered before reaching the first heel
+ - **THEN** progress MUST snap back to 0 and state MUST transition to `'idle'`.
+
+ #### Requirement: Checkpoint Inactivity Auto-Reset
+ - **GIVEN** an engine configured with `{ segmented: true, checkpointTimeoutMs: T }` where `T > 0`
+ - **WHEN** the engine remains in `'checkpoint'` state without user interaction for `T` milliseconds
+ - **THEN** progress MUST reset to 0, state MUST transition to `'idle'`, and `onReset` MUST fire.
