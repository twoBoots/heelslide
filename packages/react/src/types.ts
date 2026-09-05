import type React from 'react';
import type {
  EngineOptions,
  GeneratorOptions,
  GestureState,
  HeelCountConfig,
  Point2D,
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
  onUnlock?: () => void;
  onReset?: () => void;
  onProgress?: (progress: number) => void;
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
