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
 */

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
    
    // Append the row to the sheet
    // Format: [Timestamp, Name, Email, Phone, Message]
    sheet.appendRow([
      timestamp,
      name,
      email,
      phone,
      message
    ]);
    
    // Refresh the sheet reference to ensure the new row is available
    SpreadsheetApp.flush();
    
    // Sort sheet by timestamp (newest first - Z to A)
    // Pass the spreadsheet object instead of just the sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    sortSheetByTimestamp(spreadsheet);
    
    // Send email notification if enabled
    sendEmailNotification(name, email, phone, message, timestamp);
    
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
 * Sort the sheet by timestamp column (newest first - Z to A)
 * This ensures new submissions appear at the top of the sheet
 * 
 * @param {Spreadsheet} spreadsheet - The Google Spreadsheet (optional, will get active if not provided)
 */
function sortSheetByTimestamp(spreadsheet) {
  try {
    // Get the spreadsheet and active sheet
    const ss = spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      Logger.log('Error: Could not get active spreadsheet for sorting');
      return;
    }
    
    const activeSheet = ss.getActiveSheet();
    if (!activeSheet) {
      Logger.log('Error: Could not get active sheet for sorting');
      return;
    }
    
    Logger.log('Starting sort. Sheet name: ' + activeSheet.getName());
    
    // Get the data range (assumes header row is in row 1 or 2)
    const lastRow = activeSheet.getLastRow();
    Logger.log('Last row: ' + lastRow);
    
    if (lastRow <= 1) {
      Logger.log('No data to sort (only header row or empty)');
      return; // No data to sort (only header row)
    }
    
    // Check if B1 has an email (indicating headers are in row 2)
    const b1Value = activeSheet.getRange('B1').getValue();
    const hasEmailInB1 = b1Value && b1Value.toString().trim() !== '' && b1Value.toString().includes('@');
    const headerRow = hasEmailInB1 ? 2 : 1;
    const dataStartRow = hasEmailInB1 ? 3 : 2;
    
    Logger.log('Header row: ' + headerRow + ', Data start row: ' + dataStartRow);
    
    // Only sort if we have data rows
    if (lastRow < dataStartRow) {
      Logger.log('Not enough rows to sort. Last row: ' + lastRow + ', Data start: ' + dataStartRow);
      return;
    }
    
    // Get the data range (skip header row)
    const numDataRows = lastRow - headerRow;
    const numColumns = activeSheet.getLastColumn();
    
    Logger.log('Data rows: ' + numDataRows + ', Columns: ' + numColumns);
    
    if (numDataRows <= 0) {
      Logger.log('No data rows to sort');
      return;
    }
    
    const dataRange = activeSheet.getRange(dataStartRow, 1, numDataRows, numColumns);
    
    // Sort by column A (Timestamp) in descending order (Z to A)
    dataRange.sort([{column: 1, ascending: false}]);
    Logger.log('Sheet sorted successfully. Rows sorted: ' + numDataRows);
  } catch (error) {
    // Log error but don't fail the submission
    Logger.log('Error sorting sheet: ' + error.toString());
    Logger.log('Error stack: ' + (error.stack || 'No stack trace'));
  }
}

/**
 * Send email notification when a new form submission is received
 * 
 * Email recipient can be configured in two ways:
 * 1. Set in cell B1 of the sheet (recommended - easy to change)
 * 2. Hardcode the email address in the NOTIFICATION_EMAIL constant below
 * 
 * To disable email notifications, leave cell B1 empty or set NOTIFICATION_EMAIL to empty string
 * 
 * @param {string} name - Submitter's name
 * @param {string} email - Submitter's email
 * @param {string} phone - Submitter's phone number
 * @param {string} message - Submission message
 * @param {Date} timestamp - Submission timestamp
 */
function sendEmailNotification(name, email, phone, message, timestamp) {
  try {
    // Option 1: Get email from cell B1 of the sheet (recommended)
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const notificationEmail = sheet.getRange('B1').getValue();
    
    // Option 2: Hardcode email address here (uncomment and set your email)
    // const notificationEmail = 'your-email@gmail.com';
    
    // If no email is configured, skip notification
    if (!notificationEmail || notificationEmail.toString().trim() === '') {
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(notificationEmail.toString().trim())) {
      Logger.log('Invalid notification email address in cell B1: ' + notificationEmail);
      return;
    }
    
    // Format timestamp
    const formattedDate = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'MMMM dd, yyyy hh:mm a');
    
    // Build email subject
    const subject = 'New Contact Form Submission: ' + name;
    
    // Build email body
    const body = 'You have received a new contact form submission:\n\n' +
      'Name: ' + name + '\n' +
      'Email: ' + email + '\n' +
      'Phone: ' + (phone || 'Not provided') + '\n' +
      'Submitted: ' + formattedDate + '\n\n' +
      'Message:\n' + message + '\n\n' +
      '---\n' +
      'This is an automated notification from your contact form.';
    
    // Send email
    MailApp.sendEmail({
      to: notificationEmail.toString().trim(),
      subject: subject,
      body: body,
      replyTo: email // Reply-to set to submitter's email for easy response
    });
    
    Logger.log('Email notification sent to: ' + notificationEmail);
  } catch (error) {
    // Log error but don't fail the submission
    Logger.log('Error sending email notification: ' + error.toString());
  }
}

/**
 * Test function to verify the script works
 * Run this from the Apps Script editor to test locally
 */
function testSubmission() {
  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '555-1234',
    message: 'This is a test submission'
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

