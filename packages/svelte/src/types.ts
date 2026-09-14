import type { Snippet } from 'svelte';
import type {
  AccessibleAnnouncement,
  AccessibleStep,
  Bounds,
  Direction,
  EngineOptions,
  FeedbackOptions,
  GeneratorOptions,
  GestureState,
  HapticOptions,
  HapticPatterns,
  HeelCountConfig,
  Point2D,
  ProjectedPoint,
  Segment,
  SoundFrequencies,
  SoundOptions,
  TrackPath
} from '@heelslide/core';

export type {
  Bounds,
  Direction,
  EngineOptions,
  FeedbackOptions,
  GeneratorOptions,
  GestureState,
  HapticOptions,
  HapticPatterns,
  HeelCountConfig,
  Point2D,
  ProjectedPoint,
  Segment,
  SoundFrequencies,
  SoundOptions,
  TrackPath
};

/**
 * How the component serves non-pointer users. `stepped` binds the key map and renders a live
 * region; `custom` binds nothing, handing the host the stepping primitives instead.
 */
export type AccessibleFallbackMode = 'stepped' | 'custom';

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

  /** Advance along the path. Progress only — unlock requires `endGesture`. */
  stepForward: (amount?: number) => void;
  /** Retreat along the path, floored at the start or the last confirmed checkpoint. */
  stepBackward: (amount?: number) => void;
  /** Advance to the next heel vertex. */
  stepToNextHeel: () => void;
  /** One descriptor per segment, derived so path regeneration updates it. */
  readonly steps: AccessibleStep[];
  /** Single-sentence path summary, derived so path regeneration updates it. */
  readonly description: string;
  /** Most recent milestone, for rendering into a live region. */
  readonly announcement: AccessibleAnnouncement | null;
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
  initialState?: GestureState;
  initialProgress?: number;
  segmented?: boolean;
  checkpointTimeoutMs?: number;
  ariaLabel?: string;
  /** Defaults to `stepped`. */
  accessibleFallback?: AccessibleFallbackMode;
  class?: string;
  numberedHeels?: boolean;

  // Feedback options
  haptics?: boolean | HapticOptions;
  sound?: boolean | SoundOptions;

  // Turn Callbacks
  onturn?: (heelIndex: number) => void;
  onTurn?: (heelIndex: number) => void;

  // Checkpoint Callbacks
  oncheckpoint?: (heelIndex: number, progress: number) => void;
  onCheckpoint?: (heelIndex: number, progress: number) => void;

  // Svelte 5 Standard Lowercase Event Props
  onunlock?: () => void;
  onreset?: () => void;
  onprogress?: (progress: number) => void;
  onstatechange?: (state: GestureState) => void;

  // Accessibility announcements, in both casings like the events above.
  onannouncement?: (announcement: AccessibleAnnouncement) => void;
  onAnnouncement?: (announcement: AccessibleAnnouncement) => void;

  // CamelCase Compatibility Fallbacks
  onUnlock?: () => void;
  onReset?: () => void;
  onProgress?: (progress: number) => void;
  onStateChange?: (state: GestureState) => void;

  /** Content rendered inside the draggable handle. */
  children?: Snippet;
}
