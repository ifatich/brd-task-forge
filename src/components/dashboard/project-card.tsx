import Link from "next/link";
import { ProjectItem } from "./types";
import { getProgressColor } from "@/lib/progress-utils";

function getStatusConfig(status: string): { label: string; dot: string; badge: string } {
  switch (status) {
    case "active":  return { label: "Active",    dot: "bg-blue-400",    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
    case "completed": return { label: "Completed", dot: "bg-emerald-400", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
    case "draft":  return { label: "Draft",    dot: "bg-zinc-500",   badge: "bg-white/5 text-zinc-400 border-white/10" };
    default:          return { label: status,      dot: "bg-zinc-500",   badge: "bg-white/5 text-zinc-400 border-white/10" };
  }
}

interface ProjectCardProps {
  project: ProjectItem;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusConfig = getStatusConfig(project.status);

  return (
    <Link href={`/project/${project.id}`} className="block group outline-none">
      <div className="relative rounded-2xl bg-zinc-900/40 border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/10 hover:bg-zinc-900/80 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 active:scale-[0.98]">
        
        {/* Hover Highlight line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <h3 className="font-semibold text-base text-zinc-100 truncate leading-snug group-hover:text-blue-400 transition-colors">
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
          <div className="flex items-center gap-4 mb-5">
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span className="text-xs text-zinc-400 tabular-nums">
                <strong className="text-zinc-300 font-medium">{project.taskSummary?.done || 0}</strong> / {project.taskSummary?.total || 0} Tasks
              </span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="text-[11px] text-zinc-500 truncate">
                {project.updatedAt.split(' ')[0]}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-zinc-500">Progress</span>
              <span className="font-semibold font-mono text-zinc-300 group-hover:text-zinc-100 transition-colors">{project.progress}%</span>
            </div>
            <div className="relative h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${getProgressColor(project.progress)}`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
          <span className="text-[11px] text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
            Open Project
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
