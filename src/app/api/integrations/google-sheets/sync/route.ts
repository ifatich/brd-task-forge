import { NextResponse } from "next/server";
import { syncFromSheets } from "@/lib/googleSheetsService"; // Ensure correct import path

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const spreadsheetId = body.spreadsheetId || process.env.GOOGLE_SPREADSHEET_ID;
    const sheetName = body.sheetName || "ALL";

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "spreadsheetId is required." },
        { status: 400 }
      );
    }

    const result = await syncFromSheets(spreadsheetId, sheetName);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Sync API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync from Google Sheets." },
      { status: 500 }
    );
  }
}
