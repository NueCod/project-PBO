'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/authContext';
import { createInternship, getCompanyInternships } from '../../services/internshipService';

type FormData = {
  title: string;
  description: string;
  requirements: {
    majors: string[];
    skills: string[];
    gpa: string;
    other: string;
    minSemester: string;
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
  const { token } = useAuth();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSubmitConfirmDialog, setShowSubmitConfirmDialog] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    requirements: {
      majors: [] as string[],
      skills: [] as string[],
      gpa: '',
      other: '',
      minSemester: '',
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

    // Basic validation
    if (!formData.duration) {
      alert('Mohon isi durasi magang');
      return;
    }

    if (formData.isPaid && !formData.salary) {
      alert('Mohon isi besaran gaji');
      return;
    }

    // Show confirmation dialog instead of submitting immediately
    setShowSubmitConfirmDialog(true);
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
                    <select
                      id="location"
                      name="location"
                      value={formData.location}
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
                    <div className="flex space-x-4">
                      <label
                        className={`flex items-center px-4 py-3 rounded-lg border cursor-pointer transition-colors w-full text-center ${
                          !formData.isPaid
                            ? (darkMode ? 'border-[#f59e0b] bg-[#f59e0b]/10 text-[#f59e0b]' : 'border-[#f59e0b] bg-[#fef3c7] text-[#f59e0b]')
                            : (darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-white text-gray-700')
                        }`}
                      >
                        <input
                          type="radio"
                          name="isPaid"
                          checked={!formData.isPaid}
                          onChange={() => handleCheckboxChange('isPaid', false)}
                          className="hidden"
                        />
                        <span className="mx-auto font-medium">Unpaid</span>
                      </label>
                      <label
                        className={`flex items-center px-4 py-3 rounded-lg border cursor-pointer transition-colors w-full text-center ${
                          formData.isPaid
                            ? (darkMode ? 'border-[#f59e0b] bg-[#f59e0b]/10 text-[#f59e0b]' : 'border-[#f59e0b] bg-[#fef3c7] text-[#f59e0b]')
                            : (darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-white text-gray-700')
                        }`}
                      >
                        <input
                          type="radio"
                          name="isPaid"
                          checked={formData.isPaid}
                          onChange={() => handleCheckboxChange('isPaid', true)}
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
                    <select
                      id="majorInput"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                      }`}
                      value=""
                      onChange={(e) => {
                        if (e.target.value && !formData.requirements.majors.includes(e.target.value)) {
                          handleRequirementsChange('majors', [...formData.requirements.majors, e.target.value]);
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

                  {/* Minimal Semester Field */}
                  <div className="mb-4">
                    <label htmlFor="minSemester" className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Minimal Semester
                    </label>
                    <select
                      id="minSemester"
                      value={formData.requirements.minSemester}
                      onChange={(e) => handleRequirementsChange('minSemester', e.target.value)}
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

      {/* Submission Confirmation Dialog */}
      {showSubmitConfirmDialog && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-6 shadow-lg w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Konfirmasi Pembuatan Magang
            </h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Apakah Anda yakin ingin membuat program magang ini? Pastikan semua informasi telah diisi dengan benar.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowSubmitConfirmDialog(false)}
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
                onClick={async () => {
                  try {
                    if (!token) {
                      alert('Anda harus login terlebih dahulu untuk membuat program magang');
                      return;
                    }

                    console.log('Creating internship with token:', token); // Debug log

                    // Check if company has profile before creating job
                    // This is a workaround to ensure company profile exists
                    try {
                      console.log('Checking company profile before creation...'); // Debug log
                      // Try to fetch company internships to trigger profile creation if needed
                      const existingJobs = await getCompanyInternships(token);
                      console.log('Existing company jobs before creation:', existingJobs);
                    } catch (profileCheckError) {
                      console.warn('Profile check failed, but continuing with job creation:', profileCheckError);
                    }

                    // Prepare the internship data for submission
                    const internshipData = {
                      title: formData.title,
                      description: formData.description,
                      duration: formData.duration,
                      location: formData.location,
                      jobType: formData.jobType,
                      closingDate: formData.closingDate,
                      isPaid: formData.isPaid,
                      salary: formData.salary,
                      requirements: {
                        majors: formData.requirements.majors,
                        skills: formData.requirements.skills,
                        gpa: formData.requirements.gpa,
                        other: formData.requirements.other,
                        minSemester: formData.requirements.minSemester || '1' // Default to semester 1 if not specified
                      },
                    };

                    console.log('Sending internship data:', internshipData); // Debug log

                    // Create the internship using the service
                    const result = await createInternship(token, internshipData);
                    console.log('API response after creation:', result); // Debug log

                    // After successful creation, try to refresh the company's job list
                    // to make sure the new job appears in both dashboard and manage page
                    try {
                      console.log('Refreshing company jobs after creation...'); // Debug log
                      const updatedJobs = await getCompanyInternships(token);
                      console.log('Updated company jobs after creation:', updatedJobs);
                      console.log('Number of jobs after creation:', updatedJobs.length); // Debug log
                    } catch (refreshError) {
                      console.error('Error refreshing company jobs after creation:', refreshError);
                    }

                    // Hide the confirmation dialog and show success popup
                    setShowSubmitConfirmDialog(false);
                    setShowSuccessPopup(true);
                  } catch (error: any) {
                    console.error('Error creating internship:', error);

                    // Provide more specific error feedback
                    let errorMessage = 'Terjadi kesalahan saat membuat program magang. Silakan coba lagi.';
                    if (error.message) {
                      errorMessage += ` Detail: ${error.message}`;
                    }

                    alert(errorMessage);
                  }
                }}
                className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                Ya, Buat Program Magang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-6 shadow-lg w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className={`text-lg font-bold mt-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Berhasil!
              </h3>
              <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Program magang berhasil dibuat.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessPopup(false);
                    // Redirect to manage internships page after success
                    router.push('/dashboard/manage-internships');
                  }}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    darkMode
                      ? 'bg-[#f59e0b] text-white hover:bg-[#d97706]'
                      : 'bg-[#f59e0b] text-white hover:bg-[#d97706]'
                  }`}
                >
                  Lihat Program Saya
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateInternshipPage;