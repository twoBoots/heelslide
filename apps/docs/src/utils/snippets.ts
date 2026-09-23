export interface ThemeConfig {
  trackBg: string;
  trackActive: string;
  handleColor: string;
  heelColor: string;
  trackWidth?: number;
  handleSize?: number;
  handleBorderColor?: string;
  handleBorderWidth?: number;
  handleBorderRadius?: number | string;
  heelRadius?: number;
  heelPadding?: number;
  heelBorderColor?: string;
  heelBorderWidth?: number;
  targetHeelBg?: string;
  targetHeelBorderColor?: string;
  targetHeelBorderWidth?: number;
  targetHeelScale?: number;
  goalBg?: string;
  goalBorderColor?: string;
  goalBorderWidth?: number;
  heelTextColor?: string;
  targetHeelTextColor?: string;
  successColor?: string;
  errorColor?: string;
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
      handleBorderColor: '#3b82f6',
      heelColor: '#94a3b8',
      heelBorderColor: 'transparent',
      targetHeelBg: '#3b82f6',
      targetHeelBorderColor: '#ffffff',
      goalBg: '#10b981',
      goalBorderColor: '#ffffff',
      heelTextColor: '#475569',
      targetHeelTextColor: '#ffffff',
      trackWidth: 12,
      handleSize: 32,
      handleBorderRadius: 8,
      heelRadius: 4,
      heelPadding: 0,
      targetHeelScale: 1.1
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
      handleBorderColor: '#facc15',
      heelColor: '#334155',
      heelBorderColor: '#06b6d4',
      targetHeelBg: '#f43f5e',
      targetHeelBorderColor: '#facc15',
      goalBg: '#eab308',
      goalBorderColor: '#f43f5e',
      heelTextColor: '#06b6d4',
      targetHeelTextColor: '#ffffff',
      trackWidth: 14,
      handleSize: 34,
      handleBorderRadius: 8,
      heelRadius: 5,
      heelPadding: 2,
      targetHeelScale: 1.25
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
      handleBorderColor: '#a7f3d0',
      heelColor: '#047857',
      heelBorderColor: '#a7f3d0',
      targetHeelBg: '#059669',
      targetHeelBorderColor: '#fbbf24',
      goalBg: '#fbbf24',
      goalBorderColor: '#ffffff',
      heelTextColor: '#d1fae5',
      targetHeelTextColor: '#ffffff',
      trackWidth: 12,
      handleSize: 32,
      handleBorderRadius: 8,
      heelRadius: 4,
      heelPadding: 2,
      targetHeelScale: 1.15
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
      handleBorderColor: '#ffffff',
      heelColor: '#000000',
      heelBorderColor: '#ffffff',
      targetHeelBg: '#ffffff',
      targetHeelBorderColor: '#000000',
      goalBg: '#ffffff',
      goalBorderColor: '#000000',
      heelTextColor: '#ffffff',
      targetHeelTextColor: '#000000',
      trackWidth: 16,
      handleSize: 36,
      handleBorderRadius: 0,
      heelRadius: 6,
      heelPadding: 3,
      targetHeelScale: 1.2
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
  /** Defaults to `stepped`; only emitted into snippets when changed. */
  accessibleFallback?: 'stepped' | 'custom';
  customHandleIcon?: boolean;
  theme: ThemeConfig;
}

export type FrameworkTarget = 'react' | 'vue' | 'svelte' | 'core';

