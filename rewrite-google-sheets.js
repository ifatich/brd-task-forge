const fs = require('fs');
const path = './src/lib/googleSheetsService.ts';
let code = fs.readFileSync(path, 'utf8');

const replacement = `
    let createdProjects = 0;
    let upsertedTasks = 0;
    let upsertedSubTasks = 0;
    const upsertedTaskIds = new Set<string>();

    for (let i = 0; i < sprintSheets.length; i++) {
      const currentSheetTitle = sprintSheets[i].title;
      const rows = valueRanges[i]?.values;
      if (!rows || rows.length === 0) continue;

      let currentGroupName = "Uncategorized";
      let currentTaskName = "";
      let projectsMadeActiveInThisSheet = new Set<string>();

      for (const row of rows) {
        const rawColA = row[0]?.trim() || "";
        const rawColB = row[1]?.trim() || "";
        const rawColC = row[2]?.trim() || "";

        // 1. DETEKSI GROUP (Prisma Project)
        if (rawColA !== "" && rawColC === "") {
          currentGroupName = rawColB;
          continue;
        }

        // 2. DETEKSI TASK (Prisma Task)
        if (rawColB !== "") {
          currentTaskName = rawColB;
        }

        // 3. DETEKSI SUBTASK (Prisma SubTask)
        if (rawColC === "") {
          continue; // skip rows without subtasks
        }

        const subTaskTitle = rawColC;
        const goalsStatus = row[3]?.trim() || "";
        const taskStatusRaw = row[4]?.trim() || "To Do";
        
        const estimatedHoursRaw = row[19]?.trim() || "0";
        const picName = row[20]?.trim() || "";
        const contributorNamesRaw = row[21]?.trim() || "";

        // Parse Bobot (Estimated Hours)
        let estimatedHours = 0;
        const parsedHours = parseFloat(estimatedHoursRaw);
        if (!isNaN(parsedHours)) estimatedHours = parsedHours;

        // Parse Assignee
        let assigneeNamesStr = contributorNamesRaw;
        if (!assigneeNamesStr) assigneeNamesStr = picName;
        
        const assigneeNames = assigneeNamesStr.split(",").map(s => s.trim()).filter(Boolean);
        const assigneeMemberIds = [];

        for (const aName of assigneeNames) {
          let assigneeMember = await prisma.teamMember.findFirst({
            where: { name: aName }
          });
          if (!assigneeMember) {
            assigneeMember = await prisma.teamMember.create({
              data: {
                id: \`tm_\${Date.now()}_\${Math.random().toString(36).substring(2, 7)}\`,
                name: aName,
                role: "member",
                isActive: false
              }
            });
          }
          assigneeMemberIds.push(assigneeMember.id);
        }

        // Kanban Status
        const tsLower = taskStatusRaw.toLowerCase();
        let kanbanStatus = "todo";
        if (tsLower === "on progress" || tsLower === "in progress") kanbanStatus = "in-progress";
        else if (tsLower === "done") kanbanStatus = "done";

        // 4. UPSERT PROJECT (Group)
        let project = await prisma.project.findFirst({
          where: { title: currentGroupName },
        });

        if (!project) {
          project = await prisma.project.create({
            data: {
              title: currentGroupName,
              status: kanbanStatus === "todo" ? "backlog" : "active",
              sprints: JSON.stringify([currentSheetTitle])
            },
          });
          createdProjects++;
        } else {
          let pSprints = [];
          try { pSprints = JSON.parse(project.sprints); } catch (e) { }
          if (!pSprints.includes(currentSheetTitle)) pSprints.push(currentSheetTitle);
          pSprints = sortSprints(pSprints);

          project = await prisma.project.update({
            where: { id: project.id },
            data: {
              sprints: JSON.stringify(pSprints)
            }
          });
        }

        projectsMadeActiveInThisSheet.add(project.id);

        // 5. UPSERT TASK (Project Column B)
        if (!currentTaskName) continue;

        let task = await prisma.task.findFirst({
          where: { projectId: project.id, title: currentTaskName },
        });

        let isCarryOver = false;
        let tSprints = [currentSheetTitle];

        if (task) {
          try { tSprints = JSON.parse(task.sprints); } catch (e) { }
          if (!tSprints.includes(currentSheetTitle)) {
            tSprints.push(currentSheetTitle);
            isCarryOver = true;
          }
          tSprints = sortSprints(tSprints);

          task = await prisma.task.update({
            where: { id: task.id },
            data: {
              estimatedHours, // update with latest subtask bobot
              status: kanbanStatus,
              sprints: JSON.stringify(tSprints),
              isCarryOver: isCarryOver || task.isCarryOver
            }
          });
          upsertedTaskIds.add(task.id);
        } else {
          task = await prisma.task.create({
            data: {
              projectId: project.id,
              title: currentTaskName,
              estimatedHours,
              status: kanbanStatus,
              sprints: JSON.stringify([currentSheetTitle]),
              isCarryOver: false
            },
          });
          upsertedTasks++;
          upsertedTaskIds.add(task.id);
        }

        // 6. UPSERT SUBTASK (Subtask Column C)
        let subTask = await prisma.subTask.findFirst({
          where: { taskId: task.id, title: subTaskTitle },
        });

        const goalsArr = goalsStatus ? [goalsStatus] : [];
        const subTaskData = {
          title: subTaskTitle,
          taskId: task.id,
          goals: JSON.stringify(goalsArr),
          done: kanbanStatus === "done",
          assignee: assigneeNamesStr
        };

        if (assigneeMemberIds.length > 0) {
          subTaskData.assigneeId = assigneeMemberIds[0];
        }

        if (subTask) {
          await prisma.subTask.update({
            where: { id: subTask.id },
            data: subTaskData
          });
        } else {
          await prisma.subTask.create({
            data: subTaskData
          });
          upsertedSubTasks++;
        }
      }
    }
`;

// we need to replace from `let createdProjects = 0;` down to `upsertedTasks++; } }`
const startIndex = code.indexOf('    let createdProjects = 0;');
const endIndex = code.indexOf('    if (sheetName === "ALL" && sprintSheets.length > 0) {');

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
  fs.writeFileSync(path, code);
  console.log("Replaced successfully!");
} else {
  console.log("Could not find boundaries.");
}
