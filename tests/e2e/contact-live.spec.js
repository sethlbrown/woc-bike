const { test, expect } = require("@playwright/test");

// Live end-to-end test: submits the real contact form to the real Google Apps
// Script webhook, which appends a row to the production Google Sheet.
//
// Excluded from `npm test` (see grepInvert in playwright.config.js).
// Run with:
//   WEBHOOK_URL=<apps-script-url> LIVE_TEST_TOKEN=<token> npm run test:live
//
// LIVE_TEST_TOKEN must match the LIVE_TEST_TOKEN script property in the Apps
// Script. The webhook accepts it in place of a solved reCAPTCHA checkbox.
//
// After it passes, check the sheet for the row containing the printed marker,
// then delete that row.

test(
  "contact form: live submission reaches Google Sheet",
  { tag: "@live" },
  async ({ page }) => {
    test.skip(
      !process.env.WEBHOOK_URL,
      "WEBHOOK_URL is not set. The dev server needs it to render the form's webhook.",
    );
    test.skip(
      !process.env.LIVE_TEST_TOKEN,
      "LIVE_TEST_TOKEN is not set. The webhook rejects submissions without a reCAPTCHA token.",
    );

    const marker = `e2e-${new Date().toISOString()}`;

    await page.goto("/contact/");

    // Playwright reuses an already-running dev server locally. If that server
    // was started without WEBHOOK_URL, the page has an empty webhook.
    const pageWebhook = await page.evaluate(() => WEBHOOK_URL);
    expect(
      pageWebhook,
      "The contact page has no webhook URL. Stop any running dev server and rerun so it starts with WEBHOOK_URL.",
    ).not.toBe("");

    await page.fill('[name="name"]', "E2E Test");
    await page.fill('[name="email"]', "e2e-test@example.com");
    await page.fill(
      '[name="message"]',
      `Automated test submission from Playwright. Safe to delete. Marker: ${marker}`,
    );

    await expect(page.locator("#submit-button")).toBeEnabled();

    // Stand in for ticking the checkbox: the widget stores its token in this
    // hidden field, and the webhook accepts LIVE_TEST_TOKEN as a valid token.
    const tokenField = page.locator('[name="g-recaptcha-response"]');
    await tokenField.waitFor({ state: "attached" });
    await tokenField.evaluate((el, token) => {
      el.value = token;
    }, process.env.LIVE_TEST_TOKEN);

    // Apps Script answers the POST with a 302 to script.googleusercontent.com,
    // which serves the JSON body. Wait for that final 200 response.
    const webhookResponse = page.waitForResponse(
      (resp) =>
        /script\.google(usercontent)?\.com/.test(resp.url()) &&
        resp.status() === 200,
    );

    await page.locator("#submit-button").click();

    // The page shows "Thanks" for any 2xx, so check the script's own verdict.
    // It returns success: true only after appendRow() has run.
    const body = await (await webhookResponse).json();
    expect(body, `Apps Script error: ${body.error}`).toMatchObject({
      success: true,
    });

    await expect(page.locator("#my-form-status")).toContainText(
      "Thanks for your submission!",
    );

    test.info().annotations.push({ type: "sheet-marker", description: marker });
    console.log(
      [
        "",
        "  ✅ Submission accepted by the webhook.",
        "  👉 Check the Google Sheet for a row from \"E2E Test\" whose message contains:",
        `     ${marker}`,
        "     Then delete that row.",
        "",
      ].join("\n"),
    );
  },
);
