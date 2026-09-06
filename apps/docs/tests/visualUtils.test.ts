import { describe, expect, it } from 'vitest';
import { buildFixtureUrl } from '../../../tests/visual/helpers/visual-utils.js';

describe('buildFixtureUrl helper', () => {
  it('builds default fixture URL', () => {
    const url = buildFixtureUrl();
    expect(url).toBe('/?fixture=visual');
  });

  it('builds fixture URL with state parameter', () => {
    const url = buildFixtureUrl({ state: 'active' });
    expect(url).toBe('/?fixture=visual&state=active');
  });

  it('builds fixture URL with all options', () => {
    const url = buildFixtureUrl({
      state: 'disabled',
      heels: 4,
      theme: 'custom',
      seed: 1234,
      tolerance: 30,
      width: 400,
      height: 200
    });
    expect(url).toContain('fixture=visual');
    expect(url).toContain('state=disabled');
    expect(url).toContain('heels=4');
    expect(url).toContain('theme=custom');
    expect(url).toContain('seed=1234');
    expect(url).toContain('tolerance=30');
    expect(url).toContain('width=400');
    expect(url).toContain('height=200');
  });
});
