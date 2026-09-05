import { euclideanDistance, segmentsIntersect } from './geometry.js';
import type { GeneratorOptions, Point2D, Segment, TrackPath } from './types.js';

/**
 * Lightweight deterministic pseudo-random number generator (Mulberry32).
 */
function createPrng(seed: number): () => number {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Procedurally generates a 2D rectilinear track path containing 90-degree heels.
 */
export function generateTrackPath(options: GeneratorOptions): TrackPath {
  const { bounds, gridStep = 24, margin = 16, heels = 2, seed } = options;

  const usableWidth = bounds.width - 2 * margin;
  const usableHeight = bounds.height - 2 * margin;

  const cols = Math.floor(usableWidth / gridStep);
  const rows = Math.floor(usableHeight / gridStep);

  if (cols < 2 || rows < 2) {
    throw new Error(
      `Insufficient bounds (${bounds.width}x${bounds.height}) or gridStep (${gridStep}) too large to generate track.`
    );
  }

  const rng = seed !== undefined ? createPrng(seed) : Math.random;

  // Resolve target heel count
  let targetHeels: number;
  if (typeof heels === 'number') {
    targetHeels = Math.max(1, heels);
  } else {
    const min = Math.max(1, heels.min);
    const max = Math.max(min, heels.max);
    targetHeels = Math.floor(rng() * (max - min + 1)) + min;
  }

  // Attempt to generate a non-self-intersecting path
  const maxAttempts = 100;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = tryGeneratePath(cols, rows, targetHeels, rng);
    if (candidate) {
      // Map grid coordinates to actual pixels
      const points: Point2D[] = candidate.map((gp) => ({
        x: margin + gp.x * gridStep,
        y: margin + gp.y * gridStep
      }));

      const segments: Segment[] = [];
      let totalLength = 0;

      for (let i = 0; i < points.length - 1; i++) {
        const start = points[i]!;
        const end = points[i + 1]!;
        const direction = start.y === end.y ? 'horizontal' : 'vertical';
        const length = euclideanDistance(start, end);
        totalLength += length;

        segments.push({
          start,
          end,
          direction,
          length
        });
      }

      return {
        points,
        segments,
        totalLength,
        heelCount: targetHeels
      };
    }
  }

  // Fallback deterministic standard rectilinear snake path if random attempts fail
  return generateDeterministicFallback(cols, rows, targetHeels, gridStep, margin);
}

interface GridPoint {
  x: number;
  y: number;
}

function tryGeneratePath(
  cols: number,
  rows: number,
  targetHeels: number,
  rng: () => number
): GridPoint[] | null {
  const startY = Math.floor(rng() * rows);
  const points: GridPoint[] = [{ x: 0, y: startY }];
  const segments: { start: GridPoint; end: GridPoint; dir: 'horizontal' | 'vertical' }[] = [];

  let isHorizontal = true;

  for (let step = 0; step <= targetHeels; step++) {
    const current = points[points.length - 1]!;
    const isLastSegment = step === targetHeels;

    let validMoves: GridPoint[] = [];

    if (isHorizontal) {
      // Move horizontally (primarily advancing right, or occasionally left if not last)
      const possibleX: number[] = [];
      for (let x = 0; x <= cols; x++) {
        if (x !== current.x) {
          if (isLastSegment ? x > current.x : true) {
            possibleX.push(x);
          }
        }
      }
      validMoves = possibleX.map((x) => ({ x, y: current.y }));
    } else {
      // Move vertically
      const possibleY: number[] = [];
      for (let y = 0; y <= rows; y++) {
        if (y !== current.y) {
          possibleY.push(y);
        }
      }
      validMoves = possibleY.map((y) => ({ x: current.x, y }));
    }

    // Filter candidate moves to eliminate intersections
    const legalMoves = validMoves.filter((next) => {
      const candidateSeg = {
        start: { x: current.x, y: current.y },
        end: { x: next.x, y: next.y },
        direction: isHorizontal ? ('horizontal' as const) : ('vertical' as const),
        length: Math.abs(current.x - next.x) + Math.abs(current.y - next.y)
      };

      for (const existing of segments) {
        const existSeg = {
          start: { x: existing.start.x, y: existing.start.y },
          end: { x: existing.end.x, y: existing.end.y },
          direction: existing.dir,
          length: Math.abs(existing.start.x - existing.end.x) + Math.abs(existing.start.y - existing.end.y)
        };

        if (segmentsIntersect(candidateSeg, existSeg, { excludeEndpoints: true })) {
          return false;
        }
      }
      return true;
    });

    if (legalMoves.length === 0) {
      return null;
    }

    // Pick a legal move
    const chosen = legalMoves[Math.floor(rng() * legalMoves.length)]!;
    segments.push({
      start: current,
      end: chosen,
      dir: isHorizontal ? 'horizontal' : 'vertical'
    });
    points.push(chosen);

    isHorizontal = !isHorizontal;
  }

  return points;
}

export function generateDeterministicFallback(
  cols: number,
  rows: number,
  targetHeels: number,
  gridStep: number,
  margin: number
): TrackPath {
  const points: Point2D[] = [];
  const segments: Segment[] = [];
  let totalLength = 0;

  const colStep = Math.max(1, Math.floor(cols / (targetHeels + 1)));
  let currX = 0;
  let currY = 0;
  points.push({ x: margin, y: margin });

  let isHorizontal = true;
  for (let i = 0; i <= targetHeels; i++) {
    const startPoint = points[points.length - 1]!;
    if (isHorizontal) {
      currX = Math.min(cols, currX + colStep);
    } else {
      currY = currY === 0 ? rows : 0;
    }

    const endPoint: Point2D = {
      x: margin + currX * gridStep,
      y: margin + currY * gridStep
    };

    const direction = isHorizontal ? 'horizontal' : 'vertical';
    const length = euclideanDistance(startPoint, endPoint);
    totalLength += length;

    segments.push({
      start: startPoint,
      end: endPoint,
      direction,
      length
    });
    points.push(endPoint);

    isHorizontal = !isHorizontal;
  }

  return {
    points,
    segments,
    totalLength,
    heelCount: targetHeels
  };
}