function formatReactStyles(theme: ThemeConfig, width?: number, height?: number): string {
  const styles: string[] = [];
  if (width !== undefined) {
    styles.push(`'--heelslide-width': '${width}px'`);
  }
  if (height !== undefined) {
    styles.push(`'--heelslide-height': '${height}px'`);
  }
  styles.push(
    `'--heelslide-track-bg': '${theme.trackBg}'`,
    `'--heelslide-track-progress': '${theme.trackActive}'`,
    `'--heelslide-handle-bg': '${theme.handleColor}'`,
    `'--heelslide-heel-bg': '${theme.heelColor}'`
  );
  if (theme.trackWidth !== undefined) {
    styles.push(`'--heelslide-track-width': '${theme.trackWidth}px'`);
  }
  if (theme.handleSize !== undefined) {
    styles.push(`'--heelslide-handle-size': '${theme.handleSize}px'`);
  }
  if (theme.handleBorderColor) {
    styles.push(`'--heelslide-handle-border-color': '${theme.handleBorderColor}'`);
  }
  if (theme.handleBorderWidth !== undefined) {
    styles.push(`'--heelslide-handle-border-width': '${theme.handleBorderWidth}px'`);
  }
  if (theme.handleBorderRadius !== undefined) {
    const val = typeof theme.handleBorderRadius === 'number' ? `${theme.handleBorderRadius}px` : theme.handleBorderRadius;
    styles.push(`'--heelslide-handle-border-radius': '${val}'`);
  }
  if (theme.heelRadius !== undefined) {
    styles.push(`'--heelslide-track-heel-radius': '${theme.heelRadius}px'`);
    styles.push(`'--heelslide-heel-radius': '${theme.heelRadius}px'`);
  }
  if (theme.heelPadding !== undefined) {
    styles.push(`'--heelslide-heel-padding': '${theme.heelPadding}px'`);
  }
  if (theme.heelBorderColor) {
    styles.push(`'--heelslide-heel-border-color': '${theme.heelBorderColor}'`);
  }
  if (theme.heelBorderWidth !== undefined) {
    styles.push(`'--heelslide-heel-border-width': '${theme.heelBorderWidth}px'`);
  }
  if (theme.targetHeelBg) {
    styles.push(`'--heelslide-target-heel-bg': '${theme.targetHeelBg}'`);
  }
  if (theme.targetHeelBorderColor) {
    styles.push(`'--heelslide-target-heel-border-color': '${theme.targetHeelBorderColor}'`);
  }
  if (theme.targetHeelBorderWidth !== undefined) {
    styles.push(`'--heelslide-target-heel-border-width': '${theme.targetHeelBorderWidth}px'`);
  }
  if (theme.targetHeelScale !== undefined) {
    styles.push(`'--heelslide-target-heel-scale': '${theme.targetHeelScale}'`);
  }
  if (theme.goalBg) {
    styles.push(`'--heelslide-goal-bg': '${theme.goalBg}'`);
  }
  if (theme.goalBorderColor) {
    styles.push(`'--heelslide-goal-border-color': '${theme.goalBorderColor}'`);
  }
  if (theme.goalBorderWidth !== undefined) {
    styles.push(`'--heelslide-goal-border-width': '${theme.goalBorderWidth}px'`);
  }
  if (theme.heelTextColor) {
    styles.push(`'--heelslide-heel-text-color': '${theme.heelTextColor}'`);
  }
  if (theme.targetHeelTextColor) {
    styles.push(`'--heelslide-target-heel-text-color': '${theme.targetHeelTextColor}'`);
  }
  if (theme.successColor) {
    styles.push(`'--heelslide-success-color': '${theme.successColor}'`);
  }
  if (theme.errorColor) {
    styles.push(`'--heelslide-error-color': '${theme.errorColor}'`);
  }
  return styles.map((s) => `        ${s},`).join('\n').replace(/,$/, '');
}

function formatCssDeclarations(theme: ThemeConfig, width?: number, height?: number): string {
  const decls: string[] = [];
  if (width !== undefined) {
    decls.push(`  --heelslide-width: ${width}px;`);
  }
  if (height !== undefined) {
    decls.push(`  --heelslide-height: ${height}px;`);
  }
  decls.push(
    `  --heelslide-track-bg: ${theme.trackBg};`,
    `  --heelslide-track-progress: ${theme.trackActive};`,
    `  --heelslide-handle-bg: ${theme.handleColor};`,
    `  --heelslide-heel-bg: ${theme.heelColor};`
  );
  if (theme.trackWidth !== undefined) {
    decls.push(`  --heelslide-track-width: ${theme.trackWidth}px;`);
  }
  if (theme.handleSize !== undefined) {
    decls.push(`  --heelslide-handle-size: ${theme.handleSize}px;`);
  }
  if (theme.handleBorderColor) {
    decls.push(`  --heelslide-handle-border-color: ${theme.handleBorderColor};`);
  }
  if (theme.handleBorderWidth !== undefined) {
    decls.push(`  --heelslide-handle-border-width: ${theme.handleBorderWidth}px;`);
  }
  if (theme.handleBorderRadius !== undefined) {
    const val = typeof theme.handleBorderRadius === 'number' ? `${theme.handleBorderRadius}px` : theme.handleBorderRadius;
    decls.push(`  --heelslide-handle-border-radius: ${val};`);
  }
  if (theme.heelRadius !== undefined) {
    decls.push(`  --heelslide-track-heel-radius: ${theme.heelRadius}px;`);
    decls.push(`  --heelslide-heel-radius: ${theme.heelRadius}px;`);
  }
  if (theme.heelPadding !== undefined) {
    decls.push(`  --heelslide-heel-padding: ${theme.heelPadding}px;`);
  }
  if (theme.heelBorderColor) {
    decls.push(`  --heelslide-heel-border-color: ${theme.heelBorderColor};`);
  }
  if (theme.heelBorderWidth !== undefined) {
    decls.push(`  --heelslide-heel-border-width: ${theme.heelBorderWidth}px;`);
  }
  if (theme.targetHeelBg) {
    decls.push(`  --heelslide-target-heel-bg: ${theme.targetHeelBg};`);
  }
  if (theme.targetHeelBorderColor) {
    decls.push(`  --heelslide-target-heel-border-color: ${theme.targetHeelBorderColor};`);
  }
  if (theme.targetHeelBorderWidth !== undefined) {
    decls.push(`  --heelslide-target-heel-border-width: ${theme.targetHeelBorderWidth}px;`);
  }
  if (theme.targetHeelScale !== undefined) {
    decls.push(`  --heelslide-target-heel-scale: ${theme.targetHeelScale};`);
  }
  if (theme.goalBg) {
    decls.push(`  --heelslide-goal-bg: ${theme.goalBg};`);
  }
  if (theme.goalBorderColor) {
    decls.push(`  --heelslide-goal-border-color: ${theme.goalBorderColor};`);
  }
  if (theme.goalBorderWidth !== undefined) {
    decls.push(`  --heelslide-goal-border-width: ${theme.goalBorderWidth}px;`);
  }
  if (theme.heelTextColor) {
    decls.push(`  --heelslide-heel-text-color: ${theme.heelTextColor};`);
  }
  if (theme.targetHeelTextColor) {
    decls.push(`  --heelslide-target-heel-text-color: ${theme.targetHeelTextColor};`);
  }
  if (theme.successColor) {
    decls.push(`  --heelslide-success-color: ${theme.successColor};`);
  }
  if (theme.errorColor) {
    decls.push(`  --heelslide-error-color: ${theme.errorColor};`);
  }
  return decls.join('\n');
}

