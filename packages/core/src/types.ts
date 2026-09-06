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

export type GestureState = 'idle' | 'active' | 'unlocked' | 'reset';

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

export interface EngineOptions {
  tolerance?: number;
  generator?: GeneratorOptions;
  haptics?: boolean | HapticOptions;
  sound?: boolean | SoundOptions;
  onTurn?: (heelIndex: number) => void;
  onUnlock?: () => void;
  onReset?: () => void;
  onProgress?: (progress: number) => void;
  onStateChange?: (state: GestureState) => void;
}
