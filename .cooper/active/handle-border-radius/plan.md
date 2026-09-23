# Implementation Plan: Custom Handle Border Radius & Geometric Shapes (`handle-border-radius`)

## Track Overview
- Track ID: `handle-border-radius`
- Capabilities: `react-adapter`, `vue-adapter`, `svelte-adapter`, `docs-playground`
- Goal: Introduce `--heelslide-handle-border-radius` (defaulting to 8px rounded square) across React, Vue, Svelte adapters, docs playground configurator, and reference documentation.

---

## Phase 1: React, Vue & Svelte Adapter Implementation

- [x] Task 1.1: React Adapter `--heelslide-handle-border-radius` Support (f7ea2be)
  - [x] Sub-task 1.1.1: Write unit tests in `packages/react/src/Heelslide.test.tsx` asserting handle style applies `var(--heelslide-handle-border-radius, 8px)` (Red)
  - [x] Sub-task 1.1.2: Implement `borderRadius: 'var(--heelslide-handle-border-radius, 8px)'` in `packages/react/src/Heelslide.tsx` and update `packages/react/src/style.css` (Green)
  - [x] Sub-task 1.1.3: Refactor & verify test coverage >80% (Refactor)

- [x] Task 1.2: Vue Adapter Shape & Border Radius Support
  - [x] Sub-task 1.2.1: Write component tests in `packages/vue/src/` asserting handle shape applies `var(--heelslide-handle-border-radius, 8px)` and renders centered shape (Red)
  - [x] Sub-task 1.2.2: Implement SVG `<rect class="heelslide-handle-shape heelslide-handle-circle">` in `Heelslide.vue` and update `packages/vue/src/style.css` (Green)
  - [x] Sub-task 1.2.3: Refactor & verify test coverage >80% (Refactor)

- [x] Task 1.3: Svelte Adapter Shape & Border Radius Support
  - [x] Sub-task 1.3.1: Write component tests in `packages/svelte/src/` asserting handle shape applies `var(--heelslide-handle-border-radius, 8px)` (Red)
  - [x] Sub-task 1.3.2: Implement SVG `<rect class="heelslide-handle-shape heelslide-handle-circle">` in `Heelslide.svelte` and update `packages/svelte/src/style.css` (Green)
  - [x] Sub-task 1.3.3: Refactor & verify test coverage >80% (Refactor)

- [x] Task 1.4: Phase 1 Verification & Checkpoint
  - [x] Sub-task 1.4.1: Synchronize workflow rules and capability specs (`git fetch origin main`)
  - [x] Sub-task 1.4.2: Run automated test suite (`CI=true npm test`)
  - [x] Sub-task 1.4.3: Conduct checkpoint review and record Git Note
  - [x] Sub-task 1.4.4: Remote synchronization (`git push origin handle-border-radius`)

---

## Phase 2: Docs Playground, Configurator & Snippet Generation

- [x] Task 2.1: Playground Handle Border Radius Controls & Snippets
  - [x] Sub-task 2.1.1: Write unit tests in `apps/docs/src/utils/generatorSnippet.test.ts` and `apps/docs/src/App.test.tsx` for `handleBorderRadius` prop and snippet output (Red)
  - [x] Sub-task 2.1.2: Implement `handleBorderRadius` theme control, preset updates, and snippet generation in `apps/docs` (Green)
  - [x] Sub-task 2.1.3: Refactor & verify test coverage >80% (Refactor)

- [x] Task 2.2: Phase 2 Verification & Checkpoint
  - [x] Sub-task 2.2.1: Synchronize workflow rules and capability specs (`git fetch origin main`)
  - [x] Sub-task 2.2.2: Run automated test suite (`CI=true npm test`)
  - [x] Sub-task 2.2.3: Conduct checkpoint review and record Git Note
  - [x] Sub-task 2.2.4: Remote synchronization (`git push origin handle-border-radius`)

---

## Phase 3: Reference Documentation, README & Final Verification

- [~] Task 3.1: CSS Reference Tables & README Documentation
  - [ ] Sub-task 3.1.1: Write tests in `apps/docs/src/readme.test.ts` and `DocsReference.test.tsx` checking for `--heelslide-handle-border-radius` (Red)
  - [ ] Sub-task 3.1.2: Update `DocsReference.tsx` and `README.md` CSS Custom Properties tables with `--heelslide-handle-border-radius: 8px` (Green)
  - [ ] Sub-task 3.1.3: Run full build and test suite (`npm run build`, `npm run lint`, `CI=true npm test`)

- [ ] Task 3.2: Phase 3 Verification & Final Checkpoint
  - [ ] Sub-task 3.2.1: Synchronize workflow rules and capability specs (`git fetch origin main`)
  - [ ] Sub-task 3.2.2: Run full build, format checks, and test suite (`npm run build`, `npm run lint`, `CI=true npm test`)
  - [ ] Sub-task 3.2.3: Conduct final verification and obtain user approval via `ask_question`
  - [ ] Sub-task 3.2.4: Record Git Note and commit Phase 3 checkpoint
  - [ ] Sub-task 3.2.5: Remote synchronization (`git push origin handle-border-radius`)
