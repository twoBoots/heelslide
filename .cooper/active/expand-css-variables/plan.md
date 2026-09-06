# Implementation Plan: Expanded CSS Custom Properties & Scoped Vue Docs Snippet

## Phase 1: Framework Component Adapters (React & Vue)

- [ ] Task 1: React Adapter CSS Custom Properties
  - [ ] Sub-task: Write unit tests in `packages/react/tests/Heelslide.test.tsx` for expanded CSS custom properties (`--heelslide-track-width`, `--heelslide-track-start-radius`, `--heelslide-track-end-radius`, `--heelslide-track-heel-radius`, `--heelslide-heel-padding`, `--heelslide-heel-radius`, `--heelslide-slider-border-color`, `--heelslide-slider-bg`) (Red)
  - [ ] Sub-task: Implement styling and fallback chains in `packages/react/src/Heelslide.tsx` (Green)
  - [ ] Sub-task: Refactor and verify test coverage >80% (Refactor)

- [ ] Task 2: Vue Adapter CSS Custom Properties
  - [ ] Sub-task: Write unit tests in `packages/vue/tests/HeelslideRender.test.ts` for expanded CSS custom properties (Red)
  - [ ] Sub-task: Update `packages/vue/src/style.css` and `packages/vue/src/Heelslide.vue` with variable declarations and bindings (Green)
  - [ ] Sub-task: Refactor and verify test coverage >80% (Refactor)

- [ ] Task 3: Phase 1 Verification & Checkpoint
  - [ ] Sub-task: Run all React and Vue tests via Vitest
  - [ ] Sub-task: Sync remote rules (`git fetch origin main`)
  - [ ] Sub-task: Record Git Notes checkpoint and push branch (`git push origin expand-css-variables`)

## Phase 2: Documentation Playground & Code Generator (apps/docs)

- [ ] Task 1: Vue Code Snippet Scoped Style Block
  - [ ] Sub-task: Update `apps/docs/tests/generatorSnippet.test.ts` to assert `<style scoped>` and scoped CSS variable rules (Red)
  - [ ] Sub-task: Implement Vue SFC snippet generator with `<style scoped>` in `apps/docs/src/utils/snippets.ts` (Green)
  - [ ] Sub-task: Refactor and ensure clean indentation and syntax (Refactor)

- [ ] Task 2: Docs Playground Theme Controls & Variable Integration
  - [ ] Sub-task: Write tests in `apps/docs/tests/App.test.tsx` and `VisualFixture.test.tsx` for expanded theme parameters (Red)
  - [ ] Sub-task: Expand `ThemeConfig` in `apps/docs/src/utils/snippets.ts` and update `ConfigPanel.tsx` & `Playground.tsx` (Green)
  - [ ] Sub-task: Verify production static build (`npm run build --workspace=apps/docs`) (Refactor)

- [ ] Task 3: Phase 2 Verification & Checkpoint
  - [ ] Sub-task: Run full monorepo test suite (`npm test`) and lint checks (`npm run lint`)
  - [ ] Sub-task: Sync remote rules (`git fetch origin main`)
  - [ ] Sub-task: Record Git Notes checkpoint and push branch (`git push origin expand-css-variables`)

## Phase 3: Documentation & Spec Reconciliation

- [ ] Task 1: Update Living Capability Specs & README
  - [ ] Sub-task: Merge spec deltas into `.cooper/specs/react-adapter/spec.md`, `.cooper/specs/vue-adapter/spec.md`, and `.cooper/specs/docs-playground/spec.md`
  - [ ] Sub-task: Update `README.md` CSS variable documentation table with new properties
- [ ] Task 2: Final Verification & Review Preparation
  - [ ] Sub-task: Run comprehensive test and typecheck suite
  - [ ] Sub-task: Update track metadata to review-ready
