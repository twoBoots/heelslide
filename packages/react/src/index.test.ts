import { describe, expect, it } from 'vitest';
import { Heelslide, useHeelslide, getPointAtProgress, VERSION } from './index.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** The manifest is the single source of truth; comparing against a duplicated literal
 *  cannot detect a bump that leaves the VERSION export behind. */
const manifest = JSON.parse(
  readFileSync(resolve(process.cwd(), 'packages/react/package.json'), 'utf8')
) as { version: string };


describe('Heelslide React barrel exports', () => {
  it('should export the current package version', () => {
    expect(VERSION).toBe(manifest.version);
  });

  it('should export Heelslide component and useHeelslide hook', () => {
    expect(Heelslide).toBeDefined();
    expect(typeof useHeelslide).toBe('function');
    expect(typeof getPointAtProgress).toBe('function');
  });
});
