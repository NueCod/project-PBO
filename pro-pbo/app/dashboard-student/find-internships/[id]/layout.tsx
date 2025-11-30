import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Form Lamaran Magang | InternSheep",
  description: "Formulir lamaran untuk program magang",
};

export default function ApplicationFormLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}