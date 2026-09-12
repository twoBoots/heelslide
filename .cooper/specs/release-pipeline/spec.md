# Capability Specification: Release Pipeline (`release-pipeline`)

## Capability: Monorepo Changesets Version Management

### Requirement: Synchronized Versioning for Public Packages
The repository MUST manage version calculation across all public framework adapters and the
core engine using Changesets configured for fixed/synchronized versions.

- **GIVEN** one or more public packages (`@heelslide/core`, `@heelslide/react`,
  `@heelslide/svelte`, `@heelslide/vue`) have pending changesets
- **WHEN** the version command (`changeset version`) executes
- **THEN** all four packages MUST be bumped to identical SemVer versions simultaneously, and
  private apps (`apps/docs`) MUST remain unversioned and unpublished.

### Requirement: Package Publishing Manifests
All public packages intended for publication MUST be configured with public access
configuration.

- **GIVEN** packages under `packages/*`
- **WHEN** inspected for publication readiness
- **THEN** each public package manifest MUST specify `"publishConfig": { "access": "public" }`
  and specify entry points (`dist/`).

### Requirement: Pinned Internal Dependency Ranges
Public adapter packages MUST declare an exact version dependency on `@heelslide/core`, so that
the fixed versioning policy survives publication and a consumer cannot resolve an incompatible
core.

- **GIVEN** any adapter package manifest
- **WHEN** inspected for publication readiness
- **THEN** its `@heelslide/core` dependency MUST be an exact version, and MUST NOT be a
  wildcard range.

### Requirement: Version Export Synchronisation
Each published package's exported `VERSION` constant MUST equal the `version` field of its own
`package.json`. The manifest is the single source of truth; verification MUST compare the
export against the manifest rather than against a duplicated literal, so that a manifest bump
which leaves the export behind fails the suite.

- **GIVEN** any public package
- **WHEN** its test suite runs
- **THEN** the assertion MUST compare the exported `VERSION` to the `version` read from that
  package's `package.json`.

- **GIVEN** a package whose manifest version is bumped without updating its `VERSION` export
- **WHEN** the test suite runs
- **THEN** the suite MUST fail.

## Capability: Automated GitHub Actions Release & Registry Publishing

### Requirement: Automated Release Execution on Main
When commits or version PRs merge to `main`, the release workflow MUST build packages, publish
updated packages to the npm registry, and generate corresponding Git tags.

- **GIVEN** a push to `main` with passing CI gates
- **WHEN** the release job executes
- **THEN** it MUST build all packages, publish changed packages to npm using `NODE_AUTH_TOKEN`,
  and push SemVer Git tags for newly published versions.

> **Known unmet requirement.** This requirement is not currently satisfied in production. Every
> push to `main` fails at the publish step with
> `ENEEDAUTH: This command requires you to be logged in to https://registry.npmjs.org/`, and no
> package has ever been published (all four return `E404` from the registry). The cause is a
> missing or invalid `NPM_TOKEN` repository secret, which can only be supplied by a repository
> administrator. The workflow itself is otherwise correct.

### Requirement: GitHub Releases with Changelog & Tarball Assets
The release workflow MUST generate formal GitHub Releases containing changelog notes and
attached `.tgz` package archives for direct consumer installation.

- **GIVEN** newly published package versions on `main`
- **WHEN** release publication succeeds
- **THEN** a GitHub Release MUST be created with changelog notes and attached `.tgz` tarballs
  for each public package.

### Requirement: Root Workspace Release Scripts
The root `package.json` MUST define standard lifecycle scripts for changeset creation,
versioning, and publishing.

- **GIVEN** a developer or CI runner in the root workspace
- **WHEN** invoking `npm run release`, `npm run changeset`, or `npm run version-packages`
- **THEN** the corresponding Changesets CLI command MUST execute without error.
