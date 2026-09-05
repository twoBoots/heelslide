# Heelslide Tech Stack

## Architecture: Multi-Package Monorepo (`npm` workspaces)
- **`packages/core`**: Framework-agnostic TypeScript core engine:
  - Procedural 2D path and heel (90-degree turn) generator
  - Touch/pointer gesture state machine & tolerance tracking
  - Geometric collision, angle, and trajectory verification
  - Zero external runtime dependencies
- **`packages/react`**: React component wrapper (`<Heelslide />`) supporting React 18/19
- **`packages/vue`**: Vue 3 component wrapper (`<Heelslide />`) using Composition API

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
