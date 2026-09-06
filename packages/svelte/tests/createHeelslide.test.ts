// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { createHeelslide } from '../src/createHeelslide.svelte.js';
import type { TrackPath } from '@heelslide/core';

describe('createHeelslide rune composable', () => {
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
    const slider = createHeelslide({
      track: customTrack
    });

    expect(slider.state).toBe('idle');
    expect(slider.progress).toBe(0);
    expect(slider.currentSegmentIndex).toBe(0);
    expect(slider.isDragging).toBe(false);
    expect(slider.track).toEqual(customTrack);
    expect(slider.handlePosition).toEqual({ x: 0, y: 50 });
  });

  it('handles startGesture, updateGesture, and full completion with callbacks', () => {
    const onUnlock = vi.fn();
    const onReset = vi.fn();
    const onProgress = vi.fn();
    const onStateChange = vi.fn();

    const slider = createHeelslide({
      track: customTrack,
      tolerance: 20,
      onUnlock,
      onReset,
      onProgress,
      onStateChange
    });

    // Start at origin
    const started = slider.startGesture({ x: 0, y: 50 });
    expect(started).toBe(true);
    expect(slider.state).toBe('active');
    expect(slider.isDragging).toBe(true);
    expect(onStateChange).toHaveBeenCalledWith('active');

    // Move along segment 0
    slider.updateGesture({ x: 50, y: 50 });
    expect(slider.progress).toBeCloseTo(0.25, 2);
    expect(slider.handlePosition).toEqual({ x: 50, y: 50 });
    expect(onProgress).toHaveBeenCalled();

    // Move to corner (heel vertex)
    slider.updateGesture({ x: 100, y: 50 });
    expect(slider.progress).toBeCloseTo(0.5, 2);

    // Move along segment 1 to destination
    slider.updateGesture({ x: 100, y: 150 });
    expect(slider.progress).toBe(1);

    slider.endGesture();
    expect(slider.state).toBe('unlocked');
    expect(slider.handlePosition).toEqual({ x: 100, y: 150 });
    expect(slider.isDragging).toBe(false);
    expect(onUnlock).toHaveBeenCalledTimes(1);
  });

  it('resets when gesture deviates outside tolerance', () => {
    const onReset = vi.fn();
    const slider = createHeelslide({
      track: customTrack,
      tolerance: 15,
      onReset
    });

    slider.startGesture({ x: 0, y: 50 });
    expect(slider.state).toBe('active');

    // Move wildly off-path
    slider.updateGesture({ x: 50, y: 200 });
    expect(slider.state).toBe('idle');
    expect(slider.progress).toBe(0);
    expect(slider.isDragging).toBe(false);
    expect(onReset).toHaveBeenCalled();
  });

  it('resets when released before destination', () => {
    const onReset = vi.fn();
    const slider = createHeelslide({
      track: customTrack,
      onReset
    });

    slider.startGesture({ x: 0, y: 50 });
    slider.updateGesture({ x: 50, y: 50 });
    expect(slider.progress).toBeGreaterThan(0);

    slider.endGesture();
    expect(slider.state).toBe('idle');
    expect(slider.progress).toBe(0);
    expect(slider.isDragging).toBe(false);
    expect(onReset).toHaveBeenCalled();
  });

  it('resets when cancelGesture is invoked', () => {
    const slider = createHeelslide({ track: customTrack });

    slider.startGesture({ x: 0, y: 50 });
    expect(slider.state).toBe('active');

    slider.cancelGesture();
    expect(slider.state).toBe('idle');
  });

  it('supports manual reset and regeneratePath', () => {
    const slider = createHeelslide();

    const startPt = slider.track.points[0]!;
    slider.startGesture(startPt);
    slider.updateGesture({ x: startPt.x + 10, y: startPt.y });

    slider.reset();
    expect(slider.state).toBe('idle');
    expect(slider.progress).toBe(0);

    const newTrack = slider.regeneratePath({ heels: 3 });
    expect(newTrack.heelCount).toBe(3);
    expect(slider.track).toEqual(newTrack);
    expect(slider.state).toBe('idle');
  });

  it('normalizes PointerEvent coordinates relative to containerElement', () => {
    const container = document.createElement('div');
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

    const slider = createHeelslide({
      track: customTrack,
      containerElement: container
    });

    // clientX = 100, clientY = 250 -> relative x = 0, y = 50 (origin of customTrack)
    const pointerDownEvent = {
      clientX: 100,
      clientY: 250
    } as unknown as PointerEvent;

    const started = slider.startGesture(pointerDownEvent);
    expect(started).toBe(true);
    expect(slider.state).toBe('active');

    // clientX = 150, clientY = 250 -> relative x = 50, y = 50
    const pointerMoveEvent = {
      clientX: 150,
      clientY: 250
    } as unknown as PointerEvent;

    slider.updateGesture(pointerMoveEvent);
    expect(slider.progress).toBeCloseTo(0.25, 2);
  });

  it('supports setting containerElement dynamically and extracting when container is null', () => {
    const slider = createHeelslide({
      track: customTrack
    });

    const pointerDownEvent = {
      clientX: 0,
      clientY: 50
    } as unknown as PointerEvent;

    // With null containerElement, uses clientX/clientY directly
    const started = slider.startGesture(pointerDownEvent);
    expect(started).toBe(true);
    expect(slider.state).toBe('active');

    const container = document.createElement('div');
    container.getBoundingClientRect = () =>
      ({
        left: 50,
        top: 50,
        right: 350,
        bottom: 200,
        width: 300,
        height: 150,
        x: 50,
        y: 50,
        toJSON: () => ({})
      }) as DOMRect;

    slider.setContainerElement(container);

    const pointerMoveEvent = {
      clientX: 100,
      clientY: 100
    } as unknown as PointerEvent;

    // clientX: 100 - 50 = 50, clientY: 100 - 50 = 50
    slider.updateGesture(pointerMoveEvent);
    expect(slider.progress).toBeCloseTo(0.25, 2);
  });

  it('triggers onTurn and haptic vibration when rounding heel corner', () => {
    const onTurn = vi.fn();
    const mockVibrate = vi.fn().mockReturnValue(true);
    Object.defineProperty(globalThis, 'navigator', {
      value: { vibrate: mockVibrate },
      configurable: true,
      writable: true
    });

    const slider = createHeelslide({
      track: customTrack,
      tolerance: 20,
      haptics: true,
      sound: false,
      onTurn
    });

    slider.startGesture({ x: 0, y: 50 });
    slider.updateGesture({ x: 100, y: 50 });
    slider.updateGesture({ x: 100, y: 70 });

    expect(onTurn).toHaveBeenCalledWith(0);
    expect(mockVibrate).toHaveBeenCalledWith(15);

    slider.destroy();
  });
});
