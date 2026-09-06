export interface ThemeConfig {
  trackBg: string;
  trackActive: string;
  handleColor: string;
  heelColor: string;
}

export interface PlaygroundConfig {
  heels: number;
  tolerance: number;
  width: number;
  height: number;
  gridStep: number;
  margin: number;
  seed?: number;
  disabled: boolean;
  accessibleFallback: 'stepped' | 'dialog';
  theme: ThemeConfig;
}

export type FrameworkTarget = 'react' | 'vue' | 'core';

export function generateCodeSnippet(target: FrameworkTarget, config: PlaygroundConfig): string {
  const { heels, tolerance, width, height, gridStep, margin, seed, disabled, accessibleFallback, theme } = config;

  if (target === 'react') {
    const seedAttr = seed !== undefined ? `\n        seed={${seed}}` : '';
    const disabledAttr = disabled ? '\n        disabled={true}' : '';
    const fallbackAttr = `\n        accessibleFallback="${accessibleFallback}"`;
    return `import { Heelslide } from '@heelslide/react';

export function SecurityGate() {
  const handleUnlock = () => {
    alert('Unlocked!');
  };

  return (
    <div
      style={{
        '--heelslide-track-bg': '${theme.trackBg}',
        '--heelslide-track-active': '${theme.trackActive}',
        '--heelslide-handle-color': '${theme.handleColor}',
        '--heelslide-heel-color': '${theme.heelColor}'
      } as React.CSSProperties}
    >
      <Heelslide
        heels={${heels}}
        tolerance={${tolerance}}
        width={${width}}
        height={${height}}
        gridStep={${gridStep}}
        margin={${margin}}${seedAttr}${disabledAttr}${fallbackAttr}
        onUnlock={handleUnlock}
        onReset={() => console.log('Reset')}
      />
    </div>
  );
}`;
  }

  if (target === 'vue') {
    const seedAttr = seed !== undefined ? `\n      :seed="${seed}"` : '';
    const disabledAttr = disabled ? '\n      :disabled="true"' : '';
    const fallbackAttr = `\n      accessible-fallback="${accessibleFallback}"`;
    return `<script setup lang="ts">
import { Heelslide } from '@heelslide/vue';
import '@heelslide/vue/dist/style.css';

function onUnlock() {
  alert('Unlocked!');
}
</script>

<template>
  <div
    :style="{
      '--heelslide-track-bg': '${theme.trackBg}',
      '--heelslide-track-active': '${theme.trackActive}',
      '--heelslide-handle-color': '${theme.handleColor}',
      '--heelslide-heel-color': '${theme.heelColor}'
    }"
  >
    <Heelslide
      :heels="${heels}"
      :tolerance="${tolerance}"
      :bounds="{ width: ${width}, height: ${height} }"
      :grid-step="${gridStep}"
      :margin="${margin}"${seedAttr}${disabledAttr}${fallbackAttr}
      @unlock="onUnlock"
      @reset="() => console.log('Reset')"
    />
  </div>
</template>`;
  }

  // Core Vanilla
  const seedField = seed !== undefined ? `\n    seed: ${seed},` : '';
  return `import { HeelslideEngine } from '@heelslide/core';

const engine = new HeelslideEngine({
  tolerance: ${tolerance},
  generator: {
    bounds: { width: ${width}, height: ${height} },
    gridStep: ${gridStep},
    margin: ${margin},
    heels: ${heels},${seedField}
  },
  onUnlock: () => {
    console.log('Intent confirmed: Unlocked!');
  },
  onReset: () => {
    console.log('Gesture deviation or released prematurely: Reset.');
  },
  onProgress: (progress) => {
    console.log(\`Progress: \${Math.round(progress * 100)}%\`);
  },
  onAnnouncement: (announcement) => {
    // Screen reader accessible announcement (${accessibleFallback} fallback mode)
    console.log('[A11y Announcement]:', announcement.message);
  }
});

// Accessible Stepping API (WCAG 2.2 Keyboard Alternative)
// engine.stepForward(); // ArrowRight / ArrowDown
// engine.stepBackward(); // ArrowLeft / ArrowUp
// engine.stepToNextHeel(); // Space / Enter

// Access generated track path
const path = engine.getPath();
console.log('Track points:', path.points);
`;
}
