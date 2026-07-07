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
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
            3
          </span>
          <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
            Catatan & Instruksi Khusus
          </h2>
        </div>
        {value && (
          <button
            onClick={handleClear}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
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
              ? "text-amber-500 dark:text-amber-400 font-medium"
              : "text-zinc-400 dark:text-zinc-500"
          }`}
        >
          {remaining}/{MAX_NOTES_LENGTH}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        Opsional. Beri petunjuk khusus agar AI fokus pada area tertentu. Maks. {MAX_NOTES_LENGTH} karakter.
      </p>

      {/* Quick suggestions */}
      {showSuggestions && !disabled && (
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Contoh instruksi
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="text-left text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
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
          className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          + Tampilkan contoh instruksi
        </button>
      )}
    </div>
  );
}
