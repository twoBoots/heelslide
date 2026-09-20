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

  it('renders .preview-stage-viewport wrapper inside .preview-stage to ensure scrollable simulator containment', () => {
    const { container, unmount } = renderApp();
    const stage = container.querySelector('.preview-stage');
    const viewport = stage?.querySelector('.preview-stage-viewport');

    expect(stage).not.toBeNull();
    expect(viewport).not.toBeNull();
    expect(viewport?.querySelector('[data-heelslide-container]')).not.toBeNull();

    unmount();
  });

  it('defines .preview-stage-viewport with overflow-x: auto and max-width: 100%', () => {
    expect(cssContent).toMatch(/\.preview-stage-viewport\s*\{[^}]*overflow-x:\s*auto/);
    expect(cssContent).toMatch(/\.preview-stage-viewport\s*\{[^}]*max-width:\s*100%/);
  });

  it('configures .tabs-nav with non-wrapping horizontal touch scrolling and masked scrollbars', () => {
    expect(cssContent).toMatch(/\.tabs-nav\s*\{[^}]*overflow-x:\s*auto/);
    expect(cssContent).toMatch(/\.tabs-nav\s*\{[^}]*flex-wrap:\s*nowrap/);
    expect(cssContent).toMatch(/\.tabs-nav\s*\{[^}]*scrollbar-width:\s*none/);
  });

  it('ensures .tab-btn and .ref-tab-btn do not shrink or break words across lines', () => {
    expect(cssContent).toMatch(/\.tab-btn\s*\{[^}]*flex-shrink:\s*0/);
    expect(cssContent).toMatch(/\.tab-btn\s*\{[^}]*white-space:\s*nowrap/);
    expect(cssContent).toMatch(/\.ref-tab-btn\s*\{[^}]*flex-shrink:\s*0/);
    expect(cssContent).toMatch(/\.ref-tab-btn\s*\{[^}]*white-space:\s*nowrap/);
  });

  it('defines responsive grid reflow for .stats-grid at mobile breakpoints', () => {
    expect(cssContent).toMatch(/@media\s*\(max-width:\s*640px\)[\s\S]*?\.stats-grid\s*\{[^}]*grid-template-columns:/);
    expect(cssContent).toMatch(/@media\s*\(max-width:\s*480px\)[\s\S]*?\.stats-grid\s*\{[^}]*grid-template-columns:\s*1fr/);
  });

  it('stacks .color-pickers-row to single column on compact mobile screens', () => {
    expect(cssContent).toMatch(/@media\s*\(max-width:\s*480px\)[\s\S]*?\.color-pickers-row\s*\{[^}]*grid-template-columns:\s*1fr/);
  });

  it('ensures feedback toggles and action buttons in ConfigPanel support flex-wrap', () => {
    const { container, unmount } = renderApp();
    const hapticsInput = container.querySelector('#ctrl-haptics');
    const toggleParent = hapticsInput?.closest('.control-group') as HTMLElement;

    expect(toggleParent).not.toBeNull();
    expect(toggleParent.style.flexWrap).toBe('wrap');

    unmount();
  });

  it('enforces min-width on .ref-table and defines .ref-table-viewport for smooth horizontal touch scrolling', () => {
    expect(cssContent).toMatch(/\.ref-table\s*\{[^}]*min-width:\s*(5[0-9]{2}|600)px/);
    expect(cssContent).toMatch(/\.ref-table-viewport\s*\{[^}]*overflow-x:\s*auto/);
    expect(cssContent).toMatch(/\.ref-table-viewport\s*\{[^}]*max-width:\s*100%/);
  });

  it('applies flex-wrap and gap to .code-block-header to prevent title and copy button collision', () => {
    expect(cssContent).toMatch(/\.code-block-header\s*\{[^}]*flex-wrap:\s*wrap/);
    expect(cssContent).toMatch(/\.code-block-header\s*\{[^}]*gap:\s*0\.5rem/);
  });

  it('renders .ref-table-viewport in DocsReference', () => {
    const { container, unmount } = renderApp();
    const tableViewport = container.querySelector('.ref-table-viewport');

    expect(tableViewport).not.toBeNull();
    expect(tableViewport?.querySelector('.ref-table')).not.toBeNull();

    unmount();
  });
});

