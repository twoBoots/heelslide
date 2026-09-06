# Technical Design: Playwright Visual Regression Testing Suite

## 1. Architecture Overview
The visual regression testing infrastructure consists of three primary layers:
1. **Deterministic Test Fixtures**: Embedded harness inside `apps/docs` (exposed via dedicated route `/fixtures/visual` or query parameter `?fixture=visual`) that renders `<Heelslide />` instances with fixed seeds, suppressed animations, and fixed layouts.
2. **Playwright Test Runner**: Test specs executing against the Vite preview or dev server, controlling viewport dimensions, triggering interaction states, and capturing element-level or page-level snapshots.
3. **CI Pipeline Integration**: Automated execution step in `.github/workflows/ci.yml` with Playwright browser installation, snapshot diff comparison, and test artifact upload upon failure.

```
heelslide/
├── apps/docs/
│   └── src/
│       ├── fixtures/
│       │   └── VisualFixture.tsx       # Deterministic visual testing view
│       └── App.tsx                     # Conditional fixture route/view
├── tests/visual/
│   ├── specs/
│   │   ├── states.spec.ts              # Idle, active, unlocked, disabled states
│   │   ├── heels.spec.ts               # 1-heel, 2-heel, 4-heel path geometry
│   │   └── theming.spec.ts             # CSS custom property overrides
│   ├── helpers/
│   │   └── visual-utils.ts             # Common navigation and capture helpers
│   └── snapshots/                      # Reference baseline image snapshots
└── playwright.config.ts                # Playwright configuration
```

## 2. Test Harness Strategy
To eliminate flakiness and visual non-determinism, tests must execute against a controlled environment:
- **Seed Pinning**: All procedural tracks rendered for snapshots use a constant seed (e.g. `seed: 4242`) ensuring identical coordinate calculations and heel placements across runs.
- **Animation & Transition Freezing**: CSS transitions, cursor blinking, and SVG animations are frozen via CSS override (`* { animation-duration: 0s !important; transition-duration: 0s !important; }`).
- **Font Rendering Stabilization**: System sans-serif or embedded web font with standard font smoothing (`-webkit-font-smoothing: antialiased`).
- **Fixture Modes**:
  - `state=idle`: Default un-interacted state.
  - `state=active`: Handle dragged to 50% along the track path.
  - `state=unlocked`: Completed gesture in unlocked visual state.
  - `state=disabled`: `disabled={true}` visual gate with dimmed colors and inactive handle.
  - `theme=custom`: CSS variables configured with explicit hex values for track, handle, active segment, and heel indicators.

## 3. Snapshot Management
- **Snapshot Storage**: Baselines are committed in `tests/visual/snapshots/`.
- **Naming Pattern**: `{test-name}-{browser}-{viewport}.png` (e.g., `heelslide-idle-2heels-chromium-desktop.png`).
- **Tolerance Thresholds**:
  - `maxDiffPixelRatio`: `0.01` (1% pixel variance ceiling for minor sub-pixel rendering differences).
  - `threshold`: `0.05` per-pixel color delta.
- **Update Workflow**:
  - Local script `npm run test:visual:update` to intentionally regenerate and review baseline screenshots when styling changes are accepted.

## 4. Playwright Configuration (`playwright.config.ts`)
- **Web Server**: Playwright launches the Vite dev server or builds and previews `apps/docs`:
  ```typescript
  webServer: {
    command: 'npm run docs:dev -- --port 4173',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  }
  ```
- **Projects Matrix**:
  - `chromium-desktop`: Viewport 1280x720, Chromium engine.
  - `webkit-mobile`: Viewport 390x844 (emulating iPhone 14 / Mobile Safari), touch enabled.
  - `firefox-desktop`: Viewport 1280x720, Firefox Gecko engine.

## 5. CI Workflow Integration (`.github/workflows/ci.yml`)
- `.github/workflows/ci.yml` already contains a conditional visual regression step:
  ```yaml
  - name: Visual Regression Tests (Playwright)
    if: steps.check-pkg.outputs.has_pkg == 'true'
    run: |
      if npm run | grep -q 'test:visual'; then
        npx playwright install --with-deps chromium webkit firefox
        npm run test:visual
      else
        echo "No test:visual script found in package.json; skipping visual regression tests."
      fi
  ```
- Artifact reporting enhancement: Add an upload step for `playwright-report/` and test diff artifacts when visual tests fail:
  ```yaml
  - name: Upload Playwright Report
    if: failure()
    uses: actions/upload-artifact@v4
    with:
      name: playwright-report
      path: playwright-report/
      retention-days: 14
  ```

## 6. Scripts Integration (`package.json`)
Root `package.json` script additions:
```json
"scripts": {
  "test:visual": "playwright test",
  "test:visual:update": "playwright test --update-snapshots",
  "test:visual:report": "playwright show-report"
}
```
