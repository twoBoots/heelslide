/** @vitest-environment happy-dom */
// @ts-expect-error React testing environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { VisualFixture, parseVisualFixtureParams } from '../src/fixtures/VisualFixture.js';
import { App } from '../src/App.js';

describe('VisualFixture Query Parameter Parser', () => {
  it('parses default parameters when none are specified', () => {
    const params = parseVisualFixtureParams('?fixture=visual');
    expect(params.isFixture).toBe(true);
    expect(params.state).toBe('idle');
    expect(params.heels).toBe(2);
    expect(params.seed).toBe(4242);
    expect(params.tolerance).toBe(24);
    expect(params.width).toBe(320);
    expect(params.height).toBe(160);
    expect(params.theme).toBe('default');
    expect(params.disabled).toBe(false);
  });

  it('parses disabled state correctly', () => {
    const params = parseVisualFixtureParams('?fixture=visual&state=disabled');
    expect(params.state).toBe('disabled');
    expect(params.disabled).toBe(true);
  });

  it('parses active and unlocked states', () => {
    const activeParams = parseVisualFixtureParams('?fixture=visual&state=active');
    expect(activeParams.state).toBe('active');
    expect(activeParams.progress).toBe(0.5);

    const unlockedParams = parseVisualFixtureParams('?fixture=visual&state=unlocked');
    expect(unlockedParams.state).toBe('unlocked');
    expect(unlockedParams.progress).toBe(1.0);
  });

  it('parses custom heels, seed, dimensions, and themes', () => {
    const params = parseVisualFixtureParams('?fixture=visual&heels=4&seed=9999&tolerance=30&width=400&height=200&theme=custom');
    expect(params.heels).toBe(4);
    expect(params.seed).toBe(9999);
    expect(params.tolerance).toBe(30);
    expect(params.width).toBe(400);
    expect(params.height).toBe(200);
    expect(params.theme).toBe('custom');
  });

  it('parses numberedHeels and theme presets', () => {
    const params = parseVisualFixtureParams('?fixture=visual&numberedHeels=true&theme=cyberpunk');
    expect(params.numberedHeels).toBe(true);
    expect(params.theme).toBe('cyberpunk');
  });

  it('identifies non-fixture search queries', () => {
    const params = parseVisualFixtureParams('?other=123');
    expect(params.isFixture).toBe(false);
  });
});

describe('VisualFixture Component Rendering', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders deterministic visual fixture with frozen animation styles', () => {
    const root = createRoot(container);
    act(() => {
      root.render(React.createElement(VisualFixture, { search: '?fixture=visual' }));
    });

    const fixtureEl = container.querySelector('[data-testid="visual-fixture"]');
    expect(fixtureEl).not.toBeNull();

    // Check style tag with animation freezing
    const styleTag = container.querySelector('style[data-visual-fixture-styles]');
    expect(styleTag).not.toBeNull();
    expect(styleTag?.textContent).toContain('animation-duration: 0s !important');
    expect(styleTag?.textContent).toContain('transition-duration: 0s !important');

    act(() => {
      root.unmount();
    });
  });

  it('renders active state with midpoint handle position and data attributes', () => {
    const root = createRoot(container);
    act(() => {
      root.render(React.createElement(VisualFixture, { search: '?fixture=visual&state=active' }));
    });

    const heelslide = container.querySelector('[data-heelslide-container]');
    expect(heelslide).not.toBeNull();
    expect(heelslide?.getAttribute('data-state')).toBe('active');

    act(() => {
      root.unmount();
    });
  });

  it('renders unlocked state with unlocked data attribute', () => {
    const root = createRoot(container);
    act(() => {
      root.render(React.createElement(VisualFixture, { search: '?fixture=visual&state=unlocked' }));
    });

    const heelslide = container.querySelector('[data-heelslide-container]');
    expect(heelslide).not.toBeNull();
    expect(heelslide?.getAttribute('data-state')).toBe('unlocked');

    act(() => {
      root.unmount();
    });
  });

  it('renders disabled state with disabled data attribute', () => {
    const root = createRoot(container);
    act(() => {
      root.render(React.createElement(VisualFixture, { search: '?fixture=visual&state=disabled' }));
    });

    const heelslide = container.querySelector('[data-heelslide-container]');
    expect(heelslide).not.toBeNull();
    expect(heelslide?.getAttribute('data-disabled')).toBe('true');

    act(() => {
      root.unmount();
    });
  });

  it('renders custom theme with custom CSS custom property overrides', () => {
    const root = createRoot(container);
    act(() => {
      root.render(React.createElement(VisualFixture, { search: '?fixture=visual&theme=custom' }));
    });

    const stage = container.querySelector('[data-testid="visual-fixture-stage"]') as HTMLElement;
    expect(stage).not.toBeNull();
    expect(stage.style.getPropertyValue('--heelslide-track-bg')).toBe('#475569');
    expect(stage.style.getPropertyValue('--heelslide-track-active')).toBe('#10b981');

    act(() => {
      root.unmount();
    });
  });

  it('renders cyberpunk preset with neon theme custom properties', () => {
    const root = createRoot(container);
    act(() => {
      root.render(React.createElement(VisualFixture, { search: '?fixture=visual&theme=cyberpunk' }));
    });

    const stage = container.querySelector('[data-testid="visual-fixture-stage"]') as HTMLElement;
    expect(stage).not.toBeNull();
    expect(stage.style.getPropertyValue('--heelslide-track-bg')).toBe('#0f172a');
    expect(stage.style.getPropertyValue('--heelslide-track-progress')).toBe('#06b6d4');
    expect(stage.style.getPropertyValue('--heelslide-target-heel-bg')).toBe('#f43f5e');

    act(() => {
      root.unmount();
    });
  });

  it('renders numbered heels in visual fixture when numberedHeels=true', () => {
    const root = createRoot(container);
    act(() => {
      root.render(React.createElement(VisualFixture, { search: '?fixture=visual&heels=2&numberedHeels=true' }));
    });

    const heelText = container.querySelector('text.heelslide-heel-text');
    expect(heelText).not.toBeNull();
    expect(heelText?.textContent).toBe('1');

    act(() => {
      root.unmount();
    });
  });

  it('App renders VisualFixture when window.location.search has ?fixture=visual', () => {
    const originalSearch = window.location.search;
    try {
      window.history.pushState({}, '', '?fixture=visual');
      const root = createRoot(container);
      act(() => {
        root.render(React.createElement(App));
      });

      // Does NOT render header or config panel
      expect(container.querySelector('.playground-grid')).toBeNull();
      expect(container.querySelector('h1')).toBeNull();
      // DOES render visual fixture
      expect(container.querySelector('[data-testid="visual-fixture"]')).not.toBeNull();

      act(() => {
        root.unmount();
      });
    } finally {
      window.history.pushState({}, '', originalSearch || '/');
    }
  });
});
