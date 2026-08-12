"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useAuth } from "../context/AuthContext";

// --- Framer Motion Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95, filter: "blur(15px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 350, damping: 28, mass: 0.8 } 
  }
};

// --- Epic Holographic Spatial Card ---
function TeacherCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 40, stiffness: 250, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springConfig);
  const [isHovered, setIsHovered] = useState(false);
  const [glarePosition, setGlarePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    setGlarePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      variants={itemVariants}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative overflow-hidden rounded-[2.5rem] bg-[#030612]/70 backdrop-blur-[40px] backdrop-saturate-[150%] border border-white/[0.06] shadow-[0_32px_64px_-20px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.5)] transition-colors duration-700 hover:border-white/[0.12] will-change-transform ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 z-0 mix-blend-color-dodge"
        style={{ opacity: isHovered ? 1 : 0, background: `radial-gradient(1000px circle at ${glarePosition.x}px ${glarePosition.y}px, rgba(96,165,250,0.12), transparent 45%)` }}
      />
      <div 
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 z-0"
        style={{ opacity: isHovered ? 0.3 : 0, boxShadow: `inset 0 0 40px rgba(59,130,246,0.1), inset 0 0 20px rgba(139,92,246,0.1)` }}
      />
      <div className="relative z-10 w-full h-full transform-gpu" style={{ transform: "translateZ(30px)" }}>
        {children}
      </div>
    </motion.div>
  );
}

// --- Cinematic Number Interpolation ---
function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }
    const duration = 2000;
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeProgress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  const progressRatio = value > 0 ? displayValue / value : 1;
  const fontWeight = 300 + (progressRatio * 600);
  const letterSpacing = -0.1 + (progressRatio * 0.05);

  return (
    <span style={{ fontWeight, letterSpacing: `${letterSpacing}em`, transition: 'font-weight 0.1s ease-out' }}>
      {displayValue}
    </span>
  );
}

