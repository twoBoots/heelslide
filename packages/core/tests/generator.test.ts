import { describe, expect, it } from 'vitest';
import { generateDeterministicFallback, generateTrackPath } from '../src/generator.js';
import { pointInBounds, segmentsIntersect } from '../src/geometry.js';
import type { GeneratorOptions } from '../src/types.js';

describe('Procedural Rectilinear Path Generator', () => {
  const defaultOptions: GeneratorOptions = {
    bounds: { width: 320, height: 160 },
    gridStep: 32,
    margin: 16,
    heels: 2
  };

  it('generates a path with exactly the configured fixed heel count', () => {
    const path = generateTrackPath({ ...defaultOptions, heels: 2 });
    expect(path.heelCount).toBe(2);
    // 2 heels means 3 segments and 4 points
    expect(path.segments.length).toBe(3);
    expect(path.points.length).toBe(4);
  });

  it('generates a path within the configured min/max heel range', () => {
    const path = generateTrackPath({ ...defaultOptions, heels: { min: 2, max: 4 } });
    expect(path.heelCount).toBeGreaterThanOrEqual(2);
    expect(path.heelCount).toBeLessThanOrEqual(4);
    expect(path.segments.length).toBe(path.heelCount + 1);
  });

  it('enforces that every turn is strictly a 90-degree angle (alternating horizontal/vertical)', () => {
    const path = generateTrackPath({ ...defaultOptions, heels: 3 });
    for (let i = 0; i < path.segments.length - 1; i++) {
      const current = path.segments[i]!;
      const next = path.segments[i + 1]!;
      expect(current.direction).not.toBe(next.direction);
      // Verify perpendicularity
      const isPerpendicular =
        (current.direction === 'horizontal' && next.direction === 'vertical') ||
        (current.direction === 'vertical' && next.direction === 'horizontal');
      expect(isPerpendicular).toBe(true);
    }
  });

  it('ensures all path points stay inside the container bounds', () => {
    const bounds = { width: 300, height: 200 };
    const margin = 20;
    const path = generateTrackPath({ bounds, gridStep: 20, margin, heels: 4 });

    for (const point of path.points) {
      expect(pointInBounds(point, bounds, margin - 1)).toBe(true);
    }
  });

  it('ensures generated paths do not self-intersect', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const path = generateTrackPath({ ...defaultOptions, heels: 4, seed });
      for (let i = 0; i < path.segments.length; i++) {
        for (let j = i + 1; j < path.segments.length; j++) {
          const seg1 = path.segments[i]!;
          const seg2 = path.segments[j]!;
          const intersects = segmentsIntersect(seg1, seg2, { excludeEndpoints: true });
          expect(intersects).toBe(false);
        }
      }
    }
  });

  it('is completely deterministic when provided a numeric seed', () => {
    const run1 = generateTrackPath({ ...defaultOptions, heels: 3, seed: 12345 });
    const run2 = generateTrackPath({ ...defaultOptions, heels: 3, seed: 12345 });

    expect(run1.points).toEqual(run2.points);
    expect(run1.totalLength).toBe(run2.totalLength);
  });

  it('calculates accurate total track length', () => {
    const path = generateTrackPath({ ...defaultOptions, heels: 2 });
    const calculatedLength = path.segments.reduce((acc, s) => acc + s.length, 0);
    expect(path.totalLength).toBe(calculatedLength);
    expect(path.totalLength).toBeGreaterThan(0);
  });

  it('throws a descriptive error when bounds or gridStep are invalid', () => {
    expect(() =>
      generateTrackPath({ bounds: { width: 10, height: 10 }, gridStep: 50, heels: 2 })
    ).toThrowError(/insufficient/i);
  });

  it('generates a valid rectilinear fallback path directly', () => {
    const fallback = generateDeterministicFallback(8, 4, 3, 24, 16);
    expect(fallback.heelCount).toBe(3);
    expect(fallback.segments.length).toBe(4);
    expect(fallback.totalLength).toBeGreaterThan(0);
  });
});
