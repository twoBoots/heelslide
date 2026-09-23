import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Repository README Documentation & Showcase', () => {
  const readmePath = path.resolve(__dirname, '../../../README.md');
  const readmeContent = fs.readFileSync(readmePath, 'utf-8');

  it('contains prominent GitHub Pages live demo link and hero banner near the top', () => {
    expect(readmeContent).toContain('https://twoboots.github.io/heelslide/');
    // Must appear in hero / before Overview
    const overviewIndex = readmeContent.indexOf('## Overview');
    expect(overviewIndex).toBeGreaterThan(0);
    const heroContent = readmeContent.slice(0, overviewIndex);
    expect(heroContent).toContain('https://twoboots.github.io/heelslide/');
    expect(heroContent.toLowerCase()).toContain('live demo');
  });

  it('contains the brand tagline directly under the Heelslide heading', () => {
    const headingIndex = readmeContent.indexOf('# Heelslide');
    expect(headingIndex).toBeGreaterThanOrEqual(0);
    const overviewIndex = readmeContent.indexOf('## Overview');
    const heroContent = readmeContent.slice(headingIndex, overviewIndex);
    expect(heroContent).toContain('Intuitive friction, for interfaces with consequence.');
  });

  it('contains Quick Start & Installation section for React, Vue, and Svelte', () => {
    expect(readmeContent).toMatch(/## (Quick Start|Installation)/i);
    expect(readmeContent).toContain('@heelslide/react');
    expect(readmeContent).toContain('@heelslide/vue');
    expect(readmeContent).toContain('@heelslide/svelte');
    expect(readmeContent).toMatch(/npm (install|i) @heelslide\/react/);
    expect(readmeContent).toMatch(/npm (install|i) @heelslide\/vue/);
    expect(readmeContent).toMatch(/npm (install|i) @heelslide\/svelte/);
  });

  it('contains Custom Handle Icons & Slots documentation', () => {
    expect(readmeContent).toMatch(/handle/i);
    expect(readmeContent).toContain('#handle');
    expect(readmeContent).toMatch(/<template #handle/);
  });

  it('contains Segmented Multi-Gesture Checkpoints documentation', () => {
    expect(readmeContent).toMatch(/segmented/i);
    expect(readmeContent).toContain('checkpointTimeoutMs');
    expect(readmeContent).toMatch(/mode="segmented"/);
  });

  it('documents expanded handle CSS custom properties in styling reference', () => {
    expect(readmeContent).toContain('--heelslide-handle-size');
    expect(readmeContent).toContain('--heelslide-handle-border-radius');
    expect(readmeContent).toContain('--heelslide-handle-shadow');
    expect(readmeContent).toContain('--heelslide-handle-checkpoint-shadow');
    expect(readmeContent).toContain('--heelslide-handle-checkpoint-border-color');
  });

  it('highlights mobile responsiveness and touchscreen support in core capabilities', () => {
    const capabilitiesIndex = readmeContent.indexOf('## Core Capabilities');
    expect(capabilitiesIndex).toBeGreaterThan(0);
    const nextSectionIndex = readmeContent.indexOf('## ', capabilitiesIndex + 10);
    const capabilitiesContent = readmeContent.slice(capabilitiesIndex, nextSectionIndex);
    expect(capabilitiesContent.toLowerCase()).toMatch(/mobile|touchscreen/);
    expect(capabilitiesContent.toLowerCase()).toMatch(/responsive/);
  });
});
