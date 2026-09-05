// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { ref } from 'vue';
import { useHeelslide } from '../src/useHeelslide';
import type { TrackPath } from '@heelslide/core';

describe('useHeelslide composable', () => {
  const customTrack: TrackPath = {
    points: [
      { x: 0, y: 50 },
      { x: 100, y: 50 },
      { x: 100, y: 150 }
    ],
    segments: [
      {
        start: { x: 0, y: 50 },
        end: { x: 100, y: 50 },
        direction: 'horizontal',
        length: 100
      },
      {
        start: { x: 100, y: 50 },
        end: { x: 100, y: 150 },
        direction: 'vertical',
        length: 100
      }
    ],
    totalLength: 200,
    heelCount: 1
  };

  it('initializes with expected default reactive state', () => {
    const { state, progress, track, currentSegmentIndex, isDragging, handlePosition } = useHeelslide({
      track: customTrack
    });

    expect(state.value).toBe('idle');
    expect(progress.value).toBe(0);
    expect(currentSegmentIndex.value).toBe(0);
    expect(isDragging.value).toBe(false);
    expect(track.value).toEqual(customTrack);
    expect(handlePosition.value).toEqual({ x: 0, y: 50 });
  });

  it('handles startGesture, updateGesture, and full completion with callbacks', () => {
    const onUnlock = vi.fn();
    const onReset = vi.fn();
    const onProgress = vi.fn();
    const onStateChange = vi.fn();

    const { state, progress, isDragging, handlePosition, startGesture, updateGesture, endGesture } =
      useHeelslide({
        track: customTrack,
        tolerance: 20,
        onUnlock,
        onReset,
        onProgress,
        onStateChange
      });

    // Start at origin
    const started = startGesture({ x: 0, y: 50 });
    expect(started).toBe(true);
    expect(state.value).toBe('active');
    expect(isDragging.value).toBe(true);
    expect(onStateChange).toHaveBeenCalledWith('active');

    // Move along segment 0
    updateGesture({ x: 50, y: 50 });
    expect(progress.value).toBeCloseTo(0.25, 2);
    expect(handlePosition.value).toEqual({ x: 50, y: 50 });
    expect(onProgress).toHaveBeenCalled();

    // Move to corner (heel vertex)
    updateGesture({ x: 100, y: 50 });
    expect(progress.value).toBeCloseTo(0.5, 2);

    // Move along segment 1 to destination
    updateGesture({ x: 100, y: 150 });
    expect(progress.value).toBe(1);

    endGesture();
    expect(state.value).toBe('unlocked');
    expect(isDragging.value).toBe(false);
    expect(onUnlock).toHaveBeenCalledTimes(1);
  });

  it('resets when gesture deviates outside tolerance', () => {
    const onReset = vi.fn();
    const { state, progress, isDragging, startGesture, updateGesture } = useHeelslide({
      track: customTrack,
      tolerance: 15,
      onReset
    });

    startGesture({ x: 0, y: 50 });
    expect(state.value).toBe('active');

    // Move wildly off-path
    updateGesture({ x: 50, y: 200 });
    expect(state.value).toBe('idle');
    expect(progress.value).toBe(0);
    expect(isDragging.value).toBe(false);
    expect(onReset).toHaveBeenCalled();
  });

  it('resets when released before destination', () => {
    const onReset = vi.fn();
    const { state, progress, isDragging, startGesture, updateGesture, endGesture } = useHeelslide({
      track: customTrack,
      onReset
    });

    startGesture({ x: 0, y: 50 });
    updateGesture({ x: 50, y: 50 });
    expect(progress.value).toBeGreaterThan(0);

    endGesture();
    expect(state.value).toBe('idle');
    expect(progress.value).toBe(0);
    expect(isDragging.value).toBe(false);
    expect(onReset).toHaveBeenCalled();
  });

  it('resets when cancelGesture is invoked', () => {
    const { state, startGesture, cancelGesture } = useHeelslide({ track: customTrack });

    startGesture({ x: 0, y: 50 });
    expect(state.value).toBe('active');

    cancelGesture();
    expect(state.value).toBe('idle');
  });

  it('supports manual reset and regeneratePath', () => {
    const { state, progress, track, startGesture, updateGesture, reset, regeneratePath } =
      useHeelslide();

    const startPt = track.value.points[0]!;
    startGesture(startPt);
    updateGesture({ x: startPt.x + 10, y: startPt.y });

    reset();
    expect(state.value).toBe('idle');
    expect(progress.value).toBe(0);

    const newTrack = regeneratePath({ heels: 3 });
    expect(newTrack.heelCount).toBe(3);
    expect(track.value).toEqual(newTrack);
    expect(state.value).toBe('idle');
  });

  it('normalizes PointerEvent coordinates relative to containerRef', () => {
    const container = document.createElement('div');
    // Mock getBoundingClientRect
    container.getBoundingClientRect = () =>
      ({
        left: 100,
        top: 200,
        right: 400,
        bottom: 350,
        width: 300,
        height: 150,
        x: 100,
        y: 200,
        toJSON: () => ({})
      }) as DOMRect;

    const containerRef = ref<HTMLElement | null>(container);

    const { startGesture, updateGesture, state, progress } = useHeelslide({
      track: customTrack,
      containerRef
    });

    // clientX = 100, clientY = 250 -> relative x = 0, y = 50 (origin of customTrack)
    const pointerDownEvent = {
      clientX: 100,
      clientY: 250
    } as unknown as PointerEvent;

    const started = startGesture(pointerDownEvent);
    expect(started).toBe(true);
    expect(state.value).toBe('active');

    // clientX = 150, clientY = 250 -> relative x = 50, y = 50
    const pointerMoveEvent = {
      clientX: 150,
      clientY: 250
    } as unknown as PointerEvent;

    updateGesture(pointerMoveEvent);
    expect(progress.value).toBeCloseTo(0.25, 2);
  });
});
