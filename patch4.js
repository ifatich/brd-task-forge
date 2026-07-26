const fs = require('fs');
const file = 'src/lib/googleSheetsService.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(
  'for (const sheetName of sheetTitles) {',
  `require('fs').appendFileSync('sync-debug.log', '[DEBUG] Processing sheets: ' + JSON.stringify(sheetTitles) + '\\n');
   for (const sheetName of sheetTitles) {`
);
fs.writeFileSync(file, code);
