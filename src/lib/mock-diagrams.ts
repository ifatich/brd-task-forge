export interface ModuleDef {
  name: string;
  screens: string[];
}

export interface NodeDetail {
  description: string;
  goals: string[];
  definitionOfDone: string;
}

export interface DiagramData {
  projectId: string;
  mermaidSyntax: string;
  modules: ModuleDef[];
  /** Sub-diagram detail untuk setiap screen — misal isi form, elemen UI, dll */
  subDiagrams: Record<string, string>;
  /** Metadata per node: deskripsi, goals, definition of done. Key = node ID (A, B, B1, B1a, …) */
  nodeDetails: Record<string, NodeDetail>;
}

export const mockDiagrams: Record<string, DiagramData> = {
  "proj-001": {
    projectId: "proj-001",
    mermaidSyntax: `graph LR
    A["Aplikasi Mobile Banking"] --> B["Modul Autentikasi"]
    A --> C["Modul Transfer"]
    A --> D["Modul Mutasi"]
    A --> E["Modul Pembayaran"]
    
    B --> B1["Halaman Login"]
    B1 --> B1a["Form Email"]
    B1 --> B1b["Form Password"]
    B1 --> B1c["Tombol Masuk"]
    B1 --> B1d["Link Lupa Password"]
    B1 --> B1e["Link Registrasi"]
    
    B --> B2["Halaman Registrasi"]
    B2 --> B2a["Form Nama Lengkap"]
    B2 --> B2b["Form Email"]
    B2 --> B2c["Form No. HP"]
    B2 --> B2d["Form Password"]
    B2 --> B2e["Form Konfirmasi Password"]
    B2 --> B2f["Tombol Daftar"]
    
    B --> B3["Halaman Lupa PIN"]
    B3 --> B3a["Form Email/No. HP"]
    B3 --> B3b["Tombol Kirim OTP"]
    B3 --> B3c["Form Kode OTP"]
    B3 --> B3d["Form PIN Baru"]
    B3 --> B3e["Form Konfirmasi PIN"]
    
    C --> C1["Halaman Daftar Transfer"]
    C1 --> C1a["Pilih Bank"]
    C1 --> C1b["Form No. Rekening"]
    C1 --> C1c["Form Nominal"]
    C1 --> C1d["Form Berita"]
    C1 --> C1e["Tombol Lanjut"]
    C1 --> C1f["Preview Ringkasan"]
    
    C --> C2["Halaman Detail Transfer"]
    C2 --> C2a["Info Pengirim"]
    C2 --> C2b["Info Penerima"]
    C2 --> C2c["Nominal Transfer"]
    C2 --> C2d["Biaya Admin"]
    C2 --> C2e["Total"]
    C2 --> C2f["Tombol Konfirmasi"]
    
    C --> C3["Halaman Konfirmasi Transfer"]
    C3 --> C3a["Status Transfer"]
    C3 --> C3b["Detail Transaksi"]
    C3 --> C3c["Tombol Selesai"]
    C3 --> C3d["Tombol Bagikan"]
    C3 --> C3e["Tombol Cetak"]
    
    D --> D1["Halaman Riwayat Mutasi"]
    D1 --> D1a["List Transaksi"]
    D1 --> D1b["Filter Bulan"]
    D1 --> D1c["Search"]
    D1 --> D1d["Infinite Scroll"]
    
    D --> D2["Halaman Filter Mutasi"]
    D2 --> D2a["Pilih Tanggal Awal"]
    D2 --> D2b["Pilih Tanggal Akhir"]
    D2 --> D2c["Tipe Transaksi"]
    D2 --> D2d["Rentang Nominal"]
    D2 --> D2e["Tombol Terapkan"]
    
    D --> D3["Halaman Detail Transaksi"]
    D3 --> D3a["Info Lengkap Transaksi"]
    D3 --> D3b["Status Transaksi"]
    D3 --> D3c["Bukti Transfer"]
    D3 --> D3d["Tombol Bagikan"]
    
    E --> E1["Halaman Pilih Pembayaran"]
    E1 --> E1a["List Tagihan"]
    E1 --> E1b["Form No. Pelanggan"]
    E1 --> E1c["Tombol Cek"]
    E1 --> E1d["Info Tagihan"]
    
    E --> E2["Halaman Konfirmasi Pembayaran"]
    E2 --> E2a["Detail Pembayaran"]
    E2 --> E2b["Status"]
    E2 --> E2c["Tombol Bayar"]
    E2 --> E2d["Tombol Batal"]
    
    style A fill:#18181b,color:#fff
    style B fill:#dbeafe,color:#1e3a5f
    style C fill:#d1fae5,color:#14532d
    style D fill:#fef3c7,color:#78350f
    style E fill:#e0e7ff,color:#312e81`,
    modules: [
      {
        name: "Modul Autentikasi",
        screens: ["Halaman Login", "Halaman Registrasi", "Halaman Lupa PIN"],
      },
      {
        name: "Modul Transfer",
        screens: ["Halaman Daftar Transfer", "Halaman Detail Transfer", "Halaman Konfirmasi Transfer"],
      },
      {
        name: "Modul Mutasi",
        screens: ["Halaman Riwayat Mutasi", "Halaman Filter Mutasi", "Halaman Detail Transaksi"],
      },
      {
        name: "Modul Pembayaran",
        screens: ["Halaman Pilih Pembayaran", "Halaman Konfirmasi Pembayaran"],
      },
    ],
    subDiagrams: {
      "Halaman Login": `graph LR\n    Login["Halaman Login"] --> F1["Form Email"]\n    Login --> F2["Form Password"]\n    Login --> B1["Tombol Masuk"]\n    Login --> L1["Link Lupa Password"]\n    Login --> L2["Link Registrasi"]`,
      "Halaman Registrasi": `graph LR\n    Reg["Halaman Registrasi"] --> F1["Form Nama Lengkap"]\n    Reg --> F2["Form Email"]\n    Reg --> F3["Form No. HP"]\n    Reg --> F4["Form Password"]\n    Reg --> F5["Form Konfirmasi Password"]\n    Reg --> B1["Tombol Daftar"]`,
      "Halaman Lupa PIN": `graph LR\n    Lupa["Halaman Lupa PIN"] --> F1["Form Email/No. HP"]\n    Lupa --> B1["Tombol Kirim OTP"]\n    Lupa --> F2["Form Kode OTP"]\n    Lupa --> F3["Form PIN Baru"]\n    Lupa --> F4["Form Konfirmasi PIN"]`,
      "Halaman Daftar Transfer": `graph LR\n    DT["Halaman Daftar Transfer"] --> S1["Pilih Bank"]\n    DT --> F1["Form No. Rekening"]\n    DT --> F2["Form Nominal"]\n    DT --> F3["Form Berita"]\n    DT --> B1["Tombol Lanjut"]\n    DT --> P1["Preview Ringkasan"]`,
      "Halaman Detail Transfer": `graph LR\n    Det["Halaman Detail Transfer"] --> I1["Info Pengirim"]\n    Det --> I2["Info Penerima"]\n    Det --> I3["Nominal Transfer"]\n    Det --> I4["Biaya Admin"]\n    Det --> I5["Total"]\n    Det --> B1["Tombol Konfirmasi"]`,
      "Halaman Konfirmasi Transfer": `graph LR\n    KT["Halaman Konfirmasi Transfer"] --> S1["Status Transfer"]\n    KT --> I1["Detail Transaksi"]\n    KT --> B1["Tombol Selesai"]\n    KT --> B2["Tombol Bagikan"]\n    KT --> B3["Tombol Cetak"]`,
      "Halaman Riwayat Mutasi": `graph LR\n    RM["Halaman Riwayat Mutasi"] --> L1["List Transaksi"]\n    RM --> F1["Filter Bulan"]\n    RM --> S1["Search"]\n    RM --> I1["Infinite Scroll"]`,
      "Halaman Filter Mutasi": `graph LR\n    FM["Halaman Filter Mutasi"] --> D1["Pilih Tanggal Awal"]\n    FM --> D2["Pilih Tanggal Akhir"]\n    FM --> T1["Tipe Transaksi"]\n    FM --> R1["Rentang Nominal"]\n    FM --> B1["Tombol Terapkan"]`,
      "Halaman Detail Transaksi": `graph LR\n    DT2["Halaman Detail Transaksi"] --> I1["Info Lengkap Transaksi"]\n    DT2 --> S1["Status Transaksi"]\n    DT2 --> B1["Bukti Transfer"]\n    DT2 --> B2["Tombol Bagikan"]`,
      "Halaman Pilih Pembayaran": `graph LR\n    PP["Halaman Pilih Pembayaran"] --> L1["List Tagihan"]\n    PP --> F1["Form No. Pelanggan"]\n    PP --> B1["Tombol Cek"]\n    PP --> I1["Info Tagihan"]`,
      "Halaman Konfirmasi Pembayaran": `graph LR\n    KP["Halaman Konfirmasi Pembayaran"] --> I1["Detail Pembayaran"]\n    KP --> S1["Status"]\n    KP --> B1["Tombol Bayar"]\n    KP --> B2["Tombol Batal"]`,
    },
    nodeDetails: {
      "A": { "description": "Aplikasi mobile banking dengan fitur transfer, mutasi, dan pembayaran.", "goals": ["Memudahkan nasabah bertransaksi kapan saja", "Mengurangi antrian di cabang", "Meningkatkan keamanan transaksi"], "definitionOfDone": "Aplikasi rilis di App Store & Play Store, semua flow transaksi berjalan, approval keamanan selesai." },
      "B": { "description": "Modul untuk mengelola autentikasi pengguna.", "goals": ["Keamanan login multi-faktor", "Pengalaman registrasi yang mulus"], "definitionOfDone": "Login dengan PIN/biometrik, registrasi dengan verifikasi OTP, reset PIN via email." },
      "C": { "description": "Modul untuk melakukan transfer antar bank.", "goals": ["Proses transfer cepat (< 30 detik)", "Daftar bank tujuan lengkap"], "definitionOfDone": "Transfer ke semua bank Indonesia, validasi nomor rekening otomatis, limit transaksi terkonfigurasi." },
      "D": { "description": "Modul untuk melihat riwayat mutasi rekening.", "goals": ["Informasi transaksi real-time", "Filter dan pencarian mudah"], "definitionOfDone": "Mutasi 3 bulan terakhir, filter tanggal, search, infinite scroll." },
      "E": { "description": "Modul untuk melakukan pembayaran tagihan.", "goals": ["Pembayaran cepat tanpa login ulang", "Banyak pilihan pembayaran"], "definitionOfDone": "Pembayaran listrik, air, telepon, BPJS; histori pembayaran; notifikasi sukses." },
      "B1": { "description": "Halaman login dengan PIN atau biometrik.", "goals": ["Login cepat (< 5 detik)", "Aman dari brute force"], "definitionOfDone": "Input PIN/biometrik, validasi, lock setelah 3x gagal, lupa PIN." },
      "B1a": { "description": "Input field untuk memasukkan email atau username.", "goals": ["Validasi format email", "Autocomplete"], "definitionOfDone": "Validasi format, trim whitespace, tampilkan error jika invalid." },
      "B1b": { "description": "Input field untuk password dengan opsi show/hide.", "goals": ["Keamanan input", "Kemudahan pengguna"], "definitionOfDone": "Masked input, toggle show/hide, min 8 karakter." },
      "B1c": { "description": "Tombol untuk mengirim data login.", "goals": ["Loading feedback", "Cegah double-click"], "definitionOfDone": "Disabled saat loading, animasi loading, redirect ke dashboard." },
      "B1d": { "description": "Link menuju halaman lupa password.", "goals": ["Akses mudah", "Navigasi jelas"], "definitionOfDone": "Clickable link, arahkan ke halaman reset password." },
      "B1e": { "description": "Link menuju halaman registrasi.", "goals": ["Arahkan pengguna baru", "CTA jelas"], "definitionOfDone": "Clickable link, arahkan ke halaman registrasi." },
      "B2": { "description": "Halaman registrasi pengguna baru.", "goals": ["Registrasi selesai < 3 menit", "Verifikasi identitas"], "definitionOfDone": "Form data diri, verifikasi OTP via SMS/email, buat PIN." },
      "B2a": { "description": "Input field untuk nama lengkap pengguna.", "goals": ["Validasi nama", "Cegah input kosong"], "definitionOfDone": "Validasi min 3 karakter, hanya huruf dan spasi, tampilkan error." },
      "B2b": { "description": "Input field untuk alamat email.", "goals": ["Validasi format email", "Cegah duplikasi"], "definitionOfDone": "Validasi format email, cek unik, notifikasi jika sudah terdaftar." },
      "B2c": { "description": "Input field untuk nomor handphone.", "goals": ["Validasi nomor HP", "Format konsisten"], "definitionOfDone": "Validasi format nomor Indonesia, min 10 digit, hanya angka." },
      "B2d": { "description": "Input field untuk password.", "goals": ["Keamanan password", "Kekuatan password"], "definitionOfDone": "Min 8 karakter, kombinasi huruf & angka, tampilkan strength meter." },
      "B2e": { "description": "Input field untuk konfirmasi password.", "goals": [ "Pastikan password cocok", "Cegah typo"], "definitionOfDone": "Validasi cocok dengan password, real-time match indicator." },
      "B2f": { "description": "Tombol untuk mendaftarkan akun baru.", "goals": ["Proses registrasi", "Loading feedback"], "definitionOfDone": "Validasi semua form, disabled saat loading, redirect ke halaman login." },
      "B3": { "description": "Halaman reset PIN jika lupa.", "goals": ["Reset PIN tanpa datang ke cabang", "Keamanan terjamin"], "definitionOfDone": "Input email/no.HP, kirim OTP, buat PIN baru, konfirmasi PIN." },
      "B3a": { "description": "Input field untuk email atau nomor HP.", "goals": ["Identifikasi akun", "Cari pengguna"], "definitionOfDone": "Validasi format, cek akun terdaftar, notifikasi jika tidak ditemukan." },
      "B3b": { "description": "Tombol untuk mengirim kode OTP.", "goals": ["Kirim OTP cepat", "Feedback pengguna"], "definitionOfDone": "Kirim OTP via SMS/email, cooldown timer 60 detik, disabled saat loading." },
      "B3c": { "description": "Input field untuk kode OTP.", "goals": ["Verifikasi OTP", "Cegah brute force"], "definitionOfDone": "Input 6 digit, auto-submit, validasi OTP, expired setelah 5 menit." },
      "B3d": { "description": "Input field untuk PIN baru.", "goals": [ "Buat PIN aman", "Mudah diingat"], "definitionOfDone": "Input 6 digit angka, validasi tidak sama dengan PIN lama, konfirmasi." },
      "B3e": { "description": "Input field untuk konfirmasi PIN baru.", "goals": ["Pastikan PIN cocok", "Cegah kesalahan"], "definitionOfDone": "Validasi cocok dengan PIN baru, tampilkan error jika tidak sama." },
      "C1": { "description": "Halaman daftar bank tujuan dan input nominal transfer.", "goals": ["Pilih bank dengan cepat", "Cegah salah input"], "definitionOfDone": "Daftar bank searchable, input nominal dengan format Rupiah, auto-konfirmasi." },
      "C1a": { "description": "Dropdown/picker untuk memilih bank tujuan.", "goals": ["Cari bank cepat", "Daftar lengkap"], "definitionOfDone": "Searchable dropdown, daftar semua bank Indonesia, pilih dengan cepat." },
      "C1b": { "description": "Input field untuk nomor rekening tujuan.", "goals": ["Validasi nomor rekening", "Cek nama pemilik"], "definitionOfDone": "Hanya angka, validasi panjang, auto-cek nama pemilik via API." },
      "C1c": { "description": "Input field untuk nominal transfer.", "goals": ["Format Rupiah", "Cegah kesalahan nominal"], "definitionOfDone": "Format Rupiah real-time, validasi saldo cukup, min & max transfer." },
      "C1d": { "description": "Input field untuk berita/pesan transfer.", "goals": ["Informasi tambahan", "Opsional"], "definitionOfDone": "Textarea opsional, max 100 karakter, tidak wajib diisi." },
      "C1e": { "description": "Tombol untuk melanjutkan ke detail transfer.", "goals": ["Navigasi ke detail", "Validasi input"], "definitionOfDone": "Validasi semua field, disabled jika ada error, lanjut ke halaman detail." },
      "C1f": { "description": "Preview ringkasan transfer sebelum lanjut.", "goals": ["Informasi cepat", "Konfirmasi awal"], "definitionOfDone": "Tampilkan bank, rekening, nominal, biaya admin dalam satu kartu." },
      "C2": { "description": "Halaman detail transfer sebelum konfirmasi.", "goals": ["Informasi lengkap sebelum kirim", "Kesempatan koreksi"], "definitionOfDone": "Tampilkan rekening pengirim & penerima, nominal, biaya admin, total." },
      "C2a": { "description": "Informasi rekening pengirim.", "goals": [ "Pastikan pengirim benar", "Info jelas"], "definitionOfDone": "Tampilkan nama, no.rekening, saldo terkini pengirim." },
      "C2b": { "description": "Informasi rekening penerima.", "goals": ["Pastikan penerima benar", "Cegah salah kirim"], "definitionOfDone": "Tampilkan nama bank, nama pemilik, no.rekening tujuan." },
      "C2c": { "description": "Nominal transfer yang akan dikirim.", "goals": ["Jumlah jelas", "Format Rupiah"], "definitionOfDone": "Tampilkan nominal dalam format Rupiah, terbilang." },
      "C2d": { "description": "Biaya admin untuk transfer.", "goals": ["Transparansi biaya", "Tidak ada biaya tersembunyi"], "definitionOfDone": "Tampilkan biaya admin, biaya antar bank jika ada." },
      "C2e": { "description": "Total yang akan didebit dari rekening.", "goals": ["Jumlah final", "Rincian jelas"], "definitionOfDone": "Tampilkan nominal + biaya admin dalam format Rupiah." },
      "C2f": { "description": "Tombol untuk konfirmasi dan proses transfer.", "goals": ["Proses transfer", "Validasi akhir"], "definitionOfDone": "Disabled saat loading, animasi processing, redirect ke halaman konfirmasi." },
      "C3": { "description": "Halaman konfirmasi akhir transfer.", "goals": ["Konfirmasi dengan aman", "Bukti transaksi"], "definitionOfDone": "PIN konfirmasi, status sukses/gagal, tampilkan bukti transfer." },
      "C3a": { "description": "Status hasil transfer (sukses/gagal).", "goals": ["Informasi status real-time", "Feedback jelas"], "definitionOfDone": "Tampilkan animasi sukses/gagal, pesan error jika gagal." },
      "C3b": { "description": "Detail transaksi yang telah diproses.", "goals": ["Informasi lengkap", "Referensi transaksi"], "definitionOfDone": "Tampilkan no.referensi, waktu, nominal, status dalam satu kartu." },
      "C3c": { "description": "Tombol untuk selesai dan kembali ke beranda.", "goals": ["Akhiri flow", "Navigasi pulang"], "definitionOfDone": "Redirect ke halaman utama, reset state transfer." },
      "C3d": { "description": "Tombol untuk membagikan bukti transfer.", "goals": ["Bagikan mudah", "Format siap share"], "definitionOfDone": "Buka share sheet native, format gambar bukti transfer." },
      "C3e": { "description": "Tombol untuk mencetak bukti transfer.", "goals": ["Cetak bukti", "Simpan fisik"], "definitionOfDone": "Generate PDF, buka print dialog, opsi simpan." },
      "D1": { "description": "Halaman daftar mutasi rekening.", "goals": ["Melihat transaksi terkini", "Mudah di-scan"], "definitionOfDone": "List transaksi descending, infinite scroll, pull-to-refresh." },
      "D1a": { "description": "List transaksi mutasi rekening.", "goals": ["Tampilkan transaksi", "Mudah dibaca"], "definitionOfDone": "List dengan icon, nominal, tanggal, status; warna berbeda untuk debit/kredit." },
      "D1b": { "description": "Filter berdasarkan bulan transaksi.", "goals": ["Filter cepat", "Navigasi temporal"], "definitionOfDone": "Dropdown pilih bulan & tahun, filter ulang list transaksi." },
      "D1c": { "description": "Search bar untuk mencari transaksi.", "goals": ["Cari transaksi", "Temuan cepat"], "definitionOfDone": "Search berdasarkan nominal/nama/berita, real-time filter." },
      "D1d": { "description": "Infinite scroll untuk memuat lebih banyak data.", "goals": ["Loading bertahap", "Performance"], "definitionOfDone": "Scroll ke bawah muat 20 item berikutnya, loading indicator." },
      "D2": { "description": "Halaman filter untuk menyaring mutasi.", "goals": ["Cari transaksi spesifik", "Filter multi-kriteria"], "definitionOfDone": "Filter tanggal, tipe transaksi (debit/kredit), rentang nominal." },
      "D2a": { "description": "Picker tanggal awal filter.", "goals": ["Pilih rentang awal", "Mudah digunakan"], "definitionOfDone": "Date picker, default 30 hari lalu, format DD/MM/YYYY." },
      "D2b": { "description": "Picker tanggal akhir filter.", "goals": ["Pilih rentang akhir", "Validasi tanggal"], "definitionOfDone": "Date picker, tidak boleh sebelum tanggal awal, max hari ini." },
      "D2c": { "description": "Dropdown tipe transaksi (debit/kredit/semua).", "goals": ["Filter tipe", "Mudah dipilih"], "definitionOfDone": "Opsi: Semua, Debit (masuk), Kredit (keluar)." },
      "D2d": { "description": "Input rentang nominal transaksi.", "goals": ["Filter nominal", "Range jelas"], "definitionOfDone": "Input nominal min & max, format Rupiah, validasi min <= max." },
      "D2e": { "description": "Tombol untuk menerapkan filter.", "goals": ["Aplikasikan filter", "Reset pilihan"], "definitionOfDone": "Terapkan filter, tampilkan hasil, opsi reset filter." },
      "D3": { "description": "Halaman detail satu transaksi.", "goals": ["Informasi lengkap", "Opsi tindakan"], "definitionOfDone": "Detail transaksi, status, opsi bagikan/cetak." },
      "D3a": { "description": "Informasi lengkap detail transaksi.", "goals": ["Detail jelas", "Semua informasi"], "definitionOfDone": "Tanggal, nominal, jenis, berita, saldo akhir, no.referensi." },
      "D3b": { "description": "Status transaksi (berhasil/gagal/pending).", "goals": ["Status jelas", "Kronologi"], "definitionOfDone": "Label status dengan warna, timestamp, pesan jika gagal." },
      "D3c": { "description": "Bukti transfer elektronik.", "goals": ["Bukti transaksi", "Dapat diunduh"], "definitionOfDone": "Tampilkan bukti dalam format PDF/gambar, opsi unduh." },
      "D3d": { "description": "Tombol untuk membagikan detail transaksi.", "goals": ["Bagikan mudah", "Format siap"], "definitionOfDone": "Buka share sheet native, format screenshot/gambar." },
      "E1": { "description": "Halaman pilih jenis pembayaran.", "goals": ["Cepat menemukan tagihan", "Multi-provider"], "definitionOfDone": "List kategori pembayaran, input no pelanggan, cek tagihan." },
      "E1a": { "description": "Daftar kategori/list tagihan yang tersedia.", "goals": ["Lihat semua opsi", "Pilih cepat"], "definitionOfDone": "List kategori: Listrik, Air, Telepon, BPJS, Pajak; dengan icon." },
      "E1b": { "description": "Input field untuk nomor pelanggan.", "goals": ["Input ID pelanggan", "Cek tagihan"], "definitionOfDone": "Validasi format sesuai provider, auto-detect provider." },
      "E1c": { "description": "Tombol untuk mengecek tagihan.", "goals": ["Cek tagihan", "Loading feedback"], "definitionOfDone": "Disabled saat loading, tampilkan detail tagihan dari API." },
      "E1d": { "description": "Informasi tagihan yang ditemukan.", "goals": ["Detail tagihan", "Jatuh tempo"], "definitionOfDone": "Nama pelanggan, periode, nominal, admin, total, jatuh tempo." },
      "E2": { "description": "Halaman konfirmasi pembayaran.", "goals": ["Bayar dengan sekali klik", "Bukti pembayaran"], "definitionOfDone": "Detail tagihan, nominal, tombol bayar, status sukses." },
      "E2a": { "description": "Detail pembayaran yang akan diproses.", "goals": ["Informasi final", "Review sebelum bayar"], "definitionOfDone": "Provider, no.pelanggan, periode, nominal, total + biaya admin." },
      "E2b": { "description": "Status pembayaran (sukses/gagal/pending).", "goals": ["Status real-time", "Feedback jelas"], "definitionOfDone": "Animasi sukses/gagal, no.referensi, timestamp." },
      "E2c": { "description": "Tombol untuk membayar tagihan.", "goals": ["Proses bayar", "Cegah bayar ganda"], "definitionOfDone": "Disabled saat loading, PIN/OTP konfirmasi, redirect ke status." },
      "E2d": { "description": "Tombol untuk membatalkan pembayaran.", "goals": ["Batal transaksi", "Kembali aman"], "definitionOfDone": "Konfirmasi batal, redirect ke halaman sebelumnya, tidak ada biaya." },
    },
  },
  "proj-002": {
    projectId: "proj-002",
    mermaidSyntax: `graph LR
    A["E-Commerce Platform"] --> B["Modul Pengguna"]
    A --> C["Modul Produk"]
    A --> D["Modul Keranjang"]
    A --> E["Modul Checkout"]
    
    B --> B1["Halaman Login/Registrasi"]
    B1 --> B1a["Tab Login"]
    B1 --> B1b["Tab Registrasi"]
    B1 --> B1c["Form Email"]
    B1 --> B1d["Form Password"]
    B1 --> B1e["Tombol Masuk"]
    B1 --> B1f["Sosial Login"]
    
    B --> B2["Halaman Profil"]
    B2 --> B2a["Avatar & Nama"]
    B2 --> B2b["Form Data Diri"]
    B2 --> B2c["Form No. HP"]
    B2 --> B2d["Tombol Simpan"]
    
    B --> B3["Halaman Alamat"]
    B3 --> B3a["Daftar Alamat"]
    B3 --> B3b["Tombol Tambah"]
    B3 --> B3c["Form Alamat Baru"]
    B3 --> B3d["Pilih Lokasi Map"]
    
    C --> C1["Halaman Katalog Produk"]
    C1 --> C1a["Grid Produk"]
    C1 --> C1b["Filter Kategori"]
    C1 --> C1c["Sortir"]
    C1 --> C1d["Pagination"]
    
    C --> C2["Halaman Detail Produk"]
    C2 --> C2a["Gallery Gambar"]
    C2 --> C2b["Info Produk"]
    C2 --> C2c["Rating & Review"]
    C2 --> C2d["Tombol Beli"]
    C2 --> C2e["Tombol Keranjang"]
    
    C --> C3["Halaman Pencarian"]
    C3 --> C3a["Search Bar"]
    C3 --> C3b["Filter"]
    C3 --> C3c["Hasil Pencarian"]
    C3 --> C3d["Rekomendasi"]
    
    D --> D1["Halaman Keranjang"]
    D1 --> D1a["List Item"]
    D1 --> D1b["Edit Qty"]
    D1 --> D1c["Tombol Hapus"]
    D1 --> D1d["Total Harga"]
    D1 --> D1e["Tombol Checkout"]
    
    D --> D2["Halaman Edit Keranjang"]
    D2 --> D2a["Detail Item"]
    D2 --> D2b["Qty Counter"]
    D2 --> D2c["Catatan"]
    D2 --> D2d["Tombol Simpan"]
    
    E --> E1["Halaman Metode Pembayaran"]
    E1 --> E1a["List Pembayaran"]
    E1 --> E1b["Info Tagihan"]
    E1 --> E1c["Tombol Bayar"]
    
    E --> E2["Halaman Konfirmasi Pesanan"]
    E2 --> E2a["Ringkasan Pesanan"]
    E2 --> E2b["Alamat Pengiriman"]
    E2 --> E2c["Metode Pembayaran"]
    E2 --> E2d["Tombol Konfirmasi"]
    
    E --> E3["Halaman Status Pesanan"]
    E3 --> E3a["Status Tracker"]
    E3 --> E3b["Detail Pesanan"]
    E3 --> E3c["Link Lacak"]
    E3 --> E3d["Tombol Bantuan"]
    
    style A fill:#18181b,color:#fff
    style B fill:#dbeafe,color:#1e3a5f
    style C fill:#d1fae5,color:#14532d
    style D fill:#fef3c7,color:#78350f
    style E fill:#e0e7ff,color:#312e81`,
    modules: [
      {
        name: "Modul Pengguna",
        screens: ["Halaman Login/Registrasi", "Halaman Profil", "Halaman Alamat"],
      },
      {
        name: "Modul Produk",
        screens: ["Halaman Katalog Produk", "Halaman Detail Produk", "Halaman Pencarian"],
      },
      {
        name: "Modul Keranjang",
        screens: ["Halaman Keranjang", "Halaman Edit Keranjang"],
      },
      {
        name: "Modul Checkout",
        screens: ["Halaman Metode Pembayaran", "Halaman Konfirmasi Pesanan", "Halaman Status Pesanan"],
      },
    ],
    subDiagrams: {
      "Halaman Login/Registrasi": `graph LR\n    LR["Login / Registrasi"] --> T1["Tab Login"]\n    LR --> T2["Tab Registrasi"]\n    LR --> F1["Form Email"]\n    LR --> F2["Form Password"]\n    LR --> B1["Tombol Masuk"]\n    LR --> S1["Sosial Login"]`,
      "Halaman Profil": `graph LR\n    Profil["Halaman Profil"] --> A1["Avatar & Nama"]\n    Profil --> F1["Form Data Diri"]\n    Profil --> F2["Form No. HP"]\n    Profil --> B1["Tombol Simpan"]`,
      "Halaman Alamat": `graph LR\n    Alamat["Halaman Alamat"] --> L1["Daftar Alamat"]\n    Alamat --> B1["Tombol Tambah"]\n    Alamat --> F1["Form Alamat Baru"]\n    Alamat --> M1["Pilih Lokasi Map"]`,
      "Halaman Katalog Produk": `graph LR\n    Katalog["Halaman Katalog Produk"] --> G1["Grid Produk"]\n    Katalog --> F1["Filter Kategori"]\n    Katalog --> S1["Sortir"]\n    Katalog --> P1["Pagination"]`,
      "Halaman Detail Produk": `graph LR\n    Detail["Halaman Detail Produk"] --> G1["Gallery Gambar"]\n    Detail --> I1["Info Produk"]\n    Detail --> R1["Rating & Review"]\n    Detail --> B1["Tombol Beli"]\n    Detail --> B2["Tombol Keranjang"]`,
      "Halaman Pencarian": `graph LR\n    Cari["Halaman Pencarian"] --> S1["Search Bar"]\n    Cari --> F1["Filter"]\n    Cari --> H1["Hasil Pencarian"]\n    Cari --> R1["Rekomendasi"]`,
      "Halaman Keranjang": `graph LR\n    Keranjang["Halaman Keranjang"] --> L1["List Item"]\n    Keranjang --> E1["Edit Qty"]\n    Keranjang --> H1["Tombol Hapus"]\n    Keranjang --> T1["Total Harga"]\n    Keranjang --> B1["Tombol Checkout"]`,
      "Halaman Edit Keranjang": `graph LR\n    EK["Edit Keranjang"] --> I1["Detail Item"]\n    EK --> Q1["Qty Counter"]\n    EK --> N1["Catatan"]\n    EK --> B1["Tombol Simpan"]`,
      "Halaman Metode Pembayaran": `graph LR\n    MP["Metode Pembayaran"] --> L1["List Pembayaran"]\n    MP --> I1["Info Tagihan"]\n    MP --> B1["Tombol Bayar"]`,
      "Halaman Konfirmasi Pesanan": `graph LR\n    KP2["Konfirmasi Pesanan"] --> I1["Ringkasan Pesanan"]\n    KP2 --> A1["Alamat Pengiriman"]\n    KP2 --> P1["Metode Pembayaran"]\n    KP2 --> B1["Tombol Konfirmasi"]`,
      "Halaman Status Pesanan": `graph LR\n    SP["Status Pesanan"] --> S1["Status Tracker"]\n    SP --> I1["Detail Pesanan"]\n    SP --> L1["Link Lacak"]\n    SP --> B1["Tombol Bantuan"]`,
    },
    nodeDetails: {
      "A": { "description": "Platform e-commerce dengan fitur katalog, keranjang, dan checkout.", "goals": ["Mempermudah belanja online", "Pengalaman pengguna yang mulus", "Meningkatkan konversi penjualan"], "definitionOfDone": "Platform live dengan 100+ produk, flow checkout end-to-end berjalan, pembayaran terintegrasi." },
      "B": { "description": "Modul untuk mengelola akun pengguna.", "goals": [ "Registrasi mudah", "Keamanan data pengguna"], "definitionOfDone": "Login/registrasi, profil, alamat pengiriman tersimpan." },
      "C": { "description": "Modul untuk menampilkan dan mencari produk.", "goals": ["Katalog lengkap", "Pencarian & filter akurat"], "definitionOfDone": "Katalog dengan filter, detail produk, gallery gambar, rating & review." },
      "D": { "description": "Modul keranjang belanja.", "goals": ["Mudah mengelola item", "Checkout cepat"], "definitionOfDone": "Tambah/hapus item, edit qty, total harga real-time, checkout." },
      "E": { "description": "Modul checkout dan pembayaran.", "goals": ["Checkout cepat", "Banyak metode bayar"], "definitionOfDone": "Pilih metode bayar, konfirmasi pesanan, tracking status, notifikasi." },
      "B1": { "description": "Halaman login dan registrasi pengguna.", "goals": ["Akses cepat ke akun", "Daftar akun baru"], "definitionOfDone": "Tab login & registrasi, form validasi, sosial login." },
      "B1a": { "description": "Tab untuk beralih ke form login.", "goals": ["Navigasi tab", "UX jelas"], "definitionOfDone": "Tab aktif dengan highlight, tampilkan form login." },
      "B1b": { "description": "Tab untuk beralih ke form registrasi.", "goals": ["Navigasi tab", "UX jelas"], "definitionOfDone": "Tab aktif dengan highlight, tampilkan form registrasi." },
      "B1c": { "description": "Input field untuk alamat email.", "goals": ["Validasi email", "Cegah input salah"], "definitionOfDone": "Validasi format email, trim whitespace, tampilkan error jika invalid." },
      "B1d": { "description": "Input field untuk password.", "goals": ["Keamanan input", "Show/hide password"], "definitionOfDone": "Masked input, toggle visibility, min 8 karakter." },
      "B1e": { "description": "Tombol untuk masuk/login.", "goals": ["Proses login", "Feedback loading"], "definitionOfDone": "Disabled saat loading, validasi form, redirect ke dashboard." },
      "B1f": { "description": "Opsi login dengan akun sosial media.", "goals": ["Login cepat", "Tanpa registrasi"], "definitionOfDone": "Tombol Google, Facebook, Apple; OAuth flow berjalan." },
      "B2": { "description": "Halaman profil pengguna.", "goals": ["Lihat dan edit profil", "Data akun terkini"], "definitionOfDone": "Avatar, nama, data diri, no HP, tombol simpan." },
      "B2a": { "description": "Avatar dan nama pengguna.", "goals": ["Identitas visual", "Personalisasi"], "definitionOfDone": "Avatar upload, nama lengkap tampil, opsi ganti foto." },
      "B2b": { "description": "Form untuk mengubah data diri pengguna.", "goals": ["Edit data pribadi", "Update informasi"], "definitionOfDone": "Nama, email, tgl lahir, jenis kelamin; validasi input." },
      "B2c": { "description": "Input field untuk nomor handphone.", "goals": ["Validasi nomor HP", "Update kontak"], "definitionOfDone": "Validasi format nomor, min 10 digit, verifikasi OTP." },
      "B2d": { "description": "Tombol untuk menyimpan perubahan profil.", "goals": ["Simpan data", "Feedback sukses"], "definitionOfDone": "Validasi form, simpan ke server, toast sukses." },
      "B3": { "description": "Halaman manajemen alamat pengiriman.", "goals": ["Atur alamat", "Pilih alamat utama"], "definitionOfDone": "Daftar alamat, tambah/edit/hapus alamat, pilih default." },
      "B3a": { "description": "Daftar alamat pengiriman tersimpan.", "goals": ["Lihat semua alamat", "Pilih alamat"], "definitionOfDone": "List alamat dengan label, opsi set primary, hapus." },
      "B3b": { "description": "Tombol untuk menambah alamat baru.", "goals": ["Tambah alamat", "Form baru"], "definitionOfDone": "Buka form tambah alamat, validasi input." },
      "B3c": { "description": "Form untuk mengisi alamat baru.", "goals": ["Input alamat lengkap", "Data akurat"], "definitionOfDone": "Form: label, provinsi, kota, kecamatan, kode pos, detail." },
      "B3d": { "description": "Pilih lokasi menggunakan peta.", "goals": [ "Lokasi akurat", "Pin point"], "definitionOfDone": "Integrasi map, drag pin, ambil koordinat." },
      "C1": { "description": "Halaman katalog produk.", "goals": ["Tampilkan produk", "Navigasi mudah"], "definitionOfDone": "Grid produk, filter kategori, sortir, pagination." },
      "C1a": { "description": "Grid tampilan produk.", "goals": ["Visual menarik", "Informasi cepat"], "definitionOfDone": "Card produk: gambar, nama, harga, rating; responsive grid." },
      "C1b": { "description": "Filter berdasarkan kategori produk.", "goals": ["Filter cepat", "Kategori jelas"], "definitionOfDone": "Dropdown/list kategori, filter produk real-time." },
      "C1c": { "description": "Sortir produk (termurah/termahal/terbaru).", "goals": ["Urutkan produk", "Preferensi user"], "definitionOfDone": "Dropdown sortir: populer, harga rendah-tinggi, terbaru." },
      "C1d": { "description": "Pagination untuk navigasi halaman produk.", "goals": ["Navigasi halaman", "Load bertahap"], "definitionOfDone": "Nomor halaman, prev/next, 20 produk per halaman." },
      "C2": { "description": "Halaman detail produk.", "goals": ["Info produk lengkap", "Dorong pembelian"], "definitionOfDone": "Gallery gambar, info produk, rating & review, tombol beli." },
      "C2a": { "description": "Gallery gambar produk dengan carousel.", "goals": ["Lihat produk dari berbagai sisi", "Zoom"], "definitionOfDone": "Carousel gambar, zoom on tap, indikator slide." },
      "C2b": { "description": "Informasi detail produk.", "goals": ["Deskripsi lengkap", "Spesifikasi jelas"], "definitionOfDone": "Nama, harga, deskripsi, spesifikasi, stok, varian." },
      "C2c": { "description": "Rating dan review dari pembeli.", "goals": ["Ulasan pembeli", "Rating visual"], "definitionOfDone": "Bintang rating, list review, filter rating, opsi tulis review." },
      "C2d": { "description": "Tombol untuk langsung membeli produk.", "goals": ["Beli cepat", "Skip keranjang"], "definitionOfDone": "Langsung ke halaman checkout dengan item ini." },
      "C2e": { "description": "Tombol untuk menambah produk ke keranjang.", "goals": ["Tambah ke keranjang", "Lanjut belanja"], "definitionOfDone": "Animasi tambah, badge counter, toast notifikasi." },
      "C3": { "description": "Halaman pencarian produk.", "goals": ["Cari produk cepat", "Temuan relevan"], "definitionOfDone": "Search bar, filter, hasil pencarian, rekomendasi." },
      "C3a": { "description": "Search bar untuk mencari produk.", "goals": ["Input pencarian", "Auto-suggest"], "definitionOfDone": "Search dengan debounce, auto-suggest, riwayat pencarian." },
      "C3b": { "description": "Filter hasil pencarian.", "goals": ["Persempit hasil", "Filter multi-kriteria"], "definitionOfDone": "Filter kategori, rentang harga, rating; terapkan filter." },
      "C3c": { "description": "Hasil pencarian produk.", "goals": ["Tampilkan hasil", "Relevan"], "definitionOfDone": "Grid/list hasil, jumlah hasil, notifikasi jika tidak ditemukan." },
      "C3d": { "description": "Rekomendasi produk terkait.", "goals": ["Produk alternatif", "Personalisasi"], "definitionOfDone": "Card rekomendasi berdasarkan pencarian, 4 item." },
      "D1": { "description": "Halaman keranjang belanja.", "goals": ["Review item sebelum beli", "Edit keranjang"], "definitionOfDone": "List item, edit qty, hapus, total harga, tombol checkout." },
      "D1a": { "description": "List item dalam keranjang.", "goals": ["Lihat semua item", "Informasi ringkas"], "definitionOfDone": "Card item: gambar, nama, varian, harga, qty, subtotal." },
      "D1b": { "description": "Edit kuantitas item di keranjang.", "goals": ["Ubah jumlah", "Mudah digunakan"], "definitionOfDone": "Counter +/- dengan stok maksimum, update subtotal real-time." },
      "D1c": { "description": "Tombol untuk menghapus item dari keranjang.", "goals": ["Hapus item", "Konfirmasi"], "definitionOfDone": "Swipe to delete atau tombol hapus dengan konfirmasi." },
      "D1d": { "description": "Total harga semua item di keranjang.", "goals": ["Total jelas", "Rincian biaya"], "definitionOfDone": "Subtotal, ongkir (jika ada), diskon, total akhir." },
      "D1e": { "description": "Tombol untuk lanjut ke checkout.", "goals": [ "Proses checkout", "Mulai pembayaran"], "definitionOfDone": "Disabled jika keranjang kosong, navigasi ke halaman checkout." },
      "D2": { "description": "Halaman edit detail item di keranjang.", "goals": ["Ubah detail item", "Catatan tambahan"], "definitionOfDone": "Detail item, qty counter, catatan, tombol simpan." },
      "D2a": { "description": "Detail lengkap item yang akan diedit.", "goals": ["Info item", "Varian produk"], "definitionOfDone": "Gambar besar, nama, varian terpilih, harga satuan." },
      "D2b": { "description": "Counter untuk mengubah kuantitas item.", "goals": ["Ubah jumlah mudah", "Cegah stok minus"], "definitionOfDone": "Tombol +/- dengan batas stok, input manual." },
      "D2c": { "description": "Input field untuk catatan item.", "goals": ["Catatan tambahan", "Request khusus"], "definitionOfDone": "Textarea untuk catatan, max 200 karakter, opsional." },
      "D2d": { "description": "Tombol untuk menyimpan perubahan item.", "goals": ["Simpan edit", "Kembali ke keranjang"], "definitionOfDone": "Simpan qty & catatan, update subtotal, navigasi kembali." },
      "E1": { "description": "Halaman metode pembayaran.", "goals": ["Pilih metode bayar", "Info tagihan"], "definitionOfDone": "List metode pembayaran, info tagihan, tombol bayar." },
      "E1a": { "description": "Daftar metode pembayaran yang tersedia.", "goals": ["Banyak opsi", "Informasi jelas"], "definitionOfDone": "List: transfer bank, e-wallet, kartu kredit, COD; dengan icon." },
      "E1b": { "description": "Informasi ringkasan tagihan.", "goals": ["Total jelas", "Rincian biaya"], "definitionOfDone": "Subtotal, ongkir, diskon, kode promo, total akhir." },
      "E1c": { "description": "Tombol untuk memproses pembayaran.", "goals": ["Bayar sekarang", "Proses aman"], "definitionOfDone": "Validasi metode terpilih, proses pembayaran, redirect." },
      "E2": { "description": "Halaman konfirmasi pesanan.", "goals": ["Review pesanan", "Konfirmasi akhir"], "definitionOfDone": "Ringkasan pesanan, alamat, metode bayar, tombol konfirmasi." },
      "E2a": { "description": "Ringkasan lengkap pesanan.", "goals": ["Info pesanan", "Review item"], "definitionOfDone": "List item, qty, subtotal, diskon, total, estimasi pengiriman." },
      "E2b": { "description": "Alamat pengiriman yang dipilih.", "goals": ["Pastikan alamat", "Opsi ganti"], "definitionOfDone": "Nama, no HP, alamat lengkap; opsi ganti alamat." },
      "E2c": { "description": "Metode pembayaran yang dipilih.", "goals": ["Konfirmasi metode", "Info bayar"], "definitionOfDone": "Nama metode, instruksi bayar, opsi ganti metode." },
      "E2d": { "description": "Tombol untuk konfirmasi pesanan.", "goals": ["Pesan sekarang", "Proses akhir"], "definitionOfDone": "Validasi semua data, proses order, tampilkan nomor pesanan." },
      "E3": { "description": "Halaman status pesanan.", "goals": ["Tracking pesanan", "Update real-time"], "definitionOfDone": "Status tracker, detail pesanan, link lacak, tombol bantuan." },
      "E3a": { "description": "Tracker visual status pesanan.", "goals": ["Progress pesanan", "Estimasi sampai"], "definitionOfDone": "Timeline: diproses, dikemas, dikirim, sampai; dengan timestamp." },
      "E3b": { "description": "Detail lengkap pesanan.", "goals": ["Info pesanan", "Referensi"], "definitionOfDone": "No.pesanan, item, total, alamat, metode bayar, status." },
      "E3c": { "description": "Link untuk melacak pengiriman.", "goals": ["Lacak kiriman", "Update ekspedisi"], "definitionOfDone": "Link ke halaman tracking ekspedisi, no.resi." },
      "E3d": { "description": "Tombol untuk menghubungi bantuan.", "goals": ["Bantuan cepat", "Layanan pelanggan"], "definitionOfDone": "Buka chat/call CS, FAQ, opsi komplain." },
    },
  },
  "proj-005": {
    projectId: "proj-005",
    mermaidSyntax: `graph LR
    A["Portal Self-Service Karyawan"] --> B["Modul Masuk"]
    A --> C["Modul Cuti"]
    A --> D["Modul Izin"]
    A --> E["Modul Slip Gaji"]
    
    B --> B1["Halaman Login"]
    B1 --> B1a["Form NIK"]
    B1 --> B1b["Form Password"]
    B1 --> B1c["Tombol Masuk"]
    B1 --> B1d["Lupa Password"]
    
    B --> B2["Halaman Reset Password"]
    B2 --> B2a["Form NIK"]
    B2 --> B2b["Form Email"]
    B2 --> B2c["Tombol Kirim"]
    B2 --> B2d["Form Password Baru"]
    
    C --> C1["Halaman Pengajuan Cuti"]
    C1 --> C1a["Pilih Jenis Cuti"]
    C1 --> C1b["Pilih Tanggal"]
    C1 --> C1c["Form Alasan"]
    C1 --> C1d["Upload Dokumen"]
    C1 --> C1e["Tombol Ajukan"]
    
    C --> C2["Halaman Riwayat Cuti"]
    C2 --> C2a["Tabel Riwayat"]
    C2 --> C2b["Filter Bulan"]
    C2 --> C2c["Status Warna"]
    
    C --> C3["Halaman Approval Cuti"]
    C3 --> C3a["List Pengajuan"]
    C3 --> C3b["Detail Cuti"]
    C3 --> C3c["Tombol Setuju"]
    C3 --> C3d["Tombol Tolak"]
    
    D --> D1["Halaman Pengajuan Izin"]
    D1 --> D1a["Pilih Jenis Izin"]
    D1 --> D1b["Pilih Tanggal"]
    D1 --> D1c["Form Alasan"]
    D1 --> D1d["Tombol Ajukan"]
    
    D --> D2["Halaman Riwayat Izin"]
    D2 --> D2a["Tabel Riwayat"]
    D2 --> D2b["Filter Bulan"]
    
    E --> E1["Halaman Daftar Slip Gaji"]
    E1 --> E1a["Tabel Bulanan"]
    E1 --> E1b["Tombol Detail"]
    
    E --> E2["Halaman Detail Slip Gaji"]
    E2 --> E2a["Info Karyawan"]
    E2 --> E2b["Pendapatan"]
    E2 --> E2c["Potongan"]
    E2 --> E2d["Total"]
    
    E --> E3["Halaman Unduh Slip"]
    E3 --> E3a["Pilih Bulan"]
    E3 --> E3b["Tombol Download PDF"]
    
    style A fill:#18181b,color:#fff
    style B fill:#dbeafe,color:#1e3a5f
    style C fill:#d1fae5,color:#14532d
    style D fill:#fef3c7,color:#78350f
    style E fill:#e0e7ff,color:#312e81`,
    modules: [
      {
        name: "Modul Masuk",
        screens: ["Halaman Login", "Halaman Reset Password"],
      },
      {
        name: "Modul Cuti",
        screens: ["Halaman Pengajuan Cuti", "Halaman Riwayat Cuti", "Halaman Approval Cuti"],
      },
      {
        name: "Modul Izin",
        screens: ["Halaman Pengajuan Izin", "Halaman Riwayat Izin"],
      },
      {
        name: "Modul Slip Gaji",
        screens: ["Halaman Daftar Slip Gaji", "Halaman Detail Slip Gaji", "Halaman Unduh Slip"],
      },
    ],
    subDiagrams: {
      "Halaman Login": `graph LR\n    Login5["Halaman Login"] --> F1["Form NIK"]\n    Login5 --> F2["Form Password"]\n    Login5 --> B1["Tombol Masuk"]\n    Login5 --> L1["Lupa Password"]`,
      "Halaman Reset Password": `graph LR\n    RP["Reset Password"] --> F1["Form NIK"]\n    RP --> F2["Form Email"]\n    RP --> B1["Tombol Kirim"]\n    RP --> F3["Form Password Baru"]`,
      "Halaman Pengajuan Cuti": `graph LR\n    PC["Pengajuan Cuti"] --> S1["Pilih Jenis Cuti"]\n    PC --> D1["Pilih Tanggal"]\n    PC --> F1["Form Alasan"]\n    PC --> U1["Upload Dokumen"]\n    PC --> B1["Tombol Ajukan"]`,
      "Halaman Riwayat Cuti": `graph LR\n    RC["Riwayat Cuti"] --> T1["Tabel Riwayat"]\n    RC --> F1["Filter Bulan"]\n    RC --> S1["Status Warna"]`,
      "Halaman Approval Cuti": `graph LR\n    AC["Approval Cuti"] --> L1["List Pengajuan"]\n    AC --> D1["Detail Cuti"]\n    AC --> B1["Tombol Setuju"]\n    AC --> B2["Tombol Tolak"]`,
      "Halaman Pengajuan Izin": `graph LR\n    PI["Pengajuan Izin"] --> S1["Pilih Jenis Izin"]\n    PI --> D1["Pilih Tanggal"]\n    PI --> F1["Form Alasan"]\n    PI --> B1["Tombol Ajukan"]`,
      "Halaman Riwayat Izin": `graph LR\n    RI["Riwayat Izin"] --> T1["Tabel Riwayat"]\n    RI --> F1["Filter Bulan"]`,
      "Halaman Daftar Slip Gaji": `graph LR\n    DSG["Daftar Slip"] --> T1["Tabel Bulanan"]\n    DSG --> B1["Tombol Detail"]`,
      "Halaman Detail Slip Gaji": `graph LR\n    DDSG["Detail Slip Gaji"] --> I1["Info Karyawan"]\n    DDSG --> I2["Pendapatan"]\n    DDSG --> I3["Potongan"]\n    DDSG --> I4["Total"]`,
      "Halaman Unduh Slip": `graph LR\n    US["Unduh Slip"] --> S1["Pilih Bulan"]\n    US --> B1["Tombol Download PDF"]`,
    },
    nodeDetails: {
      "A": { "description": "Portal self-service karyawan untuk cuti, izin, dan slip gaji.", "goals": ["Digitalisasi proses HR", "Kemudahan akses karyawan", "Efisiensi administrasi"], "definitionOfDone": "Portal live, semua fitur self-service berjalan, integrasi dengan sistem HR existing." },
      "B": { "description": "Modul untuk autentikasi karyawan.", "goals": ["Akses aman", "Pengalaman login mudah"], "definitionOfDone": "Login dengan NIK & password, reset password via email." },
      "C": { "description": "Modul untuk pengelolaan cuti karyawan.", "goals": ["Pengajuan cuti mudah", "Approval otomatis"], "definitionOfDone": "Ajukan cuti, riwayat cuti, approval atasan, saldo cuti." },
      "D": { "description": "Modul untuk pengajuan izin.", "goals": ["Izin cepat", "Tracking status"], "definitionOfDone": "Ajukan izin, riwayat izin, status approval." },
      "E": { "description": "Modul untuk melihat dan mengunduh slip gaji.", "goals": ["Akses slip gaji kapan saja", "Digitalisasi dokumen"], "definitionOfDone": "Daftar slip gaji bulanan, detail slip, download PDF." },
      "B1": { "description": "Halaman login karyawan.", "goals": ["Login cepat", "Akses aman"], "definitionOfDone": "Input NIK & password, validasi, redirect ke dashboard." },
      "B1a": { "description": "Input field untuk NIK karyawan.", "goals": ["Validasi NIK", "Cegah input salah"], "definitionOfDone": "Hanya angka, validasi format NIK, cek NIK terdaftar." },
      "B1b": { "description": "Input field untuk password.", "goals": ["Keamanan login", "Input aman"], "definitionOfDone": "Masked input, min 6 karakter, cek kredensial." },
      "B1c": { "description": "Tombol untuk masuk/login.", "goals": ["Proses login", "Feedback loading"], "definitionOfDone": "Disabled saat loading, validasi form, redirect ke dashboard." },
      "B1d": { "description": "Link menuju halaman reset password.", "goals": ["Reset password", "Navigasi mudah"], "definitionOfDone": "Clickable link, arahkan ke form reset password." },
      "B2": { "description": "Halaman reset password.", "goals": ["Reset password aman", "Verifikasi identitas"], "definitionOfDone": "Input NIK, email, kirim link reset, buat password baru." },
      "B2a": { "description": "Input field untuk NIK.", "goals": ["Verifikasi identitas", "Cari akun"], "definitionOfDone": "Validasi NIK, cek akun terdaftar." },
      "B2b": { "description": "Input field untuk email terdaftar.", "goals": ["Verifikasi email", "Kirim link reset"], "definitionOfDone": "Validasi email, cek cocok dengan data NIK." },
      "B2c": { "description": "Tombol untuk mengirim link reset.", "goals": ["Kirim email reset", "Feedback"], "definitionOfDone": "Disabled saat loading, kirim email, notifikasi sukses." },
      "B2d": { "description": "Input field untuk password baru.", "goals": ["Buat password baru", "Konfirmasi"], "definitionOfDone": "Min 8 karakter, konfirmasi password, simpan perubahan." },
      "C1": { "description": "Halaman pengajuan cuti.", "goals": ["Ajukan cuti mudah", "Lengkapi dokumen"], "definitionOfDone": "Pilih jenis cuti, tanggal, alasan, upload dokumen, tombol ajukan." },
      "C1a": { "description": "Pilihan jenis cuti (tahunan/sakit/dll).", "goals": ["Kategorisasi cuti", "Sesuai aturan"], "definitionOfDone": "Dropdown jenis cuti, tampilkan sisa saldo cuti." },
      "C1b": { "description": "Picker tanggal mulai dan selesai cuti.", "goals": ["Pilih rentang cuti", "Validasi tanggal"], "definitionOfDone": "Date picker range, hitung otomatis jumlah hari, cek kuota." },
      "C1c": { "description": "Textarea untuk alasan pengajuan cuti.", "goals": ["Alasan jelas", "Dokumentasi"], "definitionOfDone": "Textarea wajib diisi, min 10 karakter." },
      "C1d": { "description": "Upload dokumen pendukung (surat dokter dll).", "goals": ["Lampiran dokumen", "Validasi file"], "definitionOfDone": "Upload PDF/JPG, max 2MB, preview file." },
      "C1e": { "description": "Tombol untuk mengajukan cuti.", "goals": ["Kirim pengajuan", "Feedback"], "definitionOfDone": "Validasi form, submit, notifikasi sukses, redirect." },
      "C2": { "description": "Halaman riwayat cuti.", "goals": ["Monitoring cuti", "Tracking status"], "definitionOfDone": "Tabel riwayat, filter bulan, status dengan warna." },
      "C2a": { "description": "Tabel riwayat pengajuan cuti.", "goals": ["Data terstruktur", "Mudah dibaca"], "definitionOfDone": "Kolom: tanggal, jenis, durasi, status; sorting." },
      "C2b": { "description": "Filter berdasarkan bulan/tahun.", "goals": ["Filter riwayat", "Cari cepat"], "definitionOfDone": "Dropdown bulan & tahun, filter tabel." },
      "C2c": { "description": "Indikator warna status cuti.", "goals": ["Status visual", "Cepat dikenali"], "definitionOfDone": "Hijau=disetujui, kuning=pending, merah=ditolak." },
      "C3": { "description": "Halaman approval cuti untuk atasan.", "goals": ["Review pengajuan", "Setuju/tolak"], "definitionOfDone": "List pengajuan, detail cuti, tombol setuju/tolak." },
      "C3a": { "description": "List pengajuan cuti yang perlu di-approve.", "goals": ["Lihat semua", "Prioritas"], "definitionOfDone": "List karyawan, tanggal, jenis cuti, status; urut berdasarkan tanggal." },
      "C3b": { "description": "Detail pengajuan cuti karyawan.", "goals": ["Info lengkap", "Dokumen pendukung"], "definitionOfDone": "Detail: nama, jabatan, tanggal, alasan, lampiran." },
      "C3c": { "description": "Tombol untuk menyetujui cuti.", "goals": ["Approve cepat", "Update status"], "definitionOfDone": "Konfirmasi setuju, update status, notifikasi ke karyawan." },
      "C3d": { "description": "Tombol untuk menolak pengajuan cuti.", "goals": ["Tolak dengan alasan", "Feedback"], "definitionOfDone": "Dialog alasan penolakan, update status, notifikasi." },
      "D1": { "description": "Halaman pengajuan izin.", "goals": ["Izin cepat", "Proses mudah"], "definitionOfDone": "Pilih jenis izin, tanggal, alasan, tombol ajukan." },
      "D1a": { "description": "Pilihan jenis izin.", "goals": ["Kategorisasi izin", "Sesuai keperluan"], "definitionOfDone": "Dropdown jenis izin: sakit, keperluan keluarga, dll." },
      "D1b": { "description": "Picker tanggal izin.", "goals": ["Pilih tanggal", "Validasi"], "definitionOfDone": "Date picker single date, tidak bisa mundur." },
      "D1c": { "description": "Textarea untuk alasan izin.", "goals": ["Alasan jelas", "Dokumentasi"], "definitionOfDone": "Textarea wajib diisi, min 10 karakter." },
      "D1d": { "description": "Tombol untuk mengajukan izin.", "goals": ["Kirim izin", "Feedback"], "definitionOfDone": "Validasi form, submit, notifikasi sukses." },
      "D2": { "description": "Halaman riwayat izin.", "goals": ["Monitoring izin", "Tracking"], "definitionOfDone": "Tabel riwayat, filter bulan, status." },
      "D2a": { "description": "Tabel riwayat pengajuan izin.", "goals": ["Data terstruktur", "Mudah dibaca"], "definitionOfDone": "Kolom: tanggal, jenis, durasi, status; sorting." },
      "D2b": { "description": "Filter berdasarkan bulan.", "goals": ["Filter riwayat", "Cari cepat"], "definitionOfDone": "Dropdown bulan & tahun, filter tabel." },
      "E1": { "description": "Halaman daftar slip gaji bulanan.", "goals": ["Akses slip gaji", "Daftar bulanan"], "definitionOfDone": "Tabel slip gaji per bulan, tombol detail." },
      "E1a": { "description": "Tabel daftar slip gaji per bulan.", "goals": ["Data bulanan", "Mudah di-scan"], "definitionOfDone": "Kolom: periode, gaji pokok, tunjangan, total; sorting." },
      "E1b": { "description": "Tombol untuk melihat detail slip gaji.", "goals": ["Lihat detail", "Informasi lengkap"], "definitionOfDone": "Navigasi ke halaman detail slip gaji." },
      "E2": { "description": "Halaman detail slip gaji.", "goals": ["Informasi lengkap gaji", "Transparansi"], "definitionOfDone": "Info karyawan, pendapatan, potongan, total." },
      "E2a": { "description": "Informasi data karyawan.", "goals": ["Identitas karyawan", "Data terkini"], "definitionOfDone": "NIK, nama, jabatan, departemen, periode." },
      "E2b": { "description": "Rincian pendapatan gaji.", "goals": ["Detail pendapatan", "Transparan"], "definitionOfDone": "Gaji pokok, tunjangan tetap, tunjangan variabel, bonus." },
      "E2c": { "description": "Rincian potongan gaji.", "goals": ["Detail potongan", "Transparan"], "definitionOfDone": "PPh, BPJS, pinjaman, potongan lain; dengan nominal." },
      "E2d": { "description": "Total gaji bersih setelah pendapatan & potongan.", "goals": ["Take home pay", "Jumlah final"], "definitionOfDone": "Total pendapatan - total potongan = gaji bersih; format Rupiah." },
      "E3": { "description": "Halaman unduh slip gaji.", "goals": ["Download slip", "Arsip digital"], "definitionOfDone": "Pilih bulan, tombol download PDF." },
      "E3a": { "description": "Dropdown untuk memilih bulan.", "goals": ["Pilih periode", "Mudah"], "definitionOfDone": "Dropdown bulan & tahun, hanya bulan yang sudah digaji." },
      "E3b": { "description": "Tombol untuk mengunduh slip gaji PDF.", "goals": ["Download slip", "Format PDF"], "definitionOfDone": "Generate PDF slip gaji, download otomatis." },
    },
  },
  "proj-003": {
    projectId: "proj-003",
    mermaidSyntax: `graph LR
    A["Dashboard Analitik HR"] --> B["Modul Login"]
    A --> C["Modul Karyawan"]
    A --> D["Modul Analitik"]
    A --> E["Modul Laporan"]
    
    B --> B1["Halaman Login Admin"]
    B1 --> B1a["Form Email"]
    B1 --> B1b["Form Password"]
    B1 --> B1c["Tombol Masuk"]
    
    C --> C1["Dashboard Utama"]
    C1 --> C1a["KPI Cards"]
    C1 --> C1b["Grafik Jumlah Karyawan"]
    C1 --> C1c["Grafik Dept"]
    C1 --> C1d["Notifikasi"]
    
    C --> C2["Daftar Karyawan"]
    C2 --> C2a["Tabel Data"]
    C2 --> C2b["Search"]
    C2 --> C2c["Filter Dept"]
    C2 --> C2d["Pagination"]
    
    C --> C3["Detail Karyawan"]
    C3 --> C3a["Info Pribadi"]
    C3 --> C3b["Riwayat Jabatan"]
    C3 --> C3c["Kontrak"]
    C3 --> C3d["Dokumen"]
    
    D --> D1["Grafik Jumlah Karyawan"]
    D1 --> D1a["Bar Chart"]
    D1 --> D1b["Filter Tahun"]
    D1 --> D1c["Legenda"]
    
    D --> D2["Tren Rekrutmen"]
    D2 --> D2a["Line Chart"]
    D2 --> D2b["Filter Periode"]
    D2 --> D2c["Data Tabel"]
    
    D --> D3["Statistik Departemen"]
    D3 --> D3a["Pie Chart"]
    D3 --> D3b["Tabel Dept"]
    D3 --> D3c["Filter"]
    
    E --> E1["Laporan Bulanan"]
    E1 --> E1a["Tabel Laporan"]
    E1 --> E1b["Export PDF"]
    E1 --> E1c["Filter Bulan"]
    
    E --> E2["Export Data"]
    E2 --> E2a["Pilih Format CSV/Excel"]
    E2 --> E2b["Filter Data"]
    E2 --> E2c["Tombol Download"]
    
    style A fill:#18181b,color:#fff
    style B fill:#dbeafe,color:#1e3a5f
    style C fill:#d1fae5,color:#14532d
    style D fill:#fef3c7,color:#78350f
    style E fill:#e0e7ff,color:#312e81`,
    modules: [
      { name: "Modul Login", screens: ["Halaman Login Admin"] },
      { name: "Modul Karyawan", screens: ["Dashboard Utama", "Daftar Karyawan", "Detail Karyawan"] },
      { name: "Modul Analitik", screens: ["Grafik Jumlah Karyawan", "Tren Rekrutmen", "Statistik Departemen"] },
      { name: "Modul Laporan", screens: ["Laporan Bulanan", "Export Data"] },
    ],
    subDiagrams: {
      "Halaman Login Admin": `graph LR\n    LA["Login Admin"] --> F1["Form Email"]\n    LA --> F2["Form Password"]\n    LA --> B1["Tombol Masuk"]`,
      "Dashboard Utama": `graph LR\n    DU["Dashboard Utama"] --> K1["KPI Cards"]\n    DU --> G1["Grafik Jumlah Karyawan"]\n    DU --> G2["Grafik Dept"]\n    DU --> N1["Notifikasi"]`,
      "Daftar Karyawan": `graph LR\n    DK["Daftar Karyawan"] --> T1["Tabel Data"]\n    DK --> S1["Search"]\n    DK --> F1["Filter Dept"]\n    DK --> P1["Pagination"]`,
      "Detail Karyawan": `graph LR\n    DTK["Detail Karyawan"] --> I1["Info Pribadi"]\n    DTK --> I2["Riwayat Jabatan"]\n    DTK --> I3["Kontrak"]\n    DTK --> D1["Dokumen"]`,
      "Grafik Jumlah Karyawan": `graph LR\n    GJ["Grafik Karyawan"] --> B1["Bar Chart"]\n    GJ --> F1["Filter Tahun"]\n    GJ --> L1["Legenda"]`,
      "Tren Rekrutmen": `graph LR\n    TR["Tren Rekrutmen"] --> L1["Line Chart"]\n    TR --> F1["Filter Periode"]\n    TR --> D1["Data Tabel"]`,
      "Statistik Departemen": `graph LR\n    SD["Statistik Dept"] --> P1["Pie Chart"]\n    SD --> T1["Tabel Dept"]\n    SD --> F1["Filter"]`,
      "Laporan Bulanan": `graph LR\n    LB["Laporan Bulanan"] --> T1["Tabel Laporan"]\n    LB --> B1["Export PDF"]\n    LB --> F1["Filter Bulan"]`,
      "Export Data": `graph LR\n    ED["Export Data"] --> S1["Pilih Format CSV/Excel"]\n    ED --> F1["Filter Data"]\n    ED --> B1["Tombol Download"]`,
    },
    nodeDetails: {
      "A": { "description": "Dashboard analitik HR dengan visualisasi data karyawan, rekrutmen, dan laporan.", "goals": ["Monitoring data HR real-time", "Pengambilan keputusan berbasis data", "Efisiensi pelaporan"], "definitionOfDone": "Dashboard live, semua grafik interaktif, export laporan multi-format." },
      "B": { "description": "Modul login admin untuk akses dashboard.", "goals": ["Akses aman", "Otentikasi admin"], "definitionOfDone": "Login dengan email & password, session management, logout." },
      "C": { "description": "Modul data karyawan.", "goals": ["Kelola data karyawan", "Visualisasi cepat"], "definitionOfDone": "Dashboard utama, daftar karyawan, detail karyawan." },
      "D": { "description": "Modul analitik dan grafik HR.", "goals": ["Visualisasi data", "Tren & insight"], "definitionOfDone": "Grafik jumlah karyawan, tren rekrutmen, statistik departemen." },
      "E": { "description": "Modul laporan dan export data.", "goals": ["Laporan bulanan", "Export multi-format"], "definitionOfDone": "Generate laporan, export PDF/CSV/Excel, filter data." },
      "B1": { "description": "Halaman login admin.", "goals": ["Login aman", "Akses terbatas"], "definitionOfDone": "Form email, password, tombol masuk, validasi kredensial." },
      "B1a": { "description": "Input field untuk email admin.", "goals": ["Validasi email", "Cegah input salah"], "definitionOfDone": "Validasi format email, trim whitespace, required." },
      "B1b": { "description": "Input field untuk password admin.", "goals": ["Keamanan login", "Input aman"], "definitionOfDone": "Masked input, min 8 karakter, validasi." },
      "B1c": { "description": "Tombol untuk masuk ke dashboard.", "goals": ["Proses login", "Feedback loading"], "definitionOfDone": "Disabled saat loading, validasi form, redirect ke dashboard." },
      "C1": { "description": "Dashboard utama dengan KPI dan grafik.", "goals": ["Overview cepat", "Data penting"], "definitionOfDone": "KPI cards, grafik jumlah karyawan, grafik departemen, notifikasi." },
      "C1a": { "description": "KPI Cards: total karyawan, turnover, dll.", "goals": ["Informasi cepat", "Key metrics"], "definitionOfDone": "Card dengan icon, nilai, tren naik/turun, periode." },
      "C1b": { "description": "Grafik jumlah karyawan per periode.", "goals": ["Tren karyawan", "Visual interaktif"], "definitionOfDone": "Bar/line chart, sumbu waktu, tooltip interaktif." },
      "C1c": { "description": "Grafik distribusi karyawan per departemen.", "goals": ["Komposisi dept", "Visual mudah"], "definitionOfDone": "Pie/bar chart, warna per departemen, legenda." },
      "C1d": { "description": "Notifikasi dan pengumuman penting.", "goals": ["Informasi real-time", "Alert"], "definitionOfDone": "List notifikasi, badge counter, mark as read." },
      "C2": { "description": "Halaman daftar seluruh karyawan.", "goals": [ "Cari karyawan", "Filter & sorting"], "definitionOfDone": "Tabel data, search, filter departemen, pagination." },
      "C2a": { "description": "Tabel data karyawan.", "goals": ["Data terstruktur", "Mudah dibaca"], "definitionOfDone": "Kolom: NIK, nama, jabatan, dept, status; sorting per kolom." },
      "C2b": { "description": "Search bar untuk mencari karyawan.", "goals": ["Cari cepat", "Filter nama/NIK"], "definitionOfDone": "Search dengan debounce, cari berdasarkan nama atau NIK." },
      "C2c": { "description": "Filter berdasarkan departemen.", "goals": ["Filter dept", "Persempit data"], "definitionOfDone": "Dropdown departemen, filter tabel real-time." },
      "C2d": { "description": "Pagination untuk navigasi halaman tabel.", "goals": ["Navigasi data", "Load bertahap"], "definitionOfDone": "Nomor halaman, prev/next, 20 row per halaman." },
      "C3": { "description": "Halaman detail seorang karyawan.", "goals": ["Info lengkap", "Dokumen terkait"], "definitionOfDone": "Info pribadi, riwayat jabatan, kontrak, dokumen." },
      "C3a": { "description": "Informasi pribadi karyawan.", "goals": ["Data diri", "Informasi dasar"], "definitionOfDone": "NIK, nama, TTL, alamat, no HP, email, foto." },
      "C3b": { "description": "Riwayat jabatan dan promosi karyawan.", "goals": ["Riwayat karir", "Tracking promosi"], "definitionOfDone": "Timeline jabatan: tanggal, posisi, departemen, grade." },
      "C3c": { "description": "Informasi kontrak kerja.", "goals": ["Status kontrak", "Masa berlaku"], "definitionOfDone": "Jenis kontrak, tgl mulai, tgl berakhir, status aktif/nonaktif." },
      "C3d": { "description": "Dokumen-dokumen terkait karyawan.", "goals": ["Dokumen digital", "Mudah diakses"], "definitionOfDone": "List dokumen: KTP, KK, ijazah, sertifikat; upload & download." },
      "D1": { "description": "Grafik jumlah karyawan interaktif.", "goals": ["Visual tren", "Analisis data"], "definitionOfDone": "Bar chart, filter tahun, legenda." },
      "D1a": { "description": "Bar chart jumlah karyawan.", "goals": ["Visual batang", "Data per periode"], "definitionOfDone": "Bar chart dengan sumbu X tahun/bulan, sumbu Y jumlah." },
      "D1b": { "description": "Filter untuk memilih tahun.", "goals": [ "Pilih rentang tahun", "Analisis temporal"], "definitionOfDone": "Dropdown tahun, update chart otomatis." },
      "D1c": { "description": "Legenda grafik.", "goals": ["Keterangan warna", "Mudah dipahami"], "definitionOfDone": "Legenda dengan warna, label, toggle visibility." },
      "D2": { "description": "Grafik tren rekrutmen.", "goals": ["Analisis rekrutmen", "Tren bulanan"], "definitionOfDone": "Line chart, filter periode, data tabel pendukung." },
      "D2a": { "description": "Line chart tren rekrutmen.", "goals": ["Visual garis", "Tren naik/turun"], "definitionOfDone": "Line chart dengan titik data, tooltip interaktif." },
      "D2b": { "description": "Filter periode untuk grafik.", "goals": ["Pilih rentang", "Analisis spesifik"], "definitionOfDone": "Date range picker, update chart." },
      "D2c": { "description": "Data tabel pendukung grafik.", "goals": ["Data detail", "Referensi"], "definitionOfDone": "Tabel bulanan: periode, jumlah rekrut, total karyawan." },
      "D3": { "description": "Statistik per departemen.", "goals": ["Komposisi dept", "Distribusi"], "definitionOfDone": "Pie chart, tabel departemen, filter." },
      "D3a": { "description": "Pie chart distribusi departemen.", "goals": ["Visual proporsi", "Perbandingan"], "definitionOfDone": "Pie chart dengan label persentase, warna per dept." },
      "D3b": { "description": "Tabel data per departemen.", "goals": ["Data detail", "Informasi dept"], "definitionOfDone": "Kolom: departemen, jumlah, persentase, perubahan." },
      "D3c": { "description": "Filter untuk menyaring data statistik.", "goals": ["Filter data", "Persempit"], "definitionOfDone": "Filter tahun/bulan, update chart & tabel." },
      "E1": { "description": "Halaman laporan bulanan.", "goals": [ "Generate laporan", "Export dokumen"], "definitionOfDone": "Tabel laporan, export PDF, filter bulan." },
      "E1a": { "description": "Tabel laporan bulanan.", "goals": ["Data laporan", "Mudah dibaca"], "definitionOfDone": "Kolom: karyawan, status, gaji, tunjangan; total per bulan." },
      "E1b": { "description": "Tombol untuk export laporan ke PDF.", "goals": ["Export PDF", "Dokumen rapi"], "definitionOfDone": "Generate PDF, download otomatis, format profesional." },
      "E1c": { "description": "Filter untuk memilih bulan laporan.", "goals": ["Pilih periode", "Filter laporan"], "definitionOfDone": "Dropdown bulan & tahun, filter data laporan." },
      "E2": { "description": "Halaman export data.", "goals": ["Export multi-format", "Data fleksibel"], "definitionOfDone": "Pilih format CSV/Excel, filter data, tombol download." },
      "E2a": { "description": "Pilihan format export: CSV atau Excel.", "goals": ["Pilih format", "Fleksibel"], "definitionOfDone": "Radio button CSV / Excel, deskripsi format." },
      "E2b": { "description": "Filter data sebelum export.", "goals": ["Filter kolom", "Export sesuai kebutuhan"], "definitionOfDone": "Checklist kolom, filter departemen, filter periode." },
      "E2c": { "description": "Tombol untuk mendownload data.", "goals": ["Download", "Proses export"], "definitionOfDone": "Disabled saat loading, proses download, notifikasi selesai." },
    },
  },
  "proj-004": {
    projectId: "proj-004",
    mermaidSyntax: `graph LR
    A["Manajemen Inventaris"] --> B["Modul Gudang"]
    A --> C["Modul Stok"]
    A --> D["Modul Pengiriman"]
    A --> E["Modul Laporan"]
    
    B --> B1["Daftar Gudang"]
    B1 --> B1a["Tabel Gudang"]
    B1 --> B1b["Tombol Tambah"]
    B1 --> B1c["Search"]
    
    B --> B2["Detail Gudang"]
    B2 --> B2a["Info Gudang"]
    B2 --> B2b["List Stok"]
    B2 --> B2c["Edit"]
    
    C --> C1["Daftar Stok"]
    C1 --> C1a["Tabel Stok"]
    C1 --> C1b["Filter Kategori"]
    C1 --> C1c["Search Bar"]
    
    C --> C2["Mutasi Stok"]
    C2 --> C2a["Form Mutasi"]
    C2 --> C2b["Pilih Gudang Asal"]
    C2 --> C2c["Pilih Gudang Tujuan"]
    C2 --> C2d["Tombol Proses"]
    
    C --> C3["Stok Opname"]
    C3 --> C3a["Tabel Opname"]
    C3 --> C3b["Form Input Fisik"]
    C3 --> C3c["Tombol Simpan"]
    
    D --> D1["Pengiriman Masuk"]
    D1 --> D1a["Tabel Masuk"]
    D1 --> D1b["Konfirmasi"]
    D1 --> D1c["Detail Kiriman"]
    
    D --> D2["Pengiriman Keluar"]
    D2 --> D2a["Tabel Keluar"]
    D2 --> D2b["Buat DO"]
    D2 --> D2c["Status"]
    
    E --> E1["Laporan Stok"]
    E1 --> E1a["Tabel Laporan"]
    E1 --> E1b["Filter Tanggal"]
    E1 --> E1c["Export"]
    
    E --> E2["Grafik Perputaran"]
    E2 --> E2a["Line Chart"]
    E2 --> E2b["Filter Periode"]
    E2 --> E2c["Data Summary"]
    
    style A fill:#18181b,color:#fff
    style B fill:#dbeafe,color:#1e3a5f
    style C fill:#d1fae5,color:#14532d
    style D fill:#fef3c7,color:#78350f
    style E fill:#e0e7ff,color:#312e81`,
    modules: [
      { name: "Modul Gudang", screens: ["Daftar Gudang", "Detail Gudang"] },
      { name: "Modul Stok", screens: ["Daftar Stok", "Mutasi Stok", "Stok Opname"] },
      { name: "Modul Pengiriman", screens: ["Pengiriman Masuk", "Pengiriman Keluar"] },
      { name: "Modul Laporan", screens: ["Laporan Stok", "Grafik Perputaran"] },
    ],
    subDiagrams: {
      "Daftar Gudang": `graph LR\n    DG["Daftar Gudang"] --> T1["Tabel Gudang"]\n    DG --> B1["Tombol Tambah"]\n    DG --> S1["Search"]`,
      "Detail Gudang": `graph LR\n    DetG["Detail Gudang"] --> I1["Info Gudang"]\n    DetG --> L1["List Stok"]\n    DetG --> B1["Edit"]`,
      "Daftar Stok": `graph LR\n    DS["Daftar Stok"] --> T1["Tabel Stok"]\n    DS --> F1["Filter Kategori"]\n    DS --> S1["Search Bar"]`,
      "Mutasi Stok": `graph LR\n    MS["Mutasi Stok"] --> F1["Form Mutasi"]\n    MS --> S1["Pilih Gudang Asal"]\n    MS --> S2["Pilih Gudang Tujuan"]\n    MS --> B1["Tombol Proses"]`,
      "Stok Opname": `graph LR\n    SO["Stok Opname"] --> T1["Tabel Opname"]\n    SO --> F1["Form Input Fisik"]\n    SO --> B1["Tombol Simpan"]`,
      "Pengiriman Masuk": `graph LR\n    PM["Pengiriman Masuk"] --> T1["Tabel Masuk"]\n    PM --> B1["Konfirmasi"]\n    PM --> D1["Detail Kiriman"]`,
      "Pengiriman Keluar": `graph LR\n    PK["Pengiriman Keluar"] --> T1["Tabel Keluar"]\n    PK --> B1["Buat DO"]\n    PK --> S1["Status"]`,
      "Laporan Stok": `graph LR\n    LS["Laporan Stok"] --> T1["Tabel Laporan"]\n    LS --> F1["Filter Tanggal"]\n    LS --> B1["Export"]`,
      "Grafik Perputaran": `graph LR\n    GP["Grafik Perputaran"] --> L1["Line Chart"]\n    GP --> F1["Filter Periode"]\n    GP --> D1["Data Summary"]`,
    },
    nodeDetails: {
      "A": { "description": "Sistem manajemen inventaris untuk gudang, stok, dan pengiriman.", "goals": [ "Digitalisasi manajemen gudang", "Akurasi data stok", "Efisiensi operasional"], "definitionOfDone": "Sistem live, semua fitur inventaris berjalan, integrasi dengan sistem procurement." },
      "B": { "description": "Modul pengelolaan data gudang.", "goals": ["Data gudang akurat", "Monitoring kapasitas"], "definitionOfDone": "Daftar gudang, detail gudang, informasi kapasitas & stok." },
      "C": { "description": "Modul manajemen stok barang.", "goals": ["Stok akurat real-time", "Mutasi stok tercatat"], "definitionOfDone": "Daftar stok, mutasi stok antar gudang, stok opname." },
      "D": { "description": "Modul pengelolaan pengiriman.", "goals": ["Tracking pengiriman", "Dokumen pengiriman"], "definitionOfDone": "Pengiriman masuk & keluar, konfirmasi, status pengiriman." },
      "E": { "description": "Modul laporan dan analitik inventaris.", "goals": ["Laporan stok", "Analisis perputaran"], "definitionOfDone": "Laporan stok, grafik perputaran, export data." },
      "B1": { "description": "Halaman daftar gudang.", "goals": ["Lihat semua gudang", "Cari gudang"], "definitionOfDone": "Tabel gudang, tombol tambah, search." },
      "B1a": { "description": "Tabel daftar gudang.", "goals": [ "Data terstruktur", "Mudah dibaca"], "definitionOfDone": "Kolom: nama, lokasi, kapasitas, stok terisi, status." },
      "B1b": { "description": "Tombol untuk menambah gudang baru.", "goals": ["Tambah gudang", "Form input"], "definitionOfDone": "Buka form tambah gudang, validasi input, simpan." },
      "B1c": { "description": "Search bar untuk mencari gudang.", "goals": ["Cari gudang", "Filter cepat"], "definitionOfDone": "Search berdasarkan nama/lokasi, real-time filter." },
      "B2": { "description": "Halaman detail gudang.", "goals": ["Info gudang lengkap", "List stok"], "definitionOfDone": "Info gudang, list stok, edit data gudang." },
      "B2a": { "description": "Informasi detail gudang.", "goals": ["Data gudang", "Kapasitas"], "definitionOfDone": "Nama, lokasi, kapasitas total, kapasitas terpakai, pic." },
      "B2b": { "description": "List stok barang di gudang ini.", "goals": ["Inventory view", "Monitoring stok"], "definitionOfDone": "Tabel stok: nama barang, kategori, qty, status." },
      "B2c": { "description": "Tombol untuk mengedit data gudang.", "goals": ["Edit gudang", "Update data"], "definitionOfDone": "Buka form edit, pre-populate data, simpan perubahan." },
      "C1": { "description": "Halaman daftar stok seluruh gudang.", "goals": ["Inventory global", "Filter & cari"], "definitionOfDone": "Tabel stok, filter kategori, search bar." },
      "C1a": { "description": "Tabel daftar stok barang.", "goals": ["Data stok", "Informasi lengkap"], "definitionOfDone": "Kolom: kode, nama, kategori, gudang, qty, min stok, status." },
      "C1b": { "description": "Filter berdasarkan kategori barang.", "goals": ["Filter kategori", "Persempit pencarian"], "definitionOfDone": "Dropdown kategori, filter tabel real-time." },
      "C1c": { "description": "Search bar untuk mencari barang.", "goals": ["Cari barang", "Temuan cepat"], "definitionOfDone": "Search berdasarkan nama/kode barang, real-time filter." },
      "C2": { "description": "Halaman mutasi stok antar gudang.", "goals": ["Pindah stok", "Catat mutasi"], "definitionOfDone": "Form mutasi, pilih gudang asal & tujuan, tombol proses." },
      "C2a": { "description": "Form untuk mengisi data mutasi stok.", "goals": ["Input mutasi", "Data akurat"], "definitionOfDone": "Pilih barang, input qty, catatan mutasi." },
      "C2b": { "description": "Dropdown untuk memilih gudang asal.", "goals": ["Pilih sumber", "Validasi stok"], "definitionOfDone": "Dropdown gudang, cek ketersediaan stok." },
      "C2c": { "description": "Dropdown untuk memilih gudang tujuan.", "goals": ["Pilih tujuan", "Tidak boleh sama"], "definitionOfDone": "Dropdown gudang, validasi tidak sama dengan asal." },
      "C2d": { "description": "Tombol untuk memproses mutasi stok.", "goals": ["Proses mutasi", "Update stok"], "definitionOfDone": "Disabled saat loading, kurangi stok asal, tambah stok tujuan." },
      "C3": { "description": "Halaman stok opname.", "goals": [ "Cocokkan stok fisik", "Rekonsiliasi"], "definitionOfDone": "Tabel opname, form input fisik, tombol simpan." },
      "C3a": { "description": "Tabel data stok opname.", "goals": ["List barang", "Bandingkan stok"], "definitionOfDone": "Kolom: barang, stok sistem, stok fisik, selisih." },
      "C3b": { "description": "Form untuk input stok fisik hasil opname.", "goals": ["Input fisik", "Akurat"], "definitionOfDone": "Input qty fisik per barang, validasi angka." },
      "C3c": { "description": "Tombol untuk menyimpan hasil opname.", "goals": ["Simpan opname", "Update sistem"], "definitionOfDone": "Simpan selisih, update stok sistem, buat laporan selisih." },
      "D1": { "description": "Halaman pengiriman masuk (inbound).", "goals": ["Tracking inbound", "Konfirmasi"], "definitionOfDone": "Tabel pengiriman masuk, konfirmasi, detail kiriman." },
      "D1a": { "description": "Tabel pengiriman masuk.", "goals": ["Data inbound", "Terstruktur"], "definitionOfDone": "Kolom: no DO, supplier, tanggal, status, aksi." },
      "D1b": { "description": "Tombol untuk konfirmasi penerimaan barang.", "goals": ["Konfirmasi terima", "Update stok"], "definitionOfDone": "Konfirmasi barang diterima, update stok otomatis." },
      "D1c": { "description": "Detail kiriman yang masuk.", "goals": ["Info lengkap", "List barang"], "definitionOfDone": "No DO, supplier, list barang, qty, kondisi." },
      "D2": { "description": "Halaman pengiriman keluar (outbound).", "goals": ["Buat DO", "Tracking outbound"], "definitionOfDone": "Tabel pengiriman keluar, buat DO, status." },
      "D2a": { "description": "Tabel pengiriman keluar.", "goals": ["Data outbound", "Terstruktur"], "definitionOfDone": "Kolom: no DO, tujuan, tanggal, status, aksi." },
      "D2b": { "description": "Tombol untuk membuat Delivery Order (DO).", "goals": ["Buat DO", "Dokumen resmi"], "definitionOfDone": "Generate DO, isi data pengiriman, cetak dokumen." },
      "D2c": { "description": "Status pengiriman keluar.", "goals": ["Tracking status", "Update real-time"], "definitionOfDone": "Status: diproses, dikirim, sampai; dengan timestamp." },
      "E1": { "description": "Halaman laporan stok.", "goals": ["Laporan komprehensif", "Export data"], "definitionOfDone": "Tabel laporan, filter tanggal, export." },
      "E1a": { "description": "Tabel laporan stok.", "goals": ["Data laporan", "Informasi lengkap"], "definitionOfDone": "Kolom: barang, stok awal, masuk, keluar, stok akhir, nilai." },
      "E1b": { "description": "Filter rentang tanggal laporan.", "goals": ["Filter periode", "Sesuai kebutuhan"], "definitionOfDone": "Date range picker, filter data laporan." },
      "E1c": { "description": "Tombol untuk export laporan.", "goals": ["Export data", "Format Excel/PDF"], "definitionOfDone": "Pilih format, download laporan, notifikasi selesai." },
      "E2": { "description": "Halaman grafik perputaran stok.", "goals": ["Analisis perputaran", "Visual insight"], "definitionOfDone": "Line chart, filter periode, data summary." },
      "E2a": { "description": "Line chart perputaran stok.", "goals": ["Visual tren", "Analisis cepat"], "definitionOfDone": "Line chart: sumbu X waktu, sumbu Y qty perputaran." },
      "E2b": { "description": "Filter periode untuk grafik.", "goals": ["Pilih rentang", "Analisis temporal"], "definitionOfDone": "Date range picker, update chart otomatis." },
      "E2c": { "description": "Ringkasan data perputaran stok.", "goals": ["Summary cepat", "Key metrics"], "definitionOfDone": "Total masuk, total keluar, rata-rata perputaran per bulan." },
    },
  },
};

export function getDiagramForProject(projectId: string): DiagramData | null {
  return mockDiagrams[projectId] ?? null;
}
