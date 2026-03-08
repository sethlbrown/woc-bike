# System Patterns: Carbondale Bike Project Website

## System Architecture

- Static site generated with Eleventy v3 (Liquid templates + Markdown)
- Tailwind CSS v4 compiled via standalone PostCSS (no Gulp, no Browsersync)
- Hosted on Netlify with continuous deployment from `main` on GitHub
- Minimal JavaScript for interactivity (navigation toggle, contact form)

## Key Technical Decisions

- **Eleventy over Jekyll**: Eliminates Ruby/Bundler dependency; Node-only pipeline
- **`dynamicPartials: false`**: Allows unquoted `{% include file.html %}` — compatible with existing Jekyll include syntax
- **Static `_data/nav.js`**: Replaces Jekyll's `site.pages | where_exp` (not available in liquidjs); simpler and more maintainable
- **`_data/webhook_config.js`**: Reads `process.env.WEBHOOK_URL` — works for Netlify env vars and GitHub Actions CI without file injection
- **`@11ty/eleventy-img`**: Generates responsive WebP + JPEG at build time; replaces Ruby/ImageMagick
- **Inline SVGs**: Social and payment icons avoid heavy icon font dependencies
- **WebP images**: Committed to repo; `npm run webp` utility for conversion

## Design Patterns

- **Layouts**: `_includes/layouts/default.html` and `markdown-content.html`; aliased in `.eleventy.js` so `layout: default` front matter works
- **Includes**: Navigation, header, footer, banners, donation components in `_includes/`
- **Data cascade**: Global data in `_data/`; page-level data in front matter
- **Sections**: Container divs with `max-w-7xl` max-width and responsive Tailwind breakpoints

## Form Submission Architecture

- **Contact Form (`30-contact.html`)**:
  - Client-side validation (required fields, email format, phone format, max 2000 chars)
  - Honeypot field (`website-url`) silently rejects bots
  - Submits JSON as `text/plain` to bypass CORS preflight
  - `WEBHOOK_URL` injected at build time via `_data/webhook_config.js`

- **Google Apps Script Backend**:
  - Receives POST, validates fields, writes to Google Sheet with timestamp
  - Returns JSON success/error response

- **Security**:
  - `WEBHOOK_URL` never committed; set as Netlify env var and GitHub Secret
  - Honeypot + reCAPTCHA v2 for spam protection (no server-side token verification)

## Development Workflow

- Feature branches: `feature-[description]` or `feature/{planId}--{plan-name}` (task manager)
- Always start from clean `main`; verify build before branching
- Netlify auto-deploys `main` to production on every push
- GitHub Actions CI: build + Playwright tests on every push to `main`

## Responsive Image Pattern

- Shortcode: `{% image "assets/img/filename.jpg", "Alt text" %}`
- Generates `<picture>` with WebP sources at 300/400/600/800/975/1600px widths
- Output: `_site/assets/img/{width}/{basename}.{webp,jpg}`
- Class: `w-full block sm:float-right sm:inline sm:p-4 sm:w-1/2 md:w-3/5 lg:w-2/3 xl:w-3/5`

## RSS Feed

- Template: `feed.liquid` → `/feed.xml`
- Content wrapped in `<![CDATA[]]>` to prevent XML parser errors from `<img>` tags inside `<picture>` elements

## UI Components

### Progress Bar (Kickstand Club)
- Background track: `teal-900`
- White progress fill; crosshair marker moves with progress
- Width: `(current / total) * 100` percent
- Currently: 105/120 bikes (87.5%)

### Navigation
- Desktop: `_includes/nav-lg.html` — iterates `{% for item in nav %}`
- Mobile: `_includes/nav-mobile.html` — hamburger toggle via `src/js/navigation.js`
- Nav data: `_data/nav.js` (5 items: Home, About, Programs, How Can I Help, Contact)
