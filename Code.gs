const SPREADSHEET_ID = '1VF5lwNf2SrvN3MwWhtIAG_00WSTKx4Q0zjkODs8Ah6k';

function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('Trades');
  if (!sheet) {
    // ถ้ายังไม่มีชีตชื่อ Trades ให้ลองหาชีตแรก ถ้าไม่มีค่อยสร้างใหม่
    sheet = ss.getSheets()[0];
    if (!sheet) {
      sheet = ss.insertSheet('Trades');
      sheet.appendRow([
        'ID', 'Date', 'Time', 'Direction', 'Entry', 
        'SL', 'TP', 'Result', 'Pips', 'Reason', 
        'Emotion', 'Checklist', 'Notes', 'CreatedAt'
      ]);
    }
  }
  return sheet;
}

function doGet(e) {
  if (!e) {
    return ContentService.createTextOutput("โปรดนำโค้ดนี้ไป Deploy เป็น Web App (เว็บแอป) โค้ดนี้ไม่สามารถกดปุ่ม 'เรียกใช้' (Run) จากหน้านี้ได้โดยตรงครับ");
  }
  const action = e.parameter.action;
  
  if (action === 'read') {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    
    // ถ้ามีแต่หัวตาราง หรือตารางว่าง
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ success: true, data: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // แปลงชื่อคอลัมน์ให้อยู่ในรูปแบบตัวพิมพ์เล็กทั้งหมด เพื่อให้ทำงานเข้ากันกับหน้าเว็บได้อย่างสมบูรณ์
    const headers = data[0].map(h => String(h).toLowerCase().trim());
    const rows = data.slice(1);
    
    const tz = Session.getScriptTimeZone();
    
    const trades = rows.map(row => {
      let trade = { checklist: {} };
      headers.forEach((header, index) => {
        let value = row[index];
        
        // จัดการเรื่อง Date/Time ที่อ่านมาจาก Sheet ซึ่งมักจะเป็น Object ให้กลายเป็น String รูปแบบที่เว็บต้องการ
        if (value instanceof Date) {
          if (header.toLowerCase() === 'time') {
            // บังคับแปลงเวลาที่ได้จาก Sheet ด้วย GMT เสมอเพื่อกันเวลากระโดดตาม Timezone ของ Server
            value = Utilities.formatDate(value, 'GMT', 'HH:mm');
          } else {
            value = Utilities.formatDate(value, tz, 'yyyy-MM-dd');
          }
        } else if (header.toLowerCase() === 'date' && typeof value === 'string') {
          // เผื่อกรณีมันดึงมาเป็นข้อความ 2/27/2026 เปลี่ยนเป็น 2026-02-27
          try {
             let d = new Date(value);
             if(!isNaN(d)) value = Utilities.formatDate(d, tz, 'yyyy-MM-dd');
          } catch(e) {}
        } else if (header.toLowerCase() === 'time' && typeof value === 'string') {
           // กรณีเวลาได้มาเป็นสตริง เช่น 17:45 หรือ 17.45
           value = value.replace('.', ':');
           if(value.length === 5 || value.length === 4) {
             // Let it be
           } else {
             try {
               let d = new Date("1970-01-01T" + value);
               if(!isNaN(d)) value = Utilities.formatDate(d, tz, 'HH:mm');
             } catch(e) {}
           }
        }
        
        if (header.startsWith('chk_')) {
          const key = header.split('_')[1];
          trade.checklist[key] = value === true || value === 'TRUE' || value === 'true';
        } else {
          trade[header] = value;
        }
      });
      return trade;
    });
    
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: trades }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  if (!e) {
    return ContentService.createTextOutput("โปรดนำโค้ดนี้ไป Deploy เป็น Web App (เว็บแอป) โค้ดนี้ไม่สามารถกดปุ่ม 'เรียกใช้' (Run) จากหน้านี้ได้โดยตรงครับ");
  }
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    const data = postData.data;
    
    const sheet = getSheet();
    
    if (action === 'add') {
      const rowData = [
        data.id || '',
        data.date || '',
        data.time || '',
        data.direction || '',
        data.entry || '',
        data.sl || '',
        data.tp || '',
        data.result || '',
        data.pips || 0,
        data.reason || '',
        data.emotion || '',
        data.checklist || '',
        data.notes || '',
        new Date().toISOString()
      ];
      sheet.appendRow(rowData);
      
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'clear') {
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        // ลบข้อมูลทั้งหมดเว้นแต่หัวตาราง
        sheet.deleteRows(2, lastRow - 1);
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Invalid action POST' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
