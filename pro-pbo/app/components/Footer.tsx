// Footer.tsx
import { SectionProps } from '../interfaces';

const Footer = ({ darkMode }: SectionProps) => {
  const categories = ['Platform', 'Perusahaan', 'Sumber', 'Hukum'];
  const items = ['Fitur', 'Pembaruan', 'Karir', 'Blog', 'Dokumentasi', 'Syarat', 'Privasi'];

  return (
    <footer className={`text-white py-16 ${darkMode ? 'bg-gray-900' : 'bg-[#0f0f0f]'}`}>
      <div className="max-w-[1200px] mx-auto px-[40px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-6">InternSheep</h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-[#a3a3a3]'}`}>
              Menghubungkan mahasiswa dengan peluang magang bermakna dan perusahaan dengan talenta terbaik.
            </p>
          </div>
          {categories.map((category, index) => (
            <div key={index}>
              <h4 className="text-lg font-bold mb-6">{category}</h4>
              <ul className={`space-y-3 ${darkMode ? 'text-gray-400' : 'text-[#a3a3a3]'}`}>
                {items.slice(index * 2, (index + 1) * 2).map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <a href="#" className="hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={`border-t mt-12 pt-8 text-center ${darkMode ? 'border-gray-800 text-gray-400' : 'border-[#333333] text-[#a3a3a3]'}`}>
          <p>&copy; 2025 InternSheep. Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;