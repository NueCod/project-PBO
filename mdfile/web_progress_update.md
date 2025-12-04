# Progress Update: InternBridge Web Application

## Tanggal
25 November 2025

## Ringkasan Perubahan Penting

### 1. Perbaikan Fungsi Registrasi
- Diperbaiki error `422 Unprocessable Content` terkait password confirmation
- Diperbaiki error `405 Method Not Allowed` pada endpoint `/api/register`
- Pastikan field `password` dan `password_confirmation` sesuai saat pengiriman formulir

### 2. Perbaikan Fungsi Login
- Diperbaiki error `500 Internal Server Error` pada endpoint login
- Menambahkan trait `HasApiTokens` ke model User untuk mendukung fungsi Sanctum
- Memastikan endpoint `/api/login` merespons dengan benar

### 3. Perbaikan Fungsi Edit Profil
- Diperbaiki masalah saat tombol "Batal" tidak membatalkan perubahan
- Menggunakan state sementara (tempProfile) saat edit untuk mencegah perubahan langsung ke state utama
- Perubahan hanya disimpan saat tombol "Simpan Perubahan" ditekan

### 4. Perbaikan Tampilan Nama di Header dan Sidebar
- Diganti dari nama statis "Budi Santoso" ke data dinamis dari profil pengguna
- Ditambahkan fungsi `getStudentProfile` untuk mengambil data profil dari server
- Menggunakan `useAuth` hook untuk mendapatkan token otentikasi
- Ditambahkan state `userName`, `userEmail`, dan `userInitial` untuk menyimpan informasi pengguna
- Diperbarui semua halaman dashboard-student agar menyertakan `userProfile` ke komponen Sidebar:
  - `dashboard-student/page.tsx` (dashboard utama)
  - `find-internships/FindInternshipsPageClient.tsx` (cari magang)
  - `my-applications/page.tsx` (lamaran saya)
  - `profile/page.tsx` (profil saya)
  - `documents/page.tsx` (dokumen)
  - `messages/page.tsx` (pesan)
  - `find-internships/[id]/page.tsx` (detail lowongan)

### 5. Perbaikan Struktur Database
- Ditambahkan migrasi untuk menambahkan field-field ke tabel `student_profiles`:
  - `skills` (json)
  - `interests` (json)
  - `experience` (json)
  - `education` (json)
  - `portfolio` (string)
  - `avatar` (text)
  - `location` (text)
  - `resume` (string)
- Diperbarui model `StudentProfile` agar mencakup field-field baru
- Diperbarui `StudentProfileController` agar menangani field-field baru dengan benar

### 6. Perubahan pada Sidebar
- Diperbarui komponen `Sidebar.tsx` untuk menerima props `userProfile`
- Ditambahkan tampilan informasi pengguna (avatar, nama, email) di bagian atas sidebar
- Ditampilkan kondisional berdasarkan keberadaan `userProfile`

## Teknologi yang Digunakan
- Next.js 16.0.3 (Turbopack)
- Laravel 12.x
- Sanctum untuk otentikasi
- SQLite sebagai database

## Halaman yang Diperbarui
- `app/dashboard-student/page.tsx`
- `app/dashboard-student/find-internships/FindInternshipsPageClient.tsx`
- `app/dashboard-student/my-applications/page.tsx`
- `app/dashboard-student/profile/page.tsx`
- `app/dashboard-student/documents/page.tsx`
- `app/dashboard-student/messages/page.tsx`
- `app/dashboard-student/find-internships/[id]/page.tsx`
- `app/components/Sidebar.tsx`
- `app/lib/apiService.ts` (menambahkan fungsi `getStudentProfile` dan `updateStudentProfile`)
- `app/interfaces.ts` (menambahkan interface `UpdateStudentProfileRequest`)
- `backend/laravel-app/app/Http/Controllers/Api/Profile/StudentProfileController.php`
- `backend/laravel-app/app/Models/StudentProfile.php`
- `backend/laravel-app/database/migrations/` (beberapa file migrasi baru)

## Masalah yang Diselesaikan
1. Registrasi user gagal karena validasi password confirmation
2. Login gagal dengan error 500 karena model User tidak memiliki trait Sanctum
3. Tombol batal saat edit profil tidak berfungsi dengan benar
4. Nama di header dan sidebar menampilkan data statis bukan dari profil pengguna
5. Data profil tidak diperbarui di state lokal setelah update berhasil
6. Struktur database tidak lengkap untuk menyimpan semua informasi profil

## Fitur Berfungsi
- Registrasi user dengan validasi yang benar
- Login dengan pengembalian token Sanctum
- Edit profil dengan penyimpanan perubahan ke server
- Tampilan nama pengguna yang dinamis di semua halaman
- Sinkronisasi data profil antara server dan tampilan UI
- Sidebar menampilkan informasi pengguna yang benar

## Catatan Tambahan
- Semua perubahan mengikuti pola otentikasi Sanctum dari Laravel dan context API dari Next.js
- State management dilakukan dengan React hooks (useState, useEffect)
- Error handling sudah ditambahkan di frontend dan backend
- Validasi input dilakukan di kedua sisi (frontend dan backend)