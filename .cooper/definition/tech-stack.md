# Heelslide Tech Stack

## Architecture: Multi-Package Monorepo (`npm` workspaces)
- **`packages/core`**: Framework-agnostic TypeScript core engine:
  - Procedural 2D path and heel (90-degree turn) generator
  - Touch/pointer gesture state machine & tolerance tracking
  - Geometric collision, angle, and trajectory verification
  - Zero external runtime dependencies
- **`packages/react`**: React component wrapper (`<Heelslide />`) supporting React 18/19
- **`packages/vue`**: Vue 3 component wrapper (`<Heelslide />`) using Composition API
- **`packages/svelte`**: Svelte 5 component wrapper (`<Heelslide />`) and `createHeelslide` rune composable
- **`apps/docs`**: Documentation site, interactive live demo, and CSS variable / track configurator playground built with Vite and deployed to GitHub Pages

## Languages & Runtimes
- **Runtime**: Node.js v24 in CI; packages declare `engines: >=20.0.0`
- **Language**: TypeScript v5.8+ (strict mode enabled across all packages)
- **Package Manager**: `npm` (npm workspaces)

## Build & Tooling
- **Bundler**: **Vite** (library mode emitting ESM, CJS, and `.d.ts` declaration maps)
- **Linting**: **Oxc** (`oxlint`), configured in `.oxlintrc.json` with the `typescript`, `react`,
  `unicorn` and `oxc` plugins. `typescript/no-explicit-any` and `react-hooks/rules-of-hooks` are
  enforced on package sources so the styleguides' prohibitions are checked mechanically rather
  than by review; test files relax the `any` rule for partial mocks.
- **Styling Architecture**: Vanilla CSS using namespaced CSS custom properties (`--heelslide-*`) with zero CSS-in-JS runtime overhead

## Testing & Quality Assurance
- **Unit & Component Testing**: **Vitest** with DOM simulation (`happy-dom`/`jsdom`),
  `@vue/test-utils` for Vue, and `react-dom/client` with `act` for React and Svelte
  (no `@testing-library` package is installed)
- **Visual Regression Testing**: **Playwright** (screenshot and visual regression testing across simulated mobile viewports and browsers)
- **Coverage Mandate**: Strict **>80% line, branch, and function coverage** enforced across all
  modules (per Cooper SDD standard). Thresholds apply **per file** as well as in aggregate
  (`coverage.thresholds.perFile`), so a well-covered majority cannot mask a weak module.

## CI/CD, Deployment & GitHub Governance
- **Continuous Integration (`ci.yml`)**: Triggered exclusively on open Pull Requests (targeting `main`), and invoked as a mandatory gate for release workflow runs on `main`:
  - Lint and format verification via `oxlint`
  - Strict type checking via `tsc -b`
  - Vitest unit test suite with >80% per-file coverage gate
  - Playwright visual regression tests (Chromium, WebKit mobile, Firefox)

  Every gate invokes its script directly. A gate MUST NOT be written so that a missing or
  renamed script degrades into a passing skip.
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
