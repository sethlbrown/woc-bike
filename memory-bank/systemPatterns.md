# System Patterns: Carbondale Bike Project Website

## System Architecture

- Static site generated with Jekyll, using Liquid templates and Markdown content.
- Tailwind CSS for utility-first styling; custom CSS is minimal.
- Alpine.js available for lightweight interactivity (not heavily used).
- Gulp used for asset pipeline: compiles Tailwind, minifies CSS, runs Jekyll, and serves with Browsersync.
- Hosted on Firebase Hosting for fast, global delivery.

## Key Technical Decisions

- Use of inline SVGs for social and payment icons to avoid heavy icon font dependencies.
- WebP image optimization for performance; original and WebP images are committed to the repo.
- Responsive layouts using Tailwind's grid and flex utilities.
- Donation integration via embeddable PayPal iframe and Venmo links.
- Navigation and footer are modular includes for easy updates.

## Design Patterns

- Layouts: `base.html` and `default.html` provide the main structure; content pages extend these.
- Includes: Navigation, header, footer, banners, and donation components are in `_includes/` for reuse.
- Sections: Homepage and other pages use container divs with consistent max-width, padding, and responsive breakpoints.
- Accessibility: Focus on color contrast, keyboard navigation, and semantic HTML.

## Component Relationships

- Header includes navigation and logo.
- Footer includes contact info, social links, and legal.
- Donation components are included where needed (homepage, donate page, etc.).
- Stories and news are presented as content blocks within main sections.
