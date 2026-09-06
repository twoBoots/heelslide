# Implementation Plan: Expanded CSS Custom Properties, Heel Theming & Svelte/Vue/React Parity

## Phase 1: Framework Component Adapters (React, Vue & Svelte)

- [x] Task 1: React Adapter Expanded CSS Properties, Heel Theming & Numbered Heels (e58a6bd)
  - [x] Sub-task: Write unit tests in `packages/react/tests/Heelslide.test.tsx` for expanded geometry, canonical handle tokens (`--heelslide-handle-bg`, `--heelslide-handle-border-color`), heel theming (`--heelslide-heel-bg`, `--heelslide-heel-border-color`, `--heelslide-heel-border-width`, `--heelslide-heel-padding`), target heel tokens (`--heelslide-target-heel-bg`, `--heelslide-target-heel-border-color`, `--heelslide-target-heel-border-width`), target goal tokens (`--heelslide-goal-bg`, `--heelslide-goal-border-color`), typography tokens (`--heelslide-heel-font-family`, `--heelslide-heel-font-size`, `--heelslide-heel-font-weight`, `--heelslide-heel-text-color`), and `numberedHeels` SVG text & CSS counter attributes (Red)
  - [x] Sub-task: Implement props, SVG attributes, target heel/goal detection, SVG `<text>` numbering, and state styles in `packages/react/src/Heelslide.tsx` (Green)
  - [x] Sub-task: Refactor and verify test coverage >80% (Refactor)

- [x] Task 2: Vue Adapter Expanded CSS Properties, Heel Theming & Numbered Heels (b32c507)
  - [x] Sub-task: Write unit tests in `packages/vue/tests/HeelslideRender.test.ts` for expanded CSS custom properties, heel/target/goal tokens, typography, and `numberedHeels` prop (Red)
  - [x] Sub-task: Update `packages/vue/src/style.css`, `packages/vue/src/types.ts`, and `packages/vue/src/Heelslide.vue` with variable declarations, target markers, SVG `<text>` elements, and CSS counter rules (Green)
  - [x] Sub-task: Refactor and verify test coverage >80% (Refactor)

- [x] Task 3: Svelte 5 Adapter Expanded CSS Properties, Heel Theming & Numbered Heels (f7cb873)
  - [x] Sub-task: Write unit tests in `packages/svelte/tests/HeelslideRender.test.ts` for expanded CSS custom properties, heel/target/goal tokens, typography, and `numberedHeels` prop (Red)
  - [x] Sub-task: Update `packages/svelte/src/style.css`, `packages/svelte/src/types.ts`, and `packages/svelte/src/Heelslide.svelte` with variable declarations, target markers, SVG `<text>` elements, and CSS counter rules (Green)
  - [x] Sub-task: Refactor and verify test coverage >80% (Refactor)

- [x] Task 4: Phase 1 Verification & Checkpoint (4895f55)
  - [x] Sub-task: Run all React, Vue, and Svelte tests via Vitest (`npm test --workspace=packages/react --workspace=packages/vue --workspace=packages/svelte`)
  - [x] Sub-task: Sync remote rules (`git fetch origin main`)
  - [x] Sub-task: Record Git Notes checkpoint and push branch (`git push origin expand-css-variables`)

## Phase 2: Documentation Playground & Code Generator (apps/docs)

- [ ] Task 1: Vue and Svelte Code Snippets with Scoped Style Blocks
  - [ ] Sub-task: Update `apps/docs/tests/generatorSnippet.test.ts` to assert `<style scoped>` (Vue), `<style>` (Svelte), and `numberedHeels` output (Red)
  - [ ] Sub-task: Implement Vue and Svelte SFC snippet generator in `apps/docs/src/utils/snippets.ts` (Green)
  - [ ] Sub-task: Refactor and ensure clean indentation and syntax (Refactor)

- [ ] Task 2: Docs Playground Theme Controls, Presets, Numbered Heels & Granular Sliders
  - [ ] Sub-task: Write tests in `apps/docs/tests/App.test.tsx` and `VisualFixture.test.tsx` for expanded theme parameters, presets, and `numberedHeels` toggle (Red)
  - [ ] Sub-task: Expand `ThemeConfig` and implement theme presets (Clean Slate, Cyberpunk, Emerald Vault, High Contrast), `numberedHeels` control, and geometry sliders in `ConfigPanel.tsx` & `Playground.tsx` (Green)
  - [ ] Sub-task: Verify production static build (`npm run build --workspace=apps/docs`) (Refactor)

- [ ] Task 3: Phase 2 Verification & Checkpoint
  - [ ] Sub-task: Run full monorepo test suite (`npm test`) and lint checks (`npm run lint`)
  - [ ] Sub-task: Sync remote rules (`git fetch origin main`)
  - [ ] Sub-task: Record Git Notes checkpoint and push branch (`git push origin expand-css-variables`)

## Phase 3: Documentation & Spec Reconciliation

- [ ] Task 1: Update Living Capability Specs & README
  - [ ] Sub-task: Merge spec deltas into `.cooper/specs/react-adapter/spec.md`, `.cooper/specs/vue-adapter/spec.md`, `.cooper/specs/svelte-adapter/spec.md`, and `.cooper/specs/docs-playground/spec.md`
  - [ ] Sub-task: Update `README.md` CSS variable documentation table with new canonical tokens, heel/target/goal variables, typography properties, and `numberedHeels` guide across React, Vue, and Svelte
- [ ] Task 2: Final Verification & Review Preparation
  - [ ] Sub-task: Run comprehensive test, lint, and typecheck suite
  - [ ] Sub-task: Update track metadata to review-ready
