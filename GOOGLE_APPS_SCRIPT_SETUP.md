# 🔧 คู่มือสร้าง Google Apps Script + Deploy (เวอร์ชันเต็ม)

## 📋 สิ่งที่ต้องเตรียม

| สิ่งที่ต้องมี | สถานะ |
|-----------------|---------|
| Google Account | ✅ มีแล้ว |
| Google Sheet ที่สร้างแล้ว | ✅ มีแล้ว |
| Google Apps Script | ❌ ต้องสร้างใหม่ |

---

## 🚀 ขั้นตอนที่ 1: สร้าง Google Apps Script

### ขั้นตอนที่ 1.1: เปิด Google Sheet

1. **เข้า Google Sheets**
   ```
   https://sheets.google.com/
   ```

2. **เปิด Sheet ที่สร้างไว้**
   - ชื่อ: `XAUUSD Trading Journal`
   - ควรมี column headers 14 คอลัมน์

---

### ขั้นตอนที่ 1.2: เปิด Apps Script

1. **ใน Google Sheet** → คลิกเมนู **Extensions** (ส่วนขยาย)
   
2. **คลิก Apps Script**

3. **จะเปิดแท็บใหม่** สำหรับ Apps Script

---

### ขั้นตอนที่ 1.3: วาง Code

1. **ลบ code เก่าทั้งหมด**
   - Ctrl+A (เลือกทั้งหมด)
   - Delete

2. **วาง code นี้:**

```javascript
// ========================================
// XAUUSD Trading Journal - Google Apps Script
// ========================================

// Web App Handler
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

// Main Request Handler
function handleRequest(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Sheet1') || ss.getSheets()[0];
  
  const action = e.parameter.action || (e.postData ? JSON.parse(e.postData.contents).action : '');
  
  let result = { success: false, data: null, error: null };
  
  try {
    if (action === 'read') {
      result.data = getTrades(sheet);
      result.success = true;
    } else if (action === 'add') {
      const tradeData = JSON.parse(e.postData.contents).data;
      addTrade(sheet, tradeData);
      result.success = true;
      result.data = tradeData;
    } else if (action === 'clear') {
      clearTrades(sheet);
      result.success = true;
    } else {
      result.error = 'Unknown action: ' + action;
    }
  } catch (error) {
    result.error = error.toString();
    console.error('Error:', error);
  }
  
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
  
  return trades.reverse(); // เรียงจากล่าสุด
}

// Add New Trade
function addTrade(sheet, tradeData) {
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
    JSON.stringify(tradeData.checklist || {}),
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
```

3. **บันทึก Code**
   - Ctrl+S หรือ กดไอคอน 💾 (Save)
   - ตั้งชื่อ: `TradingJournal`

---

### ขั้นตอนที่ 1.4: ตรวจสอบ Script

1. **ตรวจสอบว่าไม่มี Error**
   - มุมบนขวา → Run → Run function
   - ควรไม่มี error

2. **ถ้ามี error**
   - อ่านข้อความ error
   - แก้ code
   - บันทึกใหม่

---

## 🚀 ขั้นตอนที่ 2: Deploy เป็น Web App

### ขั้นตอนที่ 2.1: Deploy New

1. **คลิกปุ่ม Deploy** (ด้านขวาบน)
   
2. **เลือก New deployment**

---

### ขั้นตอนที่ 2.2: ตั้งค่า Deployment

**หน้าต่างตั้งค่า:**

```
┌─────────────────────────────────────────────┐
│ Deploy new script                        │
├─────────────────────────────────────────────┤
│ Select type:                             │
│   [Web app ▼]                            │
│                                          │
│ Description:                             │
│   [Trading Journal v1.0             ]     │
│                                          │
│ Execute as:                              │
│   [Me (karn14629@gmail.com) ▼           │
│                                          │
│ Who has access:                           │
│   [Anyone ▼]                             │
│                                          │
│                  [ Deploy ]  [ Cancel ]   │
└─────────────────────────────────────────────┘
```

**ค่าที่ต้องตั้ง:**

