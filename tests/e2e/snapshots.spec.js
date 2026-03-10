/**
 * Visual regression snapshot tests — 5 pages × 3 viewports = 15 snapshots.
 *
 * Baselines live in tests/e2e/__snapshots__/ and are committed to the repo.
 *
 * To intentionally update baselines after a visual change:
 *   1. npx playwright test tests/e2e/snapshots.spec.js --update-snapshots
 *   2. Review the updated PNGs visually to confirm they match intent
 *   3. Commit the updated PNG files alongside the code change
 *   4. Push — CI passes because the committed PNGs are the new baseline
 *
 * If CI fails on font rendering (macOS vs Linux variance):
 *   Re-run step 1 on a Linux machine (or trigger workflow_dispatch on GitHub
 *   Actions), then commit the Linux-rendered PNGs as a one-time fix.
 *
 * Dynamic regions (random testimonial, reCAPTCHA) are frozen/masked to
 * prevent height and pixel variance between runs.
 */

const { test, expect } = require("@playwright/test");

const pages = [
  { url: "/", name: "home" },
  { url: "/about/", name: "about" },
  { url: "/programs/", name: "programs" },
  { url: "/how-can-i-help/", name: "how-can-i-help" },
  { url: "/contact/", name: "contact" },
];

const viewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 900 },
];

for (const p of pages) {
  for (const vp of viewports) {
    test(`${p.name} at ${vp.name} matches snapshot`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(p.url);
      await page.waitForLoadState("networkidle");

      // Freeze dynamic content that causes height variance between runs.
      // The testimonials block picks a random quote via JS — fix it to a
      // stable placeholder so full-page height is consistent across runs.
      await page.evaluate(() => {
        const quote = document.getElementById("testimonial_quote");
        const author = document.getElementById("testimonial_author");
        if (quote) {
          quote.innerHTML =
            "<p>Snapshot placeholder — testimonial content is masked.</p>";
        }
        if (author) {
          author.textContent = "- Snapshot Author";
        }
      });

      await expect(page).toHaveScreenshot(`${p.name}-${vp.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
        mask: [
          // Mask external widgets that render inconsistently
          page.locator("iframe[src*='paypal'], .paypal-campaign-card"),
          page.locator(".g-recaptcha, [data-sitekey]"),
          // Mask testimonial region (random content; height stabilised above)
          page.locator("#testimonial_quote, #testimonial_author"),
        ],
      });
    });
  }
}
