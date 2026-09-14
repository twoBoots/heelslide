import { describe, it, expect, vi } from 'vitest';
import { HeelslideEngine } from './engine.js';
import type { TrackPath } from './types.js';

/**
 * Discrete stepping for keyboard and switch-device control.
 *
 * Stepping advances progress only. Unlock is reached exclusively through the confirm path
 * (`endGesture`), which is the same transition pointer release uses, so both modalities are
 * governed by one condition. See `design.md` §2 and `harvest/AUDIT.md` §5.
 */

/** Three equal segments, two heels: right, down, right. */
const evenTrack: TrackPath = {
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

/**
 * The regression track from audit commit `6c8c6fb`. Its short trailing segment makes aggregate
 * progress reach 0.9756 at the end of segment 1 — above the 0.95 unlock threshold, while two
 * segments from the end. Unlock must stay blocked there.
 */
const shortTailTrack: TrackPath = {
  points: [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 105, y: 100 }
  ],
  segments: [
    { start: { x: 0, y: 0 }, end: { x: 100, y: 0 }, direction: 'horizontal', length: 100 },
    { start: { x: 100, y: 0 }, end: { x: 100, y: 100 }, direction: 'vertical', length: 100 },
    { start: { x: 100, y: 100 }, end: { x: 105, y: 100 }, direction: 'horizontal', length: 5 }
  ],
  totalLength: 205,
  heelCount: 2
};

describe('stepForward', () => {
  it('engages from idle and advances progress', () => {
    const engine = new HeelslideEngine({ track: evenTrack });

    expect(engine.getState()).toBe('idle');
    engine.stepForward(0.1);

    expect(engine.getState()).toBe('active');
    expect(engine.getProgress()).toBeCloseTo(0.1, 5);
  });

  it('advances by the given fraction of total path length', () => {
    const engine = new HeelslideEngine({ track: evenTrack });

    engine.stepForward(0.25);
    expect(engine.getProgress()).toBeCloseTo(0.25, 5);

    engine.stepForward(0.25);
    expect(engine.getProgress()).toBeCloseTo(0.5, 5);
  });

  it('uses the configured stepIncrement when no amount is given', () => {
    const engine = new HeelslideEngine({ track: evenTrack, accessible: { stepIncrement: 0.2 } });

    engine.stepForward();
    expect(engine.getProgress()).toBeCloseTo(0.2, 5);
  });

  it('defaults to a 0.1 increment when none is configured', () => {
    const engine = new HeelslideEngine({ track: evenTrack });

    engine.stepForward();
    expect(engine.getProgress()).toBeCloseTo(0.1, 5);
  });

  it('advances the segment index when stepping across a heel vertex', () => {
    const engine = new HeelslideEngine({ track: evenTrack });

    engine.stepForward(0.2);
    expect(engine.getCurrentSegmentIndex()).toBe(0);

    engine.stepForward(0.3);
    expect(engine.getCurrentSegmentIndex()).toBe(1);
  });

  it('traverses every segment across repeated steps', () => {
    const engine = new HeelslideEngine({ track: evenTrack });
    const seen = new Set<number>();

    for (let i = 0; i < 10; i += 1) {
      engine.stepForward(0.1);
      seen.add(engine.getCurrentSegmentIndex());
    }

    expect(seen).toEqual(new Set([0, 1, 2]));
  });

  it('clamps at full progress without exceeding it', () => {
    const engine = new HeelslideEngine({ track: evenTrack });

    engine.stepForward(5);
    expect(engine.getProgress()).toBe(1);
  });

  it('emits onProgress with the updated value', () => {
    const onProgress = vi.fn();
    const engine = new HeelslideEngine({ track: evenTrack, onProgress });

    engine.stepForward(0.3);

    expect(onProgress).toHaveBeenCalled();
    expect(onProgress.mock.calls.at(-1)?.[0]).toBeCloseTo(0.3, 5);
  });

  it('returns the resulting progress', () => {
    const engine = new HeelslideEngine({ track: evenTrack });
    expect(engine.stepForward(0.4)).toBeCloseTo(0.4, 5);
  });
});

describe('stepBackward', () => {
  it('decrements progress along the path', () => {
    const engine = new HeelslideEngine({ track: evenTrack });

    engine.stepForward(0.5);
    engine.stepBackward(0.2);

    expect(engine.getProgress()).toBeCloseTo(0.3, 5);
  });

  it('reverts the segment index when stepping back across a heel vertex', () => {
    const engine = new HeelslideEngine({ track: evenTrack });

    engine.stepForward(0.5);
    expect(engine.getCurrentSegmentIndex()).toBe(1);

    engine.stepBackward(0.3);
    expect(engine.getCurrentSegmentIndex()).toBe(0);
  });

  it('floors at zero and returns to idle', () => {
    const engine = new HeelslideEngine({ track: evenTrack });

    engine.stepForward(0.2);
    engine.stepBackward(5);

    expect(engine.getProgress()).toBe(0);
    expect(engine.getState()).toBe('idle');
  });
});

describe('stepToNextHeel', () => {
  it('advances exactly to the vertex terminating the current segment', () => {
    const engine = new HeelslideEngine({ track: evenTrack });

    engine.stepToNextHeel();

    expect(engine.getProgress()).toBeCloseTo(100 / 300, 5);
  });

  it('advances heel by heel on repeated calls', () => {
    const engine = new HeelslideEngine({ track: evenTrack });

    engine.stepToNextHeel();
    engine.stepToNextHeel();

    expect(engine.getProgress()).toBeCloseTo(200 / 300, 5);
  });

  it('reaches the end of the path from the final segment', () => {
    const engine = new HeelslideEngine({ track: evenTrack });

    engine.stepToNextHeel();
    engine.stepToNextHeel();
    engine.stepToNextHeel();

    expect(engine.getProgress()).toBe(1);
  });
});

describe('unlock parity between keyboard and pointer', () => {
  it('does not unlock from stepping alone, even at full progress', () => {
    const onUnlock = vi.fn();
    const engine = new HeelslideEngine({ track: evenTrack, onUnlock });

    engine.stepForward(5);

    expect(engine.getProgress()).toBe(1);
    expect(engine.getState()).not.toBe('unlocked');
    expect(onUnlock).not.toHaveBeenCalled();
  });

  it('unlocks on confirm once stepping reaches the final segment above threshold', () => {
    const onUnlock = vi.fn();
    const engine = new HeelslideEngine({ track: evenTrack, onUnlock });

    engine.stepForward(5);
    engine.endGesture();

    expect(engine.getState()).toBe('unlocked');
    expect(engine.getProgress()).toBe(1);
    expect(onUnlock).toHaveBeenCalledTimes(1);
  });

  it('does not unlock on confirm below the progress threshold, and discards progress as an early pointer release does', () => {
    const onUnlock = vi.fn();
    const onReset = vi.fn();
    const engine = new HeelslideEngine({ track: evenTrack, onUnlock, onReset });

    engine.stepForward(0.5);
    engine.endGesture();

    expect(engine.getState()).toBe('idle');
    expect(engine.getProgress()).toBe(0);
    expect(onUnlock).not.toHaveBeenCalled();
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('does not unlock on confirm when aggregate progress is above threshold but the final segment has not been entered', () => {
    const onUnlock = vi.fn();
    const engine = new HeelslideEngine({ track: shortTailTrack, onUnlock });

    // 200 of 205 -> 0.9756, above the 0.95 threshold, but still on segment 1 of 3.
    engine.stepForward(200 / 205);

    expect(engine.getProgress()).toBeGreaterThan(0.95);
    expect(engine.getCurrentSegmentIndex()).toBe(1);

    engine.endGesture();

    expect(engine.getState()).not.toBe('unlocked');
    expect(engine.getProgress()).toBe(0);
    expect(onUnlock).not.toHaveBeenCalled();
  });

  it('unlocks on the same track once the final segment is genuinely entered', () => {
    const onUnlock = vi.fn();
    const engine = new HeelslideEngine({ track: shortTailTrack, onUnlock });

    engine.stepForward(202 / 205);

    expect(engine.getCurrentSegmentIndex()).toBe(2);

    engine.endGesture();

    expect(engine.getState()).toBe('unlocked');
    expect(onUnlock).toHaveBeenCalledTimes(1);
  });

  it('lets a stepped user withdraw before confirming, as a pointer user can before releasing', () => {
    const onUnlock = vi.fn();
    const engine = new HeelslideEngine({ track: evenTrack, onUnlock });

    engine.stepForward(5);
    expect(engine.getProgress()).toBe(1);

    engine.stepBackward(0.5);

    expect(engine.getProgress()).toBeCloseTo(0.5, 5);
    expect(engine.getState()).not.toBe('unlocked');
    expect(onUnlock).not.toHaveBeenCalled();
  });

  it('exposes no API for jumping straight to the destination', () => {
    const engine = new HeelslideEngine({ track: evenTrack });
    const surface = new Set<string>();

    for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(engine))) {
      surface.add(key);
    }

    expect(surface.has('stepToEnd')).toBe(false);
    expect(surface.has('skipToEnd')).toBe(false);
    expect(surface.has('complete')).toBe(false);
    expect(surface.has('jumpToEnd')).toBe(false);
  });
});

