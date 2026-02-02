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

# Basreng POS - REST API

**RestAPI-Basreng-POS** adalah backend untuk aplikasi **Basreng POS**, sebuah sistem pencatatan transaksi berbasis **Progressive Web App (PWA)** yang dikembangkan menggunakan **CodeIgniter 4** sebagai REST API. Aplikasi ini dirancang untuk membantu bisnis dalam mencatat transaksi tanpa manajemen stok barang.

---

## 🔹 **Versi API**
**v1.0.0** - Versi awal API dengan fitur pencatatan transaksi, laporan, dan manajemen produk.

---

## 📌 **Fitur Utama REST API**
| No | Fitur | Endpoint | Method |
|----|--------|-------------|--------|
| 1  | Autentikasi User | `/auth/login` | POST |
| 2  | Logout User | `/auth/logout` | POST |
| 3  | Daftar Transaksi | `/transactions` | GET |
| 4  | Detail Transaksi | `/transactions/{id}` | GET |
| 5  | Tambah Transaksi | `/transactions` | POST |
| 6  | Hapus Transaksi | `/transactions/{id}` | DELETE |
| 7  | Laporan Penjualan | `/reports/sales` | GET |
| 8  | Grafik Penjualan | `/reports/charts` | GET |
| 9  | Export Laporan PDF | `/reports/export` | GET |
| 10 | Manajemen Produk | `/products` | GET/POST/PUT/DELETE |
| 11 | Manajemen Kategori | `/categories` | GET/POST/PUT/DELETE |
| 12 | Manajemen User | `/users` | GET/POST/PUT/DELETE |

---

## 📂 **Struktur Database**
### **1. Tabel `users` (Manajemen Pengguna)**
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),
    role ENUM('kasir', 'admin'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **2. Tabel `transactions` (Pencatatan Transaksi)**
```sql
CREATE TABLE transactions (
    id VARCHAR(20) PRIMARY KEY,
    user_id INT,
    total_price DECIMAL(10,2),
    payment_method ENUM('cash', 'qris', 'dana', 'transfer'),
    order_status ENUM('offline', 'online'),
    customer_name VARCHAR(100),
    customer_address TEXT,
    customer_phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### **3. Tabel `transaction_details` (Detail Transaksi)**
```sql
CREATE TABLE transaction_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id VARCHAR(20),
    product_id INT,
    quantity INT,
    subtotal DECIMAL(10,2),
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

### **4. Tabel `products` (Manajemen Produk)**
```sql
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    category_id INT,
    price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

### **5. Tabel `categories` (Kategori Produk)**
```sql
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 **Teknologi yang Digunakan**
- **CodeIgniter 4** (Framework PHP untuk REST API)
- **MySQL** (Database Management System)
- **JWT (JSON Web Token)** untuk autentikasi
- **DomPDF** untuk export laporan ke PDF

---

## 📌 **Cara Menjalankan REST API**
1. **Clone repo ini:**
   ```sh
   git clone https://github.com/username/RestAPI-Basreng-POS.git
   cd RestAPI-Basreng-POS
   ```
2. **Instal dependensi dengan Composer:**
   ```sh
   composer install
   ```
3. **Buat file .env dan atur konfigurasi database:**
   ```sh
   cp env .env
   ```
   Sesuaikan bagian berikut:
   ```env
   database.default.hostname = localhost
   database.default.database = basreng_pos
   database.default.username = root
   database.default.password = 
   database.default.DBDriver = MySQLi
   ```
4. **Jalankan migrasi database:**
   ```sh
   php spark migrate
   ```
5. **Menjalankan server lokal:**
   ```sh
   php spark serve
   ```
6. **REST API siap digunakan di:**
   ```
   http://localhost:8080
   ```

---
