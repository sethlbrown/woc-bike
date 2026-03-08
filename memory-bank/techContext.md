# Tech Context: Carbondale Bike Project Website

## Technologies Used

- **Eleventy (11ty) v3**: Static site generator with Liquid templates and Markdown content
- **Tailwind CSS v4**: Utility-first CSS framework (Phase 1; to be replaced with vanilla CSS in Phase 2)
- **PostCSS + @tailwindcss/postcss**: CSS compilation pipeline
- **Node.js 22 & npm**: JavaScript runtime and package management
- **Netlify**: Production hosting with continuous deployment from GitHub
- **Google Apps Script**: Webhook backend for contact form submissions
- **Google Sheets**: Storage for contact form submissions
- **Google reCAPTCHA v2**: Checkbox widget spam protection on contact form
- **Playwright**: End-to-end testing (CI via GitHub Actions)

## Development Setup

1. Install Node.js 22+ and npm
2. `npm ci` to install packages
3. `npm run dev` — starts Eleventy dev server + PostCSS watch in parallel via `concurrently`
4. Site available at `http://localhost:8080`

## Build Commands

- `npm run dev` / `npm start` — local development with live reload
- `npm run build:production` / `npm run build` — production build (Eleventy + PostCSS)
- `npm test` — Playwright e2e tests

## Eleventy Configuration (`.eleventy.js`)

- Input: `.` (project root), Output: `_site/`
- Layouts in `_includes/layouts/`, aliased so `layout: default` works in front matter
- `liquidOptions: { dynamicPartials: false }` — allows unquoted `{% include file.html %}`
- `addDataExtension("yml")` — required for Eleventy v3 YAML data file support
- `addExtension("txt", { key: "liquid" })` — processes `.txt` LLM mirror files as Liquid
- `{% image %}` shortcode via `@11ty/eleventy-img` — generates responsive WebP + JPEG
- RSS filters registered manually via `addLiquidFilter` (plugin only registers Nunjucks)
- Passthrough: `assets/`, `src/js/navigation.js`

## Data Architecture

- `_data/site.js` — site metadata (title, description, URL, phone, hours, author)
- `_data/nav.js` — navigation items (replaces Jekyll's `site.pages | where_exp`)
- `_data/testimonials.yml`, `_data/images.yml`, `_data/videos.yml` — content data
- `_data/webhook_config.js` — reads `process.env.WEBHOOK_URL` at build time

## Environment Variables

- `WEBHOOK_URL` — Google Apps Script webhook URL for contact form
  - Set in Netlify dashboard (Site configuration → Environment variables)
  - Set as GitHub Secret `WEBHOOK_URL` for CI builds
  - For local dev: `WEBHOOK_URL=https://... npm run dev`

## Technical Constraints

- Static site: no server-side code or dynamic backend
- All images optimized; WebP versions generated with `npm run webp` and committed
- No Ruby, no Bundler, no Jekyll, no Gulp, no Browsersync
- Node 22 required (`.nvmrc` pinned)

## External Services

- **Netlify**: Hosting. `netlify.toml` configures build command and publish dir. Auto-deploys on push to `main`.
- **Google Apps Script + Google Sheets**: Contact form backend. Webhook URL never committed; injected via env var.
- **Google reCAPTCHA v2**: Client-side spam friction. Token stripped before Google Sheets POST — no server-side verification.
- **Namecheap DNS**: A record `@` → `75.2.60.5` (Netlify), CNAME `www` → `carbondalebikeproject.netlify.app`

## CI/CD (`.github/workflows/ci.yml`)

- Runs on push to `main`
- Node 22, `npm ci`, build, Playwright tests (headless Chromium)
- `WEBHOOK_URL` injected as env var during build
- Netlify deploys independently via GitHub integration (not from CI)
