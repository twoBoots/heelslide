// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount } from 'svelte';
import Heelslide from '../src/Heelslide.svelte';

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

describe('Svelte adapter — WCAG 2.1.1 keyboard baseline', () => {
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

  function renderSlider(): HTMLElement {
    component = mount(Heelslide, { target, props: { width: 320, height: 160 } });
    return target.querySelector('[role="slider"]') as HTMLElement;
  }

  it('declares exactly one slider element', () => {
    renderSlider();
    expect(target.querySelectorAll('[role="slider"]')).toHaveLength(1);
  });

  it('advances progress when ArrowRight is pressed on the slider', async () => {
    const slider = renderSlider();

    expect(slider.getAttribute('aria-valuenow')).toBe('0');
    slider.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
    );
    await Promise.resolve();

    expect(Number(slider.getAttribute('aria-valuenow'))).toBeGreaterThan(0);
  });
});
