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
  
  let lastProjectName = "";

  for (const row of rows) {
    let projectName = row[1]?.trim() || "";
    if (projectName) {
      lastProjectName = projectName;
    } else if (lastProjectName) {
      projectName = lastProjectName;
    }

    const taskTitle = row[2]?.trim() || "";
    if (projectName === "RIPLAY BRI" && taskTitle === "Revisi") {
      console.log(`Found Revisi! row[0]: ${row[0]}, row[1]: ${row[1]}, row[2]: ${row[2]}`);
      
      const project = await prisma.project.findFirst({ where: { title: "RIPLAY BRI" } });
      const existingTask = await prisma.task.findFirst({
        where: { projectId: project?.id, title: taskTitle },
      });
      console.log(`existingTask found:`, !!existingTask);
      if (existingTask) {
        console.log(`Current sprints:`, existingTask.sprints);
        // checking update
      }
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
