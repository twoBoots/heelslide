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

export interface EngineOptions {
  tolerance?: number;
  generator?: GeneratorOptions;
  accessible?: AccessibleOptions;
  onUnlock?: () => void;
  onReset?: () => void;
  onProgress?: (progress: number) => void;
  onStateChange?: (state: GestureState) => void;
  onAnnouncement?: (announcement: AccessibleAnnouncement) => void;
}

export interface AccessibleStep {
  segmentIndex: number;
  direction: Direction;
  startPoint: Point2D;
  endPoint: Point2D;
  instruction: string;
  progressAtEnd: number;
}

export type AccessibleAnnouncementType =
  | 'start'
  | 'step'
  | 'heel_reached'
  | 'progress'
  | 'unlock'
  | 'reset';

export interface AccessibleAnnouncement {
  type: AccessibleAnnouncementType;
  message: string;
  progress: number;
  timestamp: number;
}

export interface AccessibleOptions {
  enabled?: boolean;
  stepIncrement?: number;
  announceMessages?: Partial<Record<AccessibleAnnouncementType, (context: unknown) => string>>;
}

