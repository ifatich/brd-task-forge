"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserSwitcher } from "./user-switcher";

export function DashboardHeader() {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 animate-fade-in">
      <div>
        <p className="text-sm font-medium text-blue-500/80 mb-2 tracking-wide uppercase">
          Workspace
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-100">
          Good Morning
        </h1>
      </div>
      
      <div className="flex items-center gap-3 shrink-0">
        <UserSwitcher />
        <div className="w-px h-6 bg-white/10 mx-2 hidden sm:block"></div>
        <button
          onClick={() => router.push("/upload")}
          className="hidden sm:flex px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/20 hover:bg-zinc-800 text-sm font-medium text-zinc-300 transition-all active:scale-[0.98]"
        >
          New Project
        </button>
        <button
          onClick={() => router.push("/upload")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-[0.98]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload BRD
        </button>
      </div>
    </div>
  );
}
