"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
}

interface DashboardStats {
  enrolledCourses: number;
  pendingAssignments: number;
  attendanceRate: number;
  recentActivities: Activity[];
}

// Advanced Animation Variants with Explicit Typing to fix TS Error
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    // FIXED: Added 'as const' to prevent the generic string inference error
    transition: { type: "spring" as const, stiffness: 300, damping: 24 } 
  }
};

export default function DashboardOverview() {
  const [userName, setUserName] = useState("Scholar");
  const [stats, setStats] = useState<DashboardStats>({
    enrolledCourses: 0,
    pendingAssignments: 0,
    attendanceRate: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get User Name safely
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.name) {
          // Extract first name for a cleaner greeting
          setUserName(user.name.split(" ")[0]);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    // 2. Fetch Dashboard Stats from Backend
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setStats({
            enrolledCourses: data.enrolledCourses || 0,
            pendingAssignments: data.pendingAssignments || 0,
            attendanceRate: data.attendanceRate || 0,
            recentActivities: data.recentActivities || []
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        // Added a tiny artificial delay to ensure smooth skeleton exit if API is too fast
        setTimeout(() => setLoading(false), 600);
      }
    };

    fetchStats();
  }, []);

  // Helper to format date cleanly
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    
    if (isToday) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 relative overflow-hidden min-h-full w-full">
      
      {/* Absolute Background Ambient Glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen transform-gpu"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen transform-gpu"></div>

      <motion.div 
        className="relative z-10 max-w-7xl mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        {/* 1. BENTO GRID TOP ROW: Welcome & Quick Action */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Welcome Card (Spans 2 columns) */}
          <motion.div variants={itemVariants} className="lg:col-span-2 relative group overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-800 backdrop-blur-2xl p-8 sm:p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] ring-1 ring-white/5">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:bg-emerald-500/20 transition-colors duration-700 pointer-events-none"></div>
            
            <div className="relative z-10 h-full flex flex-col justify-center">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6 w-max shadow-[inset_0_0_10px_rgba(52,211,153,0.1)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Dashboard Overview
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4 leading-tight">
                Welcome back,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 drop-shadow-[0_0_20px_rgba(52,211,153,0.2)]">
                  {userName}.
                </span>
              </h1>
              <p className="text-slate-400 text-lg max-w-xl leading-relaxed font-light">
                "Allah elevates those among you who believe and those who are given knowledge." <span className="text-emerald-500/60 font-serif text-sm ml-2">(Al-Mujadila: 11)</span>
              </p>
            </div>
          </motion.div>

          {/* Quick Action / Resume Card */}
          <motion.div variants={itemVariants} className="relative group overflow-hidden rounded-[2rem] bg-gradient-to-b from-emerald-900/40 to-slate-900/60 border border-emerald-500/30 backdrop-blur-xl p-8 flex flex-col justify-between shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] ring-1 ring-white/10 hover:border-emerald-400/50 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Resume Learning</h3>
              <p className="text-sm text-emerald-200/70 mb-6">Pick up exactly where you left off in your latest course.</p>
            </div>
            
            <Link href="/dashboard/my-courses" className="w-full py-3.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-center shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:shadow-[0_0_30px_rgba(52,211,153,0.6)] hover:bg-emerald-400 transition-all active:scale-95 flex items-center justify-center gap-2">
              Continue
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4-4m4-4H3" /></svg>
            </Link>
          </motion.div>
        </div>

        {/* 2. STATS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Enrolled Courses Stat */}
          <motion.div variants={itemVariants} className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-[1.5rem] flex flex-col hover:border-blue-500/40 transition-all duration-300 hover:shadow-[0_15px_30px_-10px_rgba(59,130,246,0.15)] hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                Enrolled Courses
              </span>
            </div>
            {loading ? (
              <div className="h-12 w-20 bg-slate-800/80 rounded-lg animate-pulse"></div>
            ) : (
              <span className="text-4xl lg:text-5xl font-black text-white group-hover:text-blue-400 transition-colors drop-shadow-md">
                {stats.enrolledCourses}
              </span>
            )}
          </motion.div>

          {/* Pending Assignments Stat */}
          <motion.div variants={itemVariants} className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-[1.5rem] flex flex-col hover:border-amber-500/40 transition-all duration-300 hover:shadow-[0_15px_30px_-10px_rgba(245,158,11,0.15)] hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                Pending Assignments
              </span>
            </div>
            {loading ? (
              <div className="h-12 w-20 bg-slate-800/80 rounded-lg animate-pulse"></div>
            ) : (
              <div className="flex items-end gap-2">
                <span className="text-4xl lg:text-5xl font-black text-white group-hover:text-amber-400 transition-colors drop-shadow-md">
                  {stats.pendingAssignments}
                </span>
                {stats.pendingAssignments > 0 && <span className="mb-2 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">Needs Action</span>}
              </div>
            )}
          </motion.div>

          {/* Attendance Stat */}
          <motion.div variants={itemVariants} className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-[1.5rem] flex flex-col hover:border-teal-500/40 transition-all duration-300 hover:shadow-[0_15px_30px_-10px_rgba(20,184,166,0.15)] hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                Attendance Rate
              </span>
            </div>
            {loading ? (
              <div className="h-12 w-28 bg-slate-800/80 rounded-lg animate-pulse"></div>
            ) : (
              <span className="text-4xl lg:text-5xl font-black text-white group-hover:text-teal-400 transition-colors drop-shadow-md">
                {stats.attendanceRate}<span className="text-2xl lg:text-3xl text-slate-500 ml-1">%</span>
              </span>
            )}
          </motion.div>
        </div>

        {/* 3. RECENT ACTIVITY LIST */}
        <motion.div variants={itemVariants} className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              Recent Activity
            </h3>
            <Link href="/dashboard/my-courses" className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 rounded-lg border border-emerald-500/20">
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            <AnimatePresence mode="wait">
              {loading ? (
                // Elite Skeleton Loaders
                Array.from({ length: 3 }).map((_, i) => (
                  <motion.div 
                    key={`skeleton-${i}`}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-4 p-4 rounded-[1.25rem] bg-slate-800/30 border border-slate-700/30"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-700/50 animate-pulse shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 bg-slate-700/50 rounded animate-pulse"></div>
                      <div className="h-3 w-1/2 bg-slate-700/30 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 w-20 bg-slate-700/40 rounded-full animate-pulse shrink-0 hidden sm:block"></div>
                  </motion.div>
                ))
              ) : stats.recentActivities.length === 0 ? (
                // Premium Empty State
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-800/20 rounded-[1.5rem] border border-slate-700/30 border-dashed"
                >
                  <div className="w-16 h-16 bg-slate-800/80 rounded-2xl flex items-center justify-center mb-4 border border-slate-700">
                    <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                  </div>
                  <p className="text-slate-300 font-medium mb-1">It's quiet here...</p>
                  <p className="text-slate-500 text-sm">Your recent activities and milestones will appear here.</p>
                </motion.div>
              ) : (
                // Populated List
                stats.recentActivities.map((activity, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 300, damping: 24 }}
                    key={activity.id} 
                    className="group flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 rounded-[1.25rem] bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600 transition-all duration-300 cursor-default"
                  >
                    <div className="flex items-center gap-4">
                      {/* Dynamic Icon based on activity logic (Fallback to generic) */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shrink-0 border border-slate-600/50 group-hover:border-emerald-500/50 group-hover:shadow-[0_0_15px_rgba(52,211,153,0.2)] transition-all">
                        <svg className="w-6 h-6 text-slate-300 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div>
                        <p className="text-slate-200 font-bold text-sm sm:text-base group-hover:text-white transition-colors">{activity.title}</p>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 line-clamp-1">{activity.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pl-16 sm:pl-0">
                      <span className="text-xs font-semibold text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-700 shadow-inner shrink-0">
                        {formatDate(activity.date)}
                      </span>
                      {/* Subtle hover arrow */}
                      <svg className="w-5 h-5 text-slate-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}