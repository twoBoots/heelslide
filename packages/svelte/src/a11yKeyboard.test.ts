// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Heelslide from './Heelslide.svelte';

/** Key bindings for the Svelte adapter — WCAG 2.2 SC 2.1.1 and 2.1.2. */

describe('Svelte keyboard navigation', () => {
  let target: HTMLElement;
  let component: ReturnType<typeof mount> | undefined;

  beforeEach(() => {
    target = document.createElement('div');
    document.body.appendChild(target);
  });

  afterEach(() => {
    if (component) unmount(component);
    component = undefined;
    target.remove();
  });

  function render(props: Record<string, unknown> = {}) {
    component = mount(Heelslide, {
      target,
      props: { width: 320, height: 160, ...props }
    });
    const slider = target.querySelector('[data-heelslide-container]') as HTMLElement;

    return {
      slider,
      press(key: string) {
        const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
        slider.dispatchEvent(event);
        flushSync();
        return event;
      },
      progress() {
        return Number(slider.getAttribute('aria-valuenow'));
      }
    };
  }

  it('advances on ArrowRight and ArrowDown', () => {
    for (const key of ['ArrowRight', 'ArrowDown']) {
      const h = render();
      h.press(key);
      expect(h.progress()).toBeGreaterThan(0);
      if (component) unmount(component);
      component = undefined;
      target.innerHTML = '';
    }
  });

  it('retreats on ArrowLeft and ArrowUp', () => {
    for (const key of ['ArrowLeft', 'ArrowUp']) {
      const h = render();
      h.press('ArrowRight');
      h.press('ArrowRight');
      const advanced = h.progress();

      h.press(key);
      expect(h.progress()).toBeLessThan(advanced);

      if (component) unmount(component);
      component = undefined;
      target.innerHTML = '';
    }
  });

  it('resets to the start on Home', () => {
    const h = render();

    h.press('ArrowRight');
    expect(h.progress()).toBeGreaterThan(0);

    h.press('Home');
    expect(h.progress()).toBe(0);
  });

  it('leaves End unbound', () => {
    const h = render();

    h.press('ArrowRight');
    const before = h.progress();

    h.press('End');
    expect(h.progress()).toBe(before);
  });

  it('unlocks on Enter once the destination is reached', () => {
    const onUnlock = vi.fn();
    const h = render({ onUnlock });

    for (let i = 0; i < 12; i += 1) h.press('ArrowRight');
    h.press('Enter');

    expect(onUnlock).toHaveBeenCalledTimes(1);
  });

  it('unlocks on Space once the destination is reached', () => {
    const onUnlock = vi.fn();
    const h = render({ onUnlock });

    for (let i = 0; i < 12; i += 1) h.press('ArrowRight');
    h.press(' ');

    expect(onUnlock).toHaveBeenCalledTimes(1);
  });

  it('cancels on Escape', () => {
    const h = render();

    h.press('ArrowRight');
    h.press('Escape');

    expect(h.progress()).toBe(0);
  });

  it('prevents default for bound keys only', () => {
    const h = render();

    expect(h.press('ArrowRight').defaultPrevented).toBe(true);
    expect(h.press('a').defaultPrevented).toBe(false);
  });

  it('is inert when disabled', () => {
    const h = render({ disabled: true });

    h.press('ArrowRight');
    expect(h.progress()).toBe(0);
  });

  it('binds no handlers in custom fallback mode', () => {
    const h = render({ accessibleFallback: 'custom' });

    h.press('ArrowRight');
    expect(h.progress()).toBe(0);
  });

  it('reports announcements through the callback prop', () => {
    const onAnnouncement = vi.fn();
    const h = render({ onAnnouncement });

    h.press('ArrowRight');

    expect(onAnnouncement).toHaveBeenCalled();
  });

  it('updates the live region text as milestones occur', () => {
    const h = render();

    h.press('ArrowRight');

    const region = target.querySelector('[data-heelslide-live-region]');
    expect((region?.textContent ?? '').length).toBeGreaterThan(0);
  });
});
