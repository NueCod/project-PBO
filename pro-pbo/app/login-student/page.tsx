// app/login-student/page.tsx

'use client';

import StudentLoginForm from '../components/auth/StudentLoginForm';

const StudentLoginPage = () => {
  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 space-y-6 border border-gray-200 dark:border-gray-700">
        <StudentLoginForm />
      </div>
    </div>
  );
};

export default StudentLoginPage;