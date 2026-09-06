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
