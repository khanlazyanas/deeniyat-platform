import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-gray-50">
      
      {/* Sidebar (Desktop par dikhega, Mobile par hide hoga) */}
      <aside className="w-64 bg-white shadow-md hidden md:block border-r border-gray-200">
        <nav className="p-4 space-y-2 mt-4">
          <Link href="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md font-medium transition">
            Overview
          </Link>
          <Link href="/dashboard/my-courses" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md font-medium transition">
            My Courses
          </Link>
          <Link href="/dashboard/attendance" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md font-medium transition">
            Attendance
          </Link>
          <Link href="/dashboard/settings" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md font-medium transition">
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Dashboard Content */}
      <main className="flex-1 p-6 md:p-8">
        {children}
      </main>
      
    </div>
  );
}