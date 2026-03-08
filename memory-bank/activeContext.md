# Active Context: Carbondale Bike Project Website

## Current Work Focus

Phase 1 of the Jekyll → Eleventy migration is complete and the site is live on Netlify. Phase 2 (vanilla CSS) work is complete but stashed pending review.

## Recent Changes

### Jekyll → Eleventy Migration (Phase 1 — Completed, March 2026)

- Migrated from Jekyll + Gulp + Ruby to Eleventy v3 + npm scripts + Node 22
- Replaced Firebase Hosting with Netlify (free plan); DNS switched on Namecheap
- Added Playwright end-to-end tests (10 tests passing in CI)
- Retained Tailwind CSS v4 via standalone PostCSS build step
- Retained Google Sheets contact form backend and reCAPTCHA v2 (unchanged)
- Key technical fixes required during migration:
  - Added `addDataExtension("yml")` for Eleventy v3 YAML data support
  - Added `postcss.config.js` (was missing, causing raw CSS passthrough)
  - Added `liquidOptions: { dynamicPartials: false }` for Jekyll-compatible includes
  - Wrapped RSS feed content in `<![CDATA[]]>` to fix XML validation error
  - Replaced `_data/webhook_config.yml` + GitHub Actions injection with `_data/webhook_config.js` reading `process.env.WEBHOOK_URL` — works for both Netlify env vars and CI
  - Fixed `404.html` permalink to include file extension (`/404.html`)
  - Fixed `.txt` LLM mirror files: `layout: none` → `layout: false`, added `addExtension("txt", { key: "liquid" })`

### Post-Migration Cleanup (March 2026)

- Removed `_config.yml` (Jekyll config; data moved to `_data/site.js`)
- Cleaned `.gitignore` (removed Jekyll/Firebase artifacts)
- Cleaned `dependabot.yml` (removed stale Tailwind v2 ignore rules; reduced PR limit to 10)
- Updated `README.md` to reflect Eleventy/Netlify stack
- Added `test-results/` and `playwright-report/` to `.gitignore`

### Phase 2 — Vanilla CSS (Stashed, Not Yet Merged)

All three Phase 2 tasks are complete and stashed on `feature/phase-2-vanilla-css`:
- **Task 010**: `src/style.css` written with CSS custom properties and all component styles
- **Task 011**: All Tailwind classes replaced with semantic class names in all templates
- **Task 012**: Tailwind/PostCSS deps removed, build pipeline simplified, Playwright visual snapshots added

**To resume Phase 2:**
```bash
git checkout feature/phase-2-vanilla-css
git stash pop
# review, test, then commit
```

## Current State

- Branch: `main` (with full Eleventy + Tailwind stack)
- Hosting: Netlify (production), deploying from `main`
- DNS: Namecheap → Netlify (A record `@` → `75.2.60.5`, CNAME `www` → `carbondalebikeproject.netlify.app`)
- SSL: Netlify Let's Encrypt (auto-provisioned)
- `WEBHOOK_URL` env var set in Netlify dashboard for contact form

## Next Steps

- Confirm Netlify DNS verification completes and SSL is active on custom domain
- Decide when to resume Phase 2 (vanilla CSS) from stash
- Merge Phase 2 PR when ready → update `CLAUDE.md` to remove Tailwind references
- Monitor contact form submissions in Google Sheet
