# CLAUDE.md - Working with Carbondale Bike Project Website

## Project Overview
This is the website for the Carbondale Bike Project (CBP), a community bicycle shop and educational program in Carbondale, Colorado. The site supports CBP's mission to increase individual, community, environmental, and global health through sustainable cycling programs.

## Tech Stack & Architecture
- **Jekyll**: Static site generator with Liquid templates and Markdown content
- **Tailwind CSS v4.1.13**: Utility-first CSS framework for styling (upgraded Sept 2024)
- **Gulp**: Asset pipeline (compiles Tailwind, minifies CSS, runs Jekyll, serves with Browsersync)
- **Node.js 20+ & npm**: JavaScript dependencies and build scripts
- **Ruby & Bundler**: Jekyll and gem dependencies
- **Firebase Hosting**: Production hosting platform
- **Google Apps Script**: Webhook backend for contact form submissions
- **Google Sheets**: Storage for contact form submissions
- **Google reCAPTCHA v3**: Spam protection on contact form

## Build Commands
- `npm run build:production` - Production build
- `npm run build:dev` - Development build
- `npm run dev` - Start development server with browser-sync
- `npm run start` - Alias for dev command

## Development Setup
1. Install Ruby, Bundler, Node.js, and npm
2. `bundle install` - Install Ruby gems
3. `npm ci` - Install npm packages
4. `npm run start` or `npm run dev` - Local development with Browsersync
5. `npm run build:production` - Production build

## Project Structure
- Jekyll-based static site with Tailwind CSS
- Content in Markdown/HTML files at root level
- Templates in `_includes` and `_layouts` directories
- Assets in `assets` directory
- `memory-bank/` - Project context and documentation

## Style Guidelines
- Use Tailwind CSS for styling with utility-first approach
- Maintain responsive design patterns (mobile-first)
- Follow consistent HTML structure in templates
- Use inline SVGs for icons instead of external icon fonts
- Prioritize accessibility and performance
- Maintain clean, semantic HTML markup
- Optimize images (WebP versions committed to repo)

## Key Features & Components
- **Donation Integration**: PayPal embeddable campaign card and Venmo links
- **Progress Tracking**: Visual progress bar for Kickstand Club (120-bike goal; currently 105 bikes funded, 87.5%)
- **Stories Section**: Latest news and community stories (two-column layout alongside donation section)
- **Contact Form**: Submits to Google Sheets via Google Apps Script webhook; includes honeypot spam protection and client-side validation
- **Modular Navigation**: Header and footer as reusable includes
- **Responsive Design**: Mobile-friendly layouts with Tailwind utilities

## Working with Content
- Edit Markdown files for content changes
- Use YAML front matter for page metadata
- Config settings in `_config.yml`
- Site data in `_data` directory
- Update donation progress in relevant data files

## Technical Constraints
- Static site: No server-side code or dynamic backend
- All images must be optimized (WebP versions generated/committed)
- Cache busting for CSS requires manual filename/version changes
- Accessibility and performance are high priorities

## Current Focus Areas
- Homepage layout and UX improvements
- Donation integration styling and functionality
- Responsive design and accessibility enhancements
- Content updates for programs and community stories

## External Services

- **Firebase Hosting**: Production hosting. Web client config (`apiKey`, `projectId`, etc.) is loaded from `_data/firebase_config` and injected via `_includes/firebase-init.html`. This config is **intentionally public** — Firebase security is enforced by Firebase Security Rules and Auth, not by hiding the config. No GitHub Secret needed.
- **Google Apps Script**: Webhook backend that receives contact form POST requests, validates required fields, and writes submissions (timestamp, name, email, phone, message) to a Google Sheet.
- **Google Sheets**: Storage for all contact form submissions.
- **Google reCAPTCHA v3**: Existing spam protection integration on the contact form.

## Contact Form Architecture

Form located in `30-contact.html`.

- **Client-side validation**: Required fields (name, email, message), email format, phone format (optional), message length (max 2000 chars). Real-time feedback; errors shown only after user interacts with field.
- **Honeypot field**: Hidden `website-url` field silently rejects bot submissions.
- **Submission**: Sends JSON as `text/plain` content type to bypass CORS preflight.
- **Webhook URL**: Never committed to repo. Stored as GitHub Secret (`WEBHOOK_URL`) and injected into `_data/webhook_config.yml` during GitHub Actions build.
- **Backend**: Google Apps Script validates and writes to Google Sheet; returns JSON success/error response.

## Design Patterns

- **Layouts**: `base.html` and `default.html` provide main structure; content pages extend these.
- **Includes**: Navigation, header, footer, banners, and donation components are in `_includes/` for reuse.
- **Firebase init**: `_includes/firebase-init.html`
- **Sections**: Container divs with consistent max-width, padding, and responsive Tailwind breakpoints.
- **Accessibility**: Color contrast, keyboard navigation, semantic HTML.

### Progress Bar Component (Kickstand Club)
- Background track: `teal-900`
- White progress indicator
- Crosshair marker that moves with progress
- Percentage-based width: `(current / total) * 100`
- Accessible text display of current progress

## Feature Branch Workflow

For each new feature:

