import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dokumen Saya | InternSheep",
  description: "Manage your documents",
};

export default function DocumentsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}