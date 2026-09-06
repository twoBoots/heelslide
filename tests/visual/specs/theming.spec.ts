import { test, expect } from '@playwright/test';
import { openVisualFixture } from '../helpers/visual-utils.js';

test.describe('Theme & CSS Custom Property Visual Regression', () => {
  test('should render default theme matching baseline snapshot', async ({ page }) => {
    const stage = await openVisualFixture(page, { theme: 'default' });
    await expect(stage).toHaveScreenshot('heelslide-theme-default.png');
  });

  test('should render custom palette overrides matching baseline snapshot', async ({ page }) => {
    const stage = await openVisualFixture(page, { theme: 'custom' });
    await expect(stage).toHaveScreenshot('heelslide-theme-custom.png');
  });

  test('should render dark mode theme matching baseline snapshot', async ({ page }) => {
    const stage = await openVisualFixture(page, { theme: 'dark' });
    await expect(stage).toHaveScreenshot('heelslide-theme-dark.png');
  });
});
