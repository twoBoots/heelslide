/**
 * @heelslide/vue
 * Vue 3 component and headless composable for intentional-gesture security gates.
 */

export const VERSION = '0.1.0';

// Component
export { default as Heelslide } from './Heelslide.vue';

// Headless Composable
export { useHeelslide } from './useHeelslide.js';

// Types
export type {
  HeelslideProps,
  HeelslideEmits,
  UseHeelslideOptions,
  UseHeelslideReturn
} from './types.js';

// Re-export core types commonly needed by consumers
export type {
  Bounds,
  Direction,
  EngineOptions,
  GeneratorOptions,
  GestureState,
  HeelCountConfig,
  Point2D,
  Segment,
  TrackPath,
  FeedbackOptions,
  HapticOptions,
  SoundOptions,
  HapticPatterns,
  SoundFrequencies
} from '@heelslide/core';
