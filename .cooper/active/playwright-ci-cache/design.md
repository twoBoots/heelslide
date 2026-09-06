# Technical Design: Playwright CI Browser Caching & Job Parallelization

## Track ID
`playwright-ci-cache`

## Architecture Overview

The `.github/workflows/ci.yml` pipeline will be restructured from a monolithic serial job into two parallel jobs:

```
                  ┌────────────────────────────────────────┐
                  │          GitHub Actions: PR            │
                  └──────────────────┬─────────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
     ┌───────────────────────┐               ┌───────────────────────┐
     │         Job 1         │               │         Job 2         │
     │ Lint, Typecheck, Test │               │   Visual Regression   │
     └───────────┬───────────┘               └───────────┬───────────┘
                 │                                       │
     • Checkout repo                         • Checkout repo
     • Setup Node (npm cache)                • Setup Node (npm cache)
     • npm ci                                • npm ci
     • Oxc Lint & Format Check               • Resolve Playwright Version
     • TypeScript (tsc -b)                   • actions/cache ms-playwright
     • Build packages/apps                   • playwright install-deps
     • Vitest with Coverage                  • Conditional browser download
                                             • Build packages/apps
                                             • npm run test:visual
                                             • Upload report on failure
```

## Workflow Job Specifications

### 1. `validate` Job
- **Name**: `Lint, Typecheck & Unit Test`
- **Runs-on**: `ubuntu-latest`
- **Steps**:
  1. `actions/checkout@v7`
  2. Check for `package.json`
  3. `actions/setup-node@v7` with `cache: npm`
  4. `npm ci`
  5. `oxlint .` & formatting check
  6. `tsc -b`
  7. `npm run build`
  8. `npm run test:coverage` (Vitest)

### 2. `visual-regression` Job
- **Name**: `Visual Regression (Playwright)`
- **Runs-on**: `ubuntu-latest`
- **Steps**:
  1. `actions/checkout@v7`
  2. Check for `package.json`
  3. `actions/setup-node@v7` with `cache: npm`
  4. `npm ci`
  5. **Get Playwright Version**:
     ```bash
     echo "version=$(npx playwright --version | awk '{print $2}')" >> "$GITHUB_OUTPUT"
     ```
  6. **Cache Playwright Browsers**:
     - Action: `actions/cache@v4`
     - Path: `~/.cache/ms-playwright`
     - Key: `playwright-${{ runner.os }}-${{ steps.playwright-version.outputs.version }}`
  7. **Install Playwright OS Dependencies**:
     ```bash
     npx playwright install-deps chromium webkit firefox
     ```
  8. **Conditional Browser Binary Installation**:
     ```bash
     if [ "${{ steps.playwright-cache.outputs.cache-hit }}" != "true" ]; then
       npx playwright install chromium webkit firefox
     fi
     ```
  9. **Build Workspace Packages & Docs**:
     ```bash
     npm run build
     ```
  10. **Run Visual Regression Specs**:
     ```bash
     npm run test:visual
     ```
  11. **Upload Artifact on Failure**:
     - Action: `actions/upload-artifact@v4`
     - Condition: `if: failure()`
     - Path: `playwright-report/`
     - Retention: `14` days

## Invalidation & Error Handling Strategy
- **Playwright Upgrades**: Keyed by `npx playwright --version`, cache automatically rotates when `@playwright/test` is bumped.
- **Cache Hit vs Miss**: `install-deps` is always executed to ensure required system libraries exist on the runner, while browser binaries (~150MB) are only downloaded if `cache-hit != 'true'`.
- **Zero Drift**: `playwright-report` artifacts remain attached on failure so diff snapshots can be inspected directly in the GitHub Actions summary.
