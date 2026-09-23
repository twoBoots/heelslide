# Implementation Plan: Brand Tagline Integration

## Track Overview
- Track ID: `tagline-intuitive-friction`
- Capability: `docs-playground`
- Goal: Add brand tagline "Intuitive friction, for interfaces with consequence." under the Heelslide heading in README.md and on the GitHub Pages documentation header.

---

## Phase 1: Test Suite Hardening (Red)

- [x] Task 1.1: Automated Tagline Tests in Documentation Test Suites (a6780fd)
  - [x] Sub-task 1.1.1: Add test assertion to `apps/docs/src/readme.test.ts` verifying presence of tagline under `# Heelslide` in `README.md` (Red)
  - [x] Sub-task 1.1.2: Add test assertion to `apps/docs/src/App.test.tsx` verifying tagline renders in docs header (Red)
  - [x] Sub-task 1.1.3: Verify test failures against unmodified files (Red confirmation)

- [x] Task 1.2: Phase 1 Verification & Checkpoint [checkpoint: 463ec57]
  - [x] Sub-task 1.2.1: Synchronize workflow rules and capability specs (`git fetch origin main`)
  - [x] Sub-task 1.2.2: Verify Red test failure states
  - [x] Sub-task 1.2.3: Record Git Note and commit Phase 1 checkpoint
  - [x] Sub-task 1.2.4: Remote synchronization (`git push origin tagline-intuitive-friction`)

---

## Phase 2: Implementation & Styling (Green)

- [x] Task 2.1: README & Header Tagline Integration (74bdc57)
  - [x] Sub-task 2.1.1: Update `README.md` with tagline blockquote directly under `# Heelslide` (Green)
  - [x] Sub-task 2.1.2: Update `apps/docs/src/components/Header.tsx` to render the tagline with `.header-tagline` (Green)
  - [x] Sub-task 2.1.3: Update `apps/docs/src/styles.css` with dedicated typography styles for `.header-tagline` and `.header-description` (Refactor)
  - [x] Sub-task 2.1.4: Run automated tests to verify all assertions pass (Green)

- [x] Task 2.2: Phase 2 Verification & Final Checkpoint [checkpoint: f77e5bd]
  - [x] Sub-task 2.2.1: Synchronize workflow rules and capability specs (`git fetch origin main`)
  - [x] Sub-task 2.2.2: Run full build and test suites (`npm run build`, `npm run lint`, `CI=true npm test`)
  - [x] Sub-task 2.2.3: Record Git Note and commit Phase 2 checkpoint
  - [x] Sub-task 2.2.4: Remote synchronization (`git push origin tagline-intuitive-friction`)
