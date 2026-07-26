import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sortSprints } from "@/lib/sprint-utils";

interface WebhookPayload {
  sheetName: string;
  tasks: Array<{
    group: string;
    project: string;
    subtask: string;
    goalsStatus: string;
    status: string;
    bobot: number;
    pic: string;
    asignees: string[];
  }>;
}

export async function POST(req: Request) {
  try {
    const payload: WebhookPayload = await req.json();

    if (!payload.sheetName || !Array.isArray(payload.tasks)) {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    const { sheetName, tasks } = payload;
    let createdProjects = 0;
    let upsertedTasks = 0;
    let upsertedSubTasks = 0;
    
    // Convert status to kanban status
    const mapStatus = (raw: string) => {
      const ts = raw.toLowerCase().trim();
      if (ts === "to do" || ts === "backlog" || ts === "") return "todo";
      if (ts === "on progress" || ts === "in progress") return "in-progress";
      if (ts === "done") return "done";
      return "todo";
    };

    for (const item of tasks) {
      if (!item.group || !item.project || !item.subtask) {
        continue;
      }

      const kanbanStatus = mapStatus(item.status);

      // 1. PROJECT (Group)
      let project = await prisma.project.findFirst({
        where: { title: item.group }
      });

      if (!project) {
        project = await prisma.project.create({
          data: {
            title: item.group,
            status: kanbanStatus === "todo" ? "backlog" : "active",
            sprints: JSON.stringify([sheetName])
          }
        });
        createdProjects++;
      } else {
        // Update sprint for project
        let pSprints: string[] = [];
        try { pSprints = JSON.parse(project.sprints); } catch {}
        if (!pSprints.includes(sheetName)) {
          pSprints.push(sheetName);
          await prisma.project.update({
            where: { id: project.id },
            data: { sprints: JSON.stringify(sortSprints(pSprints)) }
          });
        }
      }

      // 2. TASK (Project)
      let task = await prisma.task.findFirst({
        where: { title: item.project, projectId: project.id }
      });

      let isCarryOver = false;
      let tSprints: string[] = [sheetName];
      if (task) {
        try { tSprints = JSON.parse(task.sprints); } catch {}
        if (!tSprints.includes(sheetName)) {
          tSprints.push(sheetName);
          isCarryOver = true;
        }
        task = await prisma.task.update({
          where: { id: task.id },
          data: {
            sprints: JSON.stringify(sortSprints(tSprints)),
            isCarryOver: isCarryOver || task.isCarryOver
          }
        });
      } else {
        task = await prisma.task.create({
          data: {
            title: item.project,
            projectId: project.id,
            sprints: JSON.stringify([sheetName]),
            isCarryOver: false
          }
        });
        upsertedTasks++;
      }

      // 3. TEAM MEMBERS
      const memberIds: string[] = [];
      const assigneeNamesStr = item.asignees.join(", ") || item.pic || "";
      for (const name of item.asignees) {
        let member = await prisma.teamMember.findFirst({ where: { name } });
        if (!member) {
          member = await prisma.teamMember.create({
            data: {
              id: `tm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              name,
              role: "member",
              isActive: true
            }
          });
        }
        memberIds.push(member.id);
      }

      // 4. SUBTASK (Subtask)
      let subTask = await prisma.subTask.findFirst({
        where: { title: item.subtask, taskId: task.id }
      });

      const goalsArr = item.goalsStatus ? [item.goalsStatus] : [];

      const subTaskData: any = {
        title: item.subtask,
        taskId: task.id,
        goals: JSON.stringify(goalsArr),
        done: kanbanStatus === "done",
        assignee: assigneeNamesStr
      };
      
      if (memberIds.length > 0) {
        subTaskData.assigneeId = memberIds[0];
      }

      if (subTask) {
        await prisma.subTask.update({
          where: { id: subTask.id },
          data: subTaskData
        });
      } else {
        await prisma.subTask.create({
          data: subTaskData
        });
        upsertedSubTasks++;
      }

      // Also update Task status based on latest subtask
      if (kanbanStatus !== task.status) {
        await prisma.task.update({
          where: { id: task.id },
          data: { 
            status: kanbanStatus,
            estimatedHours: item.bobot // just take the latest bobot for the task
          }
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Webhook sync successful. Created ${createdProjects} projects, ${upsertedTasks} tasks, and ${upsertedSubTasks} subtasks.` 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Webhook Sync API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process webhook." },
      { status: 500 }
    );
  }
}
