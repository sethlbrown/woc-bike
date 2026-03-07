---
id: 12
group: "vanilla-css"
dependencies: [11]
status: "pending"
created: "2026-03-06"
skills: ["nodejs", "playwright"]
---
# Remove Tailwind Dependencies and Add Playwright Visual Snapshots

## Objective
Remove all Tailwind CSS and related dependencies from `package.json`, update the Eleventy config and build scripts for the final vanilla CSS pipeline, and extend the Playwright test suite with visual snapshot comparisons to protect against future CSS regressions.

## Skills Required
- `nodejs`: `package.json` dependency management, npm scripts simplification
- `playwright`: Visual snapshot testing, `toHaveScreenshot()` usage

## Acceptance Criteria
- [ ] `package.json` devDependencies: `tailwindcss`, `@tailwindcss/postcss`, `@tailwindcss/forms`, `@tailwindcss/typography`, `prettier-plugin-tailwindcss`, `postcss`, `postcss-cli`, `concurrently` all removed
- [ ] `tailwind.config.js` deleted
- [ ] `src/stylev3.css` deleted
- [ ] `.eleventy.js` updated: `addPassthroughCopy` added for `src/style.css` → `_site/assets/css/style.css`; `addWatchTarget("src/stylev3.css")` replaced with `addWatchTarget("src/style.css")`
- [ ] `package.json` scripts simplified: `build:production` changed to `eleventy` (no CSS build step); `dev` changed to `eleventy --serve` (no `concurrently`)
- [ ] `npm run build:production` produces correct `_site/` with `style.css` in place
- [ ] `npm run dev` works with Eleventy hot-reloading CSS changes via passthrough copy
- [ ] Playwright visual snapshots added: each page photographed at 375px and 1280px widths; snapshots stored in `tests/e2e/__snapshots__/`
- [ ] `npm test` passes including snapshot comparisons
- [ ] No Tailwind class names appear in any template (final grep verification)

## Technical Requirements
- `npm uninstall tailwindcss @tailwindcss/postcss @tailwindcss/forms @tailwindcss/typography prettier-plugin-tailwindcss postcss postcss-cli concurrently`
- Eleventy's passthrough copy handles CSS: `addPassthroughCopy({ "src/style.css": "assets/css/style.css" })`
- `eleventy --serve` (Eleventy's built-in dev server) watches passthrough-copied files for changes via `addWatchTarget`
- Visual snapshot tests use `await expect(page).toHaveScreenshot('page-name-mobile.png')` — run once to generate baselines, then commit the `.png` files to the repo
- Snapshots committed to `tests/e2e/__snapshots__/` (include in `.gitignore` exclusion list if currently ignored; they must be committed)

## Input Dependencies
- Task 11: All Tailwind classes replaced in templates; `src/style.css` linked in `head.html`

## Output Artifacts
- Updated `package.json` — Tailwind deps removed, scripts simplified
- Updated `.eleventy.js` — CSS passthrough copy, updated watch target
- Deleted `tailwind.config.js`, `src/stylev3.css`
- `tests/e2e/snapshots.spec.js` — visual snapshot tests
- `tests/e2e/__snapshots__/` — committed baseline PNG files

## Implementation Notes

<details>
<summary>Detailed implementation guide</summary>

**Step 1: Remove dependencies**
```bash
npm uninstall tailwindcss @tailwindcss/postcss @tailwindcss/forms @tailwindcss/typography prettier-plugin-tailwindcss postcss postcss-cli concurrently
git rm tailwind.config.js src/stylev3.css
```

**Step 2: Update `.eleventy.js`**
Replace:
```javascript
eleventyConfig.addPassthroughCopy("assets");
eleventyConfig.addWatchTarget("src/stylev3.css");
```
With:
```javascript
eleventyConfig.addPassthroughCopy("assets");
eleventyConfig.addPassthroughCopy({ "src/style.css": "assets/css/style.css" });
eleventyConfig.addWatchTarget("src/style.css");
```

**Step 3: Update `package.json` scripts**
```json
{
  "scripts": {
    "build:production": "eleventy",
    "dev": "eleventy --serve",
    "start": "npm run dev",
    "test": "playwright test",
    "webp": "node src/js/utils/convert-to-webp.js"
  }
}
```

**Step 4: Add Playwright snapshot tests**

Create `tests/e2e/snapshots.spec.js`:
```javascript
const { test, expect } = require('@playwright/test');

const pages = ['/', '/about/', '/programs/', '/how-can-i-help/', '/contact/'];
const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'desktop', width: 1280, height: 900 }
];

for (const pageUrl of pages) {
  for (const viewport of viewports) {
    const pageName = pageUrl.replace(/\//g, '-').replace(/^-|-$/g, '') || 'home';
    test(`${pageUrl} at ${viewport.name} matches snapshot`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot(`${pageName}-${viewport.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02 // Allow 2% pixel difference
      });
    });
  }
}
```

**Step 5: Generate baseline snapshots**
```bash
# Run with --update-snapshots flag to generate initial baselines
npx playwright test tests/e2e/snapshots.spec.js --update-snapshots
# Commit the generated .png files
git add tests/e2e/__snapshots__/
git commit -m "test: add Playwright visual snapshot baselines"
```

**Step 6: Final verification**
```bash
# Verify no Tailwind classes remain
grep -rn "class=\"" _includes/ *.html *.md --include="*.html" --include="*.md" \
  | grep -E "bg-|text-gray|text-teal|flex |px-|py-|sm:|md:|lg:|border-|rounded|shadow" \
  | grep -v "node_modules" | grep -v "_site"
# Should return no results

# Full test run
npm test
```

**Note on snapshot stability**: Snapshots can be brittle if external resources (fonts, reCAPTCHA, PayPal widget) load differently between runs. Use `--mask` to mask dynamic regions or `page.waitForLoadState('networkidle')` to stabilize. Set `maxDiffPixelRatio: 0.02` to allow minor rendering differences.
</details>
