# Debugging dan Perbaikan Error Login 500 pada Laravel Sanctum

## Tanggal
25 November 2025

## Masalah
Login gagal dengan pesan error: `Login failed: 500 Internal Server Error. {"message":"HTTP error 500"}`

## Penyebab Utama
Model User tidak mengimplementasikan trait `Laravel\Sanctum\HasApiTokens` yang diperlukan untuk fungsionalitas Sanctum seperti `createToken()` dan `currentAccessToken()`.

## Temuan
Melalui pemeriksaan kode:
1. AuthService.php menggunakan metode `createToken()` dan `currentAccessToken()` pada model User
2. Model User sebelumnya tidak memiliki trait `HasApiTokens` dari Laravel Sanctum
3. Ini menyebabkan error 500 ketika mencoba membuat token baru atau mengakses token saat logout

## Perbaikan yang Dilakukan
1. Menambahkan import `use Laravel\Sanctum\HasApiTokens;` ke model User
2. Menambahkan trait `HasApiTokens` ke dalam daftar trait yang digunakan oleh model User

## File yang Diubah
- `app/Models/User.php` - Menambahkan trait Sanctum

## Hasil
Setelah perubahan ini, fungsionalitas login seharusnya bekerja dengan baik karena model User sekarang memiliki semua metode yang diperlukan untuk manajemen token Sanctum.