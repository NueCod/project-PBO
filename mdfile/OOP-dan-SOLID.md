# Penerapan Konsep OOP dan SOLID di Project InternSheep

## Pendahuluan
Project InternSheep merupakan aplikasi web untuk menghubungkan mahasiswa dengan perusahaan dalam program magang. Project ini terdiri dari frontend menggunakan Next.js (React) dan backend menggunakan Laravel PHP. Penerapan konsep Object-Oriented Programming (OOP) dan prinsip SOLID dilakukan secara komprehensif di kedua sisi aplikasi.

---

## I. Frontend (Next.js/React)

### A. Penerapan Konsep OOP pada Frontend

#### 1. Encapsulation (Enkapsulasi)
- **Component State Management**: Komponen seperti `HeaderSection.tsx` menggunakan state lokal untuk mengelola status seperti `showLoginDropdown`, `mobileMenuOpen`, dll. dengan `useState`, menjaga state tetap privat dalam komponen.
  - **File: `HeaderSection.tsx`** - Fungsinya: Menyediakan komponen header yang responsif dengan navigasi, tombol login, dan toggle dark mode.
  
- **Service Classes**: File `AuthService.ts` mengenkapsulasi logika otentikasi dalam kelas `AuthService` dengan metode publik seperti `register`, `login`, dan `logout`.
  - **File: `AuthService.ts`** - Fungsinya: Menyediakan layanan otentikasi untuk operasi register, login, dan logout pengguna.
  
- **Context API**: File `authContext.tsx` mengenkapsulasi state otentikasi global dalam bentuk context, menyediakan fungsi `login`, `logout`, dan `register` untuk mengakses state tersebut.
  - **File: `authContext.tsx`** - Fungsinya: Menyediakan state otentikasi global dan fungsi-fungsi otentikasi yang dapat diakses di seluruh aplikasi.

#### 2. Abstraction (Abstraksi)
- **Interface Definitions**: File `interfaces.ts` mendefinisikan berbagai interface seperti `User`, `StudentProfile`, `CompanyProfile`, dll. yang menyembunyikan detail implementasi dan menyediakan kontrak tipe data yang digunakan di seluruh aplikasi.
  - **File: `interfaces.ts`** - Fungsinya: Menyediakan definisi tipe TypeScript untuk seluruh struktur data dalam aplikasi, memastikan type safety dan kemudahan pengembangan.
  
- **Service Abstraction**: File `BaseApiService.ts` menyediakan abstraksi untuk komunikasi HTTP, menyembunyikan detail implementasi fetch API dan manajemen headers.
  - **File: `BaseApiService.ts`** - Fungsinya: Menyediakan kelas abstrak dasar untuk semua service API dengan metode HTTP umum (get, post, put, patch, delete).

#### 3. Inheritance (Pewarisan)
- **Class-based Service Implementation**: Kelas `AuthService`, `StudentProfileService`, dan `CompanyProfileService` mewarisi dari `BaseApiService`, mendapatkan fungsi `get`, `post`, `put`, `patch`, dan `delete` tanpa perlu mengimplementasikannya ulang.
  - **File: `AuthService.ts`, `StudentProfileService.ts`, `CompanyProfileService.ts`** - Fungsinya: Menyediakan implementasi spesifik untuk layanan otentikasi dan manajemen profil, mewarisi fungsi-fungsi dasar dari `BaseApiService`.

#### 4. Polymorphism (Polimorfisme)
- **Method Overriding**: Kelas-kelas service mengimplementasikan metode-metode dari interface masing-masing dengan cara yang berbeda sesuai kebutuhan spesifik.

### B. Penerapan Prinsip SOLID pada Frontend

#### 1. Single Responsibility Principle (SRP)
- **AuthService**: Hanya bertanggung jawab atas operasi otentikasi (register, login, logout).
  - **File: `AuthService.ts`** - Fungsinya: Menyediakan layanan otentikasi untuk operasi register, login, dan logout pengguna.
  
- **StudentProfileService**: Hanya bertanggung jawab atas operasi profil mahasiswa (get, update).
  - **File: `ProfileService.ts`** - Fungsinya: Menyediakan layanan untuk manajemen profil mahasiswa dan perusahaan.
  
- **CompanyProfileService**: Hanya bertanggung jawab atas operasi profil perusahaan (get, update).
  - **File: `ProfileService.ts`** - Fungsinya: Menyediakan layanan untuk manajemen profil mahasiswa dan perusahaan.
  
- **Component Files**: Komponen seperti `HeaderSection.tsx` hanya bertanggung jawab untuk menampilkan header dan menangani navigasi.
  - **File: `HeaderSection.tsx`** - Fungsinya: Menyediakan komponen header yang responsif dengan navigasi, tombol login, dan toggle dark mode.

