// dataService.ts
import { Feature, UserFlow, FAQ } from './interfaces';

export class DataService {
  static getFeatures(): Feature[] {
    return [
      {
        title: "Verified Status",
        description: "Clear differentiation between active students and fresh graduates",
        features: ["Student verification", "Graduate validation", "Status transparency"]
      },
      {
        title: "Document Management",
        description: "Centralized storage for CV, transcripts, and portfolios",
        features: ["Secure cloud storage", "PDF support", "Version control"]
      },
      {
        title: "Application Tracking",
        description: "Transparency on application status at all times",
        features: ["Real-time updates", "Status tracking", "Notification system"]
      }
    ];
  }

  static getUserFlows(): UserFlow[] {
    return [
      {
        name: "Mahasiswa",
        description: "Temukan magang, kelola profil dan dokumen, lacak lamaran"
      },
      {
        name: "Perusahaan",
        description: "Posting pekerjaan, kelola pelamar, temukan talenta terbaik"
      }
    ];
  }

  static getFAQs(): FAQ[] {
    return [
      {
        question: "Siapa saja yang dapat menggunakan InternSheep?",
        answer: "InternSheep melayani mahasiswa aktif dan lulusan baru yang mencari magang atau pengalaman kerja pertama."
      },
      {
        question: "Bagaimana cara memverifikasi status mahasiswa?",
        answer: "Kami menggunakan verifikasi email akademik dan dokumen institusi opsional untuk memverifikasi status mahasiswa aktif."
      },
      {
        question: "Apakah penyimpanan dokumen aman?",
        answer: "Ya, semua dokumen disimpan dengan keamanan tingkat perusahaan dan penyimpanan cloud terenkripsi untuk perlindungan maksimal."
      },
      {
        question: "Apakah perusahaan dapat membuat beberapa posisi?",
        answer: "Ya, perusahaan dapat membuat beberapa postingan pekerjaan dan mengelola semua pelamar dari satu dasbor."
      },
      {
        question: "Bagaimana pelacakan lamaran bekerja?",
        answer: "Setiap lamaran memiliki status yang diperbarui secara real-time. Anda akan menerima notifikasi untuk setiap perubahan status."
      }
    ];
  }
}