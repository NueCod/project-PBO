'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';

type Internship = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: 'On-site' | 'Remote' | 'Hybrid';
  duration: string;
  posted: string;
  deadline: string;
  description: string;
  requirements: string[];
  status: 'Open' | 'Closed' | 'Filled';
  tags: string[];
};

type FindInternshipsPageClientProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

const FindInternshipsPageClient = ({ searchParams }: FindInternshipsPageClientProps) => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [internships, setInternships] = useState<Internship[]>([]);
  const [skillFilter, setSkillFilter] = useState('');
  const [majorFilter, setMajorFilter] = useState('');
  const [specificationFilter, setSpecificationFilter] = useState('');

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

  // Sample internship data
  useEffect(() => {
    const mockInternships: Internship[] = [
      {
        id: 1,
        title: 'UI/UX Designer',
        company: 'PT Teknologi Maju',
        location: 'Jakarta',
        type: 'Hybrid',
        duration: '6 months',
        posted: '2024-10-15',
        deadline: '2024-11-30',
        description: 'Looking for a creative UI/UX designer to join our team and help design user-friendly interfaces for our products.',
        requirements: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
        status: 'Open',
        tags: ['Design', 'Technology']
      },
      {
        id: 2,
        title: 'Backend Developer',
        company: 'PT Digital Solusi',
        location: 'Bandung',
        type: 'On-site',
        duration: '4 months',
        posted: '2024-10-18',
        deadline: '2024-11-25',
        description: 'Join our backend team to develop and maintain server-side applications using modern technologies.',
        requirements: ['Node.js', 'Python', 'API Development', 'Database Design'],
        status: 'Open',
        tags: ['Technology', 'Engineering']
      },
      {
        id: 3,
        title: 'Marketing Intern',
        company: 'PT Kreatif Indonesia',
        location: 'Surabaya',
        type: 'On-site',
        duration: '3 months',
        posted: '2024-10-22',
        deadline: '2024-12-05',
        description: 'Assist our marketing team in developing campaigns and analyzing market trends.',
        requirements: ['Social Media', 'Content Creation', 'Marketing Strategy', 'Analytics'],
        status: 'Open',
        tags: ['Marketing', 'Business']
      },
      {
        id: 4,
        title: 'Data Analyst',
        company: 'PT Analitika Cerdas',
        location: 'Remote',
        type: 'Remote',
        duration: '6 months',
        posted: '2024-10-20',
        deadline: '2024-12-10',
        description: 'Analyze business data to provide actionable insights and recommendations for decision making.',
        requirements: ['SQL', 'Python', 'Data Visualization', 'Statistical Analysis'],
        status: 'Open',
        tags: ['Data', 'Analytics']
      },
      {
        id: 5,
        title: 'Frontend Developer',
        company: 'PT Web Inovasi',
        location: 'Yogyakarta',
        type: 'Hybrid',
        duration: '5 months',
        posted: '2024-10-25',
        deadline: '2024-11-20',
        description: 'Work on the frontend development of our web applications using modern JavaScript frameworks.',
        requirements: ['React', 'JavaScript', 'CSS', 'Responsive Design'],
        status: 'Closed',
        tags: ['Technology', 'Web Development']
      }
    ];
    setInternships(mockInternships);
  }, []);

  // Mock function to get student profile data
  const getStudentProfile = async () => {
    // In a real application, this would fetch from an API
    return {
      id: 'student-1',
      name: 'Budi Santoso',
      email: 'budi.santoso@example.com',
      university: 'Universitas Indonesia',
      major: 'Teknik Informatika',
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'UI/UX Design'],
      location: 'Jakarta',
      interests: ['Web Development', 'Mobile Apps'],
      experience: ['Frontend Developer Intern', 'UI Design Freelancer'],
      education: ['S1 Teknik Informatika, UI', 'SMA Jurusan IPA'],
    };
  };

  // Initialize filters from query parameters when page loads
  useEffect(() => {
    const initializeFilters = async () => {
      if (searchParams?.prefiltered === 'true') {
        const profile = await getStudentProfile();
        setLocationFilter(profile.location); // Student's location
        setSkillFilter(profile.skills.join(',')); // Student's skills
        setMajorFilter(profile.major); // Student's major
        setSpecificationFilter(profile.interests.join(',')); // Student's interests
      } else {
        // Clear filters if not prefiltering
        setLocationFilter('');
        setSkillFilter('');
        setMajorFilter('');
        setSpecificationFilter('');
      }
    };

    initializeFilters();
  }, [searchParams]);

  // Filter internships based on search and filters
  const filteredInternships = internships.filter(internship => {
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
      matchesSkills = internship.requirements.some(req =>
        skillList.some(skill => req.toLowerCase().includes(skill.toLowerCase()) ||
                  skill.toLowerCase().includes(req.toLowerCase()))
      );
    }

    // Additional filters based on specifications (majors, fields, etc.) (handle comma-separated values)
    let matchesSpecification = specificationFilter === '';
    if (specificationFilter !== '') {
      const specList = specificationFilter.split(',').map(s => s.trim().toLowerCase());
      matchesSpecification = internship.tags.some(tag =>
        specList.some(spec => tag.toLowerCase().includes(spec.toLowerCase()) ||
                   spec.toLowerCase().includes(tag.toLowerCase()))
      );
    }

    // Additional filters based on major (handle comma-separated values)
    let matchesMajor = majorFilter === '';
    if (majorFilter !== '') {
      const majorList = majorFilter.split(',').map(m => m.trim().toLowerCase());
      matchesMajor = majorList.some(major =>
        major.toLowerCase().includes(internship.title.toLowerCase()) ||
        internship.title.toLowerCase().includes(major.toLowerCase()) ||
        major.toLowerCase().includes(internship.description.toLowerCase()) ||
        internship.description.toLowerCase().includes(major.toLowerCase())
      );
    }

    return matchesSearch && matchesLocation && matchesType && matchesSkills && matchesSpecification && matchesMajor;
  });

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
            <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Cari Program Magang</h1>

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
                  <input
                    type="text"
                    id="location"
                    placeholder="Kota atau wilayah"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
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
                    <option value="on-site">On-site</option>
                    <option value="remote">Remote</option>
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
                  <label htmlFor="specification" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Spesifikasi</label>
                  <input
                    type="text"
                    id="specification"
                    placeholder="Teknologi, Design, dll"
                    value={specificationFilter}
                    onChange={(e) => setSpecificationFilter(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                
                <div>
                  <label htmlFor="major" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Jurusan</label>
                  <input
                    type="text"
                    id="major"
                    placeholder="Teknik Informatika, Desain Grafis, dll"
                    value={majorFilter}
                    onChange={(e) => setMajorFilter(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4">
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Menemukan <span className="font-semibold">{filteredInternships.length}</span> program magang
              </p>
            </div>

            {/* Internship Listings */}
            <div className="space-y-4">
              {filteredInternships.length > 0 ? (
                filteredInternships.map(internship => (
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
                            {internship.type}
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
                          {internship.tags.map((tag, index) => (
                            <span 
                              key={index} 
                              className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-3 text-sm">
                          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Berakhir: {internship.deadline}</span>
                          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Diposting: {internship.posted}</span>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex flex-col items-center">
                        <button 
                          className={`px-4 py-2 rounded-lg mb-2 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
                          disabled={internship.status === 'Closed'}
                        >
                          Lamar
                        </button>
                        <button className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} transition-colors`}>
                          Detail
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Persyaratan:</h4>
                      <ul className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {internship.requirements.map((req, index) => (
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
              ) : (
                <div className={`rounded-xl p-12 text-center ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                  <svg className={`w-16 h-16 mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className={`mt-4 text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tidak ada magang ditemukan</h3>
                  <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Tidak ada magang yang cocok dengan pencarian Anda. Coba istilah pencarian atau filter yang berbeda.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FindInternshipsPageClient;