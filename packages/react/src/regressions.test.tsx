/** @vitest-environment happy-dom */
// @ts-expect-error React testing environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
import { describe, it, expect, afterEach } from 'vitest';
import React, { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useHeelslide } from './useHeelslide';
import { Heelslide } from './Heelslide';
import type { TrackPath } from '@heelslide/core';

const mounted: { root: Root; host: HTMLElement }[] = [];

function mount(element: React.ReactElement): HTMLElement {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => {
    root.render(element);
  });
  mounted.push({ root, host });
  return host;
}

afterEach(() => {
  while (mounted.length) {
    const entry = mounted.pop()!;
    try {
      act(() => entry.root.unmount());
    } catch {
      // a runaway render may leave the root unmountable; the host is discarded either way
    }
    entry.host.remove();
  }
});

/**
 * Mounts a component using `useHeelslide` and forces one ordinary re-render, reporting how
 * many distinct track objects the hook produced.
 *
 * Identity stability is the invariant that makes the H3 render loop impossible, and it is what
 * is asserted here rather than the loop itself: the loop is unbounded, so a test that provokes
 * it exhausts the heap and takes the runner down with it instead of failing.
 */
function renderChurn(makeOptions: () => Parameters<typeof useHeelslide>[0]): {
  renders: number;
  tracks: Set<TrackPath>;
} {
  let renders = 0;
  const tracks = new Set<TrackPath>();
  let bump: ((n: number) => void) | undefined;

  function Probe(): null {
    const [, setTick] = useState(0);
    bump = setTick;
    renders++;
    const { track } = useHeelslide(makeOptions());
    tracks.add(track);
    return null;
  }

  mount(React.createElement(Probe));
  act(() => bump?.(1));

  return { renders, tracks };
}

describe('useHeelslide render stability (H3)', () => {
  it('should preserve track identity when handed an inline options object', () => {
    const result = renderChurn(() => ({
      generator: { bounds: { width: 300, height: 150 }, heels: 2, seed: 1 }
    }));

    expect(result.tracks.size).toBe(1);
    expect(result.renders).toBeLessThanOrEqual(4);
  });

  it('should settle when handed a stable options reference', () => {
    const generator = { bounds: { width: 300, height: 150 }, heels: 2, seed: 1 };
    const result = renderChurn(() => ({ generator }));

    expect(result.tracks.size).toBe(1);
  });

  it('should regenerate the track when a generator value actually changes', () => {
    const seen = new Set<TrackPath>();
    let setSeed: ((n: number) => void) | undefined;

    function Probe(): null {
      const [seed, update] = useState(1);
      setSeed = update;
      const { track } = useHeelslide({
        generator: { bounds: { width: 300, height: 150 }, heels: 2, seed }
      });
      seen.add(track);
      return null;
    }

    mount(React.createElement(Probe));
    expect(seen.size).toBe(1);

    act(() => setSeed?.(2));
    expect(seen.size).toBe(2);
  });
});

describe('React prop parity (M7)', () => {
  it('should accept a bounds prop like the Vue and Svelte adapters', () => {
    const host = mount(React.createElement(Heelslide, { bounds: { width: 420, height: 210 } }));
    const container = host.querySelector('[data-heelslide-container]') as HTMLElement;

    expect(container.style.width).toBe('420px');
    expect(container.style.height).toBe('210px');
  });

  it('should honour legacy width and height props', () => {
    const host = mount(React.createElement(Heelslide, { width: 360, height: 180 }));
    const container = host.querySelector('[data-heelslide-container]') as HTMLElement;

    expect(container.style.width).toBe('360px');
    expect(container.style.height).toBe('180px');
  });

  it('should let bounds win when both bounds and width/height are supplied', () => {
    const host = mount(
      React.createElement(Heelslide, { bounds: { width: 420, height: 210 }, width: 360, height: 180 })
    );
    const container = host.querySelector('[data-heelslide-container]') as HTMLElement;

    expect(container.style.width).toBe('420px');
  });

  it('should accept an explicit track prop', () => {
    const track: TrackPath = {
      points: [
        { x: 0, y: 0 },
        { x: 60, y: 0 },
        { x: 60, y: 60 }
      ],
      segments: [
        { start: { x: 0, y: 0 }, end: { x: 60, y: 0 }, direction: 'horizontal', length: 60 },
        { start: { x: 60, y: 0 }, end: { x: 60, y: 60 }, direction: 'vertical', length: 60 }
      ],
      totalLength: 120,
      heelCount: 1
    };

    const host = mount(React.createElement(Heelslide, { track }));
    const background = host.querySelector('[data-heelslide-track="background"]');

    expect(background?.getAttribute('d')).toBe('M 0 0 L 60 0 L 60 60');
  });
});

describe('React progress overlay (M8)', () => {
  it('should render a progress overlay path alongside the background track', () => {
    const host = mount(React.createElement(Heelslide, {}));

    expect(host.querySelector('[data-heelslide-track="background"]')).not.toBeNull();
    expect(host.querySelector('[data-heelslide-track="progress"]')).not.toBeNull();
  });

  it('should collapse the progress overlay at zero progress', () => {
    const host = mount(React.createElement(Heelslide, {}));
    const progress = host.querySelector('[data-heelslide-track="progress"]');

    // No traversal yet, so the overlay must describe no drawn length.
    expect(progress?.getAttribute('d')).toBe('');
  });

  it('should extend the progress overlay as the gesture advances', () => {
    const track: TrackPath = {
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 }
      ],
      segments: [
        { start: { x: 0, y: 0 }, end: { x: 100, y: 0 }, direction: 'horizontal', length: 100 },
        { start: { x: 100, y: 0 }, end: { x: 100, y: 100 }, direction: 'vertical', length: 100 }
      ],
      totalLength: 200,
      heelCount: 1
    };

    const host = mount(React.createElement(Heelslide, { track, initialProgress: 0.25 }));
    const progress = host.querySelector('[data-heelslide-track="progress"]');

    // A quarter of 200px total lands halfway along the first segment.
    expect(progress?.getAttribute('d')).toBe('M 0 0 L 50 0');
  });
});
