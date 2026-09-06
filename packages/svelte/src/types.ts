import type {
  EngineOptions,
  FeedbackOptions,
  GeneratorOptions,
  GestureState,
  HapticOptions,
  HapticPatterns,
  HeelCountConfig,
  Point2D,
  SoundFrequencies,
  SoundOptions,
  TrackPath
} from '@heelslide/core';

export type {
  EngineOptions,
  FeedbackOptions,
  GeneratorOptions,
  GestureState,
  HapticOptions,
  HapticPatterns,
  HeelCountConfig,
  Point2D,
  SoundFrequencies,
  SoundOptions,
  TrackPath
};

export interface CreateHeelslideOptions extends EngineOptions {
  track?: TrackPath;
  containerElement?: HTMLElement | null;
}

export interface CreateHeelslideReturn {
  readonly state: GestureState;
  readonly progress: number;
  readonly track: TrackPath;
  readonly currentSegmentIndex: number;
  readonly handlePosition: Point2D;
  readonly isDragging: boolean;

  startGesture: (pointOrEvent: Point2D | PointerEvent) => boolean;
  updateGesture: (pointOrEvent: Point2D | PointerEvent) => void;
  endGesture: () => void;
  cancelGesture: () => void;
  reset: () => void;
  regeneratePath: (overrideOptions?: Partial<GeneratorOptions>) => TrackPath;
  setContainerElement: (element: HTMLElement | null) => void;
  destroy: () => void;
}

export interface HeelslideProps {
  track?: TrackPath;
  heels?: HeelCountConfig;
  tolerance?: number;
  bounds?: { width: number; height: number };
  gridStep?: number;
  margin?: number;
  seed?: number;
  disabled?: boolean;
  ariaLabel?: string;
  class?: string;
  numberedHeels?: boolean;

  // Feedback options
  haptics?: boolean | HapticOptions;
  sound?: boolean | SoundOptions;

  // Turn Callbacks
  onturn?: (heelIndex: number) => void;
  onTurn?: (heelIndex: number) => void;

  // Svelte 5 Standard Lowercase Event Props
  onunlock?: () => void;
  onreset?: () => void;
  onprogress?: (progress: number) => void;
  onstatechange?: (state: GestureState) => void;

  // CamelCase Compatibility Fallbacks
  onUnlock?: () => void;
  onReset?: () => void;
  onProgress?: (progress: number) => void;
  onStateChange?: (state: GestureState) => void;
}
