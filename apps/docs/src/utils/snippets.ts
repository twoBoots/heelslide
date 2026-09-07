export interface ThemeConfig {
  trackBg: string;
  trackActive: string;
  handleColor: string;
  heelColor: string;
  heelBorderColor?: string;
  targetHeelBg?: string;
  targetHeelBorderColor?: string;
  goalBg?: string;
  goalBorderColor?: string;
  heelTextColor?: string;
}

export type ThemePresetKey = 'clean-slate' | 'cyberpunk' | 'emerald-vault' | 'high-contrast';

export interface ThemePreset {
  id: ThemePresetKey;
  name: string;
  theme: ThemeConfig;
  numberedHeels?: boolean;
}

export const THEME_PRESETS: Record<ThemePresetKey, ThemePreset> = {
  'clean-slate': {
    id: 'clean-slate',
    name: 'Clean Slate',
    theme: {
      trackBg: '#e2e8f0',
      trackActive: '#3b82f6',
      handleColor: '#ffffff',
      heelColor: '#94a3b8',
      heelBorderColor: 'transparent',
      targetHeelBg: '#3b82f6',
      targetHeelBorderColor: '#ffffff',
      goalBg: '#10b981',
      goalBorderColor: '#ffffff',
      heelTextColor: '#475569'
    },
    numberedHeels: false
  },
  'cyberpunk': {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    theme: {
      trackBg: '#0f172a',
      trackActive: '#06b6d4',
      handleColor: '#f43f5e',
      heelColor: '#334155',
      heelBorderColor: '#06b6d4',
      targetHeelBg: '#f43f5e',
      targetHeelBorderColor: '#facc15',
      goalBg: '#eab308',
      goalBorderColor: '#f43f5e',
      heelTextColor: '#06b6d4'
    },
    numberedHeels: true
  },
  'emerald-vault': {
    id: 'emerald-vault',
    name: 'Emerald Vault',
    theme: {
      trackBg: '#064e3b',
      trackActive: '#10b981',
      handleColor: '#34d399',
      heelColor: '#047857',
      heelBorderColor: '#a7f3d0',
      targetHeelBg: '#059669',
      targetHeelBorderColor: '#fbbf24',
      goalBg: '#fbbf24',
      goalBorderColor: '#ffffff',
      heelTextColor: '#d1fae5'
    },
    numberedHeels: true
  },
  'high-contrast': {
    id: 'high-contrast',
    name: 'High Contrast',
    theme: {
      trackBg: '#000000',
      trackActive: '#ffffff',
      handleColor: '#ffffff',
      heelColor: '#000000',
      heelBorderColor: '#ffffff',
      targetHeelBg: '#ffffff',
      targetHeelBorderColor: '#000000',
      goalBg: '#ffffff',
      goalBorderColor: '#000000',
      heelTextColor: '#ffffff'
    },
    numberedHeels: true
  }
};

export interface PlaygroundConfig {
  heels: number;
  tolerance: number;
  width: number;
  height: number;
  gridStep: number;
  margin: number;
  seed?: number;
  disabled: boolean;
  segmented?: boolean;
  checkpointTimeoutMs?: number;
  haptics: boolean;
  sound: boolean;
  soundVolume: number;
  numberedHeels?: boolean;
  theme: ThemeConfig;
}

export type FrameworkTarget = 'react' | 'vue' | 'svelte' | 'core';

function formatReactStyles(theme: ThemeConfig): string {
  const styles: string[] = [
    `'--heelslide-track-bg': '${theme.trackBg}'`,
    `'--heelslide-track-progress': '${theme.trackActive}'`,
    `'--heelslide-handle-bg': '${theme.handleColor}'`,
    `'--heelslide-heel-bg': '${theme.heelColor}'`
  ];
  if (theme.heelBorderColor) {
    styles.push(`'--heelslide-heel-border-color': '${theme.heelBorderColor}'`);
  }
  if (theme.targetHeelBg) {
    styles.push(`'--heelslide-target-heel-bg': '${theme.targetHeelBg}'`);
  }
  if (theme.targetHeelBorderColor) {
    styles.push(`'--heelslide-target-heel-border-color': '${theme.targetHeelBorderColor}'`);
  }
  if (theme.goalBg) {
    styles.push(`'--heelslide-goal-bg': '${theme.goalBg}'`);
  }
  if (theme.goalBorderColor) {
    styles.push(`'--heelslide-goal-border-color': '${theme.goalBorderColor}'`);
  }
  if (theme.heelTextColor) {
    styles.push(`'--heelslide-heel-text-color': '${theme.heelTextColor}'`);
  }
  return styles.map((s) => `        ${s},`).join('\n').replace(/,$/, '');
}

function formatCssDeclarations(theme: ThemeConfig): string {
  const decls: string[] = [
    `  --heelslide-track-bg: ${theme.trackBg};`,
    `  --heelslide-track-progress: ${theme.trackActive};`,
    `  --heelslide-handle-bg: ${theme.handleColor};`,
    `  --heelslide-heel-bg: ${theme.heelColor};`
  ];
  if (theme.heelBorderColor) {
    decls.push(`  --heelslide-heel-border-color: ${theme.heelBorderColor};`);
  }
  if (theme.targetHeelBg) {
    decls.push(`  --heelslide-target-heel-bg: ${theme.targetHeelBg};`);
  }
  if (theme.targetHeelBorderColor) {
    decls.push(`  --heelslide-target-heel-border-color: ${theme.targetHeelBorderColor};`);
  }
  if (theme.goalBg) {
    decls.push(`  --heelslide-goal-bg: ${theme.goalBg};`);
  }
  if (theme.goalBorderColor) {
    decls.push(`  --heelslide-goal-border-color: ${theme.goalBorderColor};`);
  }
  if (theme.heelTextColor) {
    decls.push(`  --heelslide-heel-text-color: ${theme.heelTextColor};`);
  }
  return decls.join('\n');
}

