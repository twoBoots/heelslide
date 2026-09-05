import { describe, expect, it } from 'vitest';
import { VERSION } from '../src/index.js';

describe('Heelslide Core exports', () => {
  it('should export the current package version', () => {
    expect(VERSION).toBe('0.1.0');
  });

  it('should export accessibility utilities', async () => {
    const core = await import('../src/index.js');
    expect(core.getAccessibleSteps).toBeDefined();
    expect(core.getAccessibleDescription).toBeDefined();
    expect(core.getStepDirection).toBeDefined();
  });
});

