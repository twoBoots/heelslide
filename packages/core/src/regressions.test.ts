import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  createGestureStateMachine,
  generateTrackPath,
  segmentsIntersect,
  HeelslideEngine
} from './index.js';
import type { GestureState, Segment, TrackPath } from './types.js';

function seg(x1: number, y1: number, x2: number, y2: number): Segment {
  return {
    start: { x: x1, y: y1 },
    end: { x: x2, y: y2 },
    direction: y1 === y2 ? 'horizontal' : 'vertical',
    length: Math.hypot(x2 - x1, y2 - y1)
  };
}

function buildTrack(points: [number, number][]): TrackPath {
  const segments: Segment[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i]!;
    const [x2, y2] = points[i + 1]!;
    segments.push(seg(x1, y1, x2, y2));
  }
  return {
    points: points.map(([x, y]) => ({ x, y })),
    segments,
    totalLength: segments.reduce((acc, s) => acc + s.length, 0),
    heelCount: segments.length - 1
  };
}

/** Final segment is only ~2.4% of total length, so aggregate progress alone clears 95%. */
const shortTailTrack = (): TrackPath =>
  buildTrack([
    [0, 0],
    [100, 0],
    [100, 100],
    [105, 100]
  ]);

const squareTrack = (): TrackPath =>
  buildTrack([
    [0, 0],
    [100, 0],
    [100, 100],
    [200, 100]
  ]);

describe('Unlock gate (H1)', () => {
  it('should not unlock when progress clears the threshold on a non-final segment', () => {
    const onUnlock = vi.fn();
    const machine = createGestureStateMachine(shortTailTrack(), { tolerance: 24, onUnlock });

    expect(machine.start({ x: 0, y: 0 })).toBe(true);
    machine.update({ x: 50, y: 0 });
    machine.update({ x: 100, y: 10 });
    machine.update({ x: 100, y: 100 });

    // Precondition: aggregate progress really is past the 0.95 threshold.
    expect(machine.getProgress()).toBeGreaterThan(0.95);
    expect(machine.getCurrentSegmentIndex()).toBe(1);

    machine.end();

    expect(machine.getState()).not.toBe('unlocked');
    expect(onUnlock).not.toHaveBeenCalled();
  });

  it('should unlock when the final segment is actually traversed', () => {
    const onUnlock = vi.fn();
    const machine = createGestureStateMachine(squareTrack(), { tolerance: 24, onUnlock });

    machine.start({ x: 0, y: 0 });
    machine.update({ x: 100, y: 10 });
    machine.update({ x: 100, y: 100 });
    machine.update({ x: 110, y: 100 });
    machine.update({ x: 200, y: 100 });
    machine.end();

    expect(machine.getState()).toBe('unlocked');
    expect(onUnlock).toHaveBeenCalledTimes(1);
  });
});

describe('Reset observability (H4)', () => {
  it('should emit a state change through reset when a gesture deviates', () => {
    const seen: GestureState[] = [];
    const onReset = vi.fn();
    const machine = createGestureStateMachine(squareTrack(), {
      tolerance: 10,
      onReset,
      onStateChange: (s) => seen.push(s)
    });

    machine.start({ x: 0, y: 0 });
    machine.update({ x: 20, y: 0 });
    machine.update({ x: 20, y: 900 });

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(seen).toEqual(['active', 'reset', 'idle']);
    expect(machine.getState()).toBe('idle');
    expect(machine.getProgress()).toBe(0);
  });

  it('should emit a state change when a gesture is cancelled', () => {
    const seen: GestureState[] = [];
    const machine = createGestureStateMachine(squareTrack(), {
      tolerance: 10,
      onStateChange: (s) => seen.push(s)
    });

    machine.start({ x: 0, y: 0 });
    machine.update({ x: 20, y: 0 });
    machine.cancel();

    expect(seen).toEqual(['active', 'reset', 'idle']);
  });
});

describe('Fail-safe reset target (H5)', () => {
  it('should settle in idle after a rejected gesture even when seeded as unlocked', () => {
    const onReset = vi.fn();
    const machine = createGestureStateMachine(squareTrack(), {
      tolerance: 10,
      initialState: 'unlocked',
      onReset
    });

    expect(machine.start({ x: 0, y: 0 })).toBe(true);
    machine.update({ x: 20, y: 0 });
    machine.update({ x: 20, y: 900 });

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(machine.getState()).toBe('idle');
    expect(machine.getProgress()).toBe(0);
  });

  it('should return to idle on explicit reset even when seeded as unlocked', () => {
    const machine = createGestureStateMachine(squareTrack(), {
      initialState: 'unlocked',
      initialProgress: 1
    });

    machine.reset();

    expect(machine.getState()).toBe('idle');
    expect(machine.getProgress()).toBe(0);
  });

  it('should still seed the configured initial state at construction', () => {
    const machine = createGestureStateMachine(squareTrack(), {
      initialState: 'unlocked',
      initialProgress: 1
    });

    expect(machine.getState()).toBe('unlocked');
    expect(machine.getProgress()).toBe(1);
  });
});

