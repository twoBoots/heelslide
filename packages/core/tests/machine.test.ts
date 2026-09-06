import { describe, expect, it, vi } from 'vitest';
import { createGestureStateMachine } from '../src/machine.js';
import type { TrackPath } from '../src/types.js';

describe('Gesture State Machine', () => {
  // Simple L-shaped track: 1 heel at (50, 0)
  // Segment 0: (0, 0) -> (50, 0), length = 50 (horizontal)
  // Segment 1: (50, 0) -> (50, 50), length = 50 (vertical)
  // Total length = 100
  const simpleTrack: TrackPath = {
    points: [
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 50, y: 50 }
    ],
    segments: [
      { start: { x: 0, y: 0 }, end: { x: 50, y: 0 }, direction: 'horizontal', length: 50 },
      { start: { x: 50, y: 0 }, end: { x: 50, y: 50 }, direction: 'vertical', length: 50 }
    ],
    totalLength: 100,
    heelCount: 1
  };

  it('initialises in idle state with 0 progress', () => {
    const machine = createGestureStateMachine(simpleTrack, { tolerance: 15 });
    expect(machine.getState()).toBe('idle');
    expect(machine.getProgress()).toBe(0);
    expect(machine.getCurrentSegmentIndex()).toBe(0);
  });

  it('transitions from idle to active when touch starts near origin', () => {
    const onStateChange = vi.fn();
    const machine = createGestureStateMachine(simpleTrack, {
      tolerance: 15,
      onStateChange
    });

    const started = machine.start({ x: 5, y: 5 });
    expect(started).toBe(true);
    expect(machine.getState()).toBe('active');
    expect(onStateChange).toHaveBeenCalledWith('active');
  });

  it('ignores touch start when too far from origin', () => {
    const machine = createGestureStateMachine(simpleTrack, { tolerance: 15 });
    const started = machine.start({ x: 30, y: 30 });
    expect(started).toBe(false);
    expect(machine.getState()).toBe('idle');
  });

  it('tracks progress along the initial segment', () => {
    const onProgress = vi.fn();
    const machine = createGestureStateMachine(simpleTrack, {
      tolerance: 15,
      onProgress
    });
    machine.start({ x: 0, y: 0 });

    machine.update({ x: 25, y: 0 });
    // Progress along first segment of 50px = 25px / 100px total = 0.25
    expect(machine.getProgress()).toBeCloseTo(0.25);
    expect(onProgress).toHaveBeenCalledWith(0.25);
  });

  it('navigates the heel corner and advances segment index', () => {
    const machine = createGestureStateMachine(simpleTrack, { tolerance: 15 });
    machine.start({ x: 0, y: 0 });

    // Approach corner (50, 0)
    machine.update({ x: 48, y: 2 });
    expect(machine.getCurrentSegmentIndex()).toBe(0);

    // Turn corner onto segment 1 (vertical downwards: x=50, y=25)
    machine.update({ x: 50, y: 25 });
    expect(machine.getCurrentSegmentIndex()).toBe(1);
    // 50px + 25px = 75px / 100px = 0.75
    expect(machine.getProgress()).toBeCloseTo(0.75);
  });

  it('triggers reset when touch deviates beyond tolerance', () => {
    const onReset = vi.fn();
    const machine = createGestureStateMachine(simpleTrack, {
      tolerance: 15,
      onReset
    });
    machine.start({ x: 0, y: 0 });

    // Move to valid point
    machine.update({ x: 20, y: 0 });
    expect(machine.getState()).toBe('active');

    // Deviate 30px away from segment
    machine.update({ x: 20, y: 35 });
    expect(machine.getState()).toBe('idle');
    expect(machine.getProgress()).toBe(0);
    expect(onReset).toHaveBeenCalled();
  });

  it('triggers reset when touch is released early before the end', () => {
    const onReset = vi.fn();
    const machine = createGestureStateMachine(simpleTrack, {
      tolerance: 15,
      onReset
    });
    machine.start({ x: 0, y: 0 });
    machine.update({ x: 25, y: 0 });

    machine.end();
    expect(machine.getState()).toBe('idle');
    expect(machine.getProgress()).toBe(0);
    expect(onReset).toHaveBeenCalled();
  });

  it('triggers onUnlock when touch reaches the destination and ends', () => {
    const onUnlock = vi.fn();
    const machine = createGestureStateMachine(simpleTrack, {
      tolerance: 15,
      onUnlock
    });
    machine.start({ x: 0, y: 0 });

    // Slide to heel
    machine.update({ x: 50, y: 0 });
    // Slide down to final endpoint (50, 50)
    machine.update({ x: 50, y: 50 });

    expect(machine.getProgress()).toBeCloseTo(1.0);

    machine.end();
    expect(machine.getState()).toBe('unlocked');
    expect(onUnlock).toHaveBeenCalled();
  });

  it('cancels active gesture and returns to idle', () => {
    const onReset = vi.fn();
    const machine = createGestureStateMachine(simpleTrack, {
      tolerance: 15,
      onReset
    });
    machine.start({ x: 0, y: 0 });
    machine.update({ x: 20, y: 0 });

    machine.cancel();
    expect(machine.getState()).toBe('idle');
    expect(machine.getProgress()).toBe(0);
    expect(onReset).toHaveBeenCalled();
  });

  it('handles empty tracks gracefully', () => {
    const emptyTrack: TrackPath = {
      points: [],
      segments: [],
      totalLength: 0,
      heelCount: 0
    };
    const machine = createGestureStateMachine(emptyTrack);
    expect(machine.start({ x: 0, y: 0 })).toBe(false);
  });

  it('navigates tracks with leftward and upward heel directions', () => {
    // S-curve track:
    // (0, 50) -> (50, 50) [right]
    // (50, 50) -> (50, 10) [up]
    // (50, 10) -> (10, 10) [left]
    const multiTrack: TrackPath = {
      points: [
        { x: 0, y: 50 },
        { x: 50, y: 50 },
        { x: 50, y: 10 },
        { x: 10, y: 10 }
      ],
      segments: [
        { start: { x: 0, y: 50 }, end: { x: 50, y: 50 }, direction: 'horizontal', length: 50 },
        { start: { x: 50, y: 50 }, end: { x: 50, y: 10 }, direction: 'vertical', length: 40 },
        { start: { x: 50, y: 10 }, end: { x: 10, y: 10 }, direction: 'horizontal', length: 40 }
      ],
      totalLength: 130,
      heelCount: 2
    };

    const machine = createGestureStateMachine(multiTrack, { tolerance: 15 });
    machine.start({ x: 0, y: 50 });

    // Segment 0 -> 1 (moving up from y=50 to y=10)
    machine.update({ x: 50, y: 50 });
    machine.update({ x: 50, y: 30 });
    expect(machine.getCurrentSegmentIndex()).toBe(1);

    // Segment 1 -> 2 (moving left from x=50 to x=10)
    machine.update({ x: 50, y: 10 });
    machine.update({ x: 30, y: 10 });
    expect(machine.getCurrentSegmentIndex()).toBe(2);

    // Reach end at (10, 10)
    machine.update({ x: 10, y: 10 });
    expect(machine.getProgress()).toBeCloseTo(1.0);
  });

  describe('onTurn callback and feedback integration', () => {
    it('invokes onTurn with the navigated heel index when advancing segments', () => {
      const onTurn = vi.fn();
      const machine = createGestureStateMachine(simpleTrack, {
        tolerance: 15,
        onTurn
      });

      machine.start({ x: 0, y: 0 });
      // Turn corner onto segment 1
      machine.update({ x: 50, y: 25 });

      expect(onTurn).toHaveBeenCalledTimes(1);
      expect(onTurn).toHaveBeenCalledWith(0);
    });

    it('triggers feedbackController turn, reset, and unlock events', () => {
      const mockFeedback = {
        triggerTurn: vi.fn(),
        triggerReset: vi.fn(),
        triggerUnlock: vi.fn()
      };

      const machine = createGestureStateMachine(simpleTrack, {
        tolerance: 15,
        feedback: mockFeedback as any
      });

      machine.start({ x: 0, y: 0 });
      // 1. Turn
      machine.update({ x: 50, y: 25 });
      expect(mockFeedback.triggerTurn).toHaveBeenCalledTimes(1);

      // 2. Unlock
      machine.update({ x: 50, y: 50 });
      machine.end();
      expect(mockFeedback.triggerUnlock).toHaveBeenCalledTimes(1);
    });

    it('triggers feedbackController reset on deviation or premature end', () => {
      const mockFeedback = {
        triggerTurn: vi.fn(),
        triggerReset: vi.fn(),
        triggerUnlock: vi.fn()
      };

      const machine = createGestureStateMachine(simpleTrack, {
        tolerance: 15,
        feedback: mockFeedback as any
      });

      machine.start({ x: 0, y: 0 });
      machine.update({ x: 20, y: 40 }); // deviate

      expect(mockFeedback.triggerReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('Segmented Multi-Gesture Mode', () => {
    // 2-heel track:
    // Seg 0: (0,0) -> (50,0), len 50
    // Seg 1: (50,0) -> (50,50), len 50
    // Seg 2: (50,50) -> (100,50), len 50
    // Total len: 150
    const twoHeelTrack: TrackPath = {
      points: [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 50, y: 50 },
        { x: 100, y: 50 }
      ],
      segments: [
        { start: { x: 0, y: 0 }, end: { x: 50, y: 0 }, direction: 'horizontal', length: 50 },
        { start: { x: 50, y: 0 }, end: { x: 50, y: 50 }, direction: 'vertical', length: 50 },
        { start: { x: 50, y: 50 }, end: { x: 100, y: 50 }, direction: 'horizontal', length: 50 }
      ],
      totalLength: 150,
      heelCount: 2
    };

    it('clamps movement at the heel vertex and blocks auto-advancement onto next segment in single stroke', () => {
      const onTurn = vi.fn();
      const machine = createGestureStateMachine(twoHeelTrack, {
        tolerance: 15,
        segmented: true,
        onTurn
      });

      machine.start({ x: 0, y: 0 });
      // Drag along first segment up to heel at (50, 0)
      machine.update({ x: 50, y: 0 });
      expect(machine.getProgress()).toBeCloseTo(50 / 150);

      // Attempt to drag onto second segment without lifting finger
      machine.update({ x: 50, y: 30 });
      // In segmented mode, progress remains clamped at heel 0 and current segment does not advance
      expect(machine.getCurrentSegmentIndex()).toBe(0);
      expect(machine.getProgress()).toBeCloseTo(50 / 150);
      expect(machine.getState()).toBe('active');
    });

    it('transitions to checkpoint state and triggers onCheckpoint when gesture is released at a heel', () => {
      const onCheckpoint = vi.fn();
      const onStateChange = vi.fn();
      const machine = createGestureStateMachine(twoHeelTrack, {
        tolerance: 15,
        segmented: true,
        onCheckpoint,
        onStateChange
      });

      machine.start({ x: 0, y: 0 });
      machine.update({ x: 50, y: 0 });
      machine.end();

      expect(machine.getState()).toBe('checkpoint');
      expect(machine.getProgress()).toBeCloseTo(50 / 150);
      expect(onCheckpoint).toHaveBeenCalledWith(0, expect.closeTo(50 / 150));
      expect(onStateChange).toHaveBeenCalledWith('checkpoint');
    });

    it('allows resuming gesture from checkpoint handle and unlocking at the destination', () => {
      const onUnlock = vi.fn();
      const machine = createGestureStateMachine(twoHeelTrack, {
        tolerance: 15,
        segmented: true,
        onUnlock
      });

      // Segment 0 -> Heel 0
      machine.start({ x: 0, y: 0 });
      machine.update({ x: 50, y: 0 });
      machine.end();
      expect(machine.getState()).toBe('checkpoint');

      // Attempt start far from heel checkpoint -> rejected
      const rejectedStart = machine.start({ x: 0, y: 0 });
      expect(rejectedStart).toBe(false);
      expect(machine.getState()).toBe('checkpoint');

      // Resume at heel checkpoint (50, 0)
      const resumed1 = machine.start({ x: 50, y: 0 });
      expect(resumed1).toBe(true);
      expect(machine.getState()).toBe('active');
      expect(machine.getCurrentSegmentIndex()).toBe(1);

      // Segment 1 -> Heel 1 (50, 50)
      machine.update({ x: 50, y: 50 });
      machine.end();
      expect(machine.getState()).toBe('checkpoint');
      expect(machine.getProgress()).toBeCloseTo(100 / 150);

      // Resume at heel 1 checkpoint (50, 50)
      const resumed2 = machine.start({ x: 50, y: 50 });
      expect(resumed2).toBe(true);
      expect(machine.getCurrentSegmentIndex()).toBe(2);

      // Segment 2 -> Destination (100, 50)
      machine.update({ x: 100, y: 50 });
      machine.end();

      expect(machine.getState()).toBe('unlocked');
      expect(machine.getProgress()).toBe(1.0);
      expect(onUnlock).toHaveBeenCalledTimes(1);
    });

    it('snaps back to last reached checkpoint on mid-segment premature release', () => {
      const mockFeedback = {
        triggerTurn: vi.fn(),
        triggerReset: vi.fn(),
        triggerUnlock: vi.fn()
      };

      const machine = createGestureStateMachine(twoHeelTrack, {
        tolerance: 15,
        segmented: true,
        feedback: mockFeedback as any
      });

      // Reach heel 0 and release
      machine.start({ x: 0, y: 0 });
      machine.update({ x: 50, y: 0 });
      machine.end();
      expect(machine.getState()).toBe('checkpoint');
      const checkpoint0Progress = machine.getProgress();

      // Resume on segment 1, move halfway, and release prematurely
      machine.start({ x: 50, y: 0 });
      machine.update({ x: 50, y: 25 });
      expect(machine.getProgress()).toBeGreaterThan(checkpoint0Progress);

      machine.end();
      // Snaps back to checkpoint 0
      expect(machine.getState()).toBe('checkpoint');
      expect(machine.getProgress()).toBeCloseTo(checkpoint0Progress);
      expect(mockFeedback.triggerReset).toHaveBeenCalledTimes(1);
    });

    it('resets to idle at origin if premature release happens before first heel', () => {
      const onReset = vi.fn();
      const machine = createGestureStateMachine(twoHeelTrack, {
        tolerance: 15,
        segmented: true,
        onReset
      });

      machine.start({ x: 0, y: 0 });
      machine.update({ x: 25, y: 0 });
      machine.end();

      expect(machine.getState()).toBe('idle');
      expect(machine.getProgress()).toBe(0);
      expect(onReset).toHaveBeenCalledTimes(1);
    });
  });
});

