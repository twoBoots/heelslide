// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Heelslide from './Heelslide.svelte';
import type { TrackPath } from '@heelslide/core';

const track: TrackPath = {
  points: [
    { x: 0, y: 50 },
    { x: 100, y: 50 },
    { x: 100, y: 150 }
  ],
  segments: [
    { start: { x: 0, y: 50 }, end: { x: 100, y: 50 }, direction: 'horizontal', length: 100 },
    { start: { x: 100, y: 50 }, end: { x: 100, y: 150 }, direction: 'vertical', length: 100 }
  ],
  totalLength: 200,
  heelCount: 1
};

/**
 * Pointer capture is unavailable or throws in several real environments (detached nodes,
 * revoked pointers, older engines). The component must absorb that rather than tearing down
 * the gesture, so these drive the catch paths directly.
 */
describe('<Heelslide /> pointer capture failure handling (Svelte)', () => {
  let target: HTMLElement;
  let component: ReturnType<typeof mount> | null = null;

  beforeEach(() => {
    target = document.createElement('div');
    document.body.appendChild(target);
  });

  afterEach(() => {
    if (component) {
      unmount(component);
      component = null;
    }
    target.remove();
  });

  function dispatchPointer(
    el: Element,
    type: string,
    opts: { clientX: number; clientY: number; pointerId?: number }
  ): void {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clientX', { value: opts.clientX });
    Object.defineProperty(event, 'clientY', { value: opts.clientY });
    Object.defineProperty(event, 'pointerId', { value: opts.pointerId ?? 1 });
    el.dispatchEvent(event);
  }

  /**
   * `captureThrows` is separate from `releaseThrows` on purpose: the component only attempts a
   * release once a capture succeeded, so making both throw would leave the release path
   * unreached.
   */
  function setup(
    opts: { captureThrows?: boolean; releaseThrows?: boolean; props?: Record<string, unknown> } = {}
  ) {
    const { captureThrows = false, releaseThrows = false, props = {} } = opts;
    component = mount(Heelslide, { target, props: { track, tolerance: 24, ...props } });
    flushSync();

    const container = target.querySelector('.heelslide-container') as HTMLElement;
    container.getBoundingClientRect = () =>
      ({ left: 0, top: 0, right: 300, bottom: 200, width: 300, height: 200, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;

    const handle = target.querySelector('.heelslide-handle') as HTMLElement;
    handle.setPointerCapture = vi.fn(() => {
      if (captureThrows) throw new Error('pointer capture unavailable');
    });
    handle.releasePointerCapture = vi.fn(() => {
      if (releaseThrows) throw new Error('pointer release unavailable');
    });

    return { container, handle };
  }

  it('should still start the gesture when setPointerCapture throws', () => {
    const { container, handle } = setup({ captureThrows: true });

    dispatchPointer(handle, 'pointerdown', { clientX: 0, clientY: 50, pointerId: 1 });
    flushSync();

    expect(handle.setPointerCapture).toHaveBeenCalled();
    expect(container.getAttribute('data-state')).toBe('active');
  });

  it('should still end the gesture when releasePointerCapture throws', () => {
    const { container, handle } = setup({ releaseThrows: true });

    dispatchPointer(handle, 'pointerdown', { clientX: 0, clientY: 50, pointerId: 1 });
    dispatchPointer(handle, 'pointerup', { clientX: 40, clientY: 50, pointerId: 1 });
    flushSync();

    expect(handle.releasePointerCapture).toHaveBeenCalled();
    expect(container.getAttribute('data-state')).not.toBe('active');
  });

  it('should still cancel the gesture when releasePointerCapture throws', () => {
    const { container, handle } = setup({ releaseThrows: true });

    dispatchPointer(handle, 'pointerdown', { clientX: 0, clientY: 50, pointerId: 1 });
    dispatchPointer(handle, 'pointercancel', { clientX: 40, clientY: 50, pointerId: 1 });
    flushSync();

    expect(handle.releasePointerCapture).toHaveBeenCalled();
    expect(container.getAttribute('data-state')).not.toBe('active');
  });

  it('should ignore pointer events entirely while disabled', () => {
    const { container, handle } = setup({ props: { disabled: true } });

    dispatchPointer(handle, 'pointerdown', { clientX: 0, clientY: 50, pointerId: 1 });
    flushSync();
    expect(container.getAttribute('data-state')).not.toBe('active');

    dispatchPointer(handle, 'pointercancel', { clientX: 0, clientY: 50, pointerId: 1 });
    flushSync();
    expect(container.getAttribute('data-state')).not.toBe('active');
  });
});
