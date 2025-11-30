'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/authContext';
import { getStudentProfile } from '../../../lib/apiService';
import { useParams } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';

type InternshipApplication = {
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

type Document = {
  id: number;
  name: string;
  type: 'Resume' | 'Cover Letter' | 'Transcript' | 'Certificate' | 'Portfolio' | 'Other';
  size: string;
  uploadDate: string;
  description?: string;
  downloadUrl?: string;
};

type ApplicationFormData = {
  coverLetter: string;
  portfolioUrl?: string;
  availability: string;
  expectedDuration: string;
  selectedDocuments: Document[]; // Selected from existing documents
  additionalDocuments: File[]; // New optional supporting documents
  additionalInfo: string;
};

const ApplicationFormPage = () => {
  const params = useParams();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // State untuk menyimpan informasi pengguna
  const [userName, setUserName] = useState<string>('User');
  const [userEmail, setUserEmail] = useState<string>('user@example.com');
  const [userInitial, setUserInitial] = useState<string>('U');

  const { token } = useAuth();

  // Ambil informasi pengguna saat komponen dimuat
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
  const [internship, setInternship] = useState<InternshipApplication | null>(null);
  const [formData, setFormData] = useState<ApplicationFormData>({
    coverLetter: '',
    portfolioUrl: '',
    availability: 'immediately',
    expectedDuration: '6 months',
    selectedDocuments: [], // Selected from existing documents
    additionalDocuments: [], // New optional supporting documents
    additionalInfo: '',
  });
  const [documents, setDocuments] = useState<File[]>([]);
  const [studentDocuments, setStudentDocuments] = useState<Document[]>([]);
  const [selectedExistingDocs, setSelectedExistingDocs] = useState<number[]>([]); // IDs of selected existing docs
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Fetch internship and student documents data
  useEffect(() => {
    if (params?.id) {
      // In a real application, this would fetch from an API
      const mockInternships: InternshipApplication[] = [
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

      const internshipId = parseInt(Array.isArray(params.id) ? params.id[0] : params.id);
      const foundInternship = mockInternships.find(intern => intern.id === internshipId);
      if (foundInternship) {
        setInternship(foundInternship);
      }
    }

    // In a real application, this would fetch student documents from an API
    const mockStudentDocuments: Document[] = [
      {
        id: 1,
        name: 'Curriculum Vitae.pdf',
        type: 'Resume',
        size: '2.4 MB',
        uploadDate: '2024-10-15',
        description: 'Resume terbaru untuk aplikasi magang',
      },
      {
        id: 2,
        name: 'Surat_Pendukung.pdf',
        type: 'Cover Letter',
        size: '1.2 MB',
        uploadDate: '2024-10-16',
        description: 'Surat lamaran untuk PT Teknologi Maju',
      },
      {
        id: 3,
        name: 'Transkrip_nilai.pdf',
        type: 'Transcript',
        size: '3.1 MB',
        uploadDate: '2024-10-10',
        description: 'Transkrip nilai semester 1-6',
      },
      {
        id: 4,
        name: 'Sertifikat_React.pdf',
        type: 'Certificate',
        size: '1.8 MB',
        uploadDate: '2024-10-18',
        description: 'Sertifikat React Fundamental',
      },
      {
        id: 5,
        name: 'Portfolio_2024.pdf',
        type: 'Portfolio',
        size: '5.7 MB',
        uploadDate: '2024-10-20',
        description: 'Portfolio terbaru 2024',
      }
    ];

    setStudentDocuments(mockStudentDocuments);
  }, [params]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setDocuments(prev => [...prev, ...filesArray]);
      setFormData(prev => ({
        ...prev,
        additionalDocuments: [...prev.additionalDocuments, ...filesArray]
      }));
    }
  };

  const removeDocument = (index: number) => {
    const newDocuments = [...documents];
    newDocuments.splice(index, 1);
    setDocuments(newDocuments);
    setFormData(prev => ({
      ...prev,
      additionalDocuments: newDocuments
    }));
  };

  // Toggle selection of an existing document
  const toggleDocumentSelection = (id: number) => {
    if (selectedExistingDocs.includes(id)) {
      // Remove from selection
      const newSelection = selectedExistingDocs.filter(docId => docId !== id);
      setSelectedExistingDocs(newSelection);

      // Update formData to remove the document
      const newSelectedDocuments = studentDocuments.filter(doc => newSelection.includes(doc.id));
      setFormData(prev => ({
        ...prev,
        selectedDocuments: newSelectedDocuments
      }));
    } else {
      // Add to selection
      const newSelection = [...selectedExistingDocs, id];
      setSelectedExistingDocs(newSelection);

      // Update formData to include the document
      const newSelectedDocuments = studentDocuments.filter(doc => newSelection.includes(doc.id));
      setFormData(prev => ({
        ...prev,
        selectedDocuments: newSelectedDocuments
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      alert('Lamaran berhasil dikirim!');
      setIsSubmitting(false);
      // In a real application, you would send the data to an API
      console.log('Application submitted:', {
        ...formData,
        internshipId: internship?.id,
        selectedExistingDocIds: selectedExistingDocs
      });
    }, 1500);
  };

  if (!internship) {
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
                <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Aplikasi Magang</div>
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
          {(sidebarOpen || window.innerWidth >= 768) && (
            <div className="hidden md:block">
              <Sidebar darkMode={darkMode} userProfile={{ name: userName, email: userEmail }} />
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
              <Sidebar darkMode={darkMode} userProfile={{ name: userName, email: userEmail }} />
            </div>
          )}

          {/* Main Content */}
          <main className={`flex-1 ${sidebarOpen ? 'md:ml-64' : ''} p-6 pt-12`}>
            <div className="max-w-[1200px] mx-auto">
              <div className="rounded-xl p-12 text-center bg-white dark:bg-gray-800 shadow">
                <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Magang Tidak Ditemukan</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Magang yang Anda cari tidak ditemukan. Silakan kembali ke halaman sebelumnya.
                </p>
                <a 
                  href="/dashboard-student/find-internships"
                  className={`mt-4 inline-block px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                >
                  Kembali ke Cari Magang
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
              <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Aplikasi Magang</div>
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
        {(sidebarOpen || window.innerWidth >= 768) && (
          <div className="hidden md:block">
            <Sidebar darkMode={darkMode} userProfile={{ name: userName, email: userEmail }} />
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
            <Sidebar darkMode={darkMode} userProfile={{ name: userName, email: userEmail }} />
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${sidebarOpen ? 'md:ml-64' : ''} p-6 pt-12`}>
          <div className="max-w-[1200px] mx-auto">
            <div className={`rounded-xl p-6 shadow mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center mb-4">
                <div className={`text-3xl mr-4 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                  🏢
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{internship.title}</h1>
                  <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{internship.company}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {internship.location}
                    </span>
                    <span className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
                </div>
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
            </div>

            <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Form Lamaran</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className={`rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Informasi Pribadi</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Surat Lamaran</label>
                    <textarea
                      name="coverLetter"
                      value={formData.coverLetter}
                      onChange={handleInputChange}
                      placeholder="Tulis surat lamaran Anda di sini..."
                      rows={5}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Portofolio (Opsional)</label>
                    <input
                      type="url"
                      name="portfolioUrl"
                      value={formData.portfolioUrl || ''}
                      onChange={handleInputChange}
                      placeholder="https://portfolio-anda.com"
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ketersediaan</label>
                    <select
                      name="availability"
                      value={formData.availability}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="immediately">Segera</option>
                      <option value="2-weeks">2 minggu dari sekarang</option>
                      <option value="1-month">1 bulan dari sekarang</option>
                      <option value="2-months">2 bulan dari sekarang</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Durasi Harapan</label>
                    <select
                      name="expectedDuration"
                      value={formData.expectedDuration}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="3 months">3 bulan</option>
                      <option value="4 months">4 bulan</option>
                      <option value="5 months">5 bulan</option>
                      <option value="6 months">6 bulan</option>
                      <option value="7 months">7 bulan</option>
                      <option value="8 months">8 bulan</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Existing Documents Selection */}
              <div className={`rounded-xl p-6 shadow mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Pilih Dokumen dari Arsip Saya</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {studentDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedExistingDocs.includes(doc.id)
                          ? (darkMode ? 'border-blue-500 bg-blue-900/20' : 'border-blue-500 bg-blue-50')
                          : (darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50')
                      }`}
                      onClick={() => toggleDocumentSelection(doc.id)}
                    >
                      <div className="flex items-center">
                        <div className={`mr-3 text-xl ${
                          doc.type === 'Resume' ? 'text-blue-500' :
                          doc.type === 'Cover Letter' ? 'text-green-500' :
                          doc.type === 'Transcript' ? 'text-purple-500' :
                          doc.type === 'Certificate' ? 'text-yellow-500' :
                          doc.type === 'Portfolio' ? 'text-indigo-500' : 'text-gray-500'
                        }`}>
                          {doc.type === 'Resume' ? '📄' :
                           doc.type === 'Cover Letter' ? '✉️' :
                           doc.type === 'Transcript' ? '🎓' :
                           doc.type === 'Certificate' ? '🏆' :
                           doc.type === 'Portfolio' ? '🖼️' : '📋'}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{doc.name}</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{doc.type}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          selectedExistingDocs.includes(doc.id)
                            ? (darkMode ? 'bg-blue-600 border-blue-600' : 'bg-blue-500 border-blue-500')
                            : (darkMode ? 'border-gray-500' : 'border-gray-300')
                        }`}>
                          {selectedExistingDocs.includes(doc.id) && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedExistingDocs.length > 0 && (
                  <div className="mt-4">
                    <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Dokumen Terpilih:</h4>
                    <ul className="space-y-2">
                      {formData.selectedDocuments.map((doc, index) => (
                        <li key={doc.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{doc.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleDocumentSelection(doc.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            &times;
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className={`rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dokumen Pendukung Tambahan (Opsional)</h3>

                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Unggah Dokumen Tambahan</label>
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      id="document-upload"
                      multiple
                      accept=".pdf,.doc,.docx,.txt"
                    />
                    <label
                      htmlFor="document-upload"
                      className={`cursor-pointer inline-flex flex-col items-center ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm">Klik untuk memilih file</span>
                      <p className="text-xs mt-1">PDF, DOC, DOCX hingga 10MB</p>
                    </label>
                  </div>
                </div>

                {documents.length > 0 && (
                  <div className="mt-4">
                    <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Dokumen Tambahan Terpilih:</h4>
                    <ul className="space-y-2">
                      {documents.map((file, index) => (
                        <li key={index} className="flex justify-between items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            &times;
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className={`rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Informasi Tambahan</h3>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Catatan Tambahan (Opsional)</label>
                  <textarea
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    placeholder="Tambahkan informasi tambahan yang ingin Anda sampaikan..."
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <a 
                  href="/dashboard-student/find-internships" 
                  className={`px-6 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} text-gray-700 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Batal
                </a>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white flex items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mengirim...
                    </>
                  ) : (
                    'Kirim Lamaran'
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ApplicationFormPage;