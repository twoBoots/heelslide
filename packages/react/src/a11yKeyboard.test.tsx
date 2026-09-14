/** @vitest-environment jsdom */
// @ts-expect-error React testing environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { describe, it, expect, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Heelslide } from './Heelslide.js';
import type { HeelslideProps } from './types.js';

/** Key bindings for the React adapter — WCAG 2.2 SC 2.1.1 and 2.1.2. */

function render(props: HeelslideProps = {}) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  act(() => {
    root.render(React.createElement(Heelslide, props));
  });

  const slider = host.querySelector('[data-heelslide-container]') as HTMLElement;

  return {
    host,
    slider,
    press(key: string) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      act(() => {
        slider.dispatchEvent(event);
      });
      return event;
    },
    progress() {
      return Number(slider.getAttribute('aria-valuenow'));
    },
    unmount() {
      act(() => root.unmount());
      host.remove();
    }
  };
}

describe('React keyboard navigation', () => {
  it('advances on ArrowRight and ArrowDown', () => {
    for (const key of ['ArrowRight', 'ArrowDown']) {
      const h = render({ width: 320, height: 160 });
      h.press(key);
      expect(h.progress()).toBeGreaterThan(0);
      h.unmount();
    }
  });

  it('retreats on ArrowLeft and ArrowUp', () => {
    for (const key of ['ArrowLeft', 'ArrowUp']) {
      const h = render({ width: 320, height: 160 });
      h.press('ArrowRight');
      h.press('ArrowRight');
      const advanced = h.progress();

      h.press(key);
      expect(h.progress()).toBeLessThan(advanced);
      h.unmount();
    }
  });

  it('resets to the start on Home', () => {
    const h = render({ width: 320, height: 160 });

    h.press('ArrowRight');
    h.press('ArrowRight');
    expect(h.progress()).toBeGreaterThan(0);

    h.press('Home');
    expect(h.progress()).toBe(0);

    h.unmount();
  });

  it('leaves End unbound so no single keypress bypasses traversal', () => {
    const h = render({ width: 320, height: 160 });

    h.press('ArrowRight');
    const before = h.progress();

    h.press('End');
    expect(h.progress()).toBe(before);

    h.unmount();
  });

  it('unlocks on Enter once the destination is reached', () => {
    const onUnlock = vi.fn();
    const h = render({ width: 320, height: 160, onUnlock });

    for (let i = 0; i < 12; i += 1) h.press('ArrowRight');
    h.press('Enter');

    expect(onUnlock).toHaveBeenCalledTimes(1);
    h.unmount();
  });

  it('unlocks on Space once the destination is reached', () => {
    const onUnlock = vi.fn();
    const h = render({ width: 320, height: 160, onUnlock });

    for (let i = 0; i < 12; i += 1) h.press('ArrowRight');
    h.press(' ');

    expect(onUnlock).toHaveBeenCalledTimes(1);
    h.unmount();
  });

  it('cancels on Escape without trapping focus', () => {
    const h = render({ width: 320, height: 160 });

    h.slider.focus();
    h.press('ArrowRight');
    h.press('Escape');

    expect(h.progress()).toBe(0);
    // No keyboard trap: Escape must not force focus to stay on the widget.
    expect(document.activeElement === h.slider || document.activeElement === document.body).toBe(
      true
    );

    h.unmount();
  });

  it('prevents default for bound keys so the page does not scroll', () => {
    const h = render({ width: 320, height: 160 });

    const bound = h.press('ArrowRight');
    expect(bound.defaultPrevented).toBe(true);

    h.unmount();
  });

  it('leaves unbound keys alone', () => {
    const h = render({ width: 320, height: 160 });

    const unbound = h.press('a');
    expect(unbound.defaultPrevented).toBe(false);

    h.unmount();
  });

  it('is inert when disabled', () => {
    const h = render({ width: 320, height: 160, disabled: true });

    h.press('ArrowRight');
    expect(h.progress()).toBe(0);

    h.unmount();
  });

  it('binds no handlers in custom fallback mode', () => {
    const h = render({ width: 320, height: 160, accessibleFallback: 'custom' });

    h.press('ArrowRight');
    expect(h.progress()).toBe(0);

    h.unmount();
  });
});
