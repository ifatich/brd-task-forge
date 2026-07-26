import { google } from "googleapis";
import { prisma } from "./db";

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

import { sortSprints } from "./sprint-utils";

export async function syncFromSheets(spreadsheetId: string, sheetName: string = "ALL") {
  try {
    let sprintSheets: { title: string; num: number }[] = [];
    if (sheetName === "ALL") {
      const doc = await sheets.spreadsheets.get({ spreadsheetId });
      sprintSheets = doc.data.sheets
        ?.map((s) => s.properties?.title || "")
        .filter((t) => /sprint/i.test(t) || /^\d+/.test(t))
        .map((title) => ({ title, num: parseInt(title.match(/\d+/)?.[0] || "0", 10) }))
        .filter((s) => s.num >= 170 && s.num < 500) // Between 170 and 500
        .sort((a, b) => a.num - b.num) || [];
    } else {
      sprintSheets = [{ title: sheetName, num: 999 }];
    }

    if (sprintSheets.length === 0) {
      return { success: true, message: `No valid sprint sheets found.` };
    }

    const ranges = sprintSheets.map((s) => `'${s.title}'!A2:X`);
    const batchResponse = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
    });

    const valueRanges = batchResponse.data.valueRanges || [];


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
        
        const assigneeNames = assigneeNamesStr.split(",").map((s: string) => s.trim()).filter(Boolean);
        const assigneeMemberIds = [];

        for (const aName of assigneeNames) {
          let assigneeMember = await prisma.teamMember.findFirst({
            where: { name: aName }
          });
          if (!assigneeMember) {
            assigneeMember = await prisma.teamMember.create({
              data: {
                id: `tm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
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
              status: currentGroupName.toLowerCase().includes("backlog") ? "backlog" : "active",
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
        const subTaskData: any = {
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
    if (sheetName === "ALL" && sprintSheets.length > 0) {
      const allSprintTitles = sprintSheets.map(s => s.title);
      const sortedAllSprints = sortSprints(allSprintTitles);
      const latestSprintName = sortedAllSprints[0];
      const allActiveProjects = await prisma.project.findMany({
        where: { status: { in: ["active", "backlog"] } }
      });

      for (const p of allActiveProjects) {
        let pSprints: string[] = [];
        try { pSprints = JSON.parse(p.sprints); } catch (e) { }

        if (!pSprints.includes(latestSprintName)) {
          await prisma.project.update({
            where: { id: p.id },
            data: { status: "completed" }
          });
        }
      }

      // --- Sync Active Members from Dropdown ---
      try {
        const docWithGrid = await sheets.spreadsheets.get({
          spreadsheetId,
          ranges: [`${latestSprintName}!U6:U20`], // Column U is Assignee (index 20)
          includeGridData: true,
        });

        let activeMemberNames: string[] = [];
        const gridSheet = docWithGrid.data.sheets?.[0];
        const gridRowData = gridSheet?.data?.[0]?.rowData;

        if (gridRowData) {
          for (const row of gridRowData) {
            const cell = row.values?.[0];
            if (cell?.dataValidation?.condition?.type === "ONE_OF_LIST") {
              activeMemberNames = cell.dataValidation.condition.values?.map(v => v.userEnteredValue || "").filter(Boolean) || [];
              break; // found the assignee dropdown!
            }
          }
        }

        if (activeMemberNames.length > 0) {
          // Deactivate everyone first
          await prisma.teamMember.updateMany({
            data: { isActive: false }
          });

          // Upsert each active member
          for (const name of activeMemberNames) {
            const existing = await prisma.teamMember.findFirst({ where: { name } });
            if (existing) {
              await prisma.teamMember.update({
                where: { id: existing.id },
                data: { isActive: true }
              });
            } else {
              await prisma.teamMember.create({
                data: {
                  id: `tm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                  name,
                  role: "member",
                  isActive: true
                }
              });
            }
          }
        }
      } catch (e) {
        console.error("Error syncing active team members:", e);
      }
    }

    const allTasks = await prisma.task.findMany({ select: { id: true } });
    const tasksToArchive = allTasks.filter(t => !upsertedTaskIds.has(t.id));

    let archivedCount = 0;
    // Batch update to avoid SQLite variable limits
    const BATCH_SIZE = 500;
    for (let i = 0; i < tasksToArchive.length; i += BATCH_SIZE) {
      const batchIds = tasksToArchive.slice(i, i + BATCH_SIZE).map(t => t.id);
      const res = await prisma.task.updateMany({
        where: { id: { in: batchIds } },
        data: { status: "archived" }
      });
      archivedCount += res.count;
    }

    return {
      success: true,
      message: `Sync successful for ${sprintSheets.length} sprints. Created ${createdProjects} groups, upserted ${upsertedTasks} projects, and ${upsertedSubTasks} tasks. Archived ${archivedCount} obsolete items.`,
    };
  } catch (error) {
    console.error("Error syncing from Google Sheets:", error);
    throw new Error("Failed to sync from Google Sheets.");
  }
}

export interface TaskSheetData {
  projectName: string;
  title: string;
  goalsStatus: string;
  estimatedHours: number;
  assigneeName: string;
  contributors?: string;
  brd?: string;
  figmaUrl?: string;
}

export async function createTaskInSheet(spreadsheetId: string, taskData: TaskSheetData) {
  try {
    const newRow: any[] = new Array(23).fill("");
    newRow[0] = taskData.projectName;
    newRow[1] = taskData.title;
    newRow[2] = taskData.goalsStatus;
    newRow[18] = taskData.estimatedHours.toString();
    newRow[19] = taskData.assigneeName;
    newRow[20] = taskData.contributors || "";
    newRow[21] = taskData.brd || "";
    newRow[22] = taskData.figmaUrl || "";

    const doc = await sheets.spreadsheets.get({ spreadsheetId });
    const sprintSheets = doc.data.sheets
      ?.map((s) => s.properties?.title || "")
      .filter((t) => /sprint/i.test(t) || /^\d+/.test(t))
      .map((title) => ({ title, num: parseInt(title.match(/\d+/)?.[0] || "0", 10) }))
      .sort((a, b) => a.num - b.num) || [];
    const activeSheetName = sprintSheets.length > 0 ? sprintSheets[sprintSheets.length - 1].title : "New Sprint 181";

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${activeSheetName}!B:X`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [newRow] },
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error appending task to sheet:", error);
    throw new Error("Failed to create task in Google Sheets.");
  }
}

export async function updateTaskStatusInSheet(spreadsheetId: string, rowNumber: number, newStatus: string) {
  try {
    const doc = await sheets.spreadsheets.get({ spreadsheetId });
    const sprintSheets = doc.data.sheets
      ?.map((s) => s.properties?.title || "")
      .filter((t) => /sprint/i.test(t) || /^\d+/.test(t))
      .map((title) => ({ title, num: parseInt(title.match(/\d+/)?.[0] || "0", 10) }))
      .sort((a, b) => a.num - b.num) || [];
    const activeSheetName = sprintSheets.length > 0 ? sprintSheets[sprintSheets.length - 1].title : "New Sprint 181";

    const cellRange = `${activeSheetName}!D${rowNumber}`;
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: cellRange,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[newStatus]] },
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error updating task status at row ${rowNumber}:`, error);
    throw new Error("Failed to update task status in Google Sheets.");
  }
}
