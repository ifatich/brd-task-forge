import { prisma } from "./src/lib/db"
async function main() {
  const p = await prisma.project.findFirst({ where: { title: { contains: "KITA PEGADAIAN" } } })
  if (!p) return console.log("Project not found")
  
  const tasks = await prisma.task.findMany({ where: { projectId: p.id, status: { not: "archived" } } })
  console.log(`Total non-archived tasks in ${p.title}: ${tasks.length}`)
  
  let latestSprintCount = 0
  tasks.forEach(t => {
    try {
      const s = JSON.parse(t.sprints)
      if (s.includes("New Sprint 181")) latestSprintCount++
    } catch {}
  })
  console.log(`Tasks in New Sprint 181: ${latestSprintCount}`)
}
main().finally(() => process.exit(0))
