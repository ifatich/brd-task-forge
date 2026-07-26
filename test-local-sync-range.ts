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

  // fetch A1:Z
  const res1 = await sheets.spreadsheets.values.get({ spreadsheetId, range: `'New Sprint 182'!A1:Z` });
  const rows1 = res1.data.values || [];
  let found1 = -1;
  for (let i=0; i<rows1.length; i++) {
    if (rows1[i][2]?.trim() === "Revisi" && rows1[i][1]?.trim() === "RIPLAY BRI") { found1 = i+1; break; }
  }
  console.log(`[A1:Z] Revisi is at row index ${found1} (1-based from A1)`);

  // fetch A6:X
  const res2 = await sheets.spreadsheets.values.get({ spreadsheetId, range: `'New Sprint 182'!A6:X` });
  const rows2 = res2.data.values || [];
  let found2 = -1;
  for (let i=0; i<rows2.length; i++) {
    if (rows2[i][2]?.trim() === "Revisi" && rows2[i][1]?.trim() === "RIPLAY BRI") { found2 = i+1; break; }
  }
  console.log(`[A6:X] Revisi is at row index ${found2} (1-based from A6)`);
}
main().catch(console.error);
