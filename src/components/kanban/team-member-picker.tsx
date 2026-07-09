"use client";

import { useState, useRef, useEffect, useMemo } from "react";

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

interface TeamMemberPickerProps {
  selectedId: string | null;
  onSelect: (memberId: string | null) => void;
  onClose: () => void;
}

export function TeamMemberPicker({
  selectedId,
  onSelect,
  onClose,
}: TeamMemberPickerProps) {
  const [search, setSearch] = useState("");
  const [team, setTeam] = useState<TeamMember[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    fetch("/api/team")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        if (Array.isArray(data)) {
          setTeam(data.filter(m => !m.name.includes("Admin") && !m.role.includes("Admin")));
        } else {
          setTeam([]);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(
    () =>
      team.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.role.toLowerCase().includes(search.toLowerCase())
      ),
    [team, search]
  );

  const handleSelect = (id: string | null) => {
    onSelect(id);
    onClose();
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      {/* Search */}
      <div className="p-2 border-b border-zinc-100 ">
        <div className="relative">
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
          >
            <circle cx="7" cy="7" r="4" />
            <line x1="11" y1="11" x2="14" y2="14" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team members..."
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 pl-8 pr-2.5 py-1.5 text-xs text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 :ring-white"
          />
        </div>
      </div>

      {/* List */}
      <div className="max-h-52 overflow-y-auto divide-y divide-zinc-100 ">
        {/* Kosongkan */}
        <button
          onClick={() => handleSelect(null)}
          className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors ${
            selectedId === null
              ? "bg-zinc-100 text-zinc-900 "
              : "text-zinc-500 hover:bg-zinc-50 :bg-zinc-900"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" />
          </svg>
          <span>Unassigned</span>
        </button>

        {filtered.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-zinc-400">
            No members match
          </div>
        ) : (
          filtered.map((member) => (
            <button
              key={member.id}
              onClick={() => handleSelect(member.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors ${
                selectedId === member.id
                  ? "bg-zinc-100 "
                  : "hover:bg-zinc-50 :bg-zinc-900"
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full font-medium text-[10px] uppercase shrink-0 ${
                  selectedId === member.id
                    ? "bg-zinc-900 text-white "
                    : "bg-zinc-200 text-zinc-500 "
                }`}
              >
                {member.avatar}
              </div>
              <div className="text-left flex-1 min-w-0">
                <span
                  className={`block truncate ${
                    selectedId === member.id
                      ? "font-medium text-zinc-900 "
                      : "text-zinc-700 "
                  }`}
                >
                  {member.name}
                </span>
                <span className="text-[10px] text-zinc-400 truncate block">
                  {member.role}
                </span>
              </div>
              {selectedId === member.id && (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-zinc-900 ">
                  <polyline points="4 8 7 11 12 5" />
                </svg>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
