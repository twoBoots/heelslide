import { describe, it, expect } from 'vitest';
import {
  getAccessibleSteps,
  getAccessibleDescription,
  getStepDirection
} from '../src/accessibility.js';
import type { TrackPath } from '../src/types.js';

/**
 * Semantic path description for assistive technology.
 *
 * Partially derived from the superseded `accessibility-fallback` branch; see
 * `.cooper/active/accessibility-keyboard-nav/harvest/AUDIT.md` for which harvested assertions
 * were kept and why.
 */

/** Three segments, two heels: right, then down, then right. */
const mockTrack: TrackPath = {
  points: [
    { x: 10, y: 10 },
    { x: 110, y: 10 },
    { x: 110, y: 110 },
    { x: 210, y: 110 }
  ],
  segments: [
    { start: { x: 10, y: 10 }, end: { x: 110, y: 10 }, direction: 'horizontal', length: 100 },
    { start: { x: 110, y: 10 }, end: { x: 110, y: 110 }, direction: 'vertical', length: 100 },
    { start: { x: 110, y: 110 }, end: { x: 210, y: 110 }, direction: 'horizontal', length: 100 }
  ],
  totalLength: 300,
  heelCount: 2
};

/** Single segment, zero heels. */
const straightTrack: TrackPath = {
  points: [
    { x: 0, y: 0 },
    { x: 50, y: 0 }
  ],
  segments: [
    { start: { x: 0, y: 0 }, end: { x: 50, y: 0 }, direction: 'horizontal', length: 50 }
  ],
  totalLength: 50,
  heelCount: 0
};

const emptyTrack: TrackPath = { points: [], segments: [], totalLength: 0, heelCount: 0 };

describe('getStepDirection', () => {
  it('resolves horizontal segments to right or left by sign', () => {
    expect(getStepDirection({ x: 0, y: 0 }, { x: 10, y: 0 }, 'horizontal')).toBe('right');
    expect(getStepDirection({ x: 10, y: 0 }, { x: 0, y: 0 }, 'horizontal')).toBe('left');
  });

  it('resolves vertical segments to down or up by sign', () => {
    expect(getStepDirection({ x: 0, y: 0 }, { x: 0, y: 10 }, 'vertical')).toBe('down');
    expect(getStepDirection({ x: 0, y: 10 }, { x: 0, y: 0 }, 'vertical')).toBe('up');
  });
});

describe('getAccessibleSteps', () => {
  it('returns one step per track segment', () => {
    const steps = getAccessibleSteps(mockTrack);
    expect(steps).toHaveLength(mockTrack.segments.length);
  });

  it('describes each segment with index, direction, endpoints and cumulative progress', () => {
    const steps = getAccessibleSteps(mockTrack);

    expect(steps[0]).toMatchObject({
      segmentIndex: 0,
      direction: 'horizontal',
      startPoint: { x: 10, y: 10 },
      endPoint: { x: 110, y: 10 }
    });
    expect(steps[0]?.instruction).toContain('right');
    expect(steps[0]?.progressAtEnd).toBeCloseTo(100 / 300, 5);

    expect(steps[1]?.direction).toBe('vertical');
    expect(steps[1]?.instruction).toContain('down');
    expect(steps[1]?.progressAtEnd).toBeCloseTo(200 / 300, 5);
  });

  it('numbers instructions one-based against the total segment count', () => {
    const steps = getAccessibleSteps(mockTrack);
    expect(steps[0]?.instruction).toContain('Step 1 of 3');
    expect(steps[2]?.instruction).toContain('Step 3 of 3');
  });

  it('ends the final step at progress 1', () => {
    const steps = getAccessibleSteps(mockTrack);
    expect(steps.at(-1)?.progressAtEnd).toBe(1);
  });

  it('handles a single-segment path with no heels', () => {
    const steps = getAccessibleSteps(straightTrack);
    expect(steps).toHaveLength(1);
    expect(steps[0]?.progressAtEnd).toBe(1);
  });

  it('returns an empty array for a track with no segments', () => {
    expect(getAccessibleSteps(emptyTrack)).toEqual([]);
  });
});

describe('getAccessibleDescription', () => {
  it('summarises turn count and direction sequence in one sentence', () => {
    const description = getAccessibleDescription(mockTrack);
    expect(description).toContain('2 turns');
    expect(description).toContain('right');
    expect(description).toContain('down');
  });

  it('pluralises a single turn correctly', () => {
    const oneTurn: TrackPath = {
      ...mockTrack,
      points: mockTrack.points.slice(0, 3),
      segments: mockTrack.segments.slice(0, 2),
      totalLength: 200,
      heelCount: 1
    };
    expect(getAccessibleDescription(oneTurn)).toContain('1 turn');
    expect(getAccessibleDescription(oneTurn)).not.toContain('1 turns');
  });

  it('describes a straight path as having no turns', () => {
    expect(getAccessibleDescription(straightTrack)).toContain('0 turns');
  });

  it('degrades gracefully when no path is configured', () => {
    expect(getAccessibleDescription(emptyTrack)).toMatch(/no path/i);
  });
});
