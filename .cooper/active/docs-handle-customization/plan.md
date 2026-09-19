# Implementation Plan: Handle Customization & Headless API Documentation (`docs-handle-customization`)

## Phase 1: Reference Tables Expansion (Handle CSS Tokens & API Props/Slots)
- [x] Task: Expand `DocsReference.tsx` CSS and Props Reference Tables (04799b3)
  - [x] Sub-task: Write unit tests in `apps/docs/src/components/DocsReference.test.tsx` checking new CSS handle tokens (`--heelslide-handle-shadow`, `--heelslide-handle-checkpoint-shadow`, `--heelslide-handle-checkpoint-border-color`, `--heelslide-handle-size`) and props (`children`, `#handle` slot) (Red)
  - [x] Sub-task: Update `PROPS_DOCS` and `CSS_DOCS` in `DocsReference.tsx` (Green)
  - [x] Sub-task: Refactor and verify test coverage >80% (Refactor)
- [x] Task: Phase 1 Verification & Checkpoint [checkpoint: 04b1fcf]
  - [x] Sub-task: Run unit tests, sync main (`git fetch origin main`), and push checkpoint

## Phase 2: Dedicated Handle Customization & Headless Guide
- [x] Task: Add Handle & Headless Guide Tab to `DocsReference.tsx` (fc08d34)
  - [x] Sub-task: Write unit tests in `DocsReference.test.tsx` verifying tab navigation to "Handle & Headless Guide", rendering copyable code blocks for custom handle content across React/Vue/Svelte, headless `useHeelslide` / `getHandleProps` examples, and CSS selectors table (Red)
  - [x] Sub-task: Implement third tab in `DocsReference.tsx` with comprehensive code snippets, headless hook explanation, and selector reference (Green)
  - [x] Sub-task: Refactor styling and verify responsive rendering in mobile and desktop viewports (Refactor)
- [ ] Task: Phase 2 Verification & Checkpoint
  - [ ] Sub-task: Run test suite, sync main (`git fetch origin main`), and push checkpoint

## Phase 3: Interactive Handle Icon Customization & Snippet Generation
- [ ] Task: Playground Handle Icon & Framework Snippet Generation
  - [ ] Sub-task: Write unit tests in `apps/docs/src/utils/generatorSnippet.test.ts` verifying `customHandleIcon` outputs children in React snippet, `#handle` scoped slot in Vue snippet, and child snippet in Svelte (Red)
  - [ ] Sub-task: Implement `customHandleIcon` support in `snippets.ts`, add toggle in `ConfigPanel.tsx`, and pass child icon to `<Heelslide>` in `Playground.tsx` (Green)
  - [ ] Sub-task: Refactor and verify visual integration in playground (Refactor)
- [ ] Task: Phase 3 Verification & Checkpoint
  - [ ] Sub-task: Run test suite, build docs bundle (`npm run docs:build`), and push checkpoint

## Phase 4: Track Finalization & Review
- [ ] Task: Final Quality Audit
  - [ ] Sub-task: Run full test suite (`npm test`), typecheck, and build
  - [ ] Sub-task: Sync capability spec `.cooper/specs/docs-playground/spec.md` with approved deltas
  - [ ] Sub-task: Push branch to remote
