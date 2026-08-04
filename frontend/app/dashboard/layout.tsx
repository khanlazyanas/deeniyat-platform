"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Mobile sidebar state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Jab bhi route change ho (user kisi link par click kare), mobile sidebar close ho jaye
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Check if we are inside the actual Course Player (e.g. /dashboard/my-courses/6a67a7...)
  const isCoursePlayerPage = pathname.match(/\/dashboard\/my-courses\/[a-zA-Z0-9_-]+$/);

  const handleLogout = () => {
    localStorage.removeItem("token");
    // If you store user info, remove it here too
    // localStorage.removeItem("user");
    router.push("/login");
  };

  // If we are on the Course Player page, DO NOT render the sidebar, just full screen content
  if (isCoursePlayerPage) {
    return <div className="min-h-screen bg-[#020617] text-slate-200">{children}</div>;
  }

  // Otherwise, render the Premium Dark Sidebar Dashboard Layout
  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#020617] overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* MOBILE HEADER (Visible only on small screens) */}
      <div className="md:hidden flex items-center justify-between bg-[#040a1f] border-b border-slate-800 px-4 py-3 shrink-0 z-40 relative shadow-md">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-[0_0_10px_rgba(52,211,153,0.3)]">
            <svg className="w-4 h-4 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <span className="text-xl font-black text-white tracking-wide">
            Deeniyat<span className="text-emerald-500">.</span>
          </span>
        </Link>
        
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="text-slate-300 hover:text-white focus:outline-none p-2 bg-slate-800/50 rounded-lg border border-slate-700 transition-colors"
        >
          {isMobileOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {/* MOBILE OVERLAY (Darkens background when sidebar is open on mobile) */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 
        w-64 bg-[#040a1f] border-r border-slate-800 flex flex-col shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
      `}>
        
        {/* Logo Area (Hidden on mobile, shown on desktop) */}
        <div className="hidden md:flex h-20 items-center px-6 border-b border-slate-800 bg-slate-900/40 shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.3)]">
              <svg className="w-5 h-5 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <span className="text-2xl font-black text-white tracking-wide">
              Deeniyat<span className="text-emerald-500">.</span>
            </span>
          </Link>
        </div>

        {/* Mobile sidebar header (Menu title & close button) */}
        <div className="flex md:hidden items-center justify-between px-6 h-16 border-b border-slate-800 bg-slate-900/40 shrink-0">
          <span className="text-lg font-bold text-white tracking-wide">Navigation</span>
          <button onClick={() => setIsMobileOpen(false)} className="text-slate-400 hover:text-white bg-slate-800/50 p-1.5 rounded-md border border-slate-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <NavLink href="/dashboard" currentPath={pathname}>Overview</NavLink>
          <NavLink href="/dashboard/my-courses" currentPath={pathname}>My Courses</NavLink>

          {/* Student Tools Section */}
          <div className="pt-4 mt-4 border-t border-slate-800/50">
            <p className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Student Tools</p>
            <NavLink href="/dashboard/submit-assignment" currentPath={pathname}>Submit Assignment</NavLink>
            <NavLink href="/dashboard/my-grades" currentPath={pathname}>My Grades</NavLink>
          </div>

          {/* Teacher Tools Section */}
          <div className="pt-4 mt-4 border-t border-slate-800/50">
            <p className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Teacher Tools</p>
            <NavLink href="/dashboard/create-course" currentPath={pathname}>Create Course</NavLink>
            <NavLink href="/dashboard/add-lesson" currentPath={pathname}>Add Lesson</NavLink>
            <NavLink href="/dashboard/submissions" currentPath={pathname}>Submissions</NavLink>
          </div>

          {/* Settings & Billing Section */}
          <div className="pt-4 mt-4 border-t border-slate-800/50">
            <p className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Settings & Billing</p>
            <NavLink href="/dashboard/transactions" currentPath={pathname}>Transactions</NavLink>
            <NavLink href="/dashboard/attendance" currentPath={pathname}>Attendance</NavLink>
            <NavLink href="/dashboard/settings" currentPath={pathname}>Settings</NavLink>
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/20 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-xl transition-all font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Log Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto relative bg-[#020617] h-full">
         <div className="h-full custom-scrollbar">
            {children}
         </div>
      </main>

    </div>
  );
}

// Helper Component for Sidebar Links
function NavLink({ href, currentPath, children }: { href: string, currentPath: string, children: React.ReactNode }) {
  // Determine if the current path matches the link exactly or if it is a sub-path
  const isActive = currentPath === href || (currentPath.startsWith(href) && href !== '/dashboard');

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
        isActive
          ? "bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.1)]"
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
      }`}
    >
      {/* Active Indicator Line */}
      <div className={`w-1 h-5 rounded-full transition-all duration-300 ${isActive ? "bg-emerald-500" : "bg-transparent"}`}></div>
      {children}
    </Link>
  );
}