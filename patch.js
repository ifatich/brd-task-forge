const fs = require('fs');
const file = 'src/lib/googleSheetsService.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace('if (existingTask) {', `if (existingTask) {
          if (taskTitle === 'Revisi') console.log('[SYNC DEBUG] Updating Revisi in sheet: ' + currentSheetTitle);`);
fs.writeFileSync(file, code);