#### 2. Open/Closed Principle (OCP)
- **Modular Service Design**: Layanan dapat diperluas tanpa memodifikasi kode eksisting karena menggunakan interface dan dependency injection melalui `ServiceContainer.ts`.
  - **File: `ServiceContainer.ts`** - Fungsinya: Menyediakan container layanan tunggal yang mengimplementasikan dependency injection dan singleton pattern.

#### 3. Liskov Substitution Principle (LSP)
- **Interface Implementation**: Semua kelas service mengimplementasikan interface masing-masing dengan cara yang sesuai, sehingga instance dari kelas-kelas tersebut dapat digunakan secara konsisten.

#### 4. Interface Segregation Principle (ISP)
- **Spesifik Interface**: Setiap service memiliki interface sendiri (`IAuthService`, `IStudentProfileService`, `ICompanyProfileService`) dengan metode-metode yang spesifik dan relevan.
  - **File: `AuthService.ts`** - Fungsinya: Mendefinisikan interface spesifik untuk layanan otentikasi.
  - **File: `ProfileService.ts`** - Fungsinya: Mendefinisikan interface spesifik untuk layanan profil mahasiswa dan perusahaan.

#### 5. Dependency Inversion Principle (DIP)
- **Service Container**: `ServiceContainer.ts` mengimplementasikan dependency inversion dengan menyediakan instance service melalui interface, bukan implementasi konkret.
  - **File: `ServiceContainer.ts`** - Fungsinya: Menyediakan container layanan tunggal yang mengimplementasikan dependency injection dan singleton pattern.
  
- **Dependency Injection**: Kelas `BaseApiService` digunakan sebagai basis untuk semua service classes, menjaga ketergantungan terhadap abstraksi.
  - **File: `BaseApiService.ts`** - Fungsinya: Menyediakan kelas abstrak dasar untuk semua service API.

---

## II. Backend (Laravel PHP)

### A. Penerapan Konsep OOP pada Backend

#### 1. Encapsulation (Enkapsulasi)
- **Repository Pattern**: Kelas seperti `JobRepository` mengenkapsulasi logika akses data, menyembunyikan detail implementasi query database di dalam kelas tersebut.
  - **File: `JobRepository.php`** - Fungsinya: Menyediakan implementasi operasi CRUD untuk model Job termasuk query kompleks terkait status lowongan dan koneksi dengan perusahaan.
  
- **Private Properties**: Kelas service menggunakan property seperti `$jobRepository` dengan visibility protected untuk menyembunyikan dependencies.
  - **File: `JobService.php`** - Fungsinya: Menyediakan logika bisnis untuk manajemen lowongan kerja termasuk validasi, format data, dan pengelolaan hak akses.
  
- **Access Modifiers**: Metode-metode dalam service class menggunakan access modifiers (public, protected) untuk mengontrol akses.
  - **File: `JobService.php`, `AuthService.php`** - Fungsinya: Menyediakan metode publik untuk operasi bisnis dan property/method dengan visibility yang sesuai untuk menjaga aksesibilitas internal.

#### 2. Abstraction (Abstraksi)
- **Interface Definitions**: File interface seperti `JobServiceInterface.php` dan `JobRepositoryInterface.php` menyediakan abstraksi tanpa menyembunyikan detail implementasi spesifik.
  - **File: `JobServiceInterface.php`** - Fungsinya: Menyediakan kontrak metode yang harus diimplementasikan oleh kelas service yang menangani lowongan kerja.
  - **File: `JobRepositoryInterface.php`** - Fungsinya: Menyediakan kontrak metode yang harus diimplementasikan oleh kelas repository yang menangani akses data lowongan kerja.
  
- **Abstract Classes**: Walau tidak secara eksplisit menggunakan abstract classes, struktur repository dan service menyediakan abstraksi terhadap operasi data.

#### 3. Inheritance (Pewarisan)
- **Controller Inheritance**: `JobController` mewarisi dari `Controller` parent, mendapatkan fungsionalitas dasar untuk HTTP requests dan responses.
  - **File: `JobController.php`** - Fungsinya: Menangani request HTTP terkait lowongan kerja dan meneruskan ke service layer untuk diproses.
  
- **Model Inheritance**: Model seperti `Job` mewarisi dari `Model` Eloquent, mendapatkan fungsionalitas ORM secara otomatis.
  - **File: `Job.php` (model)** - Fungsinya: Menyediakan representasi dari tabel job di database dengan fungsionalitas ORM Eloquent.

