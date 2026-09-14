// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Heelslide from './Heelslide.vue';

/**
 * Slider identity and ARIA completeness for the Vue adapter.
 *
 * Before this track the role sat on the SVG `<g>` handle. It now sits on the container, matching
 * React and Svelte, which makes the container the single owner of focus, `aria-describedby`,
 * `aria-keyshortcuts` and the live region — and made the suppressed focus indicator fixable
 * rather than merely relocated.
 *
 * Note: an earlier rationale claimed `tabindex` on an SVG `<g>` was unreliable in WebKit. A probe
 * across the CI matrix (`tests/e2e/svg-focus-probe.spec.ts`) found it focusable in all three
 * engines, so that argument was wrong and is not why the role moved.
 */

const props = { width: 320, height: 160 };

describe('Vue slider element normalization', () => {
  it('declares exactly one slider, on the container', () => {
    const wrapper = mount(Heelslide, { props });

    const sliders = wrapper.findAll('[role="slider"]');
    expect(sliders).toHaveLength(1);
    expect(sliders[0]?.attributes('data-heelslide-container')).toBeDefined();

    wrapper.unmount();
  });

  it('leaves the handle presentational', () => {
    const wrapper = mount(Heelslide, { props });
    const handle = wrapper.find('.heelslide-handle');

    expect(handle.exists()).toBe(true);
    expect(handle.attributes('role')).not.toBe('slider');
    expect(handle.attributes('tabindex')).toBeUndefined();
    expect(handle.attributes('aria-valuenow')).toBeUndefined();

    wrapper.unmount();
  });
});

describe('Vue ARIA slider semantics', () => {
  it('is focusable when enabled and removed from the tab order when disabled', () => {
    const enabled = mount(Heelslide, { props });
    expect(enabled.find('[role="slider"]').attributes('tabindex')).toBe('0');
    enabled.unmount();

    const disabled = mount(Heelslide, { props: { ...props, disabled: true } });
    expect(disabled.find('[role="slider"]').attributes('tabindex')).toBe('-1');
    disabled.unmount();
  });

  it('exposes aria-disabled, closing the gap against React and Svelte', () => {
    const wrapper = mount(Heelslide, { props: { ...props, disabled: true } });

    expect(wrapper.find('[role="slider"]').attributes('aria-disabled')).toBe('true');

    wrapper.unmount();
  });

  it('retains the value attributes', () => {
    const wrapper = mount(Heelslide, { props });
    const slider = wrapper.find('[role="slider"]');

    expect(slider.attributes('aria-valuemin')).toBe('0');
    expect(slider.attributes('aria-valuemax')).toBe('100');
    expect(slider.attributes('aria-valuenow')).toBe('0');
    expect(slider.attributes('aria-label')).toBeTruthy();

    wrapper.unmount();
  });

  it('describes progress and next direction in aria-valuetext', () => {
    const wrapper = mount(Heelslide, { props });

    expect(wrapper.find('[role="slider"]').attributes('aria-valuetext')).toMatch(/0%/);

    wrapper.unmount();
  });

  it('reports orientation and key shortcuts', () => {
    const wrapper = mount(Heelslide, { props });
    const slider = wrapper.find('[role="slider"]');

    expect(['horizontal', 'vertical']).toContain(slider.attributes('aria-orientation'));
    expect(slider.attributes('aria-keyshortcuts') ?? '').toContain('ArrowRight');

    wrapper.unmount();
  });

  it('points aria-describedby at the path description', () => {
    const wrapper = mount(Heelslide, { props });
    const id = wrapper.find('[role="slider"]').attributes('aria-describedby');

    expect(id).toBeTruthy();
    expect(wrapper.find(`#${id}`).text()).toMatch(/Security gate/i);

    wrapper.unmount();
  });

  it('omits keyboard affordances in custom fallback mode', () => {
    const wrapper = mount(Heelslide, { props: { ...props, accessibleFallback: 'custom' } });

    expect(wrapper.find('[role="slider"]').attributes('aria-keyshortcuts')).toBeUndefined();
    expect(wrapper.find('[data-heelslide-live-region]').exists()).toBe(false);

    wrapper.unmount();
  });
});

describe('Vue live region', () => {
  it('renders a polite, atomic status region', () => {
    const wrapper = mount(Heelslide, { props });
    const region = wrapper.find('[data-heelslide-live-region]');

    expect(region.exists()).toBe(true);
    expect(region.attributes('role')).toBe('status');
    expect(region.attributes('aria-live')).toBe('polite');
    expect(region.attributes('aria-atomic')).toBe('true');

    wrapper.unmount();
  });
});
