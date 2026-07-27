import type { Metadata } from "next";
import "./globals.css";
// Navbar ko import kar rahe hain
import Navbar from "../components/Navbar";

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
      <body className="bg-gray-50 min-h-screen">
        {/* Navbar har page ke top par aayega */}
        <Navbar />
        
        {/* Baki ka page content yahan render hoga */}
        {children}
      </body>
    </html>
  );
}