"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface KnowledgeFile {
  id: string;
  name: string;
  type: "prompt" | "skill" | "instruction";
  content: string;
  createdAt: string;
  size: number;
  active: boolean;
}

const TYPE_LABELS: Record<string, string> = { prompt: "Prompt", skill: "Skill", instruction: "Instruksi" };
const TYPE_COLORS: Record<string, string> = {
  prompt: "bg-purple-100 text-purple-700 ",
  skill: "bg-blue-100 text-blue-700 ",
  instruction: "bg-amber-100 text-amber-700 ",
};

export default function KnowledgePage() {
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<KnowledgeFile | null>(null);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isDragging, setIsDragging] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeFile | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/knowledge")
      .then((res) => res.json())
      .then((data) => {
        setFiles(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const filtered = files.filter((f) => {
    if (filterType !== "all" && f.type !== filterType) return false;
    if (searchText && !f.name.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  const addFile = async (file: File) => {
    if (!file.name.endsWith(".md")) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch("/api/admin/knowledge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            type: "instruction",
            content: reader.result as string,
          }),
        });
        if (res.ok) {
          const saved = await res.json();
          setFiles((prev) => [saved, ...prev]);
          showToast(`"${file.name}" berhasil diunggah`);
        } else {
          showToast("Gagal mengunggah file", "error");
        }
      } catch {
        showToast("Gagal mengunggah file", "error");
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    try {
      await fetch(`/api/admin/knowledge/${deleteTarget.id}`, { method: "DELETE" });
      setFiles((prev) => prev.filter((f) => f.id !== deleteTarget.id));
      if (selectedFile?.id === deleteTarget.id) setSelectedFile(null);
      showToast(`"${name}" berhasil dihapus`);
    } catch {
      showToast("Gagal menghapus file", "error");
    }
    setDeleteTarget(null);
  };

  const toggleActive = async (id: string) => {
    const file = files.find((f) => f.id === id);
    if (!file) return;
    try {
      await fetch(`/api/admin/knowledge/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !file.active }),
      });
      setFiles((prev) => prev.map((f) => f.id === id ? { ...f, active: !f.active } : f));
    } catch {
      showToast("Gagal mengubah status", "error");
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Navbar */}
      <header className="sticky top-0 z-50 nav-glass">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-ink/60 hover:text-ink hover:bg-black/5 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 4l-4 4 4 4" />
                </svg>
                Admin
              </Link>
              <span className="text-ink/20">|</span>
              <span className="font-semibold text-sm text-ink">Knowledge &amp; Skill Manager</span>
            </div>
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-ink/60 hover:text-ink hover:bg-black/5 transition-colors"
            >
              Dasbor
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel: list + upload */}
          <div className="lg:col-span-1 space-y-4">
            {/* Upload area with drag-and-drop */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); Array.from(e.dataTransfer.files).forEach(addFile); }}
              className={`rounded-[24px] border-2 border-dashed p-4 text-center transition-all cursor-pointer ${
                isDragging
                  ? "border-zinc-900 bg-zinc-50 scale-[1.02]"
                  : "border-hairline hover:border-zinc-400 :border-zinc-500"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept=".md" onChange={(e) => { const f = e.target.files?.[0]; if (f) addFile(f); e.target.value = ""; }} className="hidden" />
              <div className="space-y-2 pointer-events-none">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`mx-auto transition-colors ${isDragging ? "text-ink " : "text-zinc-300 "}`}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p className={`text-xs font-medium transition-colors ${isDragging ? "text-ink " : "text-ink/60 "}`}>
                  {isDragging ? "Lepaskan file di sini" : "Upload atau drag & drop file .md"}
                </p>
                <p className="text-[10px] text-zinc-400 ">Instruksi, prompt, atau skill AI</p>
              </div>
            </div>

            {/* Search + filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400">
                  <circle cx="7" cy="7" r="4" /><line x1="11" y1="11" x2="14" y2="14" />
                </svg>
                <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Cari..." className="w-full rounded-lg border border-hairline bg-canvas pl-8 pr-3 py-1.5 text-xs text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900" />
              </div>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="rounded-lg border border-hairline bg-canvas px-2 py-1.5 text-xs text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900">
                <option value="all">Semua</option>
                <option value="prompt">Prompt</option>
                <option value="skill">Skill</option>
                <option value="instruction">Instruksi</option>
              </select>
            </div>

            {/* File list */}
            <div className="space-y-1.5">
              {filtered.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFile(f)}
                  className={`w-full text-left rounded-lg border px-3 py-2.5 transition-colors group ${
                    selectedFile?.id === f.id
                      ? "border-zinc-900 bg-zinc-50 "
                      : "border-hairline hover:bg-zinc-50 :bg-zinc-900/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`inline-flex items-center justify-center w-2 h-2 rounded-full ${f.type === "prompt" ? "bg-purple-400" : f.type === "skill" ? "bg-blue-400" : "bg-amber-400"}`} />
                      <span className="text-xs font-medium text-zinc-800 truncate">{f.name}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium ${TYPE_COLORS[f.type]}`}>
                        {TYPE_LABELS[f.type]}
                      </span>
                      <span
                        onClick={(e) => { e.stopPropagation(); toggleActive(f.id); }}
                        className={`relative inline-flex h-3.5 w-6 shrink-0 rounded-full border transition-colors cursor-pointer ${
                          f.active ? "bg-green-500 border-green-500" : "bg-zinc-200 border-hairline "
                        }`}
                        title={f.active ? "Aktif" : "Nonaktif"}
                      >
                        <span className={`inline-block h-2.5 w-2.5 rounded-full bg-canvas transform transition-transform ${
                          f.active ? "translate-x-2.5" : "translate-x-0.5"
                        }`} />
                      </span>
                      <span
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(f); }}
                        className="p-0.5 rounded text-red-200 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all cursor-pointer"
                        title="Hapus"
                      >
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12" /><path d="M5 4V2h6v2" /><path d="M3 4l1 10h8l1-10" /></svg>
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{f.createdAt} &middot; {f.size} B</p>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-xs text-zinc-400 text-center py-4">Tidak ada file</p>
              )}
            </div>
          </div>

          {/* Right panel: preview */}
          <div className="lg:col-span-2">
            {selectedFile ? (
              <div className="rounded-[24px] border border-hairline overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-hairline bg-zinc-50 ">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${TYPE_COLORS[selectedFile.type]}`}>
                      {TYPE_LABELS[selectedFile.type]}
                    </span>
                    <h3 className="text-sm font-medium text-ink truncate">{selectedFile.name}</h3>
                    <span
                      onClick={() => toggleActive(selectedFile.id)}
                      className={`relative inline-flex h-4 w-7 shrink-0 rounded-full border transition-colors cursor-pointer ${
                        selectedFile.active ? "bg-green-500 border-green-500" : "bg-zinc-200 border-hairline "
                      }`}
                      title={selectedFile.active ? "Aktif — klik nonaktifkan" : "Nonaktif — klik aktifkan"}
                    >
                      <span className={`inline-block h-3 w-3 rounded-full bg-canvas transform transition-transform ${
                        selectedFile.active ? "translate-x-3" : "translate-x-0.5"
                      }`} />
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setDeleteTarget(selectedFile)} className="p-1.5 rounded text-red-300 hover:text-red-500 hover:bg-red-50 :bg-red-950/30 transition-colors" title="Hapus">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12" /><path d="M5 4V2h6v2" /><path d="M3 4l1 10h8l1-10" /></svg>
                    </button>
                  </div>
                </div>
                <pre className="p-4 text-xs text-zinc-700 font-mono leading-relaxed whitespace-pre-wrap overflow-auto max-h-[70vh]">
                  {selectedFile.content}
                </pre>
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-hairline p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-200 mb-3">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
                </svg>
                <p className="text-sm font-medium text-zinc-400 ">Pilih file untuk melihat konten</p>
                <p className="text-xs text-zinc-300 mt-1">Upload file .md atau klik dari daftar</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div className="w-full max-w-sm rounded-[24px] border border-red-200 bg-canvas mx-4 animate-in fade-in zoom-in-95 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 ">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-500"><path d="M2 4h12" /><path d="M5 4V2h6v2" /><path d="M3 4l1 10h8l1-10" /></svg>
              </div>
              <h3 className="font-semibold text-sm text-red-700 ">Hapus File</h3>
            </div>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Hapus <strong className="text-ink ">{deleteTarget.name}</strong>? File akan dihapus permanen.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="rounded-lg border border-hairline px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-black/5 :bg-zinc-800 transition-colors">Batal</button>
              <button onClick={() => handleDeleteConfirm()} className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-2">
          <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}>
            {toast.type === "success" ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 8 7 11 13 4" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="6" /><line x1="8" y1="5" x2="8" y2="9" /><line x1="8" y1="11" x2="8" y2="11.01" />
              </svg>
            )}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
