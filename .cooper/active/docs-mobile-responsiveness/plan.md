# Implementation Plan: Mobile Responsiveness & Overflow Prevention

## Track Overview
- Track ID: `docs-mobile-responsiveness`
- Capability: `docs-playground`
- Goal: Fix mobile viewport overflows, implement touch-scrollable navigation, adaptive padding and typography, and responsive simulator/metrics containment.

---

## Phase 1: Viewport Root, Fluid Layout & Responsive Spacing

- [x] Task 1.1: Root Container & Viewport Overflow Protection (e7df222)
  - [x] Sub-task 1.1.1: Write unit tests asserting responsive layout classes and viewport root safety styles (Red)
  - [x] Sub-task 1.1.2: Implement root `overflow-x: clip`, fluid `.docs-container` and `.card` paddings, and fluid header typography (Green)
  - [x] Sub-task 1.1.3: Refactor and verify test coverage >80% (Refactor)

- [x] Task 1.2: Live Simulator Stage Responsive Containment (fbfa81d)
  - [x] Sub-task 1.2.1: Write component tests for preview stage viewport containment and responsive wrapper (Red)
  - [x] Sub-task 1.2.2: Implement `.preview-stage` mobile padding and `.preview-stage-viewport` scrolling/containment wrapper in `Playground.tsx` (Green)
  - [x] Sub-task 1.2.3: Refactor and verify test coverage >80% (Refactor)

- [x] Task 1.3: Phase 1 Verification & Checkpoint [checkpoint: 59cfd8b]
  - [x] Sub-task 1.3.1: Synchronize workflow rules and capability specs (`git fetch origin main`)
  - [x] Sub-task 1.3.2: Run automated test suite (`CI=true npm test`)
  - [x] Sub-task 1.3.3: Conduct manual verification and obtain user approval via `ask_question`
  - [x] Sub-task 1.3.4: Record Git Note and commit Phase 1 checkpoint
  - [x] Sub-task 1.3.5: Remote synchronization (`git push origin docs-mobile-responsiveness`)

---

## Phase 2: Touch-Scrollable Navigation, Metrics Grid & Control Flow

- [~] Task 2.1: Touch-Scrollable Framework & Reference Tab Bars
  - [ ] Sub-task 2.1.1: Write component tests for non-wrapping horizontal touch-scrollable tabs (`.tabs-nav`) (Red)
  - [ ] Sub-task 2.1.2: Implement `.tabs-nav` horizontal scrolling, scrollbar masking, and non-shrinking tab buttons (Green)
  - [ ] Sub-task 2.1.3: Refactor and verify test coverage >80% (Refactor)

- [ ] Task 2.2: Responsive Gate Metrics & Configuration Panel Refinements
  - [ ] Sub-task 2.2.1: Write component tests for responsive metrics reflow and config button/color-picker wrapping (Red)
  - [ ] Sub-task 2.2.2: Implement responsive `.stats-grid` breakpoints and refactored mobile control layouts in `ConfigPanel.tsx` (Green)
  - [ ] Sub-task 2.2.3: Refactor and verify test coverage >80% (Refactor)

- [ ] Task 2.3: Phase 2 Verification & Checkpoint
  - [ ] Sub-task 2.3.1: Synchronize workflow rules and capability specs (`git fetch origin main`)
  - [ ] Sub-task 2.3.2: Run automated test suite (`CI=true npm test`)
  - [ ] Sub-task 2.3.3: Conduct manual verification and obtain user approval via `ask_question`
  - [ ] Sub-task 2.3.4: Record Git Note and commit Phase 2 checkpoint
  - [ ] Sub-task 2.3.5: Remote synchronization (`git push origin docs-mobile-responsiveness`)

---

## Phase 3: Reference Tables, Code Previews & End-to-End Verification

- [ ] Task 3.1: Responsive Reference Tables & Code Previews
  - [ ] Sub-task 3.1.1: Write tests for reference table scrolling wrapper and code header wrapping (Red)
  - [ ] Sub-task 3.1.2: Implement `min-width` preservation for `.ref-table` and wrap handling in `FrameworkTabs.tsx` and `DocsReference.tsx` (Green)
  - [ ] Sub-task 3.1.3: Refactor and verify test coverage >80% (Refactor)

- [ ] Task 3.2: Phase 3 Verification & Final Checkpoint
  - [ ] Sub-task 3.2.1: Synchronize workflow rules and capability specs (`git fetch origin main`)
  - [ ] Sub-task 3.2.2: Run full build and test suite (`npm run build` & `CI=true npm test`)
  - [ ] Sub-task 3.2.3: Conduct comprehensive mobile viewport verification and obtain user approval via `ask_question`
  - [ ] Sub-task 3.2.4: Record Git Note and commit Phase 3 checkpoint
  - [ ] Sub-task 3.2.5: Remote synchronization (`git push origin docs-mobile-responsiveness`)
