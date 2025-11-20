import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kelola Profil Mahasiswa | InternBridge",
  description: "Manage student profile information",
};

export default function ManageStudentProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}