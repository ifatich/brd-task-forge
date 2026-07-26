const fs = require('fs');
const path = './src/lib/googleSheetsService.ts';
let code = fs.readFileSync(path, 'utf8');

// The new parser did NOT include upsertedSubTasks in the return message!
// It returns:
// message: `Sync successful for ${sprintSheets.length} sprints. Created ${createdProjects} projects, upserted ${upsertedTasks} tasks. Archived ${archivedCount} obsolete tasks.`
// Let's modify the message to include subTasks.

code = code.replace(
  /\`Sync successful for \$\{sprintSheets.length\} sprints. Created \$\{createdProjects\} projects, upserted \$\{upsertedTasks\} tasks. Archived \$\{archivedCount\} obsolete tasks.\`/,
  '\`Sync successful for ${sprintSheets.length} sprints. Created ${createdProjects} groups, upserted ${upsertedTasks} projects, and ${upsertedSubTasks} tasks. Archived ${archivedCount} obsolete items.\`'
);

fs.writeFileSync(path, code);
