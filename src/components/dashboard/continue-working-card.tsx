"use client";

import { useRouter } from "next/navigation";
import { ProjectItem } from "./types";
import { getProgressColor } from "@/lib/progress-utils";

interface ContinueWorkingCardProps {
  projects: ProjectItem[];
}

export function ContinueWorkingCard({ projects }: ContinueWorkingCardProps) {
  const router = useRouter();

  if (!projects || projects.length === 0) return null;

  // Get the most recently updated project
  const lastProject = [...projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];

  if (!lastProject) return null;

  return (
    <div className="group relative overflow-hidden rounded-[24px] bg-surface-soft border border-hairline transition-all duration-300 hover:border-hairline hover:bg-black/5 p-6 mb-8 animate-fade-in" style={{ animationDelay: "50ms" }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-semibold text-ink/60 uppercase tracking-wider">
              Continue Working
            </span>
          </div>

          <h2 className="text-2xl font-semibold text-ink mb-2 truncate group-hover:text-blue-400 transition-colors duration-300">
            {lastProject.title}
          </h2>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex-1 max-w-[200px] h-1.5 rounded-full bg-hairline overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor(lastProject.progress)}`}
                style={{ width: `${lastProject.progress}%` }}
              />
            </div>
            <span className="text-xs font-mono font-medium text-ink/60">
              {lastProject.progress}%
            </span>
          </div>
        </div>

        <button
          onClick={() => router.push(`/project/${lastProject.id}`)}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-[24px] bg-black/5 border border-hairline hover:bg-black/10 hover:border-hairline text-sm font-medium text-ink transition-all active:scale-[0.98] shrink-0"
        >
          Resume Project
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink/60 group-hover:text-ink transition-colors group-hover:translate-x-0.5 duration-300">
            <path d="M6 4l4 4-4 4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
