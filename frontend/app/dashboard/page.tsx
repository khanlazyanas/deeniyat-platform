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

// --- Strict Framer Motion Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(12px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 300, damping: 24, mass: 1 } 
  }
};

export default function DashboardOverview() {
  const [userName, setUserName] = useState("Scholar");
  const [timeState, setTimeState] = useState({ greeting: "Welcome back", icon: "✨" });
  const [stats, setStats] = useState<DashboardStats>({
    enrolledCourses: 0,
    pendingAssignments: 0,
    attendanceRate: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  // Math for SVG Circular Progress
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.attendanceRate / 100) * circumference;

  useEffect(() => {
    // 1. Dynamic Time-Aware UI
    const hour = new Date().getHours();
    if (hour < 12) setTimeState({ greeting: "Good morning", icon: "🌤️" });
    else if (hour < 18) setTimeState({ greeting: "Good afternoon", icon: "☀️" });
    else setTimeState({ greeting: "Good evening", icon: "🌙" });

    // 2. Safely Get User Data
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.name) {
          setUserName(user.name.split(" ")[0]); 
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
        setTimeout(() => setLoading(false), 700); 
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 relative min-h-full w-full bg-[#020617] overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* --- ELITE GPU ACCELERATED MESH BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-500/10 rounded-full blur-[140px] mix-blend-screen transform-gpu animate-[pulse_8s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[45vw] h-[45vw] bg-blue-600/10 rounded-full blur-[140px] mix-blend-screen transform-gpu animate-[pulse_10s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay"></div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-7xl mx-auto space-y-8"
      >
        {/* --- HEADER --- */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] mb-4"
            >
              <span className="text-sm">{timeState.icon}</span>
              <span className="text-slate-300 font-medium tracking-wide text-xs uppercase">{timeState.greeting}</span>
            </motion.div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Welcome back, <br className="hidden sm:block lg:hidden" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-500 drop-shadow-[0_0_30px_rgba(52,211,153,0.2)]">
                {userName}.
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-[#060b18]/80 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/[0.05] shadow-[0_8px_16px_rgba(0,0,0,0.4)]">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
            <span className="text-sm font-semibold text-slate-300 tracking-wide">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </motion.div>

        {/* --- TOP BENTO GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Welcome & Quote Card (Col Span 2) */}
          <motion.div variants={itemVariants} className="lg:col-span-2 group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0a1128] to-[#040a18] border border-white/[0.06] p-8 sm:p-10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] hover:border-emerald-500/20 transition-colors duration-500">
            {/* Magnetic Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/0 via-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center mb-6 shadow-inner text-emerald-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">The pursuit of knowledge is endless.</h3>
                <p className="text-slate-400 font-light max-w-xl text-lg leading-relaxed mb-8">
                  "Allah elevates those among you who believe and those who are given knowledge." <br className="hidden sm:block" />
                  <span className="text-emerald-500/70 font-medium text-sm mt-2 block">— Al-Mujadila: 11</span>
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard/my-courses" className="px-8 py-3.5 bg-white text-slate-950 font-bold rounded-xl text-center transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:bg-slate-100 hover:scale-[1.02] active:scale-95">
                  Resume Learning
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4-4m4-4H3" /></svg>
                </Link>
                <Link href="/courses" className="px-8 py-3.5 bg-white/[0.05] text-white font-semibold rounded-xl text-center transition-all flex items-center justify-center gap-3 border border-white/[0.1] hover:bg-white/[0.1] hover:border-white/[0.2]">
                  Explore Catalog
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Elite SVG Gradient Radial Card (Attendance) */}
          <motion.div variants={itemVariants} className="group relative overflow-hidden rounded-[2rem] bg-[#060b18]/60 backdrop-blur-2xl border border-white/[0.06] p-8 flex flex-col items-center justify-center hover:border-teal-500/30 transition-all duration-500 shadow-[0_16px_32px_rgba(0,0,0,0.4)]">
            <div className="absolute top-0 right-0 p-6 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
              <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              Attendance Rate
            </p>

            <div className="relative flex items-center justify-center w-40 h-40 mb-4 drop-shadow-[0_0_15px_rgba(20,184,166,0.2)]">
              {/* SVG Definitions for Gradient */}
              <svg className="absolute w-0 h-0">
                <defs>
                  <linearGradient id="tealEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#0ea5e9" />
                  </linearGradient>
                </defs>
              </svg>
              
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/[0.05]" />
                {!loading && (
                  <motion.circle 
                    cx="80" cy="80" r={radius} 
                    stroke="url(#tealEmerald)" strokeWidth="8" fill="transparent" 
                    strokeDasharray={circumference} 
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 2, ease: "easeOut", delay: 0.4 }}
                    strokeLinecap="round" 
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {loading ? (
                  <span className="text-3xl font-black text-slate-600 animate-pulse">---</span>
                ) : (
                  <div className="flex items-start">
                    <span className="text-4xl font-black text-white group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-teal-400 transition-all">{stats.attendanceRate}</span>
                    <span className="text-lg font-bold text-slate-500 mt-1">%</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium text-center">Consistent presence unlocks mastery.</p>
          </motion.div>
        </div>

        {/* --- STATS GRID WITH SPARKLINE VIZ --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Enrolled Courses Stat */}
          <motion.div variants={itemVariants} className="group rounded-[2rem] bg-[#060b18]/60 backdrop-blur-xl border border-white/[0.06] p-8 hover:bg-white/[0.02] hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden shadow-lg">
            {/* Background Sparkline Graphic */}
            <svg className="absolute bottom-0 right-0 w-2/3 h-24 text-blue-500/10 group-hover:text-blue-500/20 transition-colors duration-500" viewBox="0 0 100 50" preserveAspectRatio="none">
              <path d="M0 50 Q 20 40, 40 30 T 80 10 L 100 0 L 100 50 Z" fill="currentColor" />
              <path d="M0 50 Q 20 40, 40 30 T 80 10 L 100 0" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Active Enrollments</p>
              <div className="flex items-end gap-3">
                {loading ? (
                  <div className="h-10 w-16 bg-slate-800 rounded-md animate-pulse"></div>
                ) : (
                  <span className="text-5xl font-black text-white drop-shadow-md">{stats.enrolledCourses}</span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Pending Tasks Stat */}
          <motion.div variants={itemVariants} className="group rounded-[2rem] bg-[#060b18]/60 backdrop-blur-xl border border-white/[0.06] p-8 hover:bg-white/[0.02] hover:border-amber-500/30 transition-all duration-300 relative overflow-hidden shadow-lg">
            {/* Background Sparkline Graphic */}
            <svg className="absolute bottom-0 right-0 w-2/3 h-24 text-amber-500/10 group-hover:text-amber-500/20 transition-colors duration-500" viewBox="0 0 100 50" preserveAspectRatio="none">
              <path d="M0 50 Q 15 30, 30 40 T 70 20 L 100 5 L 100 50 Z" fill="currentColor" />
              <path d="M0 50 Q 15 30, 30 40 T 70 20 L 100 5" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Pending Tasks</p>
              <div className="flex items-center gap-4">
                {loading ? (
                  <div className="h-10 w-16 bg-slate-800 rounded-md animate-pulse"></div>
                ) : (
                  <>
                    <span className="text-5xl font-black text-white drop-shadow-md">{stats.pendingAssignments}</span>
                    {stats.pendingAssignments > 0 ? (
                      <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                        Action Required
                      </span>
                    ) : (
                      <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border border-emerald-500/20">All caught up</span>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>

        </div>

        {/* --- ELITE TIMELINE (Apple Ecosystem Feel) --- */}
        <motion.div variants={itemVariants} className="rounded-[2rem] bg-[#060b18]/60 backdrop-blur-2xl border border-white/[0.06] p-6 sm:p-10 shadow-[0_16px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
          {/* Subtle noise inside the timeline box */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none"></div>

          <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/[0.05] relative z-10">
            <h3 className="text-2xl font-bold flex items-center gap-4 text-white">
              Recent Activity
            </h3>
            <Link href="/dashboard" className="text-slate-300 hover:text-white text-sm font-semibold transition-colors flex items-center gap-2 group">
              View History
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4-4m4-4H3" /></svg>
            </Link>
          </div>
          
          <div className="relative z-10">
            {loading ? (
              // Premium Skeleton Loader
              <div className="space-y-10 pl-6 border-l-2 border-slate-800/50 ml-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-6 relative">
                    <div className="absolute -left-[33px] top-1 w-4 h-4 rounded-full bg-slate-800 border-4 border-[#060b18]" />
                    <div className="flex-1 space-y-3">
                      <div className="h-6 bg-white/[0.03] rounded-md w-1/3 animate-pulse"></div>
                      <div className="h-4 bg-white/[0.02] rounded-md w-2/3 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : stats.recentActivities.length === 0 ? (
              // Empty State
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 border border-dashed border-white/[0.1] rounded-[1.5rem] bg-white/[0.01]">
                <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/[0.05] shadow-inner">
                  <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-white font-semibold text-lg mb-1">Your timeline is empty.</p>
                <p className="text-slate-500 text-sm">Complete lessons or assignments to see your progress here.</p>
              </motion.div>
            ) : (
              // Populated Timeline with animated dashed borders
              <div className="relative border-l-2 border-dashed border-slate-700/50 ml-3 space-y-12 pb-4">
                <AnimatePresence>
                  {stats.recentActivities.map((act, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15, type: "spring", stiffness: 300, damping: 25 }}
                      key={act.id} 
                      className="group relative pl-10"
                    >
                      {/* Timeline Node */}
                      <span className="absolute left-[-9px] top-1.5 w-4 h-4 rounded-full bg-slate-700 border-4 border-[#060b18] group-hover:bg-emerald-400 group-hover:scale-125 group-hover:shadow-[0_0_15px_rgba(52,211,153,0.8)] transition-all duration-300" />
                      
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3 bg-white/[0.01] hover:bg-white/[0.03] p-5 -mt-5 rounded-2xl border border-transparent hover:border-white/[0.05] transition-all cursor-default">
                        <div>
                          <h4 className="text-white font-bold text-lg mb-1.5 group-hover:text-emerald-400 transition-colors">{act.title}</h4>
                          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">{act.description}</p>
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-black/40 px-3 py-1.5 rounded-lg border border-white/[0.05] whitespace-nowrap self-start shadow-inner">
                          {formatDate(act.date)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}