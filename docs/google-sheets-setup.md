# Google Sheets Form Submission Setup

This guide walks you through setting up a Google Apps Script webhook to receive form submissions from the contact form and automatically write them to a Google Sheet.

## Prerequisites

- A Google account
- Access to Google Sheets and Google Apps Script

## Step 1: Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it something like "Contact Form Submissions" or "CBP Contact Form"
3. In the first row, add these column headers:
   - **Timestamp** (Column A)
   - **Name** (Column B)
   - **Email** (Column C)
   - **Phone** (Column D)
   - **Message** (Column E)

4. **Important:** Note the Sheet ID from the URL:
   - The URL will look like: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
   - Copy the `[SHEET_ID]` part - you'll need it for the Apps Script

## Step 2: Create the Google Apps Script

1. In your Google Sheet, go to **Extensions** → **Apps Script**
2. Delete any default code in the editor
3. Copy and paste the following code:

```javascript
/**
 * Web App to receive form submissions and write to Google Sheet
 * 
 * @param {Object} e - Event object containing form data
 * @returns {Object} JSON response
 */
function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Get the active spreadsheet (the one this script is bound to)
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Get current timestamp
    const timestamp = new Date();
    
    // Extract form fields (handle both camelCase and kebab-case field names)
    const name = data.name || data['name'] || '';
    const email = data.email || data['email'] || '';
    const phone = data.phone || data['phone-number'] || data['phone'] || '';
    const message = data.message || data['message'] || '';
    
    // Validate required fields
    if (!name || !email || !message) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Missing required fields: name, email, and message are required'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Append the row to the sheet
    // Format: [Timestamp, Name, Email, Phone, Message]
    sheet.appendRow([
      timestamp,
      name,
      email,
      phone,
      message
    ]);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Form submission received successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function to verify the script works
 * Run this from the Apps Script editor to test
 */
function testSubmission() {
  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '555-1234',
    message: 'This is a test submission'
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}
```

4. Click **Save** (💾 icon) and give your project a name like "Contact Form Handler"

## Step 3: Deploy as Web App

1. In the Apps Script editor, click **Deploy** → **New deployment**
2. Click the gear icon (⚙️) next to "Select type" and choose **Web app**
3. Configure the deployment:
   - **Description:** "Contact Form Webhook v1" (or similar)
   - **Execute as:** Me (your email address)
   - **Who has access:** Anyone (this allows your website to submit to it)
4. Click **Deploy**
5. **Important:** Copy the **Web App URL** - this is your webhook endpoint
   - It will look like: `https://script.google.com/macros/s/[SCRIPT_ID]/exec`
   - You'll need this URL for Step 2 of the migration (updating the form handler)

## Step 4: Authorize the Script (First Time Only)

1. When you first deploy, you'll be prompted to authorize the script
2. Click **Authorize access**
3. Choose your Google account
4. You'll see a warning that the app isn't verified - click **Advanced** → **Go to [Project Name] (unsafe)**
5. Click **Allow** to grant permissions
6. The script needs permission to:
   - View and manage your Google Sheets
   - This is safe since it's your own script

## Step 5: Test the Webhook

You can test the webhook using curl or a tool like Postman:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "555-1234",
    "message": "This is a test message"
  }' \
  [YOUR_WEB_APP_URL]
```

Or test directly in the Apps Script editor:
1. Open the script editor
2. Select the `testSubmission` function from the dropdown
3. Click **Run** (▶️)
4. Check your Google Sheet - you should see a new row with the test data

## Troubleshooting

### Script returns 401 Unauthorized
- Make sure you've authorized the script (Step 4)
- Check that "Who has access" is set to "Anyone"

### Data not appearing in Sheet
- Verify the sheet name matches what the script expects
- Check that column headers are in the first row
- Look at the Apps Script execution log: **View** → **Executions**

### CORS errors in browser
- Google Apps Script web apps handle CORS automatically
- If you see CORS errors, check that you're using the correct Web App URL (not the editor URL)

## Security Considerations

- The webhook URL is public, but it only writes to your specific Google Sheet
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
    const expectedToken = 'YOUR_SECRET_TOKEN_HERE'; // Change this!
    if (data.token !== expectedToken) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Unauthorized'
        }))
        .setMimeType(ContentService.MimeType.JSON);
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
1. Proceed to **Step 2: Form Handler Update + Honeypot Field**
2. The webhook URL will be used to replace the Formspree endpoint in `30-contact.html`

## Notes

- Google Apps Script has execution time limits (6 minutes for web apps)
- Free tier allows up to 20,000 executions per day
- For 1-3 submissions per month, this is more than sufficient
- Submissions are written in real-time to your Google Sheet
- You can set up email notifications in Google Sheets if desired (Tools → Notification rules)

