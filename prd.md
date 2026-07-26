# Product Requirement Document (PRD): BRD Task Forge

## 1. Overview & Ringkasan Eksekutif

**BRD Task Forge** adalah platform pengelolaan proyek dan dekonstruksi *Business Requirement Document* (BRD) berbasis AI (*Artificial Intelligence*). Sistem ini dirancang untuk mempercepat pengolahan dokumen persyaratan bisnis (BRD) berbentuk PDF atau teks acak menjadi struktur proyek teknis yang siap dieksekusi oleh tim pengembang software.

Sistem secara otomatis menganalisis isi BRD, mengekstrak fitur utama, merancang diagram arsitektur (*ERD* dan *Flowchart* menggunakan Mermaid.js), serta memecah requirement menjadi **Sprint**, **Task (tingkat modul)**, dan **SubTask (tingkat layar UI & elemen teknis)** lengkap dengan *Definition of Done (DoD)* dan perkiraan waktu kerja (*estimated hours*).

---

## 2. Arsitektur & Teknologi

* **Framework Utama:** Next.js 16 (App Router) + React 19 + TypeScript
* **Database & ORM:** SQLite / LibSQL + Prisma ORM
* **Desain & UI System:** Tailwind CSS v4, Lucide React Icons, Figma-inspired Editorial Design System (Pastel color-block sections, monochrome chrome, typography *Geist/Inter*)
* **Drag-and-Drop:** `@dnd-kit/core` & `@dnd-kit/sortable`
* **Diagram Engine:** Mermaid.js + `react-zoom-pan-pinch`
* **AI & LLM Pipeline:** Vercel AI SDK (`ai`), DeepSeek AI (`@ai-sdk/deepseek`), Google Gemini API Integration
* **Integrasi & Sinkronisasi:** Google Sheets API (`googleapis`), Webhook Real-Time Sync
* **Export & Document Processing:** PDF Parser (`pdf-parse`, `pdfjs-dist`), PDF Exporter (`jspdf`, `jspdf-autotable`), PNG Image Capture (`html-to-image`)

---

## 3. Peran Pengguna (User Roles & Permissions)

Sistem membedakan hak akses berdasarkan dua peran utama:

| Peran (Role) | Deskripsi | Hak Akses |
| :--- | :--- | :--- |
| **System Admin** | Pengelola sistem utama / Tech Lead | • Mengelola seluruh proyek di organisasi.<br>• Mengatur API Keys AI Provider (Gemini, DeepSeek, OpenAI).<br>• Mengelola daftar anggota tim & undangan (*Invitations*).<br>• Mengakses menu **Admin Dashboard** & **Knowledge Base**.<br>• Mengedit dan menghapus Sprint, Task, serta log audit proyek. |
| **Member / Developer** | Anggota tim pengembang / Business Analyst | • Melihat proyek yang ditugaskan (*assigned*).<br>• Mengunggah & memproses dokumen BRD baru.<br>• Mengubah status Task & SubTask pada Kanban Board (Todo, In-Progress, Done).<br>• Mengisi checklist SubTask & melihat diagram arsitektur. |

---

## 4. Peta Navigasi & Struktur Menu

Sistem memiliki tata letak navigasi yang terstruktur sebagai berikut:

```
BRD Task Forge
├── 🏠 Dashboard (/)
│   ├── Overview Cards (KPI & Metrics)
│   ├── Continue Working Section
│   ├── Operational Insights
│   └── Projects Explorer (Filter, Search, Sort)
│
├── 📄 Upload & Generate BRD (/upload)
│   ├── Step 1: Input Document (PDF / Plain Text / Template)
│   ├── Step 2: AI Parsing & Requirement Breakdown
│   ├── Step 3: Architecture Reasoning & Mermaid Diagram Preview
│   └── Step 4: Sprint & Task Finalization
│
├── 📊 Project Detail (/project/[id])
│   ├── Kanban Board View (Drag & Drop: Todo, In-Progress, Done)
│   ├── Filter Sprint & Assignee
│   ├── Task Detail Modal (Task & SubTask Editor, DoD, UI Elements)
│   ├── PDF & CSV Export Tools
│   ├── 📐 Architecture & Diagram View (/project/[id]/diagram)
│   │   ├── ERD (Entity Relationship Diagram)
│   │   ├── System Flowchart (Mermaid)
│   │   └── Module & Node Breakdown Inspector
│   └── ⚙️ Project Settings & Log (/project/[id]/manage)
│       ├── Edit Metadata & Status Proyek
│       ├── Manajemen Sprint (Tambah/Edit/Hapus Sprint)
│       └── Activity Audit Log
│
├── 👥 Team Management (/team)
│   ├── Daftar Anggota Tim & Role (Dev, BA, Admin)
│   └── Undangan Anggota Baru (Email Invitations)
│
├── 📚 Knowledge Base (/knowledge) [Admin]
│   └── Manajemen System Prompt, Skill, & Instruksi AI
│
└── 🔧 Admin Settings (/admin) [Admin]
    ├── Manajemen Provider & API Key AI (Gemini, DeepSeek, Anthropic, Custom)
    ├── Konfigurasi Sistem Key-Value
    └── System Health Check
```

---

## 5. Rincian Fitur Utama (Core Features)

