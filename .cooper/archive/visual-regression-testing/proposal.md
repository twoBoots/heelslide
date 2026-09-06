# Proposal: Playwright Visual Regression Testing Suite

## 1. Problem Statement
Heelslide is an intentional-gesture security gate UI component built around procedural rectilinear 2D tracks and 90-degree directional turns ("heels"). The component relies heavily on SVG rendering, dynamic handle positioning, responsive sizing, and customizable CSS custom properties (`--heelslide-*`).

While Vitest component and unit tests validate the gesture math, event handlers, and state machine transitions, they run in headless DOM environments (`happy-dom`) that do not execute layout calculations or render real pixels. Consequently:
1. **Visual Regressions**: Subtle CSS changes, SVG stroke scaling issues, or border-radius adjustments can break the visual alignment between the rectilinear track, heel turn vertices, and the sliding handle without failing unit tests.
2. **Cross-Browser Inconsistencies**: Rendering engines (Blink/Chromium, WebKit, Gecko/Firefox) handle SVG sub-pixel anti-aliasing, transform origins, and pointer styles with slight differences, especially across desktop and simulated mobile viewports.
3. **Theming & CSS Custom Property Degradation**: Modifications to default stylesheets or theme variable mappings may inadvertently break high-contrast modes, custom theme overrides, or disabled state indicators.
4. **Interactive State Visuals**: Visual states—including idle, active dragging, tolerance deviation feedback, unlocked completion, and disabled states—require pixel-accurate verification to guarantee consistent user experience and security gate feedback.

## 2. Intent & Goals
- Scaffold an end-to-end visual regression testing suite using **Playwright**.
- Create a deterministic visual test fixture harness in `apps/docs` (rendering static, reproducible component states with frozen seeds and disabled animations).
- Establish baseline visual snapshots across desktop and mobile viewport configurations (Chromium, Firefox, and WebKit/Mobile Safari emulation).
- Verify rendering fidelity across:
  - Different heel configurations (1, 2, 3, and 4 heels).
  - Component lifecycle states: `idle`, `active` (dragging along track), `unlocked`, and `disabled`.
  - CSS custom properties (`--heelslide-track-bg`, `--heelslide-track-active`, `--heelslide-handle-color`, `--heelslide-heel-color`).
- Integrate visual regression testing into npm scripts (`npm run test:visual` and `npm run test:visual:update`) and verify compatibility with `.github/workflows/ci.yml`.

## 3. Scope Boundaries
- **In-Scope**:
  - Playwright test configuration (`playwright.config.ts`) configured for local and CI execution.
  - Dedicated visual fixture harness within `apps/docs` (accessible via dedicated route or query param) ensuring fixed random seeds, zero animation drift, and fixed component dimensions.
  - Test specs verifying:
    - Default 2-heel component across standard states (`idle`, `active`, `unlocked`, `disabled`).
    - Heel count variations (1-heel minimum to 4-heel maximum).
    - Custom theme and CSS custom property overrides.
  - Baseline snapshot generation and pixel-diff tolerance tuning.
  - CI execution step integration in `.github/workflows/ci.yml` with failure artifact reporting.
- **Out-of-Scope**:
  - Vitest unit/component test replacement (Vitest remains the fast unit test runner).
  - External cloud device farms (BrowserStack/SauceLabs); tests run directly in Playwright headless engines.

## 4. Test Matrix

| Dimension | Scope / Configurations |
| :--- | :--- |
| **Browsers** | Chromium (Desktop), WebKit / Mobile Safari (Mobile emulation), Firefox (Desktop) |
| **Viewports** | Desktop (1280x720), Mobile Portrait (390x844 - iPhone 14 / Pixel 7 emulation) |
| **Heel Counts** | 1 heel, 2 heels (default), 4 heels |
| **Interactive States** | Idle, Active/Dragging (in-progress), Unlocked, Disabled |
| **Styling & Theming** | Default theme, Custom CSS variables (`--heelslide-*`), Dark/High-Contrast palette |
| **Color Schemes** | Light mode, Dark mode |
