# Tech Context: Carbondale Bike Project Website

## Technologies Used

- **Jekyll**: Static site generator (Markdown, Liquid templates)
- **Tailwind CSS**: Utility-first CSS framework
- **Gulp**: Task runner for asset pipeline (Tailwind, Autoprefixer, minification, Browsersync)
- **Node.js & npm**: For JS dependencies and build scripts
- **Ruby & Bundler**: For Jekyll and gem dependencies
- **Firebase Hosting**: Production hosting
- **Google Apps Script**: Webhook backend for contact form submissions
- **Google Sheets**: Storage for contact form submissions

## Development Setup

- Install Ruby, Bundler, Node.js, and npm
- `bundle install` to install Ruby gems
- `npm ci` to install npm packages
- `npm run start` or `npm run dev` for local development with Browsersync
- `npm run build:production` for production build

## Technical Constraints

- Static site: No server-side code or dynamic backend
- All images must be optimized and WebP versions generated/committed
- Accessibility and performance are high priorities
- Cache busting for CSS requires manual filename/version changes

## Dependencies

- Jekyll, Bundler, Ruby
- Tailwind CSS, Autoprefixer
- Gulp, Browsersync
- Firebase CLI (for deployment)

## External Services

- **Firebase (Hosting + web SDK)**: Production hosting and client-side Firebase SDK initialization.
  - Config (apiKey, projectId, etc.) is loaded from Jekyll data (`site.data.firebase_config`) and injected via `_includes/firebase-init.html`.
  - **This config is intentionally public**: Firebase’s web client config (including `apiKey`) is designed to be exposed in the browser; it identifies the project and is not a secret. Security is enforced by Firebase Security Rules and Auth, not by hiding the config. No GitHub Secret is required for it; keeping it in a committed data file is the intended pattern for static sites.
- **Google Sheets & Apps Script**: Contact form submission backend
  - Webhook URL stored as GitHub Secret (`WEBHOOK_URL`)
  - Injected into `_data/webhook_config.yml` during build
  - Form submissions write to Google Sheet with timestamps
- **Google reCAPTCHA v3**: Spam protection (existing integration)
