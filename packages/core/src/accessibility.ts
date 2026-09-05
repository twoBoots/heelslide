import type { AccessibleStep, Direction, Point2D, TrackPath } from './types.js';

/**
 * Derives the cardinal movement direction for a segment.
 */
export function getStepDirection(
  start: Point2D,
  end: Point2D,
  direction: Direction
): 'right' | 'left' | 'down' | 'up' {
  if (direction === 'horizontal') {
    return end.x >= start.x ? 'right' : 'left';
  }
  return end.y >= start.y ? 'down' : 'up';
}

/**
 * Decomposes a rectilinear track path into an array of accessible steps with screen-reader instructions.
 */
export function getAccessibleSteps(track: TrackPath): AccessibleStep[] {
  const totalSegments = track.segments.length;
  if (totalSegments === 0) return [];

  let cumulativeDistance = 0;
  return track.segments.map((seg, i) => {
    cumulativeDistance += seg.length;
    const isLast = i === totalSegments - 1;
    const isFirst = i === 0;
    const dir = getStepDirection(seg.start, seg.end, seg.direction);
    const stepNum = i + 1;

    let targetGoal: string;
    if (isLast) {
      targetGoal = 'unlock';
    } else if (isFirst) {
      targetGoal = 'first heel';
    } else {
      targetGoal = 'next heel';
    }

    const instruction = `Step ${stepNum} of ${totalSegments}: Move ${dir} to ${targetGoal}`;
    const progressAtEnd = isLast
      ? 1
      : track.totalLength > 0
      ? cumulativeDistance / track.totalLength
      : 1;

    return {
      segmentIndex: i,
      direction: seg.direction,
      startPoint: seg.start,
      endPoint: seg.end,
      instruction,
      progressAtEnd
    };
  });
}

/**
 * Produces a human-readable summary of the track turns and directions for screen readers.
 */
export function getAccessibleDescription(track: TrackPath): string {
  const totalSegments = track.segments.length;
  if (totalSegments === 0) {
    return 'Security gate: no path configured';
  }

  const directions = track.segments.map((seg) =>
    getStepDirection(seg.start, seg.end, seg.direction)
  );

  const turns = Math.max(0, totalSegments - 1);
  const turnLabel = turns === 1 ? '1 turn' : `${turns} turns`;

  return `Security gate with ${turnLabel}: move ${directions.join(', then ')} to unlock`;
}
