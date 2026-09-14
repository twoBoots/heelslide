import { Heelslide } from '@heelslide/react';
import type { AccessibleAnnouncement, GestureState } from '@heelslide/core';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { PlaygroundConfig } from '../utils/snippets.js';

interface PlaygroundProps {
  config: PlaygroundConfig;
  onStateChange: (state: GestureState) => void;
  onUnlock: () => void;
  onReset: () => void;
}

export function Playground({ config, onStateChange, onUnlock, onReset }: PlaygroundProps) {
  const [announcement, setAnnouncement] = useState<AccessibleAnnouncement | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [valueText, setValueText] = useState('');

  // Read aria-valuetext off the rendered slider rather than recomputing it here, so the readout
  // shows what the accessibility tree actually carries instead of a second opinion about it.
  useEffect(() => {
    const slider = stageRef.current?.querySelector('[data-heelslide-container]');
    if (!slider) return;

    const sync = () => setValueText(slider.getAttribute('aria-valuetext') ?? '');
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(slider, { attributes: true, attributeFilter: ['aria-valuetext'] });
    return () => observer.disconnect();
  }, [config.accessibleFallback, config.heels, config.seed, config.width, config.height]);

  const containerStyle: CSSProperties = {
    ...(config.width !== undefined ? { '--heelslide-width': `${config.width}px` } : {}),
    ...(config.height !== undefined ? { '--heelslide-height': `${config.height}px` } : {}),
    '--heelslide-track-bg': config.theme.trackBg,
    '--heelslide-track-progress': config.theme.trackActive,
    '--heelslide-track-active': config.theme.trackActive,
    '--heelslide-handle-bg': config.theme.handleColor,
    '--heelslide-handle-color': config.theme.handleColor,
    '--heelslide-heel-bg': config.theme.heelColor,
    '--heelslide-heel-color': config.theme.heelColor,
    ...(config.theme.trackWidth !== undefined ? { '--heelslide-track-width': `${config.theme.trackWidth}px` } : {}),
    ...(config.theme.handleSize !== undefined ? { '--heelslide-handle-size': `${config.theme.handleSize}px` } : {}),
    ...(config.theme.handleBorderColor ? { '--heelslide-handle-border-color': config.theme.handleBorderColor } : {}),
    ...(config.theme.handleBorderWidth !== undefined ? { '--heelslide-handle-border-width': `${config.theme.handleBorderWidth}px` } : {}),
    ...(config.theme.heelRadius !== undefined ? {
      '--heelslide-track-heel-radius': `${config.theme.heelRadius}px`,
      '--heelslide-heel-radius': `${config.theme.heelRadius}px`
    } : {}),
    ...(config.theme.heelPadding !== undefined ? { '--heelslide-heel-padding': `${config.theme.heelPadding}px` } : {}),
    ...(config.theme.heelBorderColor ? { '--heelslide-heel-border-color': config.theme.heelBorderColor } : {}),
    ...(config.theme.heelBorderWidth !== undefined ? { '--heelslide-heel-border-width': `${config.theme.heelBorderWidth}px` } : {}),
    ...(config.theme.targetHeelBg ? { '--heelslide-target-heel-bg': config.theme.targetHeelBg } : {}),
    ...(config.theme.targetHeelBorderColor ? { '--heelslide-target-heel-border-color': config.theme.targetHeelBorderColor } : {}),
    ...(config.theme.targetHeelBorderWidth !== undefined ? { '--heelslide-target-heel-border-width': `${config.theme.targetHeelBorderWidth}px` } : {}),
    ...(config.theme.targetHeelScale !== undefined ? { '--heelslide-target-heel-scale': String(config.theme.targetHeelScale) } : {}),
    ...(config.theme.goalBg ? { '--heelslide-goal-bg': config.theme.goalBg } : {}),
    ...(config.theme.goalBorderColor ? { '--heelslide-goal-border-color': config.theme.goalBorderColor } : {}),
    ...(config.theme.goalBorderWidth !== undefined ? { '--heelslide-goal-border-width': `${config.theme.goalBorderWidth}px` } : {}),
    ...(config.theme.heelTextColor ? { '--heelslide-heel-text-color': config.theme.heelTextColor } : {}),
    ...(config.theme.targetHeelTextColor ? { '--heelslide-target-heel-text-color': config.theme.targetHeelTextColor } : {}),
    ...(config.theme.successColor ? { '--heelslide-success-color': config.theme.successColor } : {}),
    ...(config.theme.errorColor ? { '--heelslide-error-color': config.theme.errorColor } : {})
  } as CSSProperties;

  return (
    <div className="card">
      <h3 className="panel-section-title">Live Gate Simulator</h3>
      <div className="preview-stage" ref={stageRef}>
        <div style={containerStyle}>
          <Heelslide
            heels={config.heels}
            tolerance={config.tolerance}
            width={config.width}
            height={config.height}
            gridStep={config.gridStep}
            margin={config.margin}
            seed={config.seed}
            disabled={config.disabled}
            numberedHeels={config.numberedHeels}
            segmented={config.segmented}
            checkpointTimeoutMs={config.checkpointTimeoutMs}
            haptics={config.haptics}
            sound={config.sound ? { volume: config.soundVolume } : false}
            accessibleFallback={config.accessibleFallback}
            onStateChange={onStateChange}
            onUnlock={onUnlock}
            onReset={onReset}
            onAnnouncement={setAnnouncement}
          />
        </div>
      </div>

      {/*
        Mirrors what assistive technology receives. The live region itself is visually hidden by
        design, so without this a sighted developer has no way to see whether the component is
        saying anything useful — or anything at all.
      */}
      <div className="a11y-readout">
        <h4 className="a11y-readout-title">
          Assistive technology view
          <span className="a11y-readout-hint">Tab to the gate, then use the arrow keys</span>
        </h4>
        <dl className="a11y-readout-list">
          <dt>aria-valuetext</dt>
          <dd data-a11y-readout>{valueText || '—'}</dd>
          <dt>Live region</dt>
          <dd data-a11y-announcement>{announcement?.message ?? '—'}</dd>
        </dl>
      </div>
    </div>
  );
}
