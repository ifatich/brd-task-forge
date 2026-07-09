/**
 * Returns a Tailwind color class based on progress percentage.
 */
export function getProgressColor(value: number): string {
  if (value >= 100) return "bg-ink";
  if (value >= 50) return "bg-ink";
  if (value >= 25) return "bg-ink/80";
  return "bg-ink/60";
}

/**
 * Returns a label for the progress level.
 */
export function getProgressLabel(value: number): string {
  if (value >= 100) return "Selesai";
  if (value >= 50) return "Sebagian besar";
  if (value >= 25) return "Berjalan";
  return "Baru dimulai";
}
