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
    haptics,
    sound,
    segmented,
    checkpointTimeoutMs,
    onTurn,
    onCheckpoint,
    onUnlock,
    onReset,
    onProgress,
    onStateChange
  } = options;

  const callbacksRef = useRef({ onTurn, onCheckpoint, onUnlock, onReset, onProgress, onStateChange });
  useEffect(() => {
    callbacksRef.current = { onTurn, onCheckpoint, onUnlock, onReset, onProgress, onStateChange };
  });

  const [state, setState] = useState<GestureState>(() => options.initialState ?? 'idle');
  const [progress, setProgress] = useState<number>(() =>
    options.initialProgress ?? (options.initialState === 'unlocked' ? 1 : options.initialState === 'active' ? 0.5 : 0)
  );

  const engine = useMemo(() => {
    return new HeelslideEngine({
      tolerance,
      generator,
      track: initialTrack,
      initialState: options.initialState,
      initialProgress: options.initialProgress,
      haptics,
      sound,
      segmented,
      checkpointTimeoutMs,
      onTurn: (heelIndex) => {
        callbacksRef.current.onTurn?.(heelIndex);
      },
      onCheckpoint: (heelIndex, p) => {
        callbacksRef.current.onCheckpoint?.(heelIndex, p);
      },
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
      }
    });
  }, [tolerance, generator, initialTrack, options.initialState, options.initialProgress, segmented, checkpointTimeoutMs]);

  const [track, setTrack] = useState<TrackPath>(() => engine.getPath());

  useEffect(() => {
    engine.setFeedbackOptions({ haptics, sound });
  }, [engine, haptics, sound]);

  useEffect(() => {
    setTrack(engine.getPath());
    setState(engine.getState());
    setProgress(engine.getProgress());
  }, [engine]);

  // Handle unmount teardown
  useEffect(() => {
    return () => {
      engine.destroy();
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
  }, [engine]);

  const regenerate = useCallback(
    (overrideOptions?: Partial<GeneratorOptions>) => {
      const newTrack = engine.regeneratePath(overrideOptions);
      setTrack(newTrack);
      setState('idle');
      setProgress(0);
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

  const getContainerProps = useCallback(
    (): ContainerProps => ({
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel
    }),
    [handlePointerDown, handlePointerMove, handlePointerUp, handlePointerCancel]
  );

  const getHandleProps = useCallback(
    (): HandleProps => ({
      onPointerDown: handlePointerDown,
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
    [handlePointerDown, handlePosition.x, handlePosition.y, disabled, isDragging]
  );

  return {
    state,
    progress,
    track,
    handlePosition,
    isDragging,
    regenerate,
    reset,
    getContainerProps,
    getHandleProps
  };
}
