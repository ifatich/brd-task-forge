import { google } from "googleapis";
async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFilename: "/Users/lord/Downloads/brd-task-force-874f06678b1d.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || "1x7s-tIIbURiu8BI6L7WXoVDkDXuAYcKv4GIUbOyiF3E";
  const doc = await sheets.spreadsheets.get({ spreadsheetId });
  const titles = doc.data.sheets?.map(s => s.properties?.title || "") || [];
  console.log(JSON.stringify(titles, null, 2));
}
main().catch(console.error).finally(() => process.exit(0))
