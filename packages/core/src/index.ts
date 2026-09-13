/**
 * @heelslide/core
 * Framework-agnostic gesture tracking and procedural 90-degree heel path engine.
 */

export const VERSION = '0.3.0';

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

// Accessibility: semantic path description
export {
  createDefaultAnnouncementMessage,
  getAccessibleDescription,
  getAccessibleSteps,
  getStepDirection,
  resolveKeyAction,
  KEY_SHORTCUTS,
  type KeyAction
} from './accessibility.js';

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
  AccessibleAnnouncement,
  AccessibleAnnouncementType,
  AccessibleOptions,
  AccessibleStep,
  AnnouncementContext,
  Bounds,
  Direction,
  EngineOptions,
  FeedbackOptions,
  GeneratorOptions,
  GestureState,
  HeelCountConfig,
  HapticOptions,
  HapticPatterns,
  InputModality,
  IntersectOptions,
  Point2D,
  ProjectedPoint,
  Segment,
  SoundFrequencies,
  SoundOptions,
  StepDirection,
  TrackPath
} from './types.js';
