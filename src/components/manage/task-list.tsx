"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

type TaskStatus = "todo" | "in-progress" | "done";
type Priority = "low" | "medium" | "high";

interface SubTask {
  id: string;
  title: string;
  done: boolean;
}

interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: string;
  assignee: string | null;
  order: number;
  subTasks: SubTask[];
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case "high": return "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400";
    case "medium": return "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400";
    case "low": return "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400";
    default: return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400";
  }
}

function getPriorityLabel(priority: string): string {
  switch (priority) {
    case "high": return "Tinggi";
    case "medium": return "Sedang";
    case "low": return "Rendah";
    default: return priority;
  }
}

interface TaskListProps {
  projectId: string;
}

export function TaskList({ projectId }: TaskListProps) {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetch(`/api/projects/${projectId}/tasks`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        setAllTasks(data?.tasks ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId]);

  const tasks = useMemo(() => {
    let result = allTasks;

    if (filterStatus !== "all") {
      result = result.filter((t) => t.status === filterStatus);
    }
    if (filterPriority !== "all") {
      result = result.filter((t) => t.priority === filterPriority);
    }
    if (searchText) {
      const q = searchText.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => a.order - b.order);
  }, [allTasks, filterStatus, filterPriority, searchText]);

  const statusCounts = {
    all: allTasks.length,
    todo: allTasks.filter((t) => t.status === "todo").length,
    "in-progress": allTasks.filter((t) => t.status === "in-progress").length,
    done: allTasks.filter((t) => t.status === "done").length,
  };

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-3">
        {/* Search */}
        <div className="relative">
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          >
            <circle cx="7" cy="7" r="4" />
            <line x1="11" y1="11" x2="14" y2="14" />
          </svg>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Cari tugas..."
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 pl-9 pr-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <div className="flex items-center gap-1">
            {([
              { value: "all", label: "Semua" },
              { value: "todo", label: "To Do" },
              { value: "in-progress", label: "In Progress" },
              { value: "done", label: "Done" },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilterStatus(opt.value)}
                className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                  filterStatus === opt.value
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
              >
                {opt.label}
                <span className="ml-1 opacity-60">
                  {statusCounts[opt.value]}
                </span>
              </button>
            ))}
          </div>

          <span className="text-zinc-200 dark:text-zinc-700">|</span>

          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={(e) =>
              setFilterPriority(e.target.value as Priority | "all")
            }
            className="text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1 text-zinc-600 dark:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
          >
            <option value="all">Semua Prioritas</option>
            <option value="high">Tinggi</option>
            <option value="medium">Sedang</option>
            <option value="low">Rendah</option>
          </select>
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">Memuat tugas...</p>
        </div>
      ) : tasks.length > 0 ? (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="px-4 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusDot status={task.status} />
                    <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {task.title}
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
                    {task.description}
                  </p>
                  {task.subTasks.length > 0 && (
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 line-clamp-1">
                      {task.subTasks.length} sub-task • {task.subTasks.filter(s => s.done).length} selesai
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getPriorityColor(task.priority)}`}
                  >
                    {getPriorityLabel(task.priority)}
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 capitalize">
                    {task.status === "in-progress"
                      ? "In Progress"
                      : task.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-400 dark:text-zinc-500">
                {task.assignee ? (
                  <span>Assignee: {task.assignee.replace("_", " ")}</span>
                ) : (
                  <span className="italic">Belum ditugaskan</span>
                )}
                <span className="font-mono">{task.id}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            {searchText
              ? "Tidak ada tugas yang cocok dengan pencarian"
              : "Belum ada tugas untuk proyek ini"}
          </p>
        </div>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: TaskStatus }) {
  const colors = {
    todo: "bg-zinc-300 dark:bg-zinc-600",
    "in-progress": "bg-blue-500",
    done: "bg-green-500",
  };

  return (
    <span
      className={`inline-block w-2 h-2 rounded-full shrink-0 ${colors[status]}`}
    />
  );
}
