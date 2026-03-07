---
id: 9
group: "eleventy-setup"
dependencies: [4, 5, 6, 7, 8]
status: "pending"
created: "2026-03-06"
skills: ["playwright", "e2e-testing"]
---
# Add Playwright End-to-End Tests

## Objective
Create a Playwright test suite that verifies critical site behavior and serves as a regression safety net for the migration. Tests run in CI via the `npm test` command.

## Skills Required
- `playwright`: `playwright.config.js` setup, page tests, element assertions
- `e2e-testing`: Test organization, critical path coverage, web server integration

## Acceptance Criteria
- [ ] `playwright.config.js` at project root configured for `http://localhost:8080` with `webServer` that auto-starts `npm run dev`
- [ ] `tests/e2e/` directory created with test files
- [ ] All five pages return HTTP 200 with correct `<title>` values
- [ ] Navigation: desktop nav links render and resolve to correct URLs; mobile menu toggle opens/closes
- [ ] Contact form: required field validation triggers for empty name, email, message; honeypot field not visible to users; reCAPTCHA div present; submit button present
- [ ] Kickstand Club progress bar: element renders; `aria-label` or descriptive text present; width indicates progress
- [ ] Donate section: PayPal embed and Venmo link elements present on homepage
- [ ] Homepage sections: stories section, donation section, testimonials section render
- [ ] `npm test` passes locally with the Eleventy dev server running
- [ ] CI workflow (Task 8) can run `npm test` with headless Chromium

## Technical Requirements
- Playwright tests use `@playwright/test` (already in `package.json` from Task 2)
- `playwright.config.js` uses `webServer` to start `npm run dev` before tests and stop after — avoid requiring a manually running server for CI
- Use Chromium only for CI (fastest, most compatible); can use all browsers locally
- `tests/e2e/` directory structure; one or two test files covering all pages and critical flows
- Tests should be resilient: use role-based locators (`getByRole`, `getByLabel`) and text-based selectors where possible, not brittle CSS class selectors (especially important since CSS classes will change in Phase 2)
- Screenshot on failure is automatically enabled in Playwright

**Meaningful Test Strategy (apply these guidelines):**
- Focus on: user-visible behavior, critical flows, form validation logic
- Do NOT test: Tailwind class names (will change), exact HTML structure, third-party widget internals (PayPal, reCAPTCHA)
- Combine related assertions into fewer tests: one test verifies all contact form validation behaviors, not separate tests per field
- Test the honeypot field is not user-visible (position, opacity, or aria-hidden) rather than asserting its CSS class

## Input Dependencies
- Task 4: Layouts and includes migrated — site renders complete pages
- Task 5: All content pages verified building
- Task 6: Responsive images working
- Task 7: `npm run dev` and `npm run build:production` working
- Task 8: `npm test` script defined in `package.json`

## Output Artifacts
- `playwright.config.js` at project root
- `tests/e2e/site.spec.js` (or split into `pages.spec.js`, `navigation.spec.js`, `contact.spec.js`)

## Implementation Notes

<details>
<summary>Detailed implementation guide</summary>

**`playwright.config.js`:**
```javascript
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:8080',
    screenshot: 'only-on-failure',
    video: 'off'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});
```

**`tests/e2e/pages.spec.js`** — page load and section presence:
```javascript
const { test, expect } = require('@playwright/test');

const pages = [
  { url: '/', title: 'Home | Carbondale Bike Project' },
  { url: '/about/', title: 'About | Carbondale Bike Project' },
  { url: '/programs/', title: 'Our Programs | Carbondale Bike Project' },
  { url: '/how-can-i-help/', title: 'How Can I Help | Carbondale Bike Project' },
  { url: '/contact/', title: 'Contact | Carbondale Bike Project' }
];

for (const { url, title } of pages) {
  test(`${url} loads with correct title`, async ({ page }) => {
    await page.goto(url);
    await expect(page).toHaveTitle(title);
  });
}

test('homepage renders stories, donation, and testimonials sections', async ({ page }) => {
  await page.goto('/');
  // Assert key sections exist (use text content or landmark roles, not CSS classes)
  await expect(page.getByText('Kickstand Club')).toBeVisible();
  await expect(page.getByText(/Venmo/i).or(page.getByText(/PayPal/i))).toBeVisible();
});

test('programs page renders responsive images', async ({ page }) => {
  await page.goto('/programs/');
  const images = page.locator('picture img');
  await expect(images.first()).toBeVisible();
});
```

**`tests/e2e/navigation.spec.js`:**
```javascript
const { test, expect } = require('@playwright/test');

test('desktop nav links resolve to correct pages', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about/');
  await expect(page.getByRole('link', { name: 'Programs' })).toHaveAttribute('href', '/programs/');
  await expect(page.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact/');
});

test('mobile menu toggle opens and closes', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  // Find mobile menu button (hamburger)
  const menuButton = page.getByRole('button', { name: /menu|navigation/i });
  await menuButton.click();
  // Mobile nav links visible
  await expect(page.getByRole('link', { name: 'About' }).first()).toBeVisible();
});
```

**`tests/e2e/contact.spec.js`:**
```javascript
const { test, expect } = require('@playwright/test');

test('contact form validation and spam protection', async ({ page }) => {
  await page.goto('/contact/');

  // Submit without filling fields — submit button should be disabled
  const submitButton = page.getByRole('button', { name: 'Submit' });
  await expect(submitButton).toBeDisabled();

  // reCAPTCHA widget present
  await expect(page.locator('.g-recaptcha')).toBeAttached();

  // Honeypot field not visible to users
  const honeypot = page.locator('[name="website-url"]');
  await expect(honeypot).not.toBeVisible();

  // Fill required fields
  await page.fill('[name="name"]', 'Test User');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="message"]', 'This is a test message with enough characters.');

  // After valid input, submit button should be enabled
  await expect(submitButton).toBeEnabled();

  // Email validation: clear and type invalid email
  await page.fill('[name="email"]', 'not-an-email');
  await page.locator('[name="email"]').blur();
  await expect(page.locator('#email-error')).toBeVisible();
});
```

**Notes:**
- The `webServer` config uses `npm run dev` which starts the Eleventy server on port 8080. In CI, `reuseExistingServer` is `false` so Playwright always starts a fresh server.
- The reCAPTCHA script loads from `https://www.google.com/recaptcha/api.js` — in CI without internet access this may fail. Test presence of the `.g-recaptcha` div rather than the loaded widget.
- Don't test form submission to Google Sheets (requires live webhook URL, not appropriate for automated tests).
</details>
