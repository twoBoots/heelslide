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
});
