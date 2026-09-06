import { createDefaultAnnouncementMessage } from './accessibility.js';
import { euclideanDistance, projectPointOnSegment } from './geometry.js';
import type {
  AccessibleAnnouncement,
  AccessibleAnnouncementType,
  AccessibleOptions,
  GestureState,
  Point2D,
  TrackPath
} from './types.js';

export interface StateMachineOptions {
  tolerance?: number;
  accessible?: AccessibleOptions;
  onUnlock?: () => void;
  onReset?: () => void;
  onProgress?: (progress: number) => void;
  onStateChange?: (state: GestureState) => void;
  onAnnouncement?: (announcement: AccessibleAnnouncement) => void;
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
  stepForward: (amount?: number) => number;
  stepBackward: (amount?: number) => number;
  stepToNextHeel: () => number;
}

export function createGestureStateMachine(
  track: TrackPath,
  options: StateMachineOptions = {}
): GestureStateMachine {
  const {
    tolerance = 24,
    accessible,
    onUnlock,
    onReset,
    onProgress,
    onStateChange,
    onAnnouncement
  } = options;

  let state: GestureState = 'idle';
  let progress = 0;
  let currentSegmentIndex = 0;
  let accumulatedDistance = 0;

  function emitAnnouncement(
    type: AccessibleAnnouncementType,
    context?: { progress?: number; currentSegmentIndex?: number; [key: string]: unknown }
  ): void {
    if (accessible?.enabled === false) return;
    if (!onAnnouncement) return;

    const currentProgress = context?.progress ?? progress;
    const segIndex = context?.currentSegmentIndex ?? currentSegmentIndex;

    let message = '';
    const customGenerator = accessible?.announceMessages?.[type];
    if (customGenerator) {
      message = customGenerator({
        progress: currentProgress,
        currentSegmentIndex: segIndex,
        ...context
      });
    } else {
      message = createDefaultAnnouncementMessage(type, {
        progress: currentProgress,
        currentSegmentIndex: segIndex
      });
    }

    onAnnouncement({
      type,
      message,
      progress: currentProgress,
      timestamp: Date.now()
    });
  }

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
    emitAnnouncement('reset', { progress: 0, currentSegmentIndex: 0 });
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
      emitAnnouncement('start', { progress: 0, currentSegmentIndex: 0 });
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
        emitAnnouncement('heel_reached', { progress, currentSegmentIndex });
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
      emitAnnouncement('unlock', { progress: 1.0, currentSegmentIndex });
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

  function updateSegmentFromProgress(): void {
    if (track.segments.length === 0 || track.totalLength === 0) {
      currentSegmentIndex = 0;
      return;
    }
    const currentDistance = progress * track.totalLength;
    let cum = 0;
    for (let i = 0; i < track.segments.length; i++) {
      cum += track.segments[i]!.length;
      if (cum >= currentDistance || i === track.segments.length - 1) {
        currentSegmentIndex = i;
        break;
      }
    }
  }

  function stepForward(amount = 0.1): number {
    if (state === 'unlocked') {
      return 1.0;
    }
    const wasIdle = state === 'idle' || state === 'reset';
    if (wasIdle) {
      setState('active');
      emitAnnouncement('start', { progress: 0, currentSegmentIndex });
    }
    const newProgress = Math.min(1.0, progress + amount);
    if (newProgress >= 0.95 || currentSegmentIndex >= track.segments.length) {
      progress = 1.0;
      currentSegmentIndex = Math.max(0, track.segments.length - 1);
      setState('unlocked');
      onProgress?.(1.0);
      emitAnnouncement('unlock', { progress: 1.0, currentSegmentIndex });
      onUnlock?.();
      return 1.0;
    }
    progress = newProgress;
    const prevSeg = currentSegmentIndex;
    updateSegmentFromProgress();
    onProgress?.(progress);
    if (currentSegmentIndex > prevSeg) {
      emitAnnouncement('heel_reached', { progress, currentSegmentIndex });
    }
    emitAnnouncement('step', { progress, currentSegmentIndex });
    return progress;
  }

  function stepBackward(amount = 0.1): number {
    if (state !== 'active') {
      return progress;
    }
    const newProgress = Math.max(0, progress - amount);
    progress = newProgress;
    updateSegmentFromProgress();
    onProgress?.(progress);
    emitAnnouncement('step', { progress, currentSegmentIndex });
    return progress;
  }

  function stepToNextHeel(): number {
    if (state === 'unlocked') {
      return 1.0;
    }
    const wasIdle = state === 'idle' || state === 'reset';
    if (wasIdle) {
      setState('active');
      emitAnnouncement('start', { progress: 0, currentSegmentIndex });
    }
    if (track.segments.length === 0) {
      progress = 1.0;
      setState('unlocked');
      onProgress?.(1.0);
      emitAnnouncement('unlock', { progress: 1.0, currentSegmentIndex });
      onUnlock?.();
      return 1.0;
    }

    if (currentSegmentIndex >= track.segments.length - 1) {
      progress = 1.0;
      currentSegmentIndex = track.segments.length - 1;
      setState('unlocked');
      onProgress?.(1.0);
      emitAnnouncement('unlock', { progress: 1.0, currentSegmentIndex });
      onUnlock?.();
      return 1.0;
    }

    let cum = 0;
    for (let i = 0; i <= currentSegmentIndex; i++) {
      cum += track.segments[i]!.length;
    }

    currentSegmentIndex = Math.min(track.segments.length - 1, currentSegmentIndex + 1);
    const newProgress = track.totalLength > 0 ? Math.min(1.0, cum / track.totalLength) : 1.0;
    progress = newProgress;

    if (progress >= 0.95) {
      progress = 1.0;
      setState('unlocked');
      onProgress?.(1.0);
      emitAnnouncement('unlock', { progress: 1.0, currentSegmentIndex });
      onUnlock?.();
      return 1.0;
    }

    onProgress?.(progress);
    emitAnnouncement('heel_reached', { progress, currentSegmentIndex });
    return progress;
  }

  return {
    getState: () => state,
    getProgress: () => progress,
    getCurrentSegmentIndex: () => currentSegmentIndex,
    start,
    update,
    end,
    cancel,
    reset: () => {
      resetState();
      emitAnnouncement('reset', { progress: 0, currentSegmentIndex: 0 });
    },
    stepForward,
    stepBackward,
    stepToNextHeel
  };
}
