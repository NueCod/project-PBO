import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cari Magang | InternBridge",
  description: "Find internships as a student",
};

export default function FindInternshipsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}