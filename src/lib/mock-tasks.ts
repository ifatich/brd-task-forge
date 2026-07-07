export type TaskStatus = "todo" | "in-progress" | "done";
export type Priority = "low" | "medium" | "high";

export interface SubTask {
  id: string;
  title: string;
  description: string;
  definitionOfDone: string;
  goals: string[];
  elements: string[];
  done: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  goals: string[];
  definitionOfDone: string;
  status: TaskStatus;
  priority: Priority;
  assignee: string | null;
  order: number;
  subTasks: SubTask[];
}

export const mockTasks: Task[] = [
  // ── proj-001: Aplikasi Mobile Banking ──
  {
    id: "task-001", projectId: "proj-001", title: "Modul Autentikasi",
    description: "Mengelola autentikasi pengguna: login, registrasi, dan reset PIN.",
    goals: ["Keamanan login multi-faktor", "Pengalaman registrasi yang mulus"],
    definitionOfDone: "Login dengan PIN/biometrik, registrasi dengan verifikasi OTP, reset PIN via email.",
    status: "in-progress", priority: "high", assignee: "andi_designer", order: 0,
    subTasks: [
      { id: "sub-001", title: "Halaman Login", description: "Desain halaman login dengan input email/username dan password, serta tombol masuk.", definitionOfDone: "Mengirim request login, validasi form, menampilkan error, navigasi ke dashboard.", goals: ["Login cepat (< 5 detik)", "Aman dari brute force"], elements: ["Form Email", "Form Password", "Tombol Masuk", "Link Lupa Password", "Link Registrasi"], done: false },
      { id: "sub-002", title: "Halaman Registrasi", description: "Desain halaman registrasi pengguna baru dengan form data diri.", definitionOfDone: "Validasi input, konfirmasi password, captcha, kirim OTP.", goals: ["Registrasi selesai < 3 menit", "Verifikasi identitas"], elements: ["Form Nama Lengkap", "Form Email", "Form No. HP", "Form Password", "Form Konfirmasi Password", "Tombol Daftar"], done: false },
      { id: "sub-003", title: "Halaman Lupa PIN", description: "Desain halaman reset PIN dengan verifikasi identitas.", definitionOfDone: "Input email, kirim link reset, form PIN baru, konfirmasi PIN.", goals: ["Reset PIN tanpa datang ke cabang", "Keamanan terjamin"], elements: ["Form Email/No. HP", "Tombol Kirim OTP", "Form Kode OTP", "Form PIN Baru", "Form Konfirmasi PIN"], done: false },
    ],
  },
  {
    id: "task-004", projectId: "proj-001", title: "Modul Transfer",
    description: "Fitur transfer antar bank dengan daftar tujuan, nominal, dan konfirmasi.",
    goals: ["Proses transfer cepat (< 30 detik)", "Daftar bank tujuan lengkap"],
    definitionOfDone: "Transfer ke semua bank Indonesia, validasi nomor rekening otomatis, limit transaksi terkonfigurasi.",
    status: "in-progress", priority: "high", assignee: "andi_designer", order: 1,
    subTasks: [
      { id: "sub-004", title: "Halaman Daftar Transfer", description: "Desain halaman daftar transfer dengan daftar bank tujuan dan nominal.", definitionOfDone: "Pilih bank, input nomor rekening, nominal, berita, preview.", goals: ["Pilih bank dengan cepat", "Cegah salah input"], elements: ["Pilih Bank", "Form No. Rekening", "Form Nominal", "Form Berita", "Tombol Lanjut", "Preview Ringkasan"], done: false },
      { id: "sub-005", title: "Halaman Detail Transfer", description: "Desain halaman detail transfer dengan ringkasan.", definitionOfDone: "Detail pengirim/penerima, nominal, biaya, tombol konfirmasi.", goals: ["Informasi lengkap sebelum kirim", "Kesempatan koreksi"], elements: ["Info Pengirim", "Info Penerima", "Nominal Transfer", "Biaya Admin", "Total", "Tombol Konfirmasi"], done: false },
      { id: "sub-006", title: "Halaman Konfirmasi Transfer", description: "Desain halaman konfirmasi akhir transfer.", definitionOfDone: "PIN konfirmasi, status sukses/gagal, bukti transfer.", goals: ["Konfirmasi dengan aman", "Bukti transaksi"], elements: ["Status Transfer", "Detail Transaksi", "Tombol Selesai", "Tombol Bagikan", "Tombol Cetak"], done: false },
    ],
  },
  {
    id: "task-005", projectId: "proj-001", title: "Modul Mutasi",
    description: "Fitur riwayat mutasi rekening dengan filter dan detail transaksi.",
    goals: ["Informasi transaksi real-time", "Filter dan pencarian mudah"],
    definitionOfDone: "Mutasi 3 bulan terakhir, filter tanggal, search, infinite scroll.",
    status: "done", priority: "medium", assignee: "siti_ui", order: 2,
    subTasks: [
      { id: "sub-007", title: "Halaman Riwayat Mutasi", description: "Desain halaman riwayat mutasi dengan daftar transaksi.", definitionOfDone: "List transaksi, infinite scroll, pull-to-refresh.", goals: ["Melihat transaksi terkini", "Mudah di-scan"], elements: ["List Transaksi", "Filter Bulan", "Search", "Infinite Scroll"], done: true },
      { id: "sub-008", title: "Halaman Filter Mutasi", description: "Desain filter untuk menyaring mutasi.", definitionOfDone: "Filter tanggal, tipe transaksi, rentang nominal.", goals: ["Cari transaksi spesifik", "Filter multi-kriteria"], elements: ["Pilih Tanggal Awal", "Pilih Tanggal Akhir", "Tipe Transaksi", "Rentang Nominal", "Tombol Terapkan"], done: true },
      { id: "sub-009", title: "Halaman Detail Transaksi", description: "Desain halaman detail transaksi individual.", definitionOfDone: "Informasi lengkap, status, bukti transfer, opsi bagikan.", goals: ["Informasi lengkap", "Opsi tindakan"], elements: ["Info Lengkap Transaksi", "Status Transaksi", "Bukti Transfer", "Tombol Bagikan"], done: true },
    ],
  },
  {
    id: "task-027", projectId: "proj-001", title: "Modul Pembayaran",
    description: "Fitur pembayaran tagihan listrik, air, telepon, dan BPJS.",
    goals: ["Pembayaran cepat tanpa login ulang", "Banyak pilihan pembayaran"],
    definitionOfDone: "Pembayaran listrik, air, telepon, BPJS; histori pembayaran; notifikasi sukses.",
    status: "todo", priority: "medium", assignee: null, order: 3,
    subTasks: [
      { id: "sub-010", title: "Halaman Pilih Pembayaran", description: "Desain halaman pilih jenis pembayaran.", definitionOfDone: "List kategori, input no pelanggan, cek tagihan.", goals: ["Cepat menemukan tagihan", "Multi-provider"], elements: ["List Tagihan", "Form No. Pelanggan", "Tombol Cek", "Info Tagihan"], done: false },
      { id: "sub-011", title: "Halaman Konfirmasi Pembayaran", description: "Desain halaman konfirmasi pembayaran.", definitionOfDone: "Detail tagihan, nominal, tombol bayar, status sukses.", goals: ["Bayar dengan sekali klik", "Bukti pembayaran"], elements: ["Detail Pembayaran", "Status", "Tombol Bayar", "Tombol Batal"], done: false },
    ],
  },

  // ── proj-002: E-Commerce Platform ──
  {
    id: "task-008", projectId: "proj-002", title: "Modul Pengguna",
    description: "Mengelola akun pengguna: login, profil, dan alamat.",
    goals: ["Registrasi mudah", "Keamanan data pengguna"],
    definitionOfDone: "Login/registrasi, profil, alamat pengiriman tersimpan.",
    status: "todo", priority: "high", assignee: null, order: 0,
    subTasks: [
      { id: "sub-012", title: "Halaman Login/Registrasi", description: "Desain halaman login dan registrasi.", definitionOfDone: "Form login & registrasi, validasi, sosial login.", goals: ["Akses cepat", "Daftar akun baru"], elements: ["Tab Login", "Tab Registrasi", "Form Email", "Form Password", "Tombol Masuk", "Sosial Login"], done: false },
      { id: "sub-013", title: "Halaman Profil", description: "Desain halaman profil pengguna.", definitionOfDone: "Edit profil, upload foto, data diri.", goals: ["Lihat dan edit profil", "Data akun terkini"], elements: ["Avatar & Nama", "Form Data Diri", "Form No. HP", "Tombol Simpan"], done: false },
      { id: "sub-014", title: "Halaman Alamat", description: "Desain halaman manajemen alamat.", definitionOfDone: "Daftar alamat, tambah/edit/hapus, pilih default.", goals: ["Atur alamat", "Pilih alamat utama"], elements: ["Daftar Alamat", "Tombol Tambah", "Form Alamat Baru", "Pilih Lokasi Map"], done: false },
    ],
  },
  {
    id: "task-009", projectId: "proj-002", title: "Modul Produk",
    description: "Menampilkan dan mencari produk: katalog, detail, pencarian.",
    goals: ["Katalog lengkap", "Pencarian & filter akurat"],
    definitionOfDone: "Katalog dengan filter, detail produk, gallery gambar, rating & review.",
    status: "in-progress", priority: "high", assignee: "rina_ui", order: 1,
    subTasks: [
      { id: "sub-015", title: "Halaman Katalog Produk", description: "Desain halaman katalog dengan grid dan filter.", definitionOfDone: "Grid produk, filter kategori, search, pagination.", goals: ["Tampilkan produk", "Navigasi mudah"], elements: ["Grid Produk", "Filter Kategori", "Sortir", "Pagination"], done: false },
      { id: "sub-016", title: "Halaman Detail Produk", description: "Desain halaman detail produk.", definitionOfDone: "Gallery gambar, info produk, rating, tombol beli.", goals: ["Info produk lengkap", "Dorong pembelian"], elements: ["Gallery Gambar", "Info Produk", "Rating & Review", "Tombol Beli", "Tombol Keranjang"], done: false },
      { id: "sub-017", title: "Halaman Pencarian", description: "Desain halaman pencarian produk.", definitionOfDone: "Search bar, filter, hasil, rekomendasi.", goals: ["Cari produk cepat", "Temuan relevan"], elements: ["Search Bar", "Filter", "Hasil Pencarian", "Rekomendasi"], done: false },
    ],
  },
  {
    id: "task-012", projectId: "proj-002", title: "Modul Keranjang",
    description: "Keranjang belanja dengan edit qty dan checkout.",
    goals: ["Mudah mengelola item", "Checkout cepat"],
    definitionOfDone: "Tambah/hapus item, edit qty, total harga real-time, checkout.",
    status: "todo", priority: "high", assignee: null, order: 2,
    subTasks: [
      { id: "sub-018", title: "Halaman Keranjang", description: "Desain halaman keranjang belanja.", definitionOfDone: "List item, edit qty, hapus, total harga, tombol checkout.", goals: ["Review item sebelum beli", "Edit keranjang"], elements: ["List Item", "Edit Qty", "Tombol Hapus", "Total Harga", "Tombol Checkout"], done: false },
      { id: "sub-019", title: "Halaman Edit Keranjang", description: "Desain halaman edit item keranjang.", definitionOfDone: "Detail item, qty counter, catatan, simpan.", goals: ["Ubah detail item", "Catatan tambahan"], elements: ["Detail Item", "Qty Counter", "Catatan", "Tombol Simpan"], done: false },
    ],
  },
  {
    id: "task-013", projectId: "proj-002", title: "Modul Checkout",
    description: "Checkout dengan metode pembayaran dan konfirmasi pesanan.",
    goals: ["Checkout cepat", "Banyak metode bayar"],
    definitionOfDone: "Pilih metode bayar, konfirmasi pesanan, tracking status, notifikasi.",
    status: "todo", priority: "high", assignee: null, order: 3,
    subTasks: [
      { id: "sub-020", title: "Halaman Metode Pembayaran", description: "Desain halaman pilih metode bayar.", definitionOfDone: "List pembayaran, info tagihan, tombol bayar.", goals: ["Pilih metode bayar", "Info tagihan"], elements: ["List Pembayaran", "Info Tagihan", "Tombol Bayar"], done: false },
      { id: "sub-021", title: "Halaman Konfirmasi Pesanan", description: "Desain halaman konfirmasi pesanan.", definitionOfDone: "Ringkasan, alamat, metode bayar, konfirmasi.", goals: ["Review pesanan", "Konfirmasi akhir"], elements: ["Ringkasan Pesanan", "Alamat Pengiriman", "Metode Pembayaran", "Tombol Konfirmasi"], done: false },
      { id: "sub-022", title: "Halaman Status Pesanan", description: "Desain halaman tracking pesanan.", definitionOfDone: "Status tracker, detail, link lacak, bantuan.", goals: ["Tracking pesanan", "Update real-time"], elements: ["Status Tracker", "Detail Pesanan", "Link Lacak", "Tombol Bantuan"], done: false },
    ],
  },

  // ── proj-003: Dashboard Analitik HR ──
  {
    id: "task-014", projectId: "proj-003", title: "Modul Login",
    description: "Login admin untuk akses dashboard HR.",
    goals: ["Akses aman", "Otentikasi admin"],
    definitionOfDone: "Login dengan email & password, session management, logout.",
    status: "done", priority: "high", assignee: "tim_hr", order: 0,
    subTasks: [
      { id: "sub-023", title: "Halaman Login Admin", description: "Desain halaman login admin HR.", definitionOfDone: "Form login, validasi, redirect ke dashboard.", goals: ["Login aman", "Akses terbatas"], elements: ["Form Email", "Form Password", "Tombol Masuk"], done: true },
    ],
  },
  {
    id: "task-015", projectId: "proj-003", title: "Modul Karyawan",
    description: "Data dan dashboard karyawan.",
    goals: ["Kelola data karyawan", "Visualisasi cepat"],
    definitionOfDone: "Dashboard utama, daftar karyawan, detail karyawan.",
    status: "done", priority: "high", assignee: "tim_hr", order: 1,
    subTasks: [
      { id: "sub-024", title: "Dashboard Utama", description: "Desain dashboard ringkasan SDM.", definitionOfDone: "KPI cards, grafik, notifikasi.", goals: ["Overview cepat", "Data penting"], elements: ["KPI Cards", "Grafik Jumlah Karyawan", "Grafik Dept", "Notifikasi"], done: true },
      { id: "sub-025", title: "Daftar Karyawan", description: "Desain daftar karyawan dengan filter.", definitionOfDone: "Tabel, filter dept, search, pagination.", goals: ["Cari karyawan", "Filter & sorting"], elements: ["Tabel Data", "Search", "Filter Dept", "Pagination"], done: true },
      { id: "sub-026", title: "Detail Karyawan", description: "Desain detail profil karyawan.", definitionOfDone: "Info pribadi, jabatan, kontrak, dokumen.", goals: ["Info lengkap", "Dokumen terkait"], elements: ["Info Pribadi", "Riwayat Jabatan", "Kontrak", "Dokumen"], done: true },
    ],
  },
  {
    id: "task-016", projectId: "proj-003", title: "Modul Analitik",
    description: "Grafik dan analitik data HR.",
    goals: ["Visualisasi data", "Tren & insight"],
    definitionOfDone: "Grafik jumlah karyawan, tren rekrutmen, statistik departemen.",
    status: "done", priority: "medium", assignee: "tim_hr", order: 2,
    subTasks: [
      { id: "sub-027", title: "Grafik Jumlah Karyawan", description: "Desain grafik jumlah karyawan.", definitionOfDone: "Bar chart, filter tahun, legenda.", goals: ["Visual tren", "Analisis data"], elements: ["Bar Chart", "Filter Tahun", "Legenda"], done: true },
      { id: "sub-028", title: "Tren Rekrutmen", description: "Desain grafik tren rekrutmen.", definitionOfDone: "Line chart, filter periode, data tabel.", goals: ["Analisis rekrutmen", "Tren bulanan"], elements: ["Line Chart", "Filter Periode", "Data Tabel"], done: true },
      { id: "sub-029", title: "Statistik Departemen", description: "Desain statistik per departemen.", definitionOfDone: "Pie chart, tabel dept, filter.", goals: ["Komposisi dept", "Distribusi"], elements: ["Pie Chart", "Tabel Dept", "Filter"], done: true },
    ],
  },
  {
    id: "task-017", projectId: "proj-003", title: "Modul Laporan",
    description: "Laporan dan export data HR.",
    goals: ["Laporan bulanan", "Export multi-format"],
    definitionOfDone: "Generate laporan, export PDF/CSV/Excel, filter data.",
    status: "done", priority: "medium", assignee: "tim_hr", order: 3,
    subTasks: [
      { id: "sub-030", title: "Laporan Bulanan", description: "Desain laporan bulanan.", definitionOfDone: "Tabel, export PDF, filter bulan.", goals: ["Generate laporan", "Export dokumen"], elements: ["Tabel Laporan", "Export PDF", "Filter Bulan"], done: true },
      { id: "sub-031", title: "Export Data", description: "Desain export data multi-format.", definitionOfDone: "Pilih format CSV/Excel, filter, download.", goals: ["Export multi-format", "Data fleksibel"], elements: ["Pilih Format CSV/Excel", "Filter Data", "Tombol Download"], done: true },
    ],
  },

  // ── proj-005: Portal Self-Service Karyawan ──
  {
    id: "task-019", projectId: "proj-005", title: "Modul Masuk",
    description: "Login dan reset password portal self-service.",
    goals: ["Akses aman", "Pengalaman login mudah"],
    definitionOfDone: "Login dengan NIK & password, reset password via email.",
    status: "done", priority: "high", assignee: "budi_dev", order: 0,
    subTasks: [
      { id: "sub-032", title: "Halaman Login", description: "Desain halaman login portal.", definitionOfDone: "Form login SSO, lupa password.", goals: ["Login cepat", "Akses aman"], elements: ["Form NIK", "Form Password", "Tombol Masuk", "Lupa Password"], done: true },
      { id: "sub-033", title: "Halaman Reset Password", description: "Desain halaman reset password.", definitionOfDone: "Input NIK, email, kirim link, password baru.", goals: ["Reset password aman", "Verifikasi identitas"], elements: ["Form NIK", "Form Email", "Tombol Kirim", "Form Password Baru"], done: true },
    ],
  },
  {
    id: "task-020", projectId: "proj-005", title: "Modul Cuti",
    description: "Pengajuan, riwayat, dan approval cuti.",
    goals: ["Pengajuan cuti mudah", "Approval otomatis"],
    definitionOfDone: "Ajukan cuti, riwayat cuti, approval atasan, saldo cuti.",
    status: "in-progress", priority: "high", assignee: "siti_hr", order: 1,
    subTasks: [
      { id: "sub-034", title: "Pengajuan Cuti", description: "Desain pengajuan cuti.", definitionOfDone: "Pilih jenis, tanggal, alasan, upload, submit.", goals: ["Ajukan cuti mudah", "Lengkapi dokumen"], elements: ["Pilih Jenis Cuti", "Pilih Tanggal", "Form Alasan", "Upload Dokumen", "Tombol Ajukan"], done: false },
      { id: "sub-035", title: "Riwayat Cuti", description: "Desain riwayat cuti.", definitionOfDone: "Tabel, filter bulan, status warna.", goals: ["Monitoring cuti", "Tracking status"], elements: ["Tabel Riwayat", "Filter Bulan", "Status Warna"], done: false },
      { id: "sub-036", title: "Approval Cuti", description: "Desain approval cuti atasan.", definitionOfDone: "List pengajuan, detail, setuju/tolak.", goals: ["Review pengajuan", "Setuju/tolak"], elements: ["List Pengajuan", "Detail Cuti", "Tombol Setuju", "Tombol Tolak"], done: false },
    ],
  },
  {
    id: "task-021", projectId: "proj-005", title: "Modul Izin",
    description: "Pengajuan dan riwayat izin.",
    goals: ["Izin cepat", "Tracking status"],
    definitionOfDone: "Ajukan izin, riwayat izin, status approval.",
    status: "in-progress", priority: "medium", assignee: "siti_hr", order: 2,
    subTasks: [
      { id: "sub-037", title: "Halaman Pengajuan Izin", description: "Desain pengajuan izin.", definitionOfDone: "Pilih jenis, tanggal, alasan, submit.", goals: ["Izin cepat", "Proses mudah"], elements: ["Pilih Jenis Izin", "Pilih Tanggal", "Form Alasan", "Tombol Ajukan"], done: false },
      { id: "sub-038", title: "Halaman Riwayat Izin", description: "Desain riwayat izin.", definitionOfDone: "Tabel, filter bulan.", goals: ["Monitoring izin", "Tracking"], elements: ["Tabel Riwayat", "Filter Bulan"], done: false },
    ],
  },
  {
    id: "task-022", projectId: "proj-005", title: "Modul Slip Gaji",
    description: "Daftar, detail, dan unduh slip gaji.",
    goals: ["Akses slip gaji kapan saja", "Digitalisasi dokumen"],
    definitionOfDone: "Daftar slip gaji bulanan, detail slip, download PDF.",
    status: "todo", priority: "medium", assignee: null, order: 3,
    subTasks: [
      { id: "sub-039", title: "Daftar Slip Gaji", description: "Desain daftar slip gaji bulanan.", definitionOfDone: "Tabel bulanan, tombol detail.", goals: ["Akses slip gaji", "Daftar bulanan"], elements: ["Tabel Bulanan", "Tombol Detail"], done: false },
      { id: "sub-040", title: "Detail Slip Gaji", description: "Desain detail komponen gaji.", definitionOfDone: "Info karyawan, pendapatan, potongan, total.", goals: ["Informasi lengkap gaji", "Transparansi"], elements: ["Info Karyawan", "Pendapatan", "Potongan", "Total"], done: false },
      { id: "sub-041", title: "Unduh Slip Gaji", description: "Desain halaman unduh slip PDF.", definitionOfDone: "Pilih bulan, download PDF.", goals: ["Download slip", "Arsip digital"], elements: ["Pilih Bulan", "Tombol Download PDF"], done: false },
    ],
  },
];

export function getTasksByProject(projectId: string): Task[] {
  return mockTasks.filter((t) => t.projectId === projectId);
}

export function getTasksByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks
    .filter((t) => t.status === status)
    .sort((a, b) => a.order - b.order);
}

export function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400";
    case "medium":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400";
    case "low":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400";
  }
}

export function getPriorityLabel(priority: Priority): string {
  switch (priority) {
    case "high":
      return "Tinggi";
    case "medium":
      return "Sedang";
    case "low":
      return "Rendah";
  }
}

export const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: "todo", title: "To Do", color: "bg-zinc-100 dark:bg-zinc-800/50" },
  { id: "in-progress", title: "In Progress", color: "bg-blue-50 dark:bg-blue-950/20" },
  { id: "done", title: "Done", color: "bg-green-50 dark:bg-green-950/20" },
];
