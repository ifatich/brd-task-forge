import { prisma } from "./src/lib/db"
async function main() {
  const p = await prisma.project.findMany({ select: { title: true, sprints: true } })
  console.log("Total Projects:", p.length)
  console.log("Projects in New Sprint 181:")
  let count = 0
  for (const pr of p) {
    if (pr.sprints.includes("New Sprint 181")) {
      console.log(pr.title)
      count++
    }
  }
  console.log("Count:", count)
}
main().finally(() => process.exit(0))
