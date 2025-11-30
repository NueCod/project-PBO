Ringkasan Aplikasi
Nama (Saran): InternSheep atau MagangConnect Deskripsi: Sebuah platform web terintegrasi yang mempertemukan mahasiswa (aktif/fresh graduate) dengan perusahaan. Platform ini memfasilitasi siklus perekrutan magang dari hulu ke hilir: mulai dari pembuatan profil, pencarian lowongan, pengiriman lamaran dan dokumen, hingga proses seleksi oleh perusahaan.

Nilai Tambah:

Validasi Status: Membedakan secara jelas antara mahasiswa aktif (butuh magang kredit/SKS) dan fresh graduate (mencari pengalaman kerja pertama).

Manajemen Dokumen: Penyimpanan terpusat untuk CV, Transkrip, dan Portofolio.

Tracking Lamaran: Transparansi status lamaran (Terkirim, Dilihat, Wawancara, Diterima/Ditolak).

2. Fitur Utama
A. Fitur Umum (All Users)
Autentikasi & Otorisasi: Login/Register (Email & Password atau Google OAuth).

Dashboard: Ringkasan aktivitas (lamaran aktif atau lowongan aktif).

Notifikasi: Email/In-app notification untuk update status lamaran.

B. Fitur Mahasiswa (Student)
Manajemen Profil: Data diri, Universitas, IPK, dan Status Kelulusan (Belum Lulus/Sudah Lulus).

Document Vault: Upload CV, Transkrip Nilai, Surat Rekomendasi (PDF).

Job Search & Filter: Cari berdasarkan lokasi, kategori, atau tipe magang (WFH/WFO).

Quick Apply: Melamar dengan satu klik menggunakan dokumen yang tersimpan.

History Lamaran: Melihat status setiap lamaran yang dikirim.

C. Fitur Perusahaan (Company)
Company Profile: Logo, deskripsi, website, dan lokasi kantor.

Post a Job: Membuat lowongan dengan kriteria spesifik (misal: khusus fresh graduate atau mahasiswa tingkat akhir).

Applicant Tracking System (ATS) Mini: Melihat daftar pelamar, filter berdasarkan IPK/Jurusan, download CV pelamar.

Action Button: Mengubah status pelamar (Shortlist, Interview, Accept, Reject).

3. Alur Aplikasi (User Flow)
Alur Mahasiswa:
Registrasi: Mendaftar sebagai Talent, memilih status (Mahasiswa Aktif/Alumni).

Lengkapi Profil: Mengisi data pendidikan dan mengunggah CV default.

Explorasi: Mencari lowongan magang yang tersedia.

Apply: Memilih lowongan, melampirkan CV (bisa custom), dan mengirim lamaran.

Menunggu: Memantau status lamaran di dashboard.

Alur Perusahaan:
Registrasi & Verifikasi: Mendaftar sebagai Employer dan mengisi profil perusahaan.

Posting: Membuat lowongan baru dengan deskripsi pekerjaan dan kriteria.

Review: Mendapatkan notifikasi pelamar masuk -> Membuka profil pelamar -> Mengunduh CV.

Seleksi: Mengubah status pelamar.

Jika tertarik: Ubah ke "Interview" (sistem mengirim notifikasi ke mahasiswa).

Jika cocok: Ubah ke "Accepted".

4. Skema Database (PostgreSQL)
Desain ini menggunakan relasi antar tabel yang efisien. Kita akan menggunakan tipe data seperti UUID untuk ID agar lebih aman, dan ENUM untuk status.

Diagram Relasi Entitas (ERD) Konseptual:
Users (Induk) -> Profiles (Student/Company)

Company -> Jobs (One-to-Many)

Student -> Applications -> Jobs (Many-to-Many via Applications table)

Student -> Documents (One-to-Many)


Shutterstock
Struktur Tabel SQL (Draft)
SQL

-- 1. Tipe Data ENUM untuk standardisasi
CREATE TYPE user_role AS ENUM ('student', 'company', 'admin');
CREATE TYPE student_status AS ENUM ('undergraduate', 'fresh_graduate');
CREATE TYPE job_type AS ENUM ('wfo', 'wfh', 'hybrid');
CREATE TYPE application_status AS ENUM ('applied', 'reviewing', 'interview', 'accepted', 'rejected');

-- 2. Tabel Users (Menyimpan kredensial login)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Profil Mahasiswa
CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    university VARCHAR(100),
    major VARCHAR(100), -- Jurusan
    gpa DECIMAL(3, 2), -- IPK
    graduation_year INT,
    status student_status NOT NULL DEFAULT 'undergraduate',
    bio TEXT,
    phone_number VARCHAR(20),
    linkedin_url VARCHAR(255)
);

-- 4. Tabel Profil Perusahaan
CREATE TABLE company_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(100) NOT NULL,
    description TEXT,
    industry VARCHAR(100),
    website_url VARCHAR(255),
    address TEXT,
    logo_url VARCHAR(255)
);

-- 5. Tabel Dokumen (CV, Transkrip, dll)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL, -- misal: "CV 2024", "Transkrip"
    file_url VARCHAR(255) NOT NULL,
    file_type VARCHAR(10), -- pdf, docx
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Lowongan (Jobs)
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES company_profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    job_type job_type NOT NULL,
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    closing_date TIMESTAMPTZ
);

-- 7. Tabel Lamaran (Applications) - Inti Transaksi
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES documents(id), -- CV spesifik yang dipakai melamar
    status application_status DEFAULT 'applied',
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    feedback_note TEXT -- Catatan dari perusahaan untuk mahasiswa (opsional)
);
Poin Penting untuk Pengembangan:
Keamanan Data: Pastikan file dokumen (CV/Transkrip) disimpan di object storage yang aman (seperti AWS S3 atau Google Cloud Storage), bukan langsung di database sebagai BLOB, database hanya menyimpan URL-nya saja.

Validasi: Tambahkan validasi di sisi backend agar mahasiswa yang statusnya "Belum Lulus" wajib mengisi tahun estimasi lulus.