//Keys
const API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
const SECRET_TOKEN = PropertiesService.getScriptProperties().getProperty('SECRET_TOKEN');

// The Gemini 1.5 Flash Endpoint
const MODEL_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

//webhook listener

function doPost(e) {
  try {
    // Parse incoming JSON
    const data = JSON.parse(e.postData.contents);
    
    // Security check
    if (data.token !== SECRET_TOKEN) {
      return ContentService.createTextOutput("Error: 403 Forbidden - Invalid Token");
    }

    // If token matches, process
    processMessage(data.text);
    return ContentService.createTextOutput("Success");
    
  } catch (error) {
    return ContentService.createTextOutput("Error: " + error.message);
  }
}

/**
 * 3. Core Logic: AI Processing & Calendar Booking
 */
function processMessage(text) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // prompt
  const prompt = `
    Analyze this WhatsApp message regarding an academic task. 
    1. Summarize the task in strictly under 10 words. 
    2. Extract the deadline date in YYYY-MM-DD format. If no date is found, write "None".
    
    Message: ${text}
    Output format: Summary | Date
  `;
  
  // Call Gemini API
  const aiResponse = callGemini(prompt);
  const [summary, date] = aiResponse.split("|");
  
  // Log to Google Sheet
  sheet.appendRow([new Date(), text, summary.trim(), date.trim()]);
  
  // Create calendar event if date
  if (date && date.trim() !== "None") {
    CalendarApp.getDefaultCalendar().createAllDayEvent(
      "Deadline: " + summary.trim(), 
      new Date(date.trim())
    );
  }
}

//function to call Gemini REST API
function callGemini(prompt) {
  const payload = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  };

  const response = UrlFetchApp.fetch(`${MODEL_URL}?key=${API_KEY}`, options);
  const json = JSON.parse(response.getContentText());
  
  // Extract text from Gemini response structure
  return json.candidates[0].content.parts[0].text;
}
