import type {
  AccessibleAnnouncement,
  Bounds,
  EngineOptions,
  GeneratorOptions,
  GestureState,
  HeelCountConfig,
  Point2D,
  TrackPath
} from '@heelslide/core';
import type { ComputedRef, Ref } from 'vue';

export type AccessibleFallbackMode = 'stepped' | 'dialog' | 'custom';

export interface UseHeelslideOptions extends EngineOptions {
  track?: TrackPath;
  containerRef?: Ref<HTMLElement | null | undefined>;
  disabled?: boolean;
  accessibleFallback?: AccessibleFallbackMode;
  onAnnouncement?: (announcement: AccessibleAnnouncement) => void;
}

export interface UseHeelslideReturn {
  state: Readonly<Ref<GestureState>>;
  progress: Readonly<Ref<number>>;
  track: Readonly<Ref<TrackPath>>;
  currentSegmentIndex: Readonly<Ref<number>>;
  handlePosition: ComputedRef<Point2D>;
  isDragging: ComputedRef<boolean>;
  announcement: Readonly<Ref<string | null>>;
  isFallbackOpen: Readonly<Ref<boolean>>;
  startGesture: (pointOrEvent: Point2D | PointerEvent) => boolean;
  updateGesture: (pointOrEvent: Point2D | PointerEvent) => void;
  endGesture: () => void;
  cancelGesture: () => void;
  reset: () => void;
  regeneratePath: (overrideOptions?: Partial<GeneratorOptions>) => TrackPath;
  stepForward: (amount?: number) => number;
  stepBackward: (amount?: number) => number;
  stepToNextHeel: () => number;
  handleKeyDown: (event: KeyboardEvent) => void;
  openFallback: () => void;
  closeFallback: () => void;
  confirmFallback: () => void;
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
  accessibleFallback?: AccessibleFallbackMode;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  accessibleButtonText?: string;
  onUnlock?: () => void;
  onReset?: () => void;
  onProgress?: (progress: number) => void;
  onStateChange?: (state: GestureState) => void;
  onAnnouncement?: (announcement: AccessibleAnnouncement) => void;
}

export interface HeelslideEmits {
  (e: 'unlock'): void;
  (e: 'reset'): void;
  (e: 'progress', progress: number): void;
  (e: 'stateChange', state: GestureState): void;
  (e: 'announcement', announcement: AccessibleAnnouncement): void;
  (e: 'fallbackOpen'): void;
  (e: 'fallbackClose'): void;
}
