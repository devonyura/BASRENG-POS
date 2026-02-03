# Frontend-Basreng-POS

## 📌 Deskripsi
Frontend-Basreng-POS adalah antarmuka pengguna untuk sistem POS (**Point of Sale**) berbasis PWA (**Progressive Web App**) yang dirancang untuk bisnis tanpa pencatatan stok barang. Aplikasi ini dibangun menggunakan **React.js** dengan komponen UI dari **Ionic Framework** untuk memastikan pengalaman pengguna yang responsif dan mobile-friendly.

---

## 🚀 Teknologi yang Digunakan
- **React.js** (v18+)
- **Ionic Framework** (v7+)
- **Axios** (HTTP Client untuk komunikasi API)
- **React Router** (Navigasi halaman)
- **PWA Support** (Offline mode & caching)

---

## 🎯 Fitur Utama
| No  | Fitur | Deskripsi |
| --- | --- | --- |
| 1.  | Pencatatan Transaksi | Input transaksi dengan memilih kategori barang -> jenis barang -> jumlah -> total harga -> detail transaksi |
| 2.  | Histori Transaksi | Menampilkan daftar transaksi dengan filter berdasarkan tanggal |
| 3.  | Detail Transaksi | Menampilkan produk yang dibeli, subtotal, total harga, dan metode pembayaran |
| 4.  | Laporan Penjualan | Menampilkan ringkasan transaksi dan pendapatan |
| 5.  | Grafik Penjualan | Visualisasi tren penjualan & produk terlaris |
| 6.  | Export PDF | Simpan laporan transaksi dalam format PDF |
| 7.  | Manajemen Produk | CRUD produk dan kategori |
| 8.  | Autentikasi User | Login & Role (Kasir/Admin) |

---

## 🏗️ Instalasi & Menjalankan Proyek
### 1️⃣ Clone Repository
```sh
git clone https://github.com/username/Frontend-Basreng-POS.git
cd Frontend-Basreng-POS
```

### 2️⃣ Instalasi Dependencies
```sh
npm install
```

### 3️⃣ Jalankan Server Development
```sh
npm run dev
```
Aplikasi akan berjalan di `http://localhost:5173/` (default Vite).

### 4️⃣ Build untuk Produksi
```sh
npm run build
```

---

## 📡 Koneksi ke Backend
Aplikasi ini berkomunikasi dengan **RestAPI-Basreng-POS** yang dibangun menggunakan **CodeIgniter 4**. Pastikan backend telah berjalan sebelum mengakses fitur yang memerlukan data API.

> **API Base URL:** `http://localhost:8000/api/`

---

## 📌 Struktur Proyek
```
Frontend-Basreng-POS/
│── public/          # Static assets
│── src/
│   ├── assets/      # Gambar & ikon
│   ├── components/  # Komponen reusable
│   ├── pages/       # Halaman utama aplikasi
│   ├── store/       # Redux store
│   ├── utils/       # Helper functions
│   ├── App.tsx      # Root komponen utama
│   ├── main.tsx     # Entry point aplikasi
│── package.json     # Dependencies & scripts
│── vite.config.js   # Konfigurasi Vite
```

---

## 🔥 Roadmap & Versi
- **Versi awal:** `v1.0.0`
- Fitur yang akan datang:
  - Mode offline menggunakan Service Worker
  - Implementasi dark mode

---

## 🤝 Kontribusi
Pull request dan issue sangat diterima! Silakan fork repository ini dan kirimkan PR untuk peningkatan.

---

## 📄 Lisensi
Proyek ini menggunakan lisensi **MIT**.

