import React from 'react';
import { Heelslide } from '@heelslide/react';
import type { GestureState, HeelCountConfig } from '@heelslide/core';

export interface VisualFixtureParams {
  isFixture: boolean;
  state: GestureState | 'disabled';
  heels: HeelCountConfig;
  seed: number;
  tolerance: number;
  width: number;
  height: number;
  theme: string;
  disabled: boolean;
  progress: number;
}

export function parseVisualFixtureParams(search: string): VisualFixtureParams {
  const params = new URLSearchParams(search);
  const fixture = params.get('fixture');
  const isFixture = fixture === 'visual';

  const rawState = params.get('state') || 'idle';
  const isDisabledParam = params.get('disabled') === 'true';

  let state: GestureState = 'idle';
  let disabled = isDisabledParam;
  let progress = 0;

  if (rawState === 'disabled') {
    disabled = true;
    state = 'idle';
  } else if (rawState === 'active') {
    state = 'active';
    progress = 0.5;
  } else if (rawState === 'unlocked') {
    state = 'unlocked';
    progress = 1.0;
  } else if (rawState === 'reset') {
    state = 'reset';
    progress = 0;
  } else {
    state = 'idle';
    progress = 0;
  }

  const rawHeels = parseInt(params.get('heels') || '2', 10);
  const heels = (Math.max(1, Math.min(4, isNaN(rawHeels) ? 2 : rawHeels))) as HeelCountConfig;

  const rawSeed = parseInt(params.get('seed') || '4242', 10);
  const seed = isNaN(rawSeed) ? 4242 : rawSeed;

  const rawTolerance = parseInt(params.get('tolerance') || '24', 10);
  const tolerance = isNaN(rawTolerance) ? 24 : rawTolerance;

  const rawWidth = parseInt(params.get('width') || '320', 10);
  const width = isNaN(rawWidth) ? 320 : rawWidth;

  const rawHeight = parseInt(params.get('height') || '160', 10);
  const height = isNaN(rawHeight) ? 160 : rawHeight;

  const theme = params.get('theme') || 'default';

  return {
    isFixture,
    state: rawState === 'disabled' ? 'disabled' : state,
    heels,
    seed,
    tolerance,
    width,
    height,
    theme,
    disabled,
    progress
  };
}

export interface VisualFixtureProps {
  search?: string;
}

export function VisualFixture({ search }: VisualFixtureProps) {
  const currentSearch = search ?? (typeof window !== 'undefined' ? window.location.search : '');
  const config = parseVisualFixtureParams(currentSearch);

  const getThemeStyles = (): React.CSSProperties => {
    if (config.theme === 'custom') {
      return {
        '--heelslide-track-bg': '#475569',
        '--heelslide-track-active': '#10b981',
        '--heelslide-handle-color': '#f59e0b',
        '--heelslide-heel-color': '#ef4444',
        '--heelslide-handle-bg': '#f59e0b'
      } as React.CSSProperties;
    }

    if (config.theme === 'dark') {
      return {
        '--heelslide-bg': '#1e293b',
        '--heelslide-track-bg': '#334155',
        '--heelslide-track-active': '#38bdf8',
        '--heelslide-handle-color': '#ffffff',
        '--heelslide-heel-color': '#64748b'
      } as React.CSSProperties;
    }

    return {};
  };

  const themeStyles = getThemeStyles();
  const isDark = config.theme === 'dark';

  return (
    <div
      data-testid="visual-fixture"
      className="visual-fixture-container"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        margin: 0,
        padding: '32px',
        boxSizing: 'border-box',
        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
        colorScheme: isDark ? 'dark' : 'light',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}
    >
      <style data-visual-fixture-styles>{`
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
          caret-color: transparent !important;
        }
        body {
          margin: 0;
          padding: 0;
          background-color: ${isDark ? '#0f172a' : '#f8fafc'};
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>

      <div data-testid="visual-fixture-stage" style={themeStyles}>
        <Heelslide
          heels={config.heels}
          seed={config.seed}
          tolerance={config.tolerance}
          width={config.width}
          height={config.height}
          disabled={config.disabled}
          initialState={config.state === 'disabled' ? 'idle' : config.state}
          initialProgress={config.progress}
        />
      </div>
    </div>
  );
}
