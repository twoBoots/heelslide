import type { Page, Locator } from '@playwright/test';

export interface FixtureOptions {
  state?: 'idle' | 'active' | 'unlocked' | 'disabled';
  heels?: 1 | 2 | 3 | 4;
  theme?: 'default' | 'custom' | 'dark';
  seed?: number;
  tolerance?: number;
  width?: number;
  height?: number;
}

/**
 * Builds the URL query path for the visual test fixture.
 */
export function buildFixtureUrl(options: FixtureOptions = {}): string {
  const params = new URLSearchParams();
  params.set('fixture', 'visual');

  if (options.state) {
    params.set('state', options.state);
  }
  if (options.heels !== undefined) {
    params.set('heels', options.heels.toString());
  }
  if (options.theme) {
    params.set('theme', options.theme);
  }
  if (options.seed !== undefined) {
    params.set('seed', options.seed.toString());
  }
  if (options.tolerance !== undefined) {
    params.set('tolerance', options.tolerance.toString());
  }
  if (options.width !== undefined) {
    params.set('width', options.width.toString());
  }
  if (options.height !== undefined) {
    params.set('height', options.height.toString());
  }

  return `/?${params.toString()}`;
}

/**
 * Navigates to the deterministic visual test fixture and awaits the rendering stage.
 */
export async function openVisualFixture(
  page: Page,
  options: FixtureOptions = {}
): Promise<Locator> {
  const url = buildFixtureUrl(options);
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const stage = page.locator('[data-testid="visual-fixture-stage"]');
  await stage.waitFor({ state: 'visible' });

  return stage;
}
