# Proposal: Expanded CSS Custom Properties & Scoped Vue Docs Snippet

## 1. Summary
Expand and standardize the CSS custom property theming system across both React (`@heelslide/react`) and Vue (`@heelslide/vue`) adapters, and update the GitHub Pages documentation playground to generate Vue code snippets using idiomatic `<style scoped>` CSS blocks.

## 2. Motivation & Problem Statement
Currently, visual customization of the Heelslide track and handle relies on namespaced CSS variables (`--heelslide-*`). However, styling control is incomplete and slightly divergent across frameworks:
1. **Limited Geometry & Radius Control**: Consumers cannot customize the track stroke thickness or independently configure marker radii for the start point, heel turns, and end destination.
2. **Missing Heel Clearance**: Consumers cannot set inner clearance/padding around heel turns inside the track corridor (`--heelslide-heel-padding`).
3. **Inconsistent Slider/Handle Variables**: React uses `--heelslide-handle-bg` and `--heelslide-handle-border`, while Vue uses `--heelslide-handle-color`, `--heelslide-handle-border-color`, and `--heelslide-handle-border-width`. Furthermore, documentation refers to `--heelslide-slider-*`.
4. **Vue Docs Snippet Idiom**: The documentation playground generates Vue snippets using an inline `:style` binding object on a wrapper `<div>`, rather than an idiomatic Vue Single File Component (SFC) `<style scoped>` block.

## 3. Proposed Solution
1. **Standardized CSS Variables**:
   - `--heelslide-track-width`: Controls track line stroke width across React and Vue (default: `12px` / fallback `8px` normalized to `12px`).
   - `--heelslide-track-start-radius`: Controls the radius/size of the start endpoint marker (fallback to `--heelslide-endpoint-size`, default `6px`).
   - `--heelslide-track-end-radius`: Controls the radius/size of the end destination marker (fallback to `--heelslide-end-radius`, default `6px`).
   - `--heelslide-track-heel-radius`: Controls the corner/turn radius of the heel turn markers (fallback to `--heelslide-heel-radius`, default `4px`).
   - `--heelslide-heel-padding`: Controls the inner clearance/padding around the heel turn inside the track corridor (default `0px` / `4px`).
   - `--heelslide-heel-radius`: Controls the heel marker radius (fallback alias with `--heelslide-track-heel-radius`).
   - `--heelslide-slider-border-color`: Controls the slider handle border stroke color (fallback `--heelslide-handle-border-color` / `transparent`).
   - `--heelslide-slider-bg`: Controls the slider handle fill/background color (fallback `--heelslide-handle-color` / `--heelslide-handle-bg`).
   - Full backwards compatibility with all existing `--heelslide-handle-*` and `--heelslide-endpoint-*` variables.

2. **Scoped Style Block in Vue Code Snippets**:
   - Update `generateCodeSnippet('vue', config)` in `apps/docs/src/utils/snippets.ts` to output a clean Single File Component (SFC) structure:
     - `<script setup lang="ts">`
     - `<template>` with `<div class="security-gate"><Heelslide ... /></div>`
     - `<style scoped>` with `.security-gate { --heelslide-...: ...; }` matching Vue standards.
   - Update playground preview and tests.

## 4. Scope Boundaries
- **In Scope**:
  - React adapter (`packages/react`): Support expanded CSS variables with resilient fallbacks.
  - Vue adapter (`packages/vue`): Support expanded CSS variables in `style.css` and template.
  - Documentation playground (`apps/docs`): Expand ThemeConfig and theme controls to support new variables, and update snippet generator for Vue `<style scoped>`.
  - Monorepo tests: Unit tests for React, Vue, and Docs snippet generation.
- **Out of Scope**:
  - Changes to `@heelslide/core` gesture engine mechanics or mathematical path planning algorithms.
