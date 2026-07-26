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

  const res = await sheets.spreadsheets.get({
    spreadsheetId,
  });

  const tabs = res.data.sheets?.map(s => s.properties?.title);
  console.log("Google Sheets Tabs in order:", tabs);
}

main().catch(console.error);
