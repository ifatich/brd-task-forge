import { google } from "googleapis";
import * as dotenv from "dotenv";

dotenv.config();

async function run() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const doc = await sheets.spreadsheets.get({ spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID });
  const titles = doc.data.sheets?.map((s) => s.properties?.title || "") || [];
  console.log("ALL SHEETS:", titles);
}
run();
