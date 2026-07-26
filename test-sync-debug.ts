import { prisma } from "./src/lib/db";
import { sortSprints } from "./src/lib/sprint-utils";
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

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'New Sprint 182'!A1:Z",
  });
  const rows = res.data.values || [];

  let lastProjectName = "";

  for (const row of rows) {
    const rawColA = row[0]?.trim() || "";
    const rawColB = row[1]?.trim() || "";
    let projectName = rawColB;

    if (projectName) {
      lastProjectName = projectName;
    } else if (lastProjectName) {
      projectName = lastProjectName;
    }

    const taskTitle = row[2]?.trim() || "";
    if (projectName === "RIPLAY BRI" && (taskTitle === "Review" || taskTitle === "Revisi" || taskTitle.startsWith("Present"))) {
      console.log(`\nFound row: ${taskTitle}`);
      
      const project = await prisma.project.findFirst({ where: { title: "RIPLAY BRI" } });
      if (!project) continue;

      const existingTask = await prisma.task.findFirst({
        where: { projectId: project.id, title: taskTitle },
      });

      if (existingTask) {
        console.log(`  Found existing task: ${existingTask.id}`);
        console.log(`  Current sprints: ${existingTask.sprints}`);
        let tSprints: string[] = [];
        try { tSprints = JSON.parse(existingTask.sprints); } catch (e) { }
        
        if (!tSprints.includes("New Sprint 182")) {
          tSprints.push("New Sprint 182");
          console.log(`  Pushed 'New Sprint 182'. New sprints: ${JSON.stringify(tSprints)}`);
        } else {
          console.log(`  Already had 'New Sprint 182'`);
        }
      } else {
        console.log(`  No existing task found for title "${taskTitle}"`);
      }
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
