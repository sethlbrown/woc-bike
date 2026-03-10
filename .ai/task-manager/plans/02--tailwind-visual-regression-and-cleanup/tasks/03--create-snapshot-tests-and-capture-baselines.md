---
id: 3
group: "visual-regression"
dependencies: [2]
status: "completed"
created: "2026-03-09"
skills:
  - playwright
---
# Create Snapshot Tests and Capture Baseline Screenshots

## Objective
Write `tests/e2e/snapshots.spec.js` covering all 5 pages at 3 viewports (15 tests total), then capture baseline PNG screenshots against the current Tailwind site and commit them. These baselines are the pixel-level reference for the refactor phase.

## Skills Required
- `playwright`: `toHaveScreenshot()`, `mask`, `waitForLoadState`, `--update-snapshots`

## Acceptance Criteria
- [ ] `tests/e2e/snapshots.spec.js` exists with 15 tests: 5 pages × 3 viewports (375px, 768px, 1280px)
- [ ] Each test uses `fullPage: true` and `maxDiffPixelRatio: 0.02`
- [ ] PayPal and reCAPTCHA DOM regions are masked in every test
- [ ] A comment block at the top of the file documents the override workflow (how to re-baseline intentionally)
- [ ] `npx playwright test tests/e2e/snapshots.spec.js --update-snapshots` runs against the live dev server and produces exactly 15 PNG files in `tests/e2e/__snapshots__/`
- [ ] `npx playwright test tests/e2e/snapshots.spec.js` (without `--update-snapshots`) passes clean immediately after baseline capture
- [ ] All 15 PNG files are committed to the repo

## Technical Requirements
- Pages: `/`, `/about/`, `/programs/`, `/how-can-i-help/`, `/contact/`
- Viewports: `{ width: 375, height: 812 }`, `{ width: 768, height: 1024 }`, `{ width: 1280, height: 900 }`
- Snapshot names use the pattern `{page-name}-{viewport-name}.png` (e.g. `home-mobile.png`, `about-tablet.png`)
- `page.waitForLoadState('networkidle')` before each screenshot to stabilize external resources
- Mask selectors: `iframe[src*="paypal"], .paypal-campaign-card` and `.g-recaptcha, [data-sitekey]`
- Dev server must be running (`npm run dev`) before capturing baselines; `playwright.config.js` `webServer` block handles this automatically

## Input Dependencies
- Task 2: `snapshotPathTemplate` configured in `playwright.config.js`

## Output Artifacts
- `tests/e2e/snapshots.spec.js` — 15 snapshot tests
- `tests/e2e/__snapshots__/` — 15 committed baseline PNG files

## Implementation Notes

<details>
<summary>Detailed implementation guide</summary>

**`tests/e2e/snapshots.spec.js`:**
```javascript
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
 *   Trigger the workflow_dispatch on GitHub Actions with --update-snapshots,
 *   or re-run step 1 above on a Linux machine, then commit the result.
 */

const { test, expect } = require('@playwright/test');

const pages = [
  { url: '/', name: 'home' },
  { url: '/about/', name: 'about' },
  { url: '/programs/', name: 'programs' },
  { url: '/how-can-i-help/', name: 'how-can-i-help' },
  { url: '/contact/', name: 'contact' },
];

const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 900 },
];

for (const p of pages) {
  for (const vp of viewports) {
    test(`${p.name} at ${vp.name} matches snapshot`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(p.url);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot(`${p.name}-${vp.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
        mask: [
          page.locator('iframe[src*="paypal"], .paypal-campaign-card'),
          page.locator('.g-recaptcha, [data-sitekey]'),
        ],
      });
    });
  }
}
```

**Capture baselines:**
```bash
# Dev server must be running (webServer config handles this automatically)
npx playwright test tests/e2e/snapshots.spec.js --update-snapshots

# Verify 15 files created
ls tests/e2e/__snapshots__/
# home-mobile.png, home-tablet.png, home-desktop.png
# about-mobile.png, about-tablet.png, about-desktop.png
# programs-mobile.png, programs-tablet.png, programs-desktop.png
# how-can-i-help-mobile.png, how-can-i-help-tablet.png, how-can-i-help-desktop.png
# contact-mobile.png, contact-tablet.png, contact-desktop.png

# Verify they pass clean
npx playwright test tests/e2e/snapshots.spec.js

# Commit
git add tests/e2e/snapshots.spec.js tests/e2e/__snapshots__/
git commit -m "test: add Playwright visual regression baselines (15 snapshots)"
```

**If a snapshot is flaky** (fails intermittently): Check which DOM element is causing variance and add it to the `mask` array. Common culprits are animated elements, lazy-loaded images, or third-party embeds.
</details>
