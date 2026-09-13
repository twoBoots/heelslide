// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import HeelslideDefault, { Heelslide, createHeelslide, VERSION } from './index.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** The manifest is the single source of truth; comparing against a duplicated literal
 *  cannot detect a bump that leaves the VERSION export behind. */
const manifest = JSON.parse(
  readFileSync(resolve(process.cwd(), 'packages/svelte/package.json'), 'utf8')
) as { version: string };


describe('Public API Exports (@heelslide/svelte)', () => {
  it('exports package version', () => {
    expect(VERSION).toBe(manifest.version);
  });

  it('exports Heelslide as default and named export', () => {
    expect(HeelslideDefault).toBeDefined();
    expect(Heelslide).toBeDefined();
    expect(HeelslideDefault).toBe(Heelslide);
  });

  it('exports createHeelslide composable function', () => {
    expect(typeof createHeelslide).toBe('function');
  });

  it('allows instantiating createHeelslide from package export', () => {
    const inst = createHeelslide();
    expect(inst.state).toBe('idle');
    expect(inst.progress).toBe(0);
    expect(inst.track.points.length).toBeGreaterThan(0);
  });
});
