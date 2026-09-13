import type {
  AccessibleAnnouncement,
  AccessibleStep,
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

/**
 * How the component serves non-pointer users. `stepped` binds the key map and renders a live
 * region; `custom` binds nothing, handing the host the stepping primitives instead. A union so a
 * third mode can arrive without a breaking change.
 */
export type AccessibleFallbackMode = 'stepped' | 'custom';

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
  /** Advance along the path. Progress only — unlock requires `endGesture`. */
  stepForward: (amount?: number) => void;
  /** Retreat along the path, floored at the start or the last confirmed checkpoint. */
  stepBackward: (amount?: number) => void;
  /** Advance to the next heel vertex. */
  stepToNextHeel: () => void;
  /** One descriptor per segment, recomputed when the path regenerates. */
  steps: ComputedRef<AccessibleStep[]>;
  /** Single-sentence path summary, recomputed when the path regenerates. */
  description: ComputedRef<string>;
  /** Most recent milestone, for rendering into a live region. */
  announcement: Readonly<Ref<AccessibleAnnouncement | null>>;
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
  initialState?: GestureState;
  initialProgress?: number;
  segmented?: boolean;
  checkpointTimeoutMs?: number;
  ariaLabel?: string;
  /** Defaults to `stepped`. */
  accessibleFallback?: AccessibleFallbackMode;
  haptics?: boolean | HapticOptions;
  sound?: boolean | SoundOptions;
  numberedHeels?: boolean;
  onTurn?: (heelIndex: number) => void;
  onCheckpoint?: (heelIndex: number, progress: number) => void;
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
  (e: 'checkpoint', payload: { heelIndex: number; progress: number }): void;
  (e: 'announcement', announcement: AccessibleAnnouncement): void;
}

export type HeelslideEmitsOptions = {
  unlock: () => void;
  reset: () => void;
  progress: (progress: number) => void;
  stateChange: (state: GestureState) => void;
  turn: (heelIndex: number) => void;
  checkpoint: (payload: { heelIndex: number; progress: number }) => void;
  announcement: (announcement: AccessibleAnnouncement) => void;
};
