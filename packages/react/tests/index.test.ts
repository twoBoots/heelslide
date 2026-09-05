import { describe, expect, it } from 'vitest';
import { Heelslide, useHeelslide, getPointAtProgress, VERSION } from '../src/index.js';

describe('Heelslide React barrel exports', () => {
  it('should export the current package version', () => {
    expect(VERSION).toBe('0.1.0');
  });

  it('should export Heelslide component and useHeelslide hook', () => {
    expect(Heelslide).toBeDefined();
    expect(typeof useHeelslide).toBe('function');
    expect(typeof getPointAtProgress).toBe('function');
  });
});
