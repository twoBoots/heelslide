// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Heelslide from '../src/Heelslide.vue';
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
describe('<Heelslide /> pointer capture failure handling (Vue)', () => {
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
  function mountWithHostileCapture(
    opts: { captureThrows?: boolean; releaseThrows?: boolean; props?: Record<string, unknown> } = {}
  ) {
    const { captureThrows = false, releaseThrows = false, props = {} } = opts;
    const wrapper = mount(Heelslide, { props: { track, tolerance: 24, ...props } });
    const container = wrapper.element as HTMLElement;
    container.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 300, height: 200, right: 300, bottom: 200, x: 0, y: 0, toJSON: () => {} }) as DOMRect;

    const el = wrapper.find('.heelslide-handle').element as HTMLElement;
    el.setPointerCapture = vi.fn(() => {
      if (captureThrows) throw new Error('pointer capture unavailable');
    });
    el.releasePointerCapture = vi.fn(() => {
      if (releaseThrows) throw new Error('pointer release unavailable');
    });

    return { wrapper, el };
  }

  it('should still start the gesture when setPointerCapture throws', async () => {
    const { wrapper, el } = mountWithHostileCapture({ captureThrows: true });

    dispatchPointer(el, 'pointerdown', { clientX: 0, clientY: 50, pointerId: 1 });
    await wrapper.vm.$nextTick();

    expect(el.setPointerCapture).toHaveBeenCalled();
    expect(wrapper.attributes('data-state')).toBe('active');

    wrapper.unmount();
  });

  it('should still end the gesture when releasePointerCapture throws', async () => {
    const { wrapper, el } = mountWithHostileCapture({ releaseThrows: true });

    dispatchPointer(el, 'pointerdown', { clientX: 0, clientY: 50, pointerId: 1 });
    dispatchPointer(el, 'pointerup', { clientX: 40, clientY: 50, pointerId: 1 });
    await wrapper.vm.$nextTick();

    expect(el.releasePointerCapture).toHaveBeenCalled();
    expect(wrapper.attributes('data-state')).not.toBe('active');

    wrapper.unmount();
  });

  it('should still cancel the gesture when releasePointerCapture throws', async () => {
    const { wrapper, el } = mountWithHostileCapture({ releaseThrows: true });

    dispatchPointer(el, 'pointerdown', { clientX: 0, clientY: 50, pointerId: 1 });
    dispatchPointer(el, 'pointercancel', { clientX: 40, clientY: 50, pointerId: 1 });
    await wrapper.vm.$nextTick();

    expect(el.releasePointerCapture).toHaveBeenCalled();
    expect(wrapper.attributes('data-state')).not.toBe('active');

    wrapper.unmount();
  });

  it('should ignore pointer events entirely while disabled', async () => {
    const { wrapper, el } = mountWithHostileCapture({ props: { disabled: true } });

    dispatchPointer(el, 'pointerdown', { clientX: 0, clientY: 50, pointerId: 1 });
    await wrapper.vm.$nextTick();
    expect(wrapper.attributes('data-state')).not.toBe('active');

    dispatchPointer(el, 'pointercancel', { clientX: 0, clientY: 50, pointerId: 1 });
    await wrapper.vm.$nextTick();
    expect(wrapper.attributes('data-state')).not.toBe('active');

    wrapper.unmount();
  });
});
