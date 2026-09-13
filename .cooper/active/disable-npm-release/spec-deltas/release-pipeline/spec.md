# Spec Delta: Release Pipeline (`release-pipeline`)

## Capability: Automated GitHub Actions Release & Registry Publishing

### Requirement: Automated Release Execution on Main
When commits or version PRs merge to `main`, the release workflow MUST build packages and manage version PRs. npm registry publication is temporarily suspended until credentials and permissions are provisioned.

- **GIVEN** a push to `main` with passing CI gates
- **WHEN** the release job executes
-- **THEN** it MUST build all packages, publish changed packages to npm using `NODE_AUTH_TOKEN`,
--   and push SemVer Git tags for newly published versions.
+- **THEN** it MUST build all packages and manage Changesets version pull requests, but MUST NOT
+  attempt to publish to the npm registry while publication is temporarily disabled.