export default function UstadOverview() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeState, setTimeState] = useState({ greeting: "Welcome back", icon: "✨", gradient: "from-blue-400 to-indigo-400" });
  
  const [stats, setStats] = useState({ totalStudents: 0, activeCourses: 0, pendingSubmissions: 0 });
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeState({ greeting: "Good morning", icon: "🌤️", gradient: "from-cyan-300 via-blue-400 to-indigo-500" });
    else if (hour < 18) setTimeState({ greeting: "Good afternoon", icon: "☀️", gradient: "from-blue-400 via-indigo-400 to-purple-500" });
    else setTimeState({ greeting: "Good evening", icon: "🌙", gradient: "from-indigo-400 via-purple-400 to-pink-500" });

    const fetchUstadStats = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/ustad-stats`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats({ 
            totalStudents: data.totalStudents || 0, 
            activeCourses: data.activeCourses || 0, 
            pendingSubmissions: data.pendingSubmissions || 0 
          });
        }
      } catch (error) {
        console.error("Error fetching Ustad stats:", error);
      } finally {
        setTimeout(() => setLoading(false), 1200); 
      }
    };

    fetchUstadStats();

    const handleGlobalMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [token]);

  const firstName = user?.name?.split(" ")[0] || "Ustad";

  return (
    <div className="relative w-full z-10">
      {/* Subtle Cursor Tracker Orb (Ustad Theme) */}
      <motion.div 
        className="fixed w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none z-0 mix-blend-screen"
        animate={{ x: cursorPos.x - 128, y: cursorPos.y - 128 }}
        transition={{ type: "spring", stiffness: 50, damping: 20, mass: 0.5 }}
      />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-10">
        
        {/* --- CINEMATIC HEADER --- */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="relative">
            <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.5, type: "spring", bounce: 0.6 }}
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),0_8px_24px_rgba(0,0,0,0.4)] mb-8 backdrop-blur-2xl"
            >
              <span className="text-xl drop-shadow-xl filter animate-pulse">{timeState.icon}</span>
              <span className="text-slate-300 font-bold tracking-[0.35em] text-[11px] uppercase bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-400">{timeState.greeting}</span>
            </motion.div>
            
            <h1 className="text-6xl sm:text-7xl lg:text-[6.5rem] font-black text-white tracking-tighter leading-[1.05] relative z-10">
              Lead the way,<br className="hidden sm:block lg:hidden" />
              <span className={`bg-clip-text text-transparent bg-gradient-to-r ${timeState.gradient} drop-shadow-[0_0_80px_rgba(255,255,255,0.15)] ml-0 sm:ml-4 lg:ml-0 inline-block`}>
                {firstName}.
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-5 bg-[#030612]/90 backdrop-blur-3xl px-8 py-5 rounded-[1.5rem] border border-white/[0.05] shadow-[0_32px_64px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.08)] transform-gpu hover:scale-105 transition-transform duration-500">
            <div className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 shadow-[0_0_16px_rgba(59,130,246,1)]"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase mb-0.5">Command Center</span>
              <span className="text-[14px] font-bold text-slate-200 tracking-wider">
                Online & Secure
              </span>
            </div>
          </div>
        </motion.div>

        {/* --- EPIC COMMAND CENTER BANNER --- */}
        <TeacherCard className="p-10 sm:p-14 group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-12 relative z-10">
            <div className="flex-1">
              <div className="w-20 h-20 rounded-[1.5rem] bg-[#030612] flex items-center justify-center border border-white/[0.08] text-slate-300 shadow-[0_0_40px_rgba(59,130,246,0.1),inset_0_2px_4px_rgba(255,255,255,0.05)] group-hover:scale-110 group-hover:border-blue-500/40 group-hover:text-blue-400 transition-all duration-700 mb-8">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter mb-4 drop-shadow-lg">Empower the Ummah.</h2>
              <p className="text-slate-400 text-lg sm:text-xl font-light max-w-2xl mix-blend-screen leading-relaxed">
                Your knowledge is a beacon. Manage your courses, review submissions, and guide your students to success.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full xl:w-auto shrink-0">
              <Link href="/dashboard/create-course" className="px-6 py-6 bg-white/[0.02] border border-white/[0.05] hover:bg-blue-500/10 hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] rounded-[1.5rem] flex flex-col items-center justify-center gap-3 transition-all active:scale-95 group/btn">
                <svg className="w-8 h-8 text-slate-400 group-hover/btn:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                <span className="text-[12px] font-bold uppercase tracking-widest text-slate-300 group-hover/btn:text-white">New Course</span>
              </Link>
              <Link href="/dashboard/add-lesson" className="px-6 py-6 bg-white/[0.02] border border-white/[0.05] hover:bg-indigo-500/10 hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] rounded-[1.5rem] flex flex-col items-center justify-center gap-3 transition-all active:scale-95 group/btn">
                <svg className="w-8 h-8 text-slate-400 group-hover/btn:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <span className="text-[12px] font-bold uppercase tracking-widest text-slate-300 group-hover/btn:text-white">Add Lesson</span>
              </Link>
              <Link href="/dashboard/submissions" className="px-6 py-6 bg-white/[0.02] border border-white/[0.05] hover:bg-amber-500/10 hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] rounded-[1.5rem] flex flex-col items-center justify-center gap-3 transition-all active:scale-95 group/btn">
                <svg className="w-8 h-8 text-slate-400 group-hover/btn:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                <span className="text-[12px] font-bold uppercase tracking-widest text-slate-300 group-hover/btn:text-white">Reviews</span>
              </Link>
              <Link href="/dashboard/attendance" className="px-6 py-6 bg-white/[0.02] border border-white/[0.05] hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(52,211,153,0.2)] rounded-[1.5rem] flex flex-col items-center justify-center gap-3 transition-all active:scale-95 group/btn">
                <svg className="w-8 h-8 text-slate-400 group-hover/btn:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                <span className="text-[12px] font-bold uppercase tracking-widest text-slate-300 group-hover/btn:text-white">Directory</span>
              </Link>
            </div>
          </div>
        </TeacherCard>

        {/* --- DYNAMIC STATS GRID (BENTO) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <TeacherCard className="group p-10">
            <div className="absolute bottom-0 right-0 w-[150%] h-40 text-blue-500/10 group-hover:text-blue-500/20 transition-colors duration-700 pointer-events-none">
              <svg className="w-full h-full filter drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]" viewBox="0 0 200 50" preserveAspectRatio="none">
                <path d="M0 50 Q 20 30, 50 45 T 150 25 L 200 15 L 200 50 Z" fill="currentColor" />
                {!loading && (
                  <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 3, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
                    d="M0 50 Q 20 30, 50 45 T 150 25 L 200 15" fill="none" stroke="url(#blueGradUstad)" strokeWidth="3" strokeLinecap="round"
                  />
                )}
                <defs>
                  <linearGradient id="blueGradUstad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="transparent" /><stop offset="100%" stopColor="#60a5fa" /></linearGradient>
                </defs>
              </svg>
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between gap-8">
              <div className="flex items-start justify-between">
                <div className="w-16 h-16 rounded-[1.25rem] bg-[#030612] flex items-center justify-center border border-blue-500/30 text-blue-400 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-[12px] font-black uppercase tracking-[0.3em] mb-2">Total Students</p>
                <div className="text-[5.5rem] leading-none font-black text-white tracking-tighter drop-shadow-2xl">
                  {loading ? <span className="text-slate-800 animate-pulse">0</span> : <AnimatedNumber value={stats.totalStudents} />}
                </div>
              </div>
            </div>
          </TeacherCard>

          <TeacherCard className="group p-10">
            <div className="absolute bottom-0 right-0 w-[150%] h-40 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors duration-700 pointer-events-none">
              <svg className="w-full h-full filter drop-shadow-[0_0_20px_rgba(99,102,241,0.6)]" viewBox="0 0 200 50" preserveAspectRatio="none">
                <path d="M0 50 Q 40 20, 80 40 T 160 10 L 200 5 L 200 50 Z" fill="currentColor" />
                {!loading && (
                  <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 3, ease: [0.16, 1, 0.3, 1], delay: 1 }}
                    d="M0 50 Q 40 20, 80 40 T 160 10 L 200 5" fill="none" stroke="url(#indigoGradUstad)" strokeWidth="3" strokeLinecap="round"
                  />
                )}
                <defs>
                  <linearGradient id="indigoGradUstad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="transparent" /><stop offset="100%" stopColor="#818cf8" /></linearGradient>
                </defs>
              </svg>
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between gap-8">
              <div className="flex items-start justify-between">
                <div className="w-16 h-16 rounded-[1.25rem] bg-[#030612] flex items-center justify-center border border-indigo-500/30 text-indigo-400 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-[12px] font-black uppercase tracking-[0.3em] mb-2">Active Courses</p>
                <div className="text-[5.5rem] leading-none font-black text-white tracking-tighter drop-shadow-2xl">
                  {loading ? <span className="text-slate-800 animate-pulse">0</span> : <AnimatedNumber value={stats.activeCourses} />}
                </div>
              </div>
            </div>
          </TeacherCard>

          <TeacherCard className="group p-10">
            <div className="absolute bottom-0 right-0 w-[150%] h-40 text-amber-500/10 group-hover:text-amber-500/20 transition-colors duration-700 pointer-events-none">
              <svg className="w-full h-full filter drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]" viewBox="0 0 200 50" preserveAspectRatio="none">
                <path d="M0 50 Q 30 10, 70 30 T 130 15 L 200 20 L 200 50 Z" fill="currentColor" />
                {!loading && (
                  <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 3, ease: [0.16, 1, 0.3, 1], delay: 1.2 }}
                    d="M0 50 Q 30 10, 70 30 T 130 15 L 200 20" fill="none" stroke="url(#amberGradUstad)" strokeWidth="3" strokeLinecap="round"
                  />
                )}
                <defs>
                  <linearGradient id="amberGradUstad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="transparent" /><stop offset="100%" stopColor="#fbbf24" /></linearGradient>
                </defs>
              </svg>
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between gap-8">
              <div className="flex items-start justify-between">
                <div className="w-16 h-16 rounded-[1.25rem] bg-[#030612] flex items-center justify-center border border-amber-500/30 text-amber-400 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                {!loading && stats.pendingSubmissions > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 1.5 }} className="bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.3)] flex items-center gap-2 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span> Action
                  </motion.span>
                )}
              </div>
              <div>
                <p className="text-slate-400 text-[12px] font-black uppercase tracking-[0.3em] mb-2">To Review</p>
                <div className="text-[5.5rem] leading-none font-black text-white tracking-tighter drop-shadow-2xl">
                  {loading ? <span className="text-slate-800 animate-pulse">0</span> : <AnimatedNumber value={stats.pendingSubmissions} />}
                </div>
              </div>
            </div>
          </TeacherCard>

        </div>

      </motion.div>
    </div>
  );
}