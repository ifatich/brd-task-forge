import { syncGoogleSheetsData } from "./src/lib/googleSheetsService";
import { NextResponse } from "next/server";
async function main() {
  const result = await syncGoogleSheetsData("old", "New Sprint 182");
  console.log("Done");
}
main().catch(console.error);
