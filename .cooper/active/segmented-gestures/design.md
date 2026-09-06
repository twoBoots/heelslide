# Design Document: Segmented Multi-Gesture Checkpoints

## 1. Architectural Overview

The segmented multi-gesture mechanism enhances the core gesture state machine (`packages/core/src/machine.ts`) to support stepwise path traversal. When `segmented: true` is enabled, each heel acts as a physical gate that clamps movement and requires release of the pointer before the next segment can be traversed.

```
Continuous Mode (segmented: false):
  [idle] --start--> [active] ----------------drag across heels---------------> [unlocked]
                       |                                                             ^
                       +---- deviation / premature release ----> [reset] ----> [idle]

Segmented Mode (segmented: true):
  [idle] --start--> [active] ---reach heel 0---> [active (clamped)]
                       |                                |
                   snapback                          release
                       |                                v
                    [idle] <--------------------- [checkpoint 0]
                               (timeout)                |
                                                    start (at heel 0)
                                                        v
                                                   [active] ---reach heel 1---> ...
                                                        |
                                                    snapback
                                                        |
                                                        v
                                                 [checkpoint 0]
```

## 2. API Contracts & Type Definitions

### 2.1 Core Types (`packages/core/src/types.ts`)

```typescript
export type GestureState = 'idle' | 'active' | 'unlocked' | 'reset' | 'checkpoint';

export interface StateMachineOptions {
  tolerance?: number;
  segmented?: boolean;
  checkpointTimeoutMs?: number;
  initialState?: GestureState;
  initialProgress?: number;
  onTurn?: (heelIndex: number) => void;
  onCheckpoint?: (heelIndex: number, progress: number) => void;
  onUnlock?: () => void;
  onReset?: () => void;
  onProgress?: (progress: number) => void;
  onStateChange?: (state: GestureState) => void;
  feedback?: FeedbackController;
}

export interface EngineOptions extends StateMachineOptions {
  generator?: GeneratorOptions;
  haptics?: boolean | HapticOptions;
  sound?: boolean | SoundOptions;
}
```

## 3. Detailed Component & State Machine Mechanics

### 3.1 Checkpoint Clamping at Heel Vertices
When `segmented: true`:
1. During `update(point)` along `currentSegmentIndex`:
   - The projection onto the current segment `t` is clamped to `[0, 1]`.
   - The advancement condition onto `nextSegment` is suppressed during an active gesture stroke.
   - If the projection reaches `t >= 0.98` (or within vertex tolerance of `currentSegment.end`), the handle position and progress are clamped exactly to the heel vertex coordinate.
   - If this heel was not yet reached during this stroke, trigger `feedback.triggerTurn()` and `onTurn?.(currentSegmentIndex)`.
   - Any further pointer movement along subsequent segments while the pointer remains held is ignored (handle stays fixed at heel vertex).

### 3.2 Checkpoint Transition on Release (`end()`)
When the pointer is released via `end()`:
1. **At Destination Endpoint:** If the user reached the end of the final segment (`progress >= 0.95`), the engine transitions to `'unlocked'`, calls `onUnlock()`, and fires unlock feedback.
2. **At a Heel Vertex:** If the handle is resting at `currentSegment.end` (heel vertex):
   - Active segment index advances to `currentSegmentIndex + 1`.
   - State transitions to `'checkpoint'`.
   - `lastReachedCheckpointIndex` is updated to `currentSegmentIndex`.
   - `onCheckpoint?.(heelIndex, progress)` is triggered.
   - If `checkpointTimeoutMs > 0`, an inactivity timer is initiated.
3. **Mid-Segment Premature Release:** If the user releases contact between checkpoints:
   - Progress and handle position snap back to the last confirmed checkpoint (or start point if no heels reached yet).
   - State transitions to `'checkpoint'` (if previous heel exists) or `'idle'` (if at origin).
   - `feedback.triggerReset()` provides audio/haptic cue of the snapback.
   - `onProgress?.(checkpointProgress)` is emitted.
   - If `checkpointTimeoutMs > 0` and at a checkpoint, the inactivity timer is restarted.

### 3.3 Checkpoint Resumption (`start()`)
When `start(point)` is called:
1. **If at origin (`idle`):** Checks distance to origin `track.points[0] <= tolerance`.
2. **If at a checkpoint (`checkpoint`):**
   - Resolves target position as `track.points[lastReachedCheckpointIndex]`.
   - Checks `euclideanDistance(point, targetPosition) <= tolerance`.
   - If engaged within tolerance:
     - Cancels active inactivity timer.
     - State transitions to `'active'`.
     - Slider is now free to traverse the next segment.

### 3.4 Inactivity Expiration
If `checkpointTimeoutMs > 0` and the user remains at a checkpoint without initiating the next gesture:
- When the timer fires:
  - State transitions to `'reset'` -> `'idle'`.
  - Progress reverts to `0`.
  - Active segment reverts to `0`.
  - `lastReachedCheckpointIndex` clears to `0`.
  - `feedback.triggerReset()` and `onReset?.()` are invoked.

### 3.5 Lifecycle and Memory Safety
- `destroy()` and `reset()` on `HeelslideEngine` explicitly clear any pending `checkpointTimeout` timer to avoid leaks.

## 4. Framework Adapter Integration

### 4.1 React (`@heelslide/react`)
```tsx
export interface HeelslideProps {
  // Existing props...
  segmented?: boolean;
  checkpointTimeoutMs?: number;
  onCheckpoint?: (heelIndex: number, progress: number) => void;
}
```
Exposes `data-state="checkpoint"` on the container DOM element to allow CSS styling and animation (such as a breathing glow or waiting pulse at the checkpoint handle).

### 4.2 Vue (`@heelslide/vue`)
Props:
- `segmented: { type: Boolean, default: false }`
- `checkpointTimeoutMs: { type: Number, default: 0 }`
Events:
- `@checkpoint: (payload: { heelIndex: number, progress: number }) => void`

### 4.3 Svelte (`@heelslide/svelte`)
Props:
- `segmented?: boolean`
- `checkpointTimeoutMs?: number`
- `oncheckpoint?: (heelIndex: number, progress: number) => void`

## 5. Visual Regression & Playground Demonstration
In `apps/docs`:
- Add a "Segmented Mode" toggle checkbox in the playground control panel.
- Add an optional "Checkpoint Timeout (ms)" number input slider (0 to 10000ms).
- Add visual indicators for checkpoints along the track.
