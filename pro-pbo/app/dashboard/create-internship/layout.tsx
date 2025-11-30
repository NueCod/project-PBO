import { ReactNode } from "react";

export default function CreateInternshipLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="create-internship-layout">
      {children}
    </div>
  );
}