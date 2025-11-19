'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type FormData = {
  title: string;
  description: string;
  requirements: {
    majors: string[];
    skills: string[];
    gpa: string;
    other: string;
  };
  jobType: 'wfo' | 'wfh' | 'hybrid';
  location: string;
  closingDate: string;
  duration: string; // Duration in months
  isPaid: boolean;
  salary: string; // Only applicable if isPaid is true
};

const CreateInternshipPage = () => {
  const router = useRouter();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    requirements: {
      majors: [] as string[],
      skills: [] as string[],
      gpa: '',
      other: '',
    },
    jobType: 'wfo',
    location: '',
    closingDate: '',
    duration: '',
    isPaid: false,
    salary: '',
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleRequirementsChange = (field: keyof FormData['requirements'], value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [field]: value
      }
    }));
  };

  const addMajor = (major: string) => {
    if (major && !formData.requirements.majors.includes(major)) {
      handleRequirementsChange('majors', [...formData.requirements.majors, major]);
    }
  };

  const removeMajor = (index: number) => {
    const newMajors = [...formData.requirements.majors];
    newMajors.splice(index, 1);
    handleRequirementsChange('majors', newMajors);
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.requirements.skills.includes(skill)) {
      handleRequirementsChange('skills', [...formData.requirements.skills, skill]);
    }
  };

  const removeSkill = (index: number) => {
    const newSkills = [...formData.requirements.skills];
    newSkills.splice(index, 1);
    handleRequirementsChange('skills', newSkills);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Internship data submitted:', {
      ...formData,
      requirements: {
        ...formData.requirements,
        majors: formData.requirements.majors,
        skills: formData.requirements.skills,
      }
    });

    // Basic validation
    if (!formData.duration) {
      alert('Mohon isi durasi magang');
      return;
    }

    if (formData.isPaid && !formData.salary) {
      alert('Mohon isi besaran gaji');
      return;
    }

    alert('Program magang berhasil dibuat!');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 backdrop-blur-sm z-50 border-b ${darkMode ? 'bg-gray-900/90 border-gray-700' : 'bg-white/90 border-[#e5e7eb]'}`}>
        <div className="max-w-[1200px] mx-auto px-[40px] py-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Buat Program Magang Baru</div>
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
        {/* Main Content */}
        <main className="flex-1 p-6 pt-12">
          <div className="max-w-[1200px] mx-auto">
            <div className="mb-8">
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Buat Program Magang Baru</h1>
              <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Lengkapi informasi program magang untuk menarik kandidat terbaik
              </p>
            </div>

            <div className={`rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="title" className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Judul Posisi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
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
                      value={formData.jobType}
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
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-[#f59e0b] focus:border-[#f59e0b]' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                      }`}
                      placeholder="Contoh: Jakarta Selatan"
                    />
                  </div>

                  <div>
                    <label htmlFor="closingDate" className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Batas Akhir Pendaftaran <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="closingDate"
                      name="closingDate"
                      value={formData.closingDate}
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
                      name="duration"
                      value={formData.duration}
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
                    <div className="flex items-center">
                      <label className={`flex items-center cursor-pointer ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <input
                          type="radio"
                          name="isPaid"
                          checked={!formData.isPaid}
                          onChange={() => handleCheckboxChange('isPaid', false)}
                          className="mr-2 h-4 w-4 text-[#f59e0b] focus:ring-[#f59e0b]"
                        />
                        Unpaid
                      </label>
                      <label className={`flex items-center cursor-pointer ml-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <input
                          type="radio"
                          name="isPaid"
                          checked={formData.isPaid}
                          onChange={() => handleCheckboxChange('isPaid', true)}
                          className="mr-2 h-4 w-4 text-[#f59e0b] focus:ring-[#f59e0b]"
                        />
                        Paid
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
                    value={formData.description}
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
                {formData.isPaid && (
                  <div className="mb-6 p-4 rounded-lg border border-dashed border-[#f59e0b] bg-[#f59e0b]/10 dark:bg-[#f59e0b]/10">
                    <div>
                      <label htmlFor="salary" className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Besaran Gaji <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="salary"
                        name="salary"
                        value={formData.salary}
                        onChange={handleInputChange}
                        required={formData.isPaid}
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
                    <div className="flex">
                      <input
                        type="text"
                        id="majorInput"
                        className={`flex-1 px-4 py-3 rounded-l-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-[#f59e0b] focus:border-[#f59e0b]' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                        }`}
                        placeholder="Tambahkan jurusan (misal: Teknik Informatika, Manajemen)"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                            e.preventDefault();
                            addMajor((e.target as HTMLInputElement).value.trim());
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="bg-[#f59e0b] text-white px-4 rounded-r-lg font-medium hover:bg-[#d97706] transition-colors"
                        onClick={() => {
                          const input = document.getElementById('majorInput') as HTMLInputElement;
                          if (input.value.trim()) {
                            addMajor(input.value.trim());
                            input.value = '';
                          }
                        }}
                      >
                        Tambah
                      </button>
                    </div>
                    
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.requirements.majors.map((major, index) => (
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
                            onClick={() => removeMajor(index)}
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
                            addSkill((e.target as HTMLInputElement).value.trim());
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
                            addSkill(input.value.trim());
                            input.value = '';
                          }
                        }}
                      >
                        Tambah
                      </button>
                    </div>
                    
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.requirements.skills.map((skill, index) => (
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
                            onClick={() => removeSkill(index)}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* GPA Field */}
                  <div className="mb-4">
                    <label htmlFor="gpa" className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      IPK Minimal
                    </label>
                    <input
                      type="number"
                      id="gpa"
                      step="0.01"
                      min="0"
                      max="4"
                      value={formData.requirements.gpa}
                      onChange={(e) => handleRequirementsChange('gpa', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-[#f59e0b] focus:border-[#f59e0b]' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                      }`}
                      placeholder="Contoh: 3.0"
                    />
                  </div>

                  {/* Other Requirements Field */}
                  <div>
                    <label htmlFor="otherRequirements" className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Persyaratan Lainnya
                    </label>
                    <textarea
                      id="otherRequirements"
                      value={formData.requirements.other}
                      onChange={(e) => handleRequirementsChange('other', e.target.value)}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-[#f59e0b] focus:border-[#f59e0b]' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                      }`}
                      placeholder="Tambahkan persyaratan tambahan lainnya..."
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowConfirmDialog(true)}
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
                    Buat Program Magang
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-6 shadow-lg w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Konfirmasi Pembatalan
            </h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Apakah Anda yakin ingin membatalkan? Data formulir yang belum disimpan akan hilang.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowConfirmDialog(false)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  darkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateInternshipPage;