const fs = require('fs');
const file = 'src/lib/googleSheetsService.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(
  'if (!projectName || !taskTitle) continue;',
  `if (!projectName || !taskTitle) {
      if (taskTitle === 'Revisi') console.log('[DEBUG] Skipping Revisi due to empty projectName or taskTitle. projectName:', projectName);
      continue;
   }`
);
code = code.replace(
  'const assigneeNamesStr = contributorNamesRaw || picName || "";',
  `const assigneeNamesStr = contributorNamesRaw || picName || "";
   if (taskTitle === 'Revisi' && currentSheetTitle === 'New Sprint 182') console.log('[DEBUG] Revisi reached! assigneeNamesStr:', assigneeNamesStr, 'projectName:', projectName);`
);
fs.writeFileSync(file, code);
