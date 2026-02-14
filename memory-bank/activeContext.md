# Active Context: Carbondale Bike Project Website

## Current Work Focus

- Contact form is fully migrated from Formspree to Google Sheets backend
- Form includes honeypot spam protection and client-side validation
- Google Apps Script webhook handles form submissions securely

## Recent Changes

- **Contact Form Migration (Completed):**
  - Migrated contact form from Formspree to Google Sheets
  - Implemented Google Apps Script webhook for form submissions
  - Added honeypot field (`website-url`) for bot spam protection
  - Implemented comprehensive client-side form validation:
    - Required field validation (name, email, message)
    - Email format validation
    - Phone number format validation (optional field)
    - Message length validation (max 2000 characters)
    - Real-time validation with visual feedback (red outlines, error messages)
    - Validation errors only show after user interaction (touched fields)
  - Secure webhook URL storage via GitHub Secrets and Jekyll data files
  - Resolved CORS issues by using `text/plain` content type (bypasses preflight)
  - Form submissions write directly to Google Sheet with timestamps
- Updated Kickstand Club progress to show 105 bikes funded out of 120 goal (87.5% completion)
- Established standardized feature branch workflow (see `.cursor/rules/dev-workflow.mdc`)
- Refactored the homepage to feature a two-column 'Latest Stories' and donation section.
- Removed drop shadow from the PayPal iframe for a cleaner look.
- Rolled back previous UX changes to the Kickstarter/donation section.
- General cleanup of navigation and section spacing.

## Next Steps

- Monitor form submissions in Google Sheet
- Continue refining homepage layout for clarity and engagement.
- Review and update other key pages (programs, about) for consistency.
- Ensure all donation and contact methods are clear and accessible.
- Update memory bank as new patterns or decisions emerge.

## Active Decisions and Considerations

- Use inline SVGs for icons instead of external icon fonts for performance.
- Prioritize accessibility and mobile responsiveness in all new changes.
- Keep donation call-to-action visible but not overwhelming.
