"use client";

import { ProjectItem } from "./types";
import { useRouter } from "next/navigation";

interface InsightsPanelProps {
  projects: ProjectItem[];
}

export function InsightsPanel({ projects }: InsightsPanelProps) {
  const router = useRouter();
  
  if (!projects || projects.length === 0) return null;

  // Mock insight data derived from existing projects
  const activeProjects = projects.filter(p => p.status === "active");
  
  // Fake "Due Today" based on active projects
  const dueToday = activeProjects.slice(0, 2).map(p => ({
    id: p.id,
    title: p.title,
    type: "due",
    time: "Today"
  }));

  // Fake "Overdue"
  const overdue = activeProjects.slice(2, 3).map(p => ({
    id: p.id,
    title: p.title,
    type: "overdue",
    time: "2 days ago"
  }));

  // Recent activity based on actual updatedAt
  const recentActivity = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3)
    .map(p => ({
      id: p.id,
      title: p.title,
      type: "update",
      time: p.updatedAt
    }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 animate-fade-in" style={{ animationDelay: "150ms" }}>
      
      {/* Due Today */}
      <div className="rounded-[24px] bg-surface-soft border border-hairline p-5">
        <div className="flex items-center gap-2 mb-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <h3 className="text-sm font-semibold text-ink">Due Today</h3>
        </div>
        <div className="space-y-3">
          {dueToday.length > 0 ? dueToday.map(item => (
            <div key={item.id} onClick={() => router.push(`/project/${item.id}`)} className="group flex items-center justify-between p-3 rounded-[24px] bg-black/5 border border-hairline hover:bg-black/10 hover:border-hairline cursor-pointer transition-colors">
              <span className="text-sm font-medium text-ink truncate group-hover:text-amber-300 transition-colors">{item.title}</span>
              <span className="text-[10px] text-ink/60 shrink-0">{item.time}</span>
            </div>
          )) : (
            <p className="text-xs text-ink/60 py-2">No tasks due today.</p>
          )}
        </div>
      </div>

      {/* Overdue */}
      <div className="rounded-[24px] bg-surface-soft border border-hairline p-5">
        <div className="flex items-center gap-2 mb-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <h3 className="text-sm font-semibold text-ink">Overdue</h3>
        </div>
        <div className="space-y-3">
          {overdue.length > 0 ? overdue.map(item => (
            <div key={item.id} onClick={() => router.push(`/project/${item.id}`)} className="group flex items-center justify-between p-3 rounded-[24px] bg-black/5 border border-hairline hover:bg-black/10 hover:border-hairline cursor-pointer transition-colors">
              <span className="text-sm font-medium text-ink truncate group-hover:text-red-300 transition-colors">{item.title}</span>
              <span className="text-[10px] text-red-500 shrink-0">{item.time}</span>
            </div>
          )) : (
            <p className="text-xs text-ink/60 py-2">No overdue projects. Great job!</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-[24px] bg-surface-soft border border-hairline p-5 md:col-span-2 lg:col-span-1">
        <div className="flex items-center gap-2 mb-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <h3 className="text-sm font-semibold text-ink">Recently Updated</h3>
        </div>
        <div className="space-y-3">
          {recentActivity.map(item => (
            <div key={item.id} onClick={() => router.push(`/project/${item.id}`)} className="group flex items-center justify-between p-3 rounded-[24px] bg-black/5 border border-hairline hover:bg-black/10 hover:border-hairline cursor-pointer transition-colors">
              <span className="text-sm font-medium text-ink truncate group-hover:text-blue-300 transition-colors">{item.title}</span>
              <span className="text-[10px] text-ink/60 shrink-0 tabular-nums">{item.time.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
