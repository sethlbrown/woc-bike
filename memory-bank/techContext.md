# Tech Context: Carbondale Bike Project Website

## Technologies Used

- **Jekyll**: Static site generator (Markdown, Liquid templates)
- **Tailwind CSS**: Utility-first CSS framework
- **Gulp**: Task runner for asset pipeline (Tailwind, Autoprefixer, minification, Browsersync)
- **Node.js & npm**: For JS dependencies and build scripts
- **Ruby & Bundler**: For Jekyll and gem dependencies
- **Firebase Hosting**: Production hosting

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
- Alpine.js
- Gulp, Browsersync
- Firebase CLI (for deployment)
