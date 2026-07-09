"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_TYPE = "application/pdf";

interface FileUploadZoneProps {
  onFileSelected: (file: File) => void;
  selectedFile: File | null;
}

interface FileError {
  type: "size" | "format" | "unknown";
  message: string;
}

export function FileUploadZone({ onFileSelected, selectedFile }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<FileError | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): FileError | null => {
    if (file.type !== ACCEPTED_TYPE) {
      return {
        type: "format",
        message: "Hanya file PDF yang diperbolehkan.",
      };
    }
    if (file.size > MAX_FILE_SIZE) {
      return {
        type: "size",
        message: `File terlalu besar. Maksimal 10 MB (file ini ${formatFileSize(file.size)}).`,
      };
    }
    return null;
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    onFileSelected(file);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      e.target.value = "";
      return;
    }

    onFileSelected(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
    onFileSelected(null as unknown as File);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !selectedFile && inputRef.current?.click()}
        className={`relative rounded-[24px] border-2 border-dashed p-8 text-center transition-all ${
          error
            ? "border-red-300 bg-red-50/50 "
            : isDragging
              ? "border-zinc-900 bg-surface-soft scale-[1.01]"
              : selectedFile
                ? "border-green-300 bg-green-50/50 "
                : "border-hairline hover:border-zinc-400 :border-zinc-600"
        } ${!selectedFile ? "cursor-pointer" : ""}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !selectedFile) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        aria-label={selectedFile ? "Selected file" : "Upload PDF file"}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleFileInput}
          aria-hidden="true"
        />

        {selectedFile ? (
          <div className="space-y-3">
            {/* Success icon */}
            <div className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 ">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-600 "
                >
                  <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
            </div>

            {/* File info */}
            <div>
              <p className="font-medium text-sm text-ink break-all">
                {selectedFile.name}
              </p>
              <p className="text-xs text-ink/60 mt-0.5">
                {formatFileSize(selectedFile.size)} &mdash; PDF divalidasi ✓
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleRemove}
                className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 :text-red-300 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="4" x2="12" y2="12" />
                  <line x1="12" y1="4" x2="4" y2="12" />
                </svg>
                Hapus
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
                className="inline-flex items-center gap-1 text-xs text-ink/60 hover:text-ink/80 :text-zinc-300 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3v10" />
                  <path d="M3 8l5 5 5-5" />
                </svg>
                Ganti file
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Upload icon */}
            <div className="flex justify-center">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full transition-all ${
                  isDragging
                    ? "bg-zinc-900 scale-110"
                    : "bg-black/5 "
                }`}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-colors ${
                    isDragging
                      ? "text-white "
                      : "text-ink/60 "
                  }`}
                >
                  <path d="M12 16V4" />
                  <path d="M4 12l8 8 8-8" />
                  <path d="M4 20h16" />
                </svg>
              </div>
            </div>

            {/* Text */}
            <div>
              {isDragging ? (
                <p className="font-medium text-sm text-ink ">
                  Lepaskan file di sini
                </p>
              ) : (
                <>
                  <p className="font-medium text-sm text-ink/80 ">
                    Tarik & lepas file PDF di sini
                  </p>
                  <p className="text-xs text-ink/60 mt-1">
                    atau <span className="text-ink/80 underline underline-offset-2">klik untuk memilih</span> &mdash; maks. 10 MB
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 mt-3 text-sm" role="alert">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 mt-0.5 text-red-500"
          >
            <circle cx="8" cy="8" r="6" />
            <line x1="8" y1="5" x2="8" y2="9" />
            <line x1="8" y1="11" x2="8" y2="11.01" />
          </svg>
          <div>
            <p className="font-medium text-red-600 text-xs">
              {error.type === "size"
                ? "File terlalu besar"
                : error.type === "format"
                  ? "Format tidak didukung"
                  : "Terjadi kesalahan"}
            </p>
            <p className="text-xs text-red-500 mt-0.5">
              {error.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
