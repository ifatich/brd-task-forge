import { Dispatch, SetStateAction } from "react";

export type ViewMode = "grid" | "list";
export type SortBy = "newest" | "oldest" | "progress" | "name";
export type FilterStatus = "all" | "active" | "completed" | "draft";

interface FilterOption {
  value: FilterStatus;
  label: string;
  count: number;
}

interface ProjectToolbarProps {
  filterStatus: FilterStatus;
  setFilterStatus: Dispatch<SetStateAction<FilterStatus>>;
  filterOptions: FilterOption[];
  sortBy: SortBy;
  setSortBy: Dispatch<SetStateAction<SortBy>>;
  viewMode: ViewMode;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
}

export function ProjectToolbar({
  filterStatus,
  setFilterStatus,
  filterOptions,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode
}: ProjectToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      {/* Search (Visual Mock for now) & Filters */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
        <div className="relative group shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/60 group-focus-within:text-ink transition-colors">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="w-[180px] sm:w-[220px] h-9 pl-9 pr-3 rounded-full bg-surface-soft border border-hairline text-sm text-ink placeholder:text-ink/60 focus:outline-none focus:ring-2 focus:ring-ink/10 focus:border-ink/30 transition-all"
          />
        </div>

        <div className="h-4 w-px bg-black/10 shrink-0" />

        <div className="flex items-center gap-1 shrink-0">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterStatus(opt.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterStatus === opt.value
                  ? "bg-ink text-canvas"
                  : "text-ink/60 hover:text-ink hover:bg-black/5"
              }`}
            >
              {opt.label}
              <span
                className={`inline-flex items-center justify-center min-w-[16px] h-[16px] rounded-full text-[9px] font-mono ${
                  filterStatus === opt.value
                    ? "bg-canvas/20 text-canvas"
                    : "bg-black/5 text-ink/60"
                }`}
              >
                {opt.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* View Toggle & Sort */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative group">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="appearance-none h-9 pl-4 pr-8 rounded-full bg-surface-soft border border-hairline text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-ink/10 focus:border-ink/30 transition-all cursor-pointer hover:bg-black/5"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="progress">Highest Progress</option>
            <option value="name">Name A-Z</option>
          </select>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/60 pointer-events-none">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        <div className="flex p-1 rounded-full bg-surface-soft border border-hairline">
          <button 
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-full transition-all ${viewMode === "grid" ? "bg-ink text-canvas" : "text-ink/60 hover:text-ink hover:bg-black/5"}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>
          <button 
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-full transition-all ${viewMode === "list" ? "bg-ink text-canvas" : "text-ink/60 hover:text-ink hover:bg-black/5"}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
