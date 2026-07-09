"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

interface TaskSummary {
  total: number;
  done: number;
  inProgress: number;
  todo: number;
}

interface ProgressIndicatorProps {
  projectId: string;
  taskSummary?: TaskSummary;
}

export function ProgressIndicator({ projectId, taskSummary }: ProgressIndicatorProps) {
  const [stats, setStats] = useState<TaskSummary>(() =>
    taskSummary ?? { total: 0, done: 0, inProgress: 0, todo: 0 }
  );

  useEffect(() => {
    if (taskSummary) {
      setStats(taskSummary);
      return;
    }
    fetch(`/api/projects/${projectId}/tasks`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.summary) {
          setStats(data.summary);
        } else if (data?.tasks) {
          const tasks = data.tasks;
          setStats({
            total: tasks.length,
            done: tasks.filter((t: any) => t.status === "done").length,
            inProgress: tasks.filter((t: any) => t.status === "in-progress").length,
            todo: tasks.filter((t: any) => t.status === "todo").length,
          });
        }
      })
      .catch(() => {});
  }, [projectId, taskSummary]);

  const percentage = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {/* Overall Progress */}
      <div className="rounded-[24px] border border-zinc-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-zinc-900 ">
              {percentage}%
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">
              Overall Progress
            </div>
          </div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              percentage === 100
                ? "bg-green-100 "
                : percentage > 0
                  ? "bg-blue-100 "
                  : "bg-zinc-100 "
            }`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={
                percentage === 100
                  ? "text-green-600 "
                  : percentage > 0
                    ? "text-blue-600 "
                    : "text-zinc-400 "
              }
            >
              {percentage === 100 ? (
                <polyline points="4 8 7 11 12 5" />
              ) : (
                <>
                  <path d="M12 2v4" />
                  <path d="M12 18v4" />
                  <path d="M4.93 4.93l2.83 2.83" />
                  <path d="M16.24 16.24l2.83 2.83" />
                  <path d="M2 12h4" />
                  <path d="M18 12h4" />
                </>
              )}
            </svg>
          </div>
        </div>
        <Progress
          value={percentage}
          className={`h-2 mt-3 ${
            percentage === 100
              ? "[&>div]:bg-green-500"
              : percentage > 50
                ? "[&>div]:bg-blue-500"
                : ""
          }`}
        />
      </div>

      {/* To Do */}
      <div className="rounded-[24px] border border-zinc-200 p-4">
        <div className="text-2xl font-bold text-zinc-300 ">
          {stats.todo}
        </div>
        <div className="text-xs text-zinc-500 mt-0.5">
          To Do
        </div>
        <div className="mt-3 h-2 rounded-full bg-zinc-200 ">
          <div
            className="h-full rounded-full bg-zinc-400 transition-all"
            style={{
              width: `${stats.total > 0 ? (stats.todo / stats.total) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* In Progress */}
      <div className="rounded-[24px] border border-zinc-200 p-4">
        <div className="text-2xl font-bold text-blue-600 ">
          {stats.inProgress}
        </div>
        <div className="text-xs text-zinc-500 mt-0.5">
          In Progress
        </div>
        <div className="mt-3 h-2 rounded-full bg-zinc-200 ">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{
              width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Done */}
      <div className="rounded-[24px] border border-zinc-200 p-4">
        <div className="text-2xl font-bold text-green-600 ">
          {stats.done}
        </div>
        <div className="text-xs text-zinc-500 mt-0.5">
          Done
        </div>
        <div className="mt-3 h-2 rounded-full bg-zinc-200 ">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{
              width: `${stats.total > 0 ? (stats.done / stats.total) * 100 : 0}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
