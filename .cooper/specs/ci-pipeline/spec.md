# Capability Specification: Continuous Integration Pipeline (`ci-pipeline`)

## Capability: Automated Pull Request Validation

### Requirement: Mandatory Pull Request Status Checks
All pull requests targeting `main` MUST execute automated validation gates before changes can be merged.

- **GIVEN** a pull request targeting `main`
- **WHEN** commits are pushed
- **THEN** the CI workflow MUST run automated validation steps verifying code quality.

### Requirement: Dependency Caching
The CI workflow MUST leverage caching to minimize dependency installation overhead.

- **GIVEN** a repository with `package-lock.json`
- **WHEN** the CI environment initializes
- **THEN** package manager download caches MUST be restored based on lockfile hash.

### Requirement: Quality Gates
Every mandatory gate MUST fail the workflow when its underlying command fails, and MUST fail the
workflow when its underlying command is absent. A gate MUST NOT degrade into a passing skip,
because a renamed or deleted script would then silently disable it.

- **GIVEN** a workflow run in which a required npm script is missing or renamed
- **WHEN** the corresponding gate step executes
- **THEN** the step MUST fail rather than report success.

- **GIVEN** the formatting verification step
- **WHEN** formatting violations are present
- **THEN** the step MUST fail rather than be suppressed.

The CI workflow MUST enforce formatting, linting, typechecking, and automated test execution.

- **GIVEN** a pull request execution
- **WHEN** the validation job runs
- **THEN** `oxlint`, `tsc -b`, and `vitest` tests MUST all pass without errors.

## Capability: Playwright Browser Caching & Parallel Visual Testing

### Requirement: Parallel Visual Regression Job Execution
The CI workflow MUST separate visual regression testing from unit testing and linting into dedicated concurrent jobs to optimize CI wall-clock turnaround time.

- **GIVEN** a pull request targeting `main`
- **WHEN** the CI workflow triggers
- **THEN** the `validate` (lint/typecheck/unit tests) and `visual-regression` (Playwright) jobs MUST execute concurrently in parallel.

### Requirement: Playwright Browser Binary Caching
The CI workflow MUST cache Playwright browser binaries in `~/.cache/ms-playwright` across workflow runs, keyed by the runner OS and installed Playwright version.

- **GIVEN** a workflow execution where browser binaries for the active Playwright version were previously cached
- **WHEN** the `visual-regression` job runs
- **THEN** the cached browser binaries MUST be restored from cache, skipping browser binary re-downloads.

### Requirement: Conditional Browser Download on Cache Miss
The visual regression workflow MUST install necessary host system dependencies and only download browser binaries when a cache miss occurs.

- **GIVEN** a cache miss or upgraded Playwright version
- **WHEN** the browser setup step runs
- **THEN** it MUST execute `npx playwright install` for required browsers (`chromium`, `webkit`, `firefox`) and save the updated cache upon job completion.

### Requirement: Per-File Coverage Enforcement
Coverage thresholds MUST apply per file in addition to the global aggregate, so that a
well-covered majority cannot mask a module with near-zero branch coverage.

- **GIVEN** a source module whose branch coverage falls below the configured threshold
- **WHEN** the coverage gate runs
- **THEN** the run MUST fail even if aggregate coverage exceeds the threshold.

### Requirement: Styleguide Rule Enforcement in Lint
The lint configuration MUST enforce the prohibitions the code styleguides state, rather than
leaving them to review.

- **GIVEN** source code introducing an explicit `any` in a package source file
- **WHEN** `oxlint` runs
- **THEN** it MUST report a violation.

### Requirement: Workflow Output Handling
Workflow steps MUST NOT interpolate step outputs directly into shell command text; outputs MUST
be passed through the environment.

- **GIVEN** a workflow step consuming a prior step's output
- **WHEN** the step runs a shell command
- **THEN** the value MUST be referenced via an `env:` binding rather than `${{ }}` interpolation
  inside `run:`.

## Capability: Keyboard Accessibility Verification

### Requirement: Real-Browser Keyboard End-to-End Gate
CI MUST verify keyboard operability in real browsers, not only in simulated DOM.

- **GIVEN** a pull request targeting `main`
- **WHEN** the Playwright job runs
- **THEN** it MUST execute keyboard navigation specs driving real key events across the Chromium, WebKit mobile, and Firefox matrix.
- **GIVEN** the keyboard specs
- **WHEN** they execute
- **THEN** they MUST assert full traversal to unlock by keyboard alone, that a visible focus indicator appears on keyboard focus, that `Escape` releases focus without trapping it, and that `Tab` order reaches the component.
- **GIVEN** the keyboard spec file is renamed, moved, or deleted
- **WHEN** the Playwright gate runs
- **THEN** the gate MUST fail rather than degrade into a passing skip, which requires the step to name the spec explicitly rather than rely on a suite-wide run that would still pass on the remaining specs.

### Requirement: Test Runner Separation
Playwright and Vitest suites MUST remain distinguishable as the test tree grows.

- **GIVEN** Playwright's `testDir` covering directories that also hold Vitest suites
- **WHEN** Playwright resolves its test files
- **THEN** `testMatch` MUST remain restricted to `*.spec.ts`, since Vitest suites use `*.test.ts` and widening the match would hand them to Playwright.

### Requirement: Visual Regression Baseline Stability
Accessibility changes MUST NOT alter rendered output.

- **GIVEN** accessibility changes that add focusability, ARIA attributes and visually hidden nodes
- **WHEN** the Playwright visual regression suite runs
- **THEN** existing baseline snapshots MUST pass unchanged.
- **GIVEN** a baseline snapshot diff arising from such changes
- **WHEN** it is observed
- **THEN** it MUST be treated as a genuine visual regression rather than an expected baseline update.
