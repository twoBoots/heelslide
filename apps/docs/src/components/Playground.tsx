import { useState } from 'react';
import { Heelslide } from '@heelslide/react';
import type { AccessibleAnnouncement, GestureState } from '@heelslide/core';
import type { CSSProperties } from 'react';
import type { PlaygroundConfig } from '../utils/snippets.js';

interface PlaygroundProps {
  config: PlaygroundConfig;
  onStateChange: (state: GestureState) => void;
  onUnlock: () => void;
  onReset: () => void;
}

export function Playground({ config, onStateChange, onUnlock, onReset }: PlaygroundProps) {
  const [latestAnnouncement, setLatestAnnouncement] = useState<string>('');

  const containerStyle: CSSProperties = {
    '--heelslide-track-bg': config.theme.trackBg,
    '--heelslide-track-active': config.theme.trackActive,
    '--heelslide-handle-color': config.theme.handleColor,
    '--heelslide-heel-color': config.theme.heelColor
  } as CSSProperties;

  const handleAnnouncement = (announcement: AccessibleAnnouncement) => {
    setLatestAnnouncement(announcement.message);
  };

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
            accessibleFallback={config.accessibleFallback}
            onAnnouncement={handleAnnouncement}
            onStateChange={onStateChange}
            onUnlock={onUnlock}
            onReset={onReset}
          />
        </div>
      </div>

      <div className="announcer-card">
        <div className="announcer-header">
          <span className="announcer-title">Live Screen Reader Announcer</span>
          <span className="announcer-badge">aria-live="polite"</span>
        </div>
        <div className="announcer-message" data-testid="announcer-log">
          {latestAnnouncement ? (
            <span>{latestAnnouncement}</span>
          ) : (
            <span className="announcer-placeholder">
              {config.accessibleFallback === 'stepped'
                ? 'Use Tab to focus handle. Press Arrow keys to step or Space/Enter to advance heel.'
                : 'Use Tab to focus the fallback button or slide the handle to unlock.'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
