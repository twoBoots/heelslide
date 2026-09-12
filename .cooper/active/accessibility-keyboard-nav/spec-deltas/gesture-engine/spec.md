# Spec Delta: Gesture Engine (`gesture-engine`)

## Added Requirements

+ ## Capability: Accessible Stepping & Semantic Navigation
+
+ ### Requirement: Discrete Stepped Navigation
+ The engine MUST support discrete, non-pointer stepping along rectilinear track segments for keyboard and switch-device control, reusing the pointer path's distance-accumulation progress model.
+ - **GIVEN** an idle engine at progress 0
+ - **WHEN** `stepForward(amount)` is invoked
+ - **THEN** state MUST transition to `active`, progress MUST advance by `amount * totalLength` along the path, and `onProgress` MUST fire with the updated value.
+ - **GIVEN** an active engine on segment `K`
+ - **WHEN** cumulative stepping crosses the heel vertex terminating segment `K`
+ - **THEN** the active segment index MUST increment to `K + 1` and subsequent forward steps MUST proceed along the new segment's direction.
+ - **GIVEN** an active engine at intermediate progress in non-segmented mode
+ - **WHEN** `stepBackward(amount)` is invoked
+ - **THEN** progress MUST decrement along the path, reverting across heel vertices, flooring at 0 and returning state to `idle`.
+ - **GIVEN** an active engine whose accumulated distance reaches `totalLength`
+ - **WHEN** `stepForward()` completes
+ - **THEN** progress MUST equal 1.0, state MUST transition to `unlocked`, and `onUnlock` MUST fire.
+ - **GIVEN** any engine state
+ - **WHEN** a consumer seeks a single-keypress jump to the destination
+ - **THEN** no such API MUST exist; stepping MUST NOT provide a means to bypass traversal of the path.
+
+ ### Requirement: Step-to-Next-Heel Navigation
+ The engine MUST support jumping directly to the next heel vertex for efficient stepped navigation.
+ - **GIVEN** an active or idle engine on segment `K`
+ - **WHEN** `stepToNextHeel()` is invoked
+ - **THEN** progress MUST advance to the vertex terminating segment `K` and the same checkpoint or unlock transitions as incremental stepping MUST apply.
+
+ ### Requirement: Stepped Navigation Under Segmented Mode
+ Stepping MUST honour segmented-mode checkpoint semantics identically to pointer traversal.
+ - **GIVEN** an engine with `segmented: true` stepping across the heel vertex terminating segment `K`
+ - **WHEN** the vertex is crossed
+ - **THEN** state MUST transition to `checkpoint`, `onCheckpoint` MUST fire with heel index `K` and the updated progress, and the confirmed checkpoint index MUST advance.
+ - **GIVEN** an engine with `segmented: true` at a confirmed checkpoint
+ - **WHEN** `stepBackward(amount)` is invoked
+ - **THEN** progress MUST floor at the confirmed checkpoint distance and MUST NOT rewind into a previously confirmed segment.
+
+ ### Requirement: Input Modality Tracking
+ The engine MUST track which input modality is currently driving progress.
+ - **GIVEN** an engine in any state
+ - **WHEN** `startGesture` or `updateGesture` is invoked
+ - **THEN** the active input modality MUST be `pointer`.
+ - **GIVEN** an engine in any state
+ - **WHEN** `stepForward`, `stepBackward`, or `stepToNextHeel` is invoked
+ - **THEN** the active input modality MUST be `keyboard`.
+ - **GIVEN** an engine under `keyboard` modality
+ - **WHEN** `reset()` is invoked
+ - **THEN** the active input modality MUST return to `pointer`.
+
+ ### Requirement: Checkpoint Inactivity Suspension Under Keyboard Control
+ The engine MUST NOT impose a time limit on progress driven by keyboard stepping, satisfying WCAG 2.2 SC 2.2.1 (Timing Adjustable).
+ - **GIVEN** an engine with `segmented: true` and `checkpointTimeoutMs` greater than 0
+ - **WHEN** a checkpoint is reached under `keyboard` modality
+ - **THEN** the checkpoint inactivity timer MUST NOT be armed, and progress MUST remain at the checkpoint indefinitely regardless of elapsed time.
+ - **GIVEN** an engine with an armed checkpoint inactivity timer under `pointer` modality
+ - **WHEN** the modality transitions to `keyboard`
+ - **THEN** the armed timer MUST be cleared without triggering snapback or reset.
+ - **GIVEN** an engine that transitioned from `keyboard` back to `pointer` modality mid-gesture
+ - **WHEN** a subsequent checkpoint is reached under `pointer` modality
+ - **THEN** the inactivity timer MUST be armed for that checkpoint only, and MUST NOT be retroactively armed for checkpoints confirmed under keyboard control.
+
+ ### Requirement: Semantic Path Description & Step Breakdown
+ The engine MUST expose machine-readable and screen-reader-friendly descriptions of the rectilinear path.
+ - **GIVEN** a generated track
+ - **WHEN** `getAccessibleSteps()` is called
+ - **THEN** it MUST return one step object per entry in `track.segments`, each detailing segment index, direction (`horizontal` | `vertical`), start and end points, a human-readable instruction, and the progress value at that segment's end.
+ - **GIVEN** a generated track with `N` heels
+ - **WHEN** `getAccessibleDescription()` is called
+ - **THEN** it MUST return a single human-readable sentence summarising the turn count and direction sequence, suitable for `aria-describedby`.
+
+ ### Requirement: Real-Time Announcement Events
+ The engine MUST emit structured accessibility announcement events on state milestones.
+ - **GIVEN** an engine configured with an `onAnnouncement` callback
+ - **WHEN** a gesture starts, a step is taken, a heel vertex is reached, a checkpoint is confirmed, the gate unlocks, or a reset occurs
+ - **THEN** `onAnnouncement` MUST fire with an `AccessibleAnnouncement` containing the event type, a human-readable message, the current progress, and a timestamp.
+ - **GIVEN** an engine configured with `accessible.announceMessages` overrides
+ - **WHEN** an announcement of an overridden type is emitted
+ - **THEN** the override MUST produce the message, receiving a typed announcement context rather than an untyped value.
+ - **GIVEN** an engine configured with `accessible.enabled: false`
+ - **WHEN** any milestone occurs
+ - **THEN** no announcement MUST be emitted.

## Preserved Behaviour

+ ### Requirement: Pointer Gesture Invariance
+ The introduction of stepped navigation MUST NOT alter pointer gesture behaviour.
+ - **GIVEN** an engine driven exclusively by `startGesture`, `updateGesture`, and `endGesture`
+ - **WHEN** any gesture is performed
+ - **THEN** tolerance enforcement, heel advancement, checkpoint arming, snapback, unlock, and reset behaviour MUST be identical to the behaviour before this track.