export function generateCodeSnippet(target: FrameworkTarget, config: PlaygroundConfig): string {
  const { heels, tolerance, width, height, gridStep, margin, seed, disabled, segmented, checkpointTimeoutMs, haptics, sound, numberedHeels, theme } = config;

  if (target === 'react') {
    const seedAttr = seed !== undefined ? `\n        seed={${seed}}` : '';
    const disabledAttr = disabled ? '\n        disabled={true}' : '';
    const segmentedAttr = segmented ? '\n        segmented={true}' : '';
    const timeoutAttr = segmented && checkpointTimeoutMs ? `\n        checkpointTimeoutMs={${checkpointTimeoutMs}}` : '';
    const hapticsAttr = haptics ? '\n        haptics={true}' : '';
    const soundAttr = sound ? '\n        sound={true}' : '';
    const numberedHeelsAttr = numberedHeels ? '\n        numberedHeels={true}' : '';
    return `import { Heelslide } from '@heelslide/react';

export function SecurityGate() {
  const handleUnlock = () => {
    alert('Unlocked!');
  };

  return (
    <div
      style={{
${formatReactStyles(theme)}
      } as React.CSSProperties}
    >
      <Heelslide
        heels={${heels}}
        tolerance={${tolerance}}
        width={${width}}
        height={${height}}
        gridStep={${gridStep}}
        margin={${margin}}${seedAttr}${disabledAttr}${segmentedAttr}${timeoutAttr}${hapticsAttr}${soundAttr}${numberedHeelsAttr}
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
    const segmentedAttr = segmented ? '\n      :segmented="true"' : '';
    const timeoutAttr = segmented && checkpointTimeoutMs ? `\n      :checkpoint-timeout-ms="${checkpointTimeoutMs}"` : '';
    const hapticsAttr = haptics ? '\n      :haptics="true"' : '';
    const soundAttr = sound ? '\n      :sound="true"' : '';
    const numberedHeelsAttr = numberedHeels ? '\n      :numbered-heels="true"' : '';
    return `<script setup lang="ts">
import { Heelslide } from '@heelslide/vue';
import '@heelslide/vue/dist/style.css';

function onUnlock() {
  alert('Unlocked!');
}
</script>

<template>
  <div class="security-gate">
    <Heelslide
      :heels="${heels}"
      :tolerance="${tolerance}"
      :bounds="{ width: ${width}, height: ${height} }"
      :grid-step="${gridStep}"
      :margin="${margin}"${seedAttr}${disabledAttr}${segmentedAttr}${timeoutAttr}${hapticsAttr}${soundAttr}${numberedHeelsAttr}
      @unlock="onUnlock"
      @reset="() => console.log('Reset')"
    />
  </div>
</template>

<style scoped>
.security-gate {
${formatCssDeclarations(theme)}
}
</style>`;
  }

  if (target === 'svelte') {
    const seedAttr = seed !== undefined ? `\n    seed={${seed}}` : '';
    const disabledAttr = disabled ? '\n    disabled={true}' : '';
    const segmentedAttr = segmented ? '\n    segmented={true}' : '';
    const timeoutAttr = segmented && checkpointTimeoutMs ? `\n    checkpointTimeoutMs={${checkpointTimeoutMs}}` : '';
    const hapticsAttr = haptics ? '\n    haptics={true}' : '';
    const soundAttr = sound ? '\n    sound={true}' : '';
    const numberedHeelsAttr = numberedHeels ? '\n    numberedHeels={true}' : '';
    return `<script lang="ts">
import { Heelslide } from '@heelslide/svelte';
import '@heelslide/svelte/dist/style.css';

function onUnlock() {
  alert('Unlocked!');
}
</script>

<div class="security-gate">
  <Heelslide
    heels={${heels}}
    tolerance={${tolerance}}
    bounds={{ width: ${width}, height: ${height} }}
    gridStep={${gridStep}}
    margin={${margin}}${seedAttr}${disabledAttr}${segmentedAttr}${timeoutAttr}${hapticsAttr}${soundAttr}${numberedHeelsAttr}
    onunlock={onUnlock}
    onreset={() => console.log('Reset')}
  />
</div>

<style>
.security-gate {
${formatCssDeclarations(theme)}
}
</style>`;
  }

  // Core Vanilla
  const seedField = seed !== undefined ? `\n    seed: ${seed},` : '';
  const segmentedField = segmented ? '\n  segmented: true,' : '';
  const timeoutField = segmented && checkpointTimeoutMs ? `\n  checkpointTimeoutMs: ${checkpointTimeoutMs},` : '';
  const hapticsField = haptics ? '\n  haptics: true,' : '';
  const soundField = sound ? '\n  sound: true,' : '';
  return `import { HeelslideEngine } from '@heelslide/core';

const engine = new HeelslideEngine({
  tolerance: ${tolerance},
  generator: {
    bounds: { width: ${width}, height: ${height} },
    gridStep: ${gridStep},
    margin: ${margin},
    heels: ${heels},${seedField}
  },${segmentedField}${timeoutField}${hapticsField}${soundField}
  onUnlock: () => {
    console.log('Intent confirmed: Unlocked!');
  },
  onReset: () => {
    console.log('Gesture deviation or released prematurely: Reset.');
  },
  onProgress: (progress) => {
    console.log(\`Progress: \${Math.round(progress * 100)}%\`);
  }
});

// Access generated track path
const path = engine.getPath();
console.log('Track points:', path.points);
`;
}
