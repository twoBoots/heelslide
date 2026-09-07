# Design Document: Expanded CSS Custom Properties, Heel Theming & Svelte/Vue/React Parity

## 1. Overview & Architecture
This design establishes the technical contracts for:
1. **Heel & Target Custom Properties**: Background, border color/width, and clearance padding for regular heels, the dynamic **target heel** (the immediate next turn in progress), and the **target goal** (the final endpoint).
2. **Heel Typography & Numbered Heels**: Font family, size, weight, text color, and `numberedHeels` support rendered via SVG `<text>` elements and standard CSS counters (`counter-reset` / `counter-increment`).
3. **Three-Framework Component Parity**: Synchronized implementations across `@heelslide/react`, `@heelslide/vue`, and `@heelslide/svelte`.
4. **Canonical Handle & Interaction Tokens**: `--heelslide-handle-*` canonical tokens with slider fallbacks, and state properties (`active`, `checkpoint`, `success`, `error`).
5. **Documentation Playground**: Presets (Clean Slate, Cyberpunk, Emerald Vault, High Contrast), granular sliders, `numberedHeels` toggle, and SFC `<style>` snippets for Vue and Svelte.

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

## 3. Framework Adaptations

### 3.1 React (`@heelslide/react`)
- Add `numberedHeels?: boolean` to `HeelslideProps`.
- Render `<g class="heelslide-heel-group" data-target={isTarget} style={{ counterIncrement: 'heelslide-heel' }}>`.
- Render SVG `<text class="heelslide-heel-text">` when `numberedHeels` is true.
- Detect target goal on final segment and apply `data-target="true"`.

### 3.2 Vue 3 (`@heelslide/vue`)
- Add `numberedHeels: { type: Boolean, default: false }` to `HeelslideProps`.
- Update `style.css` with container CSS variables, target selectors, and counter rules.
- Render heel `<g>` groups with `heelslide-heel-marker` and `<text>` elements.

### 3.3 Svelte 5 (`@heelslide/svelte`)
- Add `numberedHeels = false` to `HeelslideProps` in `$props()`.
- Update `packages/svelte/src/style.css` with identical CSS tokens and counter rules.
- Render heel `<g>` groups with `heelslide-heel-marker` and `<text>` elements.

---

## 4. Documentation Site & Snippet Generator (`apps/docs`)

### 4.1 Multi-Framework Scoped Snippets
In `apps/docs/src/utils/snippets.ts`:
- **Vue**: Generates `<script setup lang="ts">`, `<template>`, and `<style scoped>`.
- **Svelte**: Generates `<script lang="ts">`, markup, and `<style>` block.
- **React**: Generates component with inline CSS variable style object.

### 4.2 Playground Theme Presets & Controls
- **Clean Slate (Default)**: Enterprise slate/blue theme with crisp white borders.
- **Cyberpunk**: Dark `#0f172a` canvas, neon cyan `#06b6d4` track, electric pink target heel `#f43f5e`, bright yellow goal `#eab308`.
- **Emerald Vault**: Forest green accents, sage track, gold target heel border.
- **High Contrast**: Pure monochrome `#000000` / `#ffffff` with 3px high-contrast borders and bold numbered heels.
