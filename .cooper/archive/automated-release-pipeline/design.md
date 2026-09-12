# Technical Design: Automated SemVer Release Pipeline & Package Publishing

## 1. System Architecture

The release system transitions from an unconfigured stub to an automated, monorepo-aware pipeline powered by Changesets (`@changesets/cli`) and GitHub Actions.

```
       +-------------------------------------------------------------+
       |                  Pull Request Merged to main                |
       +-------------------------------------------------------------+
                                      |
                                      v
       +-------------------------------------------------------------+
       |              CI Gates Job (.github/workflows/ci.yml)        |
       |  - Lint (oxlint)                                            |
       |  - Typecheck (tsc -b)                                       |
       |  - Vitest Unit Tests (>80% coverage)                        |
       |  - Playwright Visual Regression Tests                       |
       +-------------------------------------------------------------+
                                      | (All Passed)
                                      v
       +-------------------------------------------------------------+
       |             Release Job (.github/workflows/release.yml)     |
       |  1. Checkout with full git history (fetch-depth: 0)         |
       |  2. Setup Node.js 24 with npm registry auth                 |
       |  3. Install dependencies & build packages                   |
       |  4. Changesets Action:                                      |
       |     - Reads pending changesets in .changeset/               |
       |     - Publishes new versions to npm registry                |
       |     - Creates Git tags & GitHub Releases with changelog     |
       |  5. Optional / Fallback Release Asset Packaging:            |
       |     - Packs .tgz archives for each package                  |
       |     - Attaches .tgz archives to GitHub Releases             |
       +-------------------------------------------------------------+
```

## 2. Changesets Configuration (`.changeset/config.json`)

Changesets governs version calculation and changelogs. All framework adapters and the core engine maintain synchronized versioning:

```json
{
  "$schema": "https://unpkg.com/@changesets/config/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [
    [
      "@heelslide/core",
      "@heelslide/react",
      "@heelslide/svelte",
      "@heelslide/vue"
    ]
  ],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": [
    "@heelslide/docs"
  ]
}
```

### Key Decisions
- **`fixed` grouping**: All four public packages share synchronized SemVer versions. Any change triggering a minor or patch bump to one package bumps the entire family, ensuring consumers always have matching versions across `@heelslide/core` and adapters.
- **`ignore`**: The `@heelslide/docs` documentation application is private and excluded from npm publication.
- **`access: "public"`**: Configures scoped packages (`@heelslide/*`) to publish with public visibility on the npm registry.

## 3. Package Manifest Updates (`package.json`)

### Root `package.json`
Add release scripts:
```json
"scripts": {
  "changeset": "changeset",
  "version-packages": "changeset version",
  "release": "changeset publish"
}
```
Add devDependency:
- `@changesets/cli`: `^2.27.1` (or latest stable)

### Public Packages (`packages/{core,react,svelte,vue}/package.json`)
Add `publishConfig`:
```json
"publishConfig": {
  "access": "public"
}
```
Verify `files: ["dist"]` and exports mapping are present in all packages.

## 4. GitHub Actions Workflow Architecture (`release.yml`)

The workflow `.github/workflows/release.yml` will be updated to:
1. Retain the mandatory `ci` job dependency (`needs: ci`).
2. Run on push to `main`.
3. Utilize `changesets/action@v1` or an automated publication step:
   - When changesets are committed on `main`, publish packages to npm using `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` and `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}`.
   - Automatically generate GitHub Releases for published tags with markdown release notes extracted from changelogs.
4. Execute release asset bundling:
   - Run `npm pack --workspaces` to create tarballs:
     - `heelslide-core-<version>.tgz`
     - `heelslide-react-<version>.tgz`
     - `heelslide-svelte-<version>.tgz`
     - `heelslide-vue-<version>.tgz`
   - Upload tarballs to the created GitHub Release using `gh release upload` so users can download or direct-install tarballs straight from GitHub.

## 5. Verification & TDD Strategy

1. **Unit & Configuration Tests (`tests/release-config.test.ts`)**:
   - Verify `.changeset/config.json` exists and parses valid JSON.
   - Assert all public packages are included in the `fixed` group.
   - Assert `@heelslide/docs` is ignored.
   - Assert all public packages have `"publishConfig": { "access": "public" }`.
   - Assert root `package.json` contains `"changeset"`, `"version-packages"`, and `"release"` scripts.
   - Execute `npm pack --dry-run` for all public packages to verify packing manifests and dist files.
2. **Release Workflow Lint & Dry-Run**:
   - Validate `.github/workflows/release.yml` YAML syntax and step structure.
   - Test Changeset status execution (`npx changeset status`).
