# Spec Delta: Release Pipeline (`release-pipeline`)

> Note: this capability's living specification was never promoted from the
> `automated-release-pipeline` track delta despite PR #11 merging. This delta is additive on
> top of that promotion, which is performed as part of this track.

## Added Requirements

+ ### Requirement: Version Export Synchronisation
+ Each published package's exported `VERSION` constant MUST equal the `version` field of its
+ own `package.json`. The manifest is the single source of truth; verification MUST compare
+ the export against the manifest rather than against a duplicated literal, so that a manifest
+ bump which leaves the export behind fails the suite.
+
+ - **GIVEN** any public package
+ - **WHEN** its test suite runs
+ - **THEN** the assertion MUST compare the exported `VERSION` to the `version` read from that
+   package's `package.json`.
+
+ - **GIVEN** a package whose manifest version is bumped without updating its `VERSION` export
+ - **WHEN** the test suite runs
+ - **THEN** the suite MUST fail.

+ ### Requirement: Pinned Internal Dependency Ranges
+ Public adapter packages MUST declare an exact version dependency on `@heelslide/core`, so
+ that the fixed versioning policy survives publication and a consumer cannot resolve an
+ incompatible core.
+
+ - **GIVEN** any adapter package manifest
+ - **WHEN** inspected for publication readiness
+ - **THEN** its `@heelslide/core` dependency MUST be an exact version, and MUST NOT be a
+   wildcard range.
