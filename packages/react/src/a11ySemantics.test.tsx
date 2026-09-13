/** @vitest-environment jsdom */
// @ts-expect-error React testing environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { describe, it, expect } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Heelslide } from './Heelslide.js';
import type { HeelslideProps } from './types.js';

/**
 * Slider identity and ARIA completeness for the React adapter.
 *
 * The slider contract lives on the container. This adapter already declared the role there;
 * what it lacked was focusability, which made the declared slider unreachable by keyboard.
 */

function render(props: HeelslideProps = {}) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  act(() => {
    root.render(React.createElement(Heelslide, props));
  });

  return {
    host,
    slider: host.querySelector('[data-heelslide-container]') as HTMLElement,
    unmount() {
      act(() => root.unmount());
      host.remove();
    }
  };
}

describe('React slider element normalization', () => {
  it('declares exactly one slider, on the container', () => {
    const { host, slider, unmount } = render({ width: 320, height: 160 });

    const sliders = host.querySelectorAll('[role="slider"]');
    expect(sliders).toHaveLength(1);
    expect(sliders[0]).toBe(slider);

    unmount();
  });

  it('keeps the handle presentational', () => {
    const { host, unmount } = render({ width: 320, height: 160 });
    const handle = host.querySelector('[data-heelslide-handle]');

    expect(handle).not.toBeNull();
    expect(handle?.getAttribute('role')).not.toBe('slider');
    expect(handle?.hasAttribute('tabindex')).toBe(false);
    expect(handle?.hasAttribute('aria-valuenow')).toBe(false);

    unmount();
  });
});

describe('React ARIA slider semantics', () => {
  it('is focusable when enabled and removed from the tab order when disabled', () => {
    const enabled = render({ width: 320, height: 160 });
    expect(enabled.slider.getAttribute('tabindex')).toBe('0');
    enabled.unmount();

    const disabled = render({ width: 320, height: 160, disabled: true });
    expect(disabled.slider.getAttribute('tabindex')).toBe('-1');
    disabled.unmount();
  });

  it('retains the value attributes it already declared', () => {
    const { slider, unmount } = render({ width: 320, height: 160 });

    expect(slider.getAttribute('role')).toBe('slider');
    expect(slider.getAttribute('aria-valuemin')).toBe('0');
    expect(slider.getAttribute('aria-valuemax')).toBe('100');
    expect(slider.getAttribute('aria-valuenow')).toBe('0');
    expect(slider.hasAttribute('aria-label')).toBe(true);

    unmount();
  });

  it('describes progress and the next direction in aria-valuetext', () => {
    const { slider, unmount } = render({ width: 320, height: 160 });

    const text = slider.getAttribute('aria-valuetext');
    expect(text).toBeTruthy();
    expect(text).toMatch(/0%/);

    unmount();
  });

  it('reports orientation from the active segment', () => {
    const { slider, unmount } = render({ width: 320, height: 160 });

    expect(['horizontal', 'vertical']).toContain(slider.getAttribute('aria-orientation'));

    unmount();
  });

  it('enumerates its key bindings', () => {
    const { slider, unmount } = render({ width: 320, height: 160 });

    const shortcuts = slider.getAttribute('aria-keyshortcuts') ?? '';
    expect(shortcuts).toContain('ArrowRight');
    expect(shortcuts).toContain('Escape');

    unmount();
  });

  it('points aria-describedby at the path description', () => {
    const { host, slider, unmount } = render({ width: 320, height: 160 });

    const id = slider.getAttribute('aria-describedby');
    expect(id).toBeTruthy();

    const description = host.querySelector(`#${id}`);
    expect(description?.textContent ?? '').toMatch(/Security gate/i);

    unmount();
  });

  it('omits keyboard affordances in custom fallback mode', () => {
    const { host, slider, unmount } = render({
      width: 320,
      height: 160,
      accessibleFallback: 'custom'
    });

    expect(slider.hasAttribute('aria-keyshortcuts')).toBe(false);
    expect(host.querySelector('[data-heelslide-live-region]')).toBeNull();

    unmount();
  });
});

describe('React live region', () => {
  it('renders a polite, atomic status region', () => {
    const { host, unmount } = render({ width: 320, height: 160 });
    const region = host.querySelector('[data-heelslide-live-region]');

    expect(region).not.toBeNull();
    expect(region?.getAttribute('role')).toBe('status');
    expect(region?.getAttribute('aria-live')).toBe('polite');
    expect(region?.getAttribute('aria-atomic')).toBe('true');

    unmount();
  });

  it('never announces assertively', () => {
    const { host, unmount } = render({ width: 320, height: 160 });
    const region = host.querySelector('[data-heelslide-live-region]');

    expect(region?.getAttribute('aria-live')).not.toBe('assertive');

    unmount();
  });
});
