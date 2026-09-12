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
