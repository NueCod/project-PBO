'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/authContext';
import { getStudentProfile } from '../../lib/apiService';
import { getStudentApplications } from '../../services/internshipService';
import Sidebar from '../../components/Sidebar';

type ApplicationStatus = 'Submitted' | 'Reviewed' | 'Interview' | 'Accepted' | 'Rejected';
type Application = {
  id: string; // Changed to string to match backend API
  title: string;
  company: string;
  position: string;
  appliedDate: string;
  status: ApplicationStatus;
  deadline: string;
  description: string;
  requirements: string[];
  statusDate: string;
  notes?: string;
  interview_date?: string;
  interview_time?: string;
  interview_method?: string;
  interview_location?: string;
  interview_notes?: string;
  attendance_confirmed?: boolean;
  attendance_confirmed_at?: string;
  attendance_confirmation_method?: string;
};

const MyApplicationsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    // Check system preference for dark mode
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
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

  // Toggle sidebar on mobile
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
    }
  }, []);

  const [loading, setLoading] = useState(true);

  // Fetch applications from API
  useEffect(() => {
    const fetchApplications = async () => {
      if (token) {
        try {
          setLoading(true);
          const apps = await getStudentApplications(token);
          setApplications(apps);
        } catch (error) {
          console.error('Error fetching applications:', error);
          setApplications([]); // Set to empty array in case of error
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setApplications([]); // Set to empty array if no token
      }
    };

    fetchApplications();
  }, [token]);

  // Filter applications based on status and search term
  const filteredApplications = applications.filter(app => {
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesSearch =
      app.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Function to get status color classes
  const getStatusColor = (status: ApplicationStatus) => {
    switch(status) {
      case 'Submitted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'Reviewed':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'Interview':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
      case 'Accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'Rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Function to get status message based on status
  const getStatusMessage = (status: ApplicationStatus) => {
    switch(status) {
      case 'Submitted':
        return 'Lamaran telah dikirim, dalam proses review';
      case 'Reviewed':
        return 'Lamaran sedang direview oleh perusahaan';
      case 'Interview':
        return 'Lamaran Anda lolos seleksi, silakan hadiri wawancara sesuai jadwal';
      case 'Accepted':
        return 'Lamaran Anda diterima! Selamat!';
      case 'Rejected':
        return 'Maaf, lamaran Anda tidak lolos seleksi';
      default:
        return '';
    }
  };

  const [userName, setUserName] = useState<string>('User');
  const [userEmail, setUserEmail] = useState<string>('user@example.com');
  const [userInitial, setUserInitial] = useState<string>('U');

  // State for interview details modal
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  // State for application detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailApplication, setSelectedDetailApplication] = useState<Application | null>(null);

  // Function to show interview details modal
  const showInterviewDetails = (app: Application) => {
    setSelectedApplication(app);
    setShowInterviewModal(true);
  };

  // Function to show application detail modal
  const showApplicationDetail = (app: Application) => {
    setSelectedDetailApplication(app);
    setShowDetailModal(true);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token) {
        try {
          const profile = await getStudentProfile(token);
          setUserName(profile.name || profile.email.split('@')[0]); // Gunakan nama dari profil, atau username dari email jika tidak ada
          setUserEmail(profile.email);
          setUserInitial(profile.name?.charAt(0).toUpperCase() || profile.email.charAt(0).toUpperCase());
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [token]);

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
              <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Lamaran Saya</div>
            </div>
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
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                    {userInitial}
                  </span>
                </div>
                <span className={`hidden md:block ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  {userName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        {(sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
          <div className="hidden md:block">
            <Sidebar darkMode={darkMode} userProfile={{ name: userName, email: userEmail }} />
          </div>
        )}

        {/* Mobile sidebar overlay */}
        {sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 768 && (
          <div
            className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 768 && (
          <div className="fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] md:hidden">
            <Sidebar darkMode={darkMode} userProfile={{ name: userName, email: userEmail }} />
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${sidebarOpen ? 'md:ml-64' : ''} p-6 pt-12`}>
          <div className="max-w-[1200px] mx-auto">
            <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Lamaran Saya</h1>

            {/* Filters and Search */}
            <div className={`rounded-xl p-6 shadow mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setStatusFilter('All')}
                    className={`px-4 py-2 rounded-lg ${statusFilter === 'All' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setStatusFilter('Submitted')}
                    className={`px-4 py-2 rounded-lg ${statusFilter === 'Submitted' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}
                  >
                    Dikirim
                  </button>
                  <button
                    onClick={() => setStatusFilter('Reviewed')}
                    className={`px-4 py-2 rounded-lg ${statusFilter === 'Reviewed' ? (darkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-500 text-white') : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}
                  >
                    Direview
                  </button>
                  <button
                    onClick={() => setStatusFilter('Interview')}
                    className={`px-4 py-2 rounded-lg ${statusFilter === 'Interview' ? (darkMode ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white') : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}
                  >
                    Wawancara
                  </button>
                  <button
                    onClick={() => setStatusFilter('Accepted')}
                    className={`px-4 py-2 rounded-lg ${statusFilter === 'Accepted' ? (darkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white') : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}
                  >
                    Diterima
                  </button>
                  <button
                    onClick={() => setStatusFilter('Rejected')}
                    className={`px-4 py-2 rounded-lg ${statusFilter === 'Rejected' ? (darkMode ? 'bg-red-600 text-white' : 'bg-red-500 text-white') : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}
                  >
                    Ditolak
                  </button>
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari lamaran..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full md:w-64 px-4 py-2 pl-10 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4">
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Menemukan <span className="font-semibold">{filteredApplications.length}</span> lamaran
              </p>
            </div>

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f59e0b]"></div>
              </div>
            )}

            {/* Applications List */}
            <div className="space-y-4">
              {!loading && filteredApplications.length > 0 ? (
                filteredApplications.map(app => (
                  <div
                    key={app.id}
                    className={`rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'} border-l-4 ${
                      app.status === 'Submitted' ? 'border-blue-500' :
                      app.status === 'Reviewed' ? 'border-yellow-500' :
                      app.status === 'Interview' ? 'border-purple-500' :
                      app.status === 'Accepted' ? 'border-green-500' : 'border-red-500'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{app.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium mt-1 md:mt-0 ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                        </div>

                        <p className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{app.company}</p>

                        <p className={`mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{app.description}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {app.requirements.map((req, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                            >
                              {req}
                            </span>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tanggal Lamar</p>
                            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{app.appliedDate}</p>
                          </div>
                          <div>
                            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status Tanggal</p>
                            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{app.statusDate}</p>
                          </div>
                          <div>
                            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Batas Waktu</p>
                            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{app.deadline}</p>
                          </div>
                          <div>
                            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Posisi</p>
                            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{app.position}</p>
                          </div>
                        </div>

                        {getStatusMessage(app.status) && (
                          <div className={`mt-3 p-3 rounded-lg ${
                            app.status === 'Accepted'
                              ? `${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`
                              : app.status === 'Rejected'
                                ? `${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`
                                : `${darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border`
                          }`}>
                            <p className={`text-sm ${app.status === 'Accepted' ? 'text-green-600 dark:text-green-400' : app.status === 'Rejected' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                              {getStatusMessage(app.status)}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="ml-0 md:ml-4 mt-4 md:mt-0 flex flex-col space-y-2">
                        {app.interview_date ? (
                          <>
                            <button
                              className={`${darkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white px-4 py-2 rounded-lg`}
                              onClick={() => showInterviewDetails(app)}
                            >
                              {app.status === 'Interview' ? 'Detail Wawancara' : 'Jadwal Wawancara'}
                            </button>
                            <button
                              className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${darkMode ? 'text-gray-300' : 'text-gray-700'} px-4 py-2 rounded-lg`}
                              onClick={() => showApplicationDetail(app)}
                            >
                              Detail
                            </button>
                          </>
                        ) : (
                          <button
                            className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${darkMode ? 'text-gray-300' : 'text-gray-700'} px-4 py-2 rounded-lg`}
                            onClick={() => showApplicationDetail(app)}
                          >
                            Detail
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : !loading && (
                <div className={`rounded-xl p-12 text-center ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                  <svg className={`w-16 h-16 mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className={`mt-4 text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tidak ada lamaran ditemukan</h3>
                  <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {!token ? 'Silakan login untuk melihat lamaran Anda.' : 'Tidak ada lamaran yang cocok dengan filter Anda. Coba istilah pencarian atau filter yang berbeda.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Interview Details Modal */}
        {showInterviewModal && selectedApplication && (
          <div className="fixed inset-0 backdrop-blur-md bg-black/20 dark:bg-black/40 flex items-center justify-center z-50 p-4">
            <div className={`rounded-xl shadow-lg w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Detail Wawancara</h2>
                  <button
                    onClick={() => setShowInterviewModal(false)}
                    className={`text-2xl ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    &times;
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedApplication.title}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedApplication.company}</p>
                  </div>

                  {selectedApplication.interview_date && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Jadwal Wawancara</h4>
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Tanggal: {new Date(selectedApplication.interview_date).toLocaleDateString('id-ID')}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Waktu: {selectedApplication.interview_time}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Metode: {selectedApplication.interview_method === 'online' ? 'Online (Video Conference)' : 'Offline (Datang ke Kantor)'}
                        </p>
                        {selectedApplication.interview_location && (
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Lokasi: {selectedApplication.interview_location}
                          </p>
                        )}
                        {selectedApplication.interview_notes && (
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} mt-2`}>
                            Catatan: {selectedApplication.interview_notes}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedApplication.attendance_confirmed && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className={`font-medium mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>Konfirmasi Kehadiran</h4>
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/30 border border-green-800' : 'bg-green-100 border border-green-200'}`}>
                        <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                          Status: <span className="font-semibold">Hadir</span>
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                          Dikonfirmasi: {selectedApplication.attendance_confirmed_at ? new Date(selectedApplication.attendance_confirmed_at).toLocaleString('id-ID') : 'Tidak diketahui'}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                          Metode: {selectedApplication.attendance_confirmation_method || 'Sistem'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Persyaratan Tambahan</h4>
                    <ul className="space-y-1">
                      {selectedApplication.requirements.map((req, index) => (
                        <li key={index} className={`flex items-start text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <span className="mr-2">•</span> {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowInterviewModal(false)}
                      className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      Tutup
                    </button>
                    <button
                      onClick={async () => {
                        if (!selectedApplication?.id || !token) {
                          alert('Tidak dapat mengkonfirmasi kehadiran. Silakan login kembali.');
                          return;
                        }

                        try {
                          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/applications/${selectedApplication.id}/confirm-attendance`, {
                            method: 'PATCH',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json',
                            },
                          });

                          const result = await response.json();

                          if (result.success) {
                            alert('Terima kasih! Konfirmasi kehadiran wawancara telah dikirim.');

                            // Update local state to reflect confirmation
                            setApplications(prev => prev.map(app =>
                              app.id === selectedApplication.id
                                ? {
                                    ...app,
                                    attendance_confirmed: true,
                                    attendance_confirmed_at: new Date().toISOString(),
                                    attendance_confirmation_method: 'system'
                                  }
                                : app
                            ));
                          } else {
                            alert(`Gagal mengkonfirmasi kehadiran: ${result.message || 'Terjadi kesalahan'}`);
                          }
                        } catch (error) {
                          console.error('Error confirming attendance:', error);
                          alert('Gagal mengkonfirmasi kehadiran. Silakan coba lagi.');
                        }

                        setShowInterviewModal(false);
                      }}
                      className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
                    >
                      Konfirmasi Kehadiran
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Application Detail Modal */}
        {showDetailModal && selectedDetailApplication && (
          <div className="fixed inset-0 backdrop-blur-md bg-black/20 dark:bg-black/40 flex items-center justify-center z-50 p-4">
            <div className={`rounded-xl shadow-lg w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Detail Lamaran</h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className={`text-2xl ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    &times;
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedDetailApplication.title}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedDetailApplication.company}</p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status Lamaran</h4>
                    <div className={`p-3 rounded-lg ${
                      selectedDetailApplication.status === 'Accepted'
                        ? `${darkMode ? 'bg-green-900/30 border border-green-800' : 'bg-green-100 border border-green-200'}`
                        : selectedDetailApplication.status === 'Rejected'
                          ? `${darkMode ? 'bg-red-900/30 border border-red-800' : 'bg-red-100 border border-red-200'}`
                          : `${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`
                    }`}>
                      <p className={`text-sm ${
                        selectedDetailApplication.status === 'Accepted'
                          ? `${darkMode ? 'text-green-400' : 'text-green-700'} font-semibold`
                          : selectedDetailApplication.status === 'Rejected'
                            ? `${darkMode ? 'text-red-400' : 'text-red-700'} font-semibold`
                            : `${darkMode ? 'text-gray-300' : 'text-gray-700'}`
                      }`}>
                        Status: {selectedDetailApplication.status}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tanggal Lamar: {selectedDetailApplication.appliedDate}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tanggal Status: {selectedDetailApplication.statusDate}</p>
                      {selectedDetailApplication.feedback_note && (
                        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Catatan: {selectedDetailApplication.feedback_note}
                        </p>
                      )}
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Deadline: {selectedDetailApplication.deadline}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Deskripsi Pekerjaan</h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedDetailApplication.description}</p>
                  </div>

                  <div className="pt-2">
                    <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Persyaratan</h4>
                    <ul className="space-y-1">
                      {selectedDetailApplication.requirements.map((req, index) => (
                        <li key={index} className={`flex items-start text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <span className="mr-2">•</span> {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplicationsPage;