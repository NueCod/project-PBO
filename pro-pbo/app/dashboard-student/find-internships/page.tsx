// app/dashboard-student/find-internships/page.tsx
'use client';

import FindInternshipsPageClient from './FindInternshipsPageClient';

// For now, we'll pass an empty array since the client component will fetch the data
// In the future, we might want to fetch data server-side for SEO and performance
const FindInternshipsPage = () => {
  return <FindInternshipsPageClient />;
};

export default FindInternshipsPage;