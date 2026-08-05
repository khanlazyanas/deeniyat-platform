"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";

// --- Types ---
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

// --- Strict Framer Motion Variants (Zero TS Errors) ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    // 'as const' ensures TS knows exactly what type of spring this is
    transition: { type: "spring" as const, stiffness: 350, damping: 25 } 
  }
};

export default function DashboardOverview() {
  const [userName, setUserName] = useState("Scholar");
  const [greeting, setGreeting] = useState("Welcome back");
  const [stats, setStats] = useState<DashboardStats>({
    enrolledCourses: 0,
    pendingAssignments: 0,
    attendanceRate: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  // Math for SVG Circular Progress (Attendance)
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.attendanceRate / 100) * circumference;

  useEffect(() => {
    // 1. Dynamic Greeting based on Local Time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    // 2. Safely Get User Data
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.name) {
          setUserName(user.name.split(" ")[0]); // First name only
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    // 3. Fetch Dashboard Stats
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`, {
          headers: { "Authorization": `Bearer ${token}` }
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
        setTimeout(() => setLoading(false), 500); // Artificial smooth delay
      }
    };

    fetchStats();
  }, []);

  // Elite Date Formatter
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
    <div className="p-4 sm:p-6 lg:p-8 relative min-h-full w-full overflow-hidden">
      
      {/* --- GPU Accelerated Ambient Background Orbs --- */}
      <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen transform-gpu"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[35vw] h-[35vw] bg-teal-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen transform-gpu"></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-7xl mx-auto space-y-6"
      >
        {/* --- HEADER --- */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-emerald-400 font-bold tracking-widest uppercase text-xs mb-2 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {greeting}
            </p>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 drop-shadow-sm">{userName}.</span>
            </h1>
          </div>
          <div className="text-sm font-medium text-slate-400 bg-slate-900/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/[0.05]">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </motion.div>

        {/* --- TOP BENTO GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Resume Card (Col Span 2) */}
          <motion.div variants={itemVariants} className="lg:col-span-2 group relative overflow-hidden rounded-[24px] bg-[#060b18]/80 border border-white/[0.08] p-8 sm:p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)] hover:border-emerald-500/30 transition-all duration-500 backdrop-blur-2xl">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 h-full">
              <div className="flex-1">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.15)] group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Resume Your Journey</h3>
                <p className="text-slate-400 font-light max-w-md">Pick up exactly where you left off. Dive deep into your next scheduled lesson and master your curriculum.</p>
              </div>
              <Link href="/dashboard/my-courses" className="shrink-0 w-full sm:w-auto px-8 py-4 bg-white text-slate-950 font-bold rounded-xl text-center transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] hover:bg-slate-100 active:scale-95 group/btn">
                Continue Learning
                <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4-4m4-4H3" /></svg>
              </Link>
            </div>
          </motion.div>

          {/* Attendance Radial Card */}
          <motion.div variants={itemVariants} className="group overflow-hidden rounded-[24px] bg-[#060b18]/80 border border-white/[0.08] p-8 flex flex-col items-center justify-center relative hover:border-teal-500/30 transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
            <div className="absolute inset-0 bg-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-6">
              <span className="p-1.5 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
              Attendance Rate
            </p>

            <div className="relative flex items-center justify-center w-32 h-32 mb-2">
              <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_10px_rgba(20,184,166,0.3)]">
                {/* Background Track */}
                <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/[0.05]" />
                {/* Animated Foreground */}
                {!loading && (
                  <motion.circle 
                    cx="64" cy="64" r={radius} 
                    stroke="currentColor" strokeWidth="8" fill="transparent" 
                    strokeDasharray={circumference} 
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                    className="text-teal-400" 
                    strokeLinecap="round" 
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {loading ? (
                  <span className="text-2xl font-black text-slate-500 animate-pulse">...</span>
                ) : (
                  <div className="flex items-start">
                    <span className="text-3xl font-black text-white group-hover:text-teal-400 transition-colors">{stats.attendanceRate}</span>
                    <span className="text-sm font-bold text-slate-500 mt-1">%</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium">Keep up the great work!</p>
          </motion.div>
        </div>

        {/* --- STATS MINI CARDS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          <motion.div variants={itemVariants} className="group rounded-[24px] bg-gradient-to-br from-slate-900/50 to-[#060b18] border border-white/[0.05] p-6 hover:border-blue-500/30 transition-all duration-300 shadow-md backdrop-blur-xl relative overflow-hidden hover:-translate-y-1">
            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-blue-500/20 transition-all"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-1">Enrolled Courses</p>
                <div className="flex items-end gap-3">
                  {loading ? (
                    <div className="h-10 w-16 bg-slate-800 rounded-md animate-pulse"></div>
                  ) : (
                    <span className="text-4xl font-black text-white group-hover:text-blue-400 transition-colors drop-shadow-md">{stats.enrolledCourses}</span>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="group rounded-[24px] bg-gradient-to-br from-slate-900/50 to-[#060b18] border border-white/[0.05] p-6 hover:border-amber-500/30 transition-all duration-300 shadow-md backdrop-blur-xl relative overflow-hidden hover:-translate-y-1">
            <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-amber-500/20 transition-all"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-1">Pending Tasks</p>
                <div className="flex items-end gap-3">
                  {loading ? (
                    <div className="h-10 w-16 bg-slate-800 rounded-md animate-pulse"></div>
                  ) : (
                    <>
                      <span className="text-4xl font-black text-white group-hover:text-amber-400 transition-colors drop-shadow-md">{stats.pendingAssignments}</span>
                      {stats.pendingAssignments > 0 && <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-amber-500/20 mb-1.5 shadow-[0_0_10px_rgba(245,158,11,0.2)]">Action Required</span>}
                    </>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              </div>
            </div>
          </motion.div>

        </div>

        {/* --- ACTIVITY TIMELINE (iOS Native Feel) --- */}
        <motion.div variants={itemVariants} className="rounded-[24px] bg-[#060b18]/80 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/[0.05]">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </span>
              Recent Activity
            </h3>
            <Link href="/dashboard" className="text-slate-400 text-sm font-semibold hover:text-emerald-400 transition-colors bg-white/[0.03] hover:bg-white/[0.06] px-4 py-2 rounded-lg border border-white/[0.05]">View Timeline</Link>
          </div>
          
          {loading ? (
            // Elite Skeleton Loader for Timeline
            <div className="space-y-8 pl-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-6 relative">
                  <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-slate-800 border-2 border-[#060b18]" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-slate-800 rounded-md w-1/3 animate-pulse"></div>
                    <div className="h-4 bg-slate-800/50 rounded-md w-2/3 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : stats.recentActivities.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 border border-dashed border-white/[0.1] rounded-2xl bg-white/[0.01]">
              <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/[0.05]">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
              </div>
              <p className="text-slate-200 font-semibold text-lg mb-1">Your journey starts here.</p>
              <p className="text-slate-500 text-sm">Activities and milestones will automatically appear here as you progress.</p>
            </motion.div>
          ) : (
            <div className="relative border-l-2 border-slate-800 ml-4 space-y-10 pb-2">
              <AnimatePresence>
                {stats.recentActivities.map((act, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
                    key={act.id} 
                    className="group relative pl-8 hover:bg-white/[0.02] p-4 -my-4 rounded-2xl transition-colors cursor-default"
                  >
                    {/* Glowing Timeline Node */}
                    <span className="absolute left-[-25px] top-5 w-[14px] h-[14px] rounded-full bg-slate-700 border-4 border-[#060b18] group-hover:bg-emerald-500 group-hover:shadow-[0_0_15px_rgba(52,211,153,0.8)] transition-all duration-300" />
                    
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                      <div>
                        <h4 className="text-slate-200 font-bold text-lg mb-1 group-hover:text-emerald-400 transition-colors">{act.title}</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">{act.description}</p>
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/[0.05] whitespace-nowrap group-hover:text-emerald-300 group-hover:border-emerald-500/30 transition-colors self-start sm:self-auto">
                        {formatDate(act.date)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

      </motion.div>
    </div>
  );
}