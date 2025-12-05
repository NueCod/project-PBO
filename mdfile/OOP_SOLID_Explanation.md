# Penjelasan Penerapan OOP dan SOLID Principles pada Backend

Dokumen ini menjelaskan bagaimana konsep Object-Oriented Programming (OOP) dan prinsip SOLID diterapkan dalam arsitektur backend aplikasi ini (Laravel).

## 1. Object-Oriented Programming (OOP)

### a. Encapsulation (Enkapsulasi)
Enkapsulasi adalah pembungkusan data dan method yang bekerja pada data tersebut dalam satu unit (class), serta menyembunyikan detail implementasi dari dunia luar.

**Penerapan di Project:**
- **Service Classes**: Logika bisnis untuk aplikasi dibungkus di dalam `ApplicationService`. Controller tidak perlu tahu detail bagaimana data disimpan ke database, ia hanya memanggil method publik seperti `createApplication`.
- **Visibility Modifiers**: Penggunaan `protected` pada properti `$applicationRepository` di dalam `ApplicationService` memastikan properti tersebut hanya bisa diakses oleh class itu sendiri dan turunannya, menjaga integritas data.

```php
// App/Services/ApplicationService.php
class ApplicationService implements ApplicationServiceInterface
{
    // Properti ini di-enkapsulasi (protected)
    protected ApplicationRepositoryInterface $applicationRepository;

    // Method public sebagai antarmuka untuk berinteraksi dengan service ini
    public function createApplication(array $data, $user) { ... }
}
```

### b. Inheritance (Pewarisan)
Inheritance memungkinkan sebuah class untuk mewarisi properti dan method dari class lain.

**Penerapan di Project:**
- **Controllers**: Semua controller (misalnya `ApplicationController`) mewarisi (`extends`) dari base class `Controller`. Ini memungkinkan `ApplicationController` menggunakan fitur-fitur dasar controller Laravel seperti validasi dan otorisasi tanpa harus menulis ulang kodenya.

```php
// App/Http/Controllers/Api/ApplicationController.php
class ApplicationController extends Controller
{
    // Mewarisi fungsionalitas dari class Controller
}
```

### c. Polymorphism (Polimorfisme)
Polimorfisme memungkinkan objek dari class yang berbeda untuk diperlakukan sebagai objek dari tipe umum yang sama (biasanya melalui Interface).

**Penerapan di Project:**
- **Interfaces**: `ApplicationController` bergantung pada `ApplicationServiceInterface`, bukan class `ApplicationService` secara langsung. Ini berarti jika nanti ada class lain (misalnya `MockApplicationService` untuk testing) yang mengimplementasikan interface yang sama, Controller akan tetap bekerja tanpa perubahan kode.

### d. Abstraction (Abstraksi)
Abstraksi adalah proses menyembunyikan detail implementasi yang kompleks dan hanya menampilkan fungsionalitas penting kepada pengguna.

**Penerapan di Project:**
- **Service Interfaces**: `ApplicationServiceInterface` mendefinisikan "kontrak" atau daftar method yang harus ada (seperti `createApplication`, `getApplicationById`), tanpa mendefinisikan *bagaimana* method tersebut bekerja. Detailnya disembunyikan di dalam class implementasi (`ApplicationService`).

---

## 2. SOLID Principles

### S - Single Responsibility Principle (SRP)
Setiap class harus memiliki satu, dan hanya satu, alasan untuk berubah. Artinya, setiap class harus memiliki satu tanggung jawab utama.

**Penerapan di Project:**
Pemisahan tanggung jawab dilakukan dengan sangat jelas melalui **Service-Repository Pattern**:
1.  **Controller (`ApplicationController`)**: Hanya bertanggung jawab untuk menangani HTTP Request (menerima input, validasi input) dan mengembalikan HTTP Response (JSON). Tidak ada logika bisnis yang berat di sini.
2.  **Service (`ApplicationService`)**: Bertanggung jawab untuk logika bisnis (validasi aturan bisnis, pengecekan hak akses user, alur data).
3.  **Repository (`ApplicationRepository`)**: Bertanggung jawab untuk komunikasi langsung dengan database (Query SQL/Eloquent).

### O - Open/Closed Principle (OCP)
Software entities (classes, modules, functions, etc.) should be open for extension, but closed for modification.

**Penerapan di Project:**
- Penggunaan **Interface** (`ApplicationServiceInterface`) memungkinkan kita untuk memperluas fungsionalitas tanpa mengubah kode yang sudah ada.
- Contoh: Jika kita ingin mengubah cara penyimpanan aplikasi dari MySQL ke MongoDB, kita cukup membuat class baru `MongoApplicationService` yang mengimplementasikan `ApplicationServiceInterface`, lalu mengubah binding di `AppServiceProvider`. Kode di `ApplicationController` **tidak perlu diubah sama sekali** (Closed for modification).

### L - Liskov Substitution Principle (LSP)
Objek dari superclass (atau interface) harus dapat digantikan dengan objek dari subclass (atau implementasinya) tanpa mengganggu kebenaran program.

**Penerapan di Project:**
- Karena `ApplicationService` mengimplementasikan `ApplicationServiceInterface` dengan benar, maka di mana pun `ApplicationServiceInterface` dibutuhkan (seperti di constructor Controller), kita bisa menyuntikkan `ApplicationService`.
- Struktur method di implementasi (`ApplicationService`) mematuhi kontrak yang didefinisikan di Interface, sehingga perilaku program tetap konsisten.

### I - Interface Segregation Principle (ISP)
Klien tidak boleh dipaksa untuk bergantung pada interface yang tidak mereka gunakan. Lebih baik banyak interface spesifik daripada satu interface umum yang besar.

**Penerapan di Project:**
- Kita memiliki interface yang terpisah untuk setiap domain: `ApplicationServiceInterface`, `JobServiceInterface`, `AuthServiceInterface`.
- `ApplicationController` hanya bergantung pada `ApplicationServiceInterface`. Ia tidak perlu tahu tentang method yang ada di `JobServiceInterface` atau `AuthServiceInterface`. Ini menjaga ketergantungan tetap minimal dan spesifik.

### D - Dependency Inversion Principle (DIP)
Modul tingkat tinggi tidak boleh bergantung pada modul tingkat rendah. Keduanya harus bergantung pada abstraksi (Interface).

**Penerapan di Project:**
- **Dependency Injection**: Di dalam `ApplicationController`, kita tidak melakukan `new ApplicationService()`. Sebaliknya, kita meminta `ApplicationServiceInterface` melalui constructor.
- Laravel Service Container kemudian secara otomatis "menyuntikkan" implementasi yang konkret (`ApplicationService`) berdasarkan konfigurasi di `AppServiceProvider`.

**Kode di Controller (High-level module):**
```php
// Bergantung pada Interface (Abstraksi), BUKAN class konkret
public function __construct(ApplicationServiceInterface $applicationService)
{
    $this->applicationService = $applicationService;
}
```

**Kode di AppServiceProvider (Binding):**
```php
// Menghubungkan Abstraksi dengan Implementasi
$this->app->bind(
    ApplicationServiceInterface::class,
    ApplicationService::class
);
```

---

## Kesimpulan
Arsitektur backend ini telah menerapkan standar industri yang baik dengan memisahkan **Controller** (HTTP Layer), **Service** (Business Logic Layer), dan **Repository** (Data Access Layer). Penggunaan Interface dan Dependency Injection memastikan kode bersifat modular, mudah di-test (testable), dan mudah dikembangkan (maintainable) sesuai dengan prinsip OOP dan SOLID.
