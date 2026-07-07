type TaskStatus = "todo" | "in-progress" | "done";

/**
 * Generate and download a PDF report for a project's tasks via the API export endpoint.
 */
export async function downloadPdf(
  projectId: string,
  projectName: string,
  scope: "all" | TaskStatus
) {
  const url = `/api/projects/${projectId}/export-pdf`;
  const scopeLabel =
    scope === "all" ? "semua-tugas" : scope === "in-progress" ? "in-progress" : scope;
  const filename = `${projectName
    .replace(/\s+/g, "-")
    .toLowerCase()}_${scopeLabel}.pdf`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
