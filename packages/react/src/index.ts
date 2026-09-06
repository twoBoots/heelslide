/**
 * @heelslide/react
 * React 18/19 component adapter and headless hook for intentional heelslide gesture security gates.
 */

export const VERSION = '0.1.0';

// Presentation Component
export { Heelslide } from './Heelslide';

// Headless Hook & Helpers
export { useHeelslide, getPointAtProgress } from './useHeelslide';

// Types & Interfaces
export type {
  ContainerProps,
  HandleProps,
  HeelslideProps,
  UseHeelslideOptions,
  UseHeelslideReturn
} from './types';

// Re-export key core types for convenience
export type {
  GestureState,
  Point2D,
  Segment,
  TrackPath,
  GeneratorOptions,
  HeelCountConfig,
  FeedbackOptions,
  HapticOptions,
  SoundOptions,
  HapticPatterns,
  SoundFrequencies
} from '@heelslide/core';
