import { describe, expect, it } from 'vitest';
import { generateCodeSnippet, type PlaygroundConfig } from '../src/utils/snippets.js';

describe('Playground Code Snippet Generator', () => {
  const sampleConfig: PlaygroundConfig = {
    heels: 2,
    tolerance: 24,
    width: 320,
    height: 160,
    gridStep: 24,
    margin: 16,
    seed: 42,
    disabled: false,
    haptics: true,
    sound: true,
    soundVolume: 0.3,
    numberedHeels: true,
    theme: {
      trackBg: '#334155',
      trackActive: '#3b82f6',
      handleColor: '#ffffff',
      heelColor: '#94a3b8',
      heelBorderColor: '#cbd5e1',
      targetHeelBg: '#2563eb',
      targetHeelBorderColor: '#ffffff',
      goalBg: '#10b981',
      goalBorderColor: '#ffffff',
      heelTextColor: '#475569'
    }
  };

  it('should generate valid React code snippet matching playground config with numbered heels and expanded CSS vars', () => {
    const snippet = generateCodeSnippet('react', sampleConfig);
    expect(snippet).toContain("import { Heelslide } from '@heelslide/react';");
    expect(snippet).toContain("heels={2}");
    expect(snippet).toContain("tolerance={24}");
    expect(snippet).toContain("width={320}");
    expect(snippet).toContain("height={160}");
    expect(snippet).toContain("haptics={true}");
    expect(snippet).toContain("sound={true}");
    expect(snippet).toContain("numberedHeels={true}");
    expect(snippet).toContain("onUnlock={handleUnlock}");
    expect(snippet).toContain("'--heelslide-track-progress': '#3b82f6'");
    expect(snippet).toContain("'--heelslide-target-heel-bg': '#2563eb'");
    expect(snippet).toContain("'--heelslide-goal-bg': '#10b981'");
  });

  it('should generate valid Vue 3 SFC code snippet with <style scoped> matching playground config', () => {
    const snippet = generateCodeSnippet('vue', sampleConfig);
    expect(snippet).toContain("import { Heelslide } from '@heelslide/vue';");
    expect(snippet).toContain("<template>");
    expect(snippet).toContain('<div class="security-gate">');
    expect(snippet).toContain("<Heelslide");
    expect(snippet).toContain(':heels="2"');
    expect(snippet).toContain(':tolerance="24"');
    expect(snippet).toContain(':haptics="true"');
    expect(snippet).toContain(':sound="true"');
    expect(snippet).toContain(':numbered-heels="true"');
    expect(snippet).toContain('@unlock="onUnlock"');
    expect(snippet).toContain('<style scoped>');
    expect(snippet).toContain('.security-gate {');
    expect(snippet).toContain('--heelslide-track-bg: #334155;');
    expect(snippet).toContain('--heelslide-track-progress: #3b82f6;');
    expect(snippet).toContain('--heelslide-target-heel-bg: #2563eb;');
    expect(snippet).toContain('--heelslide-goal-bg: #10b981;');
  });

  it('should generate valid Svelte 5 SFC code snippet with <style> matching playground config', () => {
    const snippet = generateCodeSnippet('svelte', sampleConfig);
    expect(snippet).toContain("import { Heelslide } from '@heelslide/svelte';");
    expect(snippet).toContain('<div class="security-gate">');
    expect(snippet).toContain("<Heelslide");
    expect(snippet).toContain("heels={2}");
    expect(snippet).toContain("tolerance={24}");
    expect(snippet).toContain("haptics={true}");
    expect(snippet).toContain("sound={true}");
    expect(snippet).toContain("numberedHeels={true}");
    expect(snippet).toContain("onunlock={onUnlock}");
    expect(snippet).toContain('<style>');
    expect(snippet).toContain('.security-gate {');
    expect(snippet).toContain('--heelslide-track-bg: #334155;');
    expect(snippet).toContain('--heelslide-track-progress: #3b82f6;');
    expect(snippet).toContain('--heelslide-target-heel-bg: #2563eb;');
    expect(snippet).toContain('--heelslide-goal-bg: #10b981;');
  });

  it('should generate valid Vanilla TypeScript code snippet matching playground config', () => {
    const snippet = generateCodeSnippet('core', sampleConfig);
    expect(snippet).toContain("import { HeelslideEngine } from '@heelslide/core';");
    expect(snippet).toContain("heels: 2");
    expect(snippet).toContain("tolerance: 24");
    expect(snippet).toContain("bounds: { width: 320, height: 160 }");
    expect(snippet).toContain("haptics: true");
    expect(snippet).toContain("sound: true");
    expect(snippet).toContain("onUnlock: () => {");
  });

  it('should generate segmented mode snippets with checkpoint timeout when configured', () => {
    const segmentedConfig: PlaygroundConfig = {
      ...sampleConfig,
      segmented: true,
      checkpointTimeoutMs: 2500
    };

    const reactSnippet = generateCodeSnippet('react', segmentedConfig);
    expect(reactSnippet).toContain('segmented={true}');
    expect(reactSnippet).toContain('checkpointTimeoutMs={2500}');

    const vueSnippet = generateCodeSnippet('vue', segmentedConfig);
    expect(vueSnippet).toContain(':segmented="true"');
    expect(vueSnippet).toContain(':checkpoint-timeout-ms="2500"');

    const coreSnippet = generateCodeSnippet('core', segmentedConfig);
    expect(coreSnippet).toContain('segmented: true,');
    expect(coreSnippet).toContain('checkpointTimeoutMs: 2500,');
  });

  it('should generate snippets with expanded geometry and styling CSS custom properties', () => {
    const expandedThemeConfig: PlaygroundConfig = {
      ...sampleConfig,
      theme: {
        ...sampleConfig.theme,
        trackWidth: 16,
        handleSize: 36,
        handleBorderColor: '#3b82f6',
        heelRadius: 6,
        heelPadding: 4,
        targetHeelScale: 1.25,
        targetHeelTextColor: '#ffffff'
      }
    };

    const reactSnippet = generateCodeSnippet('react', expandedThemeConfig);
    expect(reactSnippet).toContain("'--heelslide-track-width': '16px'");
    expect(reactSnippet).toContain("'--heelslide-handle-size': '36px'");
    expect(reactSnippet).toContain("'--heelslide-handle-border-color': '#3b82f6'");
    expect(reactSnippet).toContain("'--heelslide-track-heel-radius': '6px'");
    expect(reactSnippet).toContain("'--heelslide-heel-radius': '6px'");
    expect(reactSnippet).toContain("'--heelslide-heel-padding': '4px'");
    expect(reactSnippet).toContain("'--heelslide-target-heel-scale': '1.25'");
    expect(reactSnippet).toContain("'--heelslide-target-heel-text-color': '#ffffff'");

    const vueSnippet = generateCodeSnippet('vue', expandedThemeConfig);
    expect(vueSnippet).toContain('--heelslide-track-width: 16px;');
    expect(vueSnippet).toContain('--heelslide-handle-size: 36px;');
    expect(vueSnippet).toContain('--heelslide-handle-border-color: #3b82f6;');
    expect(vueSnippet).toContain('--heelslide-track-heel-radius: 6px;');
    expect(vueSnippet).toContain('--heelslide-heel-radius: 6px;');
    expect(vueSnippet).toContain('--heelslide-heel-padding: 4px;');
    expect(vueSnippet).toContain('--heelslide-target-heel-scale: 1.25;');
    expect(vueSnippet).toContain('--heelslide-target-heel-text-color: #ffffff;');

    const svelteSnippet = generateCodeSnippet('svelte', expandedThemeConfig);
    expect(svelteSnippet).toContain('--heelslide-track-width: 16px;');
    expect(svelteSnippet).toContain('--heelslide-handle-size: 36px;');
    expect(svelteSnippet).toContain('--heelslide-handle-border-color: #3b82f6;');
  });
});

