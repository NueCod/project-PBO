import { notFound } from 'next/navigation';
import FindInternshipsPageClient from './FindInternshipsPageClient';

type FindInternshipsPageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

const FindInternshipsPage = ({ searchParams }: FindInternshipsPageProps) => {
  return (
    <FindInternshipsPageClient searchParams={searchParams} />
  );
};

export default FindInternshipsPage;