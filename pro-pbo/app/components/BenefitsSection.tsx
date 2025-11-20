// BenefitsSection.tsx
import { SectionProps } from '../interfaces';

const BenefitsSection = ({ darkMode }: SectionProps) => {
  const benefits = [
    { title: "Proses Lengkap", description: "Siklus mulai dari pembuatan profil hingga penempatan." },
    { title: "Profil Teruji", description: "Sistem verifikasi mahasiswa dan perusahaan yang otentik." },
    { title: "Pelacakan Transparan", description: "Pembaruan status lamaran secara real-time." }
  ];

  return (
    <section id="benefits" className={`py-20 px-5 ${darkMode ? 'bg-gray-900' : 'bg-[#f5f5f5]'}`}>
      <div className="max-w-[1200px] mx-auto px-[40px]">
        <div className="text-center mb-16">
          <h2 className={`text-[3rem] font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Mengapa Memilih InternBridge?</h2>
          <p className={`text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-[#737373]'}`}>
            Solusi lengkap untuk rekrutmen magang dari awal hingga akhir.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center p-8">
              <div className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>{benefit.title}</div>
              <p className={`${darkMode ? 'text-gray-300' : 'text-[#737373]'}`}>{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;