/** @vitest-environment happy-dom */
// @ts-expect-error React testing environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { describe, expect, it, vi, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { App } from './App.js';

const mounted: { root: Root; host: HTMLElement }[] = [];

function render(): HTMLElement {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => {
    root.render(React.createElement(App));
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
});

/** Reads the track vertices straight out of the rendered background path. */
function trackPoints(container: HTMLElement): { x: number; y: number }[] {
  const d = container.querySelector('[data-heelslide-track="background"]')?.getAttribute('d') ?? '';
  const matches = d.matchAll(/[ML]\s*([\d.-]+)\s+([\d.-]+)/g);
  return Array.from(matches, (m) => ({ x: parseFloat(m[1]!), y: parseFloat(m[2]!) }));
}

function prepare(container: HTMLElement): HTMLElement {
  const gate = container.querySelector('[data-heelslide-container]') as HTMLElement;
  gate.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 320, height: 160, right: 320, bottom: 160, x: 0, y: 0, toJSON: () => {} }) as DOMRect;
  gate.setPointerCapture = vi.fn();
  gate.releasePointerCapture = vi.fn();
  return gate;
}

function fire(target: HTMLElement, type: string, x: number, y: number): void {
  act(() => {
    target.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: x, clientY: y, pointerId: 1 }));
  });
}

function metricValue(container: HTMLElement, label: string): string {
  const cells = Array.from(container.querySelectorAll('.metric, .metric-card, div'));
  const cell = cells.find((el) => el.textContent?.includes(label) && el.children.length <= 4);
  return cell?.textContent ?? '';
}

describe('App gesture metrics', () => {
  it('should count a successful unlock', () => {
    const container = render();
    const gate = prepare(container);
    const points = trackPoints(container);
    expect(points.length).toBeGreaterThan(2);

    fire(gate, 'pointerdown', points[0]!.x, points[0]!.y);
    expect(gate.getAttribute('data-state')).toBe('active');

    // Walk each vertex, approaching every heel so the corner is actually negotiated.
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]!;
      const next = points[i]!;
      fire(gate, 'pointermove', (prev.x + next.x) / 2, (prev.y + next.y) / 2);
      fire(gate, 'pointermove', next.x, next.y);
    }

    const last = points[points.length - 1]!;
    fire(gate, 'pointerup', last.x, last.y);

    expect(gate.getAttribute('data-state')).toBe('unlocked');
    expect(metricValue(container, 'Successful Unlocks')).toContain('1');
  });

  it('should count a blocked deviation', () => {
    const container = render();
    const gate = prepare(container);
    const points = trackPoints(container);

    fire(gate, 'pointerdown', points[0]!.x, points[0]!.y);
    expect(gate.getAttribute('data-state')).toBe('active');

    // Far outside tolerance of any segment.
    fire(gate, 'pointermove', points[0]!.x, points[0]!.y + 5000);

    expect(gate.getAttribute('data-state')).toBe('idle');
    expect(metricValue(container, 'Blocked Deviations')).toContain('1');
  });

  it('should clear both counters when metrics are reset', () => {
    const container = render();
    const gate = prepare(container);
    const points = trackPoints(container);

    fire(gate, 'pointerdown', points[0]!.x, points[0]!.y);
    fire(gate, 'pointermove', points[0]!.x, points[0]!.y + 5000);
    expect(metricValue(container, 'Blocked Deviations')).toContain('1');

    const resetButton = Array.from(container.querySelectorAll('button')).find((b) =>
      /reset metrics/i.test(b.textContent ?? '')
    );
    expect(resetButton).toBeDefined();
    act(() => resetButton!.click());

    expect(metricValue(container, 'Blocked Deviations')).toContain('0');
    expect(metricValue(container, 'Successful Unlocks')).toContain('0');
  });
});
