import { describe, expect, it } from 'vitest';
import { VERSION } from '../src/index.js';

describe('Heelslide Core exports', () => {
  it('should export the current package version', () => {
    expect(VERSION).toBe('0.1.0');
  });

  it('should export FeedbackController and createFeedbackController', async () => {
    const core = await import('../src/index.js');
    expect(typeof core.FeedbackController).toBe('function');
    expect(typeof core.createFeedbackController).toBe('function');
    expect(core.DEFAULT_HAPTIC_PATTERNS).toBeDefined();
    expect(core.DEFAULT_SOUND_FREQUENCIES).toBeDefined();
  });
});
