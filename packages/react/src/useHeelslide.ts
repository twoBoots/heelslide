import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HeelslideEngine, type Point2D, type TrackPath, type GestureState, type GeneratorOptions } from '@heelslide/core';
import type { ContainerProps, HandleProps, UseHeelslideOptions, UseHeelslideReturn } from './types';

export function getPointAtProgress(track: TrackPath, progress: number): Point2D {
  if (!track.points || track.points.length === 0) {
    return { x: 0, y: 0 };
  }
  if (progress <= 0 || track.segments.length === 0) {
    return track.points[0]!;
  }
  if (progress >= 1) {
    return track.points[track.points.length - 1]!;
  }

  const targetDistance = progress * track.totalLength;
  let accumulated = 0;

  for (const segment of track.segments) {
    const nextAccumulated = accumulated + segment.length;
    if (targetDistance <= nextAccumulated || segment === track.segments[track.segments.length - 1]) {
      const segmentDistance = targetDistance - accumulated;
      const t = segment.length > 0 ? Math.min(1, Math.max(0, segmentDistance / segment.length)) : 0;
      return {
        x: segment.start.x + t * (segment.end.x - segment.start.x),
        y: segment.start.y + t * (segment.end.y - segment.start.y)
      };
    }
    accumulated = nextAccumulated;
  }

  return track.points[track.points.length - 1]!;
}

