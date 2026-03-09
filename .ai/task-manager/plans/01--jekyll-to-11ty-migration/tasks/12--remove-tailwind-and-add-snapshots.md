---
id: 12
group: "vanilla-css"
dependencies: [11]
status: "pending"
created: "2026-03-06"
skills: ["nodejs", "playwright"]
---
# Remove Tailwind Dependencies and Re-baseline Snapshots

## Objective
Remove all Tailwind CSS and related dependencies from `package.json`, update the Eleventy config and build scripts for the final vanilla CSS pipeline, and re-baseline the Playwright snapshots against the finished vanilla CSS site. By this point `snapshots.spec.js` and passing baseline PNGs already exist (from Task 10); this task replaces those baselines with final vanilla-CSS screenshots to serve as the permanent regression guard.

## Skills Required
- `nodejs`: `package.json` dependency management, npm scripts simplification
- `playwright`: Re-baselining with `--update-snapshots` after Tailwind removal

## Acceptance Criteria
- [ ] `package.json` devDependencies: `tailwindcss`, `@tailwindcss/postcss`, `@tailwindcss/forms`, `@tailwindcss/typography`, `prettier-plugin-tailwindcss`, `postcss`, `postcss-cli`, `concurrently` all removed
- [ ] `tailwind.config.js` deleted
- [ ] `src/stylev3.css` deleted
- [ ] `.eleventy.js` updated: `addPassthroughCopy` added for `src/style.css` → `_site/assets/css/style.css`; `addWatchTarget("src/stylev3.css")` replaced with `addWatchTarget("src/style.css")`
- [ ] `package.json` scripts simplified: `build:production` changed to `eleventy` (no CSS build step); `dev` changed to `eleventy --serve` (no `concurrently`)
- [ ] `npm run build:production` produces correct `_site/` with `style.css` in place
- [ ] `npm run dev` works with Eleventy hot-reloading CSS changes via passthrough copy
- [ ] Playwright snapshot baselines re-generated against the vanilla CSS site and committed to `tests/e2e/__snapshots__/`
- [ ] `npm test` passes clean (all 10 snapshots green)
- [ ] No Tailwind class names appear in any template (final grep verification)

## Technical Requirements
- `npm uninstall tailwindcss @tailwindcss/postcss @tailwindcss/forms @tailwindcss/typography prettier-plugin-tailwindcss postcss postcss-cli concurrently`
- Eleventy's passthrough copy handles CSS: `addPassthroughCopy({ "src/style.css": "assets/css/style.css" })`
- `eleventy --serve` watches passthrough-copied files for changes via `addWatchTarget`
- Re-baseline by running `npx playwright test tests/e2e/snapshots.spec.js --update-snapshots` — this overwrites the Tailwind PNGs with vanilla CSS PNGs; commit the updated files
- Snapshots must remain committed to `tests/e2e/__snapshots__/` (not gitignored)

## Input Dependencies
- Task 11: All Tailwind classes replaced in templates; `src/style.css` linked in `head.html`; snapshot tests passing against Tailwind baselines

## Output Artifacts
- Updated `package.json` — Tailwind deps removed, scripts simplified
- Updated `.eleventy.js` — CSS passthrough copy, updated watch target
- Deleted `tailwind.config.js`, `src/stylev3.css`
- Updated `tests/e2e/__snapshots__/` — 10 re-baselined PNG files (vanilla CSS reference, permanent)

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

**Step 4: Re-baseline snapshots against the vanilla CSS site**
```bash
# Start the vanilla CSS dev server
npm run dev   # localhost:8080, no Tailwind

# Re-generate baselines — overwrites the Tailwind PNGs with vanilla CSS PNGs
npx playwright test tests/e2e/snapshots.spec.js --update-snapshots

# Confirm all 10 pass clean
npx playwright test tests/e2e/snapshots.spec.js

# Commit the updated baselines
git add tests/e2e/__snapshots__/
git commit -m "test: re-baseline Playwright snapshots to vanilla CSS"
```

**Step 5: Final verification**
```bash
# Verify no Tailwind classes remain
grep -rn "class=\"" _includes/ *.html *.md --include="*.html" --include="*.md" \
  | grep -E "bg-|text-gray|text-teal|flex |px-|py-|sm:|md:|lg:|border-|rounded|shadow" \
  | grep -v "node_modules" | grep -v "_site"
# Should return no results

# Full test suite
npm test
```

**Why re-baseline instead of keeping the Tailwind PNGs**: After Tailwind is removed the `style.css` pipeline is the permanent foundation. The vanilla CSS snapshots are the new ground truth for future regression detection. The Tailwind baselines captured in Task 10 served their purpose (validating fidelity in Task 11) and are now superseded.
</details>
