import type React from 'react';
import type {
  EngineOptions,
  GeneratorOptions,
  GestureState,
  HapticOptions,
  HeelCountConfig,
  Point2D,
  SoundOptions,
  TrackPath
} from '@heelslide/core';

export interface UseHeelslideOptions extends EngineOptions {
  disabled?: boolean;
  track?: TrackPath;
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
}

export interface HeelslideProps {
  heels?: HeelCountConfig;
  tolerance?: number;
  disabled?: boolean;
  initialState?: GestureState;
  initialProgress?: number;
  haptics?: boolean | HapticOptions;
  sound?: boolean | SoundOptions;
  onTurn?: (heelIndex: number) => void;
  onUnlock?: () => void;
  onReset?: () => void;
  onProgress?: (progress: number) => void;
  onStateChange?: (state: GestureState) => void;
  numberedHeels?: boolean;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  gridStep?: number;
  margin?: number;
  seed?: number;
  ariaLabel?: string;
  children?: React.ReactNode;
}
