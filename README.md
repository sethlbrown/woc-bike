# Carbondale Bike Project

Website for the [Carbondale Bike Project](https://carbondalebikeproject.org), a community bicycle shop and educational program in Carbondale, Colorado.

## Tech Stack

- **[Eleventy (11ty) v3](https://www.11ty.dev/)** — static site generator with Liquid templates
- **[Tailwind CSS v4](https://tailwindcss.com)** — utility-first CSS via PostCSS
- **[Netlify](https://netlify.com)** — hosting and continuous deployment
- **[Playwright](https://playwright.dev)** — end-to-end testing
- **Node.js 22+**

## Requirements

- [Node.js](https://nodejs.org/) 22+
- [npm](https://www.npmjs.com/)

## Get started

```bash
npm ci
npm run dev
```

This starts Eleventy with live reload and PostCSS watching for CSS changes simultaneously.

## Build

```bash
npm run build        # production build
npm run build:dev    # development build
```

Output goes to `_site/`.

## Testing

```bash
npm test
```

Runs Playwright end-to-end tests. Requires a production build first (`npm run build`), or the test suite will start a local server automatically via `webServer` config.

To install Playwright browsers on first run:

```bash
npx playwright install --with-deps chromium
```

The test suite includes two types of tests:

- **Functional tests** (`pages.spec.js`, `navigation.spec.js`, `contact.spec.js`) — safe to run locally on any platform
- **Visual regression snapshots** (`snapshots.spec.js`) — 15 screenshots across 5 pages × 3 viewports; baselines are Linux-rendered and live in `tests/e2e/__snapshots__/`

**Note:** Snapshot tests will fail locally on macOS due to font rendering differences between macOS and Linux. This is expected — snapshot testing is a CI concern. Use CI to catch visual regressions.

**After an intentional visual change**, re-capture baselines on Linux by triggering the **"Update Snapshot Baselines"** workflow in GitHub Actions (Actions → Update Snapshot Baselines → Run workflow). This commits Linux-rendered PNGs back to the repo so CI passes. Do not run `--update-snapshots` locally — macOS baselines will fail in CI.

## Project Structure

```
.
├── _data/           # Global data files (site.js, nav.js, testimonials.yml, etc.)
├── _includes/       # Liquid partials and layouts
│   └── layouts/     # Page layout templates
├── _site/           # Generated output (git-ignored)
├── assets/          # Static assets (images, JS) — copied to _site as-is
├── src/
│   └── stylev3.css  # Tailwind CSS source (compiled to _site/assets/css/)
├── tests/e2e/       # Playwright tests
├── .eleventy.js     # Eleventy configuration
├── postcss.config.js
└── netlify.toml     # Netlify build configuration
```

## Content

- Pages are Markdown or HTML files at the root level with Liquid front matter
- Navigation is defined in `_data/nav.js`
- Site metadata (title, description, URL, etc.) is in `_data/site.js`
- Testimonials, images, and video data live in `_data/*.yml`

## Adding Images

Images use the `{% image "path", "alt text" %}` shortcode which generates responsive WebP + JPEG at multiple sizes via `@11ty/eleventy-img`.

1. Add original images to `assets/img/`
2. Use the `{% image %}` shortcode in templates
3. Commit originals — responsive variants are generated at build time

## Environment Variables

The contact form submits to a Google Apps Script webhook. Set `WEBHOOK_URL` in your environment:

- **Netlify**: Site configuration → Environment variables → `WEBHOOK_URL`
- **Local dev**: `WEBHOOK_URL=https://... npm run dev`

## Deployment

Deploys automatically via Netlify on push to `main`. Build configuration is in `netlify.toml`.

## External Services

- **Contact form**: Google Apps Script webhook → Google Sheets
- **Spam protection**: Google reCAPTCHA v2
- **DNS**: Namecheap → Netlify

## License

[MIT](LICENSE.md)
