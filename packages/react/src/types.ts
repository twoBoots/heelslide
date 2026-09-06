import type React from 'react';
import type {
  AccessibleAnnouncement,
  EngineOptions,
  GeneratorOptions,
  GestureState,
  HeelCountConfig,
  Point2D,
  TrackPath
} from '@heelslide/core';

export type AccessibleFallbackMode = 'stepped' | 'dialog' | 'custom';

export interface UseHeelslideOptions extends EngineOptions {
  disabled?: boolean;
  track?: TrackPath;
  accessibleFallback?: AccessibleFallbackMode;
  onAnnouncement?: (announcement: AccessibleAnnouncement) => void;
}

export interface ContainerProps {
  onPointerDown: (event: React.PointerEvent) => void;
  onPointerMove: (event: React.PointerEvent) => void;
  onPointerUp: (event: React.PointerEvent) => void;
  onPointerCancel: (event: React.PointerEvent) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  tabIndex?: number;
}

export interface HandleProps {
  onPointerDown: (event: React.PointerEvent) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  tabIndex?: number;
  style: React.CSSProperties;
}

export interface UseHeelslideReturn {
  state: GestureState;
  progress: number;
  track: TrackPath;
  handlePosition: Point2D;
  isDragging: boolean;
  announcement: string | null;
  isFallbackOpen: boolean;
  openFallback: () => void;
  closeFallback: () => void;
  confirmFallback: () => void;
  stepForward: (amount?: number) => number;
  stepBackward: (amount?: number) => number;
  stepToNextHeel: () => number;
  regenerate: (options?: Partial<GeneratorOptions>) => void;
  reset: () => void;
  getContainerProps: () => ContainerProps;
  getHandleProps: () => HandleProps;
}

export interface HeelslideProps {
  heels?: HeelCountConfig;
  tolerance?: number;
  disabled?: boolean;
  accessibleFallback?: AccessibleFallbackMode;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  accessibleButtonText?: string;
  renderAccessibleFallback?: (props: {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }) => React.ReactNode;
  onUnlock?: () => void;
  onReset?: () => void;
  onProgress?: (progress: number) => void;
  onStateChange?: (state: GestureState) => void;
  onAnnouncement?: (announcement: AccessibleAnnouncement) => void;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  gridStep?: number;
  margin?: number;
  seed?: number;
  children?: React.ReactNode;
}