### 5.1. Dashboard & Monitoring Proyek (`/`)
* **Global KPI Metric Cards:** Menampilkan total proyek, total task, task selesai, persentase *completion rate*, dan estimasi total jam kerja.
* **Continue Working Card:** Menampilkan proyek paling terakhir diakses/diperbarui untuk akses cepat.
* **Operational Insights Panel:** Analisis otomatis dari sistem mengenai *progress health*, kecepatan pengerjaan (*velocity*), dan tugas berisiko (*delay/carry-over*).
* **Projects Explorer:** Pencarian interaktif, filter berdasarkan status (*Draft, Active, Completed*), dan pengurutan proyek.

### 5.2. AI-Powered BRD Parsing Engine (`/upload`)
* **Multi-Format Reader:** Mendukung unggah dokumen PDF BRD atau *paste* teks persyaratan bisnis secara langsung.
* **4-Stage Automated Pipeline:**
  1. *Extraction Stage:* Mengidentifikasi entitas bisnis, modul utama, dan daftar requirement.
  2. *Reasoning & Architecture Stage:* Merancang skema arsitektur data (*ERD*) dan alur proses bisnis (*Flowchart*) dalam sintaks Mermaid.js.
  3. *Module Diagramming:* Memecah sistem menjadi hierarki modul dan sub-modul.
  4. *Task Decomposition:* Memecah modul menjadi *Tasks* (modul) dan *SubTasks* (skrin/UI element), menentukan alokasi Sprint, perkiraan jam, serta *Definition of Done*.
* **Live Review & Editor Draft:** Pengguna dapat meninjau hasil generasi AI sebelum dipublikasikan ke database utama.

### 5.3. Manajemen Kanban Board & Task Interactive (`/project/[id]`)
* **Interactive Drag-and-Drop:** Memindahkan task antar kolom status (*Todo*, *In-Progress*, *Done*) secara responsif menggunakan DnD Kit.
* **Sprint Filter:** Memfilter tampilan Kanban berdasarkan Sprint tertentu (misal: Sprint 1, Sprint 2) atau menampilkan *Backlog*.
* **Task Detail Modal:**
  * Pengubahan judul, deskripsi, prioritas (*Low, Medium, High*), dan estimasi jam.
  * Penugasan *Assignee* untuk Task dan SubTask.
  * Checklist SubTask tingkat layar (*Screen-level*) lengkap dengan daftar elemen UI yang harus dibuat.
  * Pengaturan *Definition of Done (DoD)*.
* **Export Utilities:** Fitur ekspor laporan proyek ke format PDF profesional (*jspdf*) dan file CSV.

### 5.4. Visualisasi Diagram Arsitektur (`/project/[id]/diagram`)
* **Interactive Mermaid Viewer:** Visualisasi diagram ERD dan System Flow yang digenerasi oleh AI.
* **Zoom & Pan Controls:** Memungkinkan navigasi interaktif (*zoom in, zoom out, reset view*) menggunakan `react-zoom-pan-pinch`.
* **Module Inspector:** Menampilkan rincian node modul dan sub-diagram ketika sebuah node pada diagram diklik.

### 5.5. Manajemen Sprint & Audit Log (`/project/[id]/manage`)
* **Sprint Manager:** Menambah, menyunting nama, mengubah urutan, atau menghapus Sprint pada proyek.
* **Project Audit Trail:** Merekam setiap riwayat aktivitas yang terjadi pada proyek (pembuatan proyek, penambahan task, perubahan status, pembaruan assignees).

### 5.6. Integrasi Google Sheets Real-Time
* **Bi-Directional Sync:** Sinkronisasi data task dan status secara otomatis dari dan ke Google Sheets.
* **Webhook Handler:** Menerima pembaruan instan dari Google Sheets saat ada perubahan data di lembar kerja mitra/klien.

### 5.7. Manajemen AI Engine & Knowledge Base (`/admin` & `/knowledge`)
* **Dynamic API Key Configurator:** Mengatur API Key provider AI (*DeepSeek, Google Gemini, OpenAI*) secara terpusat tanpa perlu merestart server.
* **Prompt & Knowledge Tuning:** Menyimpan acuan instruksi (*system prompts*) untuk memastikan AI menghasilkan breakdown proyek yang sesuai standar perusahaan.

---

## 6. Skema Data (Data Model Overview)

Sistem menggunakan Prisma ORM dengan model utama sebagai berikut:

* **User:** Data pengguna (`id`, `email`, `passwordHash`, `name`).
* **Project:** Data proyek (`id`, `title`, `description`, `status`, `sprints`, `erdMermaid`, `flowMermaid`).
* **Task:** Modul pengerjaan (`id`, `projectId`, `title`, `priority`, `status`, `sprints`, `estimatedHours`, `order`).
* **SubTask:** Rincian fitur/skrin (`id`, `taskId`, `title`, `elements`, `definitionOfDone`, `done`, `assigneeId`).
* **TeamMember:** Profil anggota tim (`id`, `name`, `email`, `role`, `avatar`).
* **Invitation:** Data undangan tim (`id`, `email`, `token`, `status`, `expiresAt`).
* **ProjectLog:** Catatan aktivitas proyek (`id`, `projectId`, `action`, `detail`).
* **ApiKey:** Kunci API AI Provider (`id`, `provider`, `keyValue`, `model`, `active`).
* **KnowledgeFile:** Berkas petunjuk AI (`id`, `name`, `type`, `content`, `active`).

---

## 7. Penutup

Dokumen PRD ini dirancang sebagai panduan komprehensif arsitektur dan fungsionalitas aplikasi **BRD Task Forge**. Aplikasi ini mengintegrasikan efisiensi AI dengan fleksibilitas manajemen agile untuk mempercepat transformasi dokumen persyaratan bisnis menjadi deliverable software yang terukur.
