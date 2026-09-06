/** @vitest-environment jsdom */
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

  describe('Feedback & onTurn Component Props', () => {
    it('should trigger onTurn and feedback when navigated via Heelslide component', () => {
      const onTurn = vi.fn();
      const mockVibrate = vi.fn().mockReturnValue(true);
      Object.defineProperty(globalThis, 'navigator', {
        value: { vibrate: mockVibrate },
        configurable: true,
        writable: true
      });

      const { container, unmount } = renderComponent({
        width: 300,
        height: 150,
        heels: 1,
        seed: 42,
        tolerance: 30,
        haptics: true,
        sound: false,
        onTurn
      });

      const rootElement = container.firstElementChild as HTMLElement;
      const trackPath = container.querySelector('path[data-heelslide-track="background"]')!;
      const d = trackPath.getAttribute('d') || '';

      const pointsRegex = /[ML]\s*([\d.-]+)\s+([\d.-]+)/g;
      const points: Array<{ x: number; y: number }> = [];
      let ptMatch: RegExpExecArray | null;
      while ((ptMatch = pointsRegex.exec(d)) !== null) {
        points.push({ x: parseFloat(ptMatch[1]!), y: parseFloat(ptMatch[2]!) });
      }

      rootElement.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        right: 300,
        bottom: 150,
        width: 300,
        height: 150,
        x: 0,
        y: 0,
        toJSON: () => {}
      });
      rootElement.setPointerCapture = vi.fn();
      rootElement.releasePointerCapture = vi.fn();

      const startPt = points[0]!;
      const heelPt = points[1]!;
      const endPt = points[2]!;
      const midSecond = {
        x: (heelPt.x + endPt.x) / 2,
        y: (heelPt.y + endPt.y) / 2
      };

      act(() => {
        rootElement.dispatchEvent(
          new PointerEvent('pointerdown', {
            bubbles: true,
            clientX: startPt.x,
            clientY: startPt.y,
            pointerId: 1
          })
        );
      });

      act(() => {
        rootElement.dispatchEvent(
          new PointerEvent('pointermove', {
            bubbles: true,
            clientX: heelPt.x,
            clientY: heelPt.y,
            pointerId: 1
          })
        );
      });

      act(() => {
        rootElement.dispatchEvent(
          new PointerEvent('pointermove', {
            bubbles: true,
            clientX: midSecond.x,
            clientY: midSecond.y,
            pointerId: 1
          })
        );
      });

      expect(onTurn).toHaveBeenCalledWith(0);
      expect(mockVibrate).toHaveBeenCalledWith(15);

      unmount();
    });
  });

  describe('CSS Custom Properties, Heel Theming & Numbered Heels', () => {
    it('should apply expanded CSS variables and fallback chains for track geometry, handle, and heel clearance', () => {
      const { container, unmount } = renderComponent({
        width: 300,
        height: 150,
        heels: 2
      });

      const rootElement = container.firstElementChild as HTMLElement;
      expect(rootElement.style.counterReset).toBe('heelslide-heel');

      // Track path stroke width
      const trackPath = container.querySelector('path[data-heelslide-track="background"]');
      expect(trackPath?.getAttribute('stroke-width')).toBe('var(--heelslide-track-width, 12px)');

      // Start endpoint radius
      const startMarker = container.querySelector('[data-heelslide-start]');
      expect(startMarker?.getAttribute('r')).toBe(
        'var(--heelslide-track-start-radius, var(--heelslide-endpoint-size, var(--heelslide-start-radius, 6px)))'
      );

      // End destination radius
      const endMarker = container.querySelector('[data-heelslide-end]');
      expect(endMarker?.getAttribute('r')).toBe(
        'var(--heelslide-track-end-radius, var(--heelslide-end-radius, var(--heelslide-endpoint-size, 6px)))'
      );

      // Standard (non-target) heel marker attributes (heel 2)
      const heelMarker = container.querySelector('[data-heelslide-heel="2"] circle.heelslide-heel-marker');
      expect(heelMarker).not.toBeNull();
      expect(heelMarker?.getAttribute('r')).toBe(
        'var(--heelslide-track-heel-radius, var(--heelslide-heel-radius, var(--heelslide-heel-size, 4px)))'
      );
      expect(heelMarker?.getAttribute('fill')).toBe('var(--heelslide-heel-bg, var(--heelslide-heel-color, #94a3b8))');
      expect(heelMarker?.getAttribute('stroke')).toBe('var(--heelslide-heel-border-color, transparent)');
      expect(heelMarker?.getAttribute('stroke-width')).toBe('var(--heelslide-heel-border-width, 0px)');

      // Target heel marker attributes (heel 1 on segment 0)
      const targetHeel = container.querySelector('[data-heelslide-heel="1"] circle.heelslide-heel-marker');
      expect(targetHeel).not.toBeNull();
      expect(targetHeel?.getAttribute('fill')).toBe(
        'var(--heelslide-target-heel-bg, var(--heelslide-heel-bg, var(--heelslide-track-active, #3b82f6)))'
      );
      expect(targetHeel?.getAttribute('stroke')).toBe(
        'var(--heelslide-target-heel-border-color, var(--heelslide-heel-border-color, #ffffff))'
      );
      expect(targetHeel?.getAttribute('stroke-width')).toBe(
        'var(--heelslide-target-heel-border-width, var(--heelslide-heel-border-width, 2px))'
      );

      // Heel buffer / clearance ring
      const heelBuffer = container.querySelector('[data-heelslide-heel="1"] circle.heelslide-heel-buffer');
      expect(heelBuffer).not.toBeNull();
      expect(heelBuffer?.getAttribute('stroke-width')).toBe('var(--heelslide-heel-padding, 0px)');

      // Draggable handle styling
      const handle = container.querySelector('[data-heelslide-handle]') as HTMLElement;
      expect(handle).not.toBeNull();
      const handleStyle = handle.getAttribute('style') || '';
      expect(handleStyle).toContain(
        'var(--heelslide-handle-bg, var(--heelslide-slider-bg, var(--heelslide-handle-color, #2563eb)))'
      );
      expect(handleStyle).toContain(
        'var(--heelslide-handle-border-color, var(--heelslide-slider-border-color, #ffffff))'
      );
      expect(handleStyle).toContain('var(--heelslide-handle-size, 32px)');
      expect(handleStyle).toContain('var(--heelslide-handle-shadow, 0 2px 8px rgba(0, 0, 0, 0.15))');

      unmount();
    });

    it('should render numbered heel labels and CSS counter attributes when numberedHeels is enabled', () => {
      const { container, unmount } = renderComponent({
        width: 300,
        height: 150,
        heels: 2,
        numberedHeels: true
      });

      const rootElement = container.firstElementChild as HTMLElement;
      expect(rootElement.style.counterReset).toBe('heelslide-heel');

      const heelGroups = container.querySelectorAll('[data-heelslide-heel]');
      expect(heelGroups.length).toBe(2);

      const firstGroup = heelGroups[0] as SVGGElement;
      expect(firstGroup.style.counterIncrement).toBe('heelslide-heel');

      const textEl = firstGroup.querySelector('text.heelslide-heel-text');
      expect(textEl).not.toBeNull();
      expect(textEl?.textContent).toBe('1');
      expect(textEl?.getAttribute('text-anchor')).toBe('middle');
      expect(textEl?.getAttribute('dominant-baseline')).toBe('central');
      expect(textEl?.getAttribute('font-family')).toBe(
        'var(--heelslide-heel-font-family, system-ui, -apple-system, sans-serif)'
      );
      expect(textEl?.getAttribute('font-size')).toBe('var(--heelslide-heel-font-size, 10px)');
      expect(textEl?.getAttribute('font-weight')).toBe('var(--heelslide-heel-font-weight, 600)');
      // Heel 1 is the active target, so it uses target heel text color
      expect(textEl?.getAttribute('fill')).toBe('var(--heelslide-target-heel-text-color, #ffffff)');

      // Heel 2 is not target, uses standard text color
      const secondGroup = heelGroups[1] as SVGGElement;
      const secondText = secondGroup.querySelector('text.heelslide-heel-text');
      expect(secondText?.textContent).toBe('2');
      expect(secondText?.getAttribute('fill')).toBe(
        'var(--heelslide-heel-text-color, var(--heelslide-heel-color, #475569))'
      );

      unmount();
    });

    it('should mark the active target heel and target goal with data-target="true"', () => {
      const { container, unmount } = renderComponent({
        width: 300,
        height: 150,
        heels: 2
      });

      // At start (segment 0), the first heel is the target
      const firstHeel = container.querySelector('[data-heelslide-heel="1"]');
      expect(firstHeel?.getAttribute('data-target')).toBe('true');
      expect(firstHeel?.classList.contains('heelslide-target')).toBe(true);

      const secondHeel = container.querySelector('[data-heelslide-heel="2"]');
      expect(secondHeel?.getAttribute('data-target')).toBe('false');

      // Goal is not yet the target
      const goal = container.querySelector('[data-heelslide-end-group]');
      expect(goal?.getAttribute('data-target')).toBe('false');

      unmount();
    });

    it('should apply state-driven variables for active dragging and unlocked states', () => {
      // Unlocked state
      const { container: unlockedContainer, unmount: unmountUnlocked } = renderComponent({
        initialState: 'unlocked',
        initialProgress: 1
      });

      const unlockedHandle = unlockedContainer.querySelector('[data-heelslide-handle]') as HTMLElement;
      const unlockedStyle = unlockedHandle.getAttribute('style') || '';
      expect(unlockedStyle).toContain('var(--heelslide-success-color, #10b981)');
      unmountUnlocked();

      // Active state
      const { container: activeContainer, unmount: unmountActive } = renderComponent({
        initialState: 'active',
        initialProgress: 0.1
      });

      const activeHandle = activeContainer.querySelector('[data-heelslide-handle]') as HTMLElement;
      const activeStyle = activeHandle.getAttribute('style') || '';
      expect(activeStyle).toContain(
        'var(--heelslide-handle-active-bg, var(--heelslide-handle-bg, #1d4ed8))'
      );
      expect(activeStyle).toContain('scale(var(--heelslide-handle-active-scale, 1.05))');
      unmountActive();
    });
  });
});