export function useHeelslide(options: UseHeelslideOptions = {}): UseHeelslideReturn {
  const {
    tolerance = 24,
    generator,
    track: initialTrack,
    disabled = false,
    accessible,
    accessibleFallback = 'stepped',
    onUnlock,
    onReset,
    onProgress,
    onStateChange,
    onAnnouncement
  } = options;

  const callbacksRef = useRef({ onUnlock, onReset, onProgress, onStateChange, onAnnouncement });
  useEffect(() => {
    callbacksRef.current = { onUnlock, onReset, onProgress, onStateChange, onAnnouncement };
  });

  const [state, setState] = useState<GestureState>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [isFallbackOpen, setIsFallbackOpen] = useState<boolean>(false);

  const engine = useMemo(() => {
    return new HeelslideEngine({
      tolerance,
      generator,
      track: initialTrack,
      accessible,
      onProgress: (p) => {
        setProgress(p);
        callbacksRef.current.onProgress?.(p);
      },
      onUnlock: () => {
        setState('unlocked');
        callbacksRef.current.onUnlock?.();
      },
      onReset: () => {
        setState('idle');
        setProgress(0);
        callbacksRef.current.onReset?.();
      },
      onStateChange: (s) => {
        setState(s);
        callbacksRef.current.onStateChange?.(s);
      },
      onAnnouncement: (ann) => {
        setAnnouncement(ann.message);
        callbacksRef.current.onAnnouncement?.(ann);
      }
    });
  }, [tolerance, generator, initialTrack, accessible]);

  const [track, setTrack] = useState<TrackPath>(() => engine.getPath());

  useEffect(() => {
    setTrack(engine.getPath());
    setState(engine.getState());
    setProgress(engine.getProgress());
    setAnnouncement(engine.getAccessibleDescription());
  }, [engine]);

  // Handle unmount teardown
  useEffect(() => {
    return () => {
      engine.reset();
    };
  }, [engine]);

  const handlePosition = useMemo(() => {
    return getPointAtProgress(track, progress);
  }, [track, progress]);

  const isDragging = state === 'active';

  const reset = useCallback(() => {
    engine.reset();
    setState('idle');
    setProgress(0);
    setIsFallbackOpen(false);
  }, [engine]);

  const openFallback = useCallback(() => {
    setIsFallbackOpen(true);
  }, []);

  const closeFallback = useCallback(() => {
    setIsFallbackOpen(false);
  }, []);

  const confirmFallback = useCallback(() => {
    setIsFallbackOpen(false);
    setState('unlocked');
    setProgress(1);
    setAnnouncement('Security gate unlocked successfully.');
    callbacksRef.current.onUnlock?.();
  }, []);

  const stepForward = useCallback(
    (amount?: number) => {
      if (disabled) return progress;
      const newProgress = engine.stepForward(amount);
      setProgress(newProgress);
      setState(engine.getState());
      return newProgress;
    },
    [disabled, engine, progress]
  );

  const stepBackward = useCallback(
    (amount?: number) => {
      if (disabled) return progress;
      const newProgress = engine.stepBackward(amount);
      setProgress(newProgress);
      setState(engine.getState());
      return newProgress;
    },
    [disabled, engine, progress]
  );

  const stepToNextHeel = useCallback(() => {
    if (disabled) return progress;
    const newProgress = engine.stepToNextHeel();
    setProgress(newProgress);
    setState(engine.getState());
    return newProgress;
  }, [disabled, engine, progress]);

  const regenerate = useCallback(
    (overrideOptions?: Partial<GeneratorOptions>) => {
      const newTrack = engine.regeneratePath(overrideOptions);
      setTrack(newTrack);
      setState('idle');
      setProgress(0);
      setIsFallbackOpen(false);
      setAnnouncement(engine.getAccessibleDescription());
    },
    [engine]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (disabled) return;
      if (typeof event.preventDefault === 'function') {
        event.preventDefault();
      }

      const currentTarget = event.currentTarget as HTMLElement | SVGElement | null;
      if (!currentTarget) return;

      const rect = currentTarget.getBoundingClientRect();
      const point: Point2D = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };

      const started = engine.startGesture(point);
      if (started) {
        if (typeof currentTarget.setPointerCapture === 'function') {
          try {
            currentTarget.setPointerCapture(event.pointerId);
          } catch {
            // ignore
          }
        }
      }
    },
    [disabled, engine]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (disabled || engine.getState() !== 'active') return;
      if (typeof event.preventDefault === 'function') {
        event.preventDefault();
      }

      const currentTarget = event.currentTarget as HTMLElement | SVGElement | null;
      if (!currentTarget) return;

      const rect = currentTarget.getBoundingClientRect();
      const point: Point2D = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };

      engine.updateGesture(point);
    },
    [disabled, engine]
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent) => {
      if (engine.getState() === 'active') {
        const currentTarget = event.currentTarget as HTMLElement | SVGElement | null;
        if (currentTarget && typeof currentTarget.releasePointerCapture === 'function') {
          try {
            currentTarget.releasePointerCapture(event.pointerId);
          } catch {
            // ignore
          }
        }
        engine.endGesture();
      }
    },
    [engine]
  );

  const handlePointerCancel = useCallback(
    (event: React.PointerEvent) => {
      if (engine.getState() === 'active') {
        const currentTarget = event.currentTarget as HTMLElement | SVGElement | null;
        if (currentTarget && typeof currentTarget.releasePointerCapture === 'function') {
          try {
            currentTarget.releasePointerCapture(event.pointerId);
          } catch {
            // ignore
          }
        }
        engine.cancelGesture();
      }
    },
    [engine]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown': {
          event.preventDefault();
          stepForward();
          break;
        }
        case 'ArrowLeft':
        case 'ArrowUp': {
          event.preventDefault();
          stepBackward();
          break;
        }
        case 'Home': {
          event.preventDefault();
          reset();
          break;
        }
        case 'Escape': {
          event.preventDefault();
          if (isFallbackOpen) {
            closeFallback();
          } else {
            reset();
          }
          break;
        }
        case ' ':
        case 'Enter': {
          event.preventDefault();
          if (isFallbackOpen) {
            confirmFallback();
          } else if (state === 'idle' && accessibleFallback === 'dialog') {
            openFallback();
          } else if (progress >= 0.95 || state === 'active') {
            stepForward();
          }
          break;
        }
        case 'End': {
          event.preventDefault();
          break;
        }
        default:
          break;
      }
    },
    [
      disabled,
      stepForward,
      stepBackward,
      reset,
      isFallbackOpen,
      closeFallback,
      confirmFallback,
      state,
      accessibleFallback,
      openFallback,
      progress
    ]
  );

  const getContainerProps = useCallback(
    (): ContainerProps => ({
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      onKeyDown: handleKeyDown,
      tabIndex: disabled ? -1 : 0
    }),
    [handlePointerDown, handlePointerMove, handlePointerUp, handlePointerCancel, handleKeyDown, disabled]
  );

  const getHandleProps = useCallback(
    (): HandleProps => ({
      onPointerDown: handlePointerDown,
      onKeyDown: handleKeyDown,
      tabIndex: disabled ? -1 : 0,
      style: {
        position: 'absolute',
        left: `${handlePosition.x}px`,
        top: `${handlePosition.y}px`,
        transform: 'translate(-50%, -50%)',
        cursor: disabled ? 'not-allowed' : (isDragging ? 'grabbing' : 'grab'),
        touchAction: 'none',
        userSelect: 'none'
      }
    }),
    [handlePointerDown, handleKeyDown, handlePosition.x, handlePosition.y, disabled, isDragging]
  );

  return {
    state,
    progress,
    track,
    handlePosition,
    isDragging,
    announcement,
    isFallbackOpen,
    openFallback,
    closeFallback,
    confirmFallback,
    stepForward,
    stepBackward,
    stepToNextHeel,
    regenerate,
    reset,
    getContainerProps,
    getHandleProps
  };
}
