"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const USERS = [
  { id: "admin-001", name: "Budi" },
  { id: "member-001", name: "Siti" },
  { id: "member-002", name: "Agus" },
];

export function UserSwitcher() {
  const router = useRouter();
  const [activeUserId, setActiveUserId] = useState<string>("admin-001");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Read the mock_user_id cookie
    const match = document.cookie.match(new RegExp('(^| )mock_user_id=([^;]+)'));
    if (match) {
      setActiveUserId(match[2]);
    } else {
      // Set default
      document.cookie = `mock_user_id=admin-001; path=/`;
    }
  }, []);

  const handleUserSelect = (id: string) => {
    document.cookie = `mock_user_id=${id}; path=/`;
    setActiveUserId(id);
    setIsOpen(false);
    // Reload to re-fetch Server Components with the new cookie
    router.refresh();
  };

  const activeUser = USERS.find((u) => u.id === activeUserId) || USERS[0];

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-soft border border-hairline hover:bg-hairline transition-colors"
      >
        <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
          {activeUser.name.charAt(0)}
        </div>
        <span className="text-xs font-medium text-ink">
          {activeUser.name}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-ink/60 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 rounded-[24px] border border-hairline bg-surface-soft overflow-hidden py-1">
          <div className="px-3 py-2 border-b border-hairline mb-1">
            <p className="text-[10px] font-medium text-ink/60 uppercase tracking-wider">
              Simulasi Login
            </p>
          </div>
          {USERS.map((u) => (
            <button
              key={u.id}
              onClick={() => handleUserSelect(u.id)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
                activeUserId === u.id
                  ? "bg-blue-500/10 text-blue-400"
                  : "text-ink hover:bg-hairline"
              }`}
            >
              <div
                className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold uppercase ${
                  activeUserId === u.id ? "bg-blue-600 text-white" : "bg-surface-soft border border-hairline text-ink"
                }`}
              >
                {u.name.charAt(0)}
              </div>
              {u.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
