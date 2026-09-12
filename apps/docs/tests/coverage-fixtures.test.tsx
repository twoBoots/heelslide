/** @vitest-environment happy-dom */
// @ts-expect-error React testing environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { describe, expect, it, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { VisualFixture } from '../src/fixtures/VisualFixture.js';
import { generateCodeSnippet, type FrameworkTarget, type PlaygroundConfig } from '../src/utils/snippets.js';

const mounted: { root: Root; host: HTMLElement }[] = [];

function render(element: React.ReactElement): HTMLElement {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => {
    root.render(element);
  });
  mounted.push({ root, host });
  return host;
}

function setSearch(search: string): void {
  window.history.replaceState({}, '', `/${search}`);
}

afterEach(() => {
  while (mounted.length) {
    const entry = mounted.pop()!;
    act(() => entry.root.unmount());
    entry.host.remove();
  }
  setSearch('');
});

describe('VisualFixture theme variants', () => {
  const themes = ['high-contrast', 'clean-slate', 'custom', 'dark', 'unrecognised'];

  it.each(themes)('should render the %s theme', (theme) => {
    setSearch(`?fixture=visual&theme=${theme}`);
    const host = render(React.createElement(VisualFixture));

    expect(host.querySelector('[data-heelslide-container]')).not.toBeNull();
  });

  it('should apply distinct track colours per theme', () => {
    const trackBgFor = (theme: string): string => {
      setSearch(`?fixture=visual&theme=${theme}`);
      const host = render(React.createElement(VisualFixture));
      const stage = host.querySelector('[data-testid="visual-fixture-stage"]') as HTMLElement;
      return stage.style.getPropertyValue('--heelslide-track-bg');
    };

    const dark = trackBgFor('dark');
    const clean = trackBgFor('clean-slate');

    expect(dark).toBe('#334155');
    expect(clean).toBe('#e2e8f0');
    expect(dark).not.toBe(clean);
  });

  const states = ['idle', 'active', 'checkpoint', 'unlocked', 'reset', 'disabled', 'nonsense'];

  it.each(states)('should render the %s state', (state) => {
    setSearch(`?fixture=visual&state=${state}`);
    const host = render(React.createElement(VisualFixture));

    expect(host.querySelector('[data-heelslide-container]')).not.toBeNull();
  });

  it('should render with numbered heels enabled', () => {
    setSearch('?fixture=visual&numberedHeels=true&heels=3');
    const host = render(React.createElement(VisualFixture));

    expect(host.querySelector('[data-heelslide-container]')).not.toBeNull();
  });

  it('should fall back to defaults for unparseable numeric params', () => {
    setSearch('?fixture=visual&heels=abc&seed=xyz&tolerance=nope&width=bad&height=worse');
    const host = render(React.createElement(VisualFixture));

    expect(host.querySelector('[data-heelslide-container]')).not.toBeNull();
  });
});

describe('Code snippet generation across option permutations', () => {
  const targets: FrameworkTarget[] = ['react', 'vue', 'svelte', 'core'];

  const enabled = {
    heels: 3,
    tolerance: 30,
    width: 320,
    height: 160,
    gridStep: 24,
    margin: 16,
    seed: 99,
    disabled: true,
    segmented: true,
    checkpointTimeoutMs: 5000,
    haptics: true,
    sound: true,
    soundVolume: 0.5,
    numberedHeels: true,
    theme: {}
  } as unknown as PlaygroundConfig;

  const disabledEverything = {
    heels: 2,
    tolerance: 24,
    width: 320,
    height: 160,
    gridStep: 24,
    margin: 16,
    seed: undefined,
    disabled: false,
    segmented: false,
    checkpointTimeoutMs: 0,
    haptics: false,
    sound: false,
    soundVolume: 0.3,
    numberedHeels: false,
    theme: {}
  } as unknown as PlaygroundConfig;

  it.each(targets)('should include optional attributes for %s when enabled', (target) => {
    const snippet = generateCodeSnippet(target, enabled);

    expect(snippet).toContain('99');
    expect(snippet.toLowerCase()).toContain('segmented');
  });

  it.each(targets)('should omit optional attributes for %s when disabled', (target) => {
    const snippet = generateCodeSnippet(target, disabledEverything);

    expect(snippet).not.toContain('seed');
    expect(snippet.toLowerCase()).not.toContain('segmented');
    expect(snippet).not.toContain('checkpointTimeoutMs');
  });

  it('should omit the checkpoint timeout when segmented is on but the timeout is zero', () => {
    const config = { ...enabled, checkpointTimeoutMs: 0 } as PlaygroundConfig;

    for (const target of targets) {
      expect(generateCodeSnippet(target, config)).not.toContain('checkpointTimeoutMs');
    }
  });
});
