import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({
    url: process.env.TURSO_DATABASE_URL || "file:./dev.db",
  }),
});

async function main() {
  console.log("🌱 Seeding database...\n");

  // ── 1. Team Members ──
  console.log("📋 Creating team members...");
  
  const admin = await prisma.teamMember.upsert({
    where: { id: "admin-001" },
    update: {},
    create: {
      id: "admin-001",
      name: "Budi (Admin)",
      email: "budi@example.com",
      avatar: "B",
      role: "Project Manager",
    },
  });
  
  const dev1 = await prisma.teamMember.upsert({
    where: { id: "member-001" },
    update: {},
    create: {
      id: "member-001",
      name: "Siti (Developer)",
      email: "siti@example.com",
      avatar: "S",
      role: "Frontend Engineer",
    },
  });

  const dev2 = await prisma.teamMember.upsert({
    where: { id: "member-002" },
    update: {},
    create: {
      id: "member-002",
      name: "Agus (Designer)",
      email: "agus@example.com",
      avatar: "A",
      role: "UI/UX Designer",
    },
  });
  console.log(`   → ${admin.name}, ${dev1.name}, ${dev2.name}`);

  // ── 2. Project ──
  console.log("\n📋 Creating project...");
  const project = await prisma.project.upsert({
    where: { id: "proj-seed-001" },
    update: {},
    create: {
      id: "proj-seed-001",
      title: "Aplikasi Mobile Banking",
      description: `--- Metadata ---
Judul: Aplikasi Mobile Banking
Jumlah Halaman: 1

--- Konten ---

[Halaman 1]
BRD Aplikasi Mobile Banking

Modul Autentikasi: Halaman Login, Halaman Registrasi, Halaman Lupa Password
Modul Dashboard: Halaman Utama, Halaman Statistik
Modul Transaksi: Halaman Daftar Transaksi, Halaman Detail Transaksi, Halaman Konfirmasi
Modul Laporan: Halaman Laporan Bulanan, Halaman Export Data`,
      status: "active",
      fileUrl: "/uploads/sample-brd.pdf",
      userId: admin.id, // Project belongs to Admin
    },
  });
  console.log(`   → ${project.title} (${project.status})`);

  // ── 3. Tasks + Sub-tasks ──
  console.log("\n📋 Creating tasks and sub-tasks...");

  const task1 = await prisma.task.upsert({
    where: { id: "task-seed-001" },
    update: {},
    create: {
      id: "task-seed-001",
      projectId: project.id,
      title: "Modul Autentikasi",
      description: "Modul untuk login, registrasi, dan manajemen password pengguna.",
      goals: JSON.stringify(["Fitur autentikasi lengkap dan aman", "Mudah digunakan oleh pengguna"]),
      definitionOfDone: "Semua screen autentikasi selesai, terhubung, dan siap produksi.",
      status: "in-progress",
      priority: "high",
      assignee: dev1.name,
      assigneeId: dev1.id, // Assigned to Siti
      order: 0,
    },
  });

  await prisma.subTask.upsert({
    where: { id: "subtask-seed-001" },
    update: {},
    create: {
      id: "subtask-seed-001",
      taskId: task1.id,
      title: "Halaman Login",
      description: "Desain dan implementasi halaman login dengan form email dan password.",
      goals: JSON.stringify(["Halaman login berfungsi dengan baik", "User experience yang optimal"]),
      definitionOfDone: "Halaman login selesai, responsif, dan terintegrasi dengan backend.",
      elements: JSON.stringify(["Form Email", "Form Password", "Tombol Masuk", "Link Lupa Password"]),
      done: true,
      order: 0,
    },
  });

  await prisma.subTask.upsert({
    where: { id: "subtask-seed-002" },
    update: {},
    create: {
      id: "subtask-seed-002",
      taskId: task1.id,
      title: "Halaman Registrasi",
      description: "Desain dan implementasi halaman registrasi pengguna baru.",
      goals: JSON.stringify(["Form registrasi lengkap", "Validasi input berfungsi"]),
      definitionOfDone: "Halaman registrasi selesai dengan validasi dan integrasi API.",
      elements: JSON.stringify(["Form Nama", "Form Email", "Form Password", "Tombol Daftar"]),
      done: false,
      order: 1,
    },
  });

  await prisma.subTask.upsert({
    where: { id: "subtask-seed-003" },
    update: {},
    create: {
      id: "subtask-seed-003",
      taskId: task1.id,
      title: "Halaman Lupa Password",
      description: "Halaman untuk reset password melalui email.",
      goals: JSON.stringify(["Reset password berfungsi", "Notifikasi email terkirim"]),
      definitionOfDone: "Flow lupa password selesai dan teruji.",
      elements: JSON.stringify(["Form Email", "Tombol Kirim", "Notifikasi Sukses"]),
      done: false,
      order: 2,
    },
  });

  const task2 = await prisma.task.upsert({
    where: { id: "task-seed-002" },
    update: {},
    create: {
      id: "task-seed-002",
      projectId: project.id,
      title: "Modul Dashboard",
      description: "Halaman utama dan statistik pengguna.",
      goals: JSON.stringify(["Dashboard informatif", "Data real-time"]),
      definitionOfDone: "Dashboard selesai dengan data statistik dan grafik.",
      status: "todo",
      priority: "high",
      assignee: dev2.name,
      assigneeId: dev2.id, // Assigned to Agus
      order: 1,
    },
  });

  await prisma.subTask.upsert({
    where: { id: "subtask-seed-004" },
    update: {},
    create: {
      id: "subtask-seed-004",
      taskId: task2.id,
      title: "Halaman Utama",
      description: "Halaman utama dashboard setelah login.",
      goals: JSON.stringify(["Informasi rekening tampil", "Navigasi mudah"]),
      definitionOfDone: "Halaman utama selesai dengan informasi saldo dan menu cepat.",
      elements: JSON.stringify(["Info Saldo", "Menu Cepat", "Riwayat Singkat"]),
      done: false,
      order: 0,
    },
  });

  await prisma.subTask.upsert({
    where: { id: "subtask-seed-005" },
    update: {},
    create: {
      id: "subtask-seed-005",
      taskId: task2.id,
      title: "Halaman Statistik",
      description: "Grafik dan chart pengeluaran/pemasukan.",
      goals: JSON.stringify(["Visual data jelas", "Filter tanggal berfungsi"]),
      definitionOfDone: "Halaman statistik dengan grafik interaktif dan filter.",
      elements: JSON.stringify(["Filter Tanggal", "Grafik", "Tabel Data"]),
      done: false,
      order: 1,
    },
  });

  const task3 = await prisma.task.upsert({
    where: { id: "task-seed-003" },
    update: {},
    create: {
      id: "task-seed-003",
      projectId: project.id,
      title: "Modul Transaksi",
      description: "Fitur transfer, mutasi, dan konfirmasi transaksi.",
      goals: JSON.stringify(["Transaksi cepat dan aman", "Riwayat lengkap"]),
      definitionOfDone: "Semua fitur transaksi selesai dan terintegrasi dengan core banking.",
      status: "todo",
      priority: "medium",
      order: 2,
    },
  });

  await prisma.subTask.upsert({
    where: { id: "subtask-seed-006" },
    update: {},
    create: {
      id: "subtask-seed-006",
      taskId: task3.id,
      title: "Halaman Daftar Transaksi",
      description: "Tabel daftar riwayat transaksi dengan filter.",
      goals: JSON.stringify(["Riwayat transaksi lengkap", "Filter dan pencarian"]),
      definitionOfDone: "Daftar transaksi dengan filter, search, dan pagination.",
      elements: JSON.stringify(["Filter Tanggal", "Tabel Transaksi", "Search"]),
      done: false,
      order: 0,
    },
  });

  console.log(`   → ${3} tasks, ${6} sub-tasks created`);

  // ── 4. Module Diagram ──
  console.log("\n📋 Creating module diagram...");
  await prisma.moduleDiagram.upsert({
    where: { id: "diagram-seed-001" },
    update: {},
    create: {
      id: "diagram-seed-001",
      projectId: project.id,
      mermaidSyntax: `graph LR
  A["Aplikasi Mobile Banking"]
  A --> B["Modul Autentikasi"]
  A --> C["Modul Dashboard"]
  A --> D["Modul Transaksi"]
  B --> B1["Halaman Login"]
  B --> B2["Halaman Registrasi"]
  B --> B3["Halaman Lupa Password"]
  C --> C1["Halaman Utama"]
  C --> C2["Halaman Statistik"]
  D --> D1["Halaman Daftar Transaksi"]
  B1 --> B1a["Form Email"]
  B1 --> B1b["Form Password"]
  B1 --> B1c["Tombol Masuk"]
  B1 --> B1d["Link Lupa Password"]
  B2 --> B2a["Form Nama"]
  B2 --> B2b["Form Email"]
  B2 --> B2c["Form Password"]
  B2 --> B2d["Tombol Daftar"]
  B3 --> B3a["Form Email"]
  B3 --> B3b["Tombol Kirim"]
  B3 --> B3c["Notifikasi Sukses"]
  C1 --> C1a["Info Saldo"]
  C1 --> C1b["Menu Cepat"]
  C1 --> C1c["Riwayat Singkat"]
  C2 --> C2a["Filter Tanggal"]
  C2 --> C2b["Grafik"]
  C2 --> C2c["Tabel Data"]
  D1 --> D1a["Filter Tanggal"]
  D1 --> D1b["Tabel Transaksi"]
  D1 --> D1c["Search"]

  style A fill:#18181b,color:#fff
  style B fill:#dbeafe,color:#1e3a5f
  style C fill:#d1fae5,color:#14532d
  style D fill:#fef3c7,color:#78350f`,
      modules: JSON.stringify([
        { name: "Modul Autentikasi", screens: ["Halaman Login", "Halaman Registrasi", "Halaman Lupa Password"] },
        { name: "Modul Dashboard", screens: ["Halaman Utama", "Halaman Statistik"] },
        { name: "Modul Transaksi", screens: ["Halaman Daftar Transaksi"] },
      ]),
      subDiagrams: "[]",
      nodeDetails: JSON.stringify({
        A: {
          description: "Aplikasi Mobile Banking — aplikasi utama dari hasil analisis BRD.",
          goals: ["Implementasi semua kebutuhan bisnis", "UI/UX yang intuitif dan responsif"],
          definitionOfDone: "Aplikasi selesai, diuji, dan siap produksi.",
        },
        B: {
          description: "Modul untuk autentikasi dan manajemen akses pengguna.",
          goals: ["Fitur autentikasi lengkap dan aman", "Mudah digunakan"],
          definitionOfDone: "Semua screen autentikasi selesai dan terintegrasi.",
        },
        C: {
          description: "Modul dashboard utama aplikasi.",
          goals: ["Dashboard informatif", "Data real-time"],
          definitionOfDone: "Dashboard selesai dengan data statistik.",
        },
        D: {
          description: "Modul transaksi dan riwayat keuangan.",
          goals: ["Transaksi cepat dan aman", "Riwayat lengkap"],
          definitionOfDone: "Semua fitur transaksi selesai.",
        },
        B1: { description: "Halaman login dengan form email dan password.", goals: ["Login berfungsi"], definitionOfDone: "Halaman login selesai." },
        B2: { description: "Halaman registrasi pengguna baru.", goals: ["Registrasi berfungsi"], definitionOfDone: "Registrasi selesai." },
        B3: { description: "Halaman lupa password.", goals: ["Reset password"], definitionOfDone: "Lupa password selesai." },
        C1: { description: "Halaman utama dashboard.", goals: ["Info rekening"], definitionOfDone: "Halaman utama selesai." },
        C2: { description: "Halaman statistik dan grafik.", goals: ["Visual data"], definitionOfDone: "Statistik selesai." },
        D1: { description: "Daftar riwayat transaksi.", goals: ["Riwayat transaksi"], definitionOfDone: "Daftar transaksi selesai." },
        B1a: { description: "Elemen UI: Form Email", goals: ["Berfungsi sesuai spesifikasi"], definitionOfDone: "Form Email selesai dan responsif." },
        B1b: { description: "Elemen UI: Form Password", goals: ["Berfungsi sesuai spesifikasi"], definitionOfDone: "Form Password selesai dan responsif." },
        B1c: { description: "Elemen UI: Tombol Masuk", goals: ["Berfungsi sesuai spesifikasi"], definitionOfDone: "Tombol Masuk selesai dan responsif." },
        B1d: { description: "Elemen UI: Link Lupa Password", goals: ["Berfungsi sesuai spesifikasi"], definitionOfDone: "Link Lupa Password selesai dan responsif." },
        B2a: { description: "Elemen UI: Form Nama", goals: ["Berfungsi sesuai spesifikasi"], definitionOfDone: "Form Nama selesai dan responsif." },
        B2b: { description: "Elemen UI: Form Email", goals: ["Berfungsi sesuai spesifikasi"], definitionOfDone: "Form Email selesai dan responsif." },
        B2c: { description: "Elemen UI: Form Password", goals: ["Berfungsi sesuai spesifikasi"], definitionOfDone: "Form Password selesai dan responsif." },
        B2d: { description: "Elemen UI: Tombol Daftar", goals: ["Berfungsi sesuai spesifikasi"], definitionOfDone: "Tombol Daftar selesai." },
        B3a: { description: "Elemen UI: Form Email", goals: ["Berfungsi sesuai spesifikasi"], definitionOfDone: "Form Email selesai." },
        B3b: { description: "Elemen UI: Tombol Kirim", goals: ["Berfungsi sesuai spesifikasi"], definitionOfDone: "Tombol Kirim selesai." },
        B3c: { description: "Elemen UI: Notifikasi Sukses", goals: ["Berfungsi sesuai spesifikasi"], definitionOfDone: "Notifikasi Sukses selesai." },
        C1a: { description: "Elemen UI: Info Saldo", goals: ["Berfungsi sesuai spesifikasi"], definitionOfDone: "Info Saldo selesai." },
        C1b: { description: "Elemen UI: Menu Cepat", goals: ["Berfungsi sesuai spesifikasi"], definitionOfDone: "Menu Cepat selesai." },
        C1c: { description: "Elemen UI: Riwayat Singkat", goals: ["Berfungsi sesuai spesifikasi"], definitionOfDone: "Riwayat Singkat selesai." },
        C2a: { description: "Elemen UI: Filter Tanggal", goals: ["Berfungsi sesuai spesifikasi"], definitionOfDone: "Filter Tanggal selesai." },
        C2b: { description: "Elemen UI: Grafik", goals: ["Berfungsi sesuai spesifikasi"], definitionOfDone: "Grafik selesai." },
        C2c: { description: "Elemen UI: Tabel Data", goals: ["Berfungsi sesuai spesifikasi"], definitionOfDone: "Tabel Data selesai." },
        D1a: { description: "Elemen UI: Filter Tanggal", goals: ["Berfungsi sesuai spesifikasi"], definitionOfDone: "Filter Tanggal selesai." },
        D1b: { description: "Elemen UI: Tabel Transaksi", goals: ["Berfungsi sesuai spesifikasi"], definitionOfDone: "Tabel Transaksi selesai." },
        D1c: { description: "Elemen UI: Search", goals: ["Berfungsi sesuai spesifikasi"], definitionOfDone: "Search selesai." },
      }),
    },
  });
  console.log(`   → Diagram with 3 modules, 6 screens, 20+ elements`);

  // ── 5. Knowledge File ──
  console.log("\n📋 Creating knowledge file...");
  await prisma.knowledgeFile.upsert({
    where: { id: "knowledge-seed-001" },
    update: {},
    create: {
      id: "knowledge-seed-001",
      name: "Panduan UI/UX Mobile Banking",
      type: "Instruksi",
      content: `# Panduan Desain UI/UX Mobile Banking

## Prinsip Desain
- Gunakan warna korporat (biru tua #1e3a5f, emas #f5a623)
- Tombol CTA harus kontras dan mudah dijangkau拇指区域
- Jarak antar elemen minimal 8px (gunakan grid 8px)

## Komponen yang Harus Ada
1. **Bottom Navigation** — maksimal 5 menu
2. **Floating Action Button** — untuk aksi utama
3. **Pull to Refresh** — pada halaman daftar
4. **Loading Skeleton** — saat memuat data

## Aksesibilitas
- Kontras warna minimal AA (4.5:1 untuk teks normal)
- Ukuran font minimal 14px untuk keterbacaan
- Target sentuh minimal 44x44px`,
      active: true,
    },
  });
  console.log(`   → Panduan UI/UX Mobile Banking`);

  // ── 6. System Config ──
  console.log("\n📋 Creating system config...");
  await prisma.systemConfig.upsert({
    where: { key: "execution_mode" },
    update: {},
    create: {
      key: "execution_mode",
      value: "local",
    },
  });
  console.log(`   → execution_mode = local`);

  // ── 7. Project Log ──
  console.log("\n📋 Creating project log...");
  await prisma.projectLog.create({
    data: {
      projectId: project.id,
      action: "processing_completed",
      detail: "AI processing completed: 3 tasks generated with 6 sub-tasks",
    },
  });
  console.log(`   → processing log entry`);

  console.log("\n✅ Seed complete!");
  console.log(`   Project ID: ${project.id}`);
  console.log(`   Team Member: ${admin.id}`);
  console.log(`   Tasks: task-seed-001, task-seed-002, task-seed-003`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
