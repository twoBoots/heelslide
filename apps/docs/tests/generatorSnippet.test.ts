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
});
