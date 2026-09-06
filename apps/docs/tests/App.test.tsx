/** @vitest-environment happy-dom */
// @ts-expect-error React testing environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { describe, expect, it } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../src/App.js';

function renderApp() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(React.createElement(App));
  });

  return {
    container,
    unmount() {
      act(() => {
        root.unmount();
      });
      container.remove();
    }
  };
}

describe('Docs Playground App Component', () => {
  it('renders header, live simulator, config controls, and code tabs', () => {
    const { container, unmount } = renderApp();

    // Check title
    expect(container.querySelector('h1')?.textContent).toContain('Heelslide');
    expect(container.querySelector('.header-badge')?.textContent).toBe('v0.1.0');

    // Check live simulator stage exists
    expect(container.querySelector('.preview-stage')).not.toBeNull();

    // Check config panel inputs
    const heelsInput = container.querySelector('#ctrl-heels') as HTMLInputElement;
    expect(heelsInput).not.toBeNull();
    expect(heelsInput.value).toBe('2');

    // Check metrics card
    expect(container.textContent).toContain('Successful Unlocks');
    expect(container.textContent).toContain('Blocked Deviations');

    // Check code tabs
    expect(container.textContent).toContain('React (@heelslide/react)');
    expect(container.textContent).toContain('Vue 3 (@heelslide/vue)');
    expect(container.textContent).toContain('Core / Vanilla (@heelslide/core)');

    unmount();
  });

  it('updates configuration when sliders change', () => {
    const { container, unmount } = renderApp();

    const toleranceInput = container.querySelector('#ctrl-tolerance') as HTMLInputElement;
    const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;

    act(() => {
      valueSetter?.call(toleranceInput, '32');
      toleranceInput.dispatchEvent(new Event('input', { bubbles: true }));
      toleranceInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(container.textContent).toContain('32px');

    unmount();
  });

  it('switches framework code tabs on click', () => {
    const { container, unmount } = renderApp();

    const tabButtons = container.querySelectorAll('.tab-btn');
    expect(tabButtons.length).toBe(3);

    // Initial is React
    expect(container.querySelector('.code-pre')?.textContent).toContain("import { Heelslide } from '@heelslide/react';");

    // Click Vue tab
    act(() => {
      (tabButtons[1] as HTMLButtonElement).click();
    });
    expect(container.querySelector('.code-pre')?.textContent).toContain("import { Heelslide } from '@heelslide/vue';");

    // Click Core tab
    act(() => {
      (tabButtons[2] as HTMLButtonElement).click();
    });
    expect(container.querySelector('.code-pre')?.textContent).toContain("import { HeelslideEngine } from '@heelslide/core';");

    unmount();
  });

  it('resets metrics counters when Reset Metrics is clicked', () => {
    const { container, unmount } = renderApp();

    const resetStatsBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Reset Metrics')
    );
    expect(resetStatsBtn).toBeDefined();

    act(() => {
      resetStatsBtn?.click();
    });

    const statValues = container.querySelectorAll('.stat-value');
    expect(statValues[0]?.textContent).toBe('0');
    expect(statValues[1]?.textContent).toBe('0');

    unmount();
  });

  it('triggers path regeneration when Regenerate Path button is clicked', () => {
    const { container, unmount } = renderApp();

    const regenBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Regenerate Path')
    );
    expect(regenBtn).toBeDefined();

    act(() => {
      regenBtn?.click();
    });

    // Should still render properly
    expect(container.querySelector('.preview-stage')).not.toBeNull();

    unmount();
  });

  it('renders feedback controls and allows auditioning synthesized tones', () => {
    const { container, unmount } = renderApp();

    const hapticsToggle = container.querySelector('#ctrl-haptics') as HTMLInputElement;
    const soundToggle = container.querySelector('#ctrl-sound') as HTMLInputElement;

    expect(hapticsToggle).not.toBeNull();
    expect(soundToggle).not.toBeNull();

    const testTurnBtn = container.querySelector('#btn-test-turn') as HTMLButtonElement;
    const testResetBtn = container.querySelector('#btn-test-reset') as HTMLButtonElement;
    const testUnlockBtn = container.querySelector('#btn-test-unlock') as HTMLButtonElement;

    expect(testTurnBtn).not.toBeNull();
    expect(testResetBtn).not.toBeNull();
    expect(testUnlockBtn).not.toBeNull();

    act(() => {
      testTurnBtn.click();
      testResetBtn.click();
      testUnlockBtn.click();
    });

    unmount();
  });
});
