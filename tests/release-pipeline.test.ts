import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';

const rootDir = path.resolve(__dirname, '..');

describe('Release Pipeline Configuration', () => {
  describe('.changeset/config.json', () => {
    const changesetConfigPath = path.join(rootDir, '.changeset', 'config.json');

    it('should exist and be valid JSON', () => {
      expect(fs.existsSync(changesetConfigPath)).toBe(true);
      const content = fs.readFileSync(changesetConfigPath, 'utf8');
      const json = JSON.parse(content);
      expect(json).toBeDefined();
    });

    it('should enforce fixed/synchronized versioning across all public packages', () => {
      const content = fs.readFileSync(changesetConfigPath, 'utf8');
      const json = JSON.parse(content);

      expect(json.fixed).toBeDefined();
      expect(Array.isArray(json.fixed)).toBe(true);

      const fixedPackages = json.fixed.flat();
      expect(fixedPackages).toContain('@heelslide/core');
      expect(fixedPackages).toContain('@heelslide/react');
      expect(fixedPackages).toContain('@heelslide/svelte');
      expect(fixedPackages).toContain('@heelslide/vue');
    });

    it('should ignore private applications from npm publication', () => {
      const content = fs.readFileSync(changesetConfigPath, 'utf8');
      const json = JSON.parse(content);

      expect(json.ignore).toBeDefined();
      expect(json.ignore).toContain('@heelslide/docs');
    });

    it('should configure public access and main base branch', () => {
      const content = fs.readFileSync(changesetConfigPath, 'utf8');
      const json = JSON.parse(content);

      expect(json.access).toBe('public');
      expect(json.baseBranch).toBe('main');
    });
  });

  describe('Public Package Manifests', () => {
    const publicPackages = [
      'packages/core',
      'packages/react',
      'packages/svelte',
      'packages/vue',
    ];

    it.each(publicPackages)('should configure %s with public access and dist files', (pkgPath) => {
      const pkgJsonPath = path.join(rootDir, pkgPath, 'package.json');
      expect(fs.existsSync(pkgJsonPath)).toBe(true);

      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

      expect(pkgJson.publishConfig).toBeDefined();
      expect(pkgJson.publishConfig.access).toBe('public');
      expect(pkgJson.files).toBeDefined();
      expect(pkgJson.files).toContain('dist');
    });

    // Tests sit beside the modules they cover, and react/svelte both publish `src` (for
    // ./style.css and the `svelte` export condition). Without negation globs in `files`, that
    // combination ships every colocated test to npm, dragging a `vitest` import into published
    // source that consumers do not have installed. Asserting on the manifest would only restate
    // the fix; packing is what sees the bytes npm actually sends.
    it.each(publicPackages)('should not publish test files from %s', (pkgPath) => {
      const pkgJson = JSON.parse(
        fs.readFileSync(path.join(rootDir, pkgPath, 'package.json'), 'utf8')
      );

      const output = execFileSync(
        'npm',
        ['pack', '--dry-run', '--json', '--workspace', pkgJson.name],
        { cwd: rootDir, encoding: 'utf8' }
      );

      const packed = (JSON.parse(output)[0].files as Array<{ path: string }>).map((f) => f.path);

      expect(packed.length).toBeGreaterThan(0);
      expect(packed.filter((f) => /\.(test|spec)\./.test(f))).toEqual([]);
    });
  });

  describe('Repository Hygiene', () => {
    // A `node_modules` symlink (how a Troop worktree is pointed at the root install) is a file
    // to git, so a trailing-slash ignore rule misses it and `git add -A` commits it. On CI the
    // release job's `git reset --hard` then restores the dangling link over the real install and
    // every binary disappears: `sh: 1: changeset: not found`, exit 127.
    it('should not track any node_modules path', () => {
      const tracked = execFileSync('git', ['ls-files', '-z', '--', 'node_modules', '*/node_modules'], {
        cwd: rootDir,
        encoding: 'utf8'
      })
        .split('\0')
        .filter(Boolean);

      expect(tracked).toEqual([]);
    });

    it('should ignore a node_modules symlink as well as a directory', () => {
      const gitignore = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf8');
      const rules = gitignore.split('\n').map((line) => line.trim());

      // The bare form is what catches the symlink; the trailing-slash form alone does not.
      expect(rules).toContain('node_modules');
    });
  });

  describe('Internal Dependency Ranges', () => {
    const adapters = ['packages/react', 'packages/svelte', 'packages/vue'];
    const coreVersion = JSON.parse(
      fs.readFileSync(path.join(rootDir, 'packages/core/package.json'), 'utf8')
    ).version as string;

    // A wildcard publishes a dependency on *any* core, which defeats the `fixed` versioning
    // policy: a consumer installing an adapter could resolve an incompatible core.
    it.each(adapters)('should pin %s to an exact @heelslide/core version', (pkgPath) => {
      const pkgJson = JSON.parse(
        fs.readFileSync(path.join(rootDir, pkgPath, 'package.json'), 'utf8')
      );
      const range = pkgJson.dependencies?.['@heelslide/core'];

      expect(range).toBeDefined();
      expect(range).not.toBe('*');
      expect(range).toBe(coreVersion);
    });
  });

  describe('Root Workspace Manifest', () => {
    const rootPkgJsonPath = path.join(rootDir, 'package.json');

    it('should define changeset lifecycle scripts', () => {
      const pkgJson = JSON.parse(fs.readFileSync(rootPkgJsonPath, 'utf8'));

      expect(pkgJson.scripts).toBeDefined();
      expect(pkgJson.scripts.changeset).toBe('changeset');
      expect(pkgJson.scripts['version-packages']).toMatch(/^changeset version\b/);
      expect(pkgJson.scripts.release).toBe('changeset publish');
    });

    // `changeset version` rewrites manifests but not the VERSION constants the barrels export,
    // so versioning must propagate them in the same step or every release ships stale exports
    // and fails the per-package version assertions.
    it('should propagate VERSION exports as part of versioning', () => {
      const pkgJson = JSON.parse(fs.readFileSync(rootPkgJsonPath, 'utf8'));

      expect(pkgJson.scripts['version-packages']).toContain('sync-version-exports');
      expect(fs.existsSync(path.join(rootDir, 'scripts/sync-version-exports.mjs'))).toBe(true);
    });

    it('should include @changesets/cli devDependency', () => {
      const pkgJson = JSON.parse(fs.readFileSync(rootPkgJsonPath, 'utf8'));

      expect(pkgJson.devDependencies).toBeDefined();
      expect(pkgJson.devDependencies['@changesets/cli']).toBeDefined();
    });
  });
});
