// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount } from 'svelte';
import Heelslide from '../src/Heelslide.svelte';
import type { TrackPath } from '@heelslide/core';

describe('<Heelslide /> Svelte Component Rendering & Styling', () => {
  let target: HTMLElement;
  let component: any;

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

  beforeEach(() => {
    target = document.createElement('div');
    document.body.appendChild(target);
  });

  afterEach(() => {
    if (component) {
      unmount(component);
      component = null;
    }
    target.remove();
  });

  it('renders SVG container, background path, and handle at origin', () => {
    component = mount(Heelslide, {
      target,
      props: {
        track: customTrack,
        bounds: { width: 300, height: 150 }
      }
    });

    const container = target.querySelector('.heelslide-container');
    expect(container).not.toBeNull();

    const svg = target.querySelector('svg.heelslide-svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 300 150');

    // Background track path
    const bgPath = target.querySelector('path.heelslide-track-bg');
    expect(bgPath).not.toBeNull();
    expect(bgPath?.getAttribute('d')).toBe('M 10 20 L 100 20 L 100 120');

    // Progress path
    const progressPath = target.querySelector('path.heelslide-track-progress');
    expect(progressPath).not.toBeNull();

    // Heel marker (1 heel vertex at 100, 20)
    const heelMarkers = target.querySelectorAll('.heelslide-heel-marker');
    expect(heelMarkers.length).toBe(1);
    expect(heelMarkers[0]?.getAttribute('cx')).toBe('100');
    expect(heelMarkers[0]?.getAttribute('cy')).toBe('20');

    // Handle at origin
    const handle = target.querySelector('.heelslide-handle');
    expect(handle).not.toBeNull();
    expect(handle?.getAttribute('role')).toBe('slider');
    expect(handle?.getAttribute('aria-valuenow')).toBe('0');
    expect(handle?.getAttribute('aria-valuemin')).toBe('0');
    expect(handle?.getAttribute('aria-valuemax')).toBe('100');

    // Handle circle
    const handleCircle = handle?.querySelector('circle');
    expect(handleCircle).not.toBeNull();
    expect(handleCircle?.getAttribute('cx')).toBe('10');
    expect(handleCircle?.getAttribute('cy')).toBe('20');
  });

  it('renders destination marker at track endpoint', () => {
    component = mount(Heelslide, {
      target,
      props: { track: customTrack }
    });

    const endMarker = target.querySelector('.heelslide-end-marker');
    expect(endMarker).not.toBeNull();
    expect(endMarker?.getAttribute('cx')).toBe('100');
    expect(endMarker?.getAttribute('cy')).toBe('120');
  });

  it('renders disabled attribute and class when disabled is true', () => {
    component = mount(Heelslide, {
      target,
      props: { track: customTrack, disabled: true }
    });

    const container = target.querySelector('.heelslide-container');
    expect(container?.classList.contains('heelslide-disabled')).toBe(true);
    expect(container?.getAttribute('data-disabled')).toBe('true');
  });

  describe('CSS Custom Properties, Heel Theming & Numbered Heels', () => {
    it('renders heel marker groups with buffer clearance and active target attributes', () => {
      component = mount(Heelslide, {
        target,
        props: {
          track: customTrack,
          bounds: { width: 300, height: 150 }
        }
      });

      // Heel group
      const heelGroup = target.querySelector('.heelslide-heel-group');
      expect(heelGroup).not.toBeNull();
      expect(heelGroup?.getAttribute('data-heelslide-heel')).toBe('1');
      // On segment 0, heel 1 is the active target
      expect(heelGroup?.getAttribute('data-target')).toBe('true');
      expect(heelGroup?.classList.contains('heelslide-target')).toBe(true);

      // Clearance buffer circle
      const heelBuffer = heelGroup?.querySelector('.heelslide-heel-buffer');
      expect(heelBuffer).not.toBeNull();
      expect(heelBuffer?.getAttribute('cx')).toBe('100');
      expect(heelBuffer?.getAttribute('cy')).toBe('20');

      // Heel marker circle
      const heelMarker = heelGroup?.querySelector('.heelslide-heel-marker');
      expect(heelMarker).not.toBeNull();
      expect(heelMarker?.getAttribute('cx')).toBe('100');
      expect(heelMarker?.getAttribute('cy')).toBe('20');

      // Goal group
      const goalGroup = target.querySelector('.heelslide-goal-group');
      expect(goalGroup).not.toBeNull();
      expect(goalGroup?.getAttribute('data-target')).toBe('false');
    });

    it('renders numbered heel text when numberedHeels is enabled', () => {
      component = mount(Heelslide, {
        target,
        props: {
          track: customTrack,
          bounds: { width: 300, height: 150 },
          numberedHeels: true
        }
      });

      const heelGroup = target.querySelector('.heelslide-heel-group');
      expect(heelGroup).not.toBeNull();

      const textEl = heelGroup?.querySelector('text.heelslide-heel-text');
      expect(textEl).not.toBeNull();
      expect(textEl?.textContent).toBe('1');
      expect(textEl?.getAttribute('x')).toBe('100');
      expect(textEl?.getAttribute('y')).toBe('20');
      expect(textEl?.getAttribute('text-anchor')).toBe('middle');
      expect(textEl?.getAttribute('dominant-baseline')).toBe('central');
    });
  });
});
