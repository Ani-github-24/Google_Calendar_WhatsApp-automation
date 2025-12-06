const API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');

const SECRET_TOKEN = PropertiesService.getScriptProperties().getProperty('SECRET_TOKEN'); 

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // SECURITY CHECK: Verify the "Handshake"
    if (data.token !== SECRET_TOKEN) {
      return ContentService.createTextOutput("Error: 403 Forbidden");
    }

    // If token matches, proceed
    processMessage(data.text);
    return ContentService.createTextOutput("Success");
    
  } catch (error) {
    return ContentService.createTextOutput("Error: " + error.message);
  }
}
/
function processMessage(text) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Ask Gemini
  const prompt = `
    Analyze this WhatsApp message. 
    1. Summarize it in 10 words. 
    2. Extract the deadline date (YYYY-MM-DD). If none, write "None".
    
    Message: ${text}
    Output format: Summary | Date
  `;
  
  const aiResponse = callGemini(prompt);
  const [summary, date] = aiResponse.split("|");
  
  // Save to Sheet
  sheet.appendRow([new Date(), text, summary.trim(), date.trim()]);
  
  // Add to Calendar
  if (date.trim() !== "None") {
    CalendarApp.getDefaultCalendar().createAllDayEvent("Deadline: " + summary.trim(), new Date(date.trim()));
  }
}


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
  return json.candidates[0].content.parts[0].text;
}
