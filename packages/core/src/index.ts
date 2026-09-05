/**
 * @heelslide/core
 * Framework-agnostic gesture tracking and procedural 90-degree heel path engine.
 */

export const VERSION = '0.1.0';

// Core Orchestrator
export { HeelslideEngine, type HeelslideEngineOptions } from './engine.js';

// State Machine
export {
  createGestureStateMachine,
  type GestureStateMachine,
  type StateMachineOptions
} from './machine.js';

// Generator
export { generateDeterministicFallback, generateTrackPath } from './generator.js';

// Geometry Utilities
export {
  distanceToSegment,
  euclideanDistance,
  isNearVertex,
  pointInBounds,
  projectPointOnSegment,
  segmentsIntersect
} from './geometry.js';

// Types & Interfaces
export type {
  Bounds,
  Direction,
  EngineOptions,
  GeneratorOptions,
  GestureState,
  HeelCountConfig,
  IntersectOptions,
  Point2D,
  ProjectedPoint,
  Segment,
  TrackPath
} from './types.js';
