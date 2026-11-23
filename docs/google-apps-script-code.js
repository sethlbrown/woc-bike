/**
 * Google Apps Script Web App for Contact Form Submissions
 * 
 * This script receives POST requests from the contact form and writes
 * submissions to a Google Sheet.
 * 
 * ⚠️ SECURITY WARNING:
 * The Web App URL generated when you deploy this script is a sensitive credential.
 * Anyone with this URL can submit data to your Google Sheet.
 * 
 * - NEVER commit the Web App URL to version control
 * - NEVER hardcode the URL in your HTML/JavaScript files
 * - Store it securely using environment variables or Jekyll data files
 * - See docs/google-sheets-setup.md for secure storage methods
 * 
 * Setup Instructions:
 * 1. Create a Google Sheet with headers: Timestamp, Name, Email, Phone, Message
 * 2. Open Extensions → Apps Script in your Google Sheet
 * 3. Paste this code into the editor
 * 4. Save the project
 * 5. Deploy as Web App (Deploy → New deployment → Web app)
 * 6. Set "Who has access" to "Anyone"
 * 7. Copy the Web App URL and store it securely (see security warning above)
 * 8. Use the stored URL in your form handler (do not hardcode it)
 *
 * reCAPTCHA verification (required):
 * 9. Project Settings (gear icon) → Script Properties → add:
 *      RECAPTCHA_SECRET = the reCAPTCHA v2 *secret* key for the site key
 *                         used in 30-contact.html (from the reCAPTCHA admin
 *                         console). Never commit it.
 *      LIVE_TEST_TOKEN  = (optional) a long random string. Lets the @live
 *                         Playwright test submit without solving the
 *                         checkbox. Leave unset to disable that bypass.
 * 10. Deploy → Manage deployments → edit the existing deployment → Version:
 *     New version → Deploy. Editing the existing deployment keeps the same
 *     Web App URL, so the WEBHOOK_URL secret does not change.
 *
 * Every submission must carry a reCAPTCHA token. Tokens are single-use, so a
 * repeated POST of the same submission is rejected by Google's siteverify.
 */

/**
 * Check a reCAPTCHA v2 token with Google.
 *
 * @param {string} token - The g-recaptcha-response value sent by the form
 * @returns {boolean} True if Google says the token is valid
 */
function verifyRecaptcha(token) {
  if (!token) {
    return false;
  }

  const props = PropertiesService.getScriptProperties();

  const liveTestToken = props.getProperty('LIVE_TEST_TOKEN');
  if (liveTestToken && token === liveTestToken) {
    return true;
  }

  const secret = props.getProperty('RECAPTCHA_SECRET');
  if (!secret) {
    // Fail closed: without the secret nothing can be verified.
    console.error('RECAPTCHA_SECRET script property is not set');
    return false;
  }

  const response = UrlFetchApp.fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'post',
    payload: { secret: secret, response: token },
    muteHttpExceptions: true
  });
  const result = JSON.parse(response.getContentText());
  if (!result.success) {
    console.warn('reCAPTCHA rejected: ' + JSON.stringify(result['error-codes'] || []));
  }
  return result.success === true;
}

/**
 * Handle CORS preflight requests (OPTIONS)
 * Required for cross-origin requests from web browsers
 * 
 * @returns {Object} Empty response to satisfy preflight
 */
function doOptions() {
  return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Main handler for POST requests from the contact form
 * 
 * Note: Google Apps Script web apps automatically handle CORS when deployed
 * with "Who has access" set to "Anyone". The doOptions() function handles preflight.
 * 
 * @param {Object} e - Event object containing form data in e.postData.contents
 * @returns {Object} JSON response with success status
 */
function doPost(e) {
  try {
    // Parse incoming JSON data (sent as text/plain to avoid CORS preflight)
    var data = {};
    
    if (e.postData && e.postData.contents) {
      // Parse JSON from postData contents
      // Content-Type will be text/plain, but body contains JSON string
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter && Object.keys(e.parameter).length > 0) {
      // Fallback: handle form-encoded data if needed
      data = {
        name: e.parameter.name || '',
        email: e.parameter.email || '',
        phone: e.parameter.phone || e.parameter['phone-number'] || '',
        message: e.parameter.message || ''
      };
    }
    
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

    // Reject submissions without a valid, unused reCAPTCHA token
    if (!verifyRecaptcha(data.recaptchaToken)) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Please check the "I\'m not a robot" box and try again.'
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
 * Run this from the Apps Script editor to test locally
 */
function testSubmission() {
  // Needs the LIVE_TEST_TOKEN script property; otherwise reCAPTCHA rejects it.
  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '555-1234',
    message: 'This is a test submission',
    recaptchaToken: PropertiesService.getScriptProperties().getProperty('LIVE_TEST_TOKEN')
  };
  
  // Test with JSON format
  const mockEventJson = {
    postData: {
      contents: JSON.stringify(testData),
      type: 'application/json'
    }
  };
  
  Logger.log('Testing JSON format:');
  const resultJson = doPost(mockEventJson);
  Logger.log(resultJson.getContent());
  
  // Test with form-encoded format
  const mockEventForm = {
    parameter: {
      name: 'Test User Form',
      email: 'testform@example.com',
      'phone-number': '555-5678',
      message: 'This is a form-encoded test submission'
    }
  };
  
  Logger.log('Testing form-encoded format:');
  const resultForm = doPost(mockEventForm);
  Logger.log(resultForm.getContent());
}

