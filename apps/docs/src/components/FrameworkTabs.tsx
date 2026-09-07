import { useState } from 'react';
import { generateCodeSnippet, type FrameworkTarget, type PlaygroundConfig } from '../utils/snippets.js';

interface FrameworkTabsProps {
  config: PlaygroundConfig;
}

export function FrameworkTabs({ config }: FrameworkTabsProps) {
  const [activeTab, setActiveTab] = useState<FrameworkTarget>('react');
  const [copied, setCopied] = useState(false);

  const snippet = generateCodeSnippet(activeTab, config);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="code-tabs-container">
      <h3 className="panel-section-title">Implementation Code</h3>
      <div className="tabs-nav">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'react' ? 'active' : ''}`}
          onClick={() => setActiveTab('react')}
        >
          React (@heelslide/react)
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'vue' ? 'active' : ''}`}
          onClick={() => setActiveTab('vue')}
        >
          Vue 3 (@heelslide/vue)
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'svelte' ? 'active' : ''}`}
          onClick={() => setActiveTab('svelte')}
        >
          Svelte 5 (@heelslide/svelte)
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'core' ? 'active' : ''}`}
          onClick={() => setActiveTab('core')}
        >
          Core / Vanilla (@heelslide/core)
        </button>
      </div>

      <div className="code-block-wrapper">
        <div className="code-block-header">
          <span>
            {activeTab === 'react' && 'SecurityGate.tsx'}
            {activeTab === 'vue' && 'SecurityGate.vue'}
            {activeTab === 'svelte' && 'SecurityGate.svelte'}
            {activeTab === 'core' && 'security-gate.ts'}
          </span>
          <button type="button" onClick={handleCopy} className="copy-btn">
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
        <pre className="code-pre">
          <code>{snippet}</code>
        </pre>
      </div>
    </div>
  );
}
