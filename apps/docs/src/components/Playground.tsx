import { Heelslide } from '@heelslide/react';
import type { GestureState } from '@heelslide/core';
import type { CSSProperties } from 'react';
import type { PlaygroundConfig } from '../utils/snippets.js';

interface PlaygroundProps {
  config: PlaygroundConfig;
  onStateChange: (state: GestureState) => void;
  onUnlock: () => void;
  onReset: () => void;
}

export function Playground({ config, onStateChange, onUnlock, onReset }: PlaygroundProps) {
  const containerStyle: CSSProperties = {
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
    ...(config.theme.heelRadius !== undefined ? {
      '--heelslide-track-heel-radius': `${config.theme.heelRadius}px`,
      '--heelslide-heel-radius': `${config.theme.heelRadius}px`
    } : {}),
    ...(config.theme.heelPadding !== undefined ? { '--heelslide-heel-padding': `${config.theme.heelPadding}px` } : {}),
    ...(config.theme.heelBorderColor ? { '--heelslide-heel-border-color': config.theme.heelBorderColor } : {}),
    ...(config.theme.targetHeelBg ? { '--heelslide-target-heel-bg': config.theme.targetHeelBg } : {}),
    ...(config.theme.targetHeelBorderColor ? { '--heelslide-target-heel-border-color': config.theme.targetHeelBorderColor } : {}),
    ...(config.theme.targetHeelScale !== undefined ? { '--heelslide-target-heel-scale': String(config.theme.targetHeelScale) } : {}),
    ...(config.theme.goalBg ? { '--heelslide-goal-bg': config.theme.goalBg } : {}),
    ...(config.theme.goalBorderColor ? { '--heelslide-goal-border-color': config.theme.goalBorderColor } : {}),
    ...(config.theme.heelTextColor ? { '--heelslide-heel-text-color': config.theme.heelTextColor } : {}),
    ...(config.theme.targetHeelTextColor ? { '--heelslide-target-heel-text-color': config.theme.targetHeelTextColor } : {})
  } as CSSProperties;

  return (
    <div className="card">
      <h3 className="panel-section-title">Live Gate Simulator</h3>
      <div className="preview-stage">
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
            onStateChange={onStateChange}
            onUnlock={onUnlock}
            onReset={onReset}
          />
        </div>
      </div>
    </div>
  );
}
