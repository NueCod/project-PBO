import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kelola Profil Mahasiswa | InternSheep",
  description: "Manage student profile information",
};

export default function ManageStudentProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}