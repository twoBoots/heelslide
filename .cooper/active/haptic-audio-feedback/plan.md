# Implementation Plan: Haptic & Audio Feedback System

Track ID: `haptic-audio-feedback`

---

## Phase 1: Core Engine Feedback Infrastructure & Synthesis (`@heelslide/core`)

- [ ] **Task 1: Web Vibration & Web Audio Synthesis Controller**
  - [ ] Sub-task: Write unit tests for vibration triggers, Web Audio tone synthesis, fallback safety, and options (Red)
  - [ ] Sub-task: Implement `packages/core/src/feedback.ts` and update `packages/core/src/types.ts` (Green)
  - [ ] Sub-task: Refactor & verify coverage >80% (Refactor)
- [ ] **Task 2: Machine & Engine Event Wiring (`onTurn`, `onReset`, `onUnlock`)**
  - [ ] Sub-task: Write unit tests for `onTurn` emission and feedback triggers in `machine.ts` and `engine.ts` (Red)
  - [ ] Sub-task: Wire `onTurn` and feedback integration into `machine.ts`, `engine.ts`, and barrel export `index.ts` (Green)
  - [ ] Sub-task: Refactor & verify coverage >80% (Refactor)
- [ ] **Task 3: Phase 1 Verification & Checkpoint**
  - [ ] Sub-task: Run full `@heelslide/core` Vitest test suite and coverage check
  - [ ] Sub-task: Workflow rule sync (`git fetch origin main`)
  - [ ] Sub-task: Checkpoint commit & attach Git Note
  - [ ] Sub-task: Remote sync (`git push origin haptic-audio-feedback`)

---

## Phase 2: React Adapter Integration (`@heelslide/react`)

- [ ] **Task 4: React Hook & Component Feedback Props**
  - [ ] Sub-task: Write component & hook unit tests for `haptics`, `sound`, and `onTurn` in React (Red)
  - [ ] Sub-task: Implement feedback props in `packages/react/src/useHeelslide.ts`, `types.ts`, and `Heelslide.tsx` (Green)
  - [ ] Sub-task: Refactor & verify coverage >80% (Refactor)
- [ ] **Task 5: Phase 2 Verification & Checkpoint**
  - [ ] Sub-task: Run Vitest suite across `@heelslide/react` and verify coverage >80%
  - [ ] Sub-task: Workflow rule sync (`git fetch origin main`)
  - [ ] Sub-task: Checkpoint commit & attach Git Note
  - [ ] Sub-task: Remote sync (`git push origin haptic-audio-feedback`)

---

## Phase 3: Vue Adapter Integration (`@heelslide/vue`)

- [ ] **Task 6: Vue Composable & Component Feedback Integration**
  - [ ] Sub-task: Write composable and component unit tests for `haptics`, `sound`, `onTurn`, and `@turn` emit (Red)
  - [ ] Sub-task: Implement feedback props and emits in `packages/vue/src/useHeelslide.ts`, `types.ts`, and `Heelslide.vue` (Green)
  - [ ] Sub-task: Refactor & verify coverage >80% (Refactor)
- [ ] **Task 7: Phase 3 Verification & Checkpoint**
  - [ ] Sub-task: Run Vitest suite across `@heelslide/vue` and verify coverage >80%
  - [ ] Sub-task: Workflow rule sync (`git fetch origin main`)
  - [ ] Sub-task: Checkpoint commit & attach Git Note
  - [ ] Sub-task: Remote sync (`git push origin haptic-audio-feedback`)

---

## Phase 4: Documentation Playground & End-to-End Verification (`apps/docs`)

- [ ] **Task 8: Playground Interactive Feedback Controls & Audio Previews**
  - [ ] Sub-task: Add test cases and component integration for haptics & sound toggles in `apps/docs` (Red)
  - [ ] Sub-task: Implement interactive feedback toggles and test tone buttons in playground UI (Green)
  - [ ] Sub-task: Refactor & verify clean static build (`npm run build`) (Refactor)
- [ ] **Task 9: Phase 4 Verification & Track Finalization**
  - [ ] Sub-task: Full workspace typecheck (`tsc -b`), lint (`oxlint .`), and test suite (`vitest run --coverage`)
  - [ ] Sub-task: Verify static bundle emissions in `apps/docs/dist/`
  - [ ] Sub-task: Final phase checkpoint commit, Git Note, and push branch
