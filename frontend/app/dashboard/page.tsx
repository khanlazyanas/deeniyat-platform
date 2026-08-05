"use client";

import { useEffect, useState, useRef } from "react";
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
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95, filter: "blur(15px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 400, damping: 30, mass: 0.8 } 
  }
};

// --- 500x UPGRADE: Cursor Tracking Spotlight Component ---
function SpotlightCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      variants={itemVariants}
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden rounded-[24px] bg-[#040814]/60 backdrop-blur-3xl backdrop-saturate-200 border border-white/[0.04] shadow-[0_8px_32px_0_rgba(0,0,0,0.4),inset_0_1px_1px_0_rgba(255,255,255,0.05)] transition-all duration-500 hover:border-white/[0.08] hover:shadow-[0_16px_48px_0_rgba(0,0,0,0.6),inset_0_1px_1px_0_rgba(255,255,255,0.1)] ${className}`}
    >
      {/* Spotlight Effect */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 z-0"
        style={{
          opacity,
          background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`,
        }}
      />
      <div className="relative z-10 w-full h-full">{children}</div>
    </motion.div>
  );
}

// --- 500x UPGRADE: Animated Number Interpolation ---
function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    
    // Smooth counting physics
    const duration = 1500; // 1.5 seconds
    const incrementTime = 30;
    const step = Math.ceil(end / (duration / incrementTime)) || 1;
    
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        clearInterval(timer);
        setDisplayValue(end);
      } else {
        setDisplayValue(start);
      }
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [value]);

  return <>{displayValue}</>;
}

export default function DashboardOverview() {
  const [userName, setUserName] = useState("Scholar");
  const [timeState, setTimeState] = useState({ greeting: "Welcome back", icon: "✨", gradient: "from-emerald-400 to-teal-400" });
  const [stats, setStats] = useState<DashboardStats>({
    enrolledCourses: 0,
    pendingAssignments: 0,
    attendanceRate: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  // SVG Radial Math
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.attendanceRate / 100) * circumference;

  useEffect(() => {
    // Advanced Time State
    const hour = new Date().getHours();
    if (hour < 12) setTimeState({ greeting: "Good morning", icon: "🌤️", gradient: "from-amber-300 to-orange-500" });
    else if (hour < 18) setTimeState({ greeting: "Good afternoon", icon: "☀️", gradient: "from-blue-400 to-emerald-400" });
    else setTimeState({ greeting: "Good evening", icon: "🌙", gradient: "from-indigo-400 to-purple-500" });

    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.name) setUserName(user.name.split(" ")[0]); 
      } catch (error) { console.error(error); }
    }

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
      } catch (error) { console.error(error); } 
      finally { setTimeout(() => setLoading(false), 800); }
    };
    fetchStats();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 relative min-h-full w-full bg-[#02040a] overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200 text-slate-50 font-sans">
      
      {/* --- HYPER-REALISTIC VOLUMETRIC BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="absolute top-[-25%] right-[-15%] w-[60vw] h-[60vw] bg-emerald-500/10 rounded-full blur-[160px] mix-blend-screen transform-gpu animate-[pulse_10s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-[-25%] left-[-15%] w-[55vw] h-[55vw] bg-blue-600/10 rounded-full blur-[160px] mix-blend-screen transform-gpu animate-[pulse_14s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute top-[30%] left-[20%] w-[30vw] h-[30vw] bg-purple-500/5 rounded-full blur-[140px] mix-blend-screen transform-gpu"></div>
        {/* Supreme Noise Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.025] mix-blend-overlay"></div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* --- HEADER --- */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <motion.div initial={{ opacity: 0, x: -20, filter: "blur(10px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} transition={{ delay: 0.3, type: "spring" }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] mb-5 backdrop-blur-md"
            >
              <span className="text-base drop-shadow-md">{timeState.icon}</span>
              <span className="text-slate-300 font-bold tracking-[0.2em] text-[10px] uppercase">{timeState.greeting}</span>
            </motion.div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[1.1]">
              Welcome back,<br className="hidden sm:block lg:hidden" />
              <span className={`bg-clip-text text-transparent bg-gradient-to-r ${timeState.gradient} drop-shadow-[0_0_40px_rgba(255,255,255,0.15)] ml-0 sm:ml-4 lg:ml-0`}>
                {userName}.
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-[#040814]/80 backdrop-blur-2xl px-6 py-3.5 rounded-2xl border border-white/[0.04] shadow-[0_16px_32px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.9)]"></div>
            <span className="text-[13px] font-bold text-slate-300 tracking-wide uppercase">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </motion.div>

        {/* --- 500x BENTO GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 1. Epic Resume Card */}
          <SpotlightCard className="lg:col-span-2 group p-0">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            
            <div className="p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-10 h-full relative z-10">
              <div className="flex-1">
                <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-[#060d20] to-[#040814] border border-white/[0.08] flex items-center justify-center mb-8 shadow-[0_8px_16px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:scale-110 group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-all duration-500 text-slate-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">Master Your Deen.</h3>
                <p className="text-slate-400 font-light max-w-md text-lg leading-relaxed">
                  Continue your journey of knowledge. Your next milestone is waiting for you.
                </p>
              </div>
              
              <Link href="/dashboard/my-courses" className="shrink-0 w-full sm:w-auto px-10 py-5 bg-white text-slate-950 font-bold rounded-[1.25rem] text-center transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] hover:bg-slate-100 hover:scale-[1.03] active:scale-95 group/btn border border-white/20 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-slate-900/10 to-transparent group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                <span className="relative z-10 text-[15px] uppercase tracking-widest">Resume Learning</span>
                <svg className="w-5 h-5 relative z-10 group-hover/btn:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4-4m4-4H3" /></svg>
              </Link>
            </div>
          </SpotlightCard>

          {/* 2. Flawless Attendance Ring */}
          <SpotlightCard className="group flex flex-col items-center justify-center text-center p-8">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 flex items-center gap-2 bg-white/[0.02] px-4 py-2 rounded-full border border-white/[0.05]">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]"></span>
              Attendance Core
            </p>

            <div className="relative flex items-center justify-center w-48 h-48 mb-4">
              {/* Dynamic Gradients */}
              <svg className="absolute w-0 h-0">
                <defs>
                  <linearGradient id="attendanceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="50%" stopColor="#2dd4bf" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
              </svg>
              
              <svg className="w-full h-full transform -rotate-90" style={{ filter: 'drop-shadow(0 0 12px rgba(45,212,191,0.2))' }}>
                <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/[0.03]" />
                {!loading && (
                  <motion.circle 
                    cx="96" cy="96" r={radius} 
                    stroke="url(#attendanceGrad)" strokeWidth="8" fill="transparent" 
                    strokeDasharray={circumference} 
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                    strokeLinecap="round" 
                    filter="url(#glow)"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {loading ? (
                  <span className="text-4xl font-black text-slate-700 animate-pulse">--</span>
                ) : (
                  <div className="flex items-start drop-shadow-md">
                    <span className="text-5xl font-black text-white tracking-tighter">
                      <AnimatedNumber value={stats.attendanceRate} />
                    </span>
                    <span className="text-xl font-bold text-teal-500 mt-1 ml-1">%</span>
                  </div>
                )}
              </div>
            </div>
          </SpotlightCard>
        </div>

        {/* --- STATS GRID WITH LIVE DRAWN SPARKLINES --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          <SpotlightCard className="group p-8">
            <div className="absolute bottom-0 right-0 w-[120%] h-32 text-blue-500/10 group-hover:text-blue-500/20 transition-colors duration-700 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 200 50" preserveAspectRatio="none">
                <path d="M0 50 Q 40 40, 80 30 T 160 10 L 200 0 L 200 50 Z" fill="currentColor" />
                {!loading && (
                  <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
                    d="M0 50 Q 40 40, 80 30 T 160 10 L 200 0" fill="none" stroke="url(#blueGrad)" strokeWidth="2" 
                  />
                )}
                <defs>
                  <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="transparent" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient>
                </defs>
              </svg>
            </div>
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="w-14 h-14 rounded-2xl bg-[#060d20] flex items-center justify-center border border-blue-500/20 text-blue-400 mb-8 shadow-[0_0_20px_rgba(59,130,246,0.15),inset_0_1px_1px_rgba(255,255,255,0.05)] group-hover:border-blue-500/40 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <div>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-2">Active Enrollments</p>
                <div className="text-6xl font-black text-white tracking-tighter drop-shadow-lg">
                  {loading ? <span className="text-slate-800 animate-pulse">0</span> : <AnimatedNumber value={stats.enrolledCourses} />}
                </div>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard className="group p-8">
            <div className="absolute bottom-0 right-0 w-[120%] h-32 text-amber-500/10 group-hover:text-amber-500/20 transition-colors duration-700 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 200 50" preserveAspectRatio="none">
                <path d="M0 50 Q 30 30, 60 40 T 140 20 L 200 5 L 200 50 Z" fill="currentColor" />
                {!loading && (
                  <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 2, ease: "easeInOut", delay: 0.7 }}
                    d="M0 50 Q 30 30, 60 40 T 140 20 L 200 5" fill="none" stroke="url(#amberGrad)" strokeWidth="2" 
                  />
                )}
                <defs>
                  <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="transparent" /><stop offset="100%" stopColor="#f59e0b" /></linearGradient>
                </defs>
              </svg>
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#0d0904] flex items-center justify-center border border-amber-500/20 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15),inset_0_1px_1px_rgba(255,255,255,0.05)] group-hover:border-amber-500/40 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                </div>
                {!loading && stats.pendingAssignments > 0 && (
                  <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                    Action Required
                  </span>
                )}
              </div>
              <div>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-2">Pending Tasks</p>
                <div className="text-6xl font-black text-white tracking-tighter drop-shadow-lg">
                  {loading ? <span className="text-slate-800 animate-pulse">0</span> : <AnimatedNumber value={stats.pendingAssignments} />}
                </div>
              </div>
            </div>
          </SpotlightCard>

        </div>

        {/* --- 500x LIQUID GRADIENT TIMELINE --- */}
        <SpotlightCard className="p-8 sm:p-12">
          <div className="flex justify-between items-center mb-12 pb-6 border-b border-white/[0.04] relative z-10">
            <h3 className="text-2xl font-bold flex items-center gap-4 text-white tracking-tight">
              Activity History
            </h3>
            <Link href="/dashboard" className="text-slate-400 hover:text-white text-[13px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 group">
              View Log
              <svg className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4-4m4-4H3" /></svg>
            </Link>
          </div>
          
          <div className="relative z-10">
            {/* Liquid Line */}
            <div className="absolute left-[11px] top-4 bottom-4 w-px bg-gradient-to-b from-emerald-500/50 via-blue-500/50 to-transparent"></div>

            {loading ? (
              <div className="space-y-12 pl-10">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex flex-col gap-3 relative">
                    <div className="absolute -left-[34px] top-1.5 w-3 h-3 rounded-full bg-slate-800 border-[3px] border-[#040814]" />
                    <div className="h-5 bg-white/[0.03] rounded-md w-1/4 animate-pulse"></div>
                    <div className="h-3 bg-white/[0.02] rounded-md w-2/4 animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : stats.recentActivities.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 border border-dashed border-white/[0.08] rounded-[2rem] bg-white/[0.01]">
                <div className="w-20 h-20 bg-white/[0.02] rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                  <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                </div>
                <p className="text-white font-bold text-xl mb-2 tracking-tight">Timeline is empty</p>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">Milestones and activity logs will automatically flow here as you progress.</p>
              </motion.div>
            ) : (
              <div className="relative space-y-12 pb-4">
                <AnimatePresence>
                  {stats.recentActivities.map((act, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20, filter: "blur(10px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} transition={{ delay: i * 0.15, type: "spring", stiffness: 300, damping: 25 }}
                      key={act.id} 
                      className="group relative pl-10"
                    >
                      {/* Timeline Glowing Orb */}
                      <div className="absolute left-[-2px] top-2 w-[5px] h-[5px] rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] group-hover:scale-150 transition-transform duration-500" />
                      <div className="absolute left-[-6px] top-1 w-[13px] h-[13px] rounded-full border-2 border-emerald-500/30 group-hover:border-emerald-400 transition-colors duration-500" />
                      
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 p-6 -mt-6 rounded-[1.5rem] hover:bg-white/[0.02] transition-colors cursor-default border border-transparent hover:border-white/[0.04]">
                        <div>
                          <h4 className="text-white font-bold text-lg mb-2 group-hover:text-emerald-400 transition-colors tracking-tight">{act.title}</h4>
                          <p className="text-slate-400 text-[15px] font-light leading-relaxed max-w-3xl">{act.description}</p>
                        </div>
                        <div className="shrink-0 pt-1">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 bg-black/40 px-4 py-2 rounded-full border border-white/[0.04] shadow-inner group-hover:border-emerald-500/20 group-hover:text-emerald-300 transition-colors">
                            {formatDate(act.date)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </SpotlightCard>

      </motion.div>
    </div>
  );
}