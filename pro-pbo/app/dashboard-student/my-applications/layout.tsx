import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lamaran Saya | InternSheep",
  description: "Manage your internship applications",
};

export default function MyApplicationsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}