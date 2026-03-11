// ========================================
// XAUUSD Trading Journal - Google Apps Script (FIXED)
// ========================================

// Web App Handler
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

// Main Request Handler (FIXED)
function handleRequest(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Sheet1') || ss.getSheets()[0];
  
  // ✅ FIX: เช็คว่า e และ e.parameter มีอยู่ก่อน
  const hasParameter = e && e.parameter && typeof e.parameter === 'object';
  const hasPostData = e && e.postData && e.postData.contents;
  
  let action = '';
  let data = null;
  
  try {
    if (hasPostData) {
      // POST request - มี body
      const parsed = JSON.parse(e.postData.contents);
      action = parsed.action;
      data = parsed.data;
    } else if (hasParameter) {
      // GET request - มี parameter
      action = e.parameter.action || '';
      data = e.parameter.data ? JSON.parse(e.parameter.data) : null;
    } else {
      // Default - ถ้าไม่มีทั้ง parameter และ postData
      action = 'read';
      data = null;
    }
  } catch (parseError) {
    console.error('Error parsing request:', parseError);
    let result = { 
      success: false, 
      data: null, 
      error: 'Invalid request format: ' + parseError.toString(),
      debug: {
        hasParameter: hasParameter,
        hasPostData: hasPostData,
        parameter: hasParameter ? JSON.stringify(e.parameter) : undefined,
        postData: hasPostData ? e.postData.contents.substring(0, 100) : undefined
      }
    };
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  let result = { success: false, data: null, error: null };
  
  try {
    if (action === 'read') {
      result.data = getTrades(sheet);
      result.success = true;
    } else if (action === 'add') {
      addTrade(sheet, data);
      result.success = true;
      result.data = data;
    } else if (action === 'clear') {
      clearTrades(sheet);
      result.success = true;
    } else {
      result.error = 'Unknown action: ' + action;
    }
  } catch (error) {
    result.error = error.toString();
    console.error('Error in handleRequest:', error);
  }
  
  console.log('Request completed:', action, result.success);
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// Get All Trades
function getTrades(sheet) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const trades = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const trade = {};
    
    for (let j = 0; j < headers.length; j++) {
      trade[headers[j]] = row[j];
    }
    
    trades.push(trade);
  }
  
  console.log('Loaded', trades.length, 'trades');
  return trades.reverse(); // เรียงจากล่าสุด
}

// Add New Trade
function addTrade(sheet, tradeData) {
  if (!tradeData) {
    throw new Error('Trade data is required');
  }
  
  const row = [
    tradeData.id || generateId(),
    tradeData.date,
    tradeData.time,
    tradeData.direction,
    tradeData.entry,
    tradeData.sl,
    tradeData.tp,
    tradeData.result,
    tradeData.pips,
    tradeData.reason,
    tradeData.emotion,
    tradeData.checklist ? JSON.stringify(tradeData.checklist) : '{}',
    tradeData.notes,
    new Date().toISOString()
  ];
  
  sheet.appendRow(row);
  console.log('Trade added:', tradeData.id);
}

// Clear All Trades
function clearTrades(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
    console.log('Cleared trades from row 2 to', lastRow);
  }
}

// Generate Unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ========================================
// Test Functions (สำหรับ Test)
// ========================================

function testRead() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Sheet1') || ss.getSheets()[0];
  const trades = getTrades(sheet);
  console.log('Test read:', trades.length, 'trades');
  return trades;
}

function testAdd() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Sheet1') || ss.getSheets()[0];
  
  const testTrade = {
    id: generateId(),
    date: '2024-01-15',
    time: '10:30',
    direction: 'Long',
    entry: 2645.50,
    sl: 2640.00,
    tp: 2655.50,
    result: 'Win',
    pips: 100,
    reason: 'Test Trade',
    emotion: 'Happy',
    checklist: { signal: true, sl: true, tp: true, rr: true },
    notes: 'Test data'
  };
  
  addTrade(sheet, testTrade);
  console.log('Test trade added:', testTrade.id);
  return testTrade;
}
