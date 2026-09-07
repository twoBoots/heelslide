# Architecture & Design: Dynamic Documentation Version & Package Export Synchronization

## 1. Technical Strategy
The documentation application (`apps/docs`) is bundled with Vite and imports core modules via path aliases in development/build. By binding the UI header badge to the exported `VERSION` constant in `@heelslide/core`, the deployed GitHub Pages site automatically reflects the active version without requiring manual string edits in presentation components on future releases.

## 2. Component & File Changes

### 2.1 Documentation Presentation (`apps/docs`)
- **`apps/docs/src/components/Header.tsx`**:
  - Import `VERSION` from `@heelslide/core`.
  - Render `<span className="header-badge">v{VERSION}</span>`.
- **`apps/docs/package.json`**:
  - Set `"version": "0.2.0"`.
- **`apps/docs/tests/App.test.tsx`**:
  - Assert `.header-badge` equals `v${VERSION}`.

### 2.2 Package Exports & Version Parity
- **`packages/core/src/index.ts`**:
  - Update `export const VERSION = '0.2.0';`.
- **`packages/react/src/index.ts`**:
  - Update `export const VERSION = '0.2.0';`.
- **`packages/vue/src/index.ts`**:
  - Update `export const VERSION = '0.2.0';`.
- **`packages/svelte/src/index.ts`**:
  - Add `export const VERSION = '0.2.0';`.

### 2.3 Package Manifests & Tests
- **`package.json` (Root)**:
  - Bump `"version": "0.2.0"`.
- **`packages/core/tests/index.test.ts`**:
  - Assert `VERSION` is `'0.2.0'`.
- **`packages/react/tests/index.test.ts`**:
  - Assert `VERSION` is `'0.2.0'`.
- **`packages/vue/tests/index.test.ts`**:
  - Assert `VERSION` is `'0.2.0'`.
- **`packages/svelte/tests/index.test.ts`**:
  - Assert `VERSION` is `'0.2.0'`.

## 3. Verification & Deployment
- Full monorepo validation (`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`).
- Ensure `test:visual` is unaffected since the fixture excludes header chrome.
- Merging to `main` will automatically trigger `.github/workflows/deploy-pages.yml` to deploy `v0.2.0` to GitHub Pages.
