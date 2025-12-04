# Perintah untuk Mengembalikan Perubahan Hari Ini (Revert)

Gunakan perintah-perintah berikut jika Anda perlu mengembalikan proyek ke kondisi sebelum perubahan hari ini (kondisi di mana program magang masih muncul di "Kelola Program Magang").

## Daftar Perubahan yang Akan Dibalikkan

### 1. Konfigurasi Sanctum
- Konfigurasi `'guard' => []` di `config/sanctum.php` akan dikembalikan ke konfigurasi yang diketahui berhasil sebelumnya

### 2. Perubahan di Service Functions
- Perubahan pada `app/services/internshipService.ts` terkait error handling
- Perubahan pada `app/lib/apiService.ts` terkait dengan fungsi `getStudentProfile`

## Perintah untuk Revert

### A. Mengembalikan Konfigurasi Sanctum
```bash
# Di terminal, dari root direktori proyek
cd backend/laravel-app

# Kembalikan file konfigurasi Sanctum ke versi sebelumnya
# Anda perlu membuat backup sebelumnya atau mengembalikan dari versi sebelum perubahan
```

### B. Membersihkan Cache Laravel
```bash
# Setelah mengembalikan konfigurasi
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

### C. Restart Server Laravel
```bash
php artisan serve --host=127.0.0.1 --port=8000
```

## Catatan Penting
- File `program_magang_success.md` mencatat bahwa endpoint `/api/jobs/company` berfungsi dengan baik setelah perbaikan error DateTime dan Sanctum middleware
- Fokus utama saat revert adalah pada konfigurasi Sanctum agar bisa mengenali token Bearer dengan benar
- Pastikan untuk menguji endpoint `/api/jobs/company` setelah melakukan revert untuk memastikan tetap berfungsi

## File-file yang Paling Penting untuk Dicek
- `backend/laravel-app/config/sanctum.php` - konfigurasi guard
- `backend/laravel-app/app/Http/Controllers/Api/JobController.php` - method `getCompanyJobs`
- `app/services/internshipService.ts` - fungsi `getCompanyInternships`
- `app/lib/apiService.ts` - fungsi `getStudentProfile`