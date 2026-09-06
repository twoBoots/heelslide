# Design Document: Expanded CSS Custom Properties, Heel Theming & Scoped Vue Docs Snippet

## 1. Overview & Architecture
This design establishes the technical contracts for:
1. **Heel & Target Custom Properties**: Background, border color/width, and clearance padding for regular heels, the dynamic **target heel** (the immediate next turn in progress), and the **target goal** (the final endpoint).
2. **Heel Typography & Numbered Heels**: Font family, size, weight, text color, and `numberedHeels` support rendered via SVG `<text>` elements and standard CSS counters (`counter-reset` / `counter-increment`).
3. **Canonical Handle & Interaction Tokens**: `--heelslide-handle-*` canonical tokens with slider fallbacks, and state properties (`active`, `checkpoint`, `success`, `error`).
4. **Documentation Playground**: Presets (Clean Slate, Cyberpunk, Emerald Vault, High Contrast), granular sliders, `numberedHeels` toggle, and Vue SFC `<style scoped>` snippets.

---

## 2. CSS Custom Property Specifications & Fallback Chains

### 2.1 Track Geometry & Sizing
- **`--heelslide-track-width`**: Stroke thickness of track path. Fallback: `12px`.
- **`--heelslide-track-start-radius`**: Radius of starting point marker. Fallback: `var(--heelslide-endpoint-size, var(--heelslide-start-radius, 6px))`.
- **`--heelslide-track-end-radius` / `--heelslide-end-radius`**: Radius of destination marker. Fallback: `var(--heelslide-endpoint-size, 6px)`.
- **`--heelslide-track-heel-radius` / `--heelslide-heel-radius`**: Radius of heel corner markers. Fallback: `var(--heelslide-heel-size, 4px)`.
- **`--heelslide-heel-padding`**: Clearance gap around heel turns inside track corridor. Fallback: `0px`.

### 2.2 Heel & Target Custom Properties
- **Standard Heel Marker**:
  - `--heelslide-heel-bg`: Background fill color of heel markers. Fallback: `var(--heelslide-heel-color, #94a3b8)`.
  - `--heelslide-heel-border-color`: Border stroke color. Fallback: `transparent`.
  - `--heelslide-heel-border-width`: Border stroke width. Fallback: `0px`.
  - `--heelslide-heel-border`: Shorthand border fallback.
  - `--heelslide-heel-completed-color`: Fill color for completed heels. Fallback: `var(--heelslide-track-active, var(--heelslide-track-progress, #3b82f6))`.
- **Target Heel (Active Upcoming Heel)**:
  - Applied when `index === currentSegmentIndex`: element receives `data-target="true"` and `.heelslide-target`.
  - `--heelslide-target-heel-bg`: Background fill color of active target heel. Fallback: `var(--heelslide-heel-bg, var(--heelslide-track-active, #3b82f6))`.
  - `--heelslide-target-heel-border-color`: Target heel border stroke color. Fallback: `var(--heelslide-heel-border-color, #ffffff)`.
  - `--heelslide-target-heel-border-width`: Target heel border thickness. Fallback: `var(--heelslide-heel-border-width, 2px)`.
  - `--heelslide-target-heel-border`: Shorthand border fallback.
  - `--heelslide-target-heel-scale`: Scale transform factor. Fallback: `1.1`.
- **Target Goal (Destination Endpoint)**:
  - Applied when handle reaches final segment (`currentSegmentIndex === track.points.length - 2`): element receives `data-target="true"` and `.heelslide-target`.
  - `--heelslide-goal-bg` / `--heelslide-target-goal-bg`: Goal background fill color. Fallback: `var(--heelslide-end-color, var(--heelslide-track-active, #10b981))`.
  - `--heelslide-goal-border-color` / `--heelslide-target-goal-border-color`: Goal border stroke color. Fallback: `transparent`.
  - `--heelslide-goal-border-width`: Goal border stroke width. Fallback: `0px` (or `2px` when targeted).
  - `--heelslide-goal-border`: Shorthand border fallback.

### 2.3 Heel Typography & CSS Counter Tokens
- **`--heelslide-heel-font-family`**: Font family for heel numbering text. Fallback: `system-ui, -apple-system, sans-serif`.
- **`--heelslide-heel-font-size`**: Font size. Fallback: `10px`.
- **`--heelslide-heel-font-weight`**: Font weight. Fallback: `600`.
- **`--heelslide-heel-text-color`**: Text color for heel numbers. Fallback: `var(--heelslide-heel-color, #475569)`.
- **`--heelslide-target-heel-text-color`**: Text color for target heel number. Fallback: `#ffffff`.

### 2.4 Canonical Handle & State Tokens
- **`--heelslide-handle-bg`**: Handle fill. Fallback: `var(--heelslide-slider-bg, var(--heelslide-handle-color, #2563eb))`.
- **`--heelslide-handle-border-color`**: Handle border color. Fallback: `var(--heelslide-slider-border-color, #3b82f6)`.
- **`--heelslide-handle-border-width`**: Handle border thickness. Fallback: `var(--heelslide-slider-border-width, 2px)`.
- **`--heelslide-handle-size` / `--heelslide-handle-radius`**: Handle dimensions. Fallback: `32px`.
- **`--heelslide-handle-shadow`**: Handle shadow. Fallback: `0 2px 8px rgba(0, 0, 0, 0.15)`.
- **`--heelslide-handle-active-bg`**: Handle fill while dragging. Fallback: `var(--heelslide-handle-bg, #1d4ed8)`.
- **`--heelslide-handle-checkpoint-bg`**: Handle fill at checkpoint. Fallback: `var(--heelslide-handle-active-bg, var(--heelslide-handle-bg))`.
- **`--heelslide-handle-active-scale`**: Handle scale on active/checkpoint. Fallback: `1.05`.
- **`--heelslide-success-color`**: Color on unlock. Fallback: `#10b981`.
- **`--heelslide-error-color`**: Color on reset/snapback. Fallback: `#ef4444`.

