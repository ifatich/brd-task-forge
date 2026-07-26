"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProjectItem } from "./types";
import { getProgressColor } from "@/lib/progress-utils";

function getStatusConfig(status: string): { label: string; dot: string; badge: string } {
  switch (status) {
    case "active": return { label: "Active", dot: "bg-ink", badge: "bg-surface-soft text-ink border-hairline" };
    case "backlog": return { label: "Backlog", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200" };
    case "completed": return { label: "Completed", dot: "bg-ink/60", badge: "bg-black/5 text-ink/60 border-hairline" };
    case "draft": return { label: "Draft", dot: "bg-ink/30", badge: "bg-black/5 text-ink/50 border-hairline" };
    default: return { label: status, dot: "bg-ink/30", badge: "bg-black/5 text-ink/50 border-hairline" };
  }
}

interface ProjectCardProps {
  project: ProjectItem;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusConfig = getStatusConfig(project.status);
  const router = useRouter();

  const handleMakeActive = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" })
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to make active", error);
    }
  };

  return (
    <Link href={`/project/${project.id}`} className="block group outline-none h-full min-w-0">
      <div className="relative h-full flex flex-col min-w-0 rounded-[24px] bg-surface-soft border border-hairline overflow-hidden transition-all duration-300 hover:border-hairline hover:bg-black/5 hover:-translate-y-0.5 active:scale-[0.98]">

        {/* Hover Highlight line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ink/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="p-5 flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4 shrink-0 min-w-0">
            <h3 className="flex-1 min-w-0 font-semibold text-base text-ink truncate leading-snug group-hover:text-ink/80 transition-colors">
              {project.title}
            </h3>
            <div className="flex flex-col items-end gap-2">
              <span
                className={`inline-flex items-center gap-1.5 shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusConfig.badge}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                {statusConfig.label}
              </span>
              {project.status === "backlog" && (
                <button
                  onClick={handleMakeActive}
                  className="px-2 py-0.5 rounded text-[10px] font-medium border border-ink/10 text-ink hover:bg-ink hover:text-canvas transition-colors"
                >
                  Make Active
                </button>
              )}
            </div>
          </div>

          {/* Minimal Task Summary */}
          <div className="flex flex-wrap items-center gap-3 mb-5 shrink-0">
            {project.sprints && project.sprints.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded bg-blue-50/50 px-2 py-0.5 text-[10px] font-medium text-blue-600 border border-blue-100">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                {project.sprints[0]}
              </span>
            )}
            <div className="flex items-center gap-1.5 shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink/60">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span className="text-xs text-ink/60 tabular-nums">
                <strong className="text-ink font-medium">{project.taskSummary?.done || 0}</strong> / {project.taskSummary?.total || 0} Tasks
              </span>
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink/60 shrink-0">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="text-[11px] text-ink/60 truncate">
                {project.updatedAt.split(/[T ]/)[0]}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-auto shrink-0 pt-2">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-ink/60">Progress</span>
              <span className="font-semibold font-mono text-ink group-hover:text-ink transition-colors">{project.progress}%</span>
            </div>
            <div className="relative h-1.5 rounded-full bg-black/10 overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${getProgressColor(project.progress)}`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-hairline flex items-center justify-between bg-black/5 shrink-0 min-h-[44px]">
          {project.assignees && project.assignees.length > 0 ? (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {project.assignees.slice(0, 3).map((name, i) => (
                  <div key={i} className="w-5 h-5 rounded-full bg-white text-[8px] font-medium text-ink flex items-center justify-center border border-hairline ring-2 ring-black/5 z-10" title={name}>
                    {name.substring(0, 2).toUpperCase()}
                  </div>
                ))}
                {project.assignees.length > 3 && (
                  <div className="w-5 h-5 rounded-full bg-black/5 text-[8px] font-medium text-ink/60 flex items-center justify-center border border-hairline ring-2 ring-black/5 z-0" title={`${project.assignees.length - 3} more`}>
                    +{project.assignees.length - 3}
                  </div>
                )}
              </div>
              <span className="text-[11px] text-ink/60 truncate max-w-[100px]">
                {project.assignees.length === 1 ? project.assignees[0] : `${project.assignees.length} assignees`}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-ink/40">No assignees</span>
          )}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink/80 group-hover:text-ink group-hover:translate-x-1 transition-all duration-300 ml-auto">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
