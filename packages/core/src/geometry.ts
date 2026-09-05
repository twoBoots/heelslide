import type { Bounds, IntersectOptions, Point2D, ProjectedPoint, Segment } from './types.js';

/**
 * Calculates standard Euclidean distance between two 2D points.
 */
export function euclideanDistance(p1: Point2D, p2: Point2D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Projects a point onto a line segment, clamping to the segment boundaries [0, 1].
 */
export function projectPointOnSegment(point: Point2D, segment: Segment): ProjectedPoint {
  const dx = segment.end.x - segment.start.x;
  const dy = segment.end.y - segment.start.y;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) {
    const d = euclideanDistance(point, segment.start);
    return {
      point: { x: segment.start.x, y: segment.start.y },
      distance: d,
      t: 0
    };
  }

  // Parameter t of projection on line: t = dot(point - start, end - start) / |end - start|^2
  const tRaw = ((point.x - segment.start.x) * dx + (point.y - segment.start.y) * dy) / lengthSq;
  const t = Math.max(0, Math.min(1, tRaw));

  const projX = segment.start.x + t * dx;
  const projY = segment.start.y + t * dy;
  const projectedPoint: Point2D = { x: projX, y: projY };

  const distance = euclideanDistance(point, projectedPoint);

  return {
    point: projectedPoint,
    distance,
    t
  };
}

/**
 * Computes minimum distance from a point to a segment.
 */
export function distanceToSegment(point: Point2D, segment: Segment): number {
  return projectPointOnSegment(point, segment).distance;
}

/**
 * Checks if a point is within a given tolerance radius of a vertex.
 */
export function isNearVertex(point: Point2D, vertex: Point2D, tolerance: number): boolean {
  return euclideanDistance(point, vertex) <= tolerance;
}

/**
 * Checks if two 2D line segments intersect.
 */
export function segmentsIntersect(
  seg1: Segment,
  seg2: Segment,
  options?: IntersectOptions
): boolean {
  const p1 = seg1.start;
  const p2 = seg1.end;
  const p3 = seg2.start;
  const p4 = seg2.end;

  const ccw = (a: Point2D, b: Point2D, c: Point2D): number => {
    return (c.y - a.y) * (b.x - a.x) - (b.y - a.y) * (c.x - a.x);
  };

  const d1 = ccw(p1, p2, p3);
  const d2 = ccw(p1, p2, p4);
  const d3 = ccw(p3, p4, p1);
  const d4 = ccw(p3, p4, p2);

  if (options?.excludeEndpoints) {
    // Segments strictly cross internally without sharing an endpoint
    return (
      ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
      ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
    );
  }

  // Standard intersection check
  const hasOppositeSigns = (a: number, b: number): boolean => {
    return (a > 0 && b < 0) || (a < 0 && b > 0);
  };

  if (hasOppositeSigns(d1, d2) && hasOppositeSigns(d3, d4)) {
    return true;
  }

  // Collinear point-on-segment checks
  const onSegment = (p: Point2D, a: Point2D, b: Point2D): boolean => {
    return (
      p.x >= Math.min(a.x, b.x) &&
      p.x <= Math.max(a.x, b.x) &&
      p.y >= Math.min(a.y, b.y) &&
      p.y <= Math.max(a.y, b.y)
    );
  };

  if (d1 === 0 && onSegment(p3, p1, p2)) return true;
  if (d2 === 0 && onSegment(p4, p1, p2)) return true;
  if (d3 === 0 && onSegment(p1, p3, p4)) return true;
  if (d4 === 0 && onSegment(p2, p3, p4)) return true;

  return false;
}

/**
 * Validates whether a coordinate point sits inside bounds with optional margin.
 */
export function pointInBounds(point: Point2D, bounds: Bounds, margin = 0): boolean {
  return (
    point.x >= margin &&
    point.x <= bounds.width - margin &&
    point.y >= margin &&
    point.y <= bounds.height - margin
  );
}
