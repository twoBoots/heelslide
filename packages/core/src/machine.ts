import { createDefaultAnnouncementMessage } from './accessibility.js';
import { euclideanDistance, isNearVertex, projectPointOnSegment } from './geometry.js';
import type { FeedbackController } from './feedback.js';
import type {
  AccessibleAnnouncement,
  AccessibleAnnouncementType,
  AccessibleOptions,
  GestureState,
  InputModality,
  Point2D,
  TrackPath
} from './types.js';

export interface StateMachineOptions {
  tolerance?: number;
  segmented?: boolean;
  checkpointTimeoutMs?: number;
  accessible?: AccessibleOptions;
  onAnnouncement?: (announcement: AccessibleAnnouncement) => void;
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
  /** Which input most recently drove progress. Governs the checkpoint inactivity timer. */
  getInputModality: () => InputModality;
  start: (point: Point2D) => boolean;
  update: (point: Point2D) => void;
  end: () => void;
  cancel: () => void;
  reset: () => void;
  /**
   * Moves along the path by a signed fraction of total length. Advances progress only: unlock is
   * reached exclusively through `end()`, so keyboard and pointer share one unlock condition.
   */
  step: (deltaNormalized: number) => number;
  /** Advances to the first heel vertex strictly beyond the current position. */
  stepToNextHeel: () => number;
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
    onAnnouncement,
    accessible,
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
  let inputModality: InputModality = 'pointer';

  /**
   * Emits one accessibility milestone. Silent when accessibility is disabled or no consumer is
   * listening, so the announcement path costs nothing for pointer-only integrations.
   */
  function announce(type: AccessibleAnnouncementType): void {
    if (!onAnnouncement || accessible?.enabled === false) return;

    const context = {
      progress,
      currentSegmentIndex,
      totalSegments: track.segments.length
    };
    const override = accessible?.announceMessages?.[type];

    onAnnouncement({
      type,
      message: override ? override(context) : createDefaultAnnouncementMessage(type, context),
      progress,
      timestamp: Date.now()
    });
  }

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
    // A keyboard or switch-device user is never put on a clock: WCAG 2.2 SC 2.2.1. Pausing to
    // hear a checkpoint announcement must not cost them the checkpoint.
    if (inputModality === 'keyboard') return;
    if (segmented && checkpointTimeoutMs > 0) {
      checkpointTimer = setTimeout(() => {
        triggerReset();
      }, checkpointTimeoutMs);
    }
  }

  /**
   * Records which input is driving progress. Switching to keyboard disarms any running
   * inactivity timer, so a timer armed by an earlier pointer checkpoint cannot fire mid-step.
   */
  function setModality(modality: InputModality): void {
    if (inputModality === modality) return;
    inputModality = modality;
    if (modality === 'keyboard') {
      clearCheckpointTimer();
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
    inputModality = 'pointer';
    onProgress?.(progress);
    setState('idle');
    // Announced here rather than in triggerReset so a programmatic reset — the Home key, for
    // one — is narrated too, while triggerReset still yields exactly one announcement.
    announce('reset');
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

  /** Absolute distance travelled along the path, derived from progress rather than stored twice. */
  function currentDistance(): number {
    return track.totalLength > 0 ? progress * track.totalLength : 0;
  }

  /**
   * Places the machine at an absolute distance along the path, resolving which segment contains
   * it. Deliberately never sets 'unlocked': stepping advances position, and `end()` alone decides
   * whether that position constitutes a completed gesture.
   */
  function applyDistance(distance: number): number {
    if (track.totalLength <= 0 || track.segments.length === 0) {
      return progress;
    }

    const from = currentDistance();
    // In segmented mode a confirmed checkpoint is a floor: it cannot be rewound past, by keyboard
    // any more than by pointer.
    const floor = segmented && lastConfirmedCheckpointIndex >= 0 ? lastConfirmedDistance : 0;
    const clamped = Math.min(track.totalLength, Math.max(floor, distance));

    // Interior heel vertices, as cumulative distances.
    const boundaries: number[] = [];
    let running = 0;
    for (let i = 0; i < track.segments.length - 1; i += 1) {
      running += track.segments[i]!.length;
      boundaries.push(running);
    }

    // A heel counts as negotiated on arrival at its vertex, matching how pointer traversal
    // confirms a checkpoint on reaching a segment end rather than strictly past it.
    const crossed: number[] = [];
    for (let i = 0; i < boundaries.length; i += 1) {
      const boundary = boundaries[i]!;
      if (boundary > from && boundary <= clamped) crossed.push(i);
    }

    // Segment index stays conservative outside segmented mode: resting exactly on a vertex has
    // not yet entered the following segment. That is what keeps the conjunctive unlock check
    // honest on a track with a short trailing segment.
    let index = 0;
    for (let i = 0; i < boundaries.length; i += 1) {
      const boundary = boundaries[i]!;
      const entered = segmented ? clamped >= boundary : clamped > boundary;
      if (entered) index = i + 1;
    }

    currentSegmentIndex = index;
    accumulatedDistance = index > 0 ? boundaries[index - 1]! : 0;
    hasReachedSegmentEnd = false;
    hasTouchedHeelVertex = false;
    turnFiredForSegment = false;
    progress = clamped / track.totalLength;

    const lastCrossed = crossed.at(-1);

    if (segmented && lastCrossed !== undefined) {
      lastConfirmedCheckpointIndex = lastCrossed;
      lastConfirmedDistance = boundaries[lastCrossed]!;
      setState('checkpoint');
      // No-op while the keyboard is driving; present so a later pointer checkpoint is timed.
      startCheckpointTimer();
    } else {
      setState(progress > 0 ? 'active' : 'idle');
    }

    onProgress?.(progress);

    // Heel feedback reaches keyboard users on the same terms as pointer users: one turn event
    // per heel negotiated, even when a single step spans more than one.
    for (const heelIndex of crossed) {
      feedback?.triggerTurn();
      onTurn?.(heelIndex);
    }

    if (lastCrossed !== undefined) {
      announce(segmented ? 'checkpoint' : 'heel_reached');
      if (segmented) onCheckpoint?.(lastCrossed, progress);
    } else {
      announce('step');
    }

    return progress;
  }

  function step(deltaNormalized: number): number {
    // A completed gesture is terminal; stepping must not reopen it.
    if (state === 'unlocked') return progress;
    if (!Number.isFinite(deltaNormalized) || deltaNormalized === 0) return progress;

    setModality('keyboard');
    return applyDistance(currentDistance() + deltaNormalized * track.totalLength);
  }

  function stepToNextHeel(): number {
    if (state === 'unlocked') return progress;
    if (track.totalLength <= 0 || track.segments.length === 0) return progress;

    setModality('keyboard');

    // Strictly beyond the current position, so a call made while resting exactly on a vertex
    // advances to the following one rather than standing still.
    const epsilon = 1e-9;
    const from = currentDistance();
    let boundary = 0;

    for (const segment of track.segments) {
      boundary += segment.length;
      if (boundary > from + epsilon) {
        return applyDistance(boundary);
      }
    }

    return applyDistance(track.totalLength);
  }

  function start(point: Point2D): boolean {
    if (track.points.length === 0) return false;

    setModality('pointer');

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
      announce('start');
      return true;
    }

    return false;
  }

  function update(point: Point2D): void {
    if (state !== 'active') return;

    setModality('pointer');

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
      announce('unlock');
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
          announce('checkpoint');
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
    getInputModality: () => inputModality,
    start,
    update,
    end,
    step,
    stepToNextHeel,
    cancel,
    reset: resetState,
    destroy: clearCheckpointTimer
  };
}
