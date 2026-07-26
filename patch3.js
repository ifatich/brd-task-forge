const fs = require('fs');
const file = 'src/lib/googleSheetsService.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(
  `if (!projectName || !taskTitle) {
      if (taskTitle === 'Revisi') console.log('[DEBUG] Skipping Revisi due to empty projectName or taskTitle. projectName:', projectName);
      continue;
   }`,
  `if (!projectName || !taskTitle) {
      if (taskTitle === 'Revisi') require('fs').appendFileSync('sync-debug.log', '[DEBUG] Skipping Revisi due to empty projectName or taskTitle. projectName: ' + projectName + '\\n');
      continue;
   }`
);
code = code.replace(
  `if (taskTitle === 'Revisi' && currentSheetTitle === 'New Sprint 182') console.log('[DEBUG] Revisi reached! assigneeNamesStr:', assigneeNamesStr, 'projectName:', projectName);`,
  `if (taskTitle === 'Revisi' && currentSheetTitle === 'New Sprint 182') require('fs').appendFileSync('sync-debug.log', '[DEBUG] Revisi reached! assigneeNamesStr: ' + assigneeNamesStr + ' projectName: ' + projectName + '\\n');`
);
fs.writeFileSync(file, code);
