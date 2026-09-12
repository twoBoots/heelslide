# Spec Delta: CI Pipeline (`ci-pipeline`)

## Modified Requirements

### Requirement: Quality Gates

- ### Requirement: Quality Gates

+ ### Requirement: Quality Gates
+ Every mandatory gate MUST fail the workflow when its underlying command fails, and MUST fail
+ the workflow when its underlying command is absent. A gate MUST NOT degrade into a passing
+ skip, because a renamed or deleted script would then silently disable it.
+
+ - **GIVEN** a workflow run in which a required npm script is missing or renamed
+ - **WHEN** the corresponding gate step executes
+ - **THEN** the step MUST fail rather than report success.
+
+ - **GIVEN** the formatting verification step
+ - **WHEN** formatting violations are present
+ - **THEN** the step MUST fail rather than be suppressed.

## Added Requirements

+ ### Requirement: Per-File Coverage Enforcement
+ Coverage thresholds MUST apply per file in addition to the global aggregate, so that a
+ well-covered majority cannot mask a module with near-zero branch coverage.
+
+ - **GIVEN** a source module whose branch coverage falls below the configured threshold
+ - **WHEN** the coverage gate runs
+ - **THEN** the run MUST fail even if aggregate coverage exceeds the threshold.

+ ### Requirement: Styleguide Rule Enforcement in Lint
+ The lint configuration MUST enforce the prohibitions the code styleguides state, rather than
+ leaving them to review.
+
+ - **GIVEN** source code introducing an explicit `any` in a package source file
+ - **WHEN** `oxlint` runs
+ - **THEN** it MUST report a violation.

+ ### Requirement: Workflow Output Handling
+ Workflow steps MUST NOT interpolate step outputs directly into shell command text; outputs
+ MUST be passed through the environment.
+
+ - **GIVEN** a workflow step consuming a prior step's output
+ - **WHEN** the step runs a shell command
+ - **THEN** the value MUST be referenced via an `env:` binding rather than `${{ }}`
+   interpolation inside `run:`.
