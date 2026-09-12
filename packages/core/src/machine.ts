import { euclideanDistance, isNearVertex, projectPointOnSegment } from './geometry.js';
import type { FeedbackController } from './feedback.js';
import type { GestureState, Point2D, TrackPath } from './types.js';

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

export interface GestureStateMachine {
  getState: () => GestureState;
  getProgress: () => number;
  getCurrentSegmentIndex: () => number;
  start: (point: Point2D) => boolean;
  update: (point: Point2D) => void;
  end: () => void;
  cancel: () => void;
  reset: () => void;
  destroy?: () => void;
}

export function createGestureStateMachine(
  track: TrackPath,
  options: StateMachineOptions = {}
): GestureStateMachine {
  const {
    tolerance = 24,
    segmented = false,
    checkpointTimeoutMs = 0,
    onTurn,
    onCheckpoint,
    onUnlock,
    onReset,
    onProgress,
    onStateChange,
    feedback
  } = options;

  let state: GestureState = options.initialState ?? 'idle';
  let progress = options.initialProgress ?? (state === 'unlocked' ? 1.0 : state === 'active' ? 0.5 : 0);
  let currentSegmentIndex = 0;
  let accumulatedDistance = 0;
  let lastConfirmedCheckpointIndex = -1;
  let lastConfirmedDistance = 0;
  let hasReachedSegmentEnd = false;
  let hasTouchedHeelVertex = false;
  let turnFiredForSegment = false;
  let checkpointTimer: ReturnType<typeof setTimeout> | null = null;

  function setState(newState: GestureState): void {
    if (state !== newState) {
      state = newState;
      onStateChange?.(state);
    }
  }

  function clearCheckpointTimer(): void {
    if (checkpointTimer !== null) {
      clearTimeout(checkpointTimer);
      checkpointTimer = null;
    }
  }

  function startCheckpointTimer(): void {
    clearCheckpointTimer();
    if (segmented && checkpointTimeoutMs > 0) {
      checkpointTimer = setTimeout(() => {
        triggerReset();
      }, checkpointTimeoutMs);
    }
  }

  /**
   * Returns the machine to its fail-safe origin. `initialState` seeds construction only; it is
   * never a reset target, otherwise an engine seeded as 'unlocked' would report success after a
   * rejected gesture.
   */
  function resetState(): void {
    clearCheckpointTimer();
    progress = 0;
    currentSegmentIndex = 0;
    accumulatedDistance = 0;
    lastConfirmedCheckpointIndex = -1;
    lastConfirmedDistance = 0;
    hasReachedSegmentEnd = false;
    hasTouchedHeelVertex = false;
    turnFiredForSegment = false;
    onProgress?.(progress);
    setState('idle');
  }

  function triggerReset(): void {
    clearCheckpointTimer();
    feedback?.triggerReset();
    setState('reset');
    resetState();
    onReset?.();
  }

  function snapbackToCheckpoint(): void {
    if (lastConfirmedCheckpointIndex >= 0) {
      currentSegmentIndex = lastConfirmedCheckpointIndex + 1;
      accumulatedDistance = lastConfirmedDistance;
      hasReachedSegmentEnd = false;
      hasTouchedHeelVertex = false;
      turnFiredForSegment = false;
      progress = track.totalLength > 0 ? Math.min(1, Math.max(0, accumulatedDistance / track.totalLength)) : 0;
      setState('checkpoint');
      feedback?.triggerReset();
      onProgress?.(progress);
      startCheckpointTimer();
    } else {
      triggerReset();
    }
  }

  function start(point: Point2D): boolean {
    if (track.points.length === 0) return false;

    if (segmented && state === 'checkpoint') {
      const checkpointPoint = track.points[lastConfirmedCheckpointIndex + 1];
      if (checkpointPoint && euclideanDistance(point, checkpointPoint) <= tolerance) {
        clearCheckpointTimer();
        hasReachedSegmentEnd = false;
        hasTouchedHeelVertex = false;
        turnFiredForSegment = false;
        setState('active');
        return true;
      }
      return false;
    }

    const origin = track.points[0]!;
    const distanceToOrigin = euclideanDistance(point, origin);

    if (distanceToOrigin <= tolerance) {
      clearCheckpointTimer();
      currentSegmentIndex = 0;
      accumulatedDistance = 0;
      lastConfirmedCheckpointIndex = -1;
      lastConfirmedDistance = 0;
      hasReachedSegmentEnd = false;
      hasTouchedHeelVertex = false;
      turnFiredForSegment = false;
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
    const currentProjection = projectPointOnSegment(point, currentSegment);

    if (!segmented) {
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

        // Negotiating a heel means actually reaching it. Without this the pointer can appear on
        // segment K+1 having never come near the corner — a straight diagonal that skips the
        // direction change the heel exists to demand.
        if (isNearVertex(point, currentSegment.end, tolerance)) {
          hasTouchedHeelVertex = true;
        }

        const isAdvancingOnNext =
          hasTouchedHeelVertex && hasPassedHeel && nextProj.distance <= tolerance && nextProj.t > 0;

        if (isAdvancingOnNext) {
          accumulatedDistance += currentSegment.length;
          const navigatedHeelIndex = currentSegmentIndex;
          currentSegmentIndex += 1;
          hasTouchedHeelVertex = false;

          feedback?.triggerTurn();
          onTurn?.(navigatedHeelIndex);

          const currentDistance = accumulatedDistance + nextProj.t * nextSegment.length;
          progress = track.totalLength > 0 ? Math.min(1, Math.max(0, currentDistance / track.totalLength)) : 0;
          onProgress?.(progress);
          return;
        }
      }

      // Check tolerance against current segment
      if (currentProjection.distance > tolerance) {
        triggerReset();
        return;
      }

      const currentDistance = accumulatedDistance + currentProjection.t * currentSegment.length;
      progress = track.totalLength > 0 ? Math.min(1, Math.max(0, currentDistance / track.totalLength)) : 0;
      onProgress?.(progress);
      return;
    }

    // Segmented mode
    const isLastSegment = currentSegmentIndex === track.segments.length - 1;
    const projection = currentProjection;

    if (isLastSegment) {
      if (projection.distance > tolerance) {
        snapbackToCheckpoint();
        return;
      }
      const currentDistance = accumulatedDistance + projection.t * currentSegment.length;
      progress = track.totalLength > 0 ? Math.min(1, Math.max(0, currentDistance / track.totalLength)) : 0;
      onProgress?.(progress);
      return;
    }

    const nextSegment = track.segments[currentSegmentIndex + 1]!;
    const nextProj = projectPointOnSegment(point, nextSegment);
    const distToEnd = euclideanDistance(point, currentSegment.end);
    const reachedHeel = projection.t >= 0.98 || distToEnd <= tolerance;

    if (reachedHeel) {
      hasReachedSegmentEnd = true;
      if (!turnFiredForSegment) {
        turnFiredForSegment = true;
        feedback?.triggerTurn();
        onTurn?.(currentSegmentIndex);
      }
    }

    if (hasReachedSegmentEnd) {
      const isNearNext = nextProj.distance <= tolerance;
      const isNearHeel = distToEnd <= tolerance * 2;
      if (!isNearNext && !isNearHeel && projection.distance > tolerance) {
        snapbackToCheckpoint();
        return;
      }

      const currentDistance = accumulatedDistance + currentSegment.length;
      progress = track.totalLength > 0 ? Math.min(1, Math.max(0, currentDistance / track.totalLength)) : 0;
      onProgress?.(progress);
      return;
    }

    if (projection.distance > tolerance) {
      snapbackToCheckpoint();
      return;
    }

    const currentDistance = accumulatedDistance + projection.t * currentSegment.length;
    progress = track.totalLength > 0 ? Math.min(1, Math.max(0, currentDistance / track.totalLength)) : 0;
    onProgress?.(progress);
  }

  function end(): void {
    if (state !== 'active') return;

    // Unlock requires being on the final segment: aggregate progress alone is satisfiable at an
    // earlier heel whenever the trailing segments are short relative to total length.
    const isAtEnd =
      track.segments.length > 0 &&
      currentSegmentIndex === track.segments.length - 1 &&
      progress >= 0.95;

    if (isAtEnd) {
      clearCheckpointTimer();
      progress = 1.0;
      onProgress?.(1.0);
      setState('unlocked');
      feedback?.triggerUnlock();
      onUnlock?.();
      return;
    }

    if (segmented) {
      if (hasReachedSegmentEnd && currentSegmentIndex < track.segments.length - 1) {
        const currentSegment = track.segments[currentSegmentIndex];
        if (currentSegment) {
          const heelIndex = currentSegmentIndex;
          accumulatedDistance += currentSegment.length;
          currentSegmentIndex += 1;
          lastConfirmedCheckpointIndex = heelIndex;
          lastConfirmedDistance = accumulatedDistance;
          hasReachedSegmentEnd = false;
          hasTouchedHeelVertex = false;
          turnFiredForSegment = false;
          progress = track.totalLength > 0 ? Math.min(1, Math.max(0, accumulatedDistance / track.totalLength)) : 0;
          setState('checkpoint');
          onProgress?.(progress);
          onCheckpoint?.(heelIndex, progress);
          startCheckpointTimer();
          return;
        }
      }

      snapbackToCheckpoint();
      return;
    }

    triggerReset();
  }

  function cancel(): void {
    if (state === 'active') {
      if (segmented) {
        snapbackToCheckpoint();
      } else {
        triggerReset();
      }
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
    reset: resetState,
    destroy: clearCheckpointTimer
  };
}
