"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MasterData } from "@/components/admin/master-data";
import { ExecutionMode } from "@/components/admin/execution-mode";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AuthNav } from "@/components/auth/auth-nav";

interface StatCardProps {
  icon: string;
  label: string;
  value: number | string;
  color: string;
  accentClass: string;
  link?: string;
  sub?: string;
}

function StatCard({ icon, label, value, color, accentClass, link, sub }: StatCardProps) {
  const content = (
    <div className="group relative bg-surface-soft border border-hairline rounded-[24px] p-5 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <div className={`text-3xl font-bold tracking-tight tabular-nums ${color}`}>{value}</div>
          <div className="text-xs text-ink/60 mt-1 font-medium flex items-center gap-1">
            {label}
            {link && (
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink/40 group-hover:text-ink transition-colors">
                <path d="M6 4l4 4-4 4" />
              </svg>
            )}
          </div>
          {sub && <div className="text-[10px] text-ink/60 mt-0.5 font-mono">{sub}</div>}
        </div>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 border border-hairline shrink-0"
          dangerouslySetInnerHTML={{ __html: icon }}
        />
      </div>
    </div>
  );

  if (link) return <a href={link} className="block">{content}</a>;
  return content;
}

export default function AdminPage() {
  const [totalProjects, setTotalProjects] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [doneTasks, setDoneTasks] = useState(0);
  const [activeKnowledge, setActiveKnowledge] = useState(0);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        setTotalProjects(data.overall?.projectCount || 0);
        setActiveProjects(data.overall?.projectCount || 0);
        setTotalTasks(data.overall?.tasks?.total || 0);
        setDoneTasks(data.overall?.tasks?.done || 0);
      })
      .catch(() => {});
    fetch("/api/admin/knowledge")
      .then((res) => res.json())
      .then((data) => {
        const files = Array.isArray(data) ? data : [];
        setActiveKnowledge(files.filter((f: { active: boolean }) => f.active).length);
      })
      .catch(() => {});
  }, []);

  const iconSvg = (path: string) =>
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: currentColor">${path}</svg>`;

  return (
    <AdminGuard>
      <div className="flex flex-col flex-1 min-h-screen">

        {/* ── Navbar ── */}
        <header className="sticky top-8 z-50 nav-glass">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Left: Logo + Nav */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-[24px] overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-ink" />
                    <span className="relative text-canvas text-sm font-bold">A</span>
                  </div>
                  <span className="font-semibold text-base text-ink hidden sm:inline tracking-tight">Admin Panel</span>
                </div>

                <nav className="hidden sm:flex items-center gap-1">
                  <span className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-ink bg-surface-soft border border-hairline">
                    Dashboard
                  </span>
                  <Link
                    href="/knowledge"
                    className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-ink/60 hover:text-ink hover:bg-black/5 transition-colors"
                  >
                    Knowledge
                  </Link>
                </nav>
              </div>

              {/* Right: back + auth */}
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-ink/60 hover:text-ink hover:bg-black/5 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M10 4l-4 4 4 4" />
                  </svg>
                  User Dashboard
                </Link>
                <AuthNav />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* ── Welcome ── */}
          <div className="animate-float-up">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-soft border border-hairline">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-ink/80 tracking-widest uppercase">Admin Area</p>
            </div>
            <h1 className="text-3xl font-bold text-ink">Admin Dashboard</h1>
            <p className="text-sm text-ink/60 mt-1.5">
              Manage projects, team, knowledge base, and system configuration.
            </p>
          </div>

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard
              icon={iconSvg('<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>')}
              label="Total Projects" value={totalProjects} color="text-ink"
              accentClass="bg-ink"
            />
            <StatCard
              icon={iconSvg('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>')}
              label="Active Projects" value={activeProjects} color="text-ink"
              accentClass="bg-ink"
            />
            <StatCard
              icon={iconSvg('<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>')}
              label="Total Tasks" value={totalTasks} color="text-ink"
              accentClass="bg-ink"
            />
            <StatCard
              icon={iconSvg('<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>')}
              label="Tasks Done" value={doneTasks} color="text-ink"
              accentClass="bg-ink"
              sub={totalTasks > 0 ? `${Math.round((doneTasks / totalTasks) * 100)}% of total` : undefined}
            />
            <StatCard
              icon={iconSvg('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>')}
              label="Active Knowledge" value={activeKnowledge} color="text-ink"
              accentClass="bg-ink"
              link="/knowledge"
            />
          </div>

          {/* ── Overall Progress ── */}
          {totalTasks > 0 && (
            <div className="bg-surface-soft border border-hairline rounded-[24px] p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-hairline" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-ink">Overall Progress</span>
                <span className="text-xs font-semibold text-ink/60 font-mono">
                  {Math.round((doneTasks / totalTasks) * 100)}%
                </span>
              </div>
              <div className="relative h-2.5 rounded-full bg-canvas/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-ink transition-all duration-700"
                  style={{ width: `${(doneTasks / totalTasks) * 100}%` }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-full hidden transition-all duration-700"
                  style={{ width: `${(doneTasks / totalTasks) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-ink/60 font-mono">
                <span>{doneTasks} done</span>
                <span>{totalTasks - doneTasks} remaining</span>
              </div>
            </div>
          )}

          {/* ── Data Master ── */}
          <section>
            <SectionHeader
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /></svg>}
              iconBg="bg-surface-soft border-hairline"
              title="Data Master"
            />
            <MasterData />
          </section>

          {/* ── Mode Eksekusi ── */}
          <section>
            <SectionHeader
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>}
              iconBg="bg-surface-soft border-hairline"
              title="Execution Mode"
            />
            <ExecutionMode />
          </section>

        </main>
      </div>
    </AdminGuard>
  );
}

function SectionHeader({
  icon, iconBg, title
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${iconBg}`}>
        {icon}
      </div>
      <h2 className="font-semibold text-base text-ink">{title}</h2>
    </div>
  );
}
