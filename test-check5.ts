import { google } from "googleapis";
import * as path from "path";

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(process.cwd(), "service-account.json"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || "1x7s-tIIbURiu8BI6L7WXoVDkDXuAYcKv4GIUbOyiF3E";
  const doc = await sheets.spreadsheets.get({ spreadsheetId });
  const titles = doc.data.sheets?.map(s => s.properties?.title || "") || [];
  const sprintSheets = titles.filter(t => t.toLowerCase().includes("sprint"));
  
  console.log("Sprint sheets in left-to-right order:");
  sprintSheets.forEach(t => console.log(t));
}
main().catch(console.error).finally(() => process.exit(0))
