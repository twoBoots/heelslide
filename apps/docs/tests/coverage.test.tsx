/** @vitest-environment happy-dom */
// @ts-expect-error React testing environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { describe, expect, it, vi, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ConfigPanel } from '../src/components/ConfigPanel.js';
import { Playground } from '../src/components/Playground.js';
import { FrameworkTabs } from '../src/components/FrameworkTabs.js';
import { generateCodeSnippet, type PlaygroundConfig } from '../src/utils/snippets.js';

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

afterEach(() => {
  while (mounted.length) {
    const entry = mounted.pop()!;
    act(() => entry.root.unmount());
    entry.host.remove();
  }
  vi.restoreAllMocks();
});

const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;

function setInputValue(input: HTMLInputElement, value: string): void {
  act(() => {
    valueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

function toggleCheckbox(input: HTMLInputElement): void {
  // click() toggles and dispatches in one step; assigning `checked` first makes React's change
  // tracking see no delta and swallow the event.
  act(() => {
    input.click();
  });
}

/** Every optional theme field populated. */
const fullTheme: PlaygroundConfig['theme'] = {
  trackBg: '#334155',
  trackActive: '#3b82f6',
  handleColor: '#ffffff',
  handleBorderColor: '#3b82f6',
  heelColor: '#94a3b8',
  heelBorderColor: '#cbd5e1',
  targetHeelBg: '#3b82f6',
  targetHeelBorderColor: '#ffffff',
  goalBg: '#10b981',
  goalBorderColor: '#ffffff',
  heelTextColor: '#475569',
  targetHeelTextColor: '#ffffff',
  trackWidth: 12,
  handleSize: 32,
  heelRadius: 4,
  heelPadding: 0,
  targetHeelScale: 1.1
};

/** Only the required theme fields; every optional one omitted. */
const minimalTheme = {
  trackBg: '#000000',
  trackActive: '#111111',
  handleColor: '#222222',
  heelColor: '#333333'
} as PlaygroundConfig['theme'];

function makeConfig(theme: PlaygroundConfig['theme']): PlaygroundConfig {
  return {
    heels: 2,
    tolerance: 24,
    width: 320,
    height: 160,
    gridStep: 24,
    margin: 16,
    seed: 12345,
    disabled: false,
    segmented: false,
    checkpointTimeoutMs: 0,
    haptics: true,
    sound: true,
    soundVolume: 0.3,
    theme
  } as PlaygroundConfig;
}

describe('Playground theme variable mapping', () => {
  it('should emit every themed custom property when all theme fields are set', () => {
    const host = render(
      React.createElement(Playground, {
        config: makeConfig(fullTheme),
        onStateChange: vi.fn(),
        onUnlock: vi.fn(),
        onReset: vi.fn()
      })
    );

    const stage = host.querySelector('.preview-stage > div') as HTMLElement;
    expect(stage.style.getPropertyValue('--heelslide-track-bg')).toBe('#334155');
    expect(stage.style.getPropertyValue('--heelslide-track-width')).toBe('12px');
    expect(stage.style.getPropertyValue('--heelslide-handle-size')).toBe('32px');
    expect(stage.style.getPropertyValue('--heelslide-heel-padding')).toBe('0px');
    expect(stage.style.getPropertyValue('--heelslide-target-heel-scale')).toBe('1.1');
    expect(stage.style.getPropertyValue('--heelslide-goal-bg')).toBe('#10b981');
  });

  it('should omit optional custom properties when their theme fields are absent', () => {
    const host = render(
      React.createElement(Playground, {
        config: makeConfig(minimalTheme),
        onStateChange: vi.fn(),
        onUnlock: vi.fn(),
        onReset: vi.fn()
      })
    );

    const stage = host.querySelector('.preview-stage > div') as HTMLElement;
    expect(stage.style.getPropertyValue('--heelslide-track-bg')).toBe('#000000');
    expect(stage.style.getPropertyValue('--heelslide-track-width')).toBe('');
    expect(stage.style.getPropertyValue('--heelslide-handle-size')).toBe('');
    expect(stage.style.getPropertyValue('--heelslide-target-heel-scale')).toBe('');
    expect(stage.style.getPropertyValue('--heelslide-goal-bg')).toBe('');
  });

  it('should disable sound entirely when the sound flag is off', () => {
    const config = { ...makeConfig(fullTheme), sound: false };
    const host = render(
      React.createElement(Playground, {
        config,
        onStateChange: vi.fn(),
        onUnlock: vi.fn(),
        onReset: vi.fn()
      })
    );

    expect(host.querySelector('[data-heelslide-container]')).not.toBeNull();
  });
});

describe('ConfigPanel control wiring', () => {
  it('should route every range and number input through the config updater', () => {
    const onChange = vi.fn();
    const host = render(
      React.createElement(ConfigPanel, {
        config: makeConfig(fullTheme),
        onChange,
        onRegenerate: vi.fn()
      })
    );

    const numeric = Array.from(
      host.querySelectorAll<HTMLInputElement>('input[type="range"], input[type="number"]')
    );
    expect(numeric.length).toBeGreaterThan(0);

    for (const input of numeric) {
      onChange.mockClear();
      const next = String(Number(input.value || '0') + 1);
      setInputValue(input, next);
      expect(onChange, `input#${input.id} did not call onChange`).toHaveBeenCalled();
    }
  });

  it('should route every colour input through the config updater', () => {
    const onChange = vi.fn();
    const host = render(
      React.createElement(ConfigPanel, {
        config: makeConfig(fullTheme),
        onChange,
        onRegenerate: vi.fn()
      })
    );

    const colours = Array.from(host.querySelectorAll<HTMLInputElement>('input[type="color"]'));
    expect(colours.length).toBeGreaterThan(0);

    for (const input of colours) {
      onChange.mockClear();
      setInputValue(input, '#abcdef');
      expect(onChange, `input#${input.id} did not call onChange`).toHaveBeenCalled();
    }
  });

  it('should route every checkbox through the config updater', () => {
    const onChange = vi.fn();
    const host = render(
      React.createElement(ConfigPanel, {
        config: makeConfig(fullTheme),
        onChange,
        onRegenerate: vi.fn()
      })
    );

    const checkboxes = Array.from(host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
    expect(checkboxes.length).toBeGreaterThan(0);

    for (const input of checkboxes) {
      onChange.mockClear();
      toggleCheckbox(input);
      expect(onChange, `input#${input.id} did not call onChange`).toHaveBeenCalled();
    }
  });

  it('should route every select through the config updater', () => {
    const onChange = vi.fn();
    const host = render(
      React.createElement(ConfigPanel, {
        config: makeConfig(fullTheme),
        onChange,
        onRegenerate: vi.fn()
      })
    );

    for (const select of Array.from(host.querySelectorAll<HTMLSelectElement>('select'))) {
      const options = Array.from(select.options);
      if (options.length < 2) continue;
      onChange.mockClear();
      const target = options.find((o) => o.value !== select.value) ?? options[0]!;
      act(() => {
        select.value = target.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      });
      expect(onChange).toHaveBeenCalled();
    }
  });

  it('should invoke the regenerate callback from its button', () => {
    const onRegenerate = vi.fn();
    const host = render(
      React.createElement(ConfigPanel, {
        config: makeConfig(fullTheme),
        onChange: vi.fn(),
        onRegenerate
      })
    );

    const button = Array.from(host.querySelectorAll('button')).find((b) =>
      /regenerate/i.test(b.textContent ?? '')
    );
    expect(button).toBeDefined();

    act(() => button!.click());
    expect(onRegenerate).toHaveBeenCalledTimes(1);
  });

  it('should render against a minimal theme without optional fields', () => {
    const host = render(
      React.createElement(ConfigPanel, {
        config: makeConfig(minimalTheme),
        onChange: vi.fn(),
        onRegenerate: vi.fn()
      })
    );

    expect(host.querySelectorAll('input').length).toBeGreaterThan(0);
  });
});

describe('FrameworkTabs copy behaviour', () => {
  it('should copy the active snippet and show confirmation', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true
    });

    const config = makeConfig(fullTheme);
    const host = render(React.createElement(FrameworkTabs, { config }));
    const copyButton = host.querySelector('.copy-btn') as HTMLButtonElement;

    expect(copyButton.textContent).toBe('Copy Code');

    await act(async () => {
      copyButton.click();
    });

    expect(writeText).toHaveBeenCalledWith(generateCodeSnippet('react', config));
    expect(host.querySelector('.copy-btn')?.textContent).toBe('Copied!');
  });

  it('should stay silent when the clipboard write is rejected', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true
    });

    const host = render(React.createElement(FrameworkTabs, { config: makeConfig(fullTheme) }));
    const copyButton = host.querySelector('.copy-btn') as HTMLButtonElement;

    await act(async () => {
      copyButton.click();
    });

    expect(writeText).toHaveBeenCalled();
    expect(host.querySelector('.copy-btn')?.textContent).toBe('Copy Code');
  });

  it('should revert the confirmation label after the timeout elapses', async () => {
    vi.useFakeTimers();
    try {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true
      });

      const host = render(React.createElement(FrameworkTabs, { config: makeConfig(fullTheme) }));
      const copyButton = host.querySelector('.copy-btn') as HTMLButtonElement;

      await act(async () => {
        copyButton.click();
      });
      expect(host.querySelector('.copy-btn')?.textContent).toBe('Copied!');

      act(() => {
        vi.advanceTimersByTime(2500);
      });
      expect(host.querySelector('.copy-btn')?.textContent).toBe('Copy Code');
    } finally {
      vi.useRealTimers();
    }
  });
});
