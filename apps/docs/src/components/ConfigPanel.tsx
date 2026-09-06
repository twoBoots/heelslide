import type { PlaygroundConfig } from '../utils/snippets.js';

interface ConfigPanelProps {
  config: PlaygroundConfig;
  onChange: (updater: (prev: PlaygroundConfig) => PlaygroundConfig) => void;
  onRegenerate: () => void;
}

export function ConfigPanel({ config, onChange, onRegenerate }: ConfigPanelProps) {
  const updateField = <K extends keyof PlaygroundConfig>(field: K, value: PlaygroundConfig[K]) => {
    onChange((prev) => ({ ...prev, [field]: value }));
  };

  const updateTheme = (colorKey: keyof PlaygroundConfig['theme'], colorVal: string) => {
    onChange((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        [colorKey]: colorVal
      }
    }));
  };

  return (
    <div className="card">
      <h3 className="panel-section-title">Gate Configuration</h3>

      {/* Heel Count */}
      <div className="control-group">
        <div className="control-label-row">
          <label className="control-label" htmlFor="ctrl-heels">Heel Turns (90°):</label>
          <span className="control-value">{config.heels}</span>
        </div>
        <input
          id="ctrl-heels"
          type="range"
          min={1}
          max={4}
          step={1}
          value={config.heels}
          onChange={(e) => updateField('heels', Number(e.target.value))}
          className="slider-input"
        />
      </div>

      {/* Tolerance */}
      <div className="control-group">
        <div className="control-label-row">
          <label className="control-label" htmlFor="ctrl-tolerance">Deviation Tolerance:</label>
          <span className="control-value">{config.tolerance}px</span>
        </div>
        <input
          id="ctrl-tolerance"
          type="range"
          min={12}
          max={48}
          step={2}
          value={config.tolerance}
          onChange={(e) => updateField('tolerance', Number(e.target.value))}
          className="slider-input"
        />
      </div>

      {/* Dimensions */}
      <div className="control-group">
        <div className="control-label-row">
          <label className="control-label" htmlFor="ctrl-width">Width:</label>
          <span className="control-value">{config.width}px</span>
        </div>
        <input
          id="ctrl-width"
          type="range"
          min={260}
          max={480}
          step={20}
          value={config.width}
          onChange={(e) => updateField('width', Number(e.target.value))}
          className="slider-input"
        />
      </div>

      <div className="control-group">
        <div className="control-label-row">
          <label className="control-label" htmlFor="ctrl-height">Height:</label>
          <span className="control-value">{config.height}px</span>
        </div>
        <input
          id="ctrl-height"
          type="range"
          min={120}
          max={240}
          step={10}
          value={config.height}
          onChange={(e) => updateField('height', Number(e.target.value))}
          className="slider-input"
        />
      </div>

      {/* Disabled Switch & Regenerate */}
      <div className="control-group" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button
          type="button"
          className="btn btn-outline"
          onClick={onRegenerate}
          style={{ flex: 1 }}
        >
          Regenerate Path
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={config.disabled}
            onChange={(e) => updateField('disabled', e.target.checked)}
          />
          Disabled
        </label>
      </div>

      <h3 className="panel-section-title" style={{ marginTop: '1.5rem' }}>Accessibility (WCAG 2.2)</h3>

      {/* Accessible Fallback Mode */}
      <div className="control-group">
        <div className="control-label-row">
          <label className="control-label" htmlFor="ctrl-fallback">Accessible Fallback:</label>
          <span className="control-value">{config.accessibleFallback}</span>
        </div>
        <select
          id="ctrl-fallback"
          className="select-input"
          value={config.accessibleFallback}
          onChange={(e) => updateField('accessibleFallback', e.target.value as 'stepped' | 'dialog')}
        >
          <option value="stepped">Stepped Navigation (Arrow Keys)</option>
          <option value="dialog">Confirmation Dialog (WCAG Modal)</option>
        </select>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
          {config.accessibleFallback === 'stepped'
            ? 'Arrow keys step along path segments; Space/Enter jumps across 90° heel turns.'
            : 'Renders an accessible fallback button and dialog for single-click confirmation.'}
        </p>
      </div>

      <h3 className="panel-section-title" style={{ marginTop: '1.5rem' }}>CSS Custom Properties</h3>

      <div className="color-pickers-row">
        <div className="color-field">
          <input
            type="color"
            value={config.theme.trackBg}
            onChange={(e) => updateTheme('trackBg', e.target.value)}
            className="color-input"
            aria-label="Track Background Color"
          />
          <span className="color-text">Track BG</span>
        </div>

        <div className="color-field">
          <input
            type="color"
            value={config.theme.trackActive}
            onChange={(e) => updateTheme('trackActive', e.target.value)}
            className="color-input"
            aria-label="Track Active Color"
          />
          <span className="color-text">Active</span>
        </div>

        <div className="color-field">
          <input
            type="color"
            value={config.theme.handleColor}
            onChange={(e) => updateTheme('handleColor', e.target.value)}
            className="color-input"
            aria-label="Handle Color"
          />
          <span className="color-text">Handle</span>
        </div>

        <div className="color-field">
          <input
            type="color"
            value={config.theme.heelColor}
            onChange={(e) => updateTheme('heelColor', e.target.value)}
            className="color-input"
            aria-label="Heel Turn Marker Color"
          />
          <span className="color-text">Heels</span>
        </div>
      </div>
    </div>
  );
}
