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
    '--heelslide-track-active': config.theme.trackActive,
    '--heelslide-handle-color': config.theme.handleColor,
    '--heelslide-heel-color': config.theme.heelColor
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
