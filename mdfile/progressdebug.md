# Debug Documentation: Sistem Integrasi Lamaran Magang

## Overview
Dokumentasi ini berisi semua masalah dan solusi yang ditemukan serta diimplementasikan selama proses pengembangan sistem integrasi antara dashboard perusahaan dan mahasiswa untuk alur lamaran magang.

---

## 1. Masalah Backend: Field Status Tidak Disimpan ke Database

### Masalah:
- Field `status` tidak berhasil disimpan ke database saat penjadwalan wawancara
- Setelah penjadwalan wawancara, status kembali ke 'Applied' saat refresh halaman
- Field-field interview (date, time, method dll) kadang tidak disimpan

### Penyebab Potensial:
- `$application->update([...])` tidak menyimpan field-field ke database dengan benar
- Kemungkinan constraint atau validasi di model atau database
- Mungkin ada race condition atau transaksi database yang tidak selesai

### Solusi:
- Ganti `$application->update([...])` ke pendekatan `$application->field = value; $application->save();`
- Endpoint: `setInterviewSchedule` di Application Controller
- Pastikan semua field diset secara eksplisit sebelum `->save()`

### Kode yang Diubah:
```php
// Sebelum (masalah):
$application->update([
    'interview_date' => $request->interview_date,
    'interview_time' => $request->interview_time,
    'interview_method' => $request->interview_method,
    // ... field lain
    'status' => 'interview'
]);

// Sesudah (solusi):
$application->interview_date = $request->interview_date;
$application->interview_time = $request->interview_time;
$application->interview_method = $request->interview_method;
// ... assignment field lain
$application->status = 'interview';
$application->save();
```

---

## 2. Masalah Frontend: Controlled Input Error

### Masalah:
- Error: "A component is changing a controlled input to be uncontrolled"
- Terjadi saat mengakses input fields di modal interview schedule
- Disebabkan oleh nilai input berubah dari defined ke undefined

### Solusi:
- Pastikan semua input field dalam state selalu memiliki nilai default
- Gunakan nullish coalescing operator (`??`) dan default values
- Tambahkan pengecekan dalam handleChange function

### Kode yang Diubah:
```typescript
// Sebelum:
const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setInterviewSchedule(prev => ({
    ...prev,
    [name]: value  // Bisa undefined
  }));
};

// Sesudah:
const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setInterviewSchedule(prev => ({
    ...prev,
    [name]: value || ''  // Pastikan tidak undefined
  }));
};
```

---

## 3. Masalah Render: Window is not defined Error

### Masalah:
- Error: "ReferenceError: window is not defined"
- Terjadi karena akses ke objek window di server-side rendering (Next.js)
- Common problem di Next.js karena code berjalan di server dan client

### Solusi:
- Tambahkan pengecekan `typeof window !== 'undefined'` sebelum mengakses window
- Tambahkan conditional rendering untuk komponen yang bergantung pada window
- Lakukan pengecekan di setiap akses ke window properties

### Kode yang Diubah:
```typescript
// Sebelum:
if (window.innerWidth < 768) {
  // ... logic
}

// Sesudah:
if (typeof window !== 'undefined' && window.innerWidth < 768) {
  // ... logic
}
```

---

## 4. Masalah Status Tampilan: Tidak Konsisten antara Database dan UI

### Masalah:
- Status tampilan tidak sinkron antara data dari database dan tampilan UI
- Setelah penjadwalan wawancara, status UI berubah sebentar ke 'Interview' lalu kembali ke 'Applied'
- UI tidak mencerminkan keberadaan field interview_date

### Solusi:
- Implementasikan logika tampilan berbasis keberadaan field field, bukan hanya field status
- Buat fungsi `getDisplayStatus` yang menentukan status tampilan berdasarkan field-field interview
- Prioritaskan keberadaan field interview_date daripada field status untuk menampilkan 'Interview'

### Kode yang Diubah:
```typescript
const getDisplayStatus = (appStatus: ApplicationStatus, hasInterviewScheduled: boolean) => {
  // Jika aplikasi sudah diterima/ditolak, tampilkan status sebenarnya
  if (appStatus === 'Accepted' || appStatus === 'Rejected') {
    return appStatus;
  }
  // Jika interview dijadwalkan dan belum diterima/ditolak, tampilkan 'Interview'
  return hasInterviewScheduled ? 'Interview' : appStatus;
};
```

---

## 5. Masalah Konfirmasi Kehadiran: Tidak Muncul di Dashboard Perusahaan

### Masalah:
- Konfirmasi kehadiran yang dilakukan di dashboard mahasiswa tidak muncul di dashboard perusahaan
- Tidak ada sinkronisasi antara konfirmasi kehadiran mahasiswa dan tampilan di perusahaan

### Solusi:
- Tambahkan field-field attendance confirmation ke tabel applications
- Buat endpoint API baru: `PATCH /applications/{id}/confirm-attendance`
- Tambahkan field-field ke response API di `getCompanyApplications` dan `index`
- Tampilkan informasi kehadiran di dashboard perusahaan

### Migrasi Tabel:
```php
Schema::table('applications', function (Blueprint $table) {
  $table->boolean('attendance_confirmed')->default(false);
  $table->timestamp('attendance_confirmed_at')->nullable();
  $table->string('attendance_confirmation_method')->nullable();
});
```

