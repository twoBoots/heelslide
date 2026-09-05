/** @vitest-environment happy-dom */
// @ts-expect-error React testing environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { describe, it, expect, vi } from 'vitest';
import React, { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Heelslide } from '../src/Heelslide.js';
import type { HeelslideProps } from '../src/types.js';

function renderComponent(props: HeelslideProps = {}, ref?: React.RefObject<HTMLDivElement | null>) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(React.createElement(Heelslide, { ...props, ref }));
  });

  return {
    container,
    rerender(newProps: HeelslideProps) {
      act(() => {
        root.render(React.createElement(Heelslide, { ...newProps, ref }));
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

describe('<Heelslide /> Component', () => {
  it('should render container, SVG track, heels, and draggable handle', () => {
    const { container, unmount } = renderComponent({
      width: 320,
      height: 160,
      heels: 2
    });

    const rootElement = container.firstElementChild as HTMLElement;
    expect(rootElement).not.toBeNull();
    expect(rootElement.getAttribute('role')).toBe('slider');
    expect(rootElement.getAttribute('aria-valuenow')).toBe('0');

    // Check SVG exists
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 320 160');

    // Check background path
    const trackPath = container.querySelector('path[data-heelslide-track="background"]');
    expect(trackPath).not.toBeNull();
    expect(trackPath?.getAttribute('d')).toContain('M');

    // Check heels (vertices)
    const heelMarkers = container.querySelectorAll('[data-heelslide-heel]');
    expect(heelMarkers.length).toBeGreaterThanOrEqual(2);

    // Check handle
    const handle = container.querySelector('[data-heelslide-handle]');
    expect(handle).not.toBeNull();

    unmount();
  });

  it('should forward ref to outer container div', () => {
    const ref = createRef<HTMLDivElement>();
    const { unmount } = renderComponent({}, ref);

    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName.toLowerCase()).toBe('div');
    expect(ref.current?.getAttribute('role')).toBe('slider');

    unmount();
  });

  it('should apply custom className and style props', () => {
    const { container, unmount } = renderComponent({
      className: 'custom-heelslide-class',
      style: { opacity: 0.9 }
    });

    const rootElement = container.firstElementChild as HTMLElement;
    expect(rootElement.classList.contains('custom-heelslide-class')).toBe(true);
    expect(rootElement.style.opacity).toBe('0.9');

    unmount();
  });

  it('should reflect disabled state and prevent interaction', () => {
    const onUnlock = vi.fn();
    const { container, unmount } = renderComponent({
      disabled: true,
      onUnlock
    });

    const rootElement = container.firstElementChild as HTMLElement;
    expect(rootElement.getAttribute('aria-disabled')).toBe('true');
    expect(rootElement.getAttribute('data-disabled')).toBe('true');

    const handle = container.querySelector('[data-heelslide-handle]') as HTMLElement;
    expect(handle).not.toBeNull();

    // Trigger pointerdown
    act(() => {
      handle.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 0, clientY: 0 }));
    });

    expect(rootElement.getAttribute('aria-valuenow')).toBe('0');
    expect(onUnlock).not.toHaveBeenCalled();

    unmount();
  });

  it('should track pointer movement and unlock upon completion', () => {
    const onUnlock = vi.fn();
    const onProgress = vi.fn();

    const { container, unmount } = renderComponent({
      width: 200,
      height: 100,
      heels: 1,
      tolerance: 50,
      onUnlock,
      onProgress
    });

    const rootElement = container.firstElementChild as HTMLElement;
    const trackPath = container.querySelector('path[data-heelslide-track="background"]')!;
    const d = trackPath.getAttribute('d') || '';

    // Extract start coordinates from "M x y"
    const match = /M\s*([\d.-]+)\s+([\d.-]+)/.exec(d);
    expect(match).not.toBeNull();
    const startX = parseFloat(match![1]!);
    const startY = parseFloat(match![2]!);

    // Mock bounding rect
    rootElement.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      right: 200,
      bottom: 100,
      width: 200,
      height: 100,
      x: 0,
      y: 0,
      toJSON: () => {}
    });

    rootElement.setPointerCapture = vi.fn();
    rootElement.releasePointerCapture = vi.fn();

    // Start gesture
    act(() => {
      rootElement.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          clientX: startX,
          clientY: startY,
          pointerId: 1
        })
      );
    });

    expect(rootElement.getAttribute('data-state')).toBe('active');
    expect(rootElement.setPointerCapture).toHaveBeenCalledWith(1);

    // Extract all points from path
    const pointsRegex = /[ML]\s*([\d.-]+)\s+([\d.-]+)/g;
    const points: Array<{ x: number; y: number }> = [];
    let ptMatch: RegExpExecArray | null;
    while ((ptMatch = pointsRegex.exec(d)) !== null) {
      points.push({ x: parseFloat(ptMatch[1]!), y: parseFloat(ptMatch[2]!) });
    }

    // Move to each vertex
    for (let i = 1; i < points.length; i++) {
      act(() => {
        rootElement.dispatchEvent(
          new PointerEvent('pointermove', {
            bubbles: true,
            clientX: points[i]!.x,
            clientY: points[i]!.y,
            pointerId: 1
          })
        );
      });
    }

    // End gesture
    const lastPoint = points[points.length - 1]!;
    act(() => {
      rootElement.dispatchEvent(
        new PointerEvent('pointerup', {
          bubbles: true,
          clientX: lastPoint.x,
          clientY: lastPoint.y,
          pointerId: 1
        })
      );
    });

    expect(rootElement.getAttribute('data-state')).toBe('unlocked');
    expect(rootElement.getAttribute('aria-valuenow')).toBe('100');
    expect(onUnlock).toHaveBeenCalled();

    unmount();
  });

  it('should reset on pointer cancel', () => {
    const onReset = vi.fn();
    const { container, unmount } = renderComponent({
      width: 200,
      height: 100,
      heels: 1,
      onReset
    });

    const rootElement = container.firstElementChild as HTMLElement;
    const trackPath = container.querySelector('path[data-heelslide-track="background"]')!;
    const match = /M\s*([\d.-]+)\s+([\d.-]+)/.exec(trackPath.getAttribute('d') || '');
    const startX = parseFloat(match![1]!);
    const startY = parseFloat(match![2]!);

    rootElement.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      right: 200,
      bottom: 100,
      width: 200,
      height: 100,
      x: 0,
      y: 0,
      toJSON: () => {}
    });
    rootElement.setPointerCapture = vi.fn();
    rootElement.releasePointerCapture = vi.fn();

    act(() => {
      rootElement.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          clientX: startX,
          clientY: startY,
          pointerId: 1
        })
      );
    });

    expect(rootElement.getAttribute('data-state')).toBe('active');

    act(() => {
      rootElement.dispatchEvent(
        new PointerEvent('pointercancel', {
          bubbles: true,
          clientX: startX,
          clientY: startY,
          pointerId: 1
        })
      );
    });

    expect(rootElement.getAttribute('data-state')).toBe('idle');
    expect(rootElement.getAttribute('aria-valuenow')).toBe('0');
    expect(onReset).toHaveBeenCalled();

    unmount();
  });
});
