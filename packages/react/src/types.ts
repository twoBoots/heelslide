import type React from 'react';
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

/**
 * How the component serves non-pointer users.
 *
 * - `stepped` binds the key map and renders a live region.
 * - `custom` binds nothing and renders no live region, handing the host the stepping primitives
 *   so it can build its own accessible flow.
 *
 * Written as a union so a third mode can be added without a breaking change.
 */
export type AccessibleFallbackMode = 'stepped' | 'custom';

export interface UseHeelslideOptions extends EngineOptions {
  disabled?: boolean;
  track?: TrackPath;
  onAnnouncement?: (announcement: AccessibleAnnouncement) => void;
}

export interface ContainerProps {
  onPointerDown: (event: React.PointerEvent) => void;
  onPointerMove: (event: React.PointerEvent) => void;
  onPointerUp: (event: React.PointerEvent) => void;
  onPointerCancel: (event: React.PointerEvent) => void;
}

export interface HandleProps {
  onPointerDown: (event: React.PointerEvent) => void;
  style: React.CSSProperties;
}

export interface UseHeelslideReturn {
  state: GestureState;
  progress: number;
  track: TrackPath;
  currentSegmentIndex: number;
  handlePosition: Point2D;
  isDragging: boolean;
  regenerate: (options?: Partial<GeneratorOptions>) => void;
  reset: () => void;
  getContainerProps: () => ContainerProps;
  getHandleProps: () => HandleProps;
  /** Advance along the path. Progress only — unlock requires `confirm`. */
  stepForward: (amount?: number) => void;
  /** Retreat along the path, floored at the start or the last confirmed checkpoint. */
  stepBackward: (amount?: number) => void;
  /** Advance to the next heel vertex. */
  stepToNextHeel: () => void;
  /** Attempt to complete the gesture, on the same terms as releasing a pointer. */
  confirm: () => void;
  /** One descriptor per segment of the active track. */
  steps: AccessibleStep[];
  /** Single-sentence summary of the path, for `aria-describedby`. */
  description: string;
  /** Most recent milestone, for rendering into a live region. */
  announcement: AccessibleAnnouncement | null;
}

export interface HeelslideProps {
  /** Explicit track override; when supplied the generator is bypassed. */
  track?: TrackPath;
  heels?: HeelCountConfig;
  tolerance?: number;
  /**
   * Container dimensions. Preferred over `width`/`height`, and consistent with
   * `@heelslide/vue` and `@heelslide/svelte`.
   */
  bounds?: Bounds;
  disabled?: boolean;
  initialState?: GestureState;
  initialProgress?: number;
  haptics?: boolean | HapticOptions;
  sound?: boolean | SoundOptions;
  segmented?: boolean;
  checkpointTimeoutMs?: number;
  onTurn?: (heelIndex: number) => void;
  onCheckpoint?: (heelIndex: number, progress: number) => void;
  onUnlock?: () => void;
  onReset?: () => void;
  onProgress?: (progress: number) => void;
  onStateChange?: (state: GestureState) => void;
  numberedHeels?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** @deprecated Use `bounds`. Retained as an alias; `bounds` wins when both are supplied. */
  width?: number;
  /** @deprecated Use `bounds`. Retained as an alias; `bounds` wins when both are supplied. */
  height?: number;
  gridStep?: number;
  margin?: number;
  seed?: number;
  ariaLabel?: string;
  /** Defaults to `stepped`. */
  accessibleFallback?: AccessibleFallbackMode;
  onAnnouncement?: (announcement: AccessibleAnnouncement) => void;
  children?: React.ReactNode;
}
