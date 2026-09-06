import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

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
  });

  describe('Root Workspace Manifest', () => {
    const rootPkgJsonPath = path.join(rootDir, 'package.json');

    it('should define changeset lifecycle scripts', () => {
      const pkgJson = JSON.parse(fs.readFileSync(rootPkgJsonPath, 'utf8'));

      expect(pkgJson.scripts).toBeDefined();
      expect(pkgJson.scripts.changeset).toBe('changeset');
      expect(pkgJson.scripts['version-packages']).toBe('changeset version');
      expect(pkgJson.scripts.release).toBe('changeset publish');
    });

    it('should include @changesets/cli devDependency', () => {
      const pkgJson = JSON.parse(fs.readFileSync(rootPkgJsonPath, 'utf8'));

      expect(pkgJson.devDependencies).toBeDefined();
      expect(pkgJson.devDependencies['@changesets/cli']).toBeDefined();
    });
  });

  describe('GitHub Actions Release Workflow', () => {
    const releaseWorkflowPath = path.join(rootDir, '.github', 'workflows', 'release.yml');

    it('should exist and invoke npm run release or changeset publish', () => {
      expect(fs.existsSync(releaseWorkflowPath)).toBe(true);
      const content = fs.readFileSync(releaseWorkflowPath, 'utf8');

      expect(content).toMatch(/npm run release|changeset publish/);
      expect(content).toMatch(/NODE_AUTH_TOKEN/);
      expect(content).toMatch(/GITHUB_TOKEN/);
    });
  });
});
