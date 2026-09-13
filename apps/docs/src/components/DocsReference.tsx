import { useState } from 'react';

interface PropDoc {
  name: string;
  type: string;
  default: string;
  description: string;
}

interface CssVarDoc {
  name: string;
  default: string;
  category: string;
  description: string;
}

const PROPS_DOCS: PropDoc[] = [
  { name: 'bounds', type: 'Bounds ({ width, height })', default: '{ width: 300, height: 150 }', description: 'Container dimensions (preferred over deprecated width/height props).' },
  { name: 'heels', type: 'HeelCountConfig (number | { min, max })', default: '2', description: 'Fixed number of 90-degree heel turns, or a procedural min/max range.' },
  { name: 'tolerance', type: 'number', default: '24', description: 'Maximum allowed deviation distance (in pixels) from the corridor center.' },
  { name: 'gridStep', type: 'number', default: '24', description: 'Cell step size in pixels along which track turns are procedurally generated.' },
  { name: 'margin', type: 'number', default: '16', description: 'Minimum clearance inset from container edges for generated path vertices.' },
  { name: 'seed', type: 'number', default: 'undefined', description: 'Optional deterministic RNG seed for reproducible path generation.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'When true, disables all pointer interaction and renders the track in a disabled state.' },
  { name: 'segmented', type: 'boolean', default: 'false', description: 'Enables segmented multi-gesture mode where users must pause and lift thumb at each heel.' },
  { name: 'checkpointTimeoutMs', type: 'number', default: '0', description: 'Inactivity timeout in milliseconds during segmented gestures before auto-resetting.' },
  { name: 'haptics', type: 'boolean | HapticOptions', default: 'true', description: 'Enables haptic vibration feedback on turns, resets, and unlocks.' },
  { name: 'sound', type: 'boolean | SoundOptions', default: 'true', description: 'Enables synthesized Web Audio feedback tones with custom volume or frequencies.' },
  { name: 'numberedHeels', type: 'boolean', default: 'false', description: 'Renders sequence index numbers (1, 2, ...) inside heel corner markers.' },
  { name: 'ariaLabel', type: 'string', default: "'Security gate slider'", description: 'Accessible ARIA label applied to the interactive slider container.' },
  { name: 'track', type: 'TrackPath', default: 'undefined', description: 'Explicit pre-computed track path override; bypasses procedural generator.' },
  { name: 'onUnlock', type: '() => void', default: 'undefined', description: 'Callback triggered when handle successfully reaches destination corridor.' },
  { name: 'onReset', type: '() => void', default: 'undefined', description: 'Callback triggered when gesture deviates beyond tolerance or resets.' },
  { name: 'onTurn', type: '(heelIndex: number) => void', default: 'undefined', description: 'Callback triggered when the pointer passes each 90-degree turn.' },
  { name: 'onCheckpoint', type: '(heelIndex: number, progress: number) => void', default: 'undefined', description: 'Callback triggered when entering a segmented checkpoint corridor.' },
  { name: 'onProgress', type: '(progress: number) => void', default: 'undefined', description: 'Continuous normalized gesture progress callback ([0..1]).' },
  { name: 'onStateChange', type: '(state: GestureState) => void', default: 'undefined', description: "State transition listener ('idle' | 'active' | 'checkpoint' | 'unlocked' | 'reset')." }
];

const CSS_DOCS: CssVarDoc[] = [
  { name: '--heelslide-width', default: '300px', category: 'Geometry & Track', description: 'Container width' },
  { name: '--heelslide-height', default: '150px', category: 'Geometry & Track', description: 'Container height' },
  { name: '--heelslide-track-bg', default: '#e2e8f0', category: 'Geometry & Track', description: 'Inactive track stroke color' },
  { name: '--heelslide-track-progress', default: '#3b82f6', category: 'Geometry & Track', description: 'Active traversed track stroke color (alias: --heelslide-track-active)' },
  { name: '--heelslide-track-width', default: '12px', category: 'Geometry & Track', description: 'Track stroke thickness' },
  { name: '--heelslide-track-cap', default: 'round', category: 'Geometry & Track', description: 'Track stroke linecap style (round, butt, square)' },
  { name: '--heelslide-track-start-radius', default: '6px', category: 'Geometry & Track', description: 'Origin starting marker radius' },
  { name: '--heelslide-track-end-radius', default: '6px', category: 'Geometry & Track', description: 'Destination marker radius' },
  { name: '--heelslide-track-heel-radius', default: '4px', category: 'Geometry & Track', description: 'Turn corner vertex marker radius' },
  { name: '--heelslide-handle-radius', default: '18px', category: 'Handle Tokens', description: 'Handle circle radius (alias: --heelslide-handle-size)' },
  { name: '--heelslide-handle-bg', default: '#ffffff', category: 'Handle Tokens', description: 'Handle fill color (aliases: --heelslide-slider-bg, --heelslide-handle-color)' },
  { name: '--heelslide-handle-border-color', default: '#3b82f6', category: 'Handle Tokens', description: 'Handle border stroke color' },
  { name: '--heelslide-handle-border-width', default: '2px', category: 'Handle Tokens', description: 'Handle border stroke width' },
  { name: '--heelslide-handle-active-scale', default: '1.05', category: 'Handle Tokens', description: 'Transform scale during active dragging' },
  { name: '--heelslide-handle-active-bg', default: 'var(--heelslide-handle-bg)', category: 'Handle Tokens', description: 'Handle fill color while actively dragging' },
  { name: '--heelslide-handle-checkpoint-bg', default: 'var(--heelslide-handle-active-bg)', category: 'Handle Tokens', description: 'Handle fill color when paused at a checkpoint' },
  { name: '--heelslide-heel-radius', default: '4px', category: 'Heel Turn Markers', description: 'Radius of turn corner marker circles' },
  { name: '--heelslide-heel-bg', default: '#94a3b8', category: 'Heel Turn Markers', description: 'Heel turn marker fill color (alias: --heelslide-heel-color)' },
  { name: '--heelslide-heel-border-color', default: 'transparent', category: 'Heel Turn Markers', description: 'Heel marker border stroke color' },
  { name: '--heelslide-heel-border-width', default: '0px', category: 'Heel Turn Markers', description: 'Heel marker border stroke width' },
  { name: '--heelslide-heel-padding', default: '0px', category: 'Heel Turn Markers', description: 'Clearance buffer ring width around heel turn markers' },
  { name: '--heelslide-heel-completed-color', default: '#3b82f6', category: 'Heel Turn Markers', description: 'Fill color for cleared/completed heel turns' },
  { name: '--heelslide-target-heel-bg', default: '#3b82f6', category: 'Active Target Heel', description: 'Fill color for the upcoming active target heel' },
  { name: '--heelslide-target-heel-border-color', default: '#ffffff', category: 'Active Target Heel', description: 'Border stroke color for upcoming target heel' },
  { name: '--heelslide-target-heel-border-width', default: '2px', category: 'Active Target Heel', description: 'Border stroke width for upcoming target heel' },
  { name: '--heelslide-target-heel-scale', default: '1.1', category: 'Active Target Heel', description: 'Transform scale factor for upcoming target heel' },
  { name: '--heelslide-goal-bg', default: '#10b981', category: 'Target Goal Indicator', description: 'Final destination marker fill color (alias: --heelslide-end-color)' },
  { name: '--heelslide-goal-border-color', default: 'transparent', category: 'Target Goal Indicator', description: 'Destination marker border stroke color' },
  { name: '--heelslide-goal-border-width', default: '0px', category: 'Target Goal Indicator', description: 'Destination marker border stroke width' },
  { name: '--heelslide-heel-font-family', default: 'system-ui, sans-serif', category: 'Typography', description: 'Font family for numbered heel labels' },
  { name: '--heelslide-heel-font-size', default: '10px', category: 'Typography', description: 'Font size for numbered heel labels' },
  { name: '--heelslide-heel-font-weight', default: '600', category: 'Typography', description: 'Font weight for numbered heel labels' },
  { name: '--heelslide-heel-text-color', default: '#475569', category: 'Typography', description: 'Text color for inactive numbered heels' },
  { name: '--heelslide-target-heel-text-color', default: '#ffffff', category: 'Typography', description: 'Text color for active upcoming target heel' },
  { name: '--heelslide-success-color', default: '#10b981', category: 'Interaction States', description: 'Accent color applied upon successful unlock' },
  { name: '--heelslide-error-color', default: '#ef4444', category: 'Interaction States', description: 'Accent color applied on reset deviation snapback' },
  { name: '--heelslide-cursor', default: 'grab', category: 'Interaction States', description: 'Default idle cursor style' },
  { name: '--heelslide-cursor-active', default: 'grabbing', category: 'Interaction States', description: 'Active drag cursor style' }
];

export function DocsReference() {
  const [activeTab, setActiveTab] = useState<'props' | 'css'>('props');

  return (
    <div className="docs-reference-container card" style={{ marginTop: '2.5rem' }}>
      <h3 className="panel-section-title">Configuration & Styling Reference</h3>

      <div className="tabs-nav" style={{ marginBottom: '1.25rem' }}>
        <button
          type="button"
          className={`ref-tab-btn ${activeTab === 'props' ? 'active' : ''}`}
          onClick={() => setActiveTab('props')}
        >
          Component Props & API
        </button>
        <button
          type="button"
          className={`ref-tab-btn ${activeTab === 'css' ? 'active' : ''}`}
          onClick={() => setActiveTab('css')}
        >
          CSS Custom Properties
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        {activeTab === 'props' ? (
          <table className="ref-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {PROPS_DOCS.map((prop) => (
                <tr key={prop.name}>
                  <td>
                    <code>{prop.name}</code>
                  </td>
                  <td>
                    <span className="ref-badge-type">{prop.type}</span>
                  </td>
                  <td>
                    <code>{prop.default}</code>
                  </td>
                  <td>{prop.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="ref-table">
            <thead>
              <tr>
                <th>Custom Property</th>
                <th>Category</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {CSS_DOCS.map((cssVar) => (
                <tr key={cssVar.name}>
                  <td>
                    <code>{cssVar.name}</code>
                  </td>
                  <td>
                    <span className="ref-badge-category">{cssVar.category}</span>
                  </td>
                  <td>
                    <code>{cssVar.default}</code>
                  </td>
                  <td>{cssVar.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
