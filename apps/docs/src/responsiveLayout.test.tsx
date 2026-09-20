/** @vitest-environment happy-dom */
// @ts-expect-error React testing environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { describe, expect, it } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { App } from './App.js';

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

describe('Responsive Layout & Viewport Safety', () => {
  const cssPath = resolve(__dirname, 'styles.css');
  const cssContent = readFileSync(cssPath, 'utf-8');

  it('declares viewport safety rules preventing horizontal page overflow on html and body', () => {
    expect(cssContent).toMatch(/html,\s*body\s*\{[^}]*overflow-x:\s*(clip|hidden)/);
  });

  it('defines responsive media query breakpoints for 768px, 640px, and 480px', () => {
    expect(cssContent).toContain('@media (max-width: 768px)');
    expect(cssContent).toContain('@media (max-width: 640px)');
    expect(cssContent).toContain('@media (max-width: 480px)');
  });

  it('applies fluid typography to header h1 and responsive paddings', () => {
    expect(cssContent).toMatch(/font-size:\s*clamp\(/);
    expect(cssContent).toMatch(/padding:\s*clamp\(/);
  });

  it('renders .docs-container and .header with responsive layout structure', () => {
    const { container, unmount } = renderApp();
    const docsContainer = container.querySelector('.docs-container');
    const header = container.querySelector('.header');
    const title = container.querySelector('.header-title-group h1');
    const badge = container.querySelector('.header-badge');

    expect(docsContainer).not.toBeNull();
    expect(header).not.toBeNull();
    expect(title).not.toBeNull();
    expect(badge).not.toBeNull();

    unmount();
  });
});
