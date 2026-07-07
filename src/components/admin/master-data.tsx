"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { ProjectTable } from "./project-table";
import { AdminProjectDetail } from "./admin-project-detail";
import { ApiConfigForm } from "./api-config-form";
import { NotesSection } from "@/components/upload/notes-section";
import { AiProcessingIndicator } from "@/components/upload/ai-processing-indicator";

/** Helper: include admin key for write operations to /api/admin/* */
function adminHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return { "x-admin-key": "admin123", "Content-Type": "application/json", ...extra };
}

type MasterTab = "projects" | "team" | "knowledge" | "api";

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

interface KnowledgeItem {
  id: string;
  name: string;
  type: string;
  active: boolean;
  content?: string;
}

interface FormModalState {
  open: boolean;
  mode: "add" | "edit";
  title: string;
  fields: { key: string; label: string; value: string; placeholder?: string }[];
  onSave: (values: Record<string, string>) => void;
}

interface ConfirmModalState {
  open: boolean;
  title: string;
  message: string;
  itemName: string;
  onConfirm: () => void;
}

export function MasterData() {
  const [tab, setTab] = useState<MasterTab>("projects");
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  // Team state
  const [members, setMembers] = useState<TeamMember[]>([]);

  // Knowledge state
  const [knowledgeFiles, setKnowledgeFiles] = useState<KnowledgeItem[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchInitialData = useCallback(() => {
    fetch("/api/projects")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => {});
    fetch("/api/team")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setMembers(Array.isArray(data) ? data : []))
      .catch(() => {});
    fetch("/api/admin/knowledge")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setKnowledgeFiles(Array.isArray(data) ? data.map((f: any) => ({ id: f.id, name: f.name, type: f.type, active: f.active, content: f.content })) : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Modal states
  const [formModal, setFormModal] = useState<FormModalState | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);
  const [showAddKnowledge, setShowAddKnowledge] = useState(false);
  const [previewItem, setPreviewItem] = useState<KnowledgeItem | null>(null);

  // ── HELPERS ──

  const openFormModal = (opts: Omit<FormModalState, "open">) => setFormModal({ ...opts, open: true });
  const closeFormModal = () => setFormModal(null);

  const openConfirmModal = (opts: Omit<ConfirmModalState, "open">) => setConfirmModal({ ...opts, open: true });
  const closeConfirmModal = () => setConfirmModal(null);

  // ── TEAM HANDLERS ──

  const handleAddMember = async (values: Record<string, string>) => {
    const id = values.name.toLowerCase().replace(/\s+/g, "_");
    const newMember = { 
      id, 
      name: values.name, 
      avatar: values.name.charAt(0).toUpperCase(), 
      role: values.role || "Member",
      email: values.email || "",
      password: values.password || "",
    };
    try {
      await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMember),
      });
    } catch {}
    await fetchInitialData();
    closeFormModal();
  };

  const handleEditMember = (member: TeamMember) => {
    openFormModal({
      mode: "edit",
      title: "Edit Team Member",
      fields: [
        { key: "name", label: "Name", value: member.name, placeholder: "Full name" },
        { key: "role", label: "Role", value: member.role, placeholder: "Position / Role" },
        { key: "email", label: "Email", value: (member as any).email || "", placeholder: "Email address" },
        { key: "password", label: "Password (leave blank to keep)", value: "", placeholder: "New password" },
      ],
      onSave: async (values) => {
        try {
          await fetch(`/api/team/${member.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              name: values.name, 
              role: values.role || member.role,
              email: values.email || "",
              ...(values.password ? { password: values.password } : {})
            }),
          });
        } catch {}
        await fetchInitialData();
        closeFormModal();
      },
    });
  };

  const handleDeleteMember = (member: TeamMember) => {
    openConfirmModal({
      title: "Delete Team Member",
      message: "Deleted members will no longer appear in the team list and cannot be assigned to any tasks.",
      itemName: member.name,
      onConfirm: async () => {
        try {
          await fetch(`/api/team/${member.id}`, { method: "DELETE" });
        } catch {}
        await fetchInitialData();
        closeConfirmModal();
      },
    });
  };

  // ── KNOWLEDGE HANDLERS ──

  const handleAddKnowledgeFile = async (file: File, fileType: string) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch("/api/admin/knowledge", {
          method: "POST",
          headers: adminHeaders(),
          body: JSON.stringify({ name: file.name, type: fileType.toLowerCase(), content: reader.result as string }),
        });
      } catch {}
      await fetchInitialData();
    };
    reader.readAsText(file);
    setShowAddKnowledge(false);
  };

  const handleEditKnowledge = (item: KnowledgeItem) => {
    openFormModal({
      mode: "edit",
      title: "Edit Knowledge File",
      fields: [
        { key: "name", label: "File Name", value: item.name, placeholder: "e.g. system-prompt.md" },
        { key: "type", label: "Type", value: item.type, placeholder: "Prompt / Skill / Instructions" },
      ],
      onSave: async (values) => {
        try {
          await fetch(`/api/admin/knowledge/${item.id}`, {
            method: "PATCH",
            headers: adminHeaders(),
            body: JSON.stringify({ name: values.name, type: values.type }),
          });
        } catch {}
        await fetchInitialData();
        closeFormModal();
      },
    });
  };

  const handleDeleteKnowledge = (item: KnowledgeItem) => {
    openConfirmModal({
      title: "Delete Knowledge File",
      message: "The file will be permanently deleted. The AI will no longer use this file as a reference.",
      itemName: item.name,
      onConfirm: async () => {
        try {
          await fetch(`/api/admin/knowledge/${item.id}`, { method: "DELETE", headers: { "x-admin-key": "admin123" } });
        } catch {}
        await fetchInitialData();
        closeConfirmModal();
      },
    });
  };

  const tabs: { id: MasterTab; label: string; count?: number; icon: string }[] = [
    { id: "projects", label: "Projects", count: projects.length, icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
    { id: "team", label: "Team Members", count: members.length, icon: "M17 20v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1M7 2a4 4 0 100 8 4 4 0 000-8zM23 20v-1a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" },
    { id: "knowledge", label: "Knowledge", count: knowledgeFiles.filter((f) => f.active).length, icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" },
    { id: "api", label: "API Keys", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
  ];

  return (
    <div className="space-y-4">
      {/* Tab navigation */}
      <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setSelectedProject(null); }}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
              tab === t.id
                ? "text-zinc-900 dark:text-zinc-100 border-zinc-900 dark:border-white"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border-transparent"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d={t.icon} />
            </svg>
            {t.label}
            {t.count !== undefined && <span className="text-[11px] opacity-60">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* ── TAB: PROYEK ── */}
      {tab === "projects" && (
        <div>
          {selectedProject ? (
            <AdminProjectDetail project={selectedProject} onClose={() => setSelectedProject(null)} onProjectDeleted={() => setSelectedProject(null)} />
          ) : (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{projects.length} registered projects</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 dark:bg-white px-4 py-1.5 text-xs font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2v12" /><path d="M2 8h12" /></svg>
                  Upload New BRD
                </button>
              </div>
              <ProjectTable projects={projects} onSelectProject={(p) => setSelectedProject(p)} />
            </div>
          )}
        </div>
      )}

      {/* ── TAB: ANGGOTA TIM ── */}
      {tab === "team" && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {/* Header with add button */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{members.length} registered members</p>
            <button
              onClick={() => openFormModal({
                mode: "add",
                title: "Add Team Member",
                fields: [
                  { key: "name", label: "Name", value: "", placeholder: "Full name" },
                  { key: "role", label: "Role", value: "", placeholder: "Position / role" },
                  { key: "email", label: "Email", value: "", placeholder: "Email address" },
                  { key: "password", label: "Password", value: "", placeholder: "Password" },
                ],
                onSave: handleAddMember,
              })}
              className="rounded-lg bg-zinc-900 dark:bg-white px-3.5 py-1.5 text-xs font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              + Add Member
            </button>
          </div>

          {/* Member list */}
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400">{m.avatar}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{m.name}</p>
                    <p className="text-xs text-zinc-400">{m.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleEditMember(m)} className="p-1.5 rounded text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Edit">
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 2l3 3-9 9H2v-3z" /></svg>
                  </button>
                  <button onClick={() => handleDeleteMember(m)} className="p-1.5 rounded text-red-200 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" title="Delete">
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12" /><path d="M5 4V2h6v2" /><path d="M3 4l1 10h8l1-10" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: PENGETAHUAN ── */}
      {tab === "knowledge" && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{knowledgeFiles.filter((f) => f.active).length} of {knowledgeFiles.length} active files</p>
            <button onClick={() => setShowAddKnowledge(true)} className="rounded-lg bg-zinc-900 dark:bg-white px-3.5 py-1.5 text-xs font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">+ Add File</button>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {knowledgeFiles.map((f) => (
              <div key={f.id} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`inline-flex items-center justify-center w-2 h-2 rounded-full shrink-0 ${f.type === "Prompt" ? "bg-purple-400" : f.type === "Skill" ? "bg-blue-400" : "bg-amber-400"}`} />
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{f.name}</span>
                  <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">{f.type}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setKnowledgeFiles((prev) => prev.map((pf) => pf.id === f.id ? { ...pf, active: !pf.active } : pf))}
                    className={`relative inline-flex h-4 w-7 shrink-0 rounded-full border transition-colors ${f.active ? "bg-green-500 border-green-500" : "bg-zinc-200 dark:bg-zinc-700 border-zinc-200 dark:border-zinc-700"}`}
                  >
                    <span className={`inline-block h-3 w-3 rounded-full bg-white shadow transform transition-transform ${f.active ? "translate-x-3.5" : "translate-x-0.5"}`} />
                  </button>
                  <button onClick={() => setPreviewItem(f)} className="p-1 rounded text-zinc-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors" title="View">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 8s2-4 7-4 7 4 7 4-2 4-7 4-7-4-7-4z" /><circle cx="8" cy="8" r="2" /></svg>
                  </button>
                  <button onClick={() => handleEditKnowledge(f)} className="p-1 rounded text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Edit">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 2l3 3-9 9H2v-3z" /></svg>
                  </button>
                  <button onClick={() => handleDeleteKnowledge(f)} className="p-1 rounded text-red-200 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" title="Delete">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12" /><path d="M5 4V2h6v2" /><path d="M3 4l1 10h8l1-10" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: API KEYS ── */}
      {tab === "api" && <ApiConfigForm />}

      {/* ═══════════════════ GLOBAL MODALS ═══════════════════ */}

      {/* Form Modal — Add / Edit */}
      {formModal && (
        <FormModal
          title={formModal.title}
          fields={formModal.fields}
          onSave={formModal.onSave}
          onClose={closeFormModal}
        />
      )}

      {/* Confirm Modal — Delete */}
      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          itemName={confirmModal.itemName}
          onConfirm={confirmModal.onConfirm}
          onClose={closeConfirmModal}
        />
      )}

      {/* Upload BRD Modal */}
      {showUploadModal && (
        <UploadBrdModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchInitialData();
          }}
        />
      )}

      {/* Preview Knowledge Modal */}
      {previewItem && (
        <KnowledgePreviewModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
          onSave={async (name, type, content) => {
            try {
              await fetch(`/api/admin/knowledge/${previewItem.id}`, {
                method: "PATCH",
                headers: adminHeaders(),
                body: JSON.stringify({ name, type, content }),
              });
            } catch {}
            await fetchInitialData();
            setPreviewItem(null);
          }}
        />
      )}

      {/* Add Knowledge Modal — with file upload */}
      {showAddKnowledge && (
        <AddKnowledgeModal
          onAdd={handleAddKnowledgeFile}
          onClose={() => setShowAddKnowledge(false)}
        />
      )}
    </div>
  );
}

// ── REUSABLE: Form Modal ──

// ── Add Knowledge Modal — with file upload ──
function AddKnowledgeModal({ onAdd, onClose }: {
  onAdd: (file: File, fileType: string) => void;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState("Instruksi");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.name.endsWith(".md")) setFile(f);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl mx-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Add Knowledge File</h2>
          <button onClick={onClose} className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" /></svg>
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Upload area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
              isDragging
                ? "border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-900 scale-[1.02]"
                : file
                  ? "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/10"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"
            }`}
          >
            <input ref={inputRef} type="file" accept=".md" onChange={handleSelect} className="hidden" />
            <div className="pointer-events-none space-y-2">
              {file ? (
                <>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-green-500">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">{file.name}</p>
                  <p className="text-[10px] text-zinc-400">{(file.size / 1024).toFixed(1)} KB — click to change</p>
                </>
              ) : (
                <>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`mx-auto transition-colors ${isDragging ? "text-zinc-900 dark:text-white" : "text-zinc-300 dark:text-zinc-600"}`}>
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p className={`text-sm font-medium transition-colors ${isDragging ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400"}`}>
                    {isDragging ? "Drop file here" : "Upload or drag & drop .md file"}
                  </p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Markdown file containing AI instructions, prompts, or skills</p>
                </>
              )}
            </div>
          </div>

          {/* Tipe selector */}
          <div>
            <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1.5">File Type</label>
            <div className="flex gap-2">
              {["Prompt", "Skill", "Instruksi"].map((t) => (
                <button
                  key={t} type="button"
                  onClick={() => setFileType(t)}
                  className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-all ${
                    fileType === t
                      ? "border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-zinc-100 dark:border-zinc-800">
          <button onClick={onClose} className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-3.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
          <button onClick={() => file && onAdd(file, fileType)} disabled={!file} className="rounded-lg bg-zinc-900 dark:bg-white px-3.5 py-1.5 text-xs font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Add</button>
        </div>
      </div>
    </div>
  );
}

// ── Knowledge Preview/Edit Modal ──
function KnowledgePreviewModal({ item, onClose, onSave }: {
  item: KnowledgeItem;
  onClose: () => void;
  onSave: (name: string, type: string, content: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [type, setType] = useState(item.type);
  const [content, setContent] = useState(item.content || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(name, type, content);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[6vh] pb-[6vh] bg-black/30 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-3xl rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl mx-4 animate-in fade-in zoom-in-95 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`inline-flex items-center justify-center w-2.5 h-2.5 rounded-full shrink-0 ${
              type === "Prompt" ? "bg-purple-400" : type === "Skill" ? "bg-blue-400" : "bg-amber-400"
            }`} />
            <div className="min-w-0">
              {isEditing ? (
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 bg-transparent border-b border-zinc-300 dark:border-zinc-600 focus:outline-none focus:border-zinc-900 dark:focus:border-white w-full"
                />
              ) : (
                <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">{name}</h2>
              )}
            </div>
            {isEditing ? (
              <select value={type} onChange={(e) => setType(e.target.value)}
                className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1 text-[10px] text-zinc-600 dark:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                {["Prompt", "Skill", "Instruksi"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            ) : (
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 shrink-0">{type}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Edit content">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 2l3 3-9 9H2v-3z" />
                </svg>
              </button>
            ) : (
              <button onClick={() => setIsEditing(false)} className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Back to view">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 8s2-4 7-4 7 4 7 4-2 4-7 4-7-4-7-4z" /><circle cx="8" cy="8" r="2" />
                </svg>
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" /></svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {isEditing ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full min-h-[55vh] rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white resize-none"
              placeholder="Knowledge content in markdown format..."
            />
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {content.split("\n").map((line, i) => {
                if (line.startsWith("# ")) {
                  return <h1 key={i} className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-4 mb-2">{line.replace("# ", "")}</h1>;
                }
                if (line.startsWith("## ")) {
                  return <h2 key={i} className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-3 mb-1.5">{line.replace("## ", "")}</h2>;
                }
                if (line.startsWith("### ")) {
                  return <h3 key={i} className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-2 mb-1">{line.replace("### ", "")}</h3>;
                }
                if (line.startsWith("- **") && line.includes("**")) {
                  return <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 ml-4 list-disc">{line.replace(/^- \*\*(.+?)\*\*:/, (_, bold) => `<strong>${bold}</strong>:`)}</li>;
                }
                if (line.startsWith("- ")) {
                  return <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 ml-4 list-disc">{line.replace("- ", "")}</li>;
                }
                if (/^\d+\. /.test(line)) {
                  return <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 ml-4 list-decimal">{line.replace(/^\d+\. /, "")}</li>;
                }
                if (line.startsWith("```")) {
                  return <div key={i} className="my-1" />;
                }
                if (line.trim() === "") {
                  return <div key={i} className="h-2" />;
                }
                return <p key={i} className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{line}</p>;
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
          <span className="text-[10px] text-zinc-400">
            {isEditing ? "Editing content — markdown supported" : `${content.length} characters`}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-3.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {isEditing ? "Cancel" : "Close"}
            </button>
            {isEditing && (
              <button onClick={handleSave} disabled={saving || !content.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 dark:bg-white px-3.5 py-1.5 text-xs font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <><span className="animate-spin w-3 h-3 border-2 border-white dark:border-zinc-900 border-t-transparent rounded-full" /> Saving...</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 13H3V3h7l3 3v7z" /><path d="M5 13V9h6v4" /></svg>
                  Save</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FormModal({ title, fields, onSave, onClose }: {
  title: string;
  fields: { key: string; label: string; value: string; placeholder?: string }[];
  onSave: (values: Record<string, string>) => void;
  onClose: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, f.value]))
  );
  const isValid = fields.every((f) => values[f.key]?.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl mx-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" /></svg>
          </button>
        </div>
        <div className="p-5 space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">{f.label}</label>
              <input
                type={f.key === "password" ? "password" : "text"} value={values[f.key]} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                placeholder={f.placeholder} autoFocus={f.key === "name"}
                onKeyDown={(e) => e.key === "Enter" && isValid && onSave(values)}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-zinc-100 dark:border-zinc-800">
          <button onClick={onClose} className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-3.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
          <button onClick={() => onSave(values)} disabled={!isValid} className="rounded-lg bg-zinc-900 dark:bg-white px-3.5 py-1.5 text-xs font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {title.startsWith("Add") ? "Add" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── REUSABLE: Confirm Modal ──
function ConfirmModal({ title, message, itemName, onConfirm, onClose }: {
  title: string;
  message: string;
  itemName: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [confirmText, setConfirmText] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-sm rounded-xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-zinc-950 shadow-2xl mx-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-red-100 dark:border-red-900/30">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-500"><path d="M2 4h12" /><path d="M5 4V2h6v2" /><path d="M3 4l1 10h8l1-10" /></svg>
          </div>
          <h2 className="font-semibold text-sm text-red-700 dark:text-red-400">{title}</h2>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{message}</p>
          <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-3">
            <p className="text-xs text-red-600 dark:text-red-400"><strong>Warning:</strong> This action cannot be undone.</p>
          </div>
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1.5">Type <strong className="text-zinc-700 dark:text-zinc-300">{itemName}</strong> to confirm:</label>
            <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder={itemName}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-zinc-100 dark:border-zinc-800">
          <button onClick={onClose} className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-3.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={confirmText !== itemName} className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── PDF Preview (dynamic import, client-only) ──
const PdfPreview = dynamic(
  () => import("@/components/upload/pdf-preview").then((m) => m.PdfPreview),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-zinc-400 dark:text-zinc-500">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
          Memuat pratinjau...
        </div>
      </div>
    ),
  }
);

const FlowDiagram = dynamic(
  () => import("@/components/diagram/flow-diagram").then((m) => m.FlowDiagram),
  { ssr: false, loading: () => <div className="flex items-center justify-center py-12 text-sm text-zinc-400"><span className="animate-spin w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full mr-2" /> Loading diagram...</div> }
);

// ── Upload BRD Modal (mirror user upload flow) ──
function UploadBrdModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [stage, setStage] = useState<"idle" | "extracting" | "analyzing" | "verifying" | "diagramming" | "preview" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const [previewData, setPreviewData] = useState<any>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<"tasks" | "diagram">("tasks");

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    setStage("extracting");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (notes.trim()) formData.append("notes", notes);

      // Progress stages during fetch — AI takes 1-3 minutes
      const fetchPromise = fetch("/api/pipeline?preview=true", {
        method: "POST",
        body: formData,
      });

      // Advance stages progressively while waiting for AI
      let cancelled = false;
      const stageTimers = [
        { after: 15000, stage: "analyzing" as const },
        { after: 300000, stage: "verifying" as const },
        { after: 420000, stage: "diagramming" as const },
      ];
      stageTimers.forEach(({ after, stage: s }) => {
        setTimeout(() => { if (!cancelled) setStage(s); }, after);
      });

      const res = await fetchPromise;
      cancelled = true;

      if (!res.ok) throw new Error("Gagal memproses dokumen");

      // Brief cosmetic stages after completion
      if (stage === "diagramming") {
        // Already on diagramming, keep it
      } else {
        setStage("verifying");
        await new Promise((r) => setTimeout(r, 300));
        setStage("diagramming");
        await new Promise((r) => setTimeout(r, 300));
      }

      const data = await res.json();
      setPreviewData(data);
      setStage("preview");
    } catch (e: any) {
      setError(e.message || "An error occurred");
      setStage("error");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!previewData) return;
    setStage("saving");
    try {
      const res = await fetch("/api/pipeline/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: previewData.projectName,
          tasks: previewData.tasks,
          diagram: previewData.diagram,
          extractedText: previewData.extractedText,
          fileName: previewData.fileName,
          fileBuffer: previewData.fileBuffer,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const savedData = await res.json();
      setPreviewData({ ...previewData, projectId: savedData.projectId, saved: true });
      setStage("saved");
    } catch (e: any) {
      setError(e.message || "Failed to save data");
      setStage("error");
    }
  };

  const handleRetry = () => {
    setStage("idle");
    setError("");
    setPreviewData(null);
  };

  const summary = previewData?.summary;
  const tasks = previewData?.tasks || [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] pb-[8vh] bg-black/30 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-2xl rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl mx-4 animate-in fade-in zoom-in-95 flex flex-col max-h-[84vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-950/30">
              {stage === "saved" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-600 dark:text-green-400">
                  <polyline points="4 8 7 11 12 5" /><polyline points="12 5 19 12 22 9" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-600 dark:text-amber-400">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
              )}
            </div>
            <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              {stage === "preview" ? "Analysis Result Preview" : 
               stage === "saving" ? "Saving..." : 
               stage === "saved" ? "Successfully Saved" : "Upload New BRD"}
            </h2>
          </div>
          <button onClick={onClose} disabled={uploading || stage === "saving"} className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* PROCESSING STAGES */}
          {(stage === "extracting" || stage === "analyzing" || stage === "verifying" || stage === "diagramming") && (
            <div>
              <div className="mb-4">
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Processing Document</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">AI is analyzing the BRD and generating UI/UX tasks.</p>
              </div>
              <AiProcessingIndicator currentStage={stage} onRetry={handleRetry} />
            </div>
          )}

          {/* SAVING STAGE */}
          {stage === "saving" && (
            <div className="flex flex-col items-center justify-center py-12">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin text-zinc-400 mb-3">
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Saving data to database...</p>
            </div>
          )}

          {/* PREVIEW STAGE — show generated data for review */}
          {stage === "preview" && previewData && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-3 text-center">
                  <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{summary?.taskCount || 0}</div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Task (Modul)</div>
                </div>
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-3 text-center">
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{summary?.screenCount || 0}</div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Screen (Sub-task)</div>
                </div>
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-3 text-center">
                  <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{summary?.elementCount || 0}</div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">UI Elements</div>
                </div>
              </div>

              {/* Preview tab toggle */}
              <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => setPreviewTab("tasks")}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-[1px] ${
                    previewTab === "tasks"
                      ? "text-zinc-900 dark:text-zinc-100 border-zinc-900 dark:border-white"
                      : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border-transparent"
                  }`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                  Task
                </button>
                <button
                  onClick={() => setPreviewTab("diagram")}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-[1px] ${
                    previewTab === "diagram"
                      ? "text-zinc-900 dark:text-zinc-100 border-zinc-900 dark:border-white"
                      : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border-transparent"
                  }`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
                  Diagram
                </button>
              </div>

              {/* Task list */}
              {previewTab === "tasks" && (
              <div>
                <h4 className="font-medium text-xs text-zinc-700 dark:text-zinc-300 mb-2">Task & Sub-task List</h4>
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
                  {tasks.map((task: any, i: number) => (
                    <div key={i}>
                      <button
                        onClick={() => setExpandedTask(expandedTask === task.title ? null : task.title)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                      >
                        <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                          task.priority === "high" ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" :
                          task.priority === "medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" :
                          "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                        }`}>
                          {task.priority === "high" ? "High" : task.priority === "medium" ? "Medium" : "Low"}
                        </span>
                        <span className="flex-1 text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{task.title}</span>
                        <span className="text-[10px] text-zinc-400">{task.subTasks?.length || 0} screen</span>
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
                          className={`text-zinc-400 transition-transform duration-200 shrink-0 ${expandedTask === task.title ? "rotate-90" : ""}`}>
                          <path d="M6 4l4 4-4 4" />
                        </svg>
                      </button>
                      {expandedTask === task.title && (
                        <div className="px-3 pb-2.5 space-y-1">
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed pl-1">{task.description}</p>
                          {task.subTasks?.map((st: any, si: number) => (
                            <div key={si} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900/50">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-zinc-400">
                                <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                              </svg>
                              <span className="flex-1 text-xs text-zinc-600 dark:text-zinc-400">{st.title}</span>
                              <span className="text-[9px] text-zinc-400">{st.elements?.length || 0} elements</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* Diagram preview */}
              {previewTab === "diagram" && previewData?.diagram?.mermaidSyntax && (
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Flow Diagram</span>
                  </div>
                  <div className="p-3">
                    <FlowDiagram
                      mermaidSyntax={previewData.diagram.mermaidSyntax}
                      nodeDetails={previewData.diagram.nodeDetails}
                      showLegend={false}
                    />
                  </div>
                </div>
              )}

              {/* Info banner */}
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 p-3 flex items-start gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="12" x2="12" y2="16" /><line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  This data is a preview. Click <strong>Save</strong> to store it in the database, or <strong>Cancel</strong> to discard the results.
                </p>
              </div>
            </div>
          )}

          {/* SAVED STAGE — navigation cards */}
          {stage === "saved" && previewData && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/20 p-5 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-950/30 mb-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                    <polyline points="4 8 7 11 12 5" /><polyline points="12 5 19 12 22 9" />
                  </svg>
                </div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Successfully Saved!</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{summary?.taskCount} tasks · {summary?.screenCount} screens · {summary?.elementCount} UI elements</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { href: `/project/${previewData.projectId}`, label: "Task Board", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-950/30" },
                  { href: `/project/${previewData.projectId}/diagram`, label: "Flow Diagram", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-950/30" },
                  { href: `/project/${previewData.projectId}/manage`, label: "Task Details", icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z", color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-950/30" },
                ].map((item) => (
                  <a key={item.label} href={item.href} className="group rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 p-3 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-200">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg} shrink-0`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={item.color}><path d={item.icon} /></svg>
                      </div>
                      <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 group-hover:underline">{item.label}</span>
                    </div>
                  </a>
                ))}
              </div>
              <div className="text-center">
                <button onClick={() => { setStage("idle"); setPreviewData(null); onSuccess(); }} className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors underline underline-offset-2">
                  Upload another document
                </button>
              </div>
            </div>
          )}

          {/* ERROR STAGE */}
          {stage === "error" && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/30 mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Failed</h3>
              <p className="text-sm text-red-500 mt-1">{error}</p>
              <button onClick={handleRetry} className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 dark:bg-white px-4 py-2 text-xs font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="1 4 1 10 7 10" /><path d="M3.51 12a6 6 0 101.01-7.99" /></svg>
                Try Again
              </button>
            </div>
          )}

          {/* IDLE STAGE — upload form */}
          {stage === "idle" && (
            <>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-[9px] font-bold text-white dark:text-zinc-900">1</span>
                  <span className="font-medium text-xs text-zinc-700 dark:text-zinc-300">Upload BRD File</span>
                </div>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f && f.type === "application/pdf") setFile(f); }}
                  onClick={() => document.getElementById("admin-brd-upload")?.click()}
                  className={`rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
                    file ? "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/10" : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                  }`}
                >
                  <input id="admin-brd-upload" type="file" accept=".pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }} className="hidden" />
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-500 shrink-0">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                      </svg>
                      <div className="text-left">
                        <p className="font-medium text-sm text-green-700 dark:text-green-400">{file.name}</p>
                        <p className="text-[10px] text-zinc-400">{(file.size / 1024).toFixed(1)} KB — click to change</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-zinc-300 dark:text-zinc-600">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Upload or drag & drop PDF file</p>
                      <p className="text-xs text-zinc-400">Business Requirements Document (BRD) file</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-[9px] font-bold text-zinc-500 dark:text-zinc-400">2</span>
                  <span className="font-medium text-xs text-zinc-700 dark:text-zinc-300">Document Preview</span>
                </div>
                <PdfPreview file={file} />
              </div>

              <div>
                <NotesSection value={notes} onChange={setNotes} disabled={!file} />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {stage === "idle" && (
          <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
            <button onClick={onClose} className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-3.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={!file || uploading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 dark:bg-white px-4 py-1.5 text-xs font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10" /><path d="M3 8l5 5 5-5" /></svg>
              Start Analysis
            </button>
          </div>
        )}

        {stage === "preview" && (
          <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
            <button onClick={handleRetry} className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-3.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
            <button onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 13H3V3h7l3 3v7z" /><path d="M5 13V9h6v4" /></svg>
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

