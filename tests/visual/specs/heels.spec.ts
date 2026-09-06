import { test, expect } from '@playwright/test';
import { openVisualFixture } from '../helpers/visual-utils.js';

test.describe('Heel Geometry Visual Regression', () => {
  test('should render 1-heel configuration matching baseline snapshot', async ({ page }) => {
    const stage = await openVisualFixture(page, { heels: 1 });
    await expect(stage).toHaveScreenshot('heelslide-heels-1.png');
  });

  test('should render 2-heel configuration matching baseline snapshot', async ({ page }) => {
    const stage = await openVisualFixture(page, { heels: 2 });
    await expect(stage).toHaveScreenshot('heelslide-heels-2.png');
  });

  test('should render 4-heel configuration matching baseline snapshot', async ({ page }) => {
    const stage = await openVisualFixture(page, { heels: 4 });
    await expect(stage).toHaveScreenshot('heelslide-heels-4.png');
  });
});
