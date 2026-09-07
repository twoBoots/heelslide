# Proposal: Expanded CSS Custom Properties, Heel Theming & Svelte/Vue/React Parity

## 1. Summary
Expand and standardize the CSS custom property theming system across all three component adapters—React (`@heelslide/react`), Vue (`@heelslide/vue`), and Svelte 5 (`@heelslide/svelte`). This proposal introduces comprehensive styling for heels and targets (heel background, heel border, target heel background/border, target goal background/border, heel typography/color), adds an option for numbered heels with CSS counter integration, establishes interaction state tokens (active drag, checkpoint wait, success unlock, error reset), and modernizes the documentation playground with design presets and idiomatic `<style scoped>` (Vue) / `<style>` (Svelte) code snippets.

## 2. Motivation & Problem Statement
Visual customization of the Heelslide track, heel turns, and handle currently relies on namespaced CSS variables (`--heelslide-*`), but lacks critical granular controls across frameworks:
1. **Heel & Target Visual Distinction**:
   - Heel markers are uniform circles with a single color. There is no way to customize heel backgrounds separately from borders.
   - Crucially, there is no visual differentiation for the **target heel** (the specific upcoming turn the user is currently navigating toward) or the **target goal** (the final destination endpoint).
2. **Missing Heel Numbering & CSS Counters**:
   - In complex multi-heel gestures (e.g. 3–5 turns), users lack visual sequence cues. There is no built-in mechanism to display placeholder step numbers (1, 2, 3...) or hook into CSS counters (`counter-reset` / `counter-increment`).
3. **Limited Typography & State Variables**:
   - Consumers cannot configure heel font family, font size, font weight, or text color via CSS variables.
   - Interaction states (`isDragging`, `checkpoint`, `unlocked`, `reset`) lack dedicated styling tokens.
4. **Three-Framework Alignment & Scoped Snippets**:
   - Svelte 5 support was recently merged into `main`. The CSS theming and variable system must achieve complete parity across React, Vue, and Svelte.
   - The documentation playground generates Vue snippets using an inline `:style` binding rather than an idiomatic Vue SFC `<style scoped>` block, and should showcase Svelte SFC `<style>` blocks.

## 3. Proposed Solution

### 3.1 Heel & Goal Theming Properties
- **Heel Markers**:
  - `--heelslide-heel-bg`: Heel marker background fill (fallback: `--heelslide-heel-color`, `#94a3b8`).
  - `--heelslide-heel-border-color`: Heel border stroke color (fallback: `transparent`).
  - `--heelslide-heel-border-width`: Heel border stroke thickness (fallback: `0px`).
  - `--heelslide-heel-border`: Shorthand border property fallback.
  - `--heelslide-heel-padding`: Inner clearance/gap buffer around the heel marker within the track corridor.
  - `--heelslide-heel-completed-color`: Fill color for heels already passed during gesture traversal.
- **Target Heel (Active Upcoming Corner)**:
  - Applied automatically via `data-target="true"` and `.heelslide-target` on the active segment's destination heel.
  - `--heelslide-target-heel-bg`: Target heel background fill (fallback: `--heelslide-heel-bg`, `--heelslide-track-active`, `#3b82f6`).
  - `--heelslide-target-heel-border-color`: Target heel border stroke color (fallback: `--heelslide-heel-border-color`).
  - `--heelslide-target-heel-border-width`: Target heel border thickness (fallback: `2px`).
  - `--heelslide-target-heel-border`: Shorthand border fallback.
  - `--heelslide-target-heel-scale`: Scale factor applied to target heel (default `1.1`).
- **Target Goal (Final Destination Endpoint)**:
  - Applied via `data-target="true"` and `.heelslide-target` when the handle enters the final segment.
  - `--heelslide-goal-bg` / `--heelslide-target-goal-bg`: Goal background fill (fallback: `--heelslide-end-color`, `--heelslide-track-active`, `#10b981`).
  - `--heelslide-goal-border-color` / `--heelslide-target-goal-border-color`: Goal border stroke color.
  - `--heelslide-goal-border-width`: Goal border thickness.
  - `--heelslide-goal-border`: Shorthand border fallback.

### 3.2 Heel Typography & Numbered Heels Option (with CSS Counters)
- **Props**: `numberedHeels?: boolean` across React, Vue, and Svelte `<Heelslide />`.
- **SVG Text Elements**: Centered `<text class="heelslide-heel-text">` elements rendered at each heel marker coordinate displaying the 1-based step index when enabled.
- **CSS Counter Support**:
  - Container element declares `counter-reset: heelslide-heel;`.
  - Each heel marker group declares `counter-increment: heelslide-heel;`.
  - Enables pure CSS counter styling and pseudo-element customization (`content: counter(heelslide-heel)`).
- **Typography Tokens**:
  - `--heelslide-heel-font-family`: Font family (default: `system-ui, -apple-system, sans-serif`).
  - `--heelslide-heel-font-size`: Font size (default: `10px`).
  - `--heelslide-heel-font-weight`: Font weight (default: `600`).
  - `--heelslide-heel-text-color` / `--heelslide-heel-color`: Text color for heel numbers (default: `#475569`).
  - `--heelslide-target-heel-text-color`: Text color when heel is the active target (default: `#ffffff`).

### 3.3 Canonical Handle & State Tokens
- Canonical `--heelslide-handle-*` tokens with `--heelslide-slider-*` and `--heelslide-handle-color` fallbacks.
- Interaction tokens: `--heelslide-handle-active-bg`, `--heelslide-handle-checkpoint-bg`, `--heelslide-handle-active-scale`, `--heelslide-success-color`, `--heelslide-error-color`.

### 3.4 Scoped Style Block in Vue/Svelte Code Snippets & Playground Presets
- Vue and Svelte code snippets output clean SFC components with scoped `<style>` blocks.
- ConfigPanel adds `numberedHeels` toggle, theme presets (Clean Slate, Cyberpunk, Emerald Vault, High Contrast), and sliders for track geometry, handle size, and heel borders.

## 4. Scope Boundaries
- **In Scope**:
  - React adapter (`packages/react`): Support expanded CSS custom properties, `numberedHeels` prop, target heel/goal detection, and SVG text/counter hooks.
  - Vue adapter (`packages/vue`): Support expanded CSS custom properties, `numberedHeels` prop, target heel/goal detection, and SVG text/counter hooks.
  - Svelte 5 adapter (`packages/svelte`): Support expanded CSS custom properties, `numberedHeels` prop, target heel/goal detection, and SVG text/counter hooks.
  - Documentation playground (`apps/docs`): Expand ThemeConfig, presets, `numberedHeels` control, and update snippet generator for Vue and Svelte scoped styles.
  - Monorepo tests: Unit tests for React, Vue, Svelte, and Docs snippet generation.
- **Out of Scope**:
  - Changes to core path generation math (`packages/core/src/generator.ts`).
