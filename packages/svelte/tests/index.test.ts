// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import HeelslideDefault, { Heelslide, createHeelslide } from '../src/index.js';

describe('Public API Exports (@heelslide/svelte)', () => {
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
