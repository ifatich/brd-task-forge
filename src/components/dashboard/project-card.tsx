import Link from "next/link";
import { ProjectItem } from "./types";
import { getProgressColor } from "@/lib/progress-utils";

function getStatusConfig(status: string): { label: string; dot: string; badge: string } {
  switch (status) {
    case "active": return { label: "Active", dot: "bg-ink", badge: "bg-surface-soft text-ink border-hairline" };
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
            <span
              className={`inline-flex items-center gap-1.5 shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusConfig.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
              {statusConfig.label}
            </span>
          </div>

          {/* Minimal Task Summary */}
          <div className="flex items-center gap-4 mb-5 shrink-0">
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
        <div className="px-5 py-3 border-t border-hairline flex items-center justify-between bg-black/5 shrink-0">
          <span className="text-[11px] text-ink/60 opacity-0 group-hover:opacity-100 transition-opacity">
            Open Project
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink/80 group-hover:text-ink group-hover:translate-x-1 transition-all duration-300">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
