import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kelola Profil Perusahaan | InternBridge",
  description: "Manage company profile information",
};

export default function ManageCompanyProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}