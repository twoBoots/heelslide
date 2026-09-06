# Proposal: Automated SemVer Release Pipeline & Package Publishing

## 1. Context & Problem Statement
Currently, merged Pull Requests to `main` trigger the GitHub Actions release workflow ([`.github/workflows/release.yml`](../../../../.github/workflows/release.yml)), but no GitHub Releases, Git tags, or npm packages are published.

Inspection of the release workflow execution revealed that the release step executes:
```bash
if npm run | grep -q 'release'; then
  npm run release
else
  echo "No release script configured in package.json; skipping automated release."
fi
```
Because the root [`package.json`](../../../../package.json) lacks a `"release"` script and release management tooling, the workflow prints the warning and succeeds silently without performing any release actions. Additionally, scoped packages (`@heelslide/*`) lack `publishConfig: { "access": "public" }`, preventing scoped package publishing.

## 2. Proposed Solution
Implement a complete automated SemVer release pipeline leveraging **Changesets** (`@changesets/cli`):

1. **Changesets Scaffolding**:
   - Install `@changesets/cli` as a root devDependency.
   - Configure `.changeset/config.json` with **synchronized / fixed versioning** for all public `@heelslide/*` packages (`@heelslide/core`, `@heelslide/react`, `@heelslide/svelte`, `@heelslide/vue`), while ignoring private application workspaces (`apps/docs`).
   - Configure changelog generation and Git commit conventions.

2. **Root Workspace Release Scripts**:
   - Add `"changeset": "changeset"`
   - Add `"version-packages": "changeset version"`
   - Add `"release": "changeset publish"`

3. **Package Configuration**:
   - Ensure all public packages (`packages/*`) specify `"publishConfig": { "access": "public" }` in their `package.json` for npm registry distribution.

4. **GitHub Actions Workflow Modernization**:
   - Update `.github/workflows/release.yml` to utilize Changesets automated release execution or action:
     - On merge to `main`, run CI gates.
     - Build all packages (`npm run build`).
     - Execute versioning & publish to npm using `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`.
     - Generate Git tags and GitHub Releases with release notes via `GITHUB_TOKEN`.
     - Pack and attach `.tgz` archive assets to GitHub Releases for direct URL installs.

5. **Initial Changeset**:
   - Seed an initial changeset documenting existing foundation packages (`@heelslide/core`, `@heelslide/react`, `@heelslide/vue`, `@heelslide/svelte`) to trigger the initial `0.1.0` release.

## 3. Scope Boundaries
- **In Scope**:
  - Changeset CLI setup and fixed monorepo versioning configuration.
  - Release scripts in root `package.json`.
  - `publishConfig` in public packages.
  - Workflow update in `.github/workflows/release.yml` with npm publishing and GitHub Releases.
  - Initial changeset generation.
  - Unit/workflow verification tests.
- **Out of Scope**:
  - Independent package versioning (user explicitly approved synchronized versioning).
  - Private registry / Artifactory setup.
