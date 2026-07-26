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
  let currentProj = "";
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rawColB = row[1]?.trim() || "";
    if (rawColB) currentProj = rawColB;
    if (currentProj.includes("RIPLAY")) {
      console.log(`Row ${i+1}:`, JSON.stringify(row.slice(0, 5))); // print first 5 columns to avoid clutter
    }
  }
}

main().catch(console.error);
