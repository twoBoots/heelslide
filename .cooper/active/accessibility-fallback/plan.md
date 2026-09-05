# Implementation Plan: Accessibility & Keyboard Navigation Fallback

Track ID: `accessibility-fallback`

---

## Phase 1: Core Engine Accessibility & Stepping API (`@heelslide/core`)

- [x] **Task 1: Core Accessible Step Calculations & Directional Navigation** (4e994ec)
  - [x] Sub-task: Unit tests for `getAccessibleSteps()`, `getAccessibleDescription()`, `stepForward()`, `stepBackward()`, and `stepToNextHeel()` (Red)
  - [x] Sub-task: Implement accessible stepping and description generators in `packages/core/src/accessibility.ts`, `types.ts`, and `engine.ts` (Green)
  - [x] Sub-task: Refactor & verify test coverage >80% (Refactor)
- [~] **Task 2: Core Accessibility Announcements & Event Lifecycle**
  - [ ] Sub-task: Unit tests for `onAnnouncement` events across gesture states, heel arrivals, and resets (Red)
  - [ ] Sub-task: Implement `AccessibleAnnouncement` dispatcher and integrate with `HeelslideEngine` and `machine.ts` (Green)
  - [ ] Sub-task: Refactor & verify test coverage >80% (Refactor)
- [ ] **Task 3: Phase 1 Verification & Checkpoint**
  - [ ] Sub-task: Run Vitest core test suite and verify >80% coverage
  - [ ] Sub-task: Workflow rule sync (`git fetch origin main`)
  - [ ] Sub-task: Checkpoint commit & attach Git Note
  - [ ] Sub-task: Push branch to remote (`git push origin accessibility-fallback`)

---

## Phase 2: React Component Accessibility & Keyboard Controls (`@heelslide/react`)

- [ ] **Task 4: Headless Hook Keyboard Event Prop Generators (`useHeelslide`)**
  - [ ] Sub-task: Unit tests for `onKeyDown` handlers (Arrow keys, Space/Enter, Home/Escape) and announcement state in `useHeelslide` (Red)
  - [ ] Sub-task: Implement keyboard event generators and fallback state in `packages/react/src/useHeelslide.ts` (Green)
  - [ ] Sub-task: Refactor & verify test coverage >80% (Refactor)
- [ ] **Task 5: React Component ARIA Semantics, Live Region & Fallback Dialog (`<Heelslide />`)**
  - [ ] Sub-task: Component tests for WAI-ARIA slider attributes, visually-hidden live region, and accessible fallback dialog rendering (Red)
  - [ ] Sub-task: Implement ARIA attributes, live region announcer, and fallback confirmation modal in `packages/react/src/Heelslide.tsx` (Green)
  - [ ] Sub-task: Refactor & verify test coverage >80% (Refactor)
- [ ] **Task 6: Phase 2 Verification & Checkpoint**
  - [ ] Sub-task: Run Vitest React test suite and verify >80% coverage
  - [ ] Sub-task: Workflow rule sync (`git fetch origin main`)
  - [ ] Sub-task: Checkpoint commit & attach Git Note
  - [ ] Sub-task: Push branch to remote (`git push origin accessibility-fallback`)

---

## Phase 3: Vue 3 Component Accessibility & Keyboard Controls (`@heelslide/vue`)

- [ ] **Task 7: Headless Composable Keyboard Controls (`useHeelslide`)**
  - [ ] Sub-task: Unit tests for keyboard event normalization, reactive announcement ref, and accessible fallback primitives in Vue composable (Red)
  - [ ] Sub-task: Implement keyboard handlers and stepping controls in `packages/vue/src/useHeelslide.ts` (Green)
  - [ ] Sub-task: Refactor & verify test coverage >80% (Refactor)
- [ ] **Task 8: Vue Presentation Component ARIA Semantics, Live Region & Slots (`<Heelslide />`)**
  - [ ] Sub-task: Component tests for ARIA slider markup, live region, keyboard listeners, and accessible fallback slot (Red)
  - [ ] Sub-task: Implement template, live region, and dialog in `packages/vue/src/Heelslide.vue` (Green)
  - [ ] Sub-task: Refactor & verify test coverage >80% (Refactor)
- [ ] **Task 9: Phase 3 Verification & Checkpoint**
  - [ ] Sub-task: Run Vitest Vue test suite and verify >80% coverage
  - [ ] Sub-task: Workflow rule sync (`git fetch origin main`)
  - [ ] Sub-task: Checkpoint commit & attach Git Note
  - [ ] Sub-task: Push branch to remote (`git push origin accessibility-fallback`)

---

## Phase 4: Full Workspace Integration, Documentation Playground & Final Verification

- [ ] **Task 10: Playground Accessibility Showcase & WCAG Verification Demo (`apps/docs`)**
  - [ ] Sub-task: Add keyboard navigation mode toggle, screen reader announcer log, and accessible fallback demo in docs playground
  - [ ] Sub-task: Run full workspace lint (`oxlint .`), build (`tsc -b && vite build`), and test suite (`vitest run --coverage`)
- [ ] **Task 11: Phase 4 Verification & Track Finalization**
  - [ ] Sub-task: Verify WCAG 2.2 AA compliance checklist and cross-framework consistency
  - [ ] Sub-task: Final phase checkpoint commit, Git Note, and push branch (`git push -u origin accessibility-fallback`)
