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

  it('should allow filtering or switching categories if tabs exist', () => {
    const host = render(React.createElement(DocsReference));
    const tabButtons = host.querySelectorAll<HTMLButtonElement>('.ref-tab-btn');
    if (tabButtons.length >= 2) {
      act(() => {
        tabButtons[1].click();
      });
      expect(tabButtons[1].className).toContain('active');
    }
  });
});
