"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddMemberModal({ open, onOpenChange, onSuccess }: AddMemberModalProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, avatar: name.charAt(0).toUpperCase() }),
      });
      if (res.ok) {
        onSuccess();
        onOpenChange(false);
        setName("");
        setRole("");
      }
    } catch {}
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden bg-[#0A0A0A] border-zinc-800 text-white rounded-[24px] ">
        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
          <DialogTitle className="text-[15px] font-semibold tracking-tight">Add Team Member</DialogTitle>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5 mb-8">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-[13px] text-zinc-400 font-medium">Name</label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full rounded-[24px] border border-zinc-800 bg-transparent px-3.5 py-2.5 text-[14px] text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="role" className="text-[13px] text-zinc-400 font-medium">Role</label>
              <input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Position / role"
                className="w-full rounded-[24px] border border-zinc-800 bg-transparent px-3.5 py-2.5 text-[14px] text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-5 py-2 text-[14px] font-medium text-zinc-300 hover:text-white transition-colors border border-zinc-700 rounded-full hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !role.trim()}
              className="px-6 py-2 text-[14px] font-medium text-zinc-950 bg-zinc-400 rounded-full hover:bg-zinc-300 transition-colors disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
