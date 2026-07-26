const fs = require('fs');
const path = './src/lib/googleSheetsService.ts';
let code = fs.readFileSync(path, 'utf8');

// Replace the hardcoded status logic
code = code.replace(
  'status: kanbanStatus === "todo" ? "backlog" : "active",',
  'status: currentGroupName.toLowerCase().includes("backlog") ? "backlog" : "active",'
);

fs.writeFileSync(path, code);
