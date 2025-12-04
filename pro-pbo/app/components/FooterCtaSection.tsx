// FooterCtaSection.tsx
import { SectionProps } from '../interfaces';
import Link from 'next/link';

const FooterCtaSection = ({ darkMode }: SectionProps) => {
  return (
    <section id="contact" className="py-20 bg-[#f59e0b]">
      <div className="max-w-[1200px] mx-auto px-[40px] text-center">
        <h2 className="text-[3rem] font-bold text-white mb-6">Siap Memulai Perjalanan Anda?</h2>
        <p className="text-xl text-[#ffedd5] mb-10 max-w-3xl mx-auto">
          Bergabunglah dengan ribuan mahasiswa dan perusahaan yang terhubung melalui InternSheep.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login-student">
            <button className="bg-white text-[#f59e0b] px-8 py-4 rounded-lg font-semibold hover:bg-[#f5f5f5] transition-colors">
              Bergabung sebagai Mahasiswa
            </button>
          </Link>
          <Link href="/login-company">
            <button className="border border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#f59e0b] transition-colors">
              Bergabung sebagai Perusahaan
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FooterCtaSection;