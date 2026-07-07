export interface ProjectLog {
  id: string;
  projectId: string;
  action: string;
  detail: string;
  user: string;
  timestamp: string;
}

export const projectLogs: Record<string, ProjectLog[]> = {
  "proj-001": [
    {
      id: "log-001",
      projectId: "proj-001",
      action: "Proyek dibuat",
      detail: "BRD Aplikasi Mobile Banking berhasil diupload dan dianalisis AI",
      user: "System AI",
      timestamp: "2026-06-15 09:30",
    },
    {
      id: "log-002",
      projectId: "proj-001",
      action: "Tugas diperbarui",
      detail: "Task 'Halaman Daftar Transfer' dipindahkan ke In Progress",
      user: "andi_designer",
      timestamp: "2026-06-20 14:15",
    },
    {
      id: "log-003",
      projectId: "proj-001",
      action: "Tugas diperbarui",
      detail: "Task 'Halaman Konfirmasi Transfer' dipindahkan ke In Progress",
      user: "andi_designer",
      timestamp: "2026-06-22 10:00",
    },
    {
      id: "log-004",
      projectId: "proj-001",
      action: "Tugas selesai",
      detail: "Task 'Halaman Riwayat Mutasi' dipindahkan ke Done",
      user: "siti_ui",
      timestamp: "2026-06-28 16:45",
    },
    {
      id: "log-005",
      projectId: "proj-001",
      action: "Tugas selesai",
      detail: "Task 'Halaman Detail Transaksi' dipindahkan ke Done",
      user: "siti_ui",
      timestamp: "2026-07-02 11:30",
    },
    {
      id: "log-006",
      projectId: "proj-001",
      action: "Catatan ditambahkan",
      detail: "Instruksi: Fokus pada flow login dan transfer terlebih dahulu",
      user: "Budi (Designer)",
      timestamp: "2026-07-03 08:20",
    },
  ],
  "proj-002": [
    {
      id: "log-007",
      projectId: "proj-002",
      action: "Proyek dibuat",
      detail: "BRD E-Commerce Platform berhasil diupload dan dianalisis AI",
      user: "System AI",
      timestamp: "2026-06-20 10:00",
    },
  ],
  "proj-005": [
    {
      id: "log-008",
      projectId: "proj-005",
      action: "Proyek dibuat",
      detail: "BRD Portal Self-Service Karyawan berhasil diupload dan dianalisis AI",
      user: "System AI",
      timestamp: "2026-04-10 13:00",
    },
    {
      id: "log-009",
      projectId: "proj-005",
      action: "Tugas selesai",
      detail: "Task 'Halaman Login' dipindahkan ke Done",
      user: "tim_design",
      timestamp: "2026-05-12 09:00",
    },
    {
      id: "log-010",
      projectId: "proj-005",
      action: "Diagram diunduh",
      detail: "Diagram alur visual diunduh sebagai PNG",
      user: "tim_design",
      timestamp: "2026-06-01 15:30",
    },
  ],
  "proj-003": [
    {
      id: "log-011", projectId: "proj-003", action: "Proyek dibuat",
      detail: "BRD Dashboard Analitik HR berhasil diupload dan dianalisis AI",
      user: "System AI", timestamp: "2026-05-01 09:00",
    },
    {
      id: "log-012", projectId: "proj-003", action: "Tugas selesai",
      detail: "Semua tugas telah selesai dikerjakan",
      user: "tim_hr", timestamp: "2026-06-28 16:00",
    },
  ],
  "proj-004": [
    {
      id: "log-013", projectId: "proj-004", action: "Proyek dibuat",
      detail: "BRD Manajemen Inventaris berhasil diupload",
      user: "System AI", timestamp: "2026-07-01 10:00",
    },
  ],
};
