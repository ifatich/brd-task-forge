import { syncFromSheets } from "./src/lib/googleSheetsService"
syncFromSheets().then(console.log).catch(console.error)
