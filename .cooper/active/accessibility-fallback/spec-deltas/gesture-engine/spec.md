# Spec Delta: Gesture Engine (`gesture-engine`)

## Added Requirements

+ ### Capability: Accessible Stepping & Semantic Navigation
+
+ #### Requirement: Discrete Stepped Navigation
+ The engine MUST support discrete, non-pointer stepping along rectilinear track segments for keyboard and switch-device control.
+
+ - **GIVEN** an idle engine at progress 0
+ - **WHEN** `stepForward(amount)` is invoked
+ - **THEN** state MUST transition to `active`, progress MUST advance incrementally along the current segment, and `onProgress` MUST fire with the updated value.
+
+ - **GIVEN** an active engine on segment `K`
+ - **WHEN** cumulative stepping reaches the heel vertex at the end of segment `K`
+ - **THEN** the active segment index MUST increment to `K + 1`, and subsequent forward steps MUST proceed along the new segment's direction.
+
+ - **GIVEN** an active engine at intermediate progress
+ - **WHEN** `stepBackward(amount)` is invoked
+ - **THEN** progress MUST decrement along the track, reverting to earlier segments when stepping backward across heel vertices.
+
+ - **GIVEN** an active engine nearing the final destination coordinate
+ - **WHEN** `stepForward()` brings progress to >= 0.95 or end of final segment
+ - **THEN** progress MUST reach 1.0, state MUST transition to `unlocked`, and `onUnlock` MUST fire.
+
+ #### Requirement: Step-to-Next-Heel Navigation
+ The engine MUST support jumping directly to the next directional heel vertex for efficient stepped keyboard navigation.
+
+ - **GIVEN** an active or idle engine at segment `K`
+ - **WHEN** `stepToNextHeel()` is invoked
+ - **THEN** handle position and progress MUST advance immediately to the vertex terminating segment `K`.
+
+ #### Requirement: Semantic Path Description & Step Breakdown
+ The engine MUST expose machine-readable and screen-reader-friendly descriptions of the rectilinear path.
+
+ - **GIVEN** a generated track with `N` heels
+ - **WHEN** `getAccessibleSteps()` is called
+ - **THEN** it MUST return an array of `N + 1` step objects, each detailing segment index, direction (`horizontal` | `vertical`), turn instruction, and milestone progress.
+
+ - **GIVEN** a generated track
+ - **WHEN** `getAccessibleDescription()` is called
+ - **THEN** it MUST return a human-readable textual summary (e.g., `"Security gate with 2 turns: move right, then down, then right to unlock"`).
+
+ #### Requirement: Real-Time Announcement Events
+ The engine MUST emit structured accessibility announcement events on state milestones and heel arrivals.
+
+ - **GIVEN** an engine configured with an `onAnnouncement` callback
+ - **WHEN** gestures start, heel vertices are reached, the gate unlocks, or a reset occurs
+ - **THEN** `onAnnouncement` MUST be triggered with an `AccessibleAnnouncement` containing event type, human-readable message, and progress.
