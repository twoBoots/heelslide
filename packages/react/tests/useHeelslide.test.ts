/** @vitest-environment happy-dom */
// @ts-expect-error React testing environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { describe, it, expect, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useHeelslide, getPointAtProgress } from '../src/useHeelslide.js';
import type { UseHeelslideOptions, UseHeelslideReturn } from '../src/types.js';

// Helper to render and inspect hook in happy-dom
function renderTestHook(options: UseHeelslideOptions = {}) {
  let hookReturn!: UseHeelslideReturn;

  function TestComponent({ opts }: { opts: UseHeelslideOptions }) {
    hookReturn = useHeelslide(opts);
    return null;
  }

  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(React.createElement(TestComponent, { opts: options }));
  });

  return {
    result: {
      get current() {
        return hookReturn;
      }
    },
    rerender(newOpts: UseHeelslideOptions) {
      act(() => {
        root.render(React.createElement(TestComponent, { opts: newOpts }));
      });
    },
    unmount() {
      act(() => {
        root.unmount();
      });
      container.remove();
    }
  };
}

describe('useHeelslide Hook', () => {
  it('should initialize with idle state, 0 progress, and handle at start point', () => {
    const { result, unmount } = renderTestHook({
      generator: {
        bounds: { width: 300, height: 150 },
        heels: 2
      }
    });

    expect(result.current.state).toBe('idle');
    expect(result.current.progress).toBe(0);
    expect(result.current.isDragging).toBe(false);
    expect(result.current.track).toBeDefined();
    expect(result.current.track.points.length).toBeGreaterThanOrEqual(3);
    expect(result.current.handlePosition).toEqual(result.current.track.points[0]);

    unmount();
  });

  it('should regenerate path on demand', () => {
    const { result, unmount } = renderTestHook({
      generator: {
        bounds: { width: 300, height: 150 },
        heels: 2,
        seed: 12345
      }
    });

    act(() => {
      result.current.regenerate({ seed: 99999 });
    });

    expect(result.current.track).toBeDefined();
    expect(result.current.progress).toBe(0);
    expect(result.current.handlePosition).toEqual(result.current.track.points[0]);

    unmount();
  });

  it('should handle pointer down, move, and up lifecycle', () => {
    const onUnlock = vi.fn();
    const onReset = vi.fn();
    const onProgress = vi.fn();
    const onStateChange = vi.fn();

    const { result, unmount } = renderTestHook({
      generator: {
        bounds: { width: 300, height: 150 },
        heels: 1
      },
      tolerance: 30,
      onUnlock,
      onReset,
      onProgress,
      onStateChange
    });

    const startPt = result.current.track.points[0];

    // Mock pointer capture methods
    const setPointerCapture = vi.fn();
    const releasePointerCapture = vi.fn();

    const mockTarget = {
      setPointerCapture,
      releasePointerCapture,
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 300,
        height: 150
      })
    };

    // Pointer down on start point
    act(() => {
      result.current.getContainerProps().onPointerDown({
        pointerId: 1,
        clientX: startPt.x,
        clientY: startPt.y,
        currentTarget: mockTarget,
        preventDefault: vi.fn()
      } as unknown as React.PointerEvent);
    });

    expect(result.current.state).toBe('active');
    expect(result.current.isDragging).toBe(true);
    expect(setPointerCapture).toHaveBeenCalledWith(1);

    // Pointer move along first segment
    const nextPt = result.current.track.points[1];
    act(() => {
      result.current.getContainerProps().onPointerMove({
        pointerId: 1,
        clientX: (startPt.x + nextPt.x) / 2,
        clientY: (startPt.y + nextPt.y) / 2,
        currentTarget: mockTarget,
        preventDefault: vi.fn()
      } as unknown as React.PointerEvent);
    });

    expect(result.current.progress).toBeGreaterThan(0);
    expect(onProgress).toHaveBeenCalled();

    // Release before end -> triggers reset
    act(() => {
      result.current.getContainerProps().onPointerUp({
        pointerId: 1,
        clientX: (startPt.x + nextPt.x) / 2,
        clientY: (startPt.y + nextPt.y) / 2,
        currentTarget: mockTarget,
        preventDefault: vi.fn()
      } as unknown as React.PointerEvent);
    });

    expect(result.current.state).toBe('idle');
    expect(result.current.progress).toBe(0);
    expect(result.current.isDragging).toBe(false);
    expect(releasePointerCapture).toHaveBeenCalledWith(1);
    expect(onReset).toHaveBeenCalled();

    unmount();
  });

  it('should ignore gestures when disabled', () => {
    const { result, unmount } = renderTestHook({
      disabled: true,
      generator: { bounds: { width: 300, height: 150 }, heels: 1 }
    });

    const startPt = result.current.track.points[0];

    act(() => {
      result.current.getContainerProps().onPointerDown({
        pointerId: 1,
        clientX: startPt.x,
        clientY: startPt.y,
        currentTarget: {
          setPointerCapture: vi.fn(),
          getBoundingClientRect: () => ({ left: 0, top: 0, width: 300, height: 150 })
        },
        preventDefault: vi.fn()
      } as unknown as React.PointerEvent);
    });

    expect(result.current.state).toBe('idle');
    expect(result.current.isDragging).toBe(false);

    unmount();
  });

  it('should handle complete slide to unlock', () => {
    const onUnlock = vi.fn();
    const { result, unmount } = renderTestHook({
      generator: { bounds: { width: 200, height: 100 }, heels: 1 },
      tolerance: 50,
      onUnlock
    });

    const mockTarget = {
      setPointerCapture: vi.fn(),
      releasePointerCapture: vi.fn(),
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 100 })
    };

    const points = result.current.track.points;

    // Start at point 0
    act(() => {
      result.current.getContainerProps().onPointerDown({
        pointerId: 1,
        clientX: points[0].x,
        clientY: points[0].y,
        currentTarget: mockTarget,
        preventDefault: vi.fn()
      } as unknown as React.PointerEvent);
    });

    // Move to corner point 1
    act(() => {
      result.current.getContainerProps().onPointerMove({
        pointerId: 1,
        clientX: points[1].x,
        clientY: points[1].y,
        currentTarget: mockTarget,
        preventDefault: vi.fn()
      } as unknown as React.PointerEvent);
    });

    // Move to end point
    const lastPoint = points[points.length - 1];
    act(() => {
      result.current.getContainerProps().onPointerMove({
        pointerId: 1,
        clientX: lastPoint.x,
        clientY: lastPoint.y,
        currentTarget: mockTarget,
        preventDefault: vi.fn()
      } as unknown as React.PointerEvent);
    });

    // End gesture
    act(() => {
      result.current.getContainerProps().onPointerUp({
        pointerId: 1,
        clientX: lastPoint.x,
        clientY: lastPoint.y,
        currentTarget: mockTarget,
        preventDefault: vi.fn()
      } as unknown as React.PointerEvent);
    });

    expect(result.current.state).toBe('unlocked');
    expect(onUnlock).toHaveBeenCalled();

    unmount();
  });

  it('should reset on pointer cancel', () => {
    const onReset = vi.fn();
    const { result, unmount } = renderTestHook({
      generator: { bounds: { width: 200, height: 100 }, heels: 1 },
      onReset
    });

    const mockTarget = {
      setPointerCapture: vi.fn(),
      releasePointerCapture: vi.fn(),
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 100 })
    };

    const points = result.current.track.points;

    act(() => {
      result.current.getContainerProps().onPointerDown({
        pointerId: 1,
        clientX: points[0].x,
        clientY: points[0].y,
        currentTarget: mockTarget,
        preventDefault: vi.fn()
      } as unknown as React.PointerEvent);
    });

    expect(result.current.isDragging).toBe(true);

    act(() => {
      result.current.getContainerProps().onPointerCancel({
        pointerId: 1,
        clientX: points[0].x,
        clientY: points[0].y,
        currentTarget: mockTarget,
        preventDefault: vi.fn()
      } as unknown as React.PointerEvent);
    });

    expect(result.current.isDragging).toBe(false);
    expect(result.current.state).toBe('idle');

    unmount();
  });

  it('should provide handle props with calculated style', () => {
    const { result, unmount } = renderTestHook({
      generator: { bounds: { width: 200, height: 100 }, heels: 1 }
    });

    const handleProps = result.current.getHandleProps();
    expect(handleProps.style).toBeDefined();
    expect(handleProps.style.position).toBe('absolute');
    expect(handleProps.style.left).toBe(`${result.current.handlePosition.x}px`);
    expect(handleProps.style.top).toBe(`${result.current.handlePosition.y}px`);
    expect(handleProps.style.cursor).toBe('grab');

    unmount();
  });

  it('should reset manually via reset() method', () => {
    const { result, unmount } = renderTestHook({
      generator: { bounds: { width: 200, height: 100 }, heels: 1 }
    });

    const points = result.current.track.points;
    const mockTarget = {
      setPointerCapture: vi.fn(),
      releasePointerCapture: vi.fn(),
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 100 })
    };

    act(() => {
      result.current.getContainerProps().onPointerDown({
        pointerId: 1,
        clientX: points[0].x,
        clientY: points[0].y,
        currentTarget: mockTarget,
        preventDefault: vi.fn()
      } as unknown as React.PointerEvent);
    });

    expect(result.current.isDragging).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toBe('idle');
    expect(result.current.progress).toBe(0);
    expect(result.current.isDragging).toBe(false);

    unmount();
  });

  it('should cover getPointAtProgress edge cases', () => {
    // Empty points
    const emptyTrack = { points: [], segments: [], totalLength: 0, heelCount: 0 };
    expect(getPointAtProgress(emptyTrack, 0.5)).toEqual({ x: 0, y: 0 });

    // Progress <= 0
    const sampleTrack = {
      points: [{ x: 10, y: 10 }, { x: 50, y: 10 }, { x: 50, y: 50 }],
      segments: [
        { start: { x: 10, y: 10 }, end: { x: 50, y: 10 }, direction: 'horizontal' as const, length: 40 },
        { start: { x: 50, y: 10 }, end: { x: 50, y: 50 }, direction: 'vertical' as const, length: 40 }
      ],
      totalLength: 80,
      heelCount: 1
    };

    expect(getPointAtProgress(sampleTrack, 0)).toEqual({ x: 10, y: 10 });
    expect(getPointAtProgress(sampleTrack, -0.2)).toEqual({ x: 10, y: 10 });
    expect(getPointAtProgress(sampleTrack, 1.0)).toEqual({ x: 50, y: 50 });
    expect(getPointAtProgress(sampleTrack, 1.5)).toEqual({ x: 50, y: 50 });

    // Mid point along first segment (0.25 -> 20px)
    const midPt = getPointAtProgress(sampleTrack, 0.25);
    expect(midPt.x).toBe(30);
    expect(midPt.y).toBe(10);

    // Mid point along second segment (0.75 -> 60px -> 20px into seg 2)
    const midPt2 = getPointAtProgress(sampleTrack, 0.75);
    expect(midPt2.x).toBe(50);
    expect(midPt2.y).toBe(30);

    // Zero-length segment
    const zeroLenTrack = {
      points: [{ x: 10, y: 10 }, { x: 10, y: 10 }],
      segments: [
        { start: { x: 10, y: 10 }, end: { x: 10, y: 10 }, direction: 'horizontal' as const, length: 0 }
      ],
      totalLength: 0,
      heelCount: 0
    };
    expect(getPointAtProgress(zeroLenTrack, 0.5)).toEqual({ x: 10, y: 10 });
  });

  it('should safely ignore move/up/cancel events when inactive or missing target', () => {
    const { result, unmount } = renderTestHook();

    // Call move, up, cancel while idle
    act(() => {
      result.current.getContainerProps().onPointerMove({
        pointerId: 1,
        clientX: 0,
        clientY: 0,
        currentTarget: null,
        preventDefault: vi.fn()
      } as unknown as React.PointerEvent);

      result.current.getContainerProps().onPointerUp({
        pointerId: 1,
        clientX: 0,
        clientY: 0,
        currentTarget: null,
        preventDefault: vi.fn()
      } as unknown as React.PointerEvent);

      result.current.getContainerProps().onPointerCancel({
        pointerId: 1,
        clientX: 0,
        clientY: 0,
        currentTarget: null,
        preventDefault: vi.fn()
      } as unknown as React.PointerEvent);
    });

    expect(result.current.state).toBe('idle');
    unmount();
  });

  it('should initialize with default options if none provided', () => {
    const { result, unmount } = renderTestHook();
    expect(result.current.state).toBe('idle');
    expect(result.current.track.points.length).toBeGreaterThanOrEqual(3);
    unmount();
  });

  describe('Accessibility & Keyboard Controls', () => {
    const sampleTrack = {
      points: [
        { x: 10, y: 10 },
        { x: 110, y: 10 },
        { x: 110, y: 110 }
      ],
      segments: [
        { start: { x: 10, y: 10 }, end: { x: 110, y: 10 }, direction: 'horizontal' as const, length: 100 },
        { start: { x: 110, y: 10 }, end: { x: 110, y: 110 }, direction: 'vertical' as const, length: 100 }
      ],
      totalLength: 200,
      heelCount: 1
    };

    it('should expose stepping methods (stepForward, stepBackward, stepToNextHeel)', () => {
      const { result, unmount } = renderTestHook({ track: sampleTrack });

      expect(typeof result.current.stepForward).toBe('function');
      expect(typeof result.current.stepBackward).toBe('function');
      expect(typeof result.current.stepToNextHeel).toBe('function');

      act(() => {
        result.current.stepForward(0.2);
      });
      expect(result.current.progress).toBeCloseTo(0.2);
      expect(result.current.state).toBe('active');

      act(() => {
        result.current.stepToNextHeel();
      });
      expect(result.current.progress).toBeCloseTo(0.5);

      act(() => {
        result.current.stepBackward(0.1);
      });
      expect(result.current.progress).toBeCloseTo(0.4);

      unmount();
    });

    it('should advance progress on ArrowRight and ArrowDown keydown', () => {
      const { result, unmount } = renderTestHook({ track: sampleTrack });
      const preventDefault = vi.fn();

      act(() => {
        result.current.getHandleProps().onKeyDown({
          key: 'ArrowRight',
          preventDefault
        } as unknown as React.KeyboardEvent);
      });

      expect(preventDefault).toHaveBeenCalled();
      expect(result.current.state).toBe('active');
      expect(result.current.progress).toBeGreaterThan(0);

      const progressAfterFirst = result.current.progress;
      act(() => {
        result.current.getHandleProps().onKeyDown({
          key: 'ArrowDown',
          preventDefault
        } as unknown as React.KeyboardEvent);
      });
      expect(result.current.progress).toBeGreaterThan(progressAfterFirst);

      unmount();
    });

    it('should decrement progress on ArrowLeft and ArrowUp keydown', () => {
      const { result, unmount } = renderTestHook({ track: sampleTrack });
      const preventDefault = vi.fn();

      act(() => {
        result.current.stepForward(0.3);
      });
      expect(result.current.progress).toBeCloseTo(0.3);

      act(() => {
        result.current.getHandleProps().onKeyDown({
          key: 'ArrowLeft',
          preventDefault
        } as unknown as React.KeyboardEvent);
      });

      expect(preventDefault).toHaveBeenCalled();
      expect(result.current.progress).toBeLessThan(0.3);

      unmount();
    });

    it('should reset gesture on Escape and Home keys', () => {
      const { result, unmount } = renderTestHook({ track: sampleTrack });
      const preventDefault = vi.fn();

      act(() => {
        result.current.stepForward(0.3);
      });
      expect(result.current.state).toBe('active');

      act(() => {
        result.current.getHandleProps().onKeyDown({
          key: 'Home',
          preventDefault
        } as unknown as React.KeyboardEvent);
      });

      expect(result.current.state).toBe('idle');
      expect(result.current.progress).toBe(0);

      act(() => {
        result.current.stepForward(0.3);
      });
      expect(result.current.state).toBe('active');

      act(() => {
        result.current.getHandleProps().onKeyDown({
          key: 'Escape',
          preventDefault
        } as unknown as React.KeyboardEvent);
      });

      expect(result.current.state).toBe('idle');
      expect(result.current.progress).toBe(0);

      unmount();
    });

    it('should track screen reader announcement string', () => {
      const { result, unmount } = renderTestHook({ track: sampleTrack });

      expect(result.current.announcement).toBeDefined();

      act(() => {
        result.current.stepForward(0.1);
      });

      expect(result.current.announcement).toContain('%');

      unmount();
    });

    it('should support accessible fallback dialog flow', () => {
      const onUnlock = vi.fn();
      const { result, unmount } = renderTestHook({
        track: sampleTrack,
        accessibleFallback: 'dialog',
        onUnlock
      });

      expect(result.current.isFallbackOpen).toBe(false);

      act(() => {
        result.current.openFallback();
      });
      expect(result.current.isFallbackOpen).toBe(true);

      act(() => {
        result.current.closeFallback();
      });
      expect(result.current.isFallbackOpen).toBe(false);

      // Open via Space key when idle and accessibleFallback="dialog"
      act(() => {
        result.current.getHandleProps().onKeyDown({
          key: ' ',
          preventDefault: vi.fn()
        } as unknown as React.KeyboardEvent);
      });
      expect(result.current.isFallbackOpen).toBe(true);

      // Confirm fallback unlocks gate
      act(() => {
        result.current.confirmFallback();
      });
      expect(result.current.isFallbackOpen).toBe(false);
      expect(result.current.state).toBe('unlocked');
      expect(result.current.progress).toBe(1);
      expect(onUnlock).toHaveBeenCalled();

      // Test Enter key when open to confirm
      act(() => {
        result.current.openFallback();
      });
      expect(result.current.isFallbackOpen).toBe(true);

      act(() => {
        result.current.getHandleProps().onKeyDown({
          key: 'Enter',
          preventDefault: vi.fn()
        } as unknown as React.KeyboardEvent);
      });
      expect(result.current.isFallbackOpen).toBe(false);

      // Test Escape closes fallback when open
      act(() => {
        result.current.openFallback();
      });
      act(() => {
        result.current.getHandleProps().onKeyDown({
          key: 'Escape',
          preventDefault: vi.fn()
        } as unknown as React.KeyboardEvent);
      });
      expect(result.current.isFallbackOpen).toBe(false);

      unmount();
    });

    it('should handle Enter/Space during active gesture and ignore End or unhandled keys', () => {
      const { result, unmount } = renderTestHook({ track: sampleTrack });
      const preventDefault = vi.fn();

      act(() => {
        result.current.stepForward(0.1);
      });

      // Enter during active stepping advances step
      act(() => {
        result.current.getHandleProps().onKeyDown({
          key: 'Enter',
          preventDefault
        } as unknown as React.KeyboardEvent);
      });
      expect(preventDefault).toHaveBeenCalled();
      expect(result.current.progress).toBeGreaterThan(0.1);

      // End key prevents default and is a no-op
      act(() => {
        result.current.getHandleProps().onKeyDown({
          key: 'End',
          preventDefault
        } as unknown as React.KeyboardEvent);
      });

      // Other unhandled key
      act(() => {
        result.current.getHandleProps().onKeyDown({
          key: 'Tab',
          preventDefault
        } as unknown as React.KeyboardEvent);
      });

      unmount();
    });

    it('should ignore stepping and keyboard interactions when disabled', () => {
      const { result, unmount } = renderTestHook({
        track: sampleTrack,
        disabled: true
      });

      act(() => {
        result.current.stepForward(0.1);
        result.current.stepBackward(0.1);
        result.current.stepToNextHeel();
        result.current.getHandleProps().onKeyDown({
          key: 'ArrowRight',
          preventDefault: vi.fn()
        } as unknown as React.KeyboardEvent);
      });

      expect(result.current.progress).toBe(0);
      expect(result.current.state).toBe('idle');

      unmount();
    });
  });
});


