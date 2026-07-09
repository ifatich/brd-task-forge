"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskCard } from "./task-card";

type TaskStatus = "todo" | "in-progress" | "done";

interface SubTask {
  id: string;
  title: string;
  description: string;
  definitionOfDone: string;
  goals: string[];
  elements: string[];
  done: boolean;
}

interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  goals: string[];
  definitionOfDone: string;
  status: TaskStatus;
  priority: string;
  assignee: string | null;
  assigneeId: string | null;
  order: number;
  subTasks: SubTask[];
}

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: "todo", title: "To Do", color: "bg-zinc-50 border border-zinc-200 " },
  { id: "in-progress", title: "In Progress", color: "bg-blue-50/50 border border-blue-200/70 " },
  { id: "done", title: "Done", color: "bg-green-50/50 border border-green-200/70 " },
];

interface KanbanBoardProps {
  projectId?: string;
  onDataChange?: () => void;
}

export function KanbanBoard({ projectId = "proj-001", onDataChange }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overColumnId, setOverColumnId] = useState<TaskStatus | null>(null);

  const fetchTasks = useCallback(() => {
    fetch(`/api/projects/${projectId}/tasks?t=${Date.now()}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        const taskList = data?.tasks ?? [];
        setTasks(taskList);
        onDataChange?.();
      })
      .catch(() => setTasks([]));
  }, [projectId, onDataChange]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const getTasksByStatus = (taskList: Task[], status: TaskStatus) =>
    taskList.filter((t) => t.status === status).sort((a, b) => a.order - b.order);

  const columns = useMemo(
    () =>
      COLUMNS.map((col) => ({
        ...col,
        tasks: getTasksByStatus(tasks, col.id),
      })),
    [tasks]
  );

  const findColumn = useCallback(
    (taskId: string): TaskStatus | null => {
      const task = tasks.find((t) => t.id === taskId);
      return task?.status ?? null;
    },
    [tasks]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task | undefined;
    if (task) {
      setActiveTask(task);
      setOverColumnId(task.status);
    }
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeStatus = findColumn(active.id as string);
      let overStatus: TaskStatus | null = null;

      const overColumn = COLUMNS.find((c) => c.id === over.id);
      if (overColumn) {
        overStatus = overColumn.id;
      } else {
        overStatus = findColumn(over.id as string);
      }

      if (overStatus) {
        setOverColumnId(overStatus);
      }

      if (activeStatus && overStatus && activeStatus !== overStatus) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === active.id ? { ...t, status: overStatus! } : t
          )
        );
      }
    },
    [findColumn]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);
      setOverColumnId(null);

      if (!over) return;

      const activeStatus = findColumn(active.id as string);
      const overId = over.id as string;

      const overColumn = COLUMNS.find((c) => c.id === overId);
      const targetStatus = overColumn?.id ?? activeStatus;

      if (activeStatus && targetStatus && activeStatus !== targetStatus) {
        // Update local state immediately
        setTasks((prev) =>
          prev.map((t) =>
            t.id === active.id ? { ...t, status: targetStatus } : t
          )
        );

        // Sync to API (don't use "complete" action for non-done status)
        const body = targetStatus === "done"
          ? { status: "done", action: "complete" }
          : { status: targetStatus };
        fetch(`/api/tasks/${active.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }).then(() => fetchTasks()).catch(() => fetchTasks());
      }
    },
    [findColumn, fetchTasks]
  );

  const handleDragCancel = useCallback(() => {
    setActiveTask(null);
    setOverColumnId(null);
  }, []);

  const handleToggleSubTask = useCallback(async (taskId: string, subTaskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    const sub = task?.subTasks.find((s) => s.id === subTaskId);
    if (!sub) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subTasks: t.subTasks.map((s) =>
                s.id === subTaskId ? { ...s, done: !s.done } : s
              ),
            }
          : t
      )
    );

    // Sync to API & refetch to get server-computed task status
    try {
      await fetch(`/api/subtasks/${subTaskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !sub.done }),
      });
    } catch {}

    // Refetch to get updated task status from server
    fetchTasks();
  }, [tasks, fetchTasks]);

  const handleCompleteTask = useCallback(async (taskId: string) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: "done" as TaskStatus,
              subTasks: t.subTasks.map((s) => ({ ...s, done: true })),
            }
          : t
      )
    );

    // Sync to API & refetch
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "done", action: "complete" }),
      });
    } catch {}

    // Refetch to get server-computed state
    fetchTasks();
  }, [fetchTasks]);

  const getTotalTasks = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status).length;

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[600px]">
        {columns.map((column) => {
          const isOver = overColumnId === column.id && activeTask?.status !== column.id;

          return (
            <div
              key={column.id}
              id={column.id}
              className={`rounded-[24px] ${column.color} p-4 flex flex-col transition-all ${
                isOver
                  ? "ring-2 ring-zinc-900 scale-[1.01]"
                  : ""
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-zinc-900 ">
                    {column.title}
                  </h3>
                  <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-zinc-200/70 text-[11px] font-medium text-zinc-500 tabular-nums">
                    {getTotalTasks(column.id)}
                  </span>
                </div>
                {isOver && (
                  <span className="text-[10px] font-medium text-zinc-500 animate-pulse">
                    + 1
                  </span>
                )}
              </div>

              {/* Task List (Sortable) */}
              <SortableContext
                items={column.tasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex-1 space-y-3 min-h-[100px]">
                  {column.tasks.length === 0 ? (
                    <div
                      className={`flex items-center justify-center h-24 rounded-lg border-2 border-dashed transition-colors ${
                        isOver
                          ? "border-zinc-900 bg-zinc-200/50 "
                          : "border-zinc-200 "
                      }`}
                    >
                      {isOver ? (
                        <p className="text-xs font-bold text-ink/70">
                          Drop here
                        </p>
                      ) : (
                        <p className="text-xs text-ink/40">
                          No tasks yet
                        </p>
                      )}
                    </div>
                  ) : isOver ? (
                    <>
                      {column.tasks.map((task) => (
                        <TaskCard key={task.id} task={task} onToggleSubTask={handleToggleSubTask} onCompleteTask={handleCompleteTask} onDataChange={fetchTasks} />
                      ))}
                      <div className="h-1 rounded-full bg-zinc-900/20 animate-pulse" />
                    </>
                  ) : (
                    column.tasks.map((task) => (
                      <TaskCard key={task.id} task={task} onToggleSubTask={handleToggleSubTask} onCompleteTask={handleCompleteTask} onDataChange={fetchTasks} />
                    ))
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-95 ">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
