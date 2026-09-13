// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount } from 'svelte';
import Heelslide from './Heelslide.svelte';

/**
 * Slider identity and ARIA completeness for the Svelte adapter.
 *
 * This package post-dates the superseded accessibility-fallback track entirely, so it received
 * none of that work. These specs bring it to parity with React and Vue in the same landing.
 */

describe('Svelte slider semantics', () => {
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
    return target.querySelector('[data-heelslide-container]') as HTMLElement;
  }

  it('declares exactly one slider, on the container', () => {
    const container = render();
    const sliders = target.querySelectorAll('[role="slider"]');

    expect(sliders).toHaveLength(1);
    expect(sliders[0]).toBe(container);
  });

  it('leaves the handle presentational', () => {
    render();
    const handle = target.querySelector('.heelslide-handle');

    expect(handle).not.toBeNull();
    expect(handle?.getAttribute('role')).not.toBe('slider');
    expect(handle?.hasAttribute('tabindex')).toBe(false);
    expect(handle?.hasAttribute('aria-valuenow')).toBe(false);
  });

  it('is focusable when enabled', () => {
    const container = render();
    expect(container.getAttribute('tabindex')).toBe('0');
  });

  it('is removed from the tab order when disabled', () => {
    const container = render({ disabled: true });
    expect(container.getAttribute('tabindex')).toBe('-1');
    expect(container.getAttribute('aria-disabled')).toBe('true');
  });

  it('retains the value attributes', () => {
    const container = render();

    expect(container.getAttribute('aria-valuemin')).toBe('0');
    expect(container.getAttribute('aria-valuemax')).toBe('100');
    expect(container.getAttribute('aria-valuenow')).toBe('0');
    expect(container.hasAttribute('aria-label')).toBe(true);
  });

  it('describes progress, orientation and key shortcuts', () => {
    const container = render();

    expect(container.getAttribute('aria-valuetext')).toMatch(/0%/);
    expect(['horizontal', 'vertical']).toContain(container.getAttribute('aria-orientation'));
    expect(container.getAttribute('aria-keyshortcuts') ?? '').toContain('ArrowRight');
  });

  it('points aria-describedby at the path description', () => {
    const container = render();
    const id = container.getAttribute('aria-describedby');

    expect(id).toBeTruthy();
    expect(target.querySelector(`#${id}`)?.textContent ?? '').toMatch(/Security gate/i);
  });

  it('renders a polite, atomic live region', () => {
    render();
    const region = target.querySelector('[data-heelslide-live-region]');

    expect(region).not.toBeNull();
    expect(region?.getAttribute('role')).toBe('status');
    expect(region?.getAttribute('aria-live')).toBe('polite');
    expect(region?.getAttribute('aria-atomic')).toBe('true');
  });

  it('omits keyboard affordances in custom fallback mode', () => {
    const container = render({ accessibleFallback: 'custom' });

    expect(container.hasAttribute('aria-keyshortcuts')).toBe(false);
    expect(target.querySelector('[data-heelslide-live-region]')).toBeNull();
  });
});