| ช่อง | ค่าที่ต้องตั้ง | สำคัญ |
|------|------------------|--------|
| **Select type** | `Web app` | ⚠️ ต้องเลือก Web app |
| **Description** | `Trading Journal v1.0` | อะไรก็ได้ |
| **Execute as** | `Me (your_email@gmail.com)` | ⚠️ ต้องเลือก Me |
| **Who has access** | `Anyone` | ⚠️ **สำคัญมาก!** ต้องเป็น Anyone |

---

### ขั้นตอนที่ 2.3: Authorize Access (ครั้งแรก)

1. **คลิก Deploy**

2. **จะเด้งหน้าต่าง Authorize**
   ```
   Google hasn't verified this app
   Continue?
   ```

3. **คลิก Continue**

4. **เลือก Google Account**
   - เลือก account ของคุณ (karn14629@gmail.com)

5. **หน้าต่าง Google hasn't verified this app**
   - คลิก **Advanced**
   - คลิก **Go to Trading Journal (unsafe)**
   - คลิก **Allow**

---

### ขั้นตอนที่ 2.4: Deployment Complete

1. **รอให้ Deploy เสร็จ**
   - ประมาณ 5-10 วินาที
   - จะแสดง "Deployment complete"

2. **Copy URL**
   - URL จะอยู่ด้านล่าง
   - รูปแบบ: `https://script.google.com/macros/s/ID/exec`
   - **Copy URL นี้ไว้!**

---

## 🔍 ขั้นตอนที่ 3: ตรวจสอบ URL

### URL ที่ควรได้:

```
✅ ถูกต้อง:
https://script.google.com/macros/s/AKfycbyy-GwvAEmOlnXmWM2GVvoCYN7bo2-HC5VgKZjagw4vNPiDVxX3hioKWwze9lbSTcht/exec

❌ ผิด:
https://script.google.com/macros/s/YOUR_ID/dev
https://script.google.com/macros/s/YOUR_ID
```

**ตรวจสอบ:**
1. ลงท้ายด้วย `/exec`
2. ไม่มี `/dev`
3. เป็น URL จาก deployment (ไม่ใช่ editor)

---

## 🔍 ขั้นตอนที่ 4: ทดสอบ URL

### วิธีที่ 1: เปิด URL ใน browser

1. **เปิด URL ใน tab ใหม่**

2. **ดูผลลัพธ์**
   
   **ถ้าสำเร็จ:**
   ```json
   {
     "success": true,
     "data": [],
     "error": null
   }
   ```
   
   **ถ้าผิด:**
   ```json
   {
     "success": false,
     "data": null,
     "error": "ข้อความ error"
   }
   ```

---

### วิธีที่ 2: ใช้ Chrome DevTools

1. **เปิด URL**

2. **กด F12** (เปิด Developer Tools)

3. **คลิก tab Console**

4. **ดู error**

5. **บันทึก error**

---

## ⚠️ ปัญหาที่อาจเกิด

### ปัญหา 1: Failed to fetch

**สาเหตุ:**
- Script ยังไม่ได้ deploy
- URL ผิด
- Who has access ไม่ใช่ Anyone

**วิธีแก้:**
1. Deploy ใหม่
2. Copy URL จาก deployment (ไม่ใช่ editor)
3. Who has access ต้องเป็น Anyone

---

### ปัญหา 2: Script function not found

**สาเหตุ:**
- Code ไม่ถูกต้อง
- ลืมบันทึก code

**วิธีแก้:**
1. ตรวจสอบ code ทั้งหมด
2. บันทึก code (Ctrl+S)
3. Deploy ใหม่

---

### ปัญหา 3: Authorization failed

**สาเหตุ:**
- Script ต้องการ Authorization
- แต่ไม่ได้ allow

**วิธีแก้:**
1. เข้า Apps Script
2. Deploy → Manage deployments
3. คลิก "Edit access"
4. Authorize ใหม่

---

### ปัญหา 4: Who has access เป็น Only myself

**สาเหตุ:**
- ตั้งค่า Who has access ผิด

**วิธีแก้:**
1. Deploy → New deployment
2. Who has access → Anyone
3. Deploy ใหม่

---

## 🎯 Checklist ก่อน Deploy

