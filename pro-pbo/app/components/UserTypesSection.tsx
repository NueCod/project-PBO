// UserTypesSection.tsx
import { SectionProps } from '../interfaces';
import { DataService } from '../dataService';
import Link from 'next/link';

const UserTypesSection = ({ darkMode }: SectionProps) => {
  const userFlows = DataService.getUserFlows();

  return (
    <section id="user-types" className={`py-20 px-5 ${darkMode ? 'bg-gray-900' : 'bg-[#f5f5f5]'}`}>
      <div className="max-w-[1200px] mx-auto px-[40px]">
        <div className="text-center mb-16">
          <h2 className={`text-[3rem] font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Siapa yang Menggunakan InternSheep</h2>
          <p className={`text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-[#737373]'}`}>
            Platform yang dirancang khusus untuk mahasiswa yang mencari magang dan perusahaan yang mencari talenta berbakat.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {userFlows.map((user, index) => {
            // Determine the login path based on the user type
            const loginPath = user.name === 'Mahasiswa' ? '/login-student' : '/login-company';
            return (
            <div key={index} className={`p-10 rounded-lg border text-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-[#e5e7eb]'}`}>
              <h3 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>{user.name}</h3>
              <p className={`mb-8 text-lg ${darkMode ? 'text-gray-300' : 'text-[#737373]'}`}>{user.description}</p>
              <Link href={loginPath}>
                <button className="bg-[#f59e0b] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#d97706] transition-colors">
                  Bergabung sebagai {user.name}
                </button>
              </Link>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UserTypesSection;