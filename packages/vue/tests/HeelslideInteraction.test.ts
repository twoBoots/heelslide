// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Heelslide from '../src/Heelslide.vue';
import type { TrackPath } from '@heelslide/core';

describe('<Heelslide /> Pointer Interactions & Lifecycle', () => {
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

  it('handles complete drag gesture with pointer capture, emits, and callback props', async () => {
    const onUnlock = vi.fn();
    const onReset = vi.fn();
    const onProgress = vi.fn();
    const onStateChange = vi.fn();

    const wrapper = mount(Heelslide, {
      props: {
        track: customTrack,
        tolerance: 20,
        onUnlock,
        onReset,
        onProgress,
        onStateChange
      }
    });

    const container = wrapper.element as HTMLElement;
    mockContainerRect(container);

    const handle = wrapper.find('.heelslide-handle');
    const handleEl = handle.element as HTMLElement;

    // Mock pointer capture functions
    const setPointerCapture = vi.fn();
    const releasePointerCapture = vi.fn();
    handleEl.setPointerCapture = setPointerCapture;
    handleEl.releasePointerCapture = releasePointerCapture;

    // 1. Pointer Down at (0, 50)
    dispatchPointer(handleEl, 'pointerdown', { clientX: 0, clientY: 50, pointerId: 42 });

    expect(setPointerCapture).toHaveBeenCalledWith(42);
    expect(wrapper.emitted('stateChange')?.[0]).toEqual(['active']);
    expect(onStateChange).toHaveBeenCalledWith('active');
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).toContain('heelslide-active');

    // 2. Pointer Move along segment 0 to (50, 50)
    dispatchPointer(handleEl, 'pointermove', {
      clientX: 50,
      clientY: 50,
      pointerId: 42
    });

    expect(onProgress).toHaveBeenCalled();
    expect(wrapper.emitted('progress')).toBeTruthy();

    // 3. Pointer Move to heel corner (100, 50)
    dispatchPointer(handleEl, 'pointermove', {
      clientX: 100,
      clientY: 50,
      pointerId: 42
    });

    // 4. Pointer Move to destination (100, 150)
    dispatchPointer(handleEl, 'pointermove', {
      clientX: 100,
      clientY: 150,
      pointerId: 42
    });

    // 5. Pointer Up to complete unlock
    dispatchPointer(handleEl, 'pointerup', {
      clientX: 100,
      clientY: 150,
      pointerId: 42
    });

    expect(releasePointerCapture).toHaveBeenCalledWith(42);
    expect(onUnlock).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted('unlock')).toHaveLength(1);
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).toContain('heelslide-unlocked');
  });

  it('triggers reset on premature pointerup', async () => {
    const onReset = vi.fn();

    const wrapper = mount(Heelslide, {
      props: {
        track: customTrack,
        onReset
      }
    });

    mockContainerRect(wrapper.element as HTMLElement);
    const handle = wrapper.find('.heelslide-handle');
    const handleEl = handle.element as HTMLElement;
    handleEl.setPointerCapture = vi.fn();
    handleEl.releasePointerCapture = vi.fn();

    dispatchPointer(handleEl, 'pointerdown', { clientX: 0, clientY: 50, pointerId: 1 });
    dispatchPointer(handleEl, 'pointermove', { clientX: 50, clientY: 50, pointerId: 1 });

    // Release halfway
    dispatchPointer(handleEl, 'pointerup', { clientX: 50, clientY: 50, pointerId: 1 });

    expect(onReset).toHaveBeenCalled();
    expect(wrapper.emitted('reset')).toBeTruthy();
    expect(wrapper.classes()).not.toContain('heelslide-active');
  });

  it('triggers reset on pointercancel', async () => {
    const onReset = vi.fn();

    const wrapper = mount(Heelslide, {
      props: {
        track: customTrack,
        onReset
      }
    });

    mockContainerRect(wrapper.element as HTMLElement);
    const handle = wrapper.find('.heelslide-handle');
    const handleEl = handle.element as HTMLElement;
    handleEl.setPointerCapture = vi.fn();
    handleEl.releasePointerCapture = vi.fn();

    dispatchPointer(handleEl, 'pointerdown', { clientX: 0, clientY: 50, pointerId: 1 });
    dispatchPointer(handleEl, 'pointercancel', { clientX: 20, clientY: 50, pointerId: 1 });

    expect(onReset).toHaveBeenCalled();
    expect(wrapper.emitted('reset')).toBeTruthy();
  });

  it('ignores pointer events when disabled', async () => {
    const onStateChange = vi.fn();

    const wrapper = mount(Heelslide, {
      props: {
        track: customTrack,
        disabled: true,
        onStateChange
      }
    });

    mockContainerRect(wrapper.element as HTMLElement);
    const handle = wrapper.find('.heelslide-handle');
    const handleEl = handle.element as HTMLElement;

    dispatchPointer(handleEl, 'pointerdown', { clientX: 0, clientY: 50, pointerId: 1 });

    expect(onStateChange).not.toHaveBeenCalled();
    expect(wrapper.emitted('stateChange')).toBeFalsy();
    expect(wrapper.classes()).toContain('heelslide-disabled');
  });

  it('tears down active gesture safely on unmount', async () => {
    const onReset = vi.fn();

    const wrapper = mount(Heelslide, {
      props: {
        track: customTrack,
        onReset
      }
    });

    mockContainerRect(wrapper.element as HTMLElement);
    const handle = wrapper.find('.heelslide-handle');
    const handleEl = handle.element as HTMLElement;
    handleEl.setPointerCapture = vi.fn();
    handleEl.releasePointerCapture = vi.fn();

    dispatchPointer(handleEl, 'pointerdown', { clientX: 0, clientY: 50, pointerId: 1 });

    // Unmount while dragging
    wrapper.unmount();
    expect(onReset).toHaveBeenCalled();
  });

  it('exposes imperative controls via template ref', async () => {
    const wrapper = mount(Heelslide, {
      props: { track: customTrack }
    });

    const vm = wrapper.vm as any;
    expect(typeof vm.reset).toBe('function');
    expect(typeof vm.regeneratePath).toBe('function');
    expect(vm.state).toBe('idle');
    expect(vm.progress).toBe(0);

    // Call regeneratePath
    const newTrack = vm.regeneratePath({ heels: 3 });
    expect(newTrack.heelCount).toBe(3);
  });
});