| ขั้นตอน | เช็ค |
|----------|--------|
| [ ] Google Sheet สร้างแล้ว | |
| [ ] Column headers 14 คอลัมน์ | |
| [ ] Apps Script สร้างแล้ว | |
| [ ] Code วางครบ | |
| [ ] Code บันทึกแล้ว | |
| [ ] Deploy เป็น Web app | |
| [ ] Execute as: Me | |
| [ ] Who has access: Anyone | |
| [ ] Authorize สำเร็จ | |
| [ ] Copy URL ที่มี /exec | |
| [ ] ทดสอบ URL ใน browser | |

---

## 📸 Screenshot ตัวอย่าง

### Google Apps Script Editor:

```
┌────────────────────────────────────────────────────┐
│ TradingJournal - Google Apps Script              │
├────────────────────────────────────────────────────┤
│ [Code.gs] x                                     │
│                                                 │
│ // ========================================== │
│ // XAUUSD Trading Journal - Google Apps Script   │
│ // ========================================== │
│                                                 │
│ function doGet(e) {                              │
│   return handleRequest(e);                        │
│ }                                               │
│                                                 │
│ ...                                             │
│                                                 │
│              [ Run ▼]  [ Debug ▼ ]                │
│                         [ 💾 ] [ Deploy ▼ ]       │
└────────────────────────────────────────────────────┘
```

### Deployment Dialog:

```
┌─────────────────────────────────────────────┐
│ Deploy new script                        │
├─────────────────────────────────────────────┤
│ Select type:                              │
│   [Web app ▼]                             │
│                                           │
│ Description:                               │
│   [Trading Journal v1.0              ]    │
│                                           │
│ Execute as:                                │
│   [Me (karn14629@gmail.com) ▼           │
│                                           │
│ Who has access:                             │
│   [Anyone ▼]  ⭐สำคัญ!                   │
│                                           │
│              [ Deploy ]   [ Cancel ]        │
└─────────────────────────────────────────────┘
```

---

## 💡 เคล็ดลับ

### เคล็ดลับ 1: ทดสอบ Script ก่อน Deploy

```
1. เลือก function จาก dropdown
2. กด Run
3. ดูว่าไม่มี error
```

### เคล็ดลับ 2: ใช้ Version ใน Deployment

```
Description: Trading Journal v1.0, v1.1, v1.2...
```

### เคล็ดลับ 3: Manage Deployments

```
Apps Script → Deploy → Manage deployments
- ดู URL ทั้งหมด
- ลบ deployment เก่า
- Edit access
```

---

## 🚨 สิ่งที่ต้องระวัง

1. **Who has access ต้องเป็น Anyone**
   - ไม่ใช่: Only myself
   - ไม่ใช่: Only people within my organization

2. **URL ต้องลงท้ายด้วย /exec**
   - ไม่ใช่: /dev
   - ไม่ใช่: /edit

3. **Execute as ต้องเป็น Me**
   - ไม่ใช่: User accessing the web app

---

## 🎉 เสร็จแล้ว!

ตอนนี้คุณมี:
- ✅ Google Sheet พร้อมใช้
- ✅ Apps Script พร้อมใช้
- ✅ Web App พร้อมใช้
- ✅ URL ที่ใช้ได้

---

## 📝 ขั้นตอนถัดไป

### ขั้นตอน 1: ใช้ URL

1. เปิด `index-gsheets.html`
2. ใส่ URL ที่ได้
3. กด "เชื่อมต่อ"

---

### ขั้นตอน 2: ทดสอบ

1. บันทึกการเทรด 1 ครั้ง
2. ดูว่าบันทึกสำเร็จ
3. ตรวจสอบใน Google Sheet

---

## 💾 บันทึก URL ไว้

**URL ของคุณ:**
```
https://script.google.com/macros/s/AKfycbyy-GwvAEmOlnXmWM2GVvoCYN7bo2-HC5VgKZjagw4vNPiDVxX3hioKWwze9lbSTcht/exec
```

**บันทึกใน Notepad:**
```
Google Apps Script URL: [URL ที่ได้]
Created: [วันที่]
Version: 1.0
```

---

**สร้างโดย:** Cool (AI Assistant)  
**เวอร์ชัน:** 1.0  
**วันที่:** 2024-01-15

ขอให้ Deploy สำเร็จ! 🚀💰
