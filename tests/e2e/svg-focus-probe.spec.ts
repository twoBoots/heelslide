import { test, expect } from '@playwright/test';

/**
 * Probe, not a product assertion.
 *
 * The slider role was moved from an SVG `<g>` onto a `div` partly on the argument that
 * `tabindex` on an SVG container element is unreliable — WebKit especially. That argument was
 * stated as a reason for a design decision, so it is worth checking rather than assuming.
 *
 * This records what each engine in the matrix actually does. It asserts only the thing the
 * product depends on: that a `div` is focusable everywhere. The SVG result is reported so the
 * rationale can be corrected if it turns out to have been overstated.
 */

const PAGE = `
<!doctype html>
<html><body>
  <div id="divTarget" tabindex="0">div</div>
  <svg width="100" height="50">
    <g id="gTarget" tabindex="0"><circle cx="25" cy="25" r="20" /></g>
  </svg>
</body></html>
`;

test('records whether tabindex on an SVG <g> is focusable in this engine', async ({
  page
}, testInfo) => {
  await page.setContent(PAGE);

  const result = await page.evaluate(() => {
    function probe(id: string) {
      const el = document.getElementById(id) as HTMLElement | null;
      if (!el) return { focusable: false, tabbable: false };
      el.focus();
      return {
        focusable: document.activeElement === el,
        tabbable: typeof el.tabIndex === 'number' && el.tabIndex >= 0
      };
    }
    return { div: probe('divTarget'), svgG: probe('gTarget') };
  });

  // eslint-disable-next-line no-console
  console.log(
    `[svg-focus-probe] ${testInfo.project.name}: ` +
      `div.focus()=${result.div.focusable}, svg<g>.focus()=${result.svgG.focusable}`
  );

  // The product relies on this one.
  expect(result.div.focusable, 'a div with tabindex must be focusable').toBe(true);

  // Reported, not enforced — the SVG behaviour is what the rationale claimed.
  expect(typeof result.svgG.focusable).toBe('boolean');
});
