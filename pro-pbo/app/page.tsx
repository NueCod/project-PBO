'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    // Update the class on the document element
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const features = [
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

  const userFlows = [
    {
      name: "Mahasiswa",
      description: "Temukan magang, kelola profil dan dokumen, lacak lamaran"
    },
    {
      name: "Perusahaan",
      description: "Posting pekerjaan, kelola pelamar, temukan talenta terbaik"
    }
  ];

  const faqs = [
    {
      question: "Siapa saja yang dapat menggunakan InternBridge?",
      answer: "InternBridge melayani mahasiswa aktif dan lulusan baru yang mencari magang atau pengalaman kerja pertama."
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

  return (
    <div className={`min-h-screen font-sans ${darkMode ? 'dark bg-gray-900' : 'bg-white'}`} style={{ fontFamily: 'Instrument Sans, system-ui, sans-serif' }}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 backdrop-blur-sm z-50 border-b ${darkMode ? 'bg-gray-900/90 border-gray-700' : 'bg-white/90 border-[#e5e7eb]'}`}>
        <div className="max-w-[1200px] mx-auto px-[40px] py-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>InternBridge</div>
            </div>
            <nav className="hidden md:flex space-x-8">
              {['Fitur', 'Keunggulan', 'Cara Kerja', 'FAQ', 'Kontak'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className={`${darkMode ? 'text-white hover:text-gray-300' : 'text-[#0f0f0f] hover:text-[#737373]'} transition-colors font-medium`}>
                  {item}
                </a>
              ))}
            </nav>
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button 
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              <button className={`md:hidden ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="pt-32 pb-20 px-5">
        <div className="max-w-[1200px] mx-auto px-[40px]">
          <div className="text-center">
            <div className={`inline-block px-4 py-1 rounded-full text-sm font-medium mb-6 ${darkMode ? 'bg-gray-800 text-yellow-300' : 'bg-[#f5f5f5] text-[#0f0f0f]'}`}>
              MENGHUBUNGKAN TALENTA
            </div>
            <h1 className={`text-[4.5rem] font-bold mb-6 leading-tight max-w-4xl mx-auto ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>
              Jembatani Kesempatan Mahasiswa dan
              <span className={`${darkMode ? 'text-yellow-400' : 'text-[#f59e0b]'}`}> Dunia Kerja</span>
            </h1>
            <p className={`text-xl mb-8 max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-[#737373]'}`}>
              InternBridge menghubungkan mahasiswa dan lulusan baru dengan perusahaan untuk pengalaman magang yang bermakna.
              Platform lengkap dari pembuatan profil hingga manajemen lamaran dan seleksi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-[#f59e0b] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#d97706] transition-colors">
                Bergabung sebagai Mahasiswa
              </button>
              <button className={`border px-8 py-4 rounded-lg font-semibold transition-colors ${darkMode ? 'border-gray-600 text-white hover:bg-white hover:text-[#f59e0b]' : 'border-[#0f0f0f] text-[#0f0f0f] hover:bg-[#0f0f0f] hover:text-white'}`}>
                Bergabung sebagai Perusahaan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-20 px-5 ${darkMode ? 'bg-gray-800' : 'bg-[#f5f5f5]'}`}>
        <div className="max-w-[1200px] mx-auto px-[40px]">
          <div className="text-center mb-16">
            <h2 className={`text-[3rem] font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Fitur Unggulan</h2>
            <p className={`text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-[#737373]'}`}>
              Semua yang Anda butuhkan untuk mengelola siklus rekrutmen magang secara lengkap.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px]">
            {features.map((feature, index) => (
              <div key={index} className={`p-8 rounded-lg border shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-[#e5e7eb]'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 ${darkMode ? 'bg-gray-600' : 'bg-[#f5f5f5]'}`}>
                  <div className={`w-6 h-6 rounded-full ${darkMode ? 'bg-yellow-400' : 'bg-[#f59e0b]'}`}></div>
                </div>
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>{feature.title}</h3>
                <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-[#737373]'}`}>{feature.description}</p>
                <ul className="space-y-3">
                  {feature.features.map((feat, featIndex) => (
                    <li key={featIndex} className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-[#737373]'}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${darkMode ? 'bg-gray-600' : 'bg-[#f5f5f5]'}`}>
                        <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-yellow-400' : 'bg-[#f59e0b]'}`}></div>
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className={`py-20 px-5 ${darkMode ? 'bg-gray-900' : 'bg-[#f5f5f5]'}`}>
        <div className="max-w-[1200px] mx-auto px-[40px]">
          <div className="text-center mb-16">
            <h2 className={`text-[3rem] font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Mengapa Memilih InternBridge</h2>
            <p className={`text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-[#737373]'}`}>
              Solusi lengkap untuk rekrutmen magang dari awal hingga akhir.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Proses Lengkap</div>
              <p className={`${darkMode ? 'text-gray-300' : 'text-[#737373]'}`}>Siklus mulai dari pembuatan profil hingga penempatan.</p>
            </div>
            <div className="text-center p-8">
              <div className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Profil Teruji</div>
              <p className={`${darkMode ? 'text-gray-300' : 'text-[#737373]'}`}>Sistem verifikasi mahasiswa dan perusahaan yang otentik.</p>
            </div>
            <div className="text-center p-8">
              <div className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Pelacakan Transparan</div>
              <p className={`${darkMode ? 'text-gray-300' : 'text-[#737373]'}`}>Pembaruan status lamaran secara real-time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className={`py-20 px-5 ${darkMode ? 'bg-gray-800' : ''}`}>
        <div className="max-w-[1200px] mx-auto px-[40px]">
          <div className="text-center mb-16">
            <h2 className={`text-[3rem] font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Cara Kerja</h2>
            <p className={`text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-[#737373]'}`}>
              Langkah-langkah sederhana untuk menghubungkan mahasiswa dan perusahaan untuk magang yang bermakna.
            </p>
          </div>
          
          <div className="mb-20">
            <h3 className={`text-[2.25rem] font-bold mb-10 text-center ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Untuk Mahasiswa</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "1", title: "Daftar", desc: "Buat profil dan verifikasi status Anda" },
                { step: "2", title: "Unggah", desc: "Tambahkan CV, transkrip, dan portofolio" },
                { step: "3", title: "Cari", desc: "Temukan peluang magang yang sesuai" },
                { step: "4", title: "Lamar", desc: "Kirim lamaran dan lacak statusnya" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${darkMode ? 'bg-gray-700' : 'bg-[#f5f5f5]'}`}>
                    <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>{item.step}</span>
                  </div>
                  <h4 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>{item.title}</h4>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-[#737373]'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className={`text-[2.25rem] font-bold mb-10 text-center ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Untuk Perusahaan</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "1", title: "Register", desc: "Buat profil perusahaan dan verifikasi" },
                { step: "2", title: "Posting", desc: "Buat deskripsi pekerjaan magang" },
                { step: "3", title: "Review", desc: "Kelola aplikasi dan pelamar" },
                { step: "4", title: "Pilih", desc: "Pilih kandidat dan buat penawaran" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${darkMode ? 'bg-gray-700' : 'bg-[#f5f5f5]'}`}>
                    <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>{item.step}</span>
                  </div>
                  <h4 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>{item.title}</h4>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-[#737373]'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section id="user-types" className={`py-20 px-5 ${darkMode ? 'bg-gray-900' : 'bg-[#f5f5f5]'}`}>
        <div className="max-w-[1200px] mx-auto px-[40px]">
          <div className="text-center mb-16">
            <h2 className={`text-[3rem] font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Siapa yang Menggunakan InternBridge</h2>
            <p className={`text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-[#737373]'}`}>
              Platform yang dirancang khusus untuk mahasiswa yang mencari magang dan perusahaan yang mencari talenta berbakat.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {userFlows.map((user, index) => (
              <div key={index} className={`p-10 rounded-lg border text-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-[#e5e7eb]'}`}>
                <h3 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>{user.name}</h3>
                <p className={`mb-8 text-lg ${darkMode ? 'text-gray-300' : 'text-[#737373]'}`}>{user.description}</p>
                <button className="bg-[#f59e0b] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#d97706] transition-colors">
                  Bergabung sebagai {user.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faqs" className={`py-20 px-5 ${darkMode ? 'bg-gray-800' : ''}`}>
        <div className="max-w-[800px] mx-auto px-[40px]">
          <div className="text-center mb-16">
            <h2 className={`text-[3rem] font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Pertanyaan Umum</h2>
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-[#737373]'}`}>
              Segala yang perlu Anda ketahui tentang InternBridge.
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className={`border rounded-lg ${darkMode ? 'border-gray-700' : 'border-[#e5e7eb]'}`}>
                <button
                  className={`w-full p-6 text-left flex justify-between items-center ${darkMode ? 'text-white' : ''}`}
                  onClick={() => toggleFaq(index)}
                >
                  <span className={`text-xl font-medium ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>{faq.question}</span>
                  <div className={`transform transition-transform ${openFaqIndex === index ? 'rotate-180' : ''}`}>
                    <svg className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-[#737373]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {openFaqIndex === index && (
                  <div className={`px-6 pb-6 pt-2 border-t ${darkMode ? 'border-gray-700 text-gray-300' : 'border-[#e5e7eb] text-[#737373]'}`}>
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section id="contact" className="py-20 bg-[#f59e0b]">
        <div className="max-w-[1200px] mx-auto px-[40px] text-center">
          <h2 className="text-[3rem] font-bold text-white mb-6">Siap Memulai Perjalanan Anda?</h2>
          <p className="text-xl text-[#ffedd5] mb-10 max-w-3xl mx-auto">
            Bergabunglah dengan ribuan mahasiswa dan perusahaan yang terhubung melalui InternBridge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-[#f59e0b] px-8 py-4 rounded-lg font-semibold hover:bg-[#f5f5f5] transition-colors">
              Bergabung sebagai Mahasiswa
            </button>
            <button className="border border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#f59e0b] transition-colors">
              Bergabung sebagai Perusahaan
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`text-white py-16 ${darkMode ? 'bg-gray-900' : 'bg-[#0f0f0f]'}`}>
        <div className="max-w-[1200px] mx-auto px-[40px]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-6">InternBridge</h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-[#a3a3a3]'}`}>
                Menghubungkan mahasiswa dengan peluang magang bermakna dan perusahaan dengan talenta terbaik.
              </p>
            </div>
            {['Platform', 'Perusahaan', 'Sumber', 'Hukum'].map((category, index) => (
              <div key={index}>
                <h4 className="text-lg font-bold mb-6">{category}</h4>
                <ul className={`space-y-3 ${darkMode ? 'text-gray-400' : 'text-[#a3a3a3]'}`}>
                  {['Fitur', 'Harga', 'Pembaruan', 'Karir', 'Blog', 'Dokumentasi', 'Syarat', 'Privasi'].slice(index * 2, (index + 1) * 2).map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <a href="#" className="hover:text-white transition-colors">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className={`border-t mt-12 pt-8 text-center ${darkMode ? 'border-gray-800 text-gray-400' : 'border-[#333333] text-[#a3a3a3]'}`}>
            <p>&copy; 2025 InternBridge. Hak Cipta Dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}