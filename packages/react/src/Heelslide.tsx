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
    numberedHeels = false,
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
    currentSegmentIndex,
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
  const isGoalTarget = track.points.length > 0 && currentSegmentIndex >= track.points.length - 2;

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
        counterReset: 'heelslide-heel',
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
            strokeWidth="var(--heelslide-track-width, 12px)"
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
            r="var(--heelslide-track-start-radius, var(--heelslide-endpoint-size, var(--heelslide-start-radius, 6px)))"
            fill="var(--heelslide-track-bg, #cbd5e1)"
          />
        )}

        {/* Heel direction change corner markers */}
        {heelVertices.map((vertex, index) => {
          const isTarget = currentSegmentIndex === index;
          const isCleared = currentSegmentIndex > index;
          return (
            <g
              key={`heel-${vertex.x}-${vertex.y}-${index}`}
              data-heelslide-heel={index + 1}
              data-target={isTarget ? 'true' : 'false'}
              className={`heelslide-heel-group ${isTarget ? 'heelslide-target' : ''}`}
              style={{ counterIncrement: 'heelslide-heel' }}
            >
              {/* Clearance buffer ring */}
              <circle
                className="heelslide-heel-buffer"
                cx={vertex.x}
                cy={vertex.y}
                r="var(--heelslide-track-heel-radius, var(--heelslide-heel-radius, var(--heelslide-heel-size, 4px)))"
                fill="none"
                stroke="var(--heelslide-track-bg, #e2e8f0)"
                strokeWidth="var(--heelslide-heel-padding, 0px)"
              />
              {/* Heel marker circle */}
              <circle
                className="heelslide-heel-marker"
                cx={vertex.x}
                cy={vertex.y}
                r="var(--heelslide-track-heel-radius, var(--heelslide-heel-radius, var(--heelslide-heel-size, 4px)))"
                fill={
                  isCleared
                    ? 'var(--heelslide-heel-completed-color, var(--heelslide-track-active, #3b82f6))'
                    : isTarget
                    ? 'var(--heelslide-target-heel-bg, var(--heelslide-heel-bg, var(--heelslide-track-active, #3b82f6)))'
                    : 'var(--heelslide-heel-bg, var(--heelslide-heel-color, #94a3b8))'
                }
                stroke={
                  isTarget
                    ? 'var(--heelslide-target-heel-border-color, var(--heelslide-heel-border-color, #ffffff))'
                    : 'var(--heelslide-heel-border-color, transparent)'
                }
                strokeWidth={
                  isTarget
                    ? 'var(--heelslide-target-heel-border-width, var(--heelslide-heel-border-width, 2px))'
                    : 'var(--heelslide-heel-border-width, 0px)'
                }
              />
              {/* Numbered heel text */}
              {numberedHeels && (
                <text
                  className="heelslide-heel-text"
                  x={vertex.x}
                  y={vertex.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily="var(--heelslide-heel-font-family, system-ui, -apple-system, sans-serif)"
                  fontSize="var(--heelslide-heel-font-size, 10px)"
                  fontWeight="var(--heelslide-heel-font-weight, 600)"
                  fill={
                    isTarget
                      ? 'var(--heelslide-target-heel-text-color, #ffffff)'
                      : 'var(--heelslide-heel-text-color, var(--heelslide-heel-color, #475569))'
                  }
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {index + 1}
                </text>
              )}
            </g>
          );
        })}

        {/* End destination marker */}
        {endPoint && (
          <g
            data-heelslide-end-group
            data-target={isGoalTarget ? 'true' : 'false'}
            className={`heelslide-goal-group ${isGoalTarget ? 'heelslide-target' : ''}`}
          >
            <circle
              data-heelslide-end
              className="heelslide-end-marker"
              cx={endPoint.x}
              cy={endPoint.y}
              r="var(--heelslide-track-end-radius, var(--heelslide-end-radius, var(--heelslide-endpoint-size, 6px)))"
              fill={
                isGoalTarget
                  ? 'var(--heelslide-goal-bg, var(--heelslide-end-color, #10b981))'
                  : 'var(--heelslide-goal-bg, var(--heelslide-end-color, var(--heelslide-track-active, #3b82f6)))'
              }
              stroke={
                isGoalTarget
                  ? 'var(--heelslide-goal-border-color, #ffffff)'
                  : 'var(--heelslide-goal-border-color, transparent)'
              }
              strokeWidth={
                isGoalTarget
                  ? 'var(--heelslide-goal-border-width, 2px)'
                  : 'var(--heelslide-goal-border-width, 0px)'
              }
            />
          </g>
        )}
      </svg>

      {/* Draggable handle */}
      <div
        data-heelslide-handle
        style={{
          ...handleProps.style,
          width: 'var(--heelslide-handle-size, 32px)',
          height: 'var(--heelslide-handle-size, 32px)',
          backgroundColor:
            state === 'unlocked'
              ? 'var(--heelslide-success-color, #10b981)'
              : isDragging
              ? 'var(--heelslide-handle-active-bg, var(--heelslide-handle-bg, #1d4ed8))'
              : (state as string) === 'checkpoint'
              ? 'var(--heelslide-handle-checkpoint-bg, var(--heelslide-handle-active-bg, var(--heelslide-handle-bg, #2563eb)))'
              : 'var(--heelslide-handle-bg, var(--heelslide-slider-bg, var(--heelslide-handle-color, #2563eb)))',
          borderWidth: 'var(--heelslide-handle-border-width, 2px)',
          borderStyle: 'solid',
          borderColor:
            state === 'unlocked'
              ? 'var(--heelslide-success-color, #10b981)'
              : 'var(--heelslide-handle-border-color, var(--heelslide-slider-border-color, #ffffff))',
          borderRadius: '50%',
          boxShadow: 'var(--heelslide-handle-shadow, 0 2px 8px rgba(0, 0, 0, 0.15))',
          transform:
            isDragging || (state as string) === 'checkpoint'
              ? `${handleProps.style.transform ?? ''} scale(var(--heelslide-handle-active-scale, 1.05))`
              : handleProps.style.transform,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          transition: isDragging ? 'none' : 'left 0.15s ease-out, top 0.15s ease-out, transform 0.15s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
});

Heelslide.displayName = 'Heelslide';
