import { forwardRef, useMemo } from 'react';
import type { HeelslideProps } from './types';
import { useHeelslide } from './useHeelslide';

export const Heelslide = forwardRef<HTMLDivElement, HeelslideProps>(function Heelslide(
  props,
  ref
) {
  const {
    heels = 2,
    tolerance = 24,
    disabled = false,
    initialState,
    initialProgress,
    haptics,
    sound,
    segmented,
    checkpointTimeoutMs,
    onTurn,
    onCheckpoint,
    onUnlock,
    onReset,
    onProgress,
    onStateChange,
    className,
    style,
    width = 300,
    height = 150,
    gridStep = 24,
    margin = 16,
    seed,
    ariaLabel = 'Intentional gesture security gate',
    children
  } = props;

  const generatorOptions = useMemo(
    () => ({
      bounds: { width, height },
      gridStep,
      margin,
      heels,
      seed
    }),
    [width, height, gridStep, margin, heels, seed]
  );

  const {
    state,
    progress,
    track,
    isDragging,
    getContainerProps,
    getHandleProps
  } = useHeelslide({
    tolerance,
    disabled,
    initialState,
    initialProgress,
    haptics,
    sound,
    segmented,
    checkpointTimeoutMs,
    generator: generatorOptions,
    onTurn,
    onCheckpoint,
    onUnlock,
    onReset,
    onProgress,
    onStateChange
  });

  const containerProps = getContainerProps();
  const handleProps = getHandleProps();

  const pathData = useMemo(() => {
    if (!track.points || track.points.length === 0) return '';
    return track.points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');
  }, [track.points]);

  const heelVertices = useMemo(() => {
    if (!track.points || track.points.length <= 2) return [];
    return track.points.slice(1, -1);
  }, [track.points]);

  const startPoint = track.points[0];
  const endPoint = track.points[track.points.length - 1];

  return (
    <div
      ref={ref}
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      aria-disabled={disabled}
      data-disabled={disabled}
      data-state={state}
      data-heelslide-container
      className={className}
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: 'var(--heelslide-bg, transparent)',
        borderRadius: 'var(--heelslide-border-radius, 12px)',
        userSelect: 'none',
        touchAction: 'none',
        overflow: 'hidden',
        boxSizing: 'border-box',
        ...style
      }}
      {...containerProps}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        style={{
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      >
        {/* Background track path */}
        {pathData && (
          <path
            data-heelslide-track="background"
            d={pathData}
            stroke="var(--heelslide-track-bg, #e2e8f0)"
            strokeWidth="var(--heelslide-track-width, 8px)"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}

        {/* Start endpoint marker */}
        {startPoint && (
          <circle
            data-heelslide-start
            cx={startPoint.x}
            cy={startPoint.y}
            r="var(--heelslide-endpoint-size, 6px)"
            fill="var(--heelslide-track-bg, #cbd5e1)"
          />
        )}

        {/* Heel direction change corner markers */}
        {heelVertices.map((vertex, index) => (
          <circle
            key={`heel-${vertex.x}-${vertex.y}-${index}`}
            data-heelslide-heel={index + 1}
            cx={vertex.x}
            cy={vertex.y}
            r="var(--heelslide-heel-size, 4px)"
            fill="var(--heelslide-heel-color, #94a3b8)"
          />
        ))}

        {/* End destination marker */}
        {endPoint && (
          <circle
            data-heelslide-end
            cx={endPoint.x}
            cy={endPoint.y}
            r="var(--heelslide-endpoint-size, 6px)"
            fill="var(--heelslide-track-active, #3b82f6)"
          />
        )}
      </svg>

      {/* Draggable handle */}
      <div
        data-heelslide-handle
        style={{
          ...handleProps.style,
          width: 'var(--heelslide-handle-size, 32px)',
          height: 'var(--heelslide-handle-size, 32px)',
          backgroundColor: 'var(--heelslide-handle-bg, #2563eb)',
          border: 'var(--heelslide-handle-border, 2px solid #ffffff)',
          borderRadius: '50%',
          boxShadow: 'var(--heelslide-handle-shadow, 0 2px 8px rgba(0, 0, 0, 0.15))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          transition: isDragging ? 'none' : 'left 0.15s ease-out, top 0.15s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
});

Heelslide.displayName = 'Heelslide';
