import { test, expect } from '@playwright/test';
import { openVisualFixture } from '../helpers/visual-utils.js';

test.describe('Core Lifecycle States Visual Regression', () => {
  test('should render deterministic idle state matching baseline snapshot', async ({ page }) => {
    const stage = await openVisualFixture(page, { state: 'idle' });
    await expect(stage).toHaveScreenshot('heelslide-state-idle.png');
  });

  test('should render active dragging state matching baseline snapshot', async ({ page }) => {
    const stage = await openVisualFixture(page, { state: 'active' });
    await expect(stage).toHaveScreenshot('heelslide-state-active.png');
  });

  test('should render unlocked state matching baseline snapshot', async ({ page }) => {
    const stage = await openVisualFixture(page, { state: 'unlocked' });
    await expect(stage).toHaveScreenshot('heelslide-state-unlocked.png');
  });

  test('should render disabled state matching baseline snapshot', async ({ page }) => {
    const stage = await openVisualFixture(page, { state: 'disabled' });
    await expect(stage).toHaveScreenshot('heelslide-state-disabled.png');
  });
});
