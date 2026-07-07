-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SubTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "goals" TEXT NOT NULL DEFAULT '',
    "definitionOfDone" TEXT NOT NULL DEFAULT '',
    "elements" TEXT NOT NULL DEFAULT '',
    "done" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "assignee" TEXT,
    "assigneeId" TEXT,
    CONSTRAINT "SubTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SubTask_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "TeamMember" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SubTask" ("definitionOfDone", "description", "done", "elements", "goals", "id", "order", "taskId", "title") SELECT "definitionOfDone", "description", "done", "elements", "goals", "id", "order", "taskId", "title" FROM "SubTask";
DROP TABLE "SubTask";
ALTER TABLE "new_SubTask" RENAME TO "SubTask";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
