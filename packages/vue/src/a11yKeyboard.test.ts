// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Heelslide from './Heelslide.vue';

/** Key bindings for the Vue adapter — WCAG 2.2 SC 2.1.1 and 2.1.2. */

const props = { width: 320, height: 160 };

function harness(extra: Record<string, unknown> = {}) {
  const wrapper = mount(Heelslide, { props: { ...props, ...extra }, attachTo: document.body });
  const slider = () => wrapper.find('[role="slider"]');

  return {
    wrapper,
    slider,
    async press(key: string) {
      await slider().trigger('keydown', { key });
    },
    progress() {
      return Number(slider().attributes('aria-valuenow'));
    },
    unmount() {
      wrapper.unmount();
    }
  };
}

describe('Vue keyboard navigation', () => {
  it('advances on ArrowRight and ArrowDown', async () => {
    for (const key of ['ArrowRight', 'ArrowDown']) {
      const h = harness();
      await h.press(key);
      expect(h.progress()).toBeGreaterThan(0);
      h.unmount();
    }
  });

  it('retreats on ArrowLeft and ArrowUp', async () => {
    for (const key of ['ArrowLeft', 'ArrowUp']) {
      const h = harness();
      await h.press('ArrowRight');
      await h.press('ArrowRight');
      const advanced = h.progress();

      await h.press(key);
      expect(h.progress()).toBeLessThan(advanced);
      h.unmount();
    }
  });

  it('resets to the start on Home', async () => {
    const h = harness();

    await h.press('ArrowRight');
    expect(h.progress()).toBeGreaterThan(0);

    await h.press('Home');
    expect(h.progress()).toBe(0);

    h.unmount();
  });

  it('leaves End unbound', async () => {
    const h = harness();

    await h.press('ArrowRight');
    const before = h.progress();

    await h.press('End');
    expect(h.progress()).toBe(before);

    h.unmount();
  });

  it('emits unlock on Enter once the destination is reached', async () => {
    const h = harness();

    for (let i = 0; i < 12; i += 1) await h.press('ArrowRight');
    await h.press('Enter');

    expect(h.wrapper.emitted('unlock')).toBeTruthy();
    h.unmount();
  });

  it('emits unlock on Space once the destination is reached', async () => {
    const h = harness();

    for (let i = 0; i < 12; i += 1) await h.press('ArrowRight');
    await h.press(' ');

    expect(h.wrapper.emitted('unlock')).toBeTruthy();
    h.unmount();
  });

  it('cancels on Escape', async () => {
    const h = harness();

    await h.press('ArrowRight');
    await h.press('Escape');

    expect(h.progress()).toBe(0);
    h.unmount();
  });

  it('is inert when disabled', async () => {
    const h = harness({ disabled: true });

    await h.press('ArrowRight');
    expect(h.progress()).toBe(0);

    h.unmount();
  });

  it('binds no handlers in custom fallback mode', async () => {
    const h = harness({ accessibleFallback: 'custom' });

    await h.press('ArrowRight');
    expect(h.progress()).toBe(0);

    h.unmount();
  });

  it('emits announcement events as milestones occur', async () => {
    const h = harness();

    await h.press('ArrowRight');

    const emitted = h.wrapper.emitted('announcement');
    expect(emitted).toBeTruthy();

    const first = emitted?.[0]?.[0] as { type: string } | undefined;
    expect(first?.type).toBeTruthy();

    h.unmount();
  });

  it('updates the live region text as milestones occur', async () => {
    const h = harness();

    await h.press('ArrowRight');

    expect(h.wrapper.find('[data-heelslide-live-region]').text().length).toBeGreaterThan(0);

    h.unmount();
  });
});
