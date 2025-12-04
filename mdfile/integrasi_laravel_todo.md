# Integrasi Backend Laravel dengan Frontend Next.js (Monorepo)

Tanggal: 24 November 2025

## Todo List

- [x] Tentukan struktur proyek: satu repositori (monorepo) atau terpisah?
- [x] Instal Laravel di folder backend (jika belum)
- [x] Konfigurasi CORS di Laravel untuk mengizinkan frontend Next.js
- [x] Buat endpoint API di Laravel (misalnya untuk data produk, user, dll)
- [x] Atur environment variables di frontend Next.js untuk URL API
- [x] Lakukan panggilan API dari frontend Next.js ke backend Laravel
- [x] Uji integrasi API untuk memastikan data dapat ditransfer dengan benar
- [x] Tangani otentikasi jika diperlukan (misalnya dengan JWT) - Menggunakan Laravel Sanctum

## Catatan

- Struktur proyek dipilih sebagai **monorepo**: satu repositori untuk frontend (Next.js) dan backend (Laravel).
- Folder `backend/` telah dibuat di `pro-pbo/`.
- Composer telah diinstal dan PATH-nya diatur.
- Langkah selanjutnya adalah menginisialisasi proyek Laravel di folder `backend/` menggunakan `composer create-project`.
- Pastikan PHP juga terinstal dan ditambahkan ke PATH karena Composer membutuhkannya.
- **Cara Mengujicoba:**
    - Jalankan backend Laravel: `cd pro-pbo/backend/laravel-app && php artisan serve`
    - Jalankan frontend Next.js: `cd pro-pbo && npm run dev`
    - Buka `http://localhost:3000/products` di browser.
    - Coba tambah produk dan verifikasi bahwa data muncul di daftar (dan di database jika dicek).
- **Endpoint Otentikasi Tersedia (Backend Laravel):**
    - `POST /api/register` - Mendaftarkan user baru (student/company/admin).
    - `POST /api/login` - Mengautentikasi user dan mengembalikan token Sanctum.
    - `POST /api/logout` - Menghapus token Sanctum (memerlukan token valid di header).
- **Langkah Selanjutnya:**
    - Update frontend Next.js untuk menggunakan endpoint otentikasi.
    - Buat layanan di frontend (`apiService`) untuk register, login, logout.
    - Implementasi routing proteksi di frontend berdasarkan status login.
    - Buat halaman dashboard untuk student dan company.
    - Buat service/controller di backend untuk entitas `Job`, `Application`, `Document`, `Profile`.