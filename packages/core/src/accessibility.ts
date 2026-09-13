import type {
  AccessibleAnnouncementType,
  AccessibleStep,
  AnnouncementContext,
  Direction,
  Point2D,
  StepDirection,
  TrackPath
} from './types.js';

/**
 * Resolves the cardinal movement direction for a segment from its axis and the sign of its
 * displacement.
 */
export function getStepDirection(
  start: Point2D,
  end: Point2D,
  direction: Direction
): StepDirection {
  if (direction === 'horizontal') {
    return end.x >= start.x ? 'right' : 'left';
  }
  return end.y >= start.y ? 'down' : 'up';
}

/**
 * Decomposes a rectilinear track into one accessible step per segment, each carrying a
 * screen-reader instruction and the cumulative progress at that segment's end.
 */
export function getAccessibleSteps(track: TrackPath): AccessibleStep[] {
  const totalSegments = track.segments.length;
  if (totalSegments === 0) return [];

  let cumulativeDistance = 0;

  return track.segments.map((segment, index) => {
    cumulativeDistance += segment.length;

    const isLast = index === totalSegments - 1;
    const isFirst = index === 0;
    const stepDirection = getStepDirection(segment.start, segment.end, segment.direction);

    let target: string;
    if (isLast) {
      target = 'unlock';
    } else if (isFirst) {
      target = 'the first turn';
    } else {
      target = 'the next turn';
    }

    // The final segment is pinned to 1 rather than computed, so accumulated floating-point
    // error across segments can never leave a fully traversed track short of complete.
    const progressAtEnd =
      isLast || track.totalLength <= 0 ? 1 : cumulativeDistance / track.totalLength;

    return {
      segmentIndex: index,
      direction: segment.direction,
      startPoint: segment.start,
      endPoint: segment.end,
      instruction: `Step ${index + 1} of ${totalSegments}: move ${stepDirection} to ${target}`,
      progressAtEnd
    };
  });
}

/**
 * Produces a single-sentence summary of the path's shape, suitable for `aria-describedby` so a
 * screen-reader user learns the route before attempting it.
 */
export function getAccessibleDescription(track: TrackPath): string {
  const totalSegments = track.segments.length;
  if (totalSegments === 0) {
    return 'Security gate: no path configured.';
  }

  const directions = track.segments.map((segment) =>
    getStepDirection(segment.start, segment.end, segment.direction)
  );

  const turns = totalSegments - 1;
  const turnLabel = turns === 1 ? '1 turn' : `${turns} turns`;

  return `Security gate with ${turnLabel}: move ${directions.join(', then ')} to unlock.`;
}

/**
 * Default screen-reader wording for each announcement milestone. Consumers override individual
 * types through `AccessibleOptions.announceMessages`.
 */
export function createDefaultAnnouncementMessage(
  type: AccessibleAnnouncementType,
  context: AnnouncementContext
): string {
  const percent = Math.round((context.progress ?? 0) * 100);
  // Crossing out of segment K negotiates heel K, which is heel K in 1-based terms — so the heel
  // just crossed is the index of the segment now occupied, not that index plus one.
  const heelNumber = Math.max(1, context.currentSegmentIndex ?? 1);

  switch (type) {
    case 'start':
      return 'Gesture started. Move along the track to begin.';
    case 'step':
      return `${percent}% complete.`;
    case 'heel_reached':
      return `Turn ${heelNumber} reached. Change direction to continue. ${percent}% complete.`;
    case 'checkpoint':
      // Distinct from 'heel_reached': a checkpoint is confirmed and cannot be rewound past.
      return `Checkpoint ${heelNumber} confirmed. ${percent}% complete.`;
    case 'unlock':
      return 'Security gate unlocked.';
    case 'reset':
      return 'Gesture reset to the start.';
  }
}