#### 4. Polymorphism (Polimorfisme)
- **Interface Implementation**: Kelas-kelas repository dan service mengimplementasikan interface dengan metode yang sama tetapi implementasi berbeda, memungkinkan polimorfisme.
  - **File: `JobRepository.php` dan `ApplicationRepository.php`** - Fungsinya: Mengimplementasikan interface yang sama tetapi dengan logika spesifik untuk masing-masing entity.

### B. Penerapan Prinsip SOLID pada Backend

#### 1. Single Responsibility Principle (SRP)
- **JobService**: Hanya bertanggung jawab atas logika bisnis terkait job/internship posting.
  - **File: `JobService.php`** - Fungsinya: Menyediakan logika bisnis untuk manajemen lowongan kerja termasuk validasi, format data, dan pengelolaan hak akses.
  
- **JobRepository**: Hanya tanggung jawab atas operasi CRUD terhadap model Job di database.
  - **File: `JobRepository.php`** - Fungsinya: Menyediakan implementasi operasi CRUD untuk model Job termasuk query kompleks terkait status lowongan dan koneksi dengan perusahaan.
  
- **JobController**: Hanya bertanggung jawab atas menerima request HTTP dan mengembalikan response.
  - **File: `JobController.php`** - Fungsinya: Menangani request HTTP terkait lowongan kerja dan meneruskan ke service layer untuk diproses.
  
- **AuthService**: Hanya bertanggung jawab atas logika otentikasi pengguna.
  - **File: `AuthService.php`** - Fungsinya: Menyediakan logika otentikasi pengguna termasuk register, login, dan logout.

#### 2. Open/Closed Principle (OCP)
- **Interface-based Design**: Kelas dapat diperluas dengan menerapkan interface tanpa memodifikasi kode eksisting. Contoh: membuat implementasi repository baru untuk JobRepositoryInterface.
  - **File: `JobServiceInterface.php`, `JobRepositoryInterface.php`** - Fungsinya: Menyediakan kontrak yang dapat diimplementasikan oleh kelas-kelas baru tanpa mengubah kode eksisting.
  
- **Dependency Injection**: Controller menerima service melalui constructor, memungkinkan injeksi implementasi yang berbeda tanpa mengubah kelas controller.
  - **File: `JobController.php`** - Fungsinya: Menggunakan dependency injection untuk menerima service sebagai dependensi.

#### 3. Liskov Substitution Principle (LSP)
- **Interface Consistency**: Semua implementasi dari interface dapat digunakan sebagai pengganti tanpa mengubah behavior sistem secara keseluruhan.

#### 4. Interface Segregation Principle (ISP)
- **Specific Interfaces**: Setiap service dan repository memiliki interface spesifik dengan metode-metode yang relevan, seperti `JobServiceInterface` hanya berisi metode terkait job, bukan metode lainnya.
  - **File: `JobServiceInterface.php`, `ApplicationServiceInterface.php`, `DocumentServiceInterface.php`** - Fungsinya: Menyediakan interface spesifik untuk masing-masing domain layanan.

#### 5. Dependency Inversion Principle (DIP)
- **IoC Container**: Laravel service container digunakan untuk menginjeksi dependencies berdasarkan interface, bukan implementasi konkret.
  - **File: `AppServiceProvider.php`** - Fungsinya: Menyediakan binding antara interface dan implementasi konkret untuk dependency injection.
  
- **AppServiceProvider**: Mengaitkan interface dengan implementasi konkret menggunakan binding, memastikan ketergantungan terhadap abstraksi.
  - **File: `AppServiceProvider.php`** - Fungsinya: Menyediakan binding antara interface dan implementasi konkret untuk dependency injection.
  ```php
  $this->app->bind(
      JobServiceInterface::class,
      JobService::class
  );
  ```

---

## Kesimpulan

Project InternSheep menerapkan prinsip OOP dan SOLID dengan baik di kedua sisi aplikasi (frontend dan backend). 

### Frontend (Next.js/React)
- Menggunakan interface untuk type safety dan kontrak data
- Menerapkan service container untuk manajemen dependencies
- Menggunakan class-based service dengan pewarisan dari base service
- Mengikuti prinsip SRP dengan memisahkan tanggung jawab tiap service

### Backend (Laravel PHP)
- Menggunakan pattern Repository dan Service untuk memisahkan concerns
- Menerapkan interface segregation untuk masing-masing service dan repository
- Menggunakan Laravel service container untuk dependency injection
- Menjaga ketergantungan terhadap abstraksi, bukan implementasi konkret

Dengan penerapan ini, aplikasi menjadi lebih modular, mudah di-test, dirawat, dan dikembangkan di masa depan.