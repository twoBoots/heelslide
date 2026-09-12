/** @vitest-environment jsdom */
// @ts-expect-error React testing environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { describe, it, expect } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Heelslide } from '../src/Heelslide.js';
import type { HeelslideProps } from '../src/types.js';

/**
 * WCAG 2.2 SC 2.1.1 (Keyboard) baseline.
 *
 * Documents the defect present on `main`: `role="slider"` is declared but no keyboard handlers
 * are bound anywhere in the package, so the accessibility tree advertises an operable range
 * widget that cannot be operated without a pointer.
 *
 * These specs deliberately locate the slider by `[role="slider"]` rather than by container, so
 * they hold regardless of which element the adapters settle on. On `main` the three adapters
 * disagree: React declares the role on the container div, Vue and Svelte on an SVG `<g>` handle.
 *
 * Expected to FAIL until Phase 3 lands the adapter keyboard bindings.
 */

function renderComponent(props: HeelslideProps = {}) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  act(() => {
    root.render(React.createElement(Heelslide, props));
  });

  return {
    slider: host.querySelector('[role="slider"]') as HTMLElement,
    unmount() {
      act(() => {
        root.unmount();
      });
      host.remove();
    }
  };
}

describe('React adapter — WCAG 2.1.1 keyboard baseline', () => {
  it('declares exactly one slider element', () => {
    const { slider, unmount } = renderComponent({ width: 320, height: 160 });
    expect(slider).not.toBeNull();
    unmount();
  });

  it('makes the slider focusable, since role="slider" promises an operable widget', () => {
    const { slider, unmount } = renderComponent({ width: 320, height: 160 });

    expect(slider.getAttribute('tabindex')).toBe('0');

    unmount();
  });

  it('advances progress when ArrowRight is pressed on the slider', () => {
    const { slider, unmount } = renderComponent({ width: 320, height: 160 });

    expect(slider.getAttribute('aria-valuenow')).toBe('0');
    act(() => {
      slider.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
      );
    });
    expect(Number(slider.getAttribute('aria-valuenow'))).toBeGreaterThan(0);

    unmount();
  });
});
