#!/usr/bin/env node
/**
 * Propagates each package's `package.json` version into the `VERSION` constant its barrel
 * exports.
 *
 * `changeset version` rewrites manifests but knows nothing about source constants, so without
 * this step every release leaves four `VERSION` exports — and the docs version badge bound to
 * the core one — reporting the previous version. The release-pipeline suite asserts each export
 * equals its own manifest, so the drift fails CI rather than shipping; this script is what keeps
 * that assertion satisfiable without a manual edit per release.
 *
 * The constant is deliberately left as a plain literal rather than derived at build time:
 * `@heelslide/svelte` publishes raw source via its `svelte` export condition, and the test suite
 * imports from `src` through Vitest aliases, so a bundler-only substitution would not reach
 * either consumer.
 *
 * Run automatically by `npm run version-packages`. Safe to run at any time; it is idempotent and
 * exits non-zero only if a package is malformed.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packages = ['core', 'react', 'svelte', 'vue'];

const VERSION_PATTERN = /(export const VERSION = ')([^']*)(';)/;

let changed = 0;
let failed = 0;

for (const name of packages) {
  const manifestPath = resolve(rootDir, 'packages', name, 'package.json');
  const barrelPath = resolve(rootDir, 'packages', name, 'src', 'index.ts');

  let version;
  try {
    version = JSON.parse(readFileSync(manifestPath, 'utf8')).version;
  } catch (error) {
    console.error(`sync-version-exports: cannot read ${manifestPath}: ${error.message}`);
    failed++;
    continue;
  }

  if (typeof version !== 'string' || version.length === 0) {
    console.error(`sync-version-exports: packages/${name}/package.json has no version field`);
    failed++;
    continue;
  }

  let source;
  try {
    source = readFileSync(barrelPath, 'utf8');
  } catch (error) {
    console.error(`sync-version-exports: cannot read ${barrelPath}: ${error.message}`);
    failed++;
    continue;
  }

  const match = source.match(VERSION_PATTERN);
  if (!match) {
    console.error(
      `sync-version-exports: no \`export const VERSION = '...'\` found in packages/${name}/src/index.ts`
    );
    failed++;
    continue;
  }

  if (match[2] === version) {
    continue;
  }

  writeFileSync(barrelPath, source.replace(VERSION_PATTERN, `$1${version}$3`), 'utf8');
  console.log(`sync-version-exports: @heelslide/${name} ${match[2]} -> ${version}`);
  changed++;
}

if (failed > 0) {
  process.exit(1);
}

console.log(
  changed === 0
    ? 'sync-version-exports: all VERSION exports already match their manifests'
    : `sync-version-exports: updated ${changed} VERSION export${changed === 1 ? '' : 's'}`
);
