import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const rootDir = path.resolve(__dirname, '..');

describe('Consumer Type Exports & Standalone Declarations', () => {
  describe('@heelslide/svelte Type Exports', () => {
    const svelteTypesPath = path.join(rootDir, 'packages', 'svelte', 'src', 'types.ts');

    it('should re-export Bounds, Direction, Segment, and ProjectedPoint from @heelslide/core', () => {
      const content = fs.readFileSync(svelteTypesPath, 'utf8');
      expect(content).toMatch(/\bBounds\b/);
      expect(content).toMatch(/\bDirection\b/);
      expect(content).toMatch(/\bSegment\b/);
      expect(content).toMatch(/\bProjectedPoint\b/);
    });
  });

  describe('@heelslide/react Type Exports', () => {
    const reactIndexPath = path.join(rootDir, 'packages', 'react', 'src', 'index.ts');

    it('should re-export Bounds and Direction from @heelslide/core', () => {
      const content = fs.readFileSync(reactIndexPath, 'utf8');
      expect(content).toMatch(/\bBounds\b/);
      expect(content).toMatch(/\bDirection\b/);
    });
  });

  describe('@heelslide/vue Standalone Declarations', () => {
    const vueIndexPath = path.join(rootDir, 'packages', 'vue', 'src', 'index.ts');

    it('should explicitly type Heelslide component as DefineComponent without unbundled SFC exports', () => {
      const content = fs.readFileSync(vueIndexPath, 'utf8');
      expect(content).toMatch(/DefineComponent/);
      // Must not use raw un-typed default re-export
      expect(content).not.toMatch(/export\s+\{\s*default\s+as\s+Heelslide\s*\}\s+from\s+['"]\.\/Heelslide\.vue['"]/);
    });
  });

  describe('@heelslide/svelte Standalone Declarations', () => {
    const svelteIndexPath = path.join(rootDir, 'packages', 'svelte', 'src', 'index.ts');

    it('should explicitly type Heelslide component as Svelte Component without unbundled SFC exports', () => {
      const content = fs.readFileSync(svelteIndexPath, 'utf8');
      expect(content).toMatch(/\bComponent\b/);
      // Must not use raw un-typed default re-export
      expect(content).not.toMatch(/export\s+\{\s*default\s+as\s+Heelslide,\s*default\s*\}\s+from\s+['"]\.\/Heelslide\.svelte['"]/);
    });
  });
});
