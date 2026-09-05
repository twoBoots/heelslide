import type { GestureState } from '@heelslide/core';

interface SimulationCardProps {
  state: GestureState;
  unlockCount: number;
  resetCount: number;
  onResetStats: () => void;
}

export function SimulationCard({ state, unlockCount, resetCount, onResetStats }: SimulationCardProps) {
  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="panel-section-title" style={{ margin: 0 }}>Gate Metrics & Security Simulation</h3>
        <button
          type="button"
          onClick={onResetStats}
          className="btn btn-outline"
          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
        >
          Reset Metrics
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{unlockCount}</div>
          <div className="stat-label">Successful Unlocks</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{resetCount}</div>
          <div className="stat-label">Blocked Deviations</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">
            <span className={`status-tag ${state}`}>
              <span className="status-dot" />
              {state}
            </span>
          </div>
          <div className="stat-label">Current State</div>
        </div>
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <strong style={{ color: 'var(--text-primary)' }}>Accidental Activation Protection:</strong> Linear swipes across the screen or random touches in pocket immediately trigger a tolerance violation, aborting and resetting the gate to 0 progress. Unlocking strictly requires navigating the 90° directional heel turns.
      </div>
    </div>
  );
}
