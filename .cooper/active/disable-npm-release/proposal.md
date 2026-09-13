# Proposal: Temporarily Disable npm Publishing in Release Workflow

## 1. Context & Problem Statement
Every push to `main` (including merged pull requests) triggers the GitHub Actions Release workflow ([`.github/workflows/release.yml`](../../../../.github/workflows/release.yml)).

When no pending changesets remain on `main`, `changesets/action@v1` queries the npm registry and determines that the monorepo packages (`@heelslide/core`, `@heelslide/react`, `@heelslide/svelte`, `@heelslide/vue`) are not published. It then invokes `publish: npm run release` (`changeset publish`).

Because the repository has no `NPM_TOKEN` configured in repository secrets (`gh secret list` reports none) and npm trusted publishing is not configured on npmjs.com, every push to `main` fails with:
```text
ENEEDAUTH: This command requires you to be logged in to https://registry.npmjs.org/
You need to authorize this machine using `npm adduser`
```

This causes the Release workflow on `main` to fail consistently on every merge.

## 2. Proposed Solution
Temporarily disable npm publishing from the Release workflow while preserving versioning and pull request generation:

1. **Disable `publish` in `.github/workflows/release.yml`**:
   - Comment out or remove the `publish: npm run release` configuration from `changesets/action@v1`.
   - When `publish` is omitted, `changesets/action` continues to create and update the "chore(release): Version Packages" pull request when new changesets are merged, but does not attempt npm publishing when no changesets exist.
   - Leave clear explanatory comments noting that npm publication can be re-enabled once `NPM_TOKEN` credentials and package access on npmjs.com are provisioned.

2. **Automated Verification**:
   - Add a test in `tests/release-pipeline.test.ts` verifying that `.github/workflows/release.yml` does not invoke active npm publishing during this temporary suspension.

## 3. Scope Boundaries
- **In Scope**:
  - Updating `.github/workflows/release.yml` to remove the active `publish` invocation.
  - Updating `tests/release-pipeline.test.ts` to assert that npm publishing is disabled.
  - Adding Cooper spec delta for `release-pipeline`.
- **Out of Scope**:
  - Deleting or modifying package manifests or the `npm run release` script in `package.json` (these remain intact for when publishing is reintroduced).
  - Configuring npm tokens or npmjs.com permissions.
