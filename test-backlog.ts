import { google } from "googleapis";
import * as dotenv from "dotenv";

dotenv.config();

async function run() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = "1x7s-tIIbURiu8BI6L7WXoVDkDXuAYcKv4GIUbOyiF3E";
  const range = "New Sprint 181!B6:Y";

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = response.data.values || [];
  console.log(`Fetched ${rows.length} rows.`);

  let isBacklogSection = false;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const projectName = row[0]?.trim();
    const taskTitle = row[1]?.trim();
    
    if (projectName?.toUpperCase().includes("BACKLOG")) {
      console.log(`Row ${i + 6} matches BACKLOG: projectName="${projectName}", taskTitle="${taskTitle}"`);
    }
  }
}

run().catch(console.error);
