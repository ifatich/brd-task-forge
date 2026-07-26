import { prisma } from "./src/lib/db";
import { sortSprints } from "./src/lib/sprint-utils";

async function main() {
  const project = await prisma.project.findFirst({ where: { title: "RIPLAY BRI" } });
  if (!project) return;
  console.log("Project Sprints:", project.sprints);

  const tasks = ["Review", "Revisi", "Present ke Stakeholder (Mba Chusna)"];
  for (const title of tasks) {
    const t = await prisma.task.findFirst({ where: { projectId: project.id, title } });
    if (!t) {
       console.log("Not found:", title);
       continue;
    }
    console.log(`Task: ${title}`);
    console.log(`  Current Sprints: ${t.sprints}`);
    
    let tSprints: string[] = [];
    try { tSprints = JSON.parse(t.sprints); } catch (e) { }
    
    if (!tSprints.includes("New Sprint 182")) {
      tSprints.push("New Sprint 182");
      console.log(`  Pushing New Sprint 182...`);
    } else {
      console.log(`  Already has New Sprint 182`);
    }
    tSprints = sortSprints(tSprints);
    console.log(`  Sorted Sprints: ${JSON.stringify(tSprints)}`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
