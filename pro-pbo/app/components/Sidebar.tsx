import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type MenuItem = {
  id: string;
  label: string;
  icon: string;
  href: string;
};

const Sidebar = ({ darkMode }: { darkMode: boolean }) => {
  const pathname = usePathname();

  // Determine which menu items to show based on the current path
  const isStudentDashboard = pathname?.startsWith('/dashboard-student');

  const menuItems = isStudentDashboard ? [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/dashboard-student' },
    { id: 'find-internships', label: 'Cari Magang', icon: '🔍', href: '/dashboard-student/find-internships' },
    { id: 'my-applications', label: 'Lamaran Saya', icon: '📋', href: '/dashboard-student/my-applications' },
    { id: 'profile', label: 'Profil Saya', icon: '👤', href: '/dashboard-student/profile' },
    { id: 'documents', label: 'Dokumen', icon: '📄', href: '/dashboard-student/documents' },
  ] : [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/dashboard' },
    { id: 'create-internship', label: 'Buat Magang', icon: '💼', href: '/dashboard/create-internship' },
    { id: 'students', label: 'Mahasiswa', icon: '👥', href: '/dashboard/students' },
    { id: 'applications', label: 'Lamaran', icon: '📋', href: '/dashboard/applications' },
    { id: 'manage-company', label: 'Profil Perusahaan', icon: '🏢', href: '/dashboard/manage-company-profile' },
    { id: 'settings', label: 'Pengaturan', icon: '⚙️', href: '/dashboard/settings' },
  ];

  return (
    <aside className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r z-40`}>
      <div className="p-4 pt-12">
        <div className={`text-xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>InternBridge</div>

        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.id}>
                  <Link href={item.href}>
                    <div
                      className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors cursor-pointer ${
                        isActive
                          ? darkMode
                            ? 'bg-[#f59e0b] text-white'
                            : 'bg-[#f59e0b] text-white'
                          : darkMode
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;