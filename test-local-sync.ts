import { prisma } from "./src/lib/db";
import { google } from "googleapis";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: `'New Sprint 182'!A1:Z` });
  const rows = res.data.values || [];
  
  let isBacklogSection = false;
  let lastProjectName = "";

  for (const row of rows) {
    const rawColA = row[0]?.trim() || "";
    const rawColB = row[1]?.trim() || "";

    const colA = rawColA;
    let projectName = rawColB;

    if (projectName) {
      if (projectName !== lastProjectName) {
        isBacklogSection = false;
      }
      lastProjectName = projectName;
    } else if (lastProjectName) {
      projectName = lastProjectName;
    }

    const taskTitle = row[2]?.trim() || "";
    
    if (projectName === "RIPLAY BRI" && taskTitle === "Revisi") {
      console.log(`[LOCAL] Found Revisi! row[0]: ${row[0]}, row[1]: ${row[1]}, row[2]: ${row[2]}`);
      
      const goalsStatus = row[3]?.trim() || "";
      const taskStatusRaw = row[4]?.trim() || ""; 
      const estimatedHoursRaw = row[19]?.trim() || "";
      const picName = row[20]?.trim() || "";
      const contributorNamesRaw = row[21]?.trim() || "";
      
      const assigneeNamesStr = contributorNamesRaw || picName || "";

      if (!projectName || !taskTitle) {
        console.log(`[LOCAL] Skipped because missing project/title`);
        continue;
      }

      console.log(`[LOCAL] Passed project/title check. assigneeNamesStr: "${assigneeNamesStr}"`);
      
      const project = await prisma.project.findFirst({ where: { title: "RIPLAY BRI" } });
      const existingTask = await prisma.task.findFirst({
        where: { projectId: project?.id, title: taskTitle },
      });
      
      if (existingTask) {
        console.log(`[LOCAL] Found existingTask in DB: ${existingTask.id}`);
        let tSprints: string[] = [];
        try { tSprints = JSON.parse(existingTask.sprints); } catch (e) { }
        console.log(`[LOCAL] Sprints before: ${JSON.stringify(tSprints)}`);
        
        if (!tSprints.includes("New Sprint 182")) {
          tSprints.push("New Sprint 182");
          console.log(`[LOCAL] Pushed New Sprint 182! Sprints after: ${JSON.stringify(tSprints)}`);
        } else {
          console.log(`[LOCAL] Sprints ALREADY included New Sprint 182!`);
        }
      } else {
        console.log(`[LOCAL] existingTask NOT found in DB!`);
      }
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
