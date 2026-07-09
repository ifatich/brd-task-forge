"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

const MAX_NOTES_LENGTH = 500;
const SUGGESTIONS = [
  "Fokus pada modul login, registrasi, dan dashboard utama",
  "Abaikan bagian laporan dan analitik, prioritaskan alur pengguna inti",
  "Bedakan task untuk layar mobile vs desktop",
  "Prioritas tinggi pada fitur yang berkaitan dengan keamanan",
];

interface NotesSectionProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function NotesSection({ value, onChange, disabled }: NotesSectionProps) {
  const [showSuggestions, setShowSuggestions] = useState(true);
  const remaining = MAX_NOTES_LENGTH - value.length;
  const isNearLimit = remaining < 50;

  const handleSelectSuggestion = (suggestion: string) => {
    const separator = value ? ". " : "";
    const newValue = value + separator + suggestion;
    if (newValue.length <= MAX_NOTES_LENGTH) {
      onChange(newValue);
    }
    setShowSuggestions(false);
  };

  const handleClear = () => {
    onChange("");
    setShowSuggestions(true);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-[11px] font-bold text-ink/60 ">
            3
          </span>
          <h2 className="font-semibold text-sm text-ink ">
            Catatan & Instruksi Khusus
          </h2>
        </div>
        {value && (
          <button
            onClick={handleClear}
            className="text-xs text-ink/40 hover:text-ink/60 :text-zinc-300 transition-colors"
          >
            Hapus catatan
          </button>
        )}
      </div>

      {/* Textarea */}
      <div className="relative">
        <Textarea
          placeholder="Contoh: Fokus pada modul login dan dashboard. Abaikan bagian laporan."
          value={value}
          onChange={(e) => {
            if (e.target.value.length <= MAX_NOTES_LENGTH) {
              onChange(e.target.value);
            }
          }}
          disabled={disabled}
          className={`min-h-[110px] resize-y text-sm ${
            isNearLimit ? "focus-visible:ring-amber-500" : ""
          }`}
        />

        {/* Character counter */}
        <div
          className={`absolute bottom-2 right-3 text-[10px] tabular-nums ${
            isNearLimit
              ? "text-amber-500 font-medium"
              : "text-ink/40 "
          }`}
        >
          {remaining}/{MAX_NOTES_LENGTH}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-ink/40 ">
        Opsional. Beri petunjuk khusus agar AI fokus pada area tertentu. Maks. {MAX_NOTES_LENGTH} karakter.
      </p>

      {/* Quick suggestions */}
      {showSuggestions && !disabled && (
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-ink/40 uppercase tracking-wider">
            Contoh instruksi
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="text-left text-xs px-2.5 py-1.5 rounded-[24px] border border-hairline text-ink/60 hover:bg-black/5 :bg-zinc-800 hover:border-hairline :border-zinc-700 transition-all"
              >
                {suggestion.length > 50
                  ? suggestion.slice(0, 50) + "..."
                  : suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Show toggle when text exists */}
      {!showSuggestions && !disabled && value && (
        <button
          onClick={() => setShowSuggestions(true)}
          className="text-xs text-ink/40 hover:text-ink/60 :text-zinc-300 transition-colors"
        >
          + Tampilkan contoh instruksi
        </button>
      )}
    </div>
  );
}
