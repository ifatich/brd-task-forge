export interface Project {
  id: string;
  title: string;
  description: string;
  status: "active" | "completed" | "draft";
  progress: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  createdAt: string;
  updatedAt: string;
  fileUrl: string;
}

export const mockProjects: Project[] = [
  {
    id: "proj-001",
    title: "Aplikasi Mobile Banking",
    description: "BRD untuk pengembangan aplikasi mobile banking dengan fitur transfer, mutasi, dan pembayaran.",
    status: "active",
    progress: 65,
    totalTasks: 24,
    completedTasks: 12,
    inProgressTasks: 6,
    todoTasks: 6,
    createdAt: "2026-06-15",
    updatedAt: "2026-07-05",
    fileUrl: "/files/mobile-banking-brd.pdf",
  },
  {
    id: "proj-002",
    title: "E-Commerce Platform",
    description: "BRD untuk platform e-commerce dengan manajemen produk, keranjang, dan checkout.",
    status: "active",
    progress: 35,
    totalTasks: 32,
    completedTasks: 8,
    inProgressTasks: 10,
    todoTasks: 14,
    createdAt: "2026-06-20",
    updatedAt: "2026-07-04",
    fileUrl: "/files/ecommerce-brd.pdf",
  },
  {
    id: "proj-003",
    title: "Dashboard Analitik HR",
    description: "BRD untuk dashboard analitik SDM dengan visualisasi data karyawan dan laporan.",
    status: "completed",
    progress: 100,
    totalTasks: 18,
    completedTasks: 18,
    inProgressTasks: 0,
    todoTasks: 0,
    createdAt: "2026-05-01",
    updatedAt: "2026-06-28",
    fileUrl: "/files/hr-analytics-brd.pdf",
  },
  {
    id: "proj-004",
    title: "Sistem Manajemen Inventaris",
    description: "BRD untuk sistem manajemen inventaris gudang dengan tracking stok real-time.",
    status: "draft",
    progress: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    todoTasks: 0,
    createdAt: "2026-07-01",
    updatedAt: "2026-07-01",
    fileUrl: "/files/inventory-brd.pdf",
  },
  {
    id: "proj-005",
    title: "Portal Self-Service Karyawan",
    description: "BRD untuk portal karyawan dengan fitur pengajuan cuti, izin, dan lihat slip gaji.",
    status: "active",
    progress: 80,
    totalTasks: 20,
    completedTasks: 16,
    inProgressTasks: 2,
    todoTasks: 2,
    createdAt: "2026-04-10",
    updatedAt: "2026-07-03",
    fileUrl: "/files/employee-portal-brd.pdf",
  },
];

export function getStatusColor(status: Project["status"]): string {
  switch (status) {
    case "active":
      return "bg-blue-500";
    case "completed":
      return "bg-green-500";
    case "draft":
      return "bg-zinc-300 dark:bg-zinc-600";
  }
}

export function getStatusLabel(status: Project["status"]): string {
  switch (status) {
    case "active":
      return "Aktif";
    case "completed":
      return "Selesai";
    case "draft":
      return "Draft";
  }
}
