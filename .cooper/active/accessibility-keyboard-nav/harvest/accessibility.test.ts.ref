import { describe, it, expect, vi } from 'vitest';
import { HeelslideEngine } from '../src/engine.js';
import { getAccessibleSteps, getAccessibleDescription } from '../src/accessibility.js';
import type { TrackPath } from '../src/types.js';

describe('Accessibility & Stepping API (@heelslide/core)', () => {
  const mockTrack: TrackPath = {
    points: [
      { x: 10, y: 10 },
      { x: 110, y: 10 },
      { x: 110, y: 110 },
      { x: 210, y: 110 }
    ],
    segments: [
      {
        start: { x: 10, y: 10 },
        end: { x: 110, y: 10 },
        direction: 'horizontal',
        length: 100
      },
      {
        start: { x: 110, y: 10 },
        end: { x: 110, y: 110 },
        direction: 'vertical',
        length: 100
      },
      {
        start: { x: 110, y: 110 },
        end: { x: 210, y: 110 },
        direction: 'horizontal',
        length: 100
      }
    ],
    totalLength: 300,
    heelCount: 2
  };

  describe('getAccessibleSteps', () => {
    it('generates structured step instructions for each rectilinear segment', () => {
      const steps = getAccessibleSteps(mockTrack);
      expect(steps).toHaveLength(3);

      expect(steps[0]).toEqual({
        segmentIndex: 0,
        direction: 'horizontal',
        startPoint: { x: 10, y: 10 },
        endPoint: { x: 110, y: 10 },
        instruction: 'Step 1 of 3: Move right to first heel',
        progressAtEnd: 100 / 300
      });

      expect(steps[1]).toEqual({
        segmentIndex: 1,
        direction: 'vertical',
        startPoint: { x: 110, y: 10 },
        endPoint: { x: 110, y: 110 },
        instruction: 'Step 2 of 3: Move down to next heel',
        progressAtEnd: 200 / 300
      });

      expect(steps[2]).toEqual({
        segmentIndex: 2,
        direction: 'horizontal',
        startPoint: { x: 110, y: 110 },
        endPoint: { x: 210, y: 110 },
        instruction: 'Step 3 of 3: Move right to unlock',
        progressAtEnd: 1
      });
    });

    it('handles single-segment paths (0 heels)', () => {
      const singleSegTrack: TrackPath = {
        points: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
        segments: [{ start: { x: 0, y: 0 }, end: { x: 100, y: 0 }, direction: 'horizontal', length: 100 }],
        totalLength: 100,
        heelCount: 0
      };
      const steps = getAccessibleSteps(singleSegTrack);
      expect(steps).toHaveLength(1);
      expect(steps[0]?.instruction).toBe('Step 1 of 1: Move right to unlock');
    });
  });

  describe('getAccessibleDescription', () => {
    it('summarizes path turns and directions into human-readable text', () => {
      const desc = getAccessibleDescription(mockTrack);
      expect(desc).toBe('Security gate with 2 turns: move right, then down, then right to unlock');
    });

    it('summarizes 1-turn paths correctly', () => {
      const oneTurnTrack: TrackPath = {
        points: [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 50, y: 50 }],
        segments: [
          { start: { x: 0, y: 0 }, end: { x: 50, y: 0 }, direction: 'horizontal', length: 50 },
          { start: { x: 50, y: 0 }, end: { x: 50, y: 50 }, direction: 'vertical', length: 50 }
        ],
        totalLength: 100,
        heelCount: 1
      };
      const desc = getAccessibleDescription(oneTurnTrack);
      expect(desc).toBe('Security gate with 1 turn: move right, then down to unlock');
    });
  });

  describe('Engine Discrete Stepping Methods', () => {
    it('provides getAccessibleSteps() and getAccessibleDescription() from engine', () => {
      const engine = new HeelslideEngine({ track: mockTrack });
      expect(engine.getAccessibleSteps()).toHaveLength(3);
      expect(engine.getAccessibleDescription()).toBe(
        'Security gate with 2 turns: move right, then down, then right to unlock'
      );
    });

    it('steps forward incrementally and transitions to active', () => {
      const onProgress = vi.fn();
      const onStateChange = vi.fn();
      const engine = new HeelslideEngine({ track: mockTrack, onProgress, onStateChange });

      expect(engine.getState()).toBe('idle');
      expect(engine.getProgress()).toBe(0);

      const p1 = engine.stepForward(0.1);
      expect(p1).toBeCloseTo(0.1);
      expect(engine.getState()).toBe('active');
      expect(engine.getProgress()).toBeCloseTo(0.1);
      expect(onStateChange).toHaveBeenCalledWith('active');
      expect(onProgress).toHaveBeenCalledWith(expect.closeTo(0.1));

      // Step forward again
      const p2 = engine.stepForward(0.25);
      expect(p2).toBeCloseTo(0.35);
      // Beyond first segment (length 100 / 300 = 0.333...)
      expect(engine.getCurrentSegmentIndex()).toBe(1);
    });

    it('steps backward incrementally and decrements segment index', () => {
      const engine = new HeelslideEngine({ track: mockTrack });
      engine.stepForward(0.5);
      expect(engine.getCurrentSegmentIndex()).toBe(1);

      engine.stepBackward(0.3);
      expect(engine.getProgress()).toBeCloseTo(0.2);
      expect(engine.getCurrentSegmentIndex()).toBe(0);

      // Cannot step backward below 0
      engine.stepBackward(0.5);
      expect(engine.getProgress()).toBe(0);
    });

    it('steps to next heel vertex directly', () => {
      const engine = new HeelslideEngine({ track: mockTrack });
      expect(engine.getCurrentSegmentIndex()).toBe(0);

      const p1 = engine.stepToNextHeel();
      expect(p1).toBeCloseTo(100 / 300);
      expect(engine.getCurrentSegmentIndex()).toBe(1);

      const p2 = engine.stepToNextHeel();
      expect(p2).toBeCloseTo(200 / 300);
      expect(engine.getCurrentSegmentIndex()).toBe(2);

      // Stepping on the final segment unlocks
      const onUnlock = vi.fn();
      const engine2 = new HeelslideEngine({ track: mockTrack, onUnlock });
      engine2.stepToNextHeel(); // heel 1
      engine2.stepToNextHeel(); // heel 2
      engine2.stepToNextHeel(); // destination
      expect(engine2.getProgress()).toBe(1.0);
      expect(engine2.getState()).toBe('unlocked');
      expect(onUnlock).toHaveBeenCalledTimes(1);
    });

    it('unlocks when stepping forward reaches >= 0.95', () => {
      const onUnlock = vi.fn();
      const engine = new HeelslideEngine({ track: mockTrack, onUnlock });

      engine.stepForward(0.9);
      expect(engine.getState()).toBe('active');
      expect(onUnlock).not.toHaveBeenCalled();

      engine.stepForward(0.06);
      expect(engine.getProgress()).toBe(1.0);
      expect(engine.getState()).toBe('unlocked');
      expect(onUnlock).toHaveBeenCalledTimes(1);
    });
  });
});
