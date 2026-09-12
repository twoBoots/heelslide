// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Heelslide from '../src/Heelslide.vue';

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

describe('Vue adapter — WCAG 2.1.1 keyboard baseline', () => {
  it('declares exactly one slider element', () => {
    const wrapper = mount(Heelslide, { props: { width: 320, height: 160 } });
    expect(wrapper.findAll('[role="slider"]')).toHaveLength(1);
    wrapper.unmount();
  });

  it('advances progress when ArrowRight is pressed on the slider', async () => {
    const wrapper = mount(Heelslide, { props: { width: 320, height: 160 } });
    const slider = wrapper.find('[role="slider"]');

    expect(slider.attributes('aria-valuenow')).toBe('0');
    await slider.trigger('keydown', { key: 'ArrowRight' });
    expect(Number(slider.attributes('aria-valuenow'))).toBeGreaterThan(0);

    wrapper.unmount();
  });

  it('exposes aria-disabled when disabled, matching React and Svelte', () => {
    const wrapper = mount(Heelslide, { props: { width: 320, height: 160, disabled: true } });
    const slider = wrapper.find('[role="slider"]');

    expect(slider.attributes('aria-disabled')).toBe('true');

    wrapper.unmount();
  });
});
