import fetch from "node-fetch";

async function main() {
  const payload = {
    sheetName: "New Sprint 182",
    tasks: [
      {
        group: "Uncategorized",
        project: "RIPLAY BRI",
        subtask: "Review",
        goalsStatus: "Review",
        status: "To Do",
        bobot: 4,
        pic: "Nina",
        asignees: ["Nina"]
      }
    ]
  };

  const res = await fetch("http://localhost:3000/api/integrations/google-sheets/webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}
main().catch(console.error);
