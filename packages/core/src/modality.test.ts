import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HeelslideEngine } from './engine.js';
import type { TrackPath } from './types.js';

/**
 * Input modality and WCAG 2.2 SC 2.2.1 (Timing Adjustable).
 *
 * The checkpoint inactivity timer is correct under pointer control — an abandoned half-traced
 * gesture should not hold a checkpoint open. Under keyboard control it is a conformance failure:
 * a screen-reader user pausing at a checkpoint to hear the announcement would lose progress,
 * which is precisely the behaviour the announcement exists to produce.
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

const TIMEOUT = 5000;

describe('input modality tracking', () => {
  it('defaults to pointer before any interaction', () => {
    const engine = new HeelslideEngine({ track });
    expect(engine.getInputModality()).toBe('pointer');
  });

  it('reports keyboard after stepping forward', () => {
    const engine = new HeelslideEngine({ track });
    engine.stepForward(0.2);
    expect(engine.getInputModality()).toBe('keyboard');
  });

  it('reports keyboard after stepping backward', () => {
    const engine = new HeelslideEngine({ track });
    engine.stepForward(0.4);
    engine.stepBackward(0.1);
    expect(engine.getInputModality()).toBe('keyboard');
  });

  it('reports keyboard after stepping to the next heel', () => {
    const engine = new HeelslideEngine({ track });
    engine.stepToNextHeel();
    expect(engine.getInputModality()).toBe('keyboard');
  });

  it('returns to pointer when a pointer gesture starts', () => {
    const engine = new HeelslideEngine({ track });

    engine.stepForward(0.2);
    expect(engine.getInputModality()).toBe('keyboard');

    engine.startGesture({ x: 10, y: 10 });
    expect(engine.getInputModality()).toBe('pointer');
  });

  it('returns to pointer when a pointer gesture updates', () => {
    const engine = new HeelslideEngine({ track });

    engine.startGesture({ x: 10, y: 10 });
    engine.stepForward(0.2);
    expect(engine.getInputModality()).toBe('keyboard');

    engine.updateGesture({ x: 40, y: 10 });
    expect(engine.getInputModality()).toBe('pointer');
  });

  it('returns to pointer on reset', () => {
    const engine = new HeelslideEngine({ track });

    engine.stepForward(0.3);
    engine.reset();

    expect(engine.getInputModality()).toBe('pointer');
  });
});

describe('checkpoint inactivity suspension under keyboard control (WCAG 2.2.1)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not reset a keyboard user who pauses at a checkpoint', () => {
    const onReset = vi.fn();
    const engine = new HeelslideEngine({
      track,
      segmented: true,
      checkpointTimeoutMs: TIMEOUT,
      onReset
    });

    engine.stepToNextHeel();
    const atCheckpoint = engine.getProgress();
    expect(atCheckpoint).toBeGreaterThan(0);

    vi.advanceTimersByTime(TIMEOUT * 10);

    expect(engine.getProgress()).toBe(atCheckpoint);
    expect(onReset).not.toHaveBeenCalled();
  });

  it('clears an already-armed pointer timer when the user switches to keyboard', () => {
    const onReset = vi.fn();
    const engine = new HeelslideEngine({
      track,
      segmented: true,
      checkpointTimeoutMs: TIMEOUT,
      onReset
    });

    // Reach a checkpoint by pointer, arming the timer.
    engine.startGesture({ x: 10, y: 10 });
    engine.updateGesture({ x: 110, y: 10 });
    engine.endGesture();
    expect(engine.getState()).toBe('checkpoint');

    // Switching to keyboard must disarm it rather than let it fire mid-step.
    engine.stepForward(0.05);
    const afterStep = engine.getProgress();

    vi.advanceTimersByTime(TIMEOUT * 10);

    expect(engine.getProgress()).toBe(afterStep);
    expect(onReset).not.toHaveBeenCalled();
  });

  it('still resets a pointer user who abandons a checkpoint', () => {
    const onReset = vi.fn();
    const engine = new HeelslideEngine({
      track,
      segmented: true,
      checkpointTimeoutMs: TIMEOUT,
      onReset
    });

    engine.startGesture({ x: 10, y: 10 });
    engine.updateGesture({ x: 110, y: 10 });
    engine.endGesture();
    expect(engine.getState()).toBe('checkpoint');

    vi.advanceTimersByTime(TIMEOUT + 1);

    expect(onReset).toHaveBeenCalled();
    expect(engine.getProgress()).toBe(0);
  });

  it('re-arms for a later pointer checkpoint after a keyboard excursion', () => {
    const onReset = vi.fn();
    const engine = new HeelslideEngine({
      track,
      segmented: true,
      checkpointTimeoutMs: TIMEOUT,
      onReset
    });

    // Keyboard first: no timer.
    engine.stepForward(0.05);
    vi.advanceTimersByTime(TIMEOUT * 2);
    expect(onReset).not.toHaveBeenCalled();

    // Hand back to pointer and reach a checkpoint: the timer applies again.
    engine.startGesture({ x: 10, y: 10 });
    engine.updateGesture({ x: 110, y: 10 });
    engine.endGesture();
    expect(engine.getState()).toBe('checkpoint');

    vi.advanceTimersByTime(TIMEOUT + 1);

    expect(onReset).toHaveBeenCalled();
  });

  it('leaves no timer armed after destroy under either modality', () => {
    const onReset = vi.fn();
    const engine = new HeelslideEngine({
      track,
      segmented: true,
      checkpointTimeoutMs: TIMEOUT,
      onReset
    });

    engine.startGesture({ x: 10, y: 10 });
    engine.updateGesture({ x: 110, y: 10 });
    engine.endGesture();

    engine.destroy();
    vi.advanceTimersByTime(TIMEOUT * 10);

    expect(onReset).not.toHaveBeenCalled();
  });
});
