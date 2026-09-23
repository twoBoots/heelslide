/** @vitest-environment happy-dom */
// @ts-expect-error React testing environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { describe, expect, it, vi, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { DocsReference } from './DocsReference.js';

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

describe('DocsReference Component', () => {
  it('should render the API reference and CSS variables documentation tables', () => {
    const host = render(React.createElement(DocsReference));

    expect(host.querySelector('.docs-reference-container')).not.toBeNull();
    expect(host.textContent).toContain('Configuration & Styling Reference');

    // Props table content
    expect(host.textContent).toContain('bounds');
    expect(host.textContent).toContain('heels');
    expect(host.textContent).toContain('tolerance');
    expect(host.textContent).toContain('gridStep');
    expect(host.textContent).toContain('margin');
    expect(host.textContent).toContain('segmented');
    expect(host.textContent).toContain('checkpointTimeoutMs');
    expect(host.textContent).toContain('numberedHeels');

    // Switch to CSS tab to verify CSS custom properties content
    const cssTabBtn = host.querySelectorAll<HTMLButtonElement>('.ref-tab-btn')[1];
    act(() => {
      cssTabBtn.click();
    });

    // CSS variables content
    expect(host.textContent).toContain('--heelslide-width');
    expect(host.textContent).toContain('--heelslide-track-bg');
    expect(host.textContent).toContain('--heelslide-track-progress');
    expect(host.textContent).toContain('--heelslide-handle-bg');
    expect(host.textContent).toContain('--heelslide-handle-border-width');
    expect(host.textContent).toContain('--heelslide-success-color');
    expect(host.textContent).toContain('--heelslide-error-color');
  });

  it('should switch between tabs and update active class', () => {
    const host = render(React.createElement(DocsReference));
    const tabButtons = host.querySelectorAll<HTMLButtonElement>('.ref-tab-btn');
    // This spec is about switching and the active class, not the tab count. Asserting an exact
    // number made it a tripwire for unrelated additions — the keyboard tab added by the
    // accessibility-keyboard-nav track broke it without any switching behaviour changing.
    expect(tabButtons.length).toBeGreaterThanOrEqual(2);

    // Switch to CSS tab
    act(() => {
      tabButtons[1].click();
    });
    expect(tabButtons[1].className).toContain('active');
    expect(tabButtons[0].className).not.toContain('active');

    // Switch back to Props tab
    act(() => {
      tabButtons[0].click();
    });
    expect(tabButtons[0].className).toContain('active');
    expect(tabButtons[1].className).not.toContain('active');
  });

  it('should document complete handle props, slots, and canonical CSS tokens', () => {
    const host = render(React.createElement(DocsReference));

    // Check props tab includes children and slot
    expect(host.textContent).toContain('children');
    expect(host.textContent).toContain('#handle (slot)');

    // Switch to CSS tab
    const cssTabBtn = host.querySelectorAll<HTMLButtonElement>('.ref-tab-btn')[1];
    act(() => {
      cssTabBtn.click();
    });

    // Check canonical handle CSS custom properties
    expect(host.textContent).toContain('--heelslide-handle-size');
    expect(host.textContent).toContain('--heelslide-handle-radius');
    expect(host.textContent).toContain('--heelslide-handle-border-radius');
    expect(host.textContent).toContain('--heelslide-handle-shadow');
    expect(host.textContent).toContain('--heelslide-handle-checkpoint-shadow');
    expect(host.textContent).toContain('--heelslide-handle-checkpoint-border-color');
  });

  it('should render the Handle & Headless Guide tab with icons, headless hooks, and selectors', () => {
    const host = render(React.createElement(DocsReference));
    const handleTabBtn = Array.from(host.querySelectorAll<HTMLButtonElement>('.ref-tab-btn')).find(
      (btn) => btn.textContent?.includes('Handle')
    );
    expect(handleTabBtn).toBeDefined();

    act(() => {
      handleTabBtn!.click();
    });

    expect(handleTabBtn!.className).toContain('active');
    expect(host.textContent).toContain('Custom Handle Icons & Content');
    expect(host.textContent).toContain('Headless Architecture (useHeelslide)');
    expect(host.textContent).toContain('CSS Selectors Reference');
    expect(host.textContent).toContain('[data-heelslide-handle]');
    expect(host.textContent).toContain('.heelslide-handle');
    expect(host.textContent).toContain('.heelslide-handle-circle');
    expect(host.textContent).toContain('.heelslide-handle-shape');
    expect(host.textContent).toContain('getHandleProps()');
  });
});
