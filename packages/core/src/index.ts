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

// Feedback Subsystem
export {
  FeedbackController,
  createFeedbackController,
  DEFAULT_HAPTIC_PATTERNS,
  DEFAULT_SOUND_FREQUENCIES,
  DEFAULT_SOUND_VOLUME
} from './feedback.js';

// Types & Interfaces
export type {
  Bounds,
  Direction,
  EngineOptions,
  FeedbackOptions,
  GeneratorOptions,
  GestureState,
  HeelCountConfig,
  HapticOptions,
  HapticPatterns,
  IntersectOptions,
  Point2D,
  ProjectedPoint,
  Segment,
  SoundFrequencies,
  SoundOptions,
  TrackPath
} from './types.js';
