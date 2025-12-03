'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../lib/authContext';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';

type StatCard = {
  title: string;
  value: string;
  change: string;
  icon: string;
};

type Activity = {
  id: number;
  user: string;
  action: string;
  time: string;
};

const DashboardPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Move this to the top with other state declarations
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect based on user role
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'student') {
        router.push('/dashboard-student');
      } else if (user.role === 'company') {
        // Stay on this page for company users
      } else if (user.role === 'admin') {
        router.push('/dashboard-admin');
      }
    } else if (!isLoading && !user) {
      // If user is not authenticated, redirect to login
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Show loading state while auth status is being determined
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p>Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  // If user is not loaded and not loading anymore, redirect to login
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p>Anda harus login terlebih dahulu.</p>
        </div>
      </div>
    );
  }

  // If user is loaded but not a company, redirect appropriately
  if (user.role !== 'company') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p>Halaman tidak ditemukan atau tidak diizinkan.</p>
        </div>
      </div>
    );
  }

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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const stats: StatCard[] = [
    { title: 'Total Magang', value: '12', change: '+2 bulan ini', icon: '💼' },
    { title: 'Mahasiswa Aktif', value: '48', change: '+5 bulan ini', icon: '👥' },
    { title: 'Lamaran Masuk', value: '32', change: '+7 bulan ini', icon: '📋' },
    { title: 'Diterima', value: '18', change: '+3 bulan ini', icon: '✅' },
  ];

  const recentActivities: Activity[] = [
    { id: 1, user: 'Budi Santoso', action: 'Melamar magang di bagian Pemasaran', time: '10 menit yang lalu' },
    { id: 2, user: 'Siti Nurhaliza', action: 'Melengkapi dokumen magang', time: '1 jam yang lalu' },
    { id: 3, user: 'Ahmad Fauzi', action: 'Mengunggah portofolio', time: '2 jam yang lalu' },
    { id: 4, user: 'Rina Kartika', action: 'Mengajukan perpanjangan magang', time: '3 jam yang lalu' },
  ];

  // Toggle sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 backdrop-blur-sm z-50 border-b ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-[#e5e7eb]'}`}>
        <div className="max-w-[1200px] mx-auto px-[40px] py-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden mr-4"
              >
                <svg className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-900'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Dashboard Perusahaan</div>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-4">
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
              <div className="flex items-center space-x-2">
                <div className={`h-10 w-10 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-700'}`}>P</span>
                </div>
                <span className={`hidden md:block ${darkMode ? 'text-white' : 'text-gray-700'}`}>PT Maju Jaya</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        {(sidebarOpen || window.innerWidth >= 768) && (
          <div className="hidden md:block">
            <Sidebar
              darkMode={darkMode}
              userProfile={user ? { name: user.email.split('@')[0], email: user.email } : undefined}
            />
          </div>
        )}

        {/* Mobile sidebar overlay */}
        {sidebarOpen && window.innerWidth < 768 && (
          <div 
            className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        
        {sidebarOpen && window.innerWidth < 768 && (
          <div className="fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] md:hidden">
            <Sidebar
              darkMode={darkMode}
              userProfile={user ? { name: user.email.split('@')[0], email: user.email } : undefined}
            />
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${sidebarOpen ? 'md:ml-64' : ''} p-6 pt-12`}>
          <div className="max-w-[1200px] mx-auto">
            <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Selamat Datang di Dashboard Perusahaan</h1>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className={`rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.title}</p>
                      <p className={`text-2xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                      <p className={`text-sm mt-2 ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{stat.change}</p>
                    </div>
                    <div className="text-2xl">{stat.icon}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts and Applications Overview Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Application Status Overview */}
              <div className={`lg:col-span-2 rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ikhtisar Lamaran</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Diterima</p>
                    <p className="text-2xl font-bold text-green-500">18</p>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Dalam Proses</p>
                    <p className="text-2xl font-bold text-yellow-500">12</p>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ditolak</p>
                    <p className="text-2xl font-bold text-red-500">8</p>
                  </div>
                </div>

                {/* Progress and Conversion Rate */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tingkat Konversi Lamaran</span>
                    <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>65%</span>
                  </div>
                  <div className={`w-full h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>

                {/* Recent Applications */}
                <div>
                  <h3 className={`font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Lamaran Terbaru</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Budi Santoso</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>UI/UX Designer</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Disetujui</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Siti Nurhaliza</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Backend Developer</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">Dalam Proses</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ahmad Fauzi</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Data Analyst</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">Ditolak</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Rina Kartika</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Marketing Intern</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Disetujui</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Deadlines and Top Internships */}
              <div className={`rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tugas Mendatang</h2>

                <div className="mb-6">
                  <h3 className={`font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Batas Waktu Mendatang</h3>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/20' : 'bg-red-50'} border ${darkMode ? 'border-red-800' : 'border-red-200'}`}>
                    <p className={`font-medium ${darkMode ? 'text-red-300' : 'text-red-700'}`}>Program Magang Pemasaran</p>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>Batas waktu: 5 hari lagi</p>
                    <p className={`text-xs mt-2 ${darkMode ? 'text-red-500' : 'text-red-500'}`}>12 lamaran menunggu review</p>
                  </div>
                </div>

                <div>
                  <h3 className={`font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Program Terpopuler</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                          darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          1
                        </span>
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>UI/UX Designer</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>124 lamaran</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                          darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}>
                          2
                        </span>
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Backend Developer</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>98 lamaran</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                          darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-800'
                        }`}>
                          3
                        </span>
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Data Analyst</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>87 lamaran</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                          darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}>
                          4
                        </span>
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Frontend Developer</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>75 lamaran</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                          darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}>
                          5
                        </span>
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Digital Marketing</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>68 lamaran</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;