import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deeniyat Platform | Learn Quran & Tajweed",
  description: "An online platform for students and Ustads to connect and learn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}