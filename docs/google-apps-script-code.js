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
 * @returns {Object} Response with CORS headers
 */
function doOptions() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '3600'
    });
}

/**
 * Main handler for POST requests from the contact form
 * 
 * @param {Object} e - Event object containing form data in e.postData.contents
 * @returns {Object} JSON response with success status and CORS headers
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
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders({
          'Access-Control-Allow-Origin': '*'
        });
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
    
    // Return success response with CORS headers
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Form submission received successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*'
      });
      
  } catch (error) {
    // Return error response with CORS headers
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*'
      });
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
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}

