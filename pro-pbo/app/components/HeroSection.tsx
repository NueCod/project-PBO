// HeroSection.tsx
import { SectionProps } from '../interfaces';
import Link from 'next/link';

const HeroSection = ({ darkMode }: SectionProps) => {
  return (
    <section id="hero" className="pt-32 pb-20 px-5">
      <div className="max-w-[1200px] mx-auto px-[40px]">
        <div className="text-center">
          <div className={`inline-block px-4 py-1 rounded-full text-sm font-medium mb-4 md:mb-6 ${darkMode ? 'bg-gray-800 text-yellow-300' : 'bg-[#f5f5f5] text-[#0f0f0f]'}`}>
            MENGHUBUNGKAN TALENTA
          </div>
          <h1 className={`text-[2rem] sm:text-[2.5rem] md:text-[3rem] lg:text-[4.5rem] font-bold mb-4 md:mb-6 leading-tight max-w-4xl mx-auto ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>
            Jembatani Kesempatan Mahasiswa dan
            <span className={`${darkMode ? 'text-yellow-400' : 'text-[#f59e0b]'}`}> Dunia Kerja</span>
          </h1>
          <p className={`text-base sm:text-lg md:text-xl mb-6 md:mb-8 max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-[#737373]'}`}>
            InternSheep menghubungkan mahasiswa dan lulusan baru dengan perusahaan untuk pengalaman magang yang bermakna.
            Platform lengkap dari pembuatan profil hingga manajemen lamaran dan seleksi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <button className={`text-base md:text-lg bg-[#f59e0b] text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold hover:bg-[#d97706] transition-colors`}>
                Bergabung sebagai Mahasiswa
              </button>
            </Link>
            <Link href="/login">
              <button className={`text-base md:text-lg border px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold transition-colors ${darkMode ? 'border-gray-600 text-white hover:bg-white hover:text-[#f59e0b]' : 'border-[#0f0f0f] text-[#0f0f0f] hover:bg-[#0f0f0f] hover:text-white'}`}>
                Bergabung sebagai Perusahaan
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;