---

## 3. DOM & SVG Structure Specifications

### 3.1 CSS Counter & Heel Group Structure
```html
<div class="heelslide-container" style="counter-reset: heelslide-heel;">
  <svg class="heelslide-svg" viewBox="...">
    <!-- Background and progress tracks -->
    
    <!-- Heel Marker Groups -->
    <g
      class="heelslide-heel-group"
      data-heelslide-heel="1"
      data-target="true"
      style="counter-increment: heelslide-heel;"
    >
      <!-- Clearance buffer ring if padding > 0 -->
      <circle
        class="heelslide-heel-buffer"
        cx="x" cy="y"
        r="calc(var(--heelslide-track-heel-radius, 4px) + var(--heelslide-heel-padding, 0px))"
        fill="var(--heelslide-track-bg, #e2e8f0)"
      />
      <!-- Heel Marker Circle -->
      <circle
        class="heelslide-heel-marker"
        cx="x" cy="y"
        r="var(--heelslide-track-heel-radius, 4px)"
      />
      <!-- Numbered text label (rendered when numberedHeels is true) -->
      <text
        class="heelslide-heel-text"
        x="x" y="y"
        text-anchor="middle"
        dominant-baseline="central"
      >
        1
      </text>
    </g>

    <!-- Goal Marker Group -->
    <g class="heelslide-goal-group" data-target="false">
      <circle class="heelslide-end-marker" cx="endX" cy="endY" ... />
    </g>

    <!-- Handle -->
  </svg>
</div>
```

### 3.2 CSS Rules for Target & Numbered Heels (`style.css` / scoped CSS)
```css
.heelslide-container {
  counter-reset: heelslide-heel;
}

.heelslide-heel-group {
  counter-increment: heelslide-heel;
}

.heelslide-heel-marker {
  fill: var(--heelslide-heel-bg, var(--heelslide-heel-color, #94a3b8));
  stroke: var(--heelslide-heel-border-color, transparent);
  stroke-width: var(--heelslide-heel-border-width, 0px);
  transition: fill 0.15s ease, stroke 0.15s ease, transform 0.15s ease;
}

.heelslide-heel-group[data-target="true"] .heelslide-heel-marker {
  fill: var(--heelslide-target-heel-bg, var(--heelslide-heel-bg, var(--heelslide-track-active, #3b82f6)));
  stroke: var(--heelslide-target-heel-border-color, var(--heelslide-heel-border-color, #ffffff));
  stroke-width: var(--heelslide-target-heel-border-width, var(--heelslide-heel-border-width, 2px));
  transform-origin: center;
  transform: scale(var(--heelslide-target-heel-scale, 1.1));
}

.heelslide-heel-text {
  font-family: var(--heelslide-heel-font-family, system-ui, -apple-system, sans-serif);
  font-size: var(--heelslide-heel-font-size, 10px);
  font-weight: var(--heelslide-heel-font-weight, 600);
  fill: var(--heelslide-heel-text-color, var(--heelslide-heel-color, #475569));
  pointer-events: none;
  user-select: none;
}

.heelslide-heel-group[data-target="true"] .heelslide-heel-text {
  fill: var(--heelslide-target-heel-text-color, #ffffff);
}

.heelslide-goal-group .heelslide-end-marker {
  fill: var(--heelslide-goal-bg, var(--heelslide-end-color, #10b981));
  stroke: var(--heelslide-goal-border-color, transparent);
  stroke-width: var(--heelslide-goal-border-width, 0px);
}

.heelslide-goal-group[data-target="true"] .heelslide-end-marker {
  fill: var(--heelslide-goal-bg, var(--heelslide-end-color, #10b981));
  stroke: var(--heelslide-goal-border-color, #ffffff);
  stroke-width: var(--heelslide-goal-border-width, 2px);
}
```

---

## 4. Documentation Site & Snippet Generator (`apps/docs`)

### 4.1 Vue Scoped Style Block Pattern
`apps/docs/src/utils/snippets.ts` generates:
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
      :numbered-heels="true"
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
  --heelslide-handle-bg: #ffffff;
  --heelslide-handle-border-color: #3b82f6;
  --heelslide-heel-bg: #94a3b8;
  --heelslide-target-heel-bg: #3b82f6;
  --heelslide-target-heel-border-color: #ffffff;
  --heelslide-target-heel-border-width: 2px;
  --heelslide-goal-bg: #10b981;
  --heelslide-goal-border-color: #ffffff;
  --heelslide-goal-border-width: 2px;
  --heelslide-heel-font-family: system-ui, sans-serif;
  --heelslide-heel-font-size: 10px;
  --heelslide-heel-text-color: #ffffff;
}
</style>
```

### 4.2 Playground Theme Presets & Controls
- **Clean Slate (Default)**: Enterprise slate/blue theme with crisp white borders.
- **Cyberpunk**: Dark `#0f172a` canvas, neon cyan `#06b6d4` track, electric pink target heel `#f43f5e`, bright yellow goal `#eab308`.
- **Emerald Vault**: Forest green accents, sage track, gold target heel border.
- **High Contrast**: Pure monochrome `#000000` / `#ffffff` with 3px high-contrast borders and bold numbered heels.
