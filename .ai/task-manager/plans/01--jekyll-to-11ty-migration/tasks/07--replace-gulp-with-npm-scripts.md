---
id: 7
group: "eleventy-setup"
dependencies: [2]
status: "completed"
created: "2026-03-06"
skills: ["nodejs"]
---
# Replace Gulp with PostCSS npm Scripts

## Objective
Delete `gulpfile.babel.js` and replace the Gulp-based build pipeline with simple npm scripts. Tailwind CSS is retained via a standalone `postcss` command. CSS is compiled using the same PostCSS + `@tailwindcss/postcss` pipeline, just invoked from npm scripts instead of Gulp tasks.

## Skills Required
- `nodejs`: `package.json` scripts, CLI tool invocation

## Acceptance Criteria
- [ ] `gulpfile.babel.js` deleted
- [ ] `tailwind.config.js` updated: content paths updated for Eleventy layout location (`_includes/layouts/` instead of `_layouts/`), and the `.eleventy.js` config file added to content paths
- [ ] `npm run build:production` produces a complete `_site/` with compiled CSS at `_site/assets/css/stylev3.css` and JS at `_site/assets/js/navigation.js`
- [ ] `npm run dev` starts the Eleventy dev server with live reload AND watches for CSS changes (using `concurrently`)
- [ ] CSS output file path is unchanged (`/assets/css/stylev3.css`) — no changes needed to `_includes/head.html`'s CSS `<link>` tag
- [ ] `npm run start` aliased to `npm run dev`
- [ ] `npm run webp` still works (standalone utility script)
- [ ] No Gulp, Browsersync, or Babel references remain in `package.json` scripts or devDependencies

## Technical Requirements
- `postcss-cli` needed as a devDependency for `postcss` CLI command (`npm install --save-dev postcss-cli`)
- `concurrently` needed for parallel CSS watch + Eleventy serve in `dev` script
- The CSS output goes to `_site/assets/css/stylev3.css` — but Eleventy builds first, then PostCSS writes to `_site/` — OR PostCSS writes directly to `_site/assets/css/` alongside Eleventy's passthrough copies. The build order matters: CSS must be compiled before or independently of Eleventy's build.
- **Build order strategy**: Run PostCSS separately before Eleventy, writing output to `_site/assets/css/`. Eleventy then doesn't need to know about CSS (it passthrough-copies `assets/` but the CSS source is in `src/`, not `assets/`).
- `tailwind.config.js` content array must include all Eleventy template paths

## Input Dependencies
- Task 2: Eleventy initialized, `concurrently` and `postcss-cli` installed, base npm scripts added

## Output Artifacts
- Deleted `gulpfile.babel.js`
- Updated `tailwind.config.js`
- Updated `package.json` with finalized npm scripts
- Working `npm run build:production` and `npm run dev`

## Implementation Notes

<details>
<summary>Detailed implementation guide</summary>

**Final `package.json` scripts:**
```json
{
  "scripts": {
    "build:css": "postcss src/stylev3.css -o _site/assets/css/stylev3.css",
    "build:production": "npm run build:css && eleventy",
    "build:dev": "npm run build:css && eleventy",
    "dev": "concurrently \"postcss src/stylev3.css -o _site/assets/css/stylev3.css --watch\" \"eleventy --serve\"",
    "start": "npm run dev",
    "test": "playwright test",
    "webp": "node src/js/utils/convert-to-webp.js"
  }
}
```

**Issue with `_site/` and PostCSS output**: Eleventy cleans `_site/` on each build. If PostCSS writes to `_site/assets/css/stylev3.css` and then Eleventy runs and cleans `_site/`, the CSS file is deleted. Solutions:
1. **Write CSS to `src/` first, passthrough copy to `_site/`**: PostCSS writes compiled CSS to `src/css/stylev3.css`, and `.eleventyignore` doesn't ignore it. But `_includes/head.html` references `/assets/css/stylev3.css`.
2. **Configure Eleventy to not clean `_site/`**: Set `eleventyConfig.setServerOptions({ domdiff: false })` — not ideal.
3. **Better approach**: Write PostCSS output to a temp location that Eleventy passthrough-copies. Add `src/stylev3.css` to Eleventy's watch but write the compiled output to `assets/css/stylev3.css` (in the source `assets/` dir, which Eleventy passthrough-copies). Then add `assets/css/stylev3.css` to `.gitignore`.
4. **Simplest**: Run PostCSS AFTER Eleventy, and for dev use `--watch` with both running in parallel via `concurrently`. Eleventy's watch rebuilds wipe the file but PostCSS immediately rewrites it. This race condition is acceptable in dev.

**Recommended approach**: Run PostCSS AFTER Eleventy in production:
```json
"build:production": "eleventy && postcss src/stylev3.css -o _site/assets/css/stylev3.css"
```

In dev mode, `concurrently` runs both in parallel — the race condition is a minor dev inconvenience.

**Updated `tailwind.config.js`:**
```javascript
module.exports = {
  content: [
    './_includes/**/*.html',
    './_includes/layouts/**/*.html',
    './*.{html,md}',
    './assets/js/**/*.js',
    './.eleventy.js'
  ]
}
```

**Additional devDependency to add:** `postcss-cli` (`npm install --save-dev postcss-cli`)

**Delete:** `gulpfile.babel.js`
</details>
