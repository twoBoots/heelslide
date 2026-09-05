import { useState } from 'react';
import type { GestureState } from '@heelslide/core';
import { Header } from './components/Header.js';
import { Playground } from './components/Playground.js';
import { ConfigPanel } from './components/ConfigPanel.js';
import { SimulationCard } from './components/SimulationCard.js';
import { FrameworkTabs } from './components/FrameworkTabs.js';
import type { PlaygroundConfig } from './utils/snippets.js';
import './styles.css';

export function App() {
  const [config, setConfig] = useState<PlaygroundConfig>({
    heels: 2,
    tolerance: 24,
    width: 320,
    height: 160,
    gridStep: 24,
    margin: 16,
    seed: 12345,
    disabled: false,
    theme: {
      trackBg: '#334155',
      trackActive: '#3b82f6',
      handleColor: '#ffffff',
      heelColor: '#94a3b8'
    }
  });

  const [state, setState] = useState<GestureState>('idle');
  const [unlockCount, setUnlockCount] = useState(0);
  const [resetCount, setResetCount] = useState(0);

  const handleRegenerate = () => {
    setConfig((prev) => ({
      ...prev,
      seed: Math.floor(Math.random() * 1000000)
    }));
  };

  const handleUnlock = () => {
    setUnlockCount((prev) => prev + 1);
  };

  const handleReset = () => {
    setResetCount((prev) => prev + 1);
  };

  const handleResetStats = () => {
    setUnlockCount(0);
    setResetCount(0);
  };

  return (
    <div className="docs-container">
      <Header />

      <div className="playground-grid">
        <div>
          <Playground
            config={config}
            onStateChange={setState}
            onUnlock={handleUnlock}
            onReset={handleReset}
          />
          <SimulationCard
            state={state}
            unlockCount={unlockCount}
            resetCount={resetCount}
            onResetStats={handleResetStats}
          />
        </div>

        <div>
          <ConfigPanel
            config={config}
            onChange={setConfig}
            onRegenerate={handleRegenerate}
          />
        </div>
      </div>

      <FrameworkTabs config={config} />
    </div>
  );
}
