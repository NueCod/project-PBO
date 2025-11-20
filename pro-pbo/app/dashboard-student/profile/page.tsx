'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { StudentProfile } from '../../interfaces';

type FormErrors = {
  name?: string;
  email?: string;
  university?: string;
  major?: string;
  location?: string;
  skills?: string;
  interests?: string;
};

const ManageStudentProfilePage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<StudentProfile>({
    id: 'student-1',
    name: 'Budi Santoso',
    email: 'budi.santoso@example.com',
    university: 'Universitas Indonesia',
    major: 'Teknik Informatika',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'UI/UX Design'],
    location: 'Jakarta',
    interests: ['Web Development', 'Mobile Apps', 'AI/ML'],
    experience: ['Frontend Developer Intern', 'UI Design Freelancer'],
    education: ['S1 Teknik Informatika, UI', 'SMA Jurusan IPA'],
    resume: '',
    portfolio: 'https://budi-portfolio.com',
    avatar: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
      setProfile(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest !== interestToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!profile.name.trim()) {
      newErrors.name = 'Nama wajib diisi';
    }

    if (!profile.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!profile.university.trim()) {
      newErrors.university = 'Universitas wajib diisi';
    }

    if (!profile.major.trim()) {
      newErrors.major = 'Jurusan wajib diisi';
    }

    if (!profile.location.trim()) {
      newErrors.location = 'Lokasi wajib diisi';
    }

    if (profile.skills.length === 0) {
      newErrors.skills = 'Setidaknya satu keahlian harus diisi';
    }

    if (profile.interests.length === 0) {
      newErrors.interests = 'Setidaknya satu minat harus diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // In a real application, you would send the data to an API
      console.log('Profile updated:', profile);
      setIsEditing(false);
      setErrors({});
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
              <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Kelola Profil Mahasiswa</div>
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
            <div className="flex justify-between items-center mb-6">
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Kelola Profil Mahasiswa</h1>
              <div className="flex space-x-2">
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setErrors({});
                    }}
                    className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-300 hover:bg-gray-400'} text-white`}
                  >
                    Batal
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                >
                  {isEditing ? 'Lihat Profil' : 'Edit Profil'}
                </button>
              </div>
            </div>

            {/* Student Profile Card */}
            <div className={`rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Profile Avatar */}
                  <div className="md:col-span-2 flex flex-col items-center">
                    <div className={`w-32 h-32 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center mb-4`}>
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="Profile Avatar" className="w-full h-full object-contain rounded-full" />
                      ) : (
                        <span className={`text-4xl ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>👤</span>
                      )}
                    </div>
                    {isEditing && (
                      <label className={`px-4 py-2 rounded-lg cursor-pointer ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}>
                        Ganti Avatar
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setProfile(prev => ({
                                  ...prev,
                                  avatar: reader.result as string
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <label htmlFor="name" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nama Lengkap
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={profile.name}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 rounded-lg border ${errors.name ? 'border-red-500' : ''} ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                      </>
                    ) : (
                      <div className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}>
                        {profile.name}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={profile.email}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 rounded-lg border ${errors.email ? 'border-red-500' : ''} ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                      </>
                    ) : (
                      <div className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}>
                        {profile.email}
                      </div>
                    )}
                  </div>

                  {/* University */}
                  <div>
                    <label htmlFor="university" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Universitas
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          id="university"
                          name="university"
                          value={profile.university}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 rounded-lg border ${errors.university ? 'border-red-500' : ''} ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        {errors.university && <p className="mt-1 text-sm text-red-500">{errors.university}</p>}
                      </>
                    ) : (
                      <div className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}>
                        {profile.university}
                      </div>
                    )}
                  </div>

                  {/* Major */}
                  <div>
                    <label htmlFor="major" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Jurusan
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          id="major"
                          name="major"
                          value={profile.major}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 rounded-lg border ${errors.major ? 'border-red-500' : ''} ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        {errors.major && <p className="mt-1 text-sm text-red-500">{errors.major}</p>}
                      </>
                    ) : (
                      <div className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}>
                        {profile.major}
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="location" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Lokasi
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={profile.location}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 rounded-lg border ${errors.location ? 'border-red-500' : ''} ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
                      </>
                    ) : (
                      <div className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}>
                        {profile.location}
                      </div>
                    )}
                  </div>

                  {/* Portfolio */}
                  <div>
                    <label htmlFor="portfolio" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Portfolio
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        id="portfolio"
                        name="portfolio"
                        value={profile.portfolio || ''}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    ) : (
                      <div className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}>
                        {profile.portfolio ? (
                          <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            {profile.portfolio}
                          </a>
                        ) : (
                          'Tidak ada portfolio'
                        )}
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  <div>
                    <label htmlFor="skills" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Keahlian
                    </label>
                    {isEditing ? (
                      <div>
                        <div className="flex mb-2">
                          <input
                            type="text"
                            id="newSkill"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            placeholder="Tambah keahlian baru"
                            className={`flex-1 px-3 py-2 rounded-l-lg border ${errors.skills ? 'border-red-500' : ''} ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addSkill();
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={addSkill}
                            className={`px-4 py-2 rounded-r-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                          >
                            Tambah
                          </button>
                        </div>
                        {errors.skills && <p className="mt-1 text-sm text-red-500">{errors.skills}</p>}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {profile.skills.map((skill, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded text-sm flex items-center ${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`}
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="ml-2 text-white bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded text-sm ${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Interests */}
                  <div>
                    <label htmlFor="interests" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Minat
                    </label>
                    {isEditing ? (
                      <div>
                        <div className="flex mb-2">
                          <input
                            type="text"
                            id="newInterest"
                            value={newInterest}
                            onChange={(e) => setNewInterest(e.target.value)}
                            placeholder="Tambah minat baru"
                            className={`flex-1 px-3 py-2 rounded-l-lg border ${errors.interests ? 'border-red-500' : ''} ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addInterest();
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={addInterest}
                            className={`px-4 py-2 rounded-r-lg ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
                          >
                            Tambah
                          </button>
                        </div>
                        {errors.interests && <p className="mt-1 text-sm text-red-500">{errors.interests}</p>}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {profile.interests.map((interest, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded text-sm flex items-center ${darkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`}
                            >
                              {interest}
                              <button
                                type="button"
                                onClick={() => removeInterest(interest)}
                                className="ml-2 text-white bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}>
                        <div className="flex flex-wrap gap-2">
                          {profile.interests.map((interest, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded text-sm ${darkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`}
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Experience */}
                <div className="mb-6">
                  <label htmlFor="experience" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Pengalaman
                  </label>
                  {isEditing ? (
                    <textarea
                      id="experience"
                      name="experience"
                      value={profile.experience.join('\n')}
                      onChange={(e) => {
                        const experience = e.target.value.split('\n').filter(exp => exp.trim() !== '');
                        setProfile(prev => ({
                          ...prev,
                          experience: experience
                        }));
                      }}
                      rows={3}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  ) : (
                    <div className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}>
                      <ul className="list-disc pl-5">
                        {profile.experience.map((exp, index) => (
                          <li key={index}>{exp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Education */}
                <div className="mb-6">
                  <label htmlFor="education" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Pendidikan
                  </label>
                  {isEditing ? (
                    <textarea
                      id="education"
                      name="education"
                      value={profile.education.join('\n')}
                      onChange={(e) => {
                        const education = e.target.value.split('\n').filter(edu => edu.trim() !== '');
                        setProfile(prev => ({
                          ...prev,
                          education: education
                        }));
                      }}
                      rows={3}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  ) : (
                    <div className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}>
                      <ul className="list-disc pl-5">
                        {profile.education.map((edu, index) => (
                          <li key={index}>{edu}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Submit Button - only shown when editing */}
                {isEditing && (
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setErrors({});
                      }}
                      className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-300 hover:bg-gray-400'} text-white`}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className={`px-6 py-2 rounded-lg ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
                    >
                      Simpan Perubahan
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageStudentProfilePage;