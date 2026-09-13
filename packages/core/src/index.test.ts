import { describe, expect, it } from 'vitest';
import { VERSION } from './index.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** The manifest is the single source of truth; comparing against a duplicated literal
 *  cannot detect a bump that leaves the VERSION export behind. */
const manifest = JSON.parse(
  readFileSync(resolve(process.cwd(), 'packages/core/package.json'), 'utf8')
) as { version: string };


describe('Heelslide Core exports', () => {
  it('should export the current package version', () => {
    expect(VERSION).toBe(manifest.version);
  });

  it('should export FeedbackController and createFeedbackController', async () => {
    const core = await import('./index.js');
    expect(typeof core.FeedbackController).toBe('function');
    expect(typeof core.createFeedbackController).toBe('function');
    expect(core.DEFAULT_HAPTIC_PATTERNS).toBeDefined();
    expect(core.DEFAULT_SOUND_FREQUENCIES).toBeDefined();
  });
});
