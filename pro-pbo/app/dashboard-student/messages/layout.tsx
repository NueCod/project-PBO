import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pesan | InternSheep",
  description: "Messages for students",
};

export default function MessagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}