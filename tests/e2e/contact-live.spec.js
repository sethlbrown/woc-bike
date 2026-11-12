const { test, expect } = require("@playwright/test");

// Live end-to-end test: submits the real contact form to the real Google Apps
// Script webhook, which appends a row to the production Google Sheet.
//
// Excluded from `npm test` (see grepInvert in playwright.config.js).
// Run with: WEBHOOK_URL=<apps-script-url> npm run test:live
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
