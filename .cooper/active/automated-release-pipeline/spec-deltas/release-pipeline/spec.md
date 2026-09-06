# Spec Delta: Automated Release Pipeline (`release-pipeline`)

## Added Requirements

+ ### Capability: Monorepo Changesets Version Management
+
+ #### Requirement: Synchronized Versioning for Public Packages
+ The repository MUST manage version calculation across all public framework adapters and the core engine using Changesets configured for fixed/synchronized versions.
+
+ - **GIVEN** one or more public packages (`@heelslide/core`, `@heelslide/react`, `@heelslide/svelte`, `@heelslide/vue`) have pending changesets
+ - **WHEN** the version command (`changeset version`) executes
+ - **THEN** all four packages MUST be bumped to identical SemVer versions simultaneously, and private apps (`apps/docs`) MUST remain unversioned and unpublished.
+
+ #### Requirement: Package Publishing Manifests
+ All public packages intended for publication MUST be configured with public access configuration.
+
+ - **GIVEN** packages under `packages/*`
+ - **WHEN** inspected for publication readiness
+ - **THEN** each public package manifest MUST specify `"publishConfig": { "access": "public" }` and specify entry points (`dist/`).
+
+ ### Capability: Automated GitHub Actions Release & Registry Publishing
+
+ #### Requirement: Automated Release Execution on Main
+ When commits or version PRs merge to `main`, the release workflow MUST build packages, publish updated packages to the npm registry, and generate corresponding Git tags.
+
+ - **GIVEN** a push to `main` with passing CI gates
+ - **WHEN** the release job executes
+ - **THEN** it MUST build all packages, publish changed packages to npm using `NODE_AUTH_TOKEN`, and push SemVer Git tags for newly published versions.
+
+ #### Requirement: GitHub Releases with Changelog & Tarball Assets
+ The release workflow MUST generate formal GitHub Releases containing changelog notes and attached `.tgz` package archives for direct consumer installation.
+
+ - **GIVEN** newly published package versions on `main`
+ - **WHEN** release publication succeeds
+ - **THEN** a GitHub Release MUST be created with changelog notes and attached `.tgz` tarballs for each public package.
+
+ #### Requirement: Root Workspace Release Scripts
+ The root `package.json` MUST define standard lifecycle scripts for changeset creation, versioning, and publishing.
+
+ - **GIVEN** a developer or CI runner in the root workspace
+ - **WHEN** invoking `npm run release`, `npm run changeset`, or `npm run version-packages`
+ - **THEN** the corresponding Changesets CLI command MUST execute without error.
