export interface Point2D {
  x: number;
  y: number;
}

export type Direction = 'horizontal' | 'vertical';

export interface Segment {
  start: Point2D;
  end: Point2D;
  direction: Direction;
  length: number;
}

export type HeelCountConfig = number | { min: number; max: number };

export interface Bounds {
  width: number;
  height: number;
}

export interface GeneratorOptions {
  bounds: Bounds;
  gridStep?: number;
  heels?: HeelCountConfig;
  margin?: number;
  seed?: number;
}

export interface TrackPath {
  points: Point2D[];
  segments: Segment[];
  totalLength: number;
  heelCount: number;
}

export type GestureState = 'idle' | 'active' | 'unlocked' | 'reset' | 'checkpoint';

/** Cardinal movement direction along a segment, resolved from its axis and sign. */
export type StepDirection = 'right' | 'left' | 'down' | 'up';

/**
 * One segment of the track, described for assistive technology. There is exactly one step per
 * entry in `TrackPath.segments`.
 */
export interface AccessibleStep {
  segmentIndex: number;
  direction: Direction;
  startPoint: Point2D;
  endPoint: Point2D;
  /** Screen-reader instruction, e.g. "Step 1 of 3: move right to the first turn". */
  instruction: string;
  /** Cumulative progress once this segment is fully traversed. */
  progressAtEnd: number;
}

export interface ProjectedPoint {
  point: Point2D;
  distance: number;
  t: number; // Parameter along segment [0..1]
}

export interface IntersectOptions {
  excludeEndpoints?: boolean;
}

export interface HapticPatterns {
  turn?: number | number[];
  reset?: number | number[];
  unlock?: number | number[];
}

export interface HapticOptions {
  enabled?: boolean;
  patterns?: HapticPatterns;
}

export interface SoundFrequencies {
  turn?: number;
  reset?: number;
  unlock?: number[];
}

export interface SoundOptions {
  enabled?: boolean;
  volume?: number; // Normalized [0..1], default 0.3
  frequencies?: SoundFrequencies;
}

export interface FeedbackOptions {
  haptics?: boolean | HapticOptions;
  sound?: boolean | SoundOptions;
}

/** Tuning for keyboard and switch-device operation. */
export interface AccessibleOptions {
  enabled?: boolean;
  /** Fraction of total path length advanced per step. Defaults to 0.1. */
  stepIncrement?: number;
}

export interface EngineOptions {
  tolerance?: number;
  accessible?: AccessibleOptions;
  generator?: GeneratorOptions;
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
}
