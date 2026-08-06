"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Mobile sidebar state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Check if we are inside the actual Course Player
  const isCoursePlayerPage = pathname?.match(/\/dashboard\/my-courses\/[a-zA-Z0-9_-]+$/);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // If Course Player page, DO NOT render the sidebar, just full screen cinematic content
  if (isCoursePlayerPage) {
    return <div className="min-h-screen bg-[#010206] text-slate-200 selection:bg-emerald-500/30">{children}</div>;
  }

  // --- 100,000x PREMIUM DASHBOARD LAYOUT ---
  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#010206] overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* --- MOBILE HEADER (Cinematic Glassmorphism) --- */}
      <div className="md:hidden flex items-center justify-between bg-[#020510]/80 backdrop-blur-3xl border-b border-white/[0.04] px-5 py-4 shrink-0 z-50 relative shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[0.8rem] bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)]">
            <svg className="w-4 h-4 text-[#010206]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <span className="text-xl font-black text-white tracking-tight">
            Deeniyat<span className="text-emerald-400">.</span>
          </span>
        </Link>
        
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="text-slate-300 hover:text-white focus:outline-none p-2.5 bg-white/[0.03] rounded-xl border border-white/[0.05] hover:bg-white/[0.08] transition-all duration-300 active:scale-90"
        >
          {isMobileOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {/* --- MOBILE DRAWER OVERLAY --- */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-[#010206]/80 backdrop-blur-md z-40 md:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] bg-[#020510]/95 backdrop-blur-3xl border-r border-white/[0.04] flex flex-col shrink-0 shadow-[20px_0_60px_rgba(0,0,0,0.7)]"
            >
              <MobileSidebarContent pathname={pathname || ""} handleLogout={handleLogout} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- DESKTOP SIDEBAR (Spatial Engine) --- */}
      <aside className="hidden md:flex flex-col w-[280px] bg-[#02040b]/70 backdrop-blur-[40px] border-r border-white/[0.03] shrink-0 relative z-40 shadow-[10px_0_50px_rgba(0,0,0,0.5)]">
        {/* Subtle Inner Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>

        {/* Logo Area */}
        <div className="h-[100px] flex items-center px-8 border-b border-white/[0.03] shrink-0 relative z-10">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-[0.9rem] bg-gradient-to-br from-[#060d20] to-[#040814] border border-white/[0.08] flex items-center justify-center shadow-[0_8px_16px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:border-emerald-500/40 transition-colors duration-500 text-emerald-400 group-hover:shadow-[0_0_20px_rgba(52,211,153,0.3)]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <span className="text-[26px] font-black text-white tracking-tighter drop-shadow-md">
              Deeniyat<span className="text-emerald-400">.</span>
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-8 space-y-8 overflow-y-auto custom-scrollbar relative z-10">
          
          <div className="space-y-1.5">
            <NavLink href="/dashboard" currentPath={pathname || ""}>Overview</NavLink>
            <NavLink href="/dashboard/my-courses" currentPath={pathname || ""}>My Courses</NavLink>
          </div>

          {/* Student Tools Section */}
          <div className="space-y-1.5">
            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-4">Student Tools</p>
            <NavLink href="/dashboard/submit-assignment" currentPath={pathname || ""}>Submit Assignment</NavLink>
            <NavLink href="/dashboard/my-grades" currentPath={pathname || ""}>My Grades</NavLink>
          </div>

          {/* Teacher Tools Section */}
          <div className="space-y-1.5">
            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-4">Teacher Tools</p>
            <NavLink href="/dashboard/create-course" currentPath={pathname || ""}>Create Course</NavLink>
            <NavLink href="/dashboard/add-lesson" currentPath={pathname || ""}>Add Lesson</NavLink>
            <NavLink href="/dashboard/submissions" currentPath={pathname || ""}>Submissions</NavLink>
          </div>

          {/* Settings Section */}
          <div className="space-y-1.5">
            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-4">System</p>
            <NavLink href="/dashboard/transactions" currentPath={pathname || ""}>Transactions</NavLink>
            <NavLink href="/dashboard/attendance" currentPath={pathname || ""}>Attendance</NavLink>
            <NavLink href="/dashboard/settings" currentPath={pathname || ""}>Settings</NavLink>
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-6 border-t border-white/[0.03] shrink-0 relative z-10">
          <button
            onClick={handleLogout}
            className="group relative w-full flex items-center justify-center gap-3 px-4 py-4 rounded-[1.25rem] bg-white/[0.02] border border-white/[0.04] text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <svg className="w-5 h-5 relative z-10 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span className="font-bold tracking-wide relative z-10 text-[14px]">Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 relative bg-[#010206] h-full overflow-hidden">
         {/* Subtle Inner shadow on the main content area */}
         <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#010206] to-transparent z-20 pointer-events-none hidden md:block"></div>
         <div className="h-full w-full overflow-y-auto custom-scrollbar relative z-10">
            {children}
         </div>
      </main>

      {/* Custom Scrollbar Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }
      `}} />
    </div>
  );
}

// --- HOLOGRAPHIC NAV LINK COMPONENT ---
function NavLink({ href, currentPath, children }: { href: string, currentPath: string, children: React.ReactNode }) {
  const isActive = currentPath === href || (currentPath.startsWith(href) && href !== '/dashboard');

  return (
    <Link href={href} className="block relative group outline-none">
      <div className={`relative flex items-center gap-4 px-5 py-3.5 rounded-[1.25rem] transition-all duration-300 z-10 ${isActive ? "text-white" : "text-slate-400 hover:text-slate-200"}`}>
        
        {/* Animated Background Pill */}
        {isActive && (
          <motion.div 
            layoutId="sidebar-active-indicator"
            className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/20 rounded-[1.25rem] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] z-0"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}
        
        {/* Hover Background Pill */}
        {!isActive && (
          <div className="absolute inset-0 bg-white/[0.03] rounded-[1.25rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 border border-white/[0.02]"></div>
        )}

        {/* Content */}
        <span className={`relative z-10 font-bold text-[14px] tracking-wide transition-colors ${isActive ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : ""}`}>
          {children}
        </span>

        {/* Active Dot Indicator */}
        {isActive && (
          <div className="absolute right-5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)] animate-pulse z-10"></div>
        )}
      </div>
    </Link>
  );
}

// --- MOBILE SIDEBAR EXTRACTED COMPONENT ---
function MobileSidebarContent({ pathname, handleLogout }: { pathname: string, handleLogout: () => void }) {
  return (
    <div className="flex flex-col h-full bg-[#020510]">
      {/* Mobile Logo */}
      <div className="h-20 flex items-center px-6 border-b border-white/[0.04] shrink-0 bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#060d20] to-[#040814] border border-white/[0.08] flex items-center justify-center text-emerald-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <span className="text-2xl font-black text-white tracking-tight">Deeniyat.</span>
        </div>
      </div>

      {/* Mobile Nav Links */}
      <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          <NavLink href="/dashboard" currentPath={pathname}>Overview</NavLink>
          <NavLink href="/dashboard/my-courses" currentPath={pathname}>My Courses</NavLink>
        </div>

        <div className="space-y-1">
          <p className="px-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Student</p>
          <NavLink href="/dashboard/submit-assignment" currentPath={pathname}>Submit Assignment</NavLink>
          <NavLink href="/dashboard/my-grades" currentPath={pathname}>My Grades</NavLink>
        </div>

        <div className="space-y-1">
          <p className="px-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Teacher</p>
          <NavLink href="/dashboard/create-course" currentPath={pathname}>Create Course</NavLink>
          <NavLink href="/dashboard/add-lesson" currentPath={pathname}>Add Lesson</NavLink>
          <NavLink href="/dashboard/submissions" currentPath={pathname}>Submissions</NavLink>
        </div>

        <div className="space-y-1">
          <p className="px-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">System</p>
          <NavLink href="/dashboard/transactions" currentPath={pathname}>Transactions</NavLink>
          <NavLink href="/dashboard/attendance" currentPath={pathname}>Attendance</NavLink>
          <NavLink href="/dashboard/settings" currentPath={pathname}>Settings</NavLink>
        </div>
      </nav>

      {/* Mobile Logout */}
      <div className="p-5 border-t border-white/[0.04] shrink-0 bg-white/[0.01]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold active:scale-95 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Log Out
        </button>
      </div>
    </div>
  );
}