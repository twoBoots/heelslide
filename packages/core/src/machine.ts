import { euclideanDistance, projectPointOnSegment } from './geometry.js';
import type { GestureState, Point2D, TrackPath } from './types.js';

export interface StateMachineOptions {
  tolerance?: number;
  initialState?: GestureState;
  initialProgress?: number;
  onUnlock?: () => void;
  onReset?: () => void;
  onProgress?: (progress: number) => void;
  onStateChange?: (state: GestureState) => void;
}

export interface GestureStateMachine {
  getState: () => GestureState;
  getProgress: () => number;
  getCurrentSegmentIndex: () => number;
  start: (point: Point2D) => boolean;
  update: (point: Point2D) => void;
  end: () => void;
  cancel: () => void;
  reset: () => void;
}

export function createGestureStateMachine(
  track: TrackPath,
  options: StateMachineOptions = {}
): GestureStateMachine {
  const { tolerance = 24, onUnlock, onReset, onProgress, onStateChange } = options;

  let state: GestureState = options.initialState ?? 'idle';
  let progress = options.initialProgress ?? (state === 'unlocked' ? 1.0 : state === 'active' ? 0.5 : 0);
  let currentSegmentIndex = 0;
  let accumulatedDistance = 0;

  function setState(newState: GestureState): void {
    if (state !== newState) {
      state = newState;
      onStateChange?.(state);
    }
  }

  function resetState(): void {
    state = 'idle';
    progress = 0;
    currentSegmentIndex = 0;
    accumulatedDistance = 0;
    onProgress?.(0);
    setState('idle');
  }

  function triggerReset(): void {
    resetState();
    onReset?.();
  }

  function start(point: Point2D): boolean {
    if (track.points.length === 0) return false;

    const origin = track.points[0]!;
    const distanceToOrigin = euclideanDistance(point, origin);

    if (distanceToOrigin <= tolerance) {
      currentSegmentIndex = 0;
      accumulatedDistance = 0;
      progress = 0;
      setState('active');
      onProgress?.(0);
      return true;
    }

    return false;
  }

  function update(point: Point2D): void {
    if (state !== 'active') return;

    if (currentSegmentIndex >= track.segments.length) {
      return;
    }

    const currentSegment = track.segments[currentSegmentIndex]!;

    // Check if the gesture is advancing onto the next segment across the heel
    if (currentSegmentIndex < track.segments.length - 1) {
      const nextSegment = track.segments[currentSegmentIndex + 1]!;
      const nextProj = projectPointOnSegment(point, nextSegment);

      const hasPassedHeel =
        currentSegment.direction === 'horizontal'
          ? currentSegment.end.x >= currentSegment.start.x
            ? point.x >= currentSegment.end.x - 0.5
            : point.x <= currentSegment.end.x + 0.5
          : currentSegment.end.y >= currentSegment.start.y
          ? point.y >= currentSegment.end.y - 0.5
          : point.y <= currentSegment.end.y + 0.5;

      const isAdvancingOnNext = hasPassedHeel && nextProj.distance <= tolerance && nextProj.t > 0;

      if (isAdvancingOnNext) {
        accumulatedDistance += currentSegment.length;
        currentSegmentIndex += 1;

        const currentDistance = accumulatedDistance + nextProj.t * nextSegment.length;
        progress = track.totalLength > 0 ? Math.min(1, Math.max(0, currentDistance / track.totalLength)) : 0;
        onProgress?.(progress);
        return;
      }
    }

    const projection = projectPointOnSegment(point, currentSegment);

    // Check tolerance against current segment
    if (projection.distance > tolerance) {
      triggerReset();
      return;
    }

    const currentDistance = accumulatedDistance + projection.t * currentSegment.length;
    progress = track.totalLength > 0 ? Math.min(1, Math.max(0, currentDistance / track.totalLength)) : 0;
    onProgress?.(progress);
  }

  function end(): void {
    if (state !== 'active') return;

    // Check if close to terminal destination
    const lastPoint = track.points[track.points.length - 1];
    const isAtEnd =
      progress >= 0.95 ||
      (lastPoint !== undefined && currentSegmentIndex === track.segments.length - 1 && progress >= 0.9);

    if (isAtEnd) {
      progress = 1.0;
      onProgress?.(1.0);
      setState('unlocked');
      onUnlock?.();
    } else {
      triggerReset();
    }
  }

  function cancel(): void {
    if (state === 'active') {
      triggerReset();
    }
  }

  return {
    getState: () => state,
    getProgress: () => progress,
    getCurrentSegmentIndex: () => currentSegmentIndex,
    start,
    update,
    end,
    cancel,
    reset: resetState
  };
}
