import { describe, expect, it } from 'vitest';
import {
  distanceToSegment,
  euclideanDistance,
  isNearVertex,
  pointInBounds,
  projectPointOnSegment,
  segmentsIntersect
} from '../src/geometry.js';
import type { Point2D, Segment } from '../src/types.js';

describe('Geometry Utilities', () => {
  describe('euclideanDistance', () => {
    it('calculates distance between two points', () => {
      const p1: Point2D = { x: 0, y: 0 };
      const p2: Point2D = { x: 3, y: 4 };
      expect(euclideanDistance(p1, p2)).toBe(5);
    });
  });

  describe('projectPointOnSegment', () => {
    const horizontalSeg: Segment = {
      start: { x: 0, y: 10 },
      end: { x: 100, y: 10 },
      direction: 'horizontal',
      length: 100
    };

    it('projects a point directly on the segment', () => {
      const point: Point2D = { x: 50, y: 15 };
      const proj = projectPointOnSegment(point, horizontalSeg);
      expect(proj.t).toBeCloseTo(0.5);
      expect(proj.point.x).toBeCloseTo(50);
      expect(proj.point.y).toBeCloseTo(10);
      expect(proj.distance).toBeCloseTo(5);
    });

    it('clamps projection before start of segment', () => {
      const point: Point2D = { x: -20, y: 10 };
      const proj = projectPointOnSegment(point, horizontalSeg);
      expect(proj.t).toBe(0);
      expect(proj.point.x).toBe(0);
      expect(proj.distance).toBe(20);
    });

    it('clamps projection after end of segment', () => {
      const point: Point2D = { x: 150, y: 10 };
      const proj = projectPointOnSegment(point, horizontalSeg);
      expect(proj.t).toBe(1);
      expect(proj.point.x).toBe(100);
      expect(proj.distance).toBe(50);
    });

    it('handles zero-length segments gracefully', () => {
      const zeroSeg: Segment = {
        start: { x: 20, y: 20 },
        end: { x: 20, y: 20 },
        direction: 'horizontal',
        length: 0
      };
      const proj = projectPointOnSegment({ x: 25, y: 20 }, zeroSeg);
      expect(proj.t).toBe(0);
      expect(proj.distance).toBe(5);
    });
  });

  describe('distanceToSegment', () => {
    const verticalSeg: Segment = {
      start: { x: 50, y: 0 },
      end: { x: 50, y: 100 },
      direction: 'vertical',
      length: 100
    };

    it('returns perpendicular distance when within segment span', () => {
      const point: Point2D = { x: 65, y: 50 };
      expect(distanceToSegment(point, verticalSeg)).toBe(15);
    });
  });

  describe('isNearVertex', () => {
    it('returns true when point is within tolerance radius of vertex', () => {
      const vertex: Point2D = { x: 100, y: 100 };
      expect(isNearVertex({ x: 110, y: 100 }, vertex, 15)).toBe(true);
      expect(isNearVertex({ x: 120, y: 100 }, vertex, 15)).toBe(false);
    });
  });

  describe('segmentsIntersect', () => {
    it('detects perpendicular intersecting segments', () => {
      const seg1: Segment = {
        start: { x: 0, y: 50 },
        end: { x: 100, y: 50 },
        direction: 'horizontal',
        length: 100
      };
      const seg2: Segment = {
        start: { x: 50, y: 0 },
        end: { x: 50, y: 100 },
        direction: 'vertical',
        length: 100
      };
      expect(segmentsIntersect(seg1, seg2)).toBe(true);
    });

    it('returns false for parallel non-overlapping segments', () => {
      const seg1: Segment = {
        start: { x: 0, y: 0 },
        end: { x: 100, y: 0 },
        direction: 'horizontal',
        length: 100
      };
      const seg2: Segment = {
        start: { x: 0, y: 50 },
        end: { x: 100, y: 50 },
        direction: 'horizontal',
        length: 100
      };
      expect(segmentsIntersect(seg1, seg2)).toBe(false);
    });

    it('returns false when segments share a corner endpoint', () => {
      const seg1: Segment = {
        start: { x: 0, y: 0 },
        end: { x: 50, y: 0 },
        direction: 'horizontal',
        length: 50
      };
      const seg2: Segment = {
        start: { x: 50, y: 0 },
        end: { x: 50, y: 50 },
        direction: 'vertical',
        length: 50
      };
      // Endpoint sharing at heel corner is expected and not considered collision
      expect(segmentsIntersect(seg1, seg2, { excludeEndpoints: true })).toBe(false);
    });

    it('detects collinear overlapping segments', () => {
      const seg1: Segment = {
        start: { x: 0, y: 0 },
        end: { x: 50, y: 0 },
        direction: 'horizontal',
        length: 50
      };
      const seg2: Segment = {
        start: { x: 25, y: 0 },
        end: { x: 75, y: 0 },
        direction: 'horizontal',
        length: 50
      };
      expect(segmentsIntersect(seg1, seg2)).toBe(true);
    });

    it('returns false for collinear disjoint segments', () => {
      const seg1: Segment = {
        start: { x: 0, y: 0 },
        end: { x: 20, y: 0 },
        direction: 'horizontal',
        length: 20
      };
      const seg2: Segment = {
        start: { x: 40, y: 0 },
        end: { x: 60, y: 0 },
        direction: 'horizontal',
        length: 20
      };
      expect(segmentsIntersect(seg1, seg2)).toBe(false);
    });
  });

  describe('pointInBounds', () => {
    const bounds = { width: 300, height: 150 };

    it('validates coordinates against bounds with margin', () => {
      expect(pointInBounds({ x: 50, y: 50 }, bounds, 0)).toBe(true);
      expect(pointInBounds({ x: -5, y: 50 }, bounds, 0)).toBe(false);
      expect(pointInBounds({ x: 305, y: 50 }, bounds, 0)).toBe(false);
      expect(pointInBounds({ x: 50, y: 155 }, bounds, 0)).toBe(false);
    });
  });
});
