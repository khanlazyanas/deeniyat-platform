import type { Metadata } from "next";
import "./globals.css";
// Navbar ko import kar rahe hain
import Navbar from "../components/Navbar";
// 👇 1. AuthProvider ko import kiya
import { AuthProvider } from "../context/AuthContext";

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
        {/* 👇 2. Poore app (aur Navbar) ko AuthProvider se wrap kar diya */}
        <AuthProvider>
          {/* Navbar har page ke top par aayega */}
          <Navbar />
          
          {/* Baki ka page content yahan render hoga */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}