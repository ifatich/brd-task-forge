import { prisma } from "./src/lib/db";

const sortSprints = (sprints: string[]) => {
  return sprints.sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || "0", 10);
    const numB = parseInt(b.match(/\d+/)?.[0] || "0", 10);
    return numA - numB;
  });
};

async function run() {
  const projects = await prisma.project.findMany();
  for (const p of projects) {
    if (p.sprints) {
      try {
        let arr = JSON.parse(p.sprints);
        const sorted = sortSprints([...arr]);
        if (JSON.stringify(arr) !== JSON.stringify(sorted)) {
          await prisma.project.update({ where: { id: p.id }, data: { sprints: JSON.stringify(sorted) } });
          console.log(`Sorted project ${p.id}: ${JSON.stringify(sorted)}`);
        }
      } catch (e) {}
    }
  }

  const tasks = await prisma.task.findMany();
  for (const t of tasks) {
    if (t.sprints) {
      try {
        let arr = JSON.parse(t.sprints);
        const sorted = sortSprints([...arr]);
        if (JSON.stringify(arr) !== JSON.stringify(sorted)) {
          await prisma.task.update({ where: { id: t.id }, data: { sprints: JSON.stringify(sorted) } });
          console.log(`Sorted task ${t.id}: ${JSON.stringify(sorted)}`);
        }
      } catch (e) {}
    }
  }
}
run().then(() => console.log("Done")).catch(console.error);
