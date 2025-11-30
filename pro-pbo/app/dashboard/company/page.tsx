// app/dashboard/company/page.tsx

'use client'; // Karena menggunakan hook useAuth dan ProtectedRoute

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/authContext'; // Impor useAuth untuk info user (naik 2 level dari dashboard/company ke app, lalu masuk lib)
import { getCompanyInternships } from '../../services/internshipService'; // Import the function to get company's internships
import ProtectedRoute from '../../components/auth/ProtectedRoute'; // Impor komponen proteksi

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

const CompanyDashboard = () => {
  const { user, token } = useAuth(); // Dapatkan data user dan token dari context
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch internships posted by this company
  useEffect(() => {
    const fetchInternships = async () => {
      if (token) {
        try {
          setLoading(true);
          const data = await getCompanyInternships(token);
          setInternships(data);
        } catch (error) {
          console.error('Error fetching company internships:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchInternships();
  }, [token]);

  return (
    <ProtectedRoute allowedRoles={['company']}> {/* Hanya izinkan role 'company' */}
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Dashboard Perusahaan</h1>
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Selamat datang, {user?.company_name || user?.email}!</h2>
        </div>

        {/* Company's posted internships section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Program Magang yang Saya Posting</h3>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#f59e0b]"></div>
            </div>
          ) : internships.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b">Judul</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b">Lokasi</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b">Tipe</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b">Batas Akhir</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b">Status</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b">Pelamar</th>
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
                        {new Date(internship.deadline).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            internship.status === 'Active'
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
                            className={`px-3 py-1 rounded text-xs ${
                              internship.status === 'Active'
                                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                : 'bg-gray-300 text-gray-700 cursor-not-allowed'
                            }`}
                            disabled={internship.status !== 'Active'}
                            onClick={() => {
                              // Navigate to edit page with internship ID
                              window.location.href = `/dashboard/edit-internship?id=${internship.id}`;
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className={`px-3 py-1 rounded text-xs ${
                              internship.status === 'Active'
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-gray-300 text-gray-700 cursor-not-allowed'
                            }`}
                            onClick={async () => {
                              if (window.confirm('Apakah Anda yakin ingin menutup lowongan ini? Lowongan tidak akan tampil lagi di pencarian.')) {
                                try {
                                  const { closeInternship } = await import('../../services/internshipService');
                                  await closeInternship(token!, internship.id);

                                  // Refresh the list
                                  const data = await getCompanyInternships(token!);
                                  setInternships(data);
                                } catch (error) {
                                  console.error('Error closing internship:', error);
                                  alert('Gagal menutup lowongan. Silakan coba lagi.');
                                }
                              }
                            }}
                            disabled={internship.status !== 'Active'}
                          >
                            Tutup
                          </button>
                          <button
                            className={`px-3 py-1 rounded text-xs ${
                              'bg-blue-500 hover:bg-blue-600 text-white'
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
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">Anda belum memposting program magang apapun.</p>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Fitur Perusahaan:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><a href="/dashboard/create-internship" className="text-blue-500 hover:underline">Buat Lowongan Magang Baru</a></li>
            <li><a href="/dashboard/manage-internships" className="text-blue-500 hover:underline">Kelola Program Magang Saya</a></li>
            <li><a href="/dashboard/manage-company-profile" className="text-blue-500 hover:underline">Kelola Profil Perusahaan</a></li>
            <li>Lihat dan Kelola Pelamar</li>
            <li>Posting dan Update Status Lamaran</li>
          </ul>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CompanyDashboard;