// app/login/page.tsx

'use client';

import Link from 'next/link';

const LoginPage = () => {
  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 space-y-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-center">Pilih Jenis Akun</h2>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          Silakan pilih jenis akun untuk masuk
        </p>

        <div className="space-y-4">
          <Link href="/login-student">
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6 text-center cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors">
              <h3 className="text-xl font-semibold mb-2 text-blue-700 dark:text-blue-300">Mahasiswa</h3>
              <p className="text-gray-600 dark:text-gray-300">Masuk sebagai mahasiswa</p>
            </div>
          </Link>

          <Link href="/login-company">
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-6 text-center cursor-pointer hover:bg-green-100 dark:hover:bg-green-800/50 transition-colors">
              <h3 className="text-xl font-semibold mb-2 text-green-700 dark:text-green-300">Perusahaan</h3>
              <p className="text-gray-600 dark:text-gray-300">Masuk sebagai perusahaan</p>
            </div>
          </Link>
        </div>

        <p className="mt-6 text-center">
          Belum punya akun? <Link href="/register" className="text-blue-600 hover:underline font-medium">Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;