const fs = require('fs');
const path = './src/lib/googleSheetsService.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace('const assigneeNames = assigneeNamesStr.split(",").map(s => s.trim()).filter(Boolean);', 'const assigneeNames = assigneeNamesStr.split(",").map((s: string) => s.trim()).filter(Boolean);');
code = code.replace('const subTaskData = {', 'const subTaskData: any = {');

fs.writeFileSync(path, code);
