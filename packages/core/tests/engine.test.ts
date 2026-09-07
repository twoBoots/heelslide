import { describe, expect, it, vi } from 'vitest';
import {
  HeelslideEngine,
  createGestureStateMachine,
  euclideanDistance,
  generateTrackPath
} from '../src/index.js';

describe('HeelslideEngine Orchestrator & Public API', () => {
  it('exports all core public utilities and classes from index.ts', () => {
    expect(typeof HeelslideEngine).toBe('function');
    expect(typeof createGestureStateMachine).toBe('function');
    expect(typeof generateTrackPath).toBe('function');
    expect(typeof euclideanDistance).toBe('function');
  });

  it('instantiates engine and generates procedural path from options', () => {
    const engine = new HeelslideEngine({
      generator: {
        bounds: { width: 320, height: 160 },
        gridStep: 32,
        margin: 16,
        heels: 2,
        seed: 42
      }
    });

    const path = engine.getPath();
    expect(path.heelCount).toBe(2);
    expect(path.segments.length).toBe(3);
    expect(engine.getState()).toBe('idle');
    expect(engine.getProgress()).toBe(0);
  });

  it('executes full unlock lifecycle end-to-end', () => {
    const onUnlock = vi.fn();
    const onProgress = vi.fn();
    const onStateChange = vi.fn();

    const engine = new HeelslideEngine({
      tolerance: 20,
      onUnlock,
      onProgress,
      onStateChange,
      generator: {
        bounds: { width: 320, height: 160 },
        gridStep: 32,
        margin: 16,
        heels: 1,
        seed: 100
      }
    });

    const path = engine.getPath();
    const startPoint = path.points[0]!;
    const heelPoint = path.points[1]!;
    const endPoint = path.points[2]!;

    // 1. Touch start
    const started = engine.startGesture(startPoint);
    expect(started).toBe(true);
    expect(engine.getState()).toBe('active');
    expect(onStateChange).toHaveBeenCalledWith('active');

    // 2. Move towards heel
    engine.updateGesture(heelPoint);

    // 3. Move to endpoint
    engine.updateGesture(endPoint);
    expect(engine.getProgress()).toBeCloseTo(1.0);

    // 4. Release
    engine.endGesture();
    expect(engine.getState()).toBe('unlocked');
    expect(onUnlock).toHaveBeenCalled();
  });

  it('triggers onReset when touch is released before completing the track', () => {
    const onReset = vi.fn();
    const engine = new HeelslideEngine({
      tolerance: 20,
      onReset,
      generator: {
        bounds: { width: 320, height: 160 },
        heels: 2
      }
    });

    const startPoint = engine.getPath().points[0]!;
    engine.startGesture(startPoint);
    engine.endGesture(); // released immediately

    expect(engine.getState()).toBe('idle');
    expect(engine.getProgress()).toBe(0);
    expect(onReset).toHaveBeenCalled();
  });

  it('allows regenerating the track with new configuration', () => {
    const engine = new HeelslideEngine({
      generator: {
        bounds: { width: 320, height: 160 },
        gridStep: 32,
        heels: 1
      }
    });

    expect(engine.getPath().heelCount).toBe(1);

    const newPath = engine.regeneratePath({ heels: 3 });
    expect(newPath.heelCount).toBe(3);
    expect(engine.getPath().heelCount).toBe(3);
    expect(engine.getState()).toBe('idle');
    expect(engine.getProgress()).toBe(0);
  });

  it('cancels an active gesture explicitly', () => {
    const onReset = vi.fn();
    const engine = new HeelslideEngine({
      onReset,
      generator: {
        bounds: { width: 320, height: 160 }
      }
    });

    const startPoint = engine.getPath().points[0]!;
    engine.startGesture(startPoint);
    expect(engine.getState()).toBe('active');

    engine.cancelGesture();
    expect(engine.getState()).toBe('idle');
    expect(onReset).toHaveBeenCalled();
  });

  it('accepts an explicit custom TrackPath and exposes getCurrentSegmentIndex and reset', () => {
    const customTrack = generateTrackPath({
      bounds: { width: 200, height: 200 },
      heels: 1
    });

    const engine = new HeelslideEngine({ track: customTrack });
    expect(engine.getPath()).toBe(customTrack);
    expect(engine.getCurrentSegmentIndex()).toBe(0);

    const startPoint = customTrack.points[0]!;
    engine.startGesture(startPoint);
    expect(engine.getState()).toBe('active');

    engine.reset();
    expect(engine.getState()).toBe('idle');
    expect(engine.getProgress()).toBe(0);
  });

  describe('Feedback & onTurn orchestration', () => {
    it('propagates onTurn callback and triggers haptic/audio feedback during gesture navigation', () => {
      const onTurn = vi.fn();
      const mockVibrate = vi.fn().mockReturnValue(true);
      Object.defineProperty(globalThis, 'navigator', {
        value: { vibrate: mockVibrate },
        configurable: true,
        writable: true
      });

      const engine = new HeelslideEngine({
        haptics: true,
        sound: false,
        onTurn,
        generator: {
          bounds: { width: 300, height: 150 },
          heels: 1,
          seed: 42
        }
      });

      const path = engine.getPath();
      const startPoint = path.points[0]!;
      const heelPoint = path.points[1]!;
      const endPoint = path.points[2]!;
      const midSecondSegment = {
        x: (heelPoint.x + endPoint.x) / 2,
        y: (heelPoint.y + endPoint.y) / 2
      };

      engine.startGesture(startPoint);
      engine.updateGesture(heelPoint);
      engine.updateGesture(midSecondSegment);

      expect(onTurn).toHaveBeenCalledWith(0);
      expect(mockVibrate).toHaveBeenCalledWith(15);
    });

    it('resumes AudioContext on startGesture when sound is enabled', async () => {
      const engine = new HeelslideEngine({
        sound: true
      });

      const feedback = engine.getFeedbackController();
      const resumeSpy = vi.spyOn(feedback, 'resumeAudio');

      const startPoint = engine.getPath().points[0]!;
      engine.startGesture(startPoint);

      expect(resumeSpy).toHaveBeenCalled();
    });

    it('allows dynamically updating feedback options via setFeedbackOptions', () => {
      const engine = new HeelslideEngine({
        haptics: false,
        sound: false
      });

      const feedback = engine.getFeedbackController();
      expect(feedback.getOptions().haptics).toBe(false);

      engine.setFeedbackOptions({ haptics: true });
      expect(feedback.getOptions().haptics).toBe(true);
    });

    it('cleans up feedback resources when destroy() is called', () => {
      const engine = new HeelslideEngine({ sound: true });
      const feedback = engine.getFeedbackController();
      const destroySpy = vi.spyOn(feedback, 'destroy');

      engine.destroy();
      expect(destroySpy).toHaveBeenCalled();
    });
  });

  describe('Segmented Mode & Inactivity Timeout', () => {
    it('automatically resets to origin when checkpointTimeoutMs expires', () => {
      vi.useFakeTimers();
      const onReset = vi.fn();
      const onStateChange = vi.fn();

      const engine = new HeelslideEngine({
        segmented: true,
        checkpointTimeoutMs: 2000,
        onReset,
        onStateChange,
        generator: {
          bounds: { width: 300, height: 150 },
          heels: 1,
          seed: 42
        }
      });

      const path = engine.getPath();
      const startPoint = path.points[0]!;
      const heelPoint = path.points[1]!;

      // Advance to first heel and release
      engine.startGesture(startPoint);
      engine.updateGesture(heelPoint);
      engine.endGesture();

      expect(engine.getState()).toBe('checkpoint');
      expect(engine.getProgress()).toBeGreaterThan(0);

      // Fast forward 1500ms -> should still be at checkpoint
      vi.advanceTimersByTime(1500);
      expect(engine.getState()).toBe('checkpoint');
      expect(onReset).not.toHaveBeenCalled();

      // Fast forward remaining 500ms -> timeout expires
      vi.advanceTimersByTime(500);
      expect(engine.getState()).toBe('idle');
      expect(engine.getProgress()).toBe(0);
      expect(onReset).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it('cancels checkpoint timeout when user resumes gesture before expiry', () => {
      vi.useFakeTimers();
      const onReset = vi.fn();

      const engine = new HeelslideEngine({
        segmented: true,
        checkpointTimeoutMs: 2000,
        onReset,
        generator: {
          bounds: { width: 300, height: 150 },
          heels: 1,
          seed: 42
        }
      });

      const path = engine.getPath();
      const startPoint = path.points[0]!;
      const heelPoint = path.points[1]!;

      engine.startGesture(startPoint);
      engine.updateGesture(heelPoint);
      engine.endGesture();
      expect(engine.getState()).toBe('checkpoint');

      // Advance 1000ms, then resume gesture
      vi.advanceTimersByTime(1000);
      const resumed = engine.startGesture(heelPoint);
      expect(resumed).toBe(true);
      expect(engine.getState()).toBe('active');

      // Advance another 2000ms -> should NOT reset because gesture was resumed
      vi.advanceTimersByTime(2000);
      expect(engine.getState()).toBe('active');
      expect(onReset).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('clears checkpoint timeout on destroy() and reset()', () => {
      vi.useFakeTimers();
      const onReset = vi.fn();

      const engine = new HeelslideEngine({
        segmented: true,
        checkpointTimeoutMs: 2000,
        onReset,
        generator: {
          bounds: { width: 300, height: 150 },
          heels: 1,
          seed: 42
        }
      });

      const path = engine.getPath();
      const startPoint = path.points[0]!;
      const heelPoint = path.points[1]!;

      engine.startGesture(startPoint);
      engine.updateGesture(heelPoint);
      engine.endGesture();
      expect(engine.getState()).toBe('checkpoint');

      engine.destroy();

      // Advancing time should not fire onReset
      vi.advanceTimersByTime(3000);
      expect(onReset).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });
});

