import { describe, it, expect, vi } from 'vitest';
import { HeelslideEngine } from '../src/engine.js';
import type { AccessibleAnnouncement, TrackPath } from '../src/types.js';

/**
 * Stepping must honour segmented-mode checkpoint semantics identically to pointer traversal:
 * a crossed heel is confirmed, and a confirmed checkpoint cannot be rewound past by either
 * modality.
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

describe('stepping across a heel in segmented mode', () => {
  it('enters checkpoint state rather than staying active', () => {
    const engine = new HeelslideEngine({ track, segmented: true });

    engine.stepForward(0.2);
    expect(engine.getState()).toBe('active');

    engine.stepForward(0.3);
    expect(engine.getState()).toBe('checkpoint');
  });

  it('fires onCheckpoint with the heel index and progress', () => {
    const onCheckpoint = vi.fn();
    const engine = new HeelslideEngine({ track, segmented: true, onCheckpoint });

    engine.stepToNextHeel();

    expect(onCheckpoint).toHaveBeenCalledTimes(1);
    expect(onCheckpoint.mock.calls[0]?.[0]).toBe(0);
    expect(onCheckpoint.mock.calls[0]?.[1]).toBeCloseTo(100 / 300, 5);
  });

  it('announces a checkpoint rather than a plain heel arrival', () => {
    const announcements: AccessibleAnnouncement[] = [];
    const engine = new HeelslideEngine({
      track,
      segmented: true,
      onAnnouncement: (a) => announcements.push(a)
    });

    engine.stepToNextHeel();

    const types = announcements.map((a) => a.type);
    expect(types).toContain('checkpoint');
    expect(types).not.toContain('heel_reached');
  });

  it('resumes to active on the next step after a checkpoint', () => {
    const engine = new HeelslideEngine({ track, segmented: true });

    engine.stepToNextHeel();
    expect(engine.getState()).toBe('checkpoint');

    engine.stepForward(0.1);
    expect(engine.getState()).toBe('active');
  });

  it('announces a plain heel arrival in non-segmented mode', () => {
    const announcements: AccessibleAnnouncement[] = [];
    const engine = new HeelslideEngine({
      track,
      onAnnouncement: (a) => announcements.push(a)
    });

    engine.stepToNextHeel();

    const types = announcements.map((a) => a.type);
    expect(types).toContain('heel_reached');
    expect(types).not.toContain('checkpoint');
  });
});

describe('backward stepping against a confirmed checkpoint', () => {
  it('floors at the confirmed checkpoint rather than the start', () => {
    const engine = new HeelslideEngine({ track, segmented: true });

    engine.stepToNextHeel();
    const atCheckpoint = engine.getProgress();

    engine.stepBackward(5);

    expect(engine.getProgress()).toBeCloseTo(atCheckpoint, 5);
    expect(engine.getCurrentSegmentIndex()).toBe(1);
  });

  it('permits retreat within the current segment above the checkpoint', () => {
    const engine = new HeelslideEngine({ track, segmented: true });

    engine.stepToNextHeel();
    engine.stepForward(0.2);
    const advanced = engine.getProgress();

    engine.stepBackward(0.1);

    expect(engine.getProgress()).toBeLessThan(advanced);
    expect(engine.getProgress()).toBeGreaterThan(100 / 300 - 1e-9);
  });

  it('holds the floor across two confirmed checkpoints', () => {
    const engine = new HeelslideEngine({ track, segmented: true });

    engine.stepToNextHeel();
    engine.stepToNextHeel();
    const second = engine.getProgress();
    expect(second).toBeCloseTo(200 / 300, 5);

    engine.stepBackward(5);

    expect(engine.getProgress()).toBeCloseTo(second, 5);
    expect(engine.getCurrentSegmentIndex()).toBe(2);
  });

  it('still floors at zero in non-segmented mode', () => {
    const engine = new HeelslideEngine({ track });

    engine.stepToNextHeel();
    engine.stepBackward(5);

    expect(engine.getProgress()).toBe(0);
    expect(engine.getState()).toBe('idle');
  });
});

describe('heel feedback parity for stepping', () => {
  it('fires onTurn when stepping crosses a heel, as pointer traversal does', () => {
    const onTurn = vi.fn();
    const engine = new HeelslideEngine({ track, onTurn });

    engine.stepToNextHeel();

    expect(onTurn).toHaveBeenCalledTimes(1);
    expect(onTurn.mock.calls[0]?.[0]).toBe(0);
  });

  it('triggers turn feedback when stepping crosses a heel', () => {
    const engine = new HeelslideEngine({ track });
    const spy = vi.spyOn(engine.getFeedbackController(), 'triggerTurn');

    engine.stepToNextHeel();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('does not fire onTurn for a step that stays within a segment', () => {
    const onTurn = vi.fn();
    const engine = new HeelslideEngine({ track, onTurn });

    engine.stepForward(0.1);
    engine.stepForward(0.1);

    expect(onTurn).not.toHaveBeenCalled();
  });

  it('fires onTurn once per heel when a single step spans two of them', () => {
    const onTurn = vi.fn();
    const engine = new HeelslideEngine({ track, onTurn });

    // One step from the start past both heels onto the final segment.
    engine.stepForward(0.8);

    expect(onTurn).toHaveBeenCalledTimes(2);
    expect(onTurn.mock.calls.map((c) => c[0])).toEqual([0, 1]);
  });

  it('does not fire onTurn when stepping backward across a heel', () => {
    const onTurn = vi.fn();
    const engine = new HeelslideEngine({ track, onTurn });

    engine.stepForward(0.5);
    onTurn.mockClear();

    engine.stepBackward(0.3);

    expect(onTurn).not.toHaveBeenCalled();
  });
});
