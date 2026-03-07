const { test, expect } = require("@playwright/test");

test("contact form: validation, honeypot, and reCAPTCHA", async ({ page }) => {
  await page.goto("/contact/");

  // Submit button should be disabled initially (no valid input)
  const submitButton = page.locator("#submit-button");
  await expect(submitButton).toBeDisabled();

  // reCAPTCHA widget div is present in DOM
  await expect(page.locator(".g-recaptcha")).toBeAttached();

  // Honeypot container is aria-hidden and input has tabindex=-1 (not user-accessible)
  const honeypotContainer = page.locator('[aria-hidden="true"]:has([name="website-url"])');
  await expect(honeypotContainer).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator('[name="website-url"]')).toHaveAttribute("tabindex", "-1");

  // Fill required fields with valid input
  await page.fill('[name="name"]', "Test User");
  await page.fill('[name="email"]', "test@example.com");
  await page.fill('[name="message"]', "This is a test message long enough.");

  // Submit button should now be enabled
  await expect(submitButton).toBeEnabled();

  // Email validation: replace valid email with invalid one
  await page.fill('[name="email"]', "not-an-email");
  await page.locator('[name="email"]').blur();
  await expect(page.locator("#email-error")).toBeVisible();
});