describe('Corner-cutting tolerance (M6)', () => {
  it('should not advance across a heel from beyond tolerance of the current segment', () => {
    const machine = createGestureStateMachine(squareTrack(), { tolerance: 24 });

    machine.start({ x: 0, y: 0 });
    machine.update({ x: 50, y: 0 });
    // 50px off the current horizontal segment, but sitting on the next vertical one.
    machine.update({ x: 100, y: 50 });

    expect(machine.getCurrentSegmentIndex()).toBe(0);
    expect(machine.getState()).not.toBe('active');
  });

  it('should advance across a heel when continuous with both segments', () => {
    const machine = createGestureStateMachine(squareTrack(), { tolerance: 24 });

    machine.start({ x: 0, y: 0 });
    machine.update({ x: 50, y: 0 });
    machine.update({ x: 100, y: 10 });

    expect(machine.getCurrentSegmentIndex()).toBe(1);
    expect(machine.getState()).toBe('active');
  });
});

describe('Generated path self-intersection (H2)', () => {
  const configs = [
    { bounds: { width: 400, height: 300 }, gridStep: 20, margin: 10, heels: 6 },
    { bounds: { width: 300, height: 150 }, gridStep: 24, margin: 16, heels: 2 },
    { bounds: { width: 640, height: 480 }, gridStep: 32, margin: 16, heels: 4 }
  ];

  it.each(configs)('should never overlap non-adjacent segments for %j', (config) => {
    const offenders: string[] = [];

    for (let seed = 0; seed < 200; seed++) {
      const track = generateTrackPath({ ...config, seed });
      for (let i = 0; i < track.segments.length; i++) {
        for (let j = i + 2; j < track.segments.length; j++) {
          if (segmentsIntersect(track.segments[i]!, track.segments[j]!)) {
            offenders.push(`seed=${seed} segments ${i}/${j}`);
          }
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it('should keep adjacent segments joined at exactly one shared vertex', () => {
    for (let seed = 0; seed < 100; seed++) {
      const track = generateTrackPath({
        bounds: { width: 400, height: 300 },
        gridStep: 20,
        margin: 10,
        heels: 5,
        seed
      });

      for (let i = 0; i < track.segments.length - 1; i++) {
        const a = track.segments[i]!;
        const b = track.segments[i + 1]!;
        expect(a.end).toEqual(b.start);
        expect(a.direction).not.toBe(b.direction);
      }
    }
  });

  it('should remain deterministic for a given seed', () => {
    const options = {
      bounds: { width: 400, height: 300 },
      gridStep: 20,
      margin: 10,
      heels: 5,
      seed: 42
    };

    expect(generateTrackPath(options).points).toEqual(generateTrackPath(options).points);
  });
});

describe('Regeneration lifecycle (M4)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not fire onReset from a superseded checkpoint timer', () => {
    vi.useFakeTimers();
    const onReset = vi.fn();
    const engine = new HeelslideEngine({
      track: squareTrack(),
      tolerance: 24,
      segmented: true,
      checkpointTimeoutMs: 50,
      onReset
    });

    engine.startGesture({ x: 0, y: 0 });
    engine.updateGesture({ x: 100, y: 0 });
    engine.endGesture();
    expect(engine.getState()).toBe('checkpoint');

    engine.regeneratePath({ bounds: { width: 300, height: 150 }, heels: 2, seed: 7 });
    vi.advanceTimersByTime(500);

    expect(onReset).not.toHaveBeenCalled();
  });
});

describe('Audio context deferral (M5)', () => {
  const originalWindow = (globalThis as { window?: unknown }).window;
  const originalAudio = (globalThis as { AudioContext?: unknown }).AudioContext;

  function installFakeAudio(): () => number {
    let constructions = 0;
    class FakeAudioContext {
      public state = 'running';
      public currentTime = 0;
      public destination = {};
      constructor() {
        constructions++;
      }
      createOscillator() {
        return {
          type: '',
          frequency: { setValueAtTime() {}, linearRampToValueAtTime() {} },
          connect() {},
          start() {},
          stop() {}
        };
      }
      createGain() {
        return {
          gain: {
            setValueAtTime() {},
            linearRampToValueAtTime() {},
            exponentialRampToValueAtTime() {}
          },
          connect() {}
        };
      }
      resume() {
        return Promise.resolve();
      }
      close() {
        return Promise.resolve();
      }
    }

    (globalThis as { window?: unknown }).window = globalThis;
    (globalThis as { AudioContext?: unknown }).AudioContext = FakeAudioContext;
    return () => constructions;
  }

  afterEach(() => {
    (globalThis as { window?: unknown }).window = originalWindow;
    (globalThis as { AudioContext?: unknown }).AudioContext = originalAudio;
  });

  it('should not construct an AudioContext when sound is disabled', () => {
    const count = installFakeAudio();
    const engine = new HeelslideEngine({ track: squareTrack() });

    engine.startGesture({ x: 0, y: 0 });

    expect(count()).toBe(0);
    engine.destroy();
  });

  it('should not construct an AudioContext when sound is explicitly false', () => {
    const count = installFakeAudio();
    const engine = new HeelslideEngine({ track: squareTrack(), sound: false });

    engine.startGesture({ x: 0, y: 0 });

    expect(count()).toBe(0);
    engine.destroy();
  });

  it('should construct an AudioContext when sound is enabled', () => {
    const count = installFakeAudio();
    const engine = new HeelslideEngine({ track: squareTrack(), sound: true });

    engine.startGesture({ x: 0, y: 0 });

    expect(count()).toBe(1);
    engine.destroy();
  });
});
