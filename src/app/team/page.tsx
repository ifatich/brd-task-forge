"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AddMemberModal } from "@/components/manage/add-member-modal";
import { Badge } from "@/components/ui/badge";

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchMembers = () => {
    setLoading(true);
    fetch("/api/team")
      .then((res) => res.json())
      .then((data) => {
        setMembers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  return (
    <div className="flex flex-col flex-1">
      {/* Navbar */}
      <header className="sticky top-0 z-50 nav-glass">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-ink/60 hover:text-ink hover:bg-black/5 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 4l-4 4 4 4" />
                </svg>
                Dasbor
              </Link>
              <span className="text-ink/20">|</span>
              <span className="font-semibold text-sm text-ink">Manajemen Tim</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-ink ">Manajemen Tim</h1>
          <p className="text-sm text-ink/60 mt-1">
            Kelola anggota tim yang dapat ditugaskan ke tugas di papan tugas.
          </p>
        </div>

        {/* Undang Anggota */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 :bg-zinc-200 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="3" x2="8" y2="13" />
              <line x1="3" y1="8" x2="13" y2="8" />
            </svg>
            Add Team Member
          </button>
        </div>

        {/* Daftar Anggota */}
        <div className="rounded-[24px] border border-hairline overflow-hidden">
          <div className="px-5 py-3 border-b border-hairline bg-zinc-50 flex items-center justify-between">
            <span className="font-semibold text-sm text-ink ">
              Anggota Tim ({members.length})
            </span>
          </div>
          <div className="divide-y divide-zinc-100 ">
            {loading ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-zinc-400 ">Memuat anggota tim...</p>
              </div>
            ) : members.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-zinc-400 ">Belum ada anggota tim.</p>
              </div>
            ) : members.map((member) => (
              <div
                key={member.id}
                className="px-5 py-4 flex items-center gap-4 hover:bg-zinc-50 :bg-zinc-900/50 transition-colors"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 font-semibold text-sm text-ink/60 uppercase">
                  {member.avatar || member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-ink ">
                    {member.name}
                  </h3>
                  <p className="text-xs text-ink/60 mt-0.5">
                    {member.role}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {member.id}
                </Badge>

                {confirmDelete === member.id ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setMembers((prev) => prev.filter((m) => m.id !== member.id));
                        setConfirmDelete(null);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1.5 text-[10px] font-medium text-white hover:bg-red-700 transition-colors"
                    >
                      Hapus
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="inline-flex items-center gap-1 rounded-lg border border-hairline px-2.5 py-1.5 text-[10px] font-medium text-ink/60 hover:bg-black/5 :bg-zinc-800 transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(member.id)}
                    className="shrink-0 p-1.5 rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 :bg-red-950/20 transition-colors"
                    title="Hapus anggota"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 4h12" /><path d="M5 4V2h6v2" /><path d="M3 4l1 10h8l1-10" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <AddMemberModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={fetchMembers}
      />
    </div>
  );
}
