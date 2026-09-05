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
Procedurally generated paths MUST remain strictly rectilinear and non-self-intersecting within container bounds.

- **GIVEN** a grid step and bounding box
- **WHEN** a path is computed
- **THEN** no segment of the path MAY intersect or overlap any non-adjacent segment.

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
- **GIVEN** an active gesture tracking along segment `K`
- **WHEN** `updateGesture(point)` is called with coordinates deviating beyond `tolerance` from the segment
- **THEN** state MUST immediately transition to `reset`, emit `onReset`, and revert progress to 0.

### Requirement: Heel Navigation & Segment Advancement
- **GIVEN** an active gesture near a heel corner vertex
- **WHEN** `updateGesture(point)` reaches within vertex tolerance and proceeds in the direction of the next segment
- **THEN** the active segment index MUST increment and overall progress MUST update continuously.

### Requirement: Incomplete Slide Cancellation
- **GIVEN** an active gesture at intermediate progress (< 1.0)
- **WHEN** `endGesture()` or `cancelGesture()` is triggered before reaching the final endpoint
- **THEN** state MUST transition to `reset`, invoke `onReset`, and return to `idle`.

### Requirement: Successful Intent Confirmation (Unlock)
- **GIVEN** an active gesture reaching the final destination coordinate within tolerance
- **WHEN** the user reaches the end of the final segment
- **THEN** state MUST transition to `unlocked` and trigger `onUnlock`.
