'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';

type StatCard = {
  title: string;
  value: string;
  change: string;
  icon: string;
};

type Application = {
  id: number;
  position: string;
  company: string;
  status: 'Submitted' | 'Reviewed' | 'Accepted' | 'Rejected';
  date: string;
};

const StudentDashboardPage = () => {
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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const stats: StatCard[] = [
    { title: 'Total Aplikasi', value: '8', change: '+2 bulan ini', icon: '📋' },
    { title: 'Dalam Proses', value: '3', change: '-1 bulan ini', icon: '⏳' },
  ];

  const applications: Application[] = [
    { id: 1, position: 'UI/UX Designer', company: 'PT Teknologi Maju', status: 'Accepted', date: '15 Okt 2024' },
    { id: 2, position: 'Backend Developer', company: 'PT Digital Solusi', status: 'Reviewed', date: '18 Okt 2024' },
    { id: 3, position: 'Data Analyst', company: 'PT Analitika Cerdas', status: 'Submitted', date: '20 Okt 2024' },
    { id: 4, position: 'Marketing Intern', company: 'PT Kreatif Indonesia', status: 'Rejected', date: '22 Okt 2024' },
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

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Submitted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'Reviewed': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'Accepted': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

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
              <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Dashboard Mahasiswa</div>
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
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-700'}`}>M</span>
                </div>
                <span className={`hidden md:block ${darkMode ? 'text-white' : 'text-gray-700'}`}>Budi Santoso</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        {(sidebarOpen || window.innerWidth >= 768) && (
          <div className="hidden md:block">
            <Sidebar darkMode={darkMode} />
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
            <Sidebar darkMode={darkMode} />
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${sidebarOpen ? 'md:ml-64' : ''} p-6 pt-12`}>
          <div className="max-w-[1200px] mx-auto">
            <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Selamat Datang di Dashboard Mahasiswa</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

            {/* Charts and Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Application Status Overview */}
              <div className={`lg:col-span-2 rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ikhtisar Lamaran</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900/20' : 'bg-green-50'} border ${darkMode ? 'border-green-800' : 'border-green-200'}`}>
                    <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-700'}`}>Diterima</p>
                    <p className="text-2xl font-bold text-green-500">2</p>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'} border ${darkMode ? 'border-yellow-800' : 'border-yellow-200'}`}>
                    <p className={`text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>Dalam Proses</p>
                    <p className="text-2xl font-bold text-yellow-500">3</p>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/20' : 'bg-red-50'} border ${darkMode ? 'border-red-800' : 'border-red-200'}`}>
                    <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-700'}`}>Ditolak</p>
                    <p className="text-2xl font-bold text-red-500">1</p>
                  </div>
                </div>

                {/* Progress and Conversion Rate */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tingkat Keberhasilan Lamaran</span>
                    <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>40%</span>
                  </div>
                  <div className={`w-full h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>

                {/* Recent Applications */}
                <div>
                  <h3 className={`font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Lamaran Terbaru</h3>
                  <div className="space-y-4">
                    {applications.map(app => (
                      <div key={app.id} className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {app.position} di {app.company}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{app.date}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className={`rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tindakan Cepat</h2>
                <div className="space-y-3">
                  <a href="/dashboard-student/find-internships?prefiltered=true" className={`block w-full text-left px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors`}>
                    Ajukan Lamaran Magang
                  </a>
                </div>

                {/* Follow Up on Accepted Applications */}
                <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Lanjutkan ke Wawancara</h2>
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border ${darkMode ? 'border-blue-800' : 'border-blue-200'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className={`font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>UI/UX Designer</h3>
                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Diterima</span>
                      </div>
                      <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>PT Teknologi Maju</p>
                      <div className="flex space-x-2">
                        <button className={`flex-1 py-2 rounded-lg text-sm ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}>
                          Setuju
                        </button>
                        <button className={`flex-1 py-2 rounded-lg text-sm ${darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-300 hover:bg-gray-400'} text-white`}>
                          Tunda
                        </button>
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border ${darkMode ? 'border-blue-800' : 'border-blue-200'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className={`font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>Frontend Developer</h3>
                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Diterima</span>
                      </div>
                      <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>PT Digital Solusi</p>
                      <div className="flex space-x-2">
                        <button className={`flex-1 py-2 rounded-lg text-sm ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}>
                          Setuju
                        </button>
                        <button className={`flex-1 py-2 rounded-lg text-sm ${darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-300 hover:bg-gray-400'} text-white`}>
                          Tunda
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upcoming Deadline */}
                <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Batas Waktu Mendatang</h2>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/20' : 'bg-red-50'} border ${darkMode ? 'border-red-800' : 'border-red-200'}`}>
                    <p className={`font-medium ${darkMode ? 'text-red-300' : 'text-red-700'}`}>UI/UX Designer - PT Teknologi Maju</p>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>Batas waktu: 3 hari lagi</p>
                    <p className={`text-xs mt-2 ${darkMode ? 'text-red-500' : 'text-red-500'}`}>Status: Menunggu Review</p>
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

export default StudentDashboardPage;