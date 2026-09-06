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
