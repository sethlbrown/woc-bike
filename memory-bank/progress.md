# Progress: Carbondale Bike Project Website

## What Works

- Site is live on Netlify at `carbondalebikeproject.org` (DNS transition in progress as of March 2026)
- All pages render correctly: home, about, programs, how-can-i-help, contact, 404
- Navigation works on mobile and desktop
- Responsive images generated via `@11ty/eleventy-img` (WebP + JPEG, multiple sizes)
- Contact form: client-side validation, honeypot, reCAPTCHA v2, submits to Google Sheets
- Testimonials rotate randomly on homepage
- RSS feed at `/feed.xml` (valid XML via CDATA wrapping)
- LLM-readable `.txt` mirrors for all main pages
- Playwright e2e test suite (10 tests, passing in CI)
- Kickstand Club progress bar: 105/120 bikes funded (87.5%)
- `npm run dev` starts full local dev environment at `http://localhost:8080`

## What's Left to Build

### Phase 2 — Vanilla CSS (Stashed, Ready to Merge)

All work done on `feature/phase-2-vanilla-css`, stashed:
- `src/style.css` written with CSS custom properties + all component styles
- All Tailwind classes replaced with semantic class names in all templates
- Tailwind/PostCSS deps removed from `package.json`
- Build pipeline simplified: `eleventy --serve` replaces `concurrently` + PostCSS watch
- Playwright visual snapshot tests added

**To resume**: `git checkout feature/phase-2-vanilla-css && git stash pop`

### Ongoing

- Monitor contact form submissions for spam patterns
- Content updates as programs/events change
- Kickstand Club progress bar update when new bikes are funded

## Current Status

- **Hosting**: Netlify (live), DNS transitioning from Firebase → Netlify
- **Stack**: Eleventy v3 + Tailwind CSS v4 + Node 22 (Phase 1 complete)
- **CI**: GitHub Actions — build + Playwright on every push to `main`
- **Firebase**: Idle (free Spark plan, cannot delete due to org ownership; no cost)

## Known Issues

- Netlify DNS verification pending (may take up to 24h after DNS change)
- reCAPTCHA v2 has no server-side verification — client-side friction only
- CSS cache busting: Tailwind output filename is fixed (`stylev3.css`); change requires filename update in `head.html` and build script (resolved automatically in Phase 2 with vanilla CSS passthrough)
