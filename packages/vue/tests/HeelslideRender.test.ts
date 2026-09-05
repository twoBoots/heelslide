// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Heelslide from '../src/Heelslide.vue';
import type { TrackPath } from '@heelslide/core';

describe('<Heelslide /> SVG Rendering & Styling', () => {
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

  it('renders SVG container, background path, and handle at origin', () => {
    const wrapper = mount(Heelslide, {
      props: {
        track: customTrack,
        bounds: { width: 300, height: 150 }
      }
    });

    expect(wrapper.classes()).toContain('heelslide-container');
    const svg = wrapper.find('svg.heelslide-svg');
    expect(svg.exists()).toBe(true);
    expect(svg.attributes('viewBox')).toBe('0 0 300 150');

    // Background track path
    const bgPath = wrapper.find('path.heelslide-track-bg');
    expect(bgPath.exists()).toBe(true);
    expect(bgPath.attributes('d')).toBe('M 10 20 L 100 20 L 100 120');

    // Progress path
    const progressPath = wrapper.find('path.heelslide-track-progress');
    expect(progressPath.exists()).toBe(true);

    // Heel marker (1 heel vertex at 100, 20)
    const heelMarkers = wrapper.findAll('.heelslide-heel-marker');
    expect(heelMarkers.length).toBe(1);
    expect(heelMarkers[0]!.attributes('cx')).toBe('100');
    expect(heelMarkers[0]!.attributes('cy')).toBe('20');

    // Handle at origin
    const handle = wrapper.find('.heelslide-handle');
    expect(handle.exists()).toBe(true);
    expect(handle.attributes('role')).toBe('slider');
    expect(handle.attributes('aria-valuenow')).toBe('0');
    expect(handle.attributes('aria-valuemin')).toBe('0');
    expect(handle.attributes('aria-valuemax')).toBe('100');
    expect(handle.attributes('aria-label')).toBe('Slide to unlock');

    // Handle circle
    const handleCircle = handle.find('circle');
    expect(handleCircle.exists()).toBe(true);
    expect(handleCircle.attributes('cx')).toBe('10');
    expect(handleCircle.attributes('cy')).toBe('20');
  });

  it('renders slot content inside handle when provided', () => {
    const wrapper = mount(Heelslide, {
      props: { track: customTrack },
      slots: {
        handle: '<span class="custom-icon">👉</span>'
      }
    });

    expect(wrapper.find('.custom-icon').exists()).toBe(true);
    expect(wrapper.find('.custom-icon').text()).toBe('👉');
  });

  it('renders destination marker at track endpoint', () => {
    const wrapper = mount(Heelslide, {
      props: { track: customTrack }
    });

    const endMarker = wrapper.find('.heelslide-end-marker');
    expect(endMarker.exists()).toBe(true);
    expect(endMarker.attributes('cx')).toBe('100');
    expect(endMarker.attributes('cy')).toBe('120');
  });
});