---

## 6. Masalah Accept/Reject: Tidak Disimpan ke Database

### Masalah:
- Setelah perusahaan menekan tombol "Terima" atau "Tolak", status tidak disimpan ke database
- Perubahan hanya terjadi di state lokal, tidak di database

### Solusi:
- Buat endpoint baru: `PATCH /applications/{id}/status` untuk update status
- Implementasikan fungsi update status di backend dengan proper authorization
- Panggil API endpoint dari frontend saat accept/reject

### Kode Endpoint Backend:
```php
public function updateStatus(string $id, Request $request): JsonResponse
{
  // Validasi dan otorisasi
  // Update field-field termasuk status
  $application->update([
    'status' => $request->status,
    'feedback_note' => $request->feedback_note
  ]);
  // Return updated data
}
```

---

## 7. Masalah Race Condition: Data Lama Ditampilkan Setelah Update

### Masalah:
- Setelah update (penjadwalan wawancara, acceptance, dll), data lama dari server ditampilkan kembali
- Terjadi race condition antara update lokal dan pengambilan data dari server

### Solusi:
- Tambahkan delay kecil sebelum mengambil ulang data dari server
- Gunakan optimistic updates dengan fallback
- Atau, pastikan data diambil kembali setelah update berhasil

### Kode Contoh Solusi:
```typescript
// Setelah update sukses
setTimeout(async () => {
  if (token) {
    const response = await fetch(API_ENDPOINT);
    // Perbarui state dengan data terbaru
  }
}, 500); // Delay untuk memastikan DB commit
```

---

## 8. Masalah Multiple Applications: Tidak Independen

### Masalah:
- Perubahan status pada aplikasi A mempengaruhi tampilan aplikasi B
- Tidak semua aplikasi memiliki fungsionalitas yang sama
- Konflik antar aplikasi dalam state management

### Solusi:
- Pastikan semua fungsi dan logika berjalan per aplikasi berdasarkan ID
- Gunakan logika berbasis data lokal setiap aplikasi, bukan state global
- Validasi bahwa setiap perubahan hanya mempengaruhi satu aplikasi tertentu

---

## 9. Masalah Button Duplikat: Accept/Reject dan Status Button

### Masalah:
- Setelah penjadwalan wawancara, muncul dua set tombol: "Accept/Reject" dan tombol status
- UI terlihat berantakan dan membingungkan

### Solusi:
- Implementasikan logika conditional rendering yang hanya menampilkan tombol yang sesuai
- Jika interview dijadwalkan, tampilkan hanya tombol "Accept/Reject", sembunyikan tombol utama
- Gunakan kondisi berdasarkan status dan keberadaan field interview

### Kode Solusi:
```jsx
{/* Tombol utama hanya muncul jika interview belum dijadwalkan */}
{!(app.status === 'Interview' || !!app.interview_date) && (
  <button>{/* Main action button */}</button>
)}

{/* Tombol Accept/Reject hanya muncul jika interview dijadwalkan */}
{(app.status === 'Interview' || !!app.interview_date) && (
  <div>
    <button>Terima</button>
    <button>Tolak</button>
  </div>
)}
```

---

## 10. Masalah Sinkronisasi Data: Tidak Real-time

### Masalah:
- Perubahan di satu dashboard tidak langsung tercermin di dashboard lain
- Butuh refresh manual untuk melihat perubahan

### Solusi:
- Implementasikan polling sederhana untuk refresh data secara berkala
- Atau, setelah update sukses, panggil ulang fungsi pengambilan data
- Gunakan WebSocket jika membutuhkan real-time update (di masa depan)

---

## Ringkasan Perubahan Penting

### Backend (Laravel):
1. Tambah field-field interview ke tabel applications
2. Tambah field-field attendance confirmation
3. Tambah endpoint `setInterviewSchedule` dengan proper save mechanism
4. Tambah endpoint `updateStatus` untuk accept/reject
5. Tambah endpoint `confirmAttendance` untuk konfirmasi kehadiran
6. Update semua response API untuk menyertakan field-field tambahan

### Frontend (Next.js):
1. Tambah field-field baru ke Application interface
2. Tambah logika berbasis field untuk tampilan status
3. Perbaiki controlled input errors
4. Perbaiki window is not defined errors
5. Tambah tampilan informasi konfirmasi kehadiran
6. Tambah tombol dan fungsionalitas Accept/Reject
7. Perbaiki race condition dengan pengambilan data kembali

### Service Functions:
1. Tambah `setInterviewSchedule` service
2. Tambah `updateApplicationStatus` service
3. Tambah `confirmAttendance` service

---

## Testing Checklist

Sebelum deploy, pastikan semua fungsionalitas berjalan:
- [ ] Apply job (from student)
- [ ] View applications (from company)
- [ ] Schedule interview (from company)
- [ ] See interview schedule (from student)
- [ ] Confirm attendance (from student) 
- [ ] See attendance confirmation (from company)
- [ ] Accept/Reject application (from company)
- [ ] See final status (from student & company)
- [ ] Single application workflow complete
- [ ] Multiple applications independent (optional after single success)
