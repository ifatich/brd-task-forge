"use client";

import { useRouter } from "next/navigation";

interface ProjectItem {
  id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  taskSummary: { total: number; done: number; inProgress: number; todo: number };
  createdAt: string;
  updatedAt: string;
}

export function QuickActions({ projects }: { projects: ProjectItem[] }) {
  const router = useRouter();
  const lastProject = [...projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0] ?? null;

  return (
    <div className="flex flex-col gap-3">
      {/* ── Upload BRD ── */}
      <button
        onClick={() => router.push("/upload")}
        className="group relative glass-raised rounded-[24px] p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/30 overflow-hidden"
      >
        {/* Gradient glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300 rounded-[24px]" />

        <div className="relative flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[24px] bg-blue-500/15 border border-blue-500/20 group-hover:bg-blue-500/25 group-hover:border-blue-500/40 transition-all duration-200">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
              <path d="M10 3v12" /><path d="M4 9l6-6 6 6" /><path d="M3 17h14" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground mb-0.5 group-hover:text-blue-300 transition-colors">
              Upload New BRD
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Upload a BRD PDF and let AI break it down into UI/UX tasks
            </p>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-muted-foreground/40 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all duration-200">
            <path d="M6 4l4 4-4 4" />
          </svg>
        </div>
      </button>

      {/* ── Continue Last Project ── */}
      <button
        onClick={() => lastProject && router.push(`/project/${lastProject.id}`)}
        disabled={!lastProject}
        className={`group relative glass-raised rounded-[24px] p-5 text-left transition-all duration-300 overflow-hidden ${
          lastProject
            ? "hover:-translate-y-0.5 hover:border-indigo-500/30 cursor-pointer"
            : "opacity-40 cursor-not-allowed"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-300 rounded-[24px]" />

        <div className="relative flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[24px] bg-indigo-500/15 border border-indigo-500/20 group-hover:bg-indigo-500/25 group-hover:border-indigo-500/40 transition-all duration-200">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
              <path d="M5 3v14M5 3l10 5-10 5" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground mb-0.5 group-hover:text-indigo-300 transition-colors">
              Continue Project
            </h3>
            {lastProject ? (
              <>
                <p className="text-xs text-muted-foreground truncate">{lastProject.title}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 max-w-[80px] h-1 rounded-full bg-white/8 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                      style={{ width: `${lastProject.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">{lastProject.progress}%</span>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">No projects created yet</p>
            )}
          </div>
          {lastProject && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-muted-foreground/40 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all duration-200">
              <path d="M6 4l4 4-4 4" />
            </svg>
          )}
        </div>
      </button>
    </div>
  );
}
