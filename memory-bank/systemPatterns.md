# System Patterns: Carbondale Bike Project Website

## System Architecture

- Static site generated with Jekyll, using Liquid templates and Markdown content.
- Tailwind CSS for styling
- Minimal JavaScript for interactivity
- Gulp used for asset pipeline: compiles Tailwind, minifies CSS, runs Jekyll, and serves with Browsersync.
- Hosted on Firebase Hosting for fast, global delivery.

## Key Technical Decisions

- Use of inline SVGs for social and payment icons to avoid heavy icon font dependencies.
- WebP image optimization for performance; original and WebP images are committed to the repo.
- Responsive layouts using Tailwind's grid and flex utilities.
- Donation integration via embeddable PayPal iframe and Venmo links.
- Navigation and footer are modular includes for easy updates.
- Firebase is initialized from Jekyll data (`_data/firebase_config`) in `_includes/firebase-init.html`; web client config is public by design and does not require GitHub Secrets.

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

## Development Workflow

- Feature branches follow `feature-[feature-description]` naming convention
- Always start from clean `main` branch with latest remote changes
- Verify clean build before creating feature branch
- See `.cursor/rules/dev-workflow.mdc` for complete workflow details

## Form Submission Architecture

- **Contact Form (`30-contact.html`):**
  - Client-side validation with real-time feedback
  - Honeypot field (`website-url`) for spam protection
  - Submits JSON data to Google Apps Script webhook
  - Uses `text/plain` content type to bypass CORS preflight
  - Webhook URL stored securely via GitHub Secrets → Jekyll data file (`_data/webhook_config.yml`)
  
- **Google Apps Script Backend:**
  - Webhook receives POST requests from contact form
  - Parses JSON data (sent as `text/plain` to avoid CORS)
  - Validates required fields (name, email, message)
  - Writes submissions to Google Sheet with timestamp
  - Returns JSON response with success/error status
  
- **Security:**
  - Webhook URL never committed to repository
  - Injected during build via GitHub Actions
  - Honeypot field silently rejects bot submissions
  - Google reCAPTCHA v3 also integrated (existing)

## UI Components

### Progress Bar

- Used in the Kickstand Club section to show donation progress
- Features:
  - Background track in teal-900
  - White progress indicator
  - Crosshair marker that moves with progress
  - Percentage-based width calculation (current/total \* 100)
  - Responsive design that maintains proportions
  - Accessible text display of current progress
