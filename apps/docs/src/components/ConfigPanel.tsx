import { createFeedbackController } from '@heelslide/core';
import { THEME_PRESETS, type PlaygroundConfig } from '../utils/snippets.js';

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

  const playAudition = (type: 'turn' | 'reset' | 'unlock') => {
    const ctrl = createFeedbackController({
      haptics: config.haptics,
      sound: {
        enabled: true,
        volume: config.soundVolume
      }
    });
    void ctrl.resumeAudio();
    if (type === 'turn') {
      ctrl.triggerTurn();
    } else if (type === 'reset') {
      ctrl.triggerReset();
    } else if (type === 'unlock') {
      ctrl.triggerUnlock();
    }
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

      {/* Disabled Switch, Numbered Heels & Regenerate */}
      <div className="control-group" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
          <input
            id="ctrl-numbered-heels"
            type="checkbox"
            checked={config.numberedHeels ?? false}
            onChange={(e) => updateField('numberedHeels', e.target.checked)}
          />
          Numbered Heels
        </label>
      </div>

      {/* Multi-Gesture & Checkpoint Controls */}
      <h3 className="panel-section-title" style={{ marginTop: '1.5rem' }}>Multi-Gesture & Checkpoints</h3>

      <div className="control-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
          <input
            id="ctrl-segmented"
            type="checkbox"
            checked={!!config.segmented}
            onChange={(e) => updateField('segmented', e.target.checked)}
          />
          Segmented Mode (Release at each heel)
        </label>
      </div>

      {config.segmented && (
        <div className="control-group">
          <div className="control-label-row">
            <label className="control-label" htmlFor="ctrl-checkpoint-timeout">Checkpoint Inactivity Timeout:</label>
            <span className="control-value">
              {config.checkpointTimeoutMs ? `${config.checkpointTimeoutMs}ms` : 'Disabled'}
            </span>
          </div>
          <input
            id="ctrl-checkpoint-timeout"
            type="range"
            min={0}
            max={5000}
            step={500}
            value={config.checkpointTimeoutMs ?? 0}
            onChange={(e) => updateField('checkpointTimeoutMs', Number(e.target.value))}
            className="slider-input"
          />
        </div>
      )}

      {/* Feedback & Audio Settings */}
      <h3 className="panel-section-title" style={{ marginTop: '1.5rem' }}>Feedback & Sound FX</h3>

      <div className="control-group" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
          <input
            id="ctrl-haptics"
            type="checkbox"
            checked={config.haptics}
            onChange={(e) => updateField('haptics', e.target.checked)}
          />
          Haptics (Vibration)
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
          <input
            id="ctrl-sound"
            type="checkbox"
            checked={config.sound}
            onChange={(e) => updateField('sound', e.target.checked)}
          />
          Sound FX (Web Audio)
        </label>
      </div>

      {config.sound && (
        <div className="control-group">
          <div className="control-label-row">
            <label className="control-label" htmlFor="ctrl-volume">Audio Volume:</label>
            <span className="control-value">{Math.round(config.soundVolume * 100)}%</span>
          </div>
          <input
            id="ctrl-volume"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={config.soundVolume}
            onChange={(e) => updateField('soundVolume', Number(e.target.value))}
            className="slider-input"
          />
        </div>
      )}

      {/* Audio Previews */}
      <div className="control-group" style={{ marginTop: '0.75rem' }}>
        <span className="control-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Audition Synthesized Tones:</span>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            id="btn-test-turn"
            type="button"
            className="btn btn-outline"
            onClick={() => playAudition('turn')}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
          >
            Audition Turn Tick
          </button>
          <button
            id="btn-test-reset"
            type="button"
            className="btn btn-outline"
            onClick={() => playAudition('reset')}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
          >
            Audition Reset Tone
          </button>
          <button
            id="btn-test-unlock"
            type="button"
            className="btn btn-outline"
            onClick={() => playAudition('unlock')}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
          >
            Audition Unlock Chime
          </button>
        </div>
      </div>

      <h3 className="panel-section-title" style={{ marginTop: '1.5rem' }}>CSS Custom Properties & Presets</h3>

      {/* Presets buttons */}
      <div className="control-group" style={{ marginBottom: '1rem' }}>
        <span className="control-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Design Presets:</span>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {Object.values(THEME_PRESETS).map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="btn btn-outline"
              onClick={() => {
                onChange((prev) => ({
                  ...prev,
                  theme: { ...preset.theme },
                  numberedHeels: preset.numberedHeels ?? prev.numberedHeels
                }));
              }}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

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

      <div className="color-pickers-row" style={{ marginTop: '0.75rem' }}>
        <div className="color-field">
          <input
            type="color"
            value={config.theme.targetHeelBg || '#3b82f6'}
            onChange={(e) => updateTheme('targetHeelBg', e.target.value)}
            className="color-input"
            aria-label="Target Heel Color"
          />
          <span className="color-text">Target Heel</span>
        </div>

        <div className="color-field">
          <input
            type="color"
            value={config.theme.goalBg || '#10b981'}
            onChange={(e) => updateTheme('goalBg', e.target.value)}
            className="color-input"
            aria-label="Goal Color"
          />
          <span className="color-text">Goal BG</span>
        </div>
      </div>
    </div>
  );
}
