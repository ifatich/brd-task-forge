---
name: brd-to-uiux-breakdown
description: "Mengubah BRD (Business Requirements Document) menjadi struktur hierarki kerja UI/UX designer: Root (project) → Task (modul) → Subtask (screen) → Element (komponen UI). Panggil otomatis ketika user mengunggah BRD dan meminta breakdown, task, modul, backlog, atau struktur kerja untuk tim desain/frontend."
---

# BRD to UI/UX Breakdown

Mengubah BRD mentah menjadi backlog kerja UI/UX designer dalam format hierarki 4 level:

1. **Root** — nama project
2. **Task** — modul
3. **Subtask** — screen/halaman
4. **Element** — komponen UI di dalam screen

Skill ini sudah terintegrasi dengan pipeline AI di `src/lib/ai-processor.ts` dan endpoint `/api/pipeline`. Output akhir dikembalikan sebagai JSON yang kemudian disimpan ke database (Project → Task → SubTask → ModuleDiagram) dan ditampilkan di halaman Kanban + Diagram.

---

## Alur Internal (dijalankan oleh AI processor)

### Tahap 0 — Baca BRD Sepenuhnya
Baca seluruh isi file BRD termasuk: Latar Belakang, Tujuan, Ruang Lingkup, Stakeholder, Definisi/Istilah, Model Proses Bisnis (as-is & to-be), Functional/Non-Functional/Reporting Requirement, mockup/wireframe.

### Tahap 1 — Breakdown Detail BRD
Ekstrak secara internal: latar belakang, tujuan, ruang lingkup, proses bisnis, istilah penting, semua requirement, detail wireframe (field name, menu, tombol).

### Tahap 2 — Kelompokkan Role User
Daftar seluruh role/stakeholder, catat sistem yang digunakan dan tanggung jawabnya. Role non-UI (backend/governance) ditandai tanpa screen.

### Tahap 3 — Tentukan Scope UI/UX
- **In-scope**: antarmuka aplikasi baru untuk role yang memakai aplikasi
- **Out-of-scope**: sistem existing/third-party (hanya titik integrasi)

### Tahap 4 — Breakdown Modul
Kelompokkan scope jadi modul-modul (Task level). Satu modul = satu area fungsional utuh. Modul pendukung standar (auth, dashboard, notifikasi) tetap dimasukkan.

### Tahap 5 — Breakdown Screen per Modul
Tiap modul → screen yang diperlukan. Prinsip: setiap tahap proses bisnis dengan aktor/keputusan berbeda → screen terpisah.

### Tahap 6 — Output Final (JSON)
Dikirim oleh AI processor sebagai JSON dengan struktur:

```json
{
  "projectName": "Nama Proyek",
  "tasks": [
    {
      "title": "Nama Modul",
      "description": "Deskripsi modul — fungsi, tujuan, aktor yang terlibat",
      "goals": ["Goal 1", "Goal 2"],
      "definitionOfDone": "Kriteria selesai — kondisi terukur dan dapat diverifikasi",
      "priority": "high|medium|low",
      "subTasks": [
        {
          "title": "Nama Screen",
          "description": "Deskripsi screen — untuk siapa dan menampilkan apa",
          "goals": ["Goal 1"],
          "definitionOfDone": "Kriteria selesai — spesifik ke isi screen tsb",
          "elements": ["Elemen UI 1", "Elemen UI 2"]
        }
      ]
    }
  ]
}
```

Aturan:
- Setiap task (modul) adalah KATEGORI. Wajib punya Deskripsi, Goals, DoD, Priority.
- Setiap sub-task (screen) adalah halaman. Wajib punya Deskripsi, Goals, DoD, Elements.
- Elements: HANYA daftar komponen UI konkret (nama field, tombol, tabel dgn nama kolom, filter, badge, dsb).
- DoD harus terukur dan spesifik — bukan kalimat generik.
- Gunakan bahasa & istilah bisnis persis seperti di BRD.

---

## Cara Menyampaikan ke User

1. User upload BRD → pipeline AI memproses → JSON disimpan ke database.
2. JSON ditampilkan sebagai task cards di Kanban board (`/project/[id]`).
3. Diagram alur otomatis digenerate dari data modul/screen (`/project/[id]/diagram`).
4. User bisa melihat task individual, sub-task, dan element di detail task.

## Verifikasi Kualitas

Sebelum output final, pastikan:
- Setiap alur keputusan bercabang memiliki screen sendiri
- Semua field di wireframe/mockup masuk sebagai Elements
- Modul pendukung (auth, dashboard, notifikasi) tidak lupa
- Sistem existing/third-party benar-benar dikeluarkan dari screen
- DoD di tiap level terukur dan spesifik
