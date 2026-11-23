# Google Sheets Form Submission Setup

This guide walks you through setting up a Google Apps Script webhook to receive form submissions from the contact form and automatically write them to a Google Sheet.

## ⚠️ Security Warning

**CRITICAL:** The webhook URL you create in Step 3 is a sensitive credential. Anyone with this URL can submit data to your Google Sheet.

- **NEVER commit the webhook URL to version control**
- **NEVER hardcode the URL in your HTML/JavaScript files**
- Store it securely using environment variables or Jekyll data files (see "Storing the Webhook URL Securely" section below)

## Prerequisites

- A Google account
- Access to Google Sheets and Google Apps Script

## Step 1: Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it something like "Contact Form Submissions" or "CBP Contact Form"
3. **Set up email notification (optional):**
   - In cell **B1**, enter your email address where you want to receive notifications
   - Leave B1 empty if you don't want email notifications
   - You can change this anytime without redeploying the script
4. In row 2 (or row 1 if B1 is empty), add these column headers:

   - **Timestamp** (Column A)
   - **Name** (Column B) - Note: If using email notifications, headers start in row 2
   - **Email** (Column C)
   - **Phone** (Column D)
   - **Message** (Column E)

5. **Important:** Note the Sheet ID from the URL:
   - The URL will look like: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
   - Copy the `[SHEET_ID]` part - you'll need it for the Apps Script

**Note:** If you put your email in cell B1, the headers should be in row 2. If B1 is empty, headers can be in row 1.

## Step 2: Create the Google Apps Script

1. In your Google Sheet, go to **Extensions** → **Apps Script**
2. Delete any default code in the editor
3. Copy and paste the full contents of [`docs/google-apps-script-code.js`](google-apps-script-code.js). That file is the source of truth for the deployed script.

4. Click **Save** (💾 icon) and give your project a name like "Contact Form Handler"

## Step 2b: Add the reCAPTCHA secret

The script rejects any submission without a valid reCAPTCHA v2 token. Tokens are single-use, so this also blocks the same submission from being saved twice.

1. In the Apps Script editor, open **Project Settings** (gear icon) → **Script Properties**
2. Add `RECAPTCHA_SECRET` with the reCAPTCHA v2 **secret** key that pairs with the site key in `30-contact.html` (from the reCAPTCHA admin console). Never commit it.
3. Optional: add `LIVE_TEST_TOKEN` with a long random string. The `@live` Playwright test and the `testSubmission` function use it to skip the checkbox. Leave it unset to disable that bypass.

The verification call uses `UrlFetchApp`, which needs the "connect to an external service" permission. The first time you run or redeploy after adding it, Google asks you to re-authorize the script (see Step 4).

**Rollout order matters.** Deploy the website change that sends the token *before* deploying this script. An updated script behind an old page rejects every submission.

## Step 3: Deploy as Web App

1. In the Apps Script editor, click **Deploy** → **New deployment**
2. Click the gear icon (⚙️) next to "Select type" and choose **Web app**
3. Configure the deployment:
   - **Description:** "Contact Form Webhook v1" (or similar)
   - **Execute as:** Me (your email address)
   - **Who has access:** **Anyone** ⚠️ **CRITICAL:** This setting enables CORS automatically. Without it, you'll get CORS errors.
4. Click **Deploy**
5. **⚠️ SECURITY:** Copy the **Web App URL** - this is your webhook endpoint
   - It will look like: `https://script.google.com/macros/s/[SCRIPT_ID]/exec`
   - **DO NOT commit this URL to your repository**
   - Store it securely using one of the methods in the "Storing the Webhook URL Securely" section below
   - You'll need this URL for Step 2 of the migration (updating the form handler)

**Important:** Google Apps Script automatically handles CORS when "Who has access" is set to "Anyone". No manual CORS headers are needed in the code.

## Step 4: Authorize the Script (First Time Only)

1. When you first deploy, you'll be prompted to authorize the script
2. Click **Authorize access**
3. Choose your Google account
4. You'll see a warning that the app isn't verified - click **Advanced** → **Go to [Project Name] (unsafe)**
5. Click **Allow** to grant permissions
6. The script needs permission to:
   - View and manage your Google Sheets
   - This is safe since it's your own script

## Step 5: Configure Email Notifications (Optional)

The script can send email notifications when new submissions arrive.

### Setup Email Notifications

1. In your Google Sheet, go to **cell B1**
2. Enter your email address (e.g., `your-email@gmail.com`)
3. Leave B1 empty if you don't want email notifications
4. You can change this anytime without redeploying the script

### How It Works

- When a new form submission arrives, the script checks cell B1
- If B1 contains a valid email address, it sends a notification email
- The email includes:
  - Submitter's name, email, phone, and message
  - Submission timestamp
  - Reply-to is set to the submitter's email for easy response

