# Design Document: Expanded CSS Custom Properties & Scoped Vue Docs Snippet

## 1. Overview & Architecture
This design defines the technical contract for expanding CSS custom properties across `@heelslide/react` and `@heelslide/vue` components, and modernizing the documentation playground's Vue code generator to follow Vue Single File Component (SFC) standards with `<style scoped>`.

## 2. CSS Custom Property Specifications & Fallback Chains

### 2.1 Track Geometry & Sizing
- **`--heelslide-track-width`**:
  - Description: Stroke thickness of the background and progress track paths.
  - Fallback chain: `var(--heelslide-track-width, 12px)`.
- **`--heelslide-track-start-radius`**:
  - Description: Radius of the starting point circular indicator.
  - Fallback chain: `var(--heelslide-track-start-radius, var(--heelslide-endpoint-size, var(--heelslide-start-radius, 6px)))`.
- **`--heelslide-track-end-radius`**:
  - Description: Radius of the destination endpoint circular indicator.
  - Fallback chain: `var(--heelslide-track-end-radius, var(--heelslide-end-radius, var(--heelslide-endpoint-size, 6px)))`.
- **`--heelslide-track-heel-radius`**:
  - Description: Radius of heel turn corner indicator markers.
  - Fallback chain: `var(--heelslide-track-heel-radius, var(--heelslide-heel-radius, var(--heelslide-heel-size, 4px)))`.
- **`--heelslide-heel-radius`**:
  - Description: Marker border/corner radius for heel indicator elements.
  - Fallback chain: `var(--heelslide-heel-radius, var(--heelslide-track-heel-radius, 4px))`.
- **`--heelslide-heel-padding`**:
  - Description: Inner clearance / gap spacing around the heel corner turn marker within the track path corridor.
  - Implementation: SVG marker clearance ring / stroke buffer using `stroke: var(--heelslide-track-bg); stroke-width: var(--heelslide-heel-padding, 0px)`.

### 2.2 Slider Handle Theming
- **`--heelslide-slider-bg`**:
  - Description: Background fill color of the draggable slider handle.
  - Fallback chain: `var(--heelslide-slider-bg, var(--heelslide-handle-color, var(--heelslide-handle-bg, #ffffff)))`.
- **`--heelslide-slider-border-color`**:
  - Description: Border / stroke color of the draggable slider handle.
  - Fallback chain: `var(--heelslide-slider-border-color, var(--heelslide-handle-border-color, #3b82f6))`.
- **`--heelslide-slider-border-width`**:
  - Description: Border thickness for the draggable handle.
  - Fallback chain: `var(--heelslide-slider-border-width, var(--heelslide-handle-border-width, 2px))`.

## 3. Framework Adaptations

### 3.1 React Component (`packages/react/src/Heelslide.tsx`)
- Update track path elements:
  - Background path: `strokeWidth="var(--heelslide-track-width, 12px)"`
- Update start point circle:
  - `r="var(--heelslide-track-start-radius, var(--heelslide-endpoint-size, 6px))"`
- Update heel point circles:
  - `r="var(--heelslide-track-heel-radius, var(--heelslide-heel-radius, var(--heelslide-heel-size, 4px)))"`
  - `stroke="var(--heelslide-track-bg, #e2e8f0)"`
  - `strokeWidth="var(--heelslide-heel-padding, 0px)"`
- Update end point circle:
  - `r="var(--heelslide-track-end-radius, var(--heelslide-endpoint-size, 6px))"`
- Update handle div:
  - `backgroundColor: 'var(--heelslide-slider-bg, var(--heelslide-handle-bg, #ffffff))'`
  - `border: 'var(--heelslide-handle-border, 2px solid var(--heelslide-slider-border-color, var(--heelslide-handle-border-color, #3b82f6)))'`

### 3.2 Vue Component (`packages/vue/src/style.css` & `Heelslide.vue`)
- In `style.css`:
  - Declare default CSS variables on `.heelslide-container`:
    - `--heelslide-track-width: 12px;`
    - `--heelslide-track-start-radius: var(--heelslide-start-radius, 6px);`
    - `--heelslide-track-end-radius: var(--heelslide-end-radius, 6px);`
    - `--heelslide-track-heel-radius: var(--heelslide-heel-radius, 4px);`
    - `--heelslide-heel-radius: 4px;`
    - `--heelslide-heel-padding: 0px;`
    - `--heelslide-slider-bg: var(--heelslide-handle-color, #ffffff);`
    - `--heelslide-slider-border-color: var(--heelslide-handle-border-color, #3b82f6);`
    - `--heelslide-slider-border-width: var(--heelslide-handle-border-width, 2px);`
  - Add start marker rendering if missing, or update heel markers:
    - `.heelslide-heel-marker`: `r: var(--heelslide-track-heel-radius); stroke: var(--heelslide-track-bg); stroke-width: var(--heelslide-heel-padding);`
    - `.heelslide-end-marker`: `r: var(--heelslide-track-end-radius);`
    - `.heelslide-handle-circle`: `fill: var(--heelslide-slider-bg); stroke: var(--heelslide-slider-border-color); stroke-width: var(--heelslide-slider-border-width);`

## 4. Documentation Site & Snippet Generator (`apps/docs`)

### 4.1 Vue Scoped Style Block Pattern
In `apps/docs/src/utils/snippets.ts`, replace the inline `:style` object binding with:
```vue
<script setup lang="ts">
import { Heelslide } from '@heelslide/vue';
import '@heelslide/vue/dist/style.css';

function onUnlock() {
  alert('Unlocked!');
}
</script>

<template>
  <div class="security-gate">
    <Heelslide
      :heels="2"
      :tolerance="24"
      :bounds="{ width: 300, height: 150 }"
      :grid-step="24"
      :margin="16"
      @unlock="onUnlock"
      @reset="() => console.log('Reset')"
    />
  </div>
</template>

<style scoped>
.security-gate {
  --heelslide-track-bg: #e2e8f0;
  --heelslide-track-active: #3b82f6;
  --heelslide-track-width: 12px;
  --heelslide-slider-bg: #ffffff;
  --heelslide-slider-border-color: #3b82f6;
  --heelslide-heel-color: #94a3b8;
}
</style>
```

### 4.2 Playground Theme Controls
Update `ThemeConfig`, `ConfigPanel.tsx`, and `Playground.tsx` to expose the new CSS variables in the real-time configuration panel.
