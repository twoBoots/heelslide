// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Heelslide from '../src/Heelslide.svelte';
import type { TrackPath } from '@heelslide/core';

describe('<Heelslide /> Pointer Interactions & Lifecycle', () => {
  let target: HTMLElement;
  let component: any;

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

  function mockContainerRect(container: HTMLElement) {
    container.getBoundingClientRect = () =>
      ({
        left: 0,
        top: 0,
        right: 300,
        bottom: 150,
        width: 300,
        height: 150,
        x: 0,
        y: 0,
        toJSON: () => ({})
      }) as DOMRect;
  }

  function dispatchPointer(
    el: Element,
    type: string,
    opts: { clientX: number; clientY: number; pointerId?: number }
  ) {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clientX', { value: opts.clientX });
    Object.defineProperty(event, 'clientY', { value: opts.clientY });
    Object.defineProperty(event, 'pointerId', { value: opts.pointerId ?? 1 });
    el.dispatchEvent(event);
  }

  it('handles complete drag gesture with pointer capture, callbacks, and unlocked state', () => {
    const onunlock = vi.fn();
    const onreset = vi.fn();
    const onprogress = vi.fn();
    const onstatechange = vi.fn();

    component = mount(Heelslide, {
      target,
      props: {
        track: customTrack,
        tolerance: 20,
        onunlock,
        onreset,
        onprogress,
        onstatechange
      }
    });

    const container = target.querySelector('.heelslide-container') as HTMLElement;
    mockContainerRect(container);

    const handleEl = target.querySelector('.heelslide-handle') as HTMLElement;
    expect(handleEl).not.toBeNull();

    const setPointerCapture = vi.fn();
    const releasePointerCapture = vi.fn();
    handleEl.setPointerCapture = setPointerCapture;
    handleEl.releasePointerCapture = releasePointerCapture;

    // 1. Pointer Down at (0, 50)
    dispatchPointer(handleEl, 'pointerdown', { clientX: 0, clientY: 50, pointerId: 42 });
    flushSync();

    expect(setPointerCapture).toHaveBeenCalledWith(42);
    expect(onstatechange).toHaveBeenCalledWith('active');
    expect(container.classList.contains('heelslide-active')).toBe(true);

    // 2. Pointer Move along segment 0 to (50, 50)
    dispatchPointer(handleEl, 'pointermove', {
      clientX: 50,
      clientY: 50,
      pointerId: 42
    });
    flushSync();

    expect(onprogress).toHaveBeenCalled();

    // 3. Pointer Move to heel corner (100, 50)
    dispatchPointer(handleEl, 'pointermove', {
      clientX: 100,
      clientY: 50,
      pointerId: 42
    });
    flushSync();

    // 4. Pointer Move to destination (100, 150)
    dispatchPointer(handleEl, 'pointermove', {
      clientX: 100,
      clientY: 150,
      pointerId: 42
    });
    flushSync();

    // 5. Pointer Up to complete unlock
    dispatchPointer(handleEl, 'pointerup', {
      clientX: 100,
      clientY: 150,
      pointerId: 42
    });
    flushSync();

    expect(releasePointerCapture).toHaveBeenCalledWith(42);
    expect(onunlock).toHaveBeenCalledTimes(1);
    expect(container.classList.contains('heelslide-unlocked')).toBe(true);
  });

  it('triggers reset on premature pointerup', () => {
    const onreset = vi.fn();

    component = mount(Heelslide, {
      target,
      props: {
        track: customTrack,
        onreset
      }
    });

    const container = target.querySelector('.heelslide-container') as HTMLElement;
    mockContainerRect(container);

    const handleEl = target.querySelector('.heelslide-handle') as HTMLElement;
    handleEl.setPointerCapture = vi.fn();
    handleEl.releasePointerCapture = vi.fn();

    dispatchPointer(handleEl, 'pointerdown', { clientX: 0, clientY: 50, pointerId: 1 });
    flushSync();
    dispatchPointer(handleEl, 'pointermove', { clientX: 50, clientY: 50, pointerId: 1 });
    flushSync();

    // Premature release halfway
    dispatchPointer(handleEl, 'pointerup', { clientX: 50, clientY: 50, pointerId: 1 });
    flushSync();

    expect(onreset).toHaveBeenCalled();
    expect(container.classList.contains('heelslide-active')).toBe(false);
  });

  it('triggers reset on pointercancel', () => {
    const onreset = vi.fn();

    component = mount(Heelslide, {
      target,
      props: {
        track: customTrack,
        onreset
      }
    });

    const container = target.querySelector('.heelslide-container') as HTMLElement;
    mockContainerRect(container);

    const handleEl = target.querySelector('.heelslide-handle') as HTMLElement;
    handleEl.setPointerCapture = vi.fn();
    handleEl.releasePointerCapture = vi.fn();

    dispatchPointer(handleEl, 'pointerdown', { clientX: 0, clientY: 50, pointerId: 1 });
    flushSync();
    dispatchPointer(handleEl, 'pointercancel', { clientX: 20, clientY: 50, pointerId: 1 });
    flushSync();

    expect(onreset).toHaveBeenCalled();
  });

  it('ignores pointer events when disabled is true', () => {
    const onstatechange = vi.fn();

    component = mount(Heelslide, {
      target,
      props: {
        track: customTrack,
        disabled: true,
        onstatechange
      }
    });

    const container = target.querySelector('.heelslide-container') as HTMLElement;
    mockContainerRect(container);

    const handleEl = target.querySelector('.heelslide-handle') as HTMLElement;
    dispatchPointer(handleEl, 'pointerdown', { clientX: 0, clientY: 50, pointerId: 1 });
    flushSync();

    expect(onstatechange).not.toHaveBeenCalled();
    expect(container.classList.contains('heelslide-disabled')).toBe(true);
  });

  it('tears down active gesture safely on unmount', () => {
    const onreset = vi.fn();

    component = mount(Heelslide, {
      target,
      props: {
        track: customTrack,
        onreset
      }
    });

    const container = target.querySelector('.heelslide-container') as HTMLElement;
    mockContainerRect(container);

    const handleEl = target.querySelector('.heelslide-handle') as HTMLElement;
    handleEl.setPointerCapture = vi.fn();
    handleEl.releasePointerCapture = vi.fn();

    dispatchPointer(handleEl, 'pointerdown', { clientX: 0, clientY: 50, pointerId: 1 });
    flushSync();

    // Unmount while active
    unmount(component);
    component = null;

    expect(onreset).toHaveBeenCalled();
  });
});
