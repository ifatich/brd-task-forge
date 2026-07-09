"use client";

import { useState, useEffect } from "react";

interface LogEntry {
  id: string;
  action: string;
  detail: string;
  user: string;
  createdAt: string;
}

interface ProjectHistoryProps {
  projectId: string;
}

export function ProjectHistory({ projectId }: ProjectHistoryProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/logs`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        setLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId]);

  return (
    <div className="rounded-[24px] border border-zinc-200 overflow-hidden">
      {loading ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-zinc-400 ">Loading history...</p>
        </div>
      ) : logs.length > 0 ? (
        <div className="divide-y divide-zinc-100 ">
          {logs.map((log) => (
            <div key={log.id} className="px-5 py-3.5 flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 mt-0.5">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 ">
                  <circle cx="8" cy="8" r="6" /><line x1="8" y1="5" x2="8" y2="9" /><line x1="8" y1="11" x2="8" y2="11.01" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-zinc-900 ">{log.action}</span>
                  <span className="text-[10px] text-zinc-400 ">{log.createdAt}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{log.detail}</p>
                <span className="text-[10px] text-zinc-400 mt-1 inline-block">by {log.user}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-zinc-400 ">No activity history yet.</p>
        </div>
      )}
    </div>
  );
}
