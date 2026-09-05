# Heelslide Tech Stack

## Architecture: Multi-Package Monorepo (`npm` workspaces)
- **`packages/core`**: Framework-agnostic TypeScript core engine:
  - Procedural 2D path and heel (90-degree turn) generator
  - Touch/pointer gesture state machine & tolerance tracking
  - Geometric collision, angle, and trajectory verification
  - Zero external runtime dependencies
- **`packages/react`**: React component wrapper (`<Heelslide />`) supporting React 18/19
- **`packages/vue`**: Vue 3 component wrapper (`<Heelslide />`) using Composition API
- **`apps/docs`**: Documentation site, interactive live demo, and CSS variable / track configurator playground built with Vite and deployed to GitHub Pages

## Languages & Runtimes
- **Runtime**: Node.js (v24.x LTS)
- **Language**: TypeScript v7 (strict mode enabled across all packages)
- **Package Manager**: `npm` (npm workspaces)

## Build & Tooling
- **Bundler**: **Vite** (library mode emitting ESM, CJS, and `.d.ts` declaration maps)
- **Formatting & Linting**: **Oxc** (`oxlint` for high-performance linting, `oxc` formatter)
- **Styling Architecture**: Vanilla CSS using namespaced CSS custom properties (`--heelslide-*`) with zero CSS-in-JS runtime overhead

## Testing & Quality Assurance
- **Unit & Component Testing**: **Vitest** with DOM simulation (`happy-dom`/`jsdom`), `@testing-library/react`, and `@vue/test-utils`
- **Visual Regression Testing**: **Playwright** (screenshot and visual regression testing across simulated mobile viewports and browsers)
- **Coverage Mandate**: Strict **>80% line, branch, and function coverage** enforced across all modules (per Cooper SDD standard)

## CI/CD, Deployment & GitHub Governance
- **Continuous Integration (`ci.yml`)**: Triggered exclusively on open Pull Requests (targeting `main`), and invoked as a mandatory gate for release workflow runs on `main`:
  - Lint and format verification via `oxlint` and `oxc`
  - Strict type checking via `tsc --noEmit`
  - Vitest unit test suite with >80% coverage gate
  - Playwright visual regression tests
- **Branch Protection (`main`)**:
  - Direct pushes disabled; all changes must arrive via Pull Request
  - Required passing status checks for all CI gates before merge
  - Enforced linear history (Squash and Merge or Rebase Merge)
- **SemVer Automated Release (`release.yml`)**:
  - Automated version calculation and release generation on merge to `main` (Conventional Commits / Changesets)
  - Automatic GitHub Releases and npm package publication
- **Live Documentation & Demo (`deploy-pages.yml`)**:
  - Automated build of `apps/docs` on merge to `main`
  - Continuous deployment to **GitHub Pages** for live interactive demo, documentation, and real-time configuration
