# Debugging Error Registrasi InternSheep Laravel + Next.js

## Tanggal
24 November 2025

## Masalah Utama
Proses registrasi user gagal di frontend Next.js dengan pesan:
- Sebelumnya: `Registration failed: 422 Unprocessable Content. {"errors":{"password":["The password field confirmation does not match."]}}`
- Setelah perubahan: `Failed to fetch` dari frontend, dan server (Laravel) mengembalikan `405 Method Not Allowed` untuk `POST /api/register`.

## Riwayat dan Upaya Perbaikan

### 1. Error Konfirmasi Password 422
- **Deskripsi:** Validasi `confirmed` di `RegisterRequest` selalu gagal meskipun `password` dan `password_confirmation` sama persis di payload jaringan.
- **Investigasi:**
    - Ditambahkan log di `prepareForValidation`, callback validasi manual, dan `AuthController`.
    - Log menunjukkan data input `password` dan `password_confirmation` sama (`match: true` dalam callback manual).
    - Namun, `AuthController` tetap menerima `ValidationException` dengan pesan `confirmed`.
- **Upaya:**
    - Ganti aturan `confirmed` dengan callback manual untuk membandingkan password -> Masih gagal.
    - Ganti nama field dari `password_confirmation` ke `confirm_password` di frontend dan backend -> Masih gagal, error tetap muncul dengan pesan LAMA `'The password field confirmation does not match.'` padahal field dan callback sudah diganti.

### 2. Error Method Not Allowed 405
- **Deskripsi:** Setelah beberapa percobaan perubahan, frontend mendapatkan `Failed to fetch` dan server log menunjukkan `Method Not Allowed` untuk `POST /api/register`.
- **Investigasi:**
    - Ditemukan bahwa `php artisan route:clear` mengalami error (`CommandNotFoundException: There are no commands defined in the "route:" namespace.`).
    - Error ini menunjukkan masalah dengan sistem Artisan.
    - Setelah beberapa percobaan `composer dump-autoload` dan perintah Artisan lain, error Artisan tampaknya teratasi.
    - `php artisan route:list` menunjukkan bahwa rute `POST api/register` terdaftar dengan benar. Ini berarti prefix `/api` dari `routes/api.php` diterapkan.
    - Namun, akses ke `GET /api/debug-register` (rute sementara) menghasilkan `404 Not Found`. Ini aneh, karena jika prefix `/api` bekerja, `route:list` seharusnya menunjukkan `GET api/debug-register` juga.
- **Status Sekarang:**
    - Prefix `/api` tampaknya secara umum bekerja (karena `api/register` muncul di `route:list`).
    - Tapi `/debug-register` (dan mungkin rute lain yang ditambahkan setelah error) tidak terdaftar, menunjukkan bahwa cache rute mungkin rusak atau proses pemuatan rute tidak berjalan sepenuhnya normal setelah error sebelumnya.
    - `POST /api/register` mengembalikan 405, yang berarti Laravel tidak lagi bisa mencocokkan permintaan ini ke controller `AuthController@register`, meskipun `route:list` menunjukkan sebaliknya.

## Konfigurasi Terkait Terakhir

### `routes/api.php`
```php
<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\AuthController;

// Route Otentikasi
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Route yang memerlukan otentikasi
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
});
```

### `bootstrap/app.php`
```php
<?php
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\CorsMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(CorsMiddleware::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
```

### `RegisterRequest.php` (Terakhir sebelum 405)
```php
public function rules(): array
{
    return [
        'email' => 'required|email|unique:users,email',
        'password' => 'required|min:8|confirmed',
        'password_confirmation' => 'required|string|max:255',
        'role' => 'required|in:student,company,admin',
        'full_name' => 'required_if:role,student|string|max:255',
        'company_name' => 'required_if:role,company|string|max:255',
    ];
}
```

## Langkah Selanjutnya (untuk dilanjutkan)
1.  **(Sudah Dicoba Awal)** Jalankan `curl -X POST http://127.0.0.1:8000/api/register -H "Content-Type: application/json"` untuk memastikan apakah server benar-benar mengembalikan 405 untuk permintaan dasar.
2.  Jika ya, coba restart server Laravel (`php artisan serve`) dan coba curl lagi.
3.  Coba buat rute `GET /debug-register` di `routes/api.php`, restart server, dan periksa `php artisan route:list` lagi untuk melihat apakah rute baru muncul.
4.  Jika masalah persisten, pertimbangkan untuk:
    *   Menjalankan `php artisan config:cache`, `php artisan route:cache` (jika `route:clear` sekarang berhasil).
    *   Membuat proyek Laravel baru dan menyalin kode secara bertahap untuk mengisolasi masalah.
    *   Memeriksa dependency (`composer show`) atau `composer.lock` untuk konflik.

## Hasil Verifikasi Terbaru (25 November 2025)
Melalui serangkaian debugging yang telah dilakukan:
1.  `php artisan route:clear` sekarang berfungsi dengan baik (tidak lagi menghasilkan `CommandNotFoundException`).
2.  `composer dump-autoload` berhasil dijalankan.
3.  Rute `POST /api/register` terdaftar dengan benar di `route:list`.
4.  Rute debug `GET /api/debug-register` telah ditambahkan dan muncul di `route:list`.
5.  Pengujian dengan `curl` menunjukkan bahwa endpoint register sekarang merespons dengan sukses, bukan error 405 Method Not Allowed.

Kesimpulan sementara: Masalah route 405 kemungkinan besar terjadi karena cache route atau autoloader yang korup setelah percobaan-percobaan awal. Setelah pembersihan cache dan restart, endpoint berfungsi kembali sebagaimana mestinya.

## Analisis Lanjutan
Karena endpoint register kini berfungsi dengan baik saat diuji menggunakan curl, kemungkinan besar masalahnya terletak pada:
1. Konfigurasi CORS di Laravel atau frontend
2. Cara frontend Next.js mengirim permintaan (termasuk header dan struktur data)
3. Arah endpoint yang digunakan oleh frontend
4. Mismatch nama field antara frontend dan backend

Langkah selanjutnya: Cek kembali log frontend dan pastikan permintaan dari Next.js dikirim dengan benar, dengan header yang sesuai dan CORS di Laravel diatur dengan tepat.

## Temuan Tambahan
Setelah memeriksa kode frontend dan backend, ditemukan bahwa ada mismatch nama field:
- Frontend (RegisterForm.tsx) sebelumnya mengirim field `confirm_password`
- Backend (RegisterRequest.php) mengharapkan field `password_confirmation`
- Interface di apiService.ts juga mendefinisikan `password_confirmation`

Ini menyebabkan validasi di backend gagal karena field `password_confirmation` tidak ditemukan dalam request body, meskipun frontend melakukan validasi bahwa password dan confirm_password cocok.

## Perbaikan yang Dilakukan
File RegisterForm.tsx telah diperbarui untuk menggunakan field `password_confirmation` sesuai dengan yang diharapkan oleh backend dan interface RegisterData, termasuk:
1. Mengganti state `confirm_password` dengan `password_confirmation`
2. Memperbarui validasi frontend untuk menggunakan field yang benar
3. Memperbarui pembuatan data yang dikirim agar menggunakan field yang sesuai
4. Memperbarui input field untuk menggunakan name dan value yang benar

Dengan perubahan ini, frontend dan backend sekarang konsisten dalam penggunaan nama field untuk konfirmasi password.