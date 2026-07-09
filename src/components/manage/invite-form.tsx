"use client";

import { useState } from "react";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

interface InviteFormProps {
  onInvite?: (email: string) => void;
}

export function InviteForm({ onInvite }: InviteFormProps) {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const error = touched && email.length > 0 && !isValidEmail(email)
    ? "Format email tidak valid"
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) return;

    setStatus("sending");
    // Simulasi kirim undangan
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("sent");
    onInvite?.(email);
    setTimeout(() => {
      setEmail("");
      setStatus("idle");
      setTouched(false);
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[24px] border border-zinc-200 p-5">
      <h3 className="font-semibold text-sm text-zinc-900 mb-1">
        Undang Anggota Baru
      </h3>
      <p className="text-xs text-zinc-500 mb-4">
        Kirim undangan email ke calon anggota tim.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="email@example.com"
            disabled={status === "sending" || status === "sent"}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm transition-colors ${
              error
                ? "border-red-300 focus:ring-red-500"
                : "border-zinc-200 focus:ring-zinc-900 :ring-white"
            } bg-white text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 disabled:opacity-50`}
          />
          {error && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="6" /><line x1="8" y1="5" x2="8" y2="9" /><line x1="8" y1="11" x2="8" y2="11.01" />
              </svg>
              {error}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={!isValidEmail(email) || status === "sending" || status === "sent"}
          className="shrink-0 inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 :bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {status === "sending" ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              Mengirim...
            </>
          ) : status === "sent" ? (
            <>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 8 7 11 12 5" />
              </svg>
              Terkirim!
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 4l6 4 6-4" />
                <rect x="2" y="4" width="12" height="9" rx="1.5" />
                <path d="M2 4l6 4 6-4" />
              </svg>
              Undang
            </>
          )}
        </button>
      </div>
    </form>
  );
}
