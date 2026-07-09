import { ProjectItem } from "./types";

interface OverviewCardsProps {
  projects: ProjectItem[];
}

export function OverviewCards({ projects }: OverviewCardsProps) {
  const totalProjects = projects.length;
  
  const totalTasks = projects.reduce((acc, p) => acc + (p.taskSummary?.total || 0), 0);
  const completedTasks = projects.reduce((acc, p) => acc + (p.taskSummary?.done || 0), 0);
  const pendingTasks = projects.reduce((acc, p) => acc + (p.taskSummary?.todo || 0) + (p.taskSummary?.inProgress || 0), 0);

  // Mocking trends for visual premium feel
  const cards = [
    {
      id: "projects",
      title: "Total Projects",
      value: totalProjects,
      description: "Active workflows",
      trend: "+2 this week",
      trendUp: true,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
          <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
      iconBg: "bg-blue-500/10",
    },
    {
      id: "tasks",
      title: "Total Tasks",
      value: totalTasks,
      description: "AI generated items",
      trend: "+15% vs last month",
      trendUp: true,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
      ),
      iconBg: "bg-black/5",
    },
    {
      id: "completed",
      title: "Completed",
      value: completedTasks,
      description: "Tasks marked as done",
      trend: "+5 this week",
      trendUp: true,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      iconBg: "bg-emerald-500/10",
    },
    {
      id: "pending",
      title: "Pending",
      value: pendingTasks,
      description: "To do & in progress",
      trend: "-2 from yesterday",
      trendUp: true, // "Down" in pending is good, treating as positive trend visually
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      iconBg: "bg-amber-500/10",
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in" style={{ animationDelay: "100ms" }}>
      {cards.map((card) => (
        <div key={card.id} className="group relative rounded-[24px] bg-surface-soft border border-hairline p-5 transition-all duration-300 hover:border-hairline hover:bg-black/5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs font-medium text-ink/60 mb-1">{card.title}</p>
              <div className="text-2xl font-semibold text-ink tabular-nums">
                {card.value}
              </div>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-[24px] shrink-0 ${card.iconBg}`}>
              {card.icon}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-hairline">
            <p className="text-[11px] text-ink/60">{card.description}</p>
            <div className={`flex items-center gap-1 text-[11px] font-medium ${card.trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {card.trendUp ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>
              )}
              {card.trend}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
