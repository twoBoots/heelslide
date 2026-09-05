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
    theme: {
      trackBg: '#334155',
      trackActive: '#3b82f6',
      handleColor: '#ffffff',
      heelColor: '#94a3b8'
    }
  };

  it('should generate valid React code snippet matching playground config', () => {
    const snippet = generateCodeSnippet('react', sampleConfig);
    expect(snippet).toContain("import { Heelslide } from '@heelslide/react';");
    expect(snippet).toContain("heels={2}");
    expect(snippet).toContain("tolerance={24}");
    expect(snippet).toContain("width={320}");
    expect(snippet).toContain("height={160}");
    expect(snippet).toContain("onUnlock={handleUnlock}");
    expect(snippet).toContain("'--heelslide-track-active': '#3b82f6'");
  });

  it('should generate valid Vue 3 code snippet matching playground config', () => {
    const snippet = generateCodeSnippet('vue', sampleConfig);
    expect(snippet).toContain("import { Heelslide } from '@heelslide/vue';");
    expect(snippet).toContain("<Heelslide");
    expect(snippet).toContain(":heels=\"2\"");
    expect(snippet).toContain(":tolerance=\"24\"");
    expect(snippet).toContain("@unlock=\"onUnlock\"");
    expect(snippet).toContain("'--heelslide-track-bg': '#334155'");
  });

  it('should generate valid Vanilla TypeScript code snippet matching playground config', () => {
    const snippet = generateCodeSnippet('core', sampleConfig);
    expect(snippet).toContain("import { HeelslideEngine } from '@heelslide/core';");
    expect(snippet).toContain("heels: 2");
    expect(snippet).toContain("tolerance: 24");
    expect(snippet).toContain("bounds: { width: 320, height: 160 }");
    expect(snippet).toContain("onUnlock: () => {");
  });
});
