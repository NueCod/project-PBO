// app/dashboard/manage-internships/page.tsx

'use client'; // Karena menggunakan hook useAuth dan ProtectedRoute

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/authContext'; // Impor useAuth untuk info user
import { getCompanyInternships, closeInternship, updateInternship } from '../../services/internshipService'; // Import the necessary functions
import ProtectedRoute from '../../components/auth/ProtectedRoute'; // Impor komponen proteksi
import Sidebar from '../../components/Sidebar'; // Import sidebar component

interface Internship {
  id: string;
  title: string;
  description: string;
  location: string;
  type: 'wfo' | 'wfh' | 'hybrid'; // Updated to match backend values
  deadline: string;
  requirements: any; // Requirements object
  status: 'Active' | 'Inactive' | 'Closed';
  posted: string;
  applications_count: number;
  is_active: boolean;
  salary?: string;
  isPaid: boolean;
}

const ManageInternshipsPage = () => {
  const { user, token } = useAuth(); // Dapatkan data user dan token dari context
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingInternship, setEditingInternship] = useState<Internship | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    location: '',
    jobType: 'wfo' as 'wfo' | 'wfh' | 'hybrid',
    closingDate: '',
    isPaid: false,
    salary: '',
    requirements: {
      majors: [] as string[],
      skills: [] as string[],
      duration: '',
      minSemester: ''
    }
  });

  useEffect(() => {
    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  // Detect screen size and set mobile state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkScreenSize = () => {
        setIsMobile(window.innerWidth < 768);
      };

      // Check initial size
      checkScreenSize();

      // Add event listener
      window.addEventListener('resize', checkScreenSize);

      // Cleanup
      return () => window.removeEventListener('resize', checkScreenSize);
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

  // Initialize sidebar open state based on screen size
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialIsMobile = window.innerWidth < 768;
      setIsMobile(initialIsMobile);
      setSidebarOpen(!initialIsMobile); // Open sidebar by default on desktop, closed on mobile
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        const newIsMobile = window.innerWidth < 768;
        setIsMobile(newIsMobile);
        if (newIsMobile) {
          setSidebarOpen(false); // Close sidebar on mobile
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);


  // Fetch internships posted by this company
  useEffect(() => {
    console.log('useEffect running - token:', token, 'loading:', loading); // Debug log awal
    let isMounted = true; // Flag to prevent state updates if component unmounts
    let isFetching = false; // Flag to prevent multiple simultaneous requests

    const fetchInternships = async () => {
      console.log('Before fetch condition - token:', token, 'isMounted:', isMounted, 'isFetching:', isFetching); // Debug log kondisi

      // Prevent multiple simultaneous requests
      if (token && isMounted && !isFetching) {
        isFetching = true; // Set flag to prevent another fetch
        let timeoutId: NodeJS.Timeout;
        try {
          console.log('Fetching company internships with token:', token); // Debug log
          setLoading(true);

          // Set timeout to prevent hanging requests
          const timeoutPromise = new Promise<null>((_, reject) => {
            timeoutId = setTimeout(() => {
              reject(new Error('Request timeout'));
            }, 10000); // 10 second timeout
          });

          const responsePromise = getCompanyInternships(token);

          // Race between the API call and timeout
          const data = await Promise.race([responsePromise, timeoutPromise]);

          console.log('Company internships fetched:', data); // Debug log

          // Process real data from API
          console.log('Raw data from API:', data); // Debug log

          if (isMounted && data && data.length === 0) {
            console.log('No internships found');
            setInternships([]);
          } else if (isMounted) {
            // Process real data
            const processedData = data.map(internship => {
              console.log('Processing real internship:', {
                id: internship.id,
                title: internship.title,
                type: internship.type,
                status: internship.status,
                is_active: internship.is_active,
                isMock: false
              }); // Debug log
              return {
                ...internship,
                isMock: false as const
              };
            });
            console.log('Final internships state:', processedData);
            setInternships(processedData);
          }

          // Log summary
          console.log('Internships data summary - Count:', data?.length || 0);
        } catch (error: any) {
          console.error('Error fetching company internships:', error);

          // Clear timeout to prevent memory leaks
          if (timeoutId) {
            clearTimeout(timeoutId);
          }

          // Check if the error is specifically about job not found
          if (isMounted && error.message && error.message.includes('Job not found')) {
            console.log('No jobs found for this company, initializing empty list');
            setInternships([]);
          } else if (isMounted && error.message && error.message.includes('404')) {
            // Handle 404 error specifically - this might mean company profile doesn't exist
            console.log('Company profile may not exist, showing empty list');
            setInternships([]);
            // Optionally show a message to the user about creating company profile
            console.warn('You may need to create or update your company profile first');
          } else if (isMounted) {
            // For other errors, show empty list
            setInternships([]);
          }

          // Don't hide loading until we have proper handling
        } finally {
          if (isMounted) {
            setLoading(false);
          }
          // Reset fetching flag
          isFetching = false;
          // Clear timeout to prevent memory leaks
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        }
      }
    };

    fetchInternships();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [token]); // Hanya token sebagai dependency agar tidak infinite loop

  const handleCloseJob = async (id: string) => {
    // All data now is real data (no mock data), so we can proceed directly
    if (window.confirm('Apakah Anda yakin ingin menutup lowongan ini? Lowongan tidak akan tampil lagi di pencarian.')) {
      try {
        await closeInternship(token!, id);

        // Refresh the list
        const data = await getCompanyInternships(token!);
        // Process real data
        const processedData = data.map(internship => ({
          ...internship,
          isMock: false as const
        }));
        setInternships(processedData);

        alert('Lowongan berhasil ditutup');
      } catch (error) {
        console.error('Error closing internship:', error);
        alert('Gagal menutup lowongan. Silakan coba lagi.');
      }
    }
  };

  // Function to handle view internship
  const handleViewInternship = (internship: Internship) => {
    setSelectedInternship(internship);
    setShowModal(true);
  };

  // Function to close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedInternship(null);
  };

  // Function to handle edit internship
  const handleEditInternship = (internship: Internship) => {
    console.log('Opening edit modal for internship:', internship); // Debug log

    setEditingInternship(internship);
    // Set the form data to match the internship data
    setEditFormData({
      title: internship.title,
      description: internship.description,
      location: internship.location,
      jobType: internship.type,
      closingDate: internship.deadline,
      isPaid: internship.isPaid,
      salary: internship.salary || '',
      requirements: {
        majors: internship.requirements?.majors || [],
        skills: internship.requirements?.skills || [],
        duration: internship.requirements?.duration || '',
        minSemester: internship.requirements?.minSemester || ''
      }
    });

    setShowEditModal(true);
  };

  // Function to close edit modal
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingInternship(null);
    // Reset the form
    setEditFormData({
      title: '',
      description: '',
      location: '',
      jobType: 'wfo',
      closingDate: '',
      isPaid: false,
      salary: '',
      requirements: {
        majors: [],
        skills: [],
        duration: '',
        minSemester: ''
      }
    });
  };

  // Function to handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    if (name.startsWith('requirements.')) {
      const requirementField = name.split('.')[1] as keyof typeof editFormData.requirements;
      setEditFormData(prev => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          [requirementField]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name === 'jobType') {
      // Special handling for jobType since it's a specific enum type
      setEditFormData(prev => ({
        ...prev,
        [name]: value as 'wfo' | 'wfh' | 'hybrid'
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Function to handle array input changes (majors and skills)
  const handleArrayInputChange = (field: 'majors' | 'skills', value: string) => {
    if (!value.trim()) return;

    setEditFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [field]: [...prev.requirements[field], value.trim()]
      }
    }));
  };

  // Function to remove item from array
  const removeArrayItem = (field: 'majors' | 'skills', index: number) => {
    setEditFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [field]: prev.requirements[field].filter((_, i) => i !== index)
      }
    }));
  };

  // Function to handle form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingInternship || !token) return;

    // Basic validation
    if (!editFormData.title.trim()) {
      alert('Judul program magang wajib diisi');
      return;
    }

    if (!editFormData.description.trim()) {
      alert('Deskripsi program magang wajib diisi');
      return;
    }

    if (!editFormData.location.trim()) {
      alert('Lokasi program magang wajib diisi');
      return;
    }

    if (!editFormData.closingDate) {
      alert('Batas akhir pendaftaran wajib diisi');
      return;
    }

    if (!editFormData.requirements.duration) {
      alert('Durasi magang wajib diisi');
      return;
    }

    if (editFormData.isPaid && !editFormData.salary) {
      alert('Mohon isi besaran gaji');
      return;
    }

    // Debug: Log comprehensive information about the internship being updated
    console.log('=== EDIT SUBMISSION DEBUG INFO ===');
    console.log('Editing internship object:', editingInternship);
    console.log('Editing internship ID:', editingInternship.id);
    console.log('Editing internship isMock:', editingInternship.isMock);
    console.log('Current internships in state:', internships);
    console.log('Token available:', !!token);
    console.log('Edit form data:', editFormData);
    console.log('==============================');


    try {
      // Prepare the updated data in the format expected by the API
      const updatedData = {
        title: editFormData.title,
        description: editFormData.description,
        duration: editFormData.requirements.duration,
        location: editFormData.location,
        jobType: editFormData.jobType,
        closingDate: editFormData.closingDate,
        isPaid: editFormData.isPaid,
        salary: editFormData.salary,
        requirements: {
          majors: editFormData.requirements.majors,
          skills: editFormData.requirements.skills,
          gpa: editingInternship.requirements?.gpa || '', // Keep existing value if not edited
          other: editingInternship.requirements?.other || '', // Keep existing value if not edited
          minSemester: editFormData.requirements.minSemester,
          duration: editFormData.requirements.duration,
          is_paid: editFormData.isPaid ? 'paid' : 'unpaid', // Backend expects 'paid' or 'unpaid'
          salary: editFormData.salary
        }
      };

      console.log('Sending update request with ID:', editingInternship.id, 'and data:', updatedData); // Debug log

      // Update the internship using the service
      const result = await updateInternship(token, editingInternship.id, updatedData);
      console.log('Update result:', result); // Debug log

      // Refresh the list
      const data = await getCompanyInternships(token);
      // Add isMock flag to real data (false)
      const realDataWithFlag = data.map(internship => ({
        ...internship,
        isMock: false as const
      }));
      setInternships(realDataWithFlag);

      // Close the modal
      closeEditModal();
      alert('Program magang berhasil diperbarui');
    } catch (error: any) {
      console.error('Error updating internship:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });

      // Provide more specific error feedback
      let errorMessage = 'Gagal memperbarui program magang. Silakan coba lagi.';

      // Check if the error is specifically about job not found
      if (error.message && error.message.includes('Job not found')) {
        errorMessage = 'Program magang tidak ditemukan. Mungkin telah dihapus atau terjadi kesalahan sistem.';
      } else if (error.message) {
        errorMessage += ` Detail: ${error.message}`;
      }

      alert(errorMessage);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['company']}> {/* Hanya izinkan role 'company' */}
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
                <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Kelola Program Magang</div>
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
          {(sidebarOpen || !isMobile) && (
            <div className="hidden md:block">
              <Sidebar darkMode={darkMode} />
            </div>
          )}

          {/* Mobile sidebar overlay */}
          {sidebarOpen && isMobile && (
            <div
              className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
              onClick={() => setSidebarOpen(false)}
            ></div>
          )}

          {sidebarOpen && isMobile && (
            <div className="fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] md:hidden">
              <Sidebar darkMode={darkMode} />
            </div>
          )}

          {/* Main Content */}
          <main className={`flex-1 ${sidebarOpen ? 'md:ml-64' : ''} p-6 pt-12`}>
            <div className="max-w-[1200px] mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold">Kelola Program Magang</h1>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Manajemen semua program magang yang telah Anda buat
                  </p>
                  <div>
                    <a href="/dashboard/create-internship" className="bg-[#f59e0b] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#d97706] transition-colors">
                      Buat Program Magang Baru
                    </a>
                  </div>
                </div>
              </div>

              {/* Company's posted internships section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Program Magang Saya</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {internships.length > 0
                        ? 'Catatan: Refresh untuk melihat program yang baru dibuat'
                        : 'Catatan: Program yang baru dibuat mungkin perlu direfresh untuk muncul di sini'}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        const fetchInternships = async () => {
                          // Don't fetch if loading to avoid multiple requests
                          if (token && !loading) {
                            let timeoutId: NodeJS.Timeout;
                            try {
                              console.log('Refreshing company internships...'); // Debug log
                              setLoading(true);

                              // Set timeout to prevent hanging requests
                              const timeoutPromise = new Promise<null>((_, reject) => {
                                timeoutId = setTimeout(() => {
                                  reject(new Error('Request timeout'));
                                }, 10000); // 10 second timeout
                              });

                              const responsePromise = getCompanyInternships(token);

                              // Race between the API call and timeout
                              const data = await Promise.race([responsePromise, timeoutPromise]);

                              console.log('Refreshed company internships:', data); // Debug log
                              // Process real data
                              const processedData = data.map(internship => {
                                console.log('Refreshing internship:', {
                                  id: internship.id,
                                  title: internship.title,
                                  status: internship.status,
                                  is_active: internship.is_active,
                                  isMock: false
                                }); // Debug log
                                return {
                                  ...internship,
                                  isMock: false as const
                                };
                              });
                              setInternships(processedData);
                            } catch (error: any) {
                              console.error('Error fetching company internships:', error);

                              // Clear timeout to prevent memory leaks
                              if (timeoutId) {
                                clearTimeout(timeoutId);
                              }

                              // Handle the same error types as in the main fetch
                              if (error.message && error.message.includes('Job not found')) {
                                console.log('No jobs found for this company during refresh');
                                setInternships([]);
                              } else if (error.message && error.message.includes('404')) {
                                console.log('Company profile may not exist during refresh');
                                setInternships([]);
                              } else {
                                // For other errors, maintain current list or show empty
                                // We don't want to lose existing data for transient errors
                              }
                            } finally {
                              setLoading(false);
                              // Clear timeout to prevent memory leaks
                              if (timeoutId) {
                                clearTimeout(timeoutId);
                              }
                            }
                          }
                        };
                        fetchInternships();
                      }}
                      disabled={loading}
                      className={`flex items-center px-3 py-1.5 text-sm rounded ${
                        loading
                          ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                          : darkMode
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                      } transition-colors`}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </>
                      )}
                      Segarkan
                    </button>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total: {internships.length} program
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#f59e0b]"></div>
                  </div>
                ) : internships.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
                    <table className="min-w-full bg-white border-collapse dark:bg-gray-800">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700">
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b">Judul</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b">Lokasi</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b">Tipe</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b">Durasi</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b">Bayar</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b">Batas Akhir</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b">Status</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b">Pelamar</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {internships.map((internship) => (
                          <tr
                            key={internship.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b dark:border-gray-700"
                          >
                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{internship.title}</td>
                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{internship.location}</td>
                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                              {internship.type === 'wfo' ? 'WFO' :
                               internship.type === 'wfh' ? 'WFH' :
                               'Hybrid'}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                              {internship.requirements?.duration || '-'} bulan
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <span className={`px-1.5 py-0.5 rounded text-xs ${
                                internship.isPaid
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              }`}>
                                {internship.isPaid ? 'Berbayar' : 'Tidak'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                              {new Date(internship.deadline).toLocaleDateString('id-ID')}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  internship.status === 'Active' || internship.is_active
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                }`}
                              >
                                {internship.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{internship.applications_count}</td>
                            <td className="py-3 px-4 text-sm">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditInternship(internship)}
                                  className={`px-3 py-1 rounded text-xs ${
                                    (internship.status === 'Active' || internship.is_active)
                                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white'  // Kuning untuk aktif
                                      : 'bg-gray-300 text-gray-700 cursor-not-allowed'  // Abu2 untuk tidak aktif
                                  }`}
                                  disabled={!(internship.status === 'Active' || internship.is_active)}
                                >
                                  Edit
                                </button>
                                <button
                                  className={`px-3 py-1 rounded text-xs ${
                                    (internship.status === 'Active' || internship.is_active)
                                      ? 'bg-red-500 hover:bg-red-600 text-white'  // Merah untuk aktif
                                      : 'bg-gray-300 text-gray-700 cursor-not-allowed'  // Abu2 untuk tidak aktif
                                  }`}
                                  onClick={() => handleCloseJob(internship.id)}
                                  disabled={!(internship.status === 'Active' || internship.is_active)}
                                >
                                  Tutup
                                </button>
                                <button
                                  onClick={() => handleViewInternship(internship)}
                                  className={`px-3 py-1 rounded text-xs ${
                                    internship.isMock
                                      ? 'bg-gray-400 hover:bg-gray-500 text-white'
                                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                                  }`}
                                >
                                  Lihat
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-8 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Belum ada program magang</h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                      Anda belum memposting program magang apapun.
                    </p>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Jika program tidak muncul setelah dibuat, mungkin perlu lengkapi profil perusahaan terlebih dahulu.
                    </div>
                    <div className="mt-6">
                      <a
                        href="/dashboard/create-internship"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#f59e0b] hover:bg-[#d97706] focus:outline-none"
                      >
                        Buat Program Magang Pertama
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium mb-4">Statistik Program Magang</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className="text-2xl font-bold">{internships.length}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Program</p>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className="text-2xl font-bold">
                      {internships.reduce((sum, internship) => sum + internship.applications_count, 0)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Pelamar</p>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className="text-2xl font-bold">
                      {internships.filter(i => i.status === 'Active').length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Aktif Saat Ini</p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Modal for viewing internship details */}
      {showModal && selectedInternship && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-6 shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-start mb-4">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedInternship.title}
              </h2>
              <button
                onClick={closeModal}
                className={`text-gray-500 hover:text-gray-700 ${darkMode ? 'text-gray-400 hover:text-gray-300' : ''}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Lokasi</h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedInternship.location}</p>
                </div>
                <div>
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tipe</h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedInternship.type === 'wfo' ? 'WFO (Work From Office)' :
                     selectedInternship.type === 'wfh' ? 'WFH (Work From Home)' :
                     'Hybrid'}
                  </p>
                </div>
                <div>
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Durasi</h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedInternship.requirements?.duration || '-'} bulan
                  </p>
                </div>
                <div>
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status Pembayaran</h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedInternship.isPaid ? 'Berbayar' : 'Tidak Berbayar'}
                  </p>
                </div>
                <div>
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Batas Akhir</h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {new Date(selectedInternship.deadline).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div>
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedInternship.status}
                  </p>
                </div>
                <div>
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tanggal Posting</h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {new Date(selectedInternship.posted).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div>
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Jumlah Pelamar</h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedInternship.applications_count}
                  </p>
                </div>
              </div>

              <div>
                <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Deskripsi</h3>
                <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedInternship.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Jurusan yang Dicari</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {(selectedInternship.requirements?.majors || []).map((major, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {major}
                      </span>
                    ))}
                    {(!selectedInternship.requirements?.majors || selectedInternship.requirements.majors.length === 0) && (
                      <span className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                        Tidak ada spesifikasi
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Keterampilan yang Dicari</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {(selectedInternship.requirements?.skills || []).map((skill, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {skill}
                      </span>
                    ))}
                    {(!selectedInternship.requirements?.skills || selectedInternship.requirements.skills.length === 0) && (
                      <span className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                        Tidak ada spesifikasi
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Gaji</h3>
                <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedInternship.salary || 'Tidak disebutkan'}
                </p>
              </div>

              <div>
                <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Persyaratan Lain</h3>
                <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedInternship.requirements?.other || 'Tidak ada persyaratan tambahan'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for editing internship */}
      {showEditModal && editingInternship && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-6 shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-start mb-4">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Edit Program Magang: {editingInternship.title}
              </h2>
              <button
                onClick={closeEditModal}
                className={`text-gray-500 hover:text-gray-700 ${darkMode ? 'text-gray-400 hover:text-gray-300' : ''}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Judul Posisi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={editFormData.title}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                    }`}
                    placeholder="Contoh: Program Magang Pemasaran Digital"
                  />
                </div>

                <div>
                  <label htmlFor="jobType" className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Tipe Magang <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="jobType"
                    name="jobType"
                    value={editFormData.jobType}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                    }`}
                  >
                    <option value="wfo">WFO (Work From Office)</option>
                    <option value="wfh">WFH (Work From Home)</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="location" className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Lokasi
                  </label>
                  <select
                    id="location"
                    name="location"
                    value={editFormData.location}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                    }`}
                  >
                    <option value="">Pilih Lokasi</option>
                    <option value="Jakarta">Jakarta</option>
                    <option value="Surabaya">Surabaya</option>
                    <option value="Bandung">Bandung</option>
                    <option value="Yogyakarta">Yogyakarta</option>
                    <option value="Medan">Medan</option>
                    <option value="Makassar">Makassar</option>
                    <option value="Semarang">Semarang</option>
                    <option value="Malang">Malang</option>
                    <option value="Bali">Bali</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="closingDate" className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Batas Akhir Pendaftaran <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="closingDate"
                    name="closingDate"
                    value={editFormData.closingDate}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                    }`}
                  />
                </div>

                <div>
                  <label htmlFor="duration" className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Durasi Magang (bulan) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="requirements.duration"
                    value={editFormData.requirements.duration}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                    }`}
                    placeholder="Contoh: 3, 6"
                  />
                </div>

                <div>
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Status Gaji
                  </label>
                  <div className="flex space-x-4">
                    <label
                      className={`flex items-center px-4 py-3 rounded-lg border cursor-pointer transition-colors w-full text-center ${
                        !editFormData.isPaid
                          ? (darkMode ? 'border-[#f59e0b] bg-[#f59e0b]/10 text-[#f59e0b]' : 'border-[#f59e0b] bg-[#fef3c7] text-[#f59e0b]')
                          : (darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-white text-gray-700')
                      }`}
                    >
                      <input
                        type="radio"
                        name="isPaid"
                        checked={!editFormData.isPaid}
                        onChange={() => setEditFormData(prev => ({...prev, isPaid: false}))}
                        className="hidden"
                      />
                      <span className="mx-auto font-medium">Unpaid</span>
                    </label>
                    <label
                      className={`flex items-center px-4 py-3 rounded-lg border cursor-pointer transition-colors w-full text-center ${
                        editFormData.isPaid
                          ? (darkMode ? 'border-[#f59e0b] bg-[#f59e0b]/10 text-[#f59e0b]' : 'border-[#f59e0b] bg-[#fef3c7] text-[#f59e0b]')
                          : (darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-white text-gray-700')
                      }`}
                    >
                      <input
                        type="radio"
                        name="isPaid"
                        checked={editFormData.isPaid}
                        onChange={() => setEditFormData(prev => ({...prev, isPaid: true}))}
                        className="hidden"
                      />
                      <span className="mx-auto font-medium">Paid</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="description" className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Deskripsi Pekerjaan <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={editFormData.description}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                  }`}
                  placeholder="Jelaskan tentang program magang, tanggung jawab utama, dan pengalaman yang akan didapatkan oleh peserta magang..."
                ></textarea>
              </div>

              {/* Salary Field - Only shown when isPaid is true */}
              {editFormData.isPaid && (
                <div className="mb-6 p-4 rounded-lg border border-dashed border-[#f59e0b] bg-[#f59e0b]/10 dark:bg-[#f59e0b]/10">
                  <div>
                    <label htmlFor="salary" className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Besaran Gaji <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="salary"
                      name="salary"
                      value={editFormData.salary}
                      onChange={handleInputChange}
                      required={editFormData.isPaid}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                      }`}
                      placeholder="Contoh: 1.500.000 IDR per bulan"
                    />
                    <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Format bebas, contoh: "Rp 1.500.000 per bulan"
                    </p>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Persyaratan <span className="text-red-500">*</span>
                </h3>

                {/* Majors Field */}
                <div className="mb-4">
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Jurusan (Bidang Studi)
                  </label>
                  <select
                    id="majorInput"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                    }`}
                    value=""
                    onChange={(e) => {
                      if (e.target.value && !editFormData.requirements.majors.includes(e.target.value)) {
                        handleArrayInputChange('majors', e.target.value);
                        // Reset selection after adding
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">Pilih Jurusan</option>
                    <option value="Teknik Informatika">Teknik Informatika</option>
                    <option value="Sistem Informasi">Sistem Informasi</option>
                    <option value="Teknik Elektro">Teknik Elektro</option>
                    <option value="Teknik Industri">Teknik Industri</option>
                    <option value="Desain Komunikasi Visual">Desain Komunikasi Visual</option>
                    <option value="Ilmu Komunikasi">Ilmu Komunikasi</option>
                    <option value="Manajemen">Manajemen</option>
                    <option value="Akuntansi">Akuntansi</option>
                    <option value="Teknik Mesin">Teknik Mesin</option>
                    <option value="Psikologi">Psikologi</option>
                    <option value="Hukum">Hukum</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {editFormData.requirements.majors.map((major, index) => (
                      <div
                        key={index}
                        className={`flex items-center px-3 py-1 rounded-full text-sm ${
                          darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {major}
                        <button
                          type="button"
                          className="ml-2 text-red-500 hover:text-red-700"
                          onClick={() => removeArrayItem('majors', index)}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills Field */}
                <div className="mb-4">
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Keterampilan
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      id="skillInput"
                      className={`flex-1 px-4 py-3 rounded-l-lg border ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                      }`}
                      placeholder="Tambahkan keterampilan (misal: JavaScript, Desain Grafis)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                          e.preventDefault();
                          handleArrayInputChange('skills', (e.target as HTMLInputElement).value.trim());
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="bg-[#f59e0b] text-white px-4 rounded-r-lg font-medium hover:bg-[#d97706] transition-colors"
                      onClick={() => {
                        const input = document.getElementById('skillInput') as HTMLInputElement;
                        if (input.value.trim()) {
                          handleArrayInputChange('skills', input.value.trim());
                          input.value = '';
                        }
                      }}
                    >
                      Tambah
                    </button>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {editFormData.requirements.skills.map((skill, index) => (
                      <div
                        key={index}
                        className={`flex items-center px-3 py-1 rounded-full text-sm ${
                          darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {skill}
                        <button
                          type="button"
                          className="ml-2 text-red-500 hover:text-red-700"
                          onClick={() => removeArrayItem('skills', index)}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Minimal Semester Field */}
                <div className="mb-4">
                  <label htmlFor="minSemester" className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Minimal Semester
                  </label>
                  <select
                    id="minSemester"
                    value={editFormData.requirements.minSemester}
                    onChange={(e) => setEditFormData(prev => ({
                      ...prev,
                      requirements: {
                        ...prev.requirements,
                        minSemester: e.target.value
                      }
                    }))}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                    }`}
                  >
                    <option value="">Pilih Minimal Semester</option>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                    <option value="3">Semester 3</option>
                    <option value="4">Semester 4</option>
                    <option value="5">Semester 5</option>
                    <option value="6">Semester 6</option>
                    <option value="7">Semester 7</option>
                    <option value="8">Semester 8</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    darkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#f59e0b] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#d97706] transition-colors"
                >
                  Perbarui Program Magang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
};

export default ManageInternshipsPage;