import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HeelslideEngine } from '../src/engine.js';
import type { TrackPath } from '../src/types.js';

/**
 * Pointer behaviour must be unchanged by the accessibility work.
 *
 * The wider suite already exercises pointer gestures, but it predates this track and so proves
 * only that nothing broke. These specs state the invariant deliberately, so a future change to
 * the stepping path that leaks into pointer traversal fails here with an explanation rather than
 * somewhere incidental.
 */

const track: TrackPath = {
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

/** Traces the full path by pointer, vertex by vertex. */
function tracePath(engine: HeelslideEngine): void {
  engine.startGesture({ x: 10, y: 10 });
  engine.updateGesture({ x: 60, y: 10 });
  engine.updateGesture({ x: 110, y: 10 });
  engine.updateGesture({ x: 110, y: 60 });
  engine.updateGesture({ x: 110, y: 110 });
  engine.updateGesture({ x: 160, y: 110 });
  engine.updateGesture({ x: 210, y: 110 });
}

describe('pointer gesture invariance', () => {
  it('engages only within tolerance of the origin', () => {
    const engine = new HeelslideEngine({ track, tolerance: 24 });

    expect(engine.startGesture({ x: 500, y: 500 })).toBe(false);
    expect(engine.getState()).toBe('idle');

    expect(engine.startGesture({ x: 10, y: 10 })).toBe(true);
    expect(engine.getState()).toBe('active');
  });

  it('resets when the pointer strays beyond tolerance', () => {
    const onReset = vi.fn();
    const engine = new HeelslideEngine({ track, tolerance: 24, onReset });

    engine.startGesture({ x: 10, y: 10 });
    engine.updateGesture({ x: 60, y: 10 });
    engine.updateGesture({ x: 60, y: 400 });

    expect(onReset).toHaveBeenCalled();
    expect(engine.getState()).toBe('idle');
    expect(engine.getProgress()).toBe(0);
  });

  it('unlocks on release after tracing the full path', () => {
    const onUnlock = vi.fn();
    const engine = new HeelslideEngine({ track, onUnlock });

    tracePath(engine);
    engine.endGesture();

    expect(engine.getState()).toBe('unlocked');
    expect(onUnlock).toHaveBeenCalledTimes(1);
  });

  it('fires onTurn while negotiating heels by pointer', () => {
    const onTurn = vi.fn();
    const engine = new HeelslideEngine({ track, onTurn });

    tracePath(engine);

    expect(onTurn).toHaveBeenCalled();
  });

  it('reports pointer modality throughout a pointer-only gesture', () => {
    const engine = new HeelslideEngine({ track });

    tracePath(engine);

    expect(engine.getInputModality()).toBe('pointer');
  });

  it('does not announce when no onAnnouncement consumer is attached', () => {
    const engine = new HeelslideEngine({ track });

    expect(() => {
      tracePath(engine);
      engine.endGesture();
    }).not.toThrow();
  });
});

describe('segmented pointer invariance', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('checkpoints on release at a heel', () => {
    const onCheckpoint = vi.fn();
    const engine = new HeelslideEngine({ track, segmented: true, onCheckpoint });

    engine.startGesture({ x: 10, y: 10 });
    engine.updateGesture({ x: 110, y: 10 });
    engine.endGesture();

    expect(engine.getState()).toBe('checkpoint');
    expect(onCheckpoint).toHaveBeenCalled();
  });

  it('snaps back to the last checkpoint when the pointer strays mid-segment', () => {
    const engine = new HeelslideEngine({ track, segmented: true, tolerance: 24 });

    engine.startGesture({ x: 10, y: 10 });
    engine.updateGesture({ x: 110, y: 10 });
    engine.endGesture();
    const checkpointProgress = engine.getProgress();

    engine.startGesture({ x: 110, y: 10 });
    engine.updateGesture({ x: 400, y: 400 });

    expect(engine.getState()).toBe('checkpoint');
    expect(engine.getProgress()).toBeCloseTo(checkpointProgress, 5);
  });

  it('still arms the inactivity timer for a pointer checkpoint', () => {
    const onReset = vi.fn();
    const engine = new HeelslideEngine({
      track,
      segmented: true,
      checkpointTimeoutMs: 4000,
      onReset
    });

    engine.startGesture({ x: 10, y: 10 });
    engine.updateGesture({ x: 110, y: 10 });
    engine.endGesture();

    vi.advanceTimersByTime(4001);

    expect(onReset).toHaveBeenCalled();
  });

  it('leaves the timer unarmed when no timeout is configured', () => {
    const onReset = vi.fn();
    const engine = new HeelslideEngine({ track, segmented: true, onReset });

    engine.startGesture({ x: 10, y: 10 });
    engine.updateGesture({ x: 110, y: 10 });
    engine.endGesture();

    vi.advanceTimersByTime(60_000);

    expect(onReset).not.toHaveBeenCalled();
  });
});
