# Dokumentasi Masalah Sistem Dokumen dan Solusi

## Ringkasan Masalah
Sistem dokumen mengalami berbagai kendala dalam proses upload, penyimpanan, dan akses file. Awalnya, file tampak berhasil diupload tetapi tidak ditemukan di direktori yang diharapkan, menyebabkan error "File not found on disk" dan "Dokumen tidak tersedia - mungkin sudah dihapus oleh pelamar."

## Masalah-Masalah Spesifik

### 1. Masalah Penyimpanan File (`storeAs()` vs `exists()`)
- **Masalah**: File diupload menggunakan `storeAs('public', $filePath)` berhasil, namun saat dicek dengan `Storage::disk('public')->exists($filePath)`, hasilnya `false`
- **Alasan**: Bisa jadi karena timing issue (file belum sepenuhnya disimpan saat dicek), cache filesystem, atau masalah konfigurasi disk

### 2. Struktur Direktori Belum Dibuat
- **Masalah**: Upload file ke folder `documents/{user-id}/` gagal karena folder belum ada
- **Solusi**: Ditambahkan pembuatan folder sebelum menyimpan file

### 3. URL yang Dihasilkan Tidak Bisa Diakses
- **Masalah**: URL yang dihasilkan dengan `Storage::url()` tidak bisa diakses secara publik
- **Solusi**: Menggunakan `url('storage/' . $path)` agar sesuai dengan symbolic link `storage:link`

### 4. Konfigurasi Disk Storage
- **Masalah**: Konfigurasi disk 'public' tidak konsisten dalam penanganan file
- **Solusi**: Memastikan file disimpan dengan pendekatan yang lebih reliable dan verifikasi ekstensif

### 5. Akses File dari Frontend
- **Masalah**: Baik student maupun company dashboard mengalami kesulitan mengakses dokumentasi
- **Solusi**: Membuat endpoint otentikasi khusus (`/documents/{id}/serve` dan `/applications/{id}/resume`) dan juga menyediakan URL publik

## Pendekatan Yang Digunakan Saat Ini

### A. Backend (DocumentController)
1. Pembuatan direktori secara eksplisit sebelum menyimpan file
2. Penggunaan multiple verification untuk memastikan file benar-benar disimpan
3. Pemeriksaan berulang dengan delay dan cache clearing
4. Kombinasi metode `storeAs()` dengan alternatif `put()` jika gagal
5. Pemeriksaan keberadaan file menggunakan berbagai metode

### B. Frontend (Student Documents Page)
1. Mengganti anchor tag `<a>` dengan tombol `<button>` yang menggunakan API request otentikasi
2. Menggunakan `fetch()` dengan auth token untuk mengakses file
3. Membuat blob URL untuk membuka file secara langsung

### C. Frontend (Company Applications Page)
1. Implementasi serupa untuk mengakses resume dari aplikasi
2. Menggunakan endpoint otentikasi khusus untuk keamanan

### D. Routing
1. Endpoint untuk serving file langsung dengan otentikasi
2. Menggunakan middleware `auth:sanctum` untuk keamanan

## Pendekatan Yang Lebih Sederhana (Untuk Kedepannya)

### 1. Gunakan Upload File Biasa Tanpa Complication
```php
// Simpel approach
$fileName = time() . '_' . $request->file('file')->getClientOriginalName();
$request->file('file')->storeAs('public/documents', $fileName);
```

### 2. Verifikasi Langsung Setelah Simpan
```php
// Cukup lakukan pengecekan sekali, bukan berulang
if (!Storage::exists('public/documents/' . $fileName)) {
    return response()->json(['error' => 'File failed to save'], 400);
}
```

### 3. Gunakan URL Generik
- Biarkan Laravel handle URL generation dengan `asset()` atau `Storage::url()`
- Fokuskan pada fungsi upload dan database, bukan pada kompleksitas akses file

### 4. Hindari Delay dan Looping Berlebihan
- Delay hanya jika benar-benar diperlukan
- Gunakan pendekatan event-driven jika perlu delay untuk proses lanjutan

## Pelajaran yang Didapat

### 1. Masalah bisa tampak kompleks padahal akar masalahnya kecil
- Masalah awal mungkin hanya permission atau struktur folder, tetapi berkembang jadi pendekatan kompleks

### 2. Simplicity is better
- Terlalu banyak layer dan verifikasi bisa menyembunyikan masalah sebenarnya
- Pendekatan langsung lebih mudah di-debug dan lebih bisa diandalkan

### 3. Konsultasi lebih awal
- Jika menghadapi masalah yang berkepanjangan, lebih baik kembali ke dasar dan gunakan pendekatan minimal

## Rekomendasi untuk Pengembangan Mendatang

1. **Gunakan pendekatan MVP (Minimum Viable Product)** untuk fitur baru
2. **Mulai dari yang sederhana**, baru tambahkan kompleksitas jika diperlukan
3. **Fokus pada satu masalah utama**, jangan mencoba mengatasi semua sekaligus
4. **Uji setiap perubahan kecil** sebelum melanjutkan ke yang lebih kompleks
5. **Gunakan logging yang cukup** bukan logging yang berlebihan

## Kesimpulan
Masalah dokumen membutuhkan pendekatan yang sangat robust karena melibatkan filesystem, storage configuration, dan akses jaringan. Namun, solusi yang paling efektif adalah yang sederhana dan mudah di-maintain. Di masa depan, sebaiknya mulai dengan pendekatan minimal dan hanya menambahkan kompleksitas bila benar-benar diperlukan.