/**
 * @heelslide/vue
 * Vue 3 component and headless composable for intentional-gesture security gates.
 */

export const VERSION = '0.1.0';

import type { DefineComponent } from 'vue';
import HeelslideComponent from './Heelslide.vue';
import type { HeelslideEmitsOptions, HeelslideProps } from './types.js';

// Component
export const Heelslide: DefineComponent<HeelslideProps, {}, {}, {}, {}, any, any, HeelslideEmitsOptions> =
  HeelslideComponent as unknown as DefineComponent<HeelslideProps, {}, {}, {}, {}, any, any, HeelslideEmitsOptions>;
export default Heelslide;

// Headless Composable
export { useHeelslide } from './useHeelslide.js';

// Types
export type {
  HeelslideProps,
  HeelslideEmits,
  HeelslideEmitsOptions,
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
