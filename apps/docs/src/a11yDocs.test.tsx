/** @vitest-environment jsdom */
// @ts-expect-error React testing environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { describe, it, expect } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';
import { DocsReference } from './components/DocsReference.js';
import { generateCodeSnippet, type PlaygroundConfig } from './utils/snippets.js';

/**
 * Playground demonstration of keyboard operation.
 *
 * The playground is where a sighted developer discovers that the component is keyboard
 * operable at all, so what assistive technology receives is surfaced as visible text.
 */

function render(element: React.ReactElement) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  act(() => {
    root.render(element);
  });

  return {
    host,
    press(target: Element, key: string) {
      act(() => {
        target.dispatchEvent(
          new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
        );
      });
    },
    click(target: Element) {
      act(() => {
        target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
    },
    unmount() {
      act(() => root.unmount());
      host.remove();
    }
  };
}

const baseConfig: PlaygroundConfig = {
  heels: 2,
  tolerance: 24,
  width: 320,
  height: 160,
  gridStep: 24,
  margin: 16,
  disabled: false,
  haptics: false,
  sound: false,
  soundVolume: 0.3,
  accessibleFallback: 'stepped',
  theme: {
    trackBg: '#e5e7eb',
    trackActive: '#3b82f6',
    handleColor: '#1d4ed8',
    heelColor: '#94a3b8'
  }
};

describe('playground keyboard showcase', () => {
  it('surfaces what assistive technology receives as visible text', () => {
    const h = render(React.createElement(App));
    const slider = h.host.querySelector('[data-heelslide-container]');

    expect(slider).not.toBeNull();
    h.press(slider!, 'ArrowRight');

    const readout = h.host.querySelector('[data-a11y-readout]');
    expect(readout).not.toBeNull();
    expect(readout?.textContent ?? '').toMatch(/%/);

    h.unmount();
  });

  it('shows the most recent announcement', () => {
    const h = render(React.createElement(App));
    const slider = h.host.querySelector('[data-heelslide-container]')!;

    h.press(slider, 'ArrowRight');

    const announcement = h.host.querySelector('[data-a11y-announcement]');
    expect((announcement?.textContent ?? '').length).toBeGreaterThan(0);

    h.unmount();
  });

  it('drives the demo to unlock by keyboard alone', () => {
    const h = render(React.createElement(App));
    const slider = h.host.querySelector('[data-heelslide-container]')!;

    for (let i = 0; i < 12; i += 1) h.press(slider, 'ArrowRight');
    h.press(slider, 'Enter');

    expect(slider.getAttribute('data-state')).toBe('unlocked');

    h.unmount();
  });
});

describe('accessible fallback control', () => {
  it('offers the fallback mode in the configurator', () => {
    const h = render(React.createElement(App));
    const control = h.host.querySelector('[data-config-accessible-fallback]');

    expect(control).not.toBeNull();

    h.unmount();
  });

  it('stops binding keys once custom mode is selected', () => {
    const h = render(React.createElement(App));
    const control = h.host.querySelector(
      '[data-config-accessible-fallback]'
    ) as HTMLSelectElement;

    act(() => {
      control.value = 'custom';
      control.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const slider = h.host.querySelector('[data-heelslide-container]')!;
    h.press(slider, 'ArrowRight');

    expect(slider.getAttribute('aria-valuenow')).toBe('0');

    h.unmount();
  });
});

describe('keyboard reference tab', () => {
  it('sits alongside the props and CSS tabs', () => {
    const h = render(React.createElement(DocsReference));
    const tabs = Array.from(h.host.querySelectorAll('.ref-tab-btn')).map((t) =>
      (t.textContent ?? '').toLowerCase()
    );

    expect(tabs.some((t) => t.includes('keyboard'))).toBe(true);

    h.unmount();
  });

  it('tabulates every bound key', () => {
    const h = render(React.createElement(DocsReference));
    const tab = Array.from(h.host.querySelectorAll('.ref-tab-btn')).find((t) =>
      (t.textContent ?? '').toLowerCase().includes('keyboard')
    )!;

    h.click(tab);
    const text = h.host.textContent ?? '';

    for (const key of ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Home', 'Enter', 'Escape']) {
      expect(text).toContain(key);
    }

    h.unmount();
  });

  it('explains why End is unbound', () => {
    const h = render(React.createElement(DocsReference));
    const tab = Array.from(h.host.querySelectorAll('.ref-tab-btn')).find((t) =>
      (t.textContent ?? '').toLowerCase().includes('keyboard')
    )!;

    h.click(tab);
    const text = h.host.textContent ?? '';

    expect(text).toContain('End');
    expect(text.toLowerCase()).toMatch(/bypass|unbound|deliberate/);

    h.unmount();
  });
});

describe('snippet accessibility parity', () => {
  it('omits the prop at the default mode', () => {
    for (const framework of ['react', 'vue', 'svelte'] as const) {
      const snippet = generateCodeSnippet(framework, baseConfig);
      expect(snippet).not.toContain('accessibleFallback');
    }
  });

  it('emits the prop in every framework once non-default', () => {
    const config = { ...baseConfig, accessibleFallback: 'custom' as const };

    expect(generateCodeSnippet('react', config)).toContain('accessibleFallback="custom"');
    expect(generateCodeSnippet('vue', config)).toContain('accessible-fallback="custom"');
    expect(generateCodeSnippet('svelte', config)).toContain('accessibleFallback="custom"');
  });
});