describe('stepping edge cases', () => {
  const emptyTrack: TrackPath = { points: [], segments: [], totalLength: 0, heelCount: 0 };

  it('is inert on a track with no segments', () => {
    const engine = new HeelslideEngine({ track: emptyTrack });

    expect(engine.stepForward(0.5)).toBe(0);
    expect(engine.stepToNextHeel()).toBe(0);
    expect(engine.getState()).toBe('idle');
  });

  it('ignores a zero-sized step', () => {
    const engine = new HeelslideEngine({ track: evenTrack });

    engine.stepForward(0.3);
    const before = engine.getProgress();

    expect(engine.stepForward(0)).toBe(before);
    expect(engine.getProgress()).toBe(before);
  });

  it('ignores a non-finite step amount', () => {
    const engine = new HeelslideEngine({ track: evenTrack });

    engine.stepForward(0.3);
    const before = engine.getProgress();

    expect(engine.stepForward(Number.NaN)).toBe(before);
    expect(engine.stepForward(Number.POSITIVE_INFINITY)).toBe(before);
  });

  it('treats an unlocked gesture as terminal', () => {
    const engine = new HeelslideEngine({ track: evenTrack });

    engine.stepForward(5);
    engine.endGesture();
    expect(engine.getState()).toBe('unlocked');

    expect(engine.stepForward(0.5)).toBe(1);
    expect(engine.stepBackward(0.5)).toBe(1);
    expect(engine.stepToNextHeel()).toBe(1);
    expect(engine.getState()).toBe('unlocked');
  });

  it('holds at the end when no heel lies beyond the current position', () => {
    const engine = new HeelslideEngine({ track: evenTrack });

    engine.stepForward(5);
    expect(engine.getProgress()).toBe(1);

    expect(engine.stepToNextHeel()).toBe(1);
  });

  it('falls back to the configured increment when given a non-positive one', () => {
    const engine = new HeelslideEngine({ track: evenTrack, accessible: { stepIncrement: 0 } });

    engine.stepForward();
    expect(engine.getProgress()).toBeCloseTo(0.1, 5);
  });

  it('resets stepped progress through reset()', () => {
    const engine = new HeelslideEngine({ track: evenTrack });

    engine.stepForward(0.6);
    engine.reset();

    expect(engine.getProgress()).toBe(0);
    expect(engine.getState()).toBe('idle');
    expect(engine.getCurrentSegmentIndex()).toBe(0);
  });
});

describe('engine accessibility accessors', () => {
  it('delegates step and description generation for the active track', () => {
    const engine = new HeelslideEngine({ track: evenTrack });

    expect(engine.getAccessibleSteps()).toHaveLength(evenTrack.segments.length);
    expect(engine.getAccessibleDescription()).toContain('2 turns');
  });

  it('reflects a regenerated path', () => {
    const engine = new HeelslideEngine({ track: evenTrack });
    expect(engine.getAccessibleSteps()).toHaveLength(3);

    engine.regeneratePath({ bounds: { width: 300, height: 150 }, heels: 1, seed: 7 });

    expect(engine.getAccessibleSteps()).toHaveLength(engine.getPath().segments.length);
  });
});