export function generateCodeSnippet(target: FrameworkTarget, config: PlaygroundConfig): string {
  const { heels, tolerance, width, height, gridStep, margin, seed, disabled, segmented, checkpointTimeoutMs, haptics, sound, numberedHeels, accessibleFallback, theme, customHandleIcon } = config;

  // Emitted only when it differs from the default, so the common snippet stays uncluttered.
  const isCustomFallback = accessibleFallback === 'custom';

  if (target === 'react') {
    const seedAttr = seed !== undefined ? `\n        seed={${seed}}` : '';
    const disabledAttr = disabled ? '\n        disabled={true}' : '';
    const segmentedAttr = segmented ? '\n        segmented={true}' : '';
    const timeoutAttr = segmented && checkpointTimeoutMs ? `\n        checkpointTimeoutMs={${checkpointTimeoutMs}}` : '';
    const hapticsAttr = haptics ? '\n        haptics={true}' : '';
    const soundAttr = sound ? '\n        sound={true}' : '';
    const numberedHeelsAttr = numberedHeels ? '\n        numberedHeels={true}' : '';
    const fallbackAttr = isCustomFallback ? '\n        accessibleFallback="custom"' : '';
    const handleChildren = customHandleIcon
      ? `>\n        <LockIcon className="handle-icon" />\n      </Heelslide>`
      : '/>';
    return `import { Heelslide } from '@heelslide/react';

export function SecurityGate() {
  const handleUnlock = () => {
    alert('Unlocked!');
  };

  return (
    <div
      style={{
${formatReactStyles(theme, width, height)}
      } as React.CSSProperties}
    >
      <Heelslide
        heels={${heels}}
        tolerance={${tolerance}}
        width={${width}}
        height={${height}}
        gridStep={${gridStep}}
        margin={${margin}}${seedAttr}${disabledAttr}${segmentedAttr}${timeoutAttr}${hapticsAttr}${soundAttr}${numberedHeelsAttr}${fallbackAttr}
        onUnlock={handleUnlock}
        onReset={() => console.log('Reset')}
      ${handleChildren}
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
    const fallbackAttr = isCustomFallback ? '\n      accessible-fallback="custom"' : '';
    const handleSlot = customHandleIcon
      ? `>\n      <template #handle="{ state }">\n        <LockIcon :unlocked="state === 'unlocked'" />\n      </template>\n    </Heelslide>`
      : '/>';
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
      :margin="${margin}"${seedAttr}${disabledAttr}${segmentedAttr}${timeoutAttr}${hapticsAttr}${soundAttr}${numberedHeelsAttr}${fallbackAttr}
      @unlock="onUnlock"
      @reset="() => console.log('Reset')"
    ${handleSlot}
  </div>
</template>

<style scoped>
.security-gate {
${formatCssDeclarations(theme, width, height)}
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
    const fallbackAttr = isCustomFallback ? '\n    accessibleFallback="custom"' : '';
    const handleChildren = customHandleIcon
      ? `>\n    <LockIcon />\n  </Heelslide>`
      : '/>';
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
    margin={${margin}}${seedAttr}${disabledAttr}${segmentedAttr}${timeoutAttr}${hapticsAttr}${soundAttr}${numberedHeelsAttr}${fallbackAttr}
    onunlock={onUnlock}
    onreset={() => console.log('Reset')}
  ${handleChildren}
</div>

<style>
.security-gate {
${formatCssDeclarations(theme, width, height)}
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
