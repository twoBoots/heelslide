# Technical Design: Monorepo Scaffolding & Core Gesture Engine

## Architecture Overview

`@heelslide/core` is a zero-dependency TypeScript library providing geometric calculation, procedural rectilinear path generation, and a gesture state machine.

```text
packages/core/src/
├── index.ts          # Public API exports
├── types.ts          # Core interfaces, configs, and state definitions
├── geometry.ts       # Distance-to-segment, projection, and collision helpers
├── generator.ts      # Rectilinear 2D path generator with 90-degree heel constraints
├── machine.ts        # Finite state machine (idle -> active -> unlocked | reset)
└── engine.ts         # HeelslideEngine orchestrator coordinating state & tracking
```

---

## Data Models & Interfaces

```typescript
export interface Point2D {
  x: number;
  y: number;
}

export interface Segment {
  start: Point2D;
  end: Point2D;
  direction: 'horizontal' | 'vertical';
  length: number;
}

export type HeelCountConfig = number | { min: number; max: number };

export interface GeneratorOptions {
  bounds: { width: number; height: number };
  gridStep?: number;
  heels?: HeelCountConfig;
  seed?: number;
}

export interface TrackPath {
  points: Point2D[];
  segments: Segment[];
  totalLength: number;
  heelCount: number;
}

export type GestureState = 'idle' | 'active' | 'unlocked' | 'reset';

export interface EngineOptions {
  tolerance?: number; // Default: 24px
  generator?: GeneratorOptions;
  onUnlock?: () => void;
  onReset?: () => void;
  onProgress?: (progress: number) => void;
  onStateChange?: (state: GestureState) => void;
}
```

---

## Component Logic

### 1. Rectilinear Path Generator (`generator.ts`)
- Maps the bounding dimensions into a discrete grid of `gridStep` intervals (e.g. 24px or 32px).
- Generates a path from the start point (e.g. `(0, y)`) to an exit target (e.g. `(width, y')`).
- Inserts exactly `N` direction changes (alternating between horizontal and vertical segments at 90-degree angles).
- Validates that consecutive segments do not backtrack, overlap, or self-intersect.
- If an optional integer `seed` is supplied, generation is fully deterministic (PRNG).

### 2. Geometry Engine (`geometry.ts`)
- Calculates the perpendicular distance from an arbitrary pointer position `(x, y)` to the current active segment.
- Calculates projected progress along the segment `[0..1]`.
- Determines when the pointer reaches within the turn vertex radius to advance to the next segment.

### 3. Gesture State Machine (`machine.ts` & `engine.ts`)
- **`idle`**: Awaiting touch/pointer down on the origin handle.
- **`active`**: Pointer is actively sliding. At each pointer move:
  - Project position to active segment.
  - If distance > `tolerance`, transition immediately to `reset` and fire `onReset`.
  - Advance active segment index when the heel corner is reached.
  - Update progress `[0..1]` and fire `onProgress(progress)`.
  - If end point is reached within tolerance, transition to `unlocked` and fire `onUnlock`.
- **`pointerup` before end**: Transitions immediately to `reset` and fires `onReset`.
- **`reset`**: Resets progress to 0 and transitions back to `idle`.

---

## Monorepo Configuration
- Root `package.json` with npm workspaces (`"packages/*"`, `"apps/*"`).
- Root `tsconfig.base.json` targeting ES2022 with TypeScript strict mode enabled.
- Root `.oxlintrc.json` configured for Oxc linting.
- Root `vitest.config.ts` running all workspace test suites and enforcing >80% coverage on statements, branches, and functions.
