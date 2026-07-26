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

  const res = await sheets.spreadsheets.get({ spreadsheetId });
  const tabs = res.data.sheets?.map(s => s.properties?.title || "").filter(t => t.match(/\b(170|171|172|173|174|175|176|177|178|179|180|181|182)\b/i)) || [];
  const sheetTitles = tabs.reverse();

  for (const sheetName of sheetTitles) {
    const sheetData = await sheets.spreadsheets.values.get({ spreadsheetId, range: `'${sheetName}'!A1:Z` });
    const rows = sheetData.data.values || [];
    let lastProjectName = "";

    for (const row of rows) {
      const rawColB = row[1]?.trim() || "";
      let projectName = rawColB;
      if (projectName) { lastProjectName = projectName; } 
      else if (lastProjectName) { projectName = lastProjectName; }

      const taskTitle = row[2]?.trim() || "";
      if (projectName === "RIPLAY BRI" && taskTitle === "Review") {
        console.log(`[${sheetName}] Found 'Review'`);
        const project = await prisma.project.findFirst({ where: { title: "RIPLAY BRI" } });
        if (!project) continue;
        const t = await prisma.task.findFirst({ where: { projectId: project.id, title: taskTitle } });
        if (t) {
           let tSprints: string[] = [];
           try { tSprints = JSON.parse(t.sprints); } catch (e) { }
           if (!tSprints.includes(sheetName)) {
             tSprints.push(sheetName);
             console.log(`[${sheetName}] Pushing ${sheetName} to ${t.id}. Current array: ${JSON.stringify(tSprints)}`);
             await prisma.task.update({ where: { id: t.id }, data: { sprints: JSON.stringify(tSprints) } });
           } else {
             console.log(`[${sheetName}] Already has ${sheetName}. Current array: ${t.sprints}`);
           }
        }
      }
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
