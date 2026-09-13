import { test, expect, type Page } from '@playwright/test';

/**
 * Keyboard operation in real browsers — WCAG 2.2 SC 2.1.1, 2.1.2 and 2.4.7.
 *
 * The unit suites drive `keydown` through happy-dom and jsdom, which model events but not focus.
 * Focusability, tab order and `:focus-visible` are exactly where simulated DOM and real engines
 * diverge, and where `tabindex` on an SVG element would have failed silently in WebKit had the
 * slider not been normalised onto a `div`. That is why this runs on the full browser matrix.
 */

const SLIDER = '[data-heelslide-container]';

async function gotoPlayground(page: Page) {
  await page.goto('/');
  await page.waitForSelector(SLIDER);
}

/** Focuses the slider the way a keyboard user would, rather than by calling focus(). */
async function tabToSlider(page: Page): Promise<number> {
  await page.locator('body').click({ position: { x: 2, y: 2 } });

  for (let presses = 1; presses <= 40; presses += 1) {
    await page.keyboard.press('Tab');
    const onSlider = await page.evaluate(
      (sel) => document.activeElement?.closest(sel) !== null,
      SLIDER
    );
    if (onSlider) return presses;
  }

  return -1;
}

test.describe('keyboard operation', () => {
  test('the slider is reachable in the tab order from page load', async ({ page }) => {
    await gotoPlayground(page);

    const presses = await tabToSlider(page);

    expect(presses, 'slider was never reached by Tab').toBeGreaterThan(0);
  });

  test('shows a visible focus indicator when focused by keyboard', async ({ page }) => {
    await gotoPlayground(page);
    await tabToSlider(page);

    // :focus-visible only matches on keyboard focus, which is why this is tabbed to rather
    // than clicked or focused programmatically.
    const outline = await page.evaluate((sel) => {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (!el || !el.matches(':focus-visible')) return null;
      const style = getComputedStyle(el);
      return { width: style.outlineWidth, style: style.outlineStyle };
    }, SLIDER);

    expect(outline, 'slider did not match :focus-visible after Tab').not.toBeNull();
    expect(outline?.style).not.toBe('none');
    expect(parseFloat(outline?.width ?? '0')).toBeGreaterThan(0);
  });

  test('completes the gate to unlock using only the keyboard', async ({ page }) => {
    await gotoPlayground(page);
    await tabToSlider(page);

    const slider = page.locator(SLIDER);
    await expect(slider).toHaveAttribute('aria-valuenow', '0');

    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press('ArrowRight');
    }
    await expect(slider).toHaveAttribute('aria-valuenow', '100');

    await page.keyboard.press('Enter');
    await expect(slider).toHaveAttribute('data-state', 'unlocked');
  });

  test('announces progress into the live region', async ({ page }) => {
    await gotoPlayground(page);
    await tabToSlider(page);

    await page.keyboard.press('ArrowRight');

    const region = page.locator('[data-heelslide-live-region]').first();
    await expect(region).toHaveAttribute('aria-live', 'polite');
    await expect(region).not.toBeEmpty();
  });

  test('Escape cancels without trapping focus', async ({ page }) => {
    await gotoPlayground(page);
    await tabToSlider(page);

    await page.keyboard.press('ArrowRight');
    await expect(page.locator(SLIDER)).not.toHaveAttribute('aria-valuenow', '0');

    await page.keyboard.press('Escape');
    await expect(page.locator(SLIDER)).toHaveAttribute('aria-valuenow', '0');

    // The real no-keyboard-trap check: Tab must move focus off the widget.
    await page.keyboard.press('Tab');
    const stillOnSlider = await page.evaluate(
      (sel) => document.activeElement?.closest(sel) !== null,
      SLIDER
    );
    expect(stillOnSlider, 'focus was trapped on the slider after Escape').toBe(false);
  });

  test('leaves End unbound so a single keypress cannot bypass traversal', async ({ page }) => {
    await gotoPlayground(page);
    await tabToSlider(page);

    await page.keyboard.press('ArrowRight');
    const afterStep = await page.locator(SLIDER).getAttribute('aria-valuenow');

    await page.keyboard.press('End');
    await expect(page.locator(SLIDER)).toHaveAttribute('aria-valuenow', afterStep ?? '0');
  });

  test('keeps aria-valuetext in step with progress', async ({ page }) => {
    await gotoPlayground(page);
    await tabToSlider(page);

    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');

    const slider = page.locator(SLIDER);
    const now = await slider.getAttribute('aria-valuenow');
    const text = await slider.getAttribute('aria-valuetext');

    expect(text).toContain(`${now}%`);
  });
});
