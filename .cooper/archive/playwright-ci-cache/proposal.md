# Proposal: Playwright CI Browser Caching & Job Parallelization

## Track ID
`playwright-ci-cache`

## Problem Statement
Currently, each GitHub Actions CI run on open pull requests downloads Playwright browser binaries (Chromium, Firefox, WebKit) and installs OS packages sequentially within the single `validate` job. This introduces ~35–40 seconds of redundant download/installation overhead per CI run, consumes unnecessary bandwidth and runner minutes, and blocks lint, typecheck, and unit test validation from reporting early independent feedback.

## Proposed Solution
1. **Job Parallelization**: Split the CI workflow into two concurrent jobs:
   - `validate`: Focuses on linting (Oxc), strict type checking (`tsc -b`), building packages, and running Vitest unit/component tests with coverage.
   - `visual-regression`: Dedicated job executing Playwright visual regression tests against the deterministic docs fixture.
2. **Browser Binary Caching**: Cache `~/.cache/ms-playwright` using `actions/cache@v4` keyed by runner OS and active Playwright version (`playwright-${{ runner.os }}-${{ steps.playwright-version.outputs.version }}`).
3. **Optimized Installation**:
   - Run `npx playwright install-deps chromium webkit firefox` to ensure host OS system dependencies exist.
   - Conditionally invoke `npx playwright install chromium webkit firefox` only on cache miss (`steps.playwright-cache.outputs.cache-hit != 'true'`).
4. **Artifact Preservation**: Maintain automatic upload of `playwright-report/` via `actions/upload-artifact@v4` on test failure for rapid debugging.

## User Benefit
- **Faster CI Feedback**: Concurrent execution allows lint/unit test results to report in ~30s instead of >1m40s.
- **Reduced Overhead**: Browser caching cuts ~35s of repetitive browser binary re-downloads across workflow runs.
- **Cleaner Diagnostics**: Dedicated PR status checks make it immediately clear whether a failure is lint/type/unit-related or visual-regression-related.

## Scope Boundaries
- In Scope: `.github/workflows/ci.yml` job restructuring, caching action configuration, and CI-pipeline documentation.
- Out of Scope: Altering visual snapshot baselines, changing Playwright config thresholds, or modifying application/library code.
