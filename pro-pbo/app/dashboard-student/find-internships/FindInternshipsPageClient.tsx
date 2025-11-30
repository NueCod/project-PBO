'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/authContext';
import { getStudentProfile } from '../../lib/apiService';
import { getAllInternships } from '../../services/internshipService';
import Sidebar from '../../components/Sidebar';

type Internship = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'wfo' | 'wfh' | 'hybrid'; // Updated to match backend values
  duration: string;
  posted: string;
  deadline: string;
  description: string;
  requirements: string[]; // Array of requirements
  status: 'Open' | 'Closed' | 'Filled';
  tags: string[]; // Array of tags/skills
  paid: 'paid' | 'unpaid';
  minSemester: number;
  salary?: string;
  isPaid: boolean;
  salaryAmount?: string;
};

const FindInternshipsPageClient = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [internshipsList, setInternshipsList] = useState<Internship[]>([]);
  const [skillFilter, setSkillFilter] = useState('');
  const [majorFilter, setMajorFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const { token } = useAuth();

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

  // Initialize mobile detection and set initial state
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on mount
    if (typeof window !== 'undefined') {
      checkMobile();

      // Add resize listener
      window.addEventListener('resize', checkMobile);

      // Clean up listener on unmount
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // Fetch internships from API
  const fetchInternships = async () => {
    try {
      setLoading(true);
      const data = await getAllInternships();
      setInternshipsList(data);
    } catch (error) {
      console.error('Error fetching internships:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch internships when component mounts
  useEffect(() => {
    fetchInternships();
  }, []);

  // Expose fetchInternships function to parent or for manual calls
  useEffect(() => {
    // This effect can be extended to respond to certain events
    // For example, we could listen to a custom event or a query parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('refresh') === 'true') {
      fetchInternships();
    }
  }, []);

  // State for user profile
  const [userName, setUserName] = useState<string>('User');
  const [userEmail, setUserEmail] = useState<string>('user@example.com');
  const [userInitial, setUserInitial] = useState<string>('U');

  // Fetch user profile to get name
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

  // Filter internships based on search and filters
  const filteredInternships = (internshipsList || []).filter(internship => {
    const matchesSearch =
      internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation =
      locationFilter === '' ||
      internship.location.toLowerCase().includes(locationFilter.toLowerCase());

    const matchesType =
      typeFilter === 'all' ||
      internship.type.toLowerCase() === typeFilter.toLowerCase();

    // Additional filters based on skills/requirements (handle comma-separated values)
    let matchesSkills = skillFilter === '';
    if (skillFilter !== '') {
      const skillList = skillFilter.split(',').map(s => s.trim().toLowerCase());
      matchesSkills = (internship.requirements || []).some(req =>
        skillList.some(skill => req.toLowerCase().includes(skill.toLowerCase()) ||
                  skill.toLowerCase().includes(req.toLowerCase()))
      );
    }

    // Additional filters based on major (check against requirements array)
    let matchesMajor = majorFilter === '';
    if (majorFilter !== '') {
      const majorList = majorFilter.split(',').map(m => m.trim().toLowerCase());
      matchesMajor = (internship.requirements || []).some(req =>
        majorList.some(major => req.toLowerCase().includes(major.toLowerCase()) ||
                  major.toLowerCase().includes(req.toLowerCase()))
      );
    }

    // Additional filter for semester - user's current semester should meet or exceed the minimum requirement
    let matchesSemester = semesterFilter === '' || (parseInt(semesterFilter) || 0) >= internship.minSemester;

    // Additional filter for paid/unpaid status
    let matchesStatus = statusFilter === '' || internship.paid === statusFilter;

    return matchesSearch && matchesLocation && matchesType && matchesSkills && matchesMajor && matchesSemester && matchesStatus;
  });

  const { user } = useAuth();

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
              <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Cari Magang</div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1z" clipRule="evenodd" />
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
        {(sidebarOpen || !isMobile) && (
          <div className="hidden md:block">
            <Sidebar darkMode={darkMode} userProfile={{ name: userName, email: userEmail }} />
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
            <Sidebar darkMode={darkMode} userProfile={{ name: userName, email: userEmail }} />
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${sidebarOpen ? 'md:ml-64' : ''} p-6 pt-12`}>
          <div className="max-w-[1200px] mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Cari Program Magang</h1>
              <button
                onClick={fetchInternships}
                disabled={loading}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  loading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : darkMode
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-blue-500 hover:bg-blue-600'
                } text-white transition-colors`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memuat...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Segarkan
                  </>
                )}
              </button>
            </div>

            {/* Search and Filters */}
            <div className={`rounded-xl p-6 shadow mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="search" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cari Magang</label>
                  <div className="relative">
                    <input
                      type="text"
                      id="search"
                      placeholder="Cari judul, perusahaan, atau keterangan..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full px-4 py-2 pl-10 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <div className="absolute left-3 top-2.5 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="location" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Lokasi</label>
                  <select
                    id="location"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Semua Lokasi</option>
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
                  <label htmlFor="type" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tipe</label>
                  <select
                    id="type"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="all">Semua Tipe</option>
                    <option value="wfo">WFO</option>
                    <option value="wfh">WFH</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                
                {/* Additional Filters Row */}
                <div className="md:col-span-2">
                  <label htmlFor="skills" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Keahlian</label>
                  <input
                    type="text"
                    id="skills"
                    placeholder="Figma, JavaScript, Python, dll"
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div>
                  <label htmlFor="semester" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Min. Semester</label>
                  <select
                    id="semester"
                    value={semesterFilter}
                    onChange={(e) => setSemesterFilter(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Semua Semester</option>
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

                <div>
                  <label htmlFor="status" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                  <select
                    id="status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Semua Status</option>
                    <option value="paid">Berbayar</option>
                    <option value="unpaid">Tidak Berbayar</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4">
              {!loading && (
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Menemukan <span className="font-semibold">{filteredInternships.length}</span> program magang
                </p>
              )}
            </div>

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f59e0b]"></div>
              </div>
            )}

            {/* Internship Listings */}
            <div className="space-y-4">
              {!loading && (filteredInternships || []).length > 0 ? (
                (filteredInternships || []).map(internship => (
                  <div
                    key={internship.id}
                    className={`rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${internship.status === 'Closed' ? (darkMode ? 'border-red-700' : 'border-red-300') : (darkMode ? 'border-gray-700' : 'border-gray-200')}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{internship.title}</h3>
                          {internship.status === 'Closed' && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${darkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'}`}>
                              Ditutup
                            </span>
                          )}
                        </div>
                        
                        <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{internship.company}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {internship.location}
                          </span>
                          <span className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {internship.type === 'wfo' ? 'WFO' :
                             internship.type === 'wfh' ? 'WFH' :
                             'Hybrid'}
                          </span>
                          <span className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {internship.duration}
                          </span>
                        </div>
                        
                        <p className={`mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{internship.description}</p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {(internship.tags || []).map((tag, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${internship.paid === 'paid' ? (darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800') : (darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800')}`}>
                            {internship.paid === 'paid' ? 'Berbayar' : 'Tidak Berbayar'}
                          </span>
                          {internship.salary && (
                            <span className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'}`}>
                              {internship.salary}
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800'}`}>
                            Minimal: Smt {internship.minSemester}
                          </span>
                          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Berakhir: {internship.deadline}</span>
                          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Diposting: {internship.posted}</span>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex flex-col items-center">
                        <a href={`/dashboard-student/find-internships/${internship.id}`}>
                          <button
                            className={`px-4 py-2 rounded-lg mb-2 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
                            disabled={internship.status === 'Closed'}
                          >
                            Lamar
                          </button>
                        </a>
                        <button className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} transition-colors`}>
                          Detail
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Persyaratan:</h4>
                      <ul className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {(internship.requirements || []).map((req, index) => (
                          <li key={index} className="flex items-center">
                            <svg className={`w-4 h-4 mr-1.5 ${darkMode ? 'text-green-400' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              ) : !loading ? (
                <div className={`rounded-xl p-12 text-center ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                  <svg className={`w-16 h-16 mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className={`mt-4 text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tidak ada magang ditemukan</h3>
                  <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Tidak ada magang yang cocok dengan pencarian Anda. Coba istilah pencarian atau filter yang berbeda.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FindInternshipsPageClient;