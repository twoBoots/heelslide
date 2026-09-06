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
    accessibleFallback = 'stepped',
    ariaLabel = 'Intentional gesture security gate',
    ariaDescribedBy,
    accessibleButtonText = 'Confirm with Accessible Alternative',
    renderAccessibleFallback,
    onUnlock,
    onReset,
    onProgress,
    onStateChange,
    onAnnouncement,
    className,
    style,
    width = 300,
    height = 150,
    gridStep = 24,
    margin = 16,
    seed,
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
    announcement,
    isFallbackOpen,
    openFallback,
    closeFallback,
    confirmFallback,
    getContainerProps,
    getHandleProps
  } = useHeelslide({
    tolerance,
    disabled,
    generator: generatorOptions,
    accessibleFallback,
    onUnlock,
    onReset,
    onProgress,
    onStateChange,
    onAnnouncement
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
      tabIndex={disabled ? -1 : 0}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      aria-valuetext={announcement || `${Math.round(progress * 100)}% complete`}
      aria-keyshortcuts="ArrowRight ArrowLeft ArrowUp ArrowDown Enter Space Escape Home"
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
      {/* Visually hidden live region for screen readers */}
      <div
        data-heelslide-live-region
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          margin: '-1px',
          padding: 0,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          border: 0,
          whiteSpace: 'nowrap'
        }}
      >
        {announcement}
      </div>

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

      {/* Accessible dialog fallback button trigger */}
      {accessibleFallback === 'dialog' && (
        <button
          type="button"
          data-heelslide-fallback-button
          aria-haspopup="dialog"
          disabled={disabled}
          onClick={openFallback}
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            zIndex: 10,
            fontSize: '11px',
            padding: '4px 8px',
            borderRadius: '6px',
            backgroundColor: 'var(--heelslide-fallback-btn-bg, #f1f5f9)',
            color: 'var(--heelslide-fallback-btn-color, #334155)',
            border: '1px solid var(--heelslide-fallback-btn-border, #cbd5e1)',
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
        >
          {accessibleButtonText}
        </button>
      )}

      {/* Accessible verification modal dialog */}
      {isFallbackOpen &&
        (renderAccessibleFallback ? (
          renderAccessibleFallback({
            isOpen: isFallbackOpen,
            onConfirm: confirmFallback,
            onCancel: closeFallback
          })
        ) : (
          <div
            data-heelslide-dialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="heelslide-dialog-title"
            aria-describedby="heelslide-dialog-desc"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              zIndex: 20,
              boxSizing: 'border-box'
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                padding: '16px',
                maxWidth: '90%',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              <h3
                id="heelslide-dialog-title"
                style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#0f172a' }}
              >
                Accessible Verification
              </h3>
              <p
                id="heelslide-dialog-desc"
                style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#475569' }}
              >
                Confirm your intention to unlock the security gate.
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  type="button"
                  data-heelslide-dialog-confirm
                  onClick={confirmFallback}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  data-heelslide-dialog-cancel
                  onClick={closeFallback}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    backgroundColor: '#e2e8f0',
                    color: '#334155',
                    border: 'none',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
});

Heelslide.displayName = 'Heelslide';