### Alternative: Hardcode Email Address

If you prefer to hardcode the email address in the script:

1. Open the Apps Script editor
2. Find the `sendEmailNotification` function
3. Uncomment the line: `// const notificationEmail = 'your-email@gmail.com';`
4. Replace `'your-email@gmail.com'` with your actual email
5. Save and redeploy

**Note:** The cell B1 method is recommended as it's easier to change without redeploying.

## Step 6: Test the Webhook

You can test the webhook using curl or a tool like Postman:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "555-1234",
    "message": "This is a test message",
    "recaptchaToken": "[YOUR_LIVE_TEST_TOKEN]"
  }' \
  [YOUR_WEB_APP_URL]
```

Or test directly in the Apps Script editor:

1. Open the script editor
2. Select the `testSubmission` function from the dropdown
3. Click **Run** (▶️)
4. Check your Google Sheet - you should see a new row with the test data
5. Verify the new row appears at the top (sorted by timestamp)
6. If email notifications are configured, check your inbox for the notification

## Troubleshooting

### Script returns 401 Unauthorized

- Make sure you've authorized the script (Step 4)
- Check that "Who has access" is set to "Anyone"

### Data not appearing in Sheet

- Verify the sheet name matches what the script expects
- Check that column headers are in the correct row (row 1 if B1 is empty, row 2 if B1 has email)
- Look at the Apps Script execution log: **View** → **Executions**

### New submissions not appearing at top

- The sheet should automatically sort by timestamp (newest first) after each submission
- If sorting isn't working, check the execution log for errors
- Verify the Timestamp column (Column A) contains valid dates

### Email notifications not working

- Check that cell B1 contains a valid email address
- Verify the email address format is correct
- Check the Apps Script execution log: **View** → **Executions** for email errors
- Make sure the script has permission to send emails (you'll be prompted on first send)
- Check your spam folder

### CORS errors in browser

- Google Apps Script web apps handle CORS automatically
- If you see CORS errors, check that you're using the correct Web App URL (not the editor URL)

## Storing the Webhook URL Securely

**Never hardcode the webhook URL in your source files.** This project uses GitHub Secrets with Jekyll data files, following the same pattern as Firebase configuration.

### Setup (Already Configured)

The project is already set up to use GitHub Secrets:

1. **Placeholder file exists:** `_data/webhook_config.yml` (with placeholder value)
2. **GitHub Actions workflow** (`.github/workflows/firebase-deploy.yml`) is configured to populate it from secrets
3. **Next step:** Add the `WEBHOOK_URL` secret to your GitHub repository

### Adding the GitHub Secret

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `WEBHOOK_URL`
5. Value: Your Google Apps Script Web App URL (from Step 3 above)
6. Click **Add secret**

The workflow will automatically inject this into `_data/webhook_config.yml` during the build process.

### Using the Webhook URL in Your Code

**In HTML templates (Jekyll/Liquid):**
```html
<form
  action="{{ site.data.webhook_config.webhook_url }}"
  method="POST"
></form>
```

**In client-side JavaScript:**
```html
<script>
  const WEBHOOK_URL = "{{ site.data.webhook_config.webhook_url }}";
</script>
<script>
  // Use in your form handler
  fetch(WEBHOOK_URL, { ... })
</script>
```

### Local Development

For local development, the placeholder value will be used. This is fine for testing the form structure, but submissions won't actually reach your Google Sheet until deployed with the real secret.

## Security Considerations

- The webhook URL is public, but it only writes to your specific Google Sheet
- **Anyone with the URL can submit data** - this is why keeping it private is important
- Consider adding rate limiting or additional validation if you expect high traffic
- The current implementation accepts submissions from anyone with the URL
- For additional security, you could add a simple token check (see Advanced section below)

## Advanced: Adding a Security Token (Optional)

If you want to add an extra layer of security, you can modify the script to require a token:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Check for security token (set this in your form submission)
    const expectedToken = "YOUR_SECRET_TOKEN_HERE"; // Change this!
    if (data.token !== expectedToken) {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: "Unauthorized",
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // ... rest of the code
  } catch (error) {
    // ... error handling
  }
}
```

Then include the token in your form submission (Step 2 will handle this).

## Next Steps

Once you have the Web App URL:

1. **Store the URL securely** using one of the methods above (do not commit it to the repository)
2. Proceed to **Step 2: Form Handler Update + Honeypot Field**
3. The webhook URL will be used to replace the Formspree endpoint in `30-contact.html`
4. Make sure to reference the URL from your secure storage method, not hardcoded

## Notes

- Google Apps Script has execution time limits (6 minutes for web apps)
- Free tier allows up to 20,000 executions per day
- For 1-3 submissions per month, this is more than sufficient
- Submissions are written in real-time to your Google Sheet
- You can set up email notifications in Google Sheets if desired (Tools → Notification rules)
