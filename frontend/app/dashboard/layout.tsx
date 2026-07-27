"use client"; // Client component bana rahe hain taaki hooks use kar sakein

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 1. Token check karo
    const token = localStorage.getItem("token");

    // 2. Agar token nahi hai, toh seedha login par phek do
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // Logout ka function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Jab tak token check ho raha hai, tab tak blank rakho (Flicker rokne ke liye)
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-gray-50">

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:flex flex-col justify-between border-r border-gray-200">
        <nav className="p-4 space-y-2 mt-4">
          <Link href="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md font-medium transition">
            Overview
          </Link>
          <Link href="/dashboard/my-courses" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md font-medium transition">
            My Courses
          </Link>
          <Link href="/dashboard/create-course" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md font-medium transition">
            Create Course
          </Link>
          <Link href="/dashboard/attendance" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md font-medium transition">
            Attendance
          </Link>
          <Link href="/dashboard/settings" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md font-medium transition">
            Settings
          </Link>
        </nav>

        {/* Logout Button (Bottom of sidebar) */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-md font-medium transition"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Dashboard Content */}
      <main className="flex-1 p-6 md:p-8">
        {children}
      </main>

    </div>
  );
}