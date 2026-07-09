"use client";

import { useState, useEffect } from "react";

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

interface AssigneeBadgeProps {
  assigneeId: string | null;
  size?: "sm" | "md";
}

export function AssigneeBadge({ assigneeId, size = "sm" }: AssigneeBadgeProps) {
  const [member, setMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    if (!assigneeId) {
      setMember(null);
      return;
    }
    // Try to find member from cached /api/team, or render name from id
    fetch("/api/team")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        const members: TeamMember[] = Array.isArray(data) ? data : [];
        setMember(members.find((m: TeamMember) => m.id === assigneeId) ?? null);
      })
      .catch(() => setMember(null));
  }, [assigneeId]);

  if (!member) {
    return (
      <span className={`inline-flex items-center gap-1.5 ${size === "sm" ? "text-[10px]" : "text-xs"} text-zinc-300 italic`}>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 8a3 3 0 100-6 3 3 0 000 6z" />
          <path d="M14 14c0-2-2.7-4-6-4s-6 2-6 4" />
        </svg>
        {size === "sm" ? "" : "Belum ditugaskan"}
      </span>
    );
  }

  const dotSize = size === "sm" ? "h-5 w-5 text-[9px]" : "h-7 w-7 text-xs";

  return (
    <div className="flex items-center gap-1.5 group/assignee">
      <div
        className={`flex items-center justify-center rounded-full font-medium uppercase shrink-0 transition-all duration-150 group-hover/assignee:ring-2 group-hover/assignee:ring-zinc-400 :ring-zinc-500 ${dotSize} ${
          size === "sm"
            ? "bg-zinc-200 text-zinc-500 "
            : "bg-zinc-200 text-zinc-500 "
        }`}
        title={member.role}
      >
        {member.avatar}
      </div>
      <span className={`${size === "sm" ? "text-[10px]" : "text-sm"} text-zinc-500 truncate group-hover/assignee:text-zinc-700 :text-zinc-300 transition-colors duration-150`}>
        {member.name}
      </span>
    </div>
  );
}
