type TaskStatus = "todo" | "in-progress" | "done";

/**
 * Trigger download of a CSV file via the API export endpoint.
 */
export function downloadCsv(
  projectId: string,
  projectName: string,
  scope: "all" | TaskStatus
) {
  const url = `/api/projects/${projectId}/export`;
  const scopeLabel = scope === "all" ? "semua-tugas" : scope;
  const filename = `${projectName
    .replace(/\s+/g, "-")
    .toLowerCase()}_${scopeLabel}.csv`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
