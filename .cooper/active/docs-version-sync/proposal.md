# Proposal: Dynamic Documentation Version & Package Export Synchronization

## 1. Summary
Synchronize the release version across monorepo package exports (`VERSION` in `@heelslide/core`, `@heelslide/react`, `@heelslide/vue`, and `@heelslide/svelte`) and update the documentation demo playground header badge (`Header.tsx`) to dynamically display the active published version (`v0.2.0`) rather than a hardcoded static string.

## 2. Motivation & Problem Statement
Following the merge of automated release versioning (PR #15 bumping all core packages to `0.2.0`), GitHub Pages rebuilt and deployed, but the live site continued displaying `v0.1.0`. Investigation revealed:
1. `apps/docs/src/components/Header.tsx` hardcoded `<span className="header-badge">v0.1.0</span>`.
2. Monorepo package manifests (`package.json` at root and in `apps/docs`) remained on `0.1.0`.
3. Exported runtime constants `export const VERSION = '0.1.0'` in `packages/core`, `packages/react`, and `packages/vue` were out of date.
4. Unit tests in `packages/*/tests/index.test.ts` and `apps/docs/tests/App.test.tsx` asserted literal `'0.1.0'` strings rather than dynamic or synchronized versions.

## 3. Proposed Solution
1. **Dynamic Header Badge:** Update `apps/docs/src/components/Header.tsx` to import `VERSION` from `@heelslide/core` and display `v{VERSION}`, ensuring documentation builds always mirror the engine/adapter package version.
2. **Version Constant Synchronization:** Update exported `VERSION` constants to `'0.2.0'` in `@heelslide/core`, `@heelslide/react`, `@heelslide/vue`, and add `VERSION` to `@heelslide/svelte` for complete four-package parity.
3. **Workspace Manifest Synchronization:** Bump root `package.json` and `apps/docs/package.json` to `0.2.0`.
4. **Resilient Test Assertions:** Update package export tests to assert against `package.json` version definitions, and `App.test.tsx` to verify the badge matches `v${VERSION}`.

## 4. Scope Boundaries
- **In Scope:**
  - `apps/docs/src/components/Header.tsx` & `apps/docs/tests/App.test.tsx`
  - `packages/core/src/index.ts` & `packages/core/tests/index.test.ts`
  - `packages/react/src/index.ts` & `packages/react/tests/index.test.ts`
  - `packages/vue/src/index.ts` & `packages/vue/tests/index.test.ts`
  - `packages/svelte/src/index.ts` & `packages/svelte/tests/index.test.ts`
  - Root and docs `package.json` version metadata
- **Out of Scope:**
  - Visual regression snapshots (unaffected as `VisualFixture` isolates `<Heelslide />` without headers)
  - Changes to gesture physics, state machine, or adapter rendering logic
