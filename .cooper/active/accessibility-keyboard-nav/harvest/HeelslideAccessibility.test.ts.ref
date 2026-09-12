// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Heelslide from '../src/Heelslide.vue';
import type { TrackPath } from '@heelslide/core';

describe('<Heelslide /> Vue Accessibility, Live Region & Slots', () => {
  const customTrack: TrackPath = {
    points: [
      { x: 10, y: 20 },
      { x: 100, y: 20 },
      { x: 100, y: 120 }
    ],
    segments: [
      {
        start: { x: 10, y: 20 },
        end: { x: 100, y: 20 },
        direction: 'horizontal',
        length: 90
      },
      {
        start: { x: 100, y: 20 },
        end: { x: 100, y: 120 },
        direction: 'vertical',
        length: 100
      }
    ],
    totalLength: 190,
    heelCount: 1
  };

  it('exposes WAI-ARIA slider attributes and keyshortcuts on the root container', () => {
    const wrapper = mount(Heelslide, {
      props: {
        track: customTrack,
        ariaLabel: 'Security Verification Gate',
        ariaDescribedBy: 'gate-hint'
      }
    });

    const root = wrapper.find('[data-heelslide-container]');
    expect(root.exists()).toBe(true);
    expect(root.attributes('role')).toBe('slider');
    expect(root.attributes('tabindex')).toBe('0');
    expect(root.attributes('aria-label')).toBe('Security Verification Gate');
    expect(root.attributes('aria-describedby')).toBe('gate-hint');
    expect(root.attributes('aria-keyshortcuts')).toContain('ArrowRight');
    expect(root.attributes('aria-valuemin')).toBe('0');
    expect(root.attributes('aria-valuemax')).toBe('100');
    expect(root.attributes('aria-valuenow')).toBe('0');
    expect(root.attributes('aria-valuetext')).toBeDefined();
  });

  it('renders visually-hidden live region for screen readers and supports #announcer slot', async () => {
    const wrapper = mount(Heelslide, {
      props: { track: customTrack }
    });

    const liveRegion = wrapper.find('[data-heelslide-live-region]');
    expect(liveRegion.exists()).toBe(true);
    expect(liveRegion.attributes('role')).toBe('status');
    expect(liveRegion.attributes('aria-live')).toBe('polite');
    expect(liveRegion.attributes('aria-atomic')).toBe('true');
    expect(liveRegion.text()).toBeTruthy();

    // With custom announcer slot
    const customWrapper = mount(Heelslide, {
      props: { track: customTrack },
      slots: {
        announcer: '<span class="custom-announcer">Live: {{ params.message }}</span>'
      }
    });

    const customLive = customWrapper.find('.custom-announcer');
    expect(customLive.exists()).toBe(true);
    expect(customLive.text()).toContain('Live:');
  });

  it('renders accessible fallback button and dialog when accessibleFallback="dialog"', async () => {
    const wrapper = mount(Heelslide, {
      props: {
        track: customTrack,
        accessibleFallback: 'dialog',
        accessibleButtonText: 'Accessible Verification'
      }
    });

    const fallbackBtn = wrapper.find('[data-heelslide-fallback-button]');
    expect(fallbackBtn.exists()).toBe(true);
    expect(fallbackBtn.text()).toBe('Accessible Verification');

    // Clicking trigger opens dialog
    await fallbackBtn.trigger('click');
    expect(wrapper.emitted('fallbackOpen')).toBeTruthy();

    const dialog = wrapper.find('[data-heelslide-dialog]');
    expect(dialog.exists()).toBe(true);
    expect(dialog.attributes('role')).toBe('dialog');
    expect(dialog.attributes('aria-modal')).toBe('true');

    // Confirm button unlocks gate
    const confirmBtn = wrapper.find('[data-heelslide-dialog-confirm]');
    expect(confirmBtn.exists()).toBe(true);
    await confirmBtn.trigger('click');

    expect(wrapper.emitted('unlock')).toBeTruthy();
    expect(wrapper.find('[data-heelslide-dialog]').exists()).toBe(false);
  });

  it('supports custom #fallback slot', async () => {
    const wrapper = mount(Heelslide, {
      props: {
        track: customTrack,
        accessibleFallback: 'dialog'
      },
      slots: {
        fallback: `
          <template #fallback="{ isOpen, confirm, cancel }">
            <div v-if="isOpen" class="custom-modal">
              <button class="custom-confirm" @click="confirm">Approve</button>
              <button class="custom-cancel" @click="cancel">Dismiss</button>
            </div>
          </template>
        `
      }
    });

    const fallbackBtn = wrapper.find('[data-heelslide-fallback-button]');
    await fallbackBtn.trigger('click');

    const customModal = wrapper.find('.custom-modal');
    expect(customModal.exists()).toBe(true);

    const cancelBtn = wrapper.find('.custom-cancel');
    await cancelBtn.trigger('click');
    expect(wrapper.find('.custom-modal').exists()).toBe(false);
  });

  it('handles keyboard navigation on container (@keydown)', async () => {
    const wrapper = mount(Heelslide, {
      props: { track: customTrack }
    });

    const root = wrapper.find('[data-heelslide-container]');

    // ArrowRight advances step
    await root.trigger('keydown', { key: 'ArrowRight' });
    expect(Number(root.attributes('aria-valuenow'))).toBeGreaterThan(0);

    // Escape resets
    await root.trigger('keydown', { key: 'Escape' });
    expect(root.attributes('aria-valuenow')).toBe('0');
  });
});
