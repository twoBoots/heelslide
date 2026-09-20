# Proposal: Mobile Responsiveness & Overflow Prevention for Documentation Site

## Context & Problem
The GitHub Pages live documentation site (`apps/docs`) is desktop-optimized and exhibits severe horizontal overflow, clipping, and usability degradation when viewed on mobile and tablet devices:
1. **Unbounded Navigation Tabs**: The framework selection tabs (`.tabs-nav` in `FrameworkTabs.tsx`) and documentation reference tabs (`DocsReference.tsx`) are non-wrapping flex rows exceeding 550px in width, forcing the entire document window to horizontally scroll on screens under 600px.
2. **Cumulative Desktop Padding**: Nested desktop padding (`.docs-container` at 48px + `.card` at 48px + `.preview-stage` at 64px = 160px horizontal padding) consumes over 45% of a 360px mobile viewport, heavily compressing content.
3. **Clipped Gate Simulator**: The live `<Heelslide />` security gate has a configurable width (default 320px, adjustable up to 480px) inside an `overflow: hidden` container with only ~215px available width on smaller phones, clipping the slider handle and path vertices.
4. **Squeezed Statistics Grid**: `.stats-grid` enforces a 3-column layout on all viewports, causing metrics, labels, and state badges to collide or overflow on narrow screens.
5. **Rigid Control Layouts**: Dual-column color picker grids (`1fr 1fr`) and unwrapped audio/haptics option rows overflow narrow mobile screens.

## User Value & Goals
- **Seamless Mobile Experience**: Developers inspecting Heelslide on mobile phones or tablets can interact smoothly with the live gate simulator, configure parameters, view framework code, and read API specifications without horizontal viewport blowout.
- **Zero Tech-Stack Churn**: Solve responsiveness cleanly within the existing modern CSS and React monorepo architecture without introducing external CSS-in-JS or utility framework dependencies.
- **Preserve Desktop Ergonomics**: Maintain current high-density desktop layout while gracefully adapting layout grids, paddings, and typography across tablet (`<=768px`), mobile (`<=640px`), and compact mobile (`<=480px`) breakpoints.

## Scope Boundaries
- **In Scope**:
  - `apps/docs/src/styles.css`: Viewport safety guards, responsive media queries, fluid typography, touch-scrollable tabs, adaptive paddings, responsive grids.
  - `apps/docs/src/components/Playground.tsx`: Responsive preview stage wrapper ensuring wide slider configurations remain inspectable and operable without page clipping.
  - `apps/docs/src/components/ConfigPanel.tsx`: Responsive button/checkbox wrapping and control layout refinements.
  - `apps/docs/src/components/DocsReference.tsx` & `FrameworkTabs.tsx`: Touch-scrollable tab headers and readable scrollable reference tables.
  - Automated tests in `apps/docs/src/` verifying responsive container classes, tab scrollability, and mobile viewport styling behavior.
- **Out of Scope**:
  - Modifications to `@heelslide/core`, `@heelslide/react`, `@heelslide/vue`, or `@heelslide/svelte` package source code or exports.
  - Changes to visual regression fixture routes (`?fixture=visual`).
