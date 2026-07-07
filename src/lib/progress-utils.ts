/**
 * Returns a Tailwind color class based on progress percentage.
 */
export function getProgressColor(value: number): string {
  if (value >= 100) return "bg-green-500";
  if (value >= 50) return "bg-blue-500";
  if (value >= 25) return "bg-amber-500";
  return "bg-zinc-400 dark:bg-zinc-500";
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