1. `git checkout main`
2. `git pull origin main`
3. Verify build: `npm ci && npm run build:dev && npm run build`
4. `git checkout -b feature-[description]` (e.g., `feature-google-sheets-integration`)
5. Make minimal, focused changes
6. Verify build again before committing
7. Push and open PR; GitHub Actions validates build/deploy
8. Merge when green; verify production

One feature per branch. Keep changes focused.

## Analytics

**Fathom Analytics was removed on 2025-09-16.** No client-side analytics are currently active.

### Previous Fathom implementation (for reference)
- Loader in `_includes/head.html`: `<script src="https://cdn.usefathom.com/script.js" data-site="SZUUKHTD" defer></script>`
- Event calls:
  - Donate clicks: `onclick="fathom.trackEvent('donate button');"` in `_includes/donate-button.html` and `00-index.html`
  - Form submission: `fathom.trackEvent("contact form submitted");` in `30-contact.html` success paths

### To re-enable Fathom
1. Add loader (+ optional `<link rel="dns-prefetch" href="https://cdn.usefathom.com">`) to `_includes/head.html`
2. Add `onclick="fathom.trackEvent('donate button');"` to donate CTAs in `_includes/donate-button.html` and `00-index.html`
3. Add `fathom.trackEvent("contact form submitted");` in `then(...)` success branches in `30-contact.html`
4. Optionally: centralize via `/assets/js/analytics.js` with `addEventListener` instead of inline `onclick`

## Current Project Status

- **Kickstand Club**: 105 bikes funded out of 120-bike goal (87.5%)
- **Contact form**: Fully migrated from Formspree to Google Sheets backend
- **Homepage**: Two-column Latest Stories + donation layout
- **Deployment**: Stable on Firebase Hosting
- **Analytics**: None active (Fathom removed)
- **CSS cache busting**: Requires manual filename/version change

## Tailwind CSS v4 Migration (September 2024)

### ✅ Successfully Upgraded from v3.4.17 to v4.1.13

**Performance Improvements Achieved:**
- Development builds: 73% faster (2.55s → 0.70s)
- Production builds: 15% faster (1.56s → 1.32s)
- CSS processing: 49% faster (378ms → 191ms)

### Key Lessons Learned

**1. Always Use Official Migration Tools First**
- ❌ **DON'T**: Attempt manual configuration migration
- ✅ **DO**: Use `npx @tailwindcss/upgrade` for version upgrades
- The official tool handles complex PostCSS integration, template updates, and configuration migration automatically

**2. Tailwind v4 Architecture Changes**
- **Configuration**: Moved from JavaScript (`tailwind.config.js`) to CSS-based (`@theme` blocks)
- **CSS Imports**: Replaced `@tailwind` directives with `@import "tailwindcss"` + `@plugin` syntax
- **PostCSS Integration**: Uses separate `@tailwindcss/postcss` package (no longer bundled)
- **Content Detection**: Improved automatic scanning, less manual configuration needed

**3. Breaking Changes to Watch For**
- `border-opacity-*` utilities deprecated → use `border-transparent` or color transparency
- Some utility class renames (e.g., `flex-grow` → `grow`, `flex-shrink` → `shrink`)
- PostCSS-import incompatibility → remove from configuration
- Browser support: Requires Safari 16.4+, Chrome 111+, Firefox 128+

**4. Migration Strategy That Worked**
1. Create dedicated upgrade branch (`upgrade/tailwind-v4`)
2. Commit clean snapshot before starting
3. Run official upgrade tool: `npx @tailwindcss/upgrade`
4. Test builds and verify styling
5. Clean up any unnecessary changes
6. Commit with detailed changelog

**5. Troubleshooting PostCSS Issues**
- If seeing "Missing field 'negated' on ScannerOptions.sources" error:
  - Ensure using `@tailwindcss/postcss` package (not direct tailwindcss)
  - Remove postcss-import from configuration
  - Use official upgrade tool instead of manual config

**6. Custom Theme Preservation**
- ✅ Custom colors, spacing, fonts preserved correctly
- ✅ `@tailwindcss/forms` and `@tailwindcss/typography` plugins compatible
- ✅ Responsive breakpoints and utilities work as expected
- ✅ Custom CSS layers and components unaffected

### Current Tailwind v4 Configuration

**CSS-based theme configuration** in `src/stylev3.css`:
```css
@import "tailwindcss";
@plugin "@tailwindcss/forms";
@plugin "@tailwindcss/typography";

@theme {
  --font-sans: 'Avenir Next', Helvetica, Arial, sans-serif;
  --color-teal-400: #46B0B7;
  --color-teal-500: #25A2AA;
  --color-teal-700: #1B7C83;
  --spacing-1: 4.5px;
  /* ... other custom variables */
}
```

**Simplified JavaScript config** in `tailwind.config.js`:
```javascript
module.exports = {
  content: [
    './_includes/**/*.html',
    './_layouts/**/*.html',
    './*.{html,md}',
    './assets/js/**/*.js'
  ]
}
```

### Future Upgrade Considerations
- Node.js 20+ required for Tailwind v4
- Monitor plugin compatibility for future releases
- Official upgrade tool should handle most migration complexity
- Always test in staging environment before production deployment