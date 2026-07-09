"use client";

import { useState, useEffect } from "react";

interface SubTaskAssigneeProps {
  subTask: {
    id: string;
    assigneeId?: string | null;
    assignee?: string | null;
    assigneeMember?: { id: string; name: string; avatar: string } | null;
  };
  taskId: string;
  onDataChange?: () => void;
}

export function SubTaskAssignee({ subTask, taskId, onDataChange }: SubTaskAssigneeProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [assigneeId, setAssigneeId] = useState<string | null>(subTask.assigneeId ?? null);
  const [memberName, setMemberName] = useState<string | null>(subTask.assignee ?? null);

  const handleChange = async (newId: string | null) => {
    setAssigneeId(newId);
    setShowPicker(false);
    try {
      const res = await fetch(`/api/subtasks/${subTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigneeId: newId }),
      });
      if (res.ok) {
        const data = await res.json();
        setMemberName(data.assignee);
      }
    } catch {}
    onDataChange?.();
  };

  return (
    <div className="relative">
      {assigneeId ? (
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-200 :bg-zinc-700 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 8a3 3 0 100-6 3 3 0 000 6z" />
            <path d="M14 14c0-2-2.7-4-6-4s-6 2-6 4" />
          </svg>
          {memberName || assigneeId}
        </button>
      ) : (
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-zinc-300 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-600 :text-zinc-300 hover:border-zinc-400 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 8a3 3 0 100-6 3 3 0 000 6z" />
            <path d="M14 14c0-2-2.7-4-6-4s-6 2-6 4" />
          </svg>
          Assign
        </button>
      )}

      {showPicker && (
        <div className="mt-1 z-50 w-full max-w-[220px]">
          <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
            <div className="max-h-40 overflow-y-auto divide-y divide-zinc-100 ">
              <button
                onClick={() => handleChange(null)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 hover:bg-zinc-50 :bg-zinc-900 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" />
                </svg>
                Unassigned
              </button>
              <MemberList
                selectedId={assigneeId}
                onSelect={handleChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MemberList({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string | null) => void }) {
  const [members, setMembers] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/team")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        if (Array.isArray(data)) {
          setMembers(data.filter(m => !m.name.includes("Admin") && !m.role?.includes("Admin")));
        } else {
          setMembers([]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {members.map((m) => (
        <button
          key={m.id}
          onClick={() => onSelect(m.id)}
          className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
            selectedId === m.id
              ? "bg-zinc-100 text-zinc-900 "
              : "text-zinc-600 hover:bg-zinc-50 :bg-zinc-900"
          }`}
        >
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-zinc-200 text-[9px] font-medium">
            {m.avatar || m.name.charAt(0).toUpperCase()}
          </span>
          <span className="flex-1 text-left">{m.name}</span>
          {m.role && <span className="text-[9px] text-zinc-400">{m.role}</span>}
        </button>
      ))}
    </>
  );
}
