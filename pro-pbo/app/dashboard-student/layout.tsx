import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Dashboard | InternBridge",
  description: "Student dashboard for managing internships and applications",
};

export default function StudentDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}