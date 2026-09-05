// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { VERSION, Heelslide, useHeelslide } from '../src/index';

describe('@heelslide/vue Public API exports & Integration', () => {
  it('exports package version, Heelslide component, and useHeelslide composable', () => {
    expect(VERSION).toBe('0.1.0');
    expect(Heelslide).toBeDefined();
    expect(typeof useHeelslide).toBe('function');
  });

  it('can instantiate useHeelslide directly from barrel export', () => {
    const { state, progress, track } = useHeelslide();
    expect(state.value).toBe('idle');
    expect(progress.value).toBe(0);
    expect(track.value.points.length).toBeGreaterThan(1);
  });

  it('can mount Heelslide component directly from barrel export', () => {
    const wrapper = mount(Heelslide, {
      props: {
        bounds: { width: 320, height: 160 }
      }
    });

    expect(wrapper.classes()).toContain('heelslide-container');
    expect(wrapper.find('svg.heelslide-svg').exists()).toBe(true);
    expect(wrapper.find('.heelslide-handle').exists()).toBe(true);
  });
});
