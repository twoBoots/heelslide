import type {
  Bounds,
  EngineOptions,
  GeneratorOptions,
  GestureState,
  HapticOptions,
  HeelCountConfig,
  Point2D,
  SoundOptions,
  TrackPath
} from '@heelslide/core';
import type { ComputedRef, Ref } from 'vue';

export interface UseHeelslideOptions extends EngineOptions {
  track?: TrackPath;
  containerRef?: Ref<HTMLElement | null | undefined>;
}

export interface UseHeelslideReturn {
  state: Readonly<Ref<GestureState>>;
  progress: Readonly<Ref<number>>;
  track: Readonly<Ref<TrackPath>>;
  currentSegmentIndex: Readonly<Ref<number>>;
  handlePosition: ComputedRef<Point2D>;
  isDragging: ComputedRef<boolean>;
  startGesture: (pointOrEvent: Point2D | PointerEvent) => boolean;
  updateGesture: (pointOrEvent: Point2D | PointerEvent) => void;
  endGesture: () => void;
  cancelGesture: () => void;
  reset: () => void;
  regeneratePath: (overrideOptions?: Partial<GeneratorOptions>) => TrackPath;
}

export interface HeelslideProps {
  track?: TrackPath;
  heels?: HeelCountConfig;
  tolerance?: number;
  bounds?: Bounds;
  gridStep?: number;
  margin?: number;
  seed?: number;
  disabled?: boolean;
  ariaLabel?: string;
  haptics?: boolean | HapticOptions;
  sound?: boolean | SoundOptions;
  onTurn?: (heelIndex: number) => void;
  onUnlock?: () => void;
  onReset?: () => void;
  onProgress?: (progress: number) => void;
  onStateChange?: (state: GestureState) => void;
}

export interface HeelslideEmits {
  (e: 'unlock'): void;
  (e: 'reset'): void;
  (e: 'progress', progress: number): void;
  (e: 'stateChange', state: GestureState): void;
  (e: 'turn', heelIndex: number): void;
}

export type HeelslideEmitsOptions = {
  unlock: () => void;
  reset: () => void;
  progress: (progress: number) => void;
  stateChange: (state: GestureState) => void;
  turn: (heelIndex: number) => void;
};
