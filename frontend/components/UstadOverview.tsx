"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { useAuth } from "../context/AuthContext";

// --- Framer Motion Variants (Optimized for 60fps - Removed heavy blurs) ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 350, damping: 28, mass: 0.8 } 
  }
};

// --- Epic Holographic Spatial Card (Emerald/Teal Ustad Theme - GPU OPTIMIZED) ---
function TeacherCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Motion Values to prevent React re-renders on mousemove
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glareX = useMotionValue(0);
  const glareY = useMotionValue(0);
  const isHovered = useMotionValue(0);
  
  const springConfig = { damping: 30, stiffness: 200, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), springConfig);

  const backgroundTemplate = useMotionTemplate`radial-gradient(800px circle at ${glareX}px ${glareY}px, rgba(52,211,153,0.12), transparent 45%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // 🛑 Disable 3D effect on mobile for smooth scrolling
    if (window.innerWidth < 768 || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    glareX.set(e.clientX - rect.left);
    glareY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = () => { if (window.innerWidth >= 768) isHovered.set(1); };
  const handleMouseLeave = () => {
    isHovered.set(0);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      variants={itemVariants}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-[#030612]/70 backdrop-blur-xl backdrop-saturate-[150%] border border-white/[0.06] shadow-[0_32px_64px_-20px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.5)] transition-colors duration-500 hover:border-emerald-500/[0.2] will-change-transform ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px z-0 mix-blend-color-dodge transition-opacity duration-300"
        style={{ opacity: isHovered, background: backgroundTemplate }}
      />
      <div 
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 z-0"
        style={{
          boxShadow: `inset 0 0 40px rgba(52,211,153,0.1), inset 0 0 20px rgba(45,212,191,0.05)`
        }}
      />
      <div className="relative z-10 w-full h-full transform-gpu" style={{ transform: "translateZ(20px)" }}>
        {children}
      </div>
    </motion.div>
  );
}

// --- Cinematic Number Interpolation ---
function CinematicNumber({ value, suffix = "" }: { value: number, suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }
    const duration = 1500; // Faster for snappier feel
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
      {displayValue}{suffix}
    </span>
  );
}

export default function UstadOverview() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Real API Data State
  const [stats, setStats] = useState({ 
    totalStudents: 0, 
    activeCourses: 0, 
    pendingSubmissions: 0,
    recentActivities: [] as any[]
  });
  
  const [timeState, setTimeState] = useState({ greeting: "Welcome back", icon: "✨", gradient: "from-emerald-400 to-teal-400" });

  // 🚀 Motion values for Global Cursor tracking (0 re-renders)
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const smoothCursorX = useSpring(cursorX, { stiffness: 40, damping: 20 });
  const smoothCursorY = useSpring(cursorY, { stiffness: 40, damping: 20 });

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - 0.85 * circumference; 

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeState({ greeting: "Good morning", icon: "🌤️", gradient: "from-emerald-300 via-teal-400 to-cyan-500" });
    else if (hour < 18) setTimeState({ greeting: "Good afternoon", icon: "☀️", gradient: "from-emerald-400 via-teal-400 to-emerald-500" });
    else setTimeState({ greeting: "Good evening", icon: "🌙", gradient: "from-teal-400 via-emerald-400 to-cyan-500" });

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
            pendingSubmissions: data.pendingSubmissions || 0,
            recentActivities: data.recentActivities || [] 
          });
        }
      } catch (error) {
        console.error("Error fetching Ustad stats:", error);
      } finally {
        setTimeout(() => setLoading(false), 800); 
      }
    };
    fetchUstadStats();

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return; // Disable heavy cursor on mobile
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [token, cursorX, cursorY]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const firstName = user?.name?.split(" ")[0] || "Ustad";

  return (
    <div className="relative w-full z-10 pt-4">
      {/* Subtle Cursor Tracker Orb (Green Theme - Hardware Accelerated) */}
      <motion.div 
        className="hidden md:block fixed w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none z-0 mix-blend-screen will-change-transform"
        style={{ x: useTransform(smoothCursorX, v => v - 200), y: useTransform(smoothCursorY, v => v - 200) }}
      />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* --- CINEMATIC HEADER (Admin Name & Date) --- */}
        <motion.div variants={itemVariants} className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 sm:gap-8 mb-8 sm:mb-16">
          <div className="relative">
            <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.2, type: "spring", bounce: 0.6 }}
              className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),0_8px_24px_rgba(0,0,0,0.4)] mb-6 sm:mb-8 backdrop-blur-xl"
            >
              <span className="text-lg sm:text-xl drop-shadow-xl filter animate-pulse">{timeState.icon}</span>
              <span className="text-slate-300 font-bold tracking-[0.2em] sm:tracking-[0.35em] text-[10px] sm:text-[11px] uppercase bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-400">{timeState.greeting}</span>
            </motion.div>
            
            <h1 className="text-5xl sm:text-7xl lg:text-[6.5rem] font-black text-white tracking-tighter leading-[1.05] relative z-10">
              Welcome back,<br className="hidden sm:block lg:hidden" />
              <span className={`bg-clip-text text-transparent bg-gradient-to-r ${timeState.gradient} drop-shadow-[0_0_80px_rgba(255,255,255,0.15)] mt-2 sm:mt-0 lg:ml-4 inline-block`}>
                {firstName}.
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-4 sm:gap-5 bg-[#030612]/80 backdrop-blur-xl px-6 sm:px-8 py-4 sm:py-5 rounded-[1.25rem] sm:rounded-[1.5rem] border border-white/[0.05] shadow-[0_16px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)] transform-gpu hover:scale-[1.02] transition-transform duration-300 w-full xl:w-auto mt-4 xl:mt-0">
            <div className="relative flex h-3 w-3 sm:h-4 sm:w-4 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 sm:h-4 sm:w-4 bg-emerald-500 shadow-[0_0_16px_rgba(52,211,153,1)]"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] sm:text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase mb-0.5">Current Date</span>
              <span className="text-[13px] sm:text-[14px] font-bold text-slate-200 tracking-wider">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </motion.div>

        {/* --- ROW 1: SPATIAL BENTO GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          <TeacherCard className="lg:col-span-2 group">
            <div className="p-8 sm:p-12 lg:p-16 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 sm:gap-12 h-full relative z-10">
              
              <div className="flex-1 max-w-xl">
                <div className="w-16 h-16 sm:w-[84px] sm:h-[84px] rounded-[1.25rem] sm:rounded-[1.5rem] bg-[#020617] border border-emerald-500/40 flex items-center justify-center mb-6 sm:mb-8 shadow-[0_0_30px_rgba(52,211,153,0.3),inset_0_2px_10px_rgba(52,211,153,0.2)] group-hover:scale-110 group-hover:border-emerald-400 group-hover:shadow-[0_0_50px_rgba(52,211,153,0.5)] transition-all duration-700 text-emerald-500">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                
                <h3 className="text-4xl sm:text-[4rem] leading-[1.05] font-black text-white mb-4 sm:mb-6 tracking-tighter drop-shadow-2xl">
                  Empower<br />the Ummah.
                </h3>
                <p className="text-slate-400 font-light text-lg sm:text-xl leading-relaxed mix-blend-screen">
                  Your knowledge is a beacon.<br className="hidden sm:block" />Manage your courses, review<br className="hidden sm:block" />submissions, and guide your<br className="hidden sm:block" />students to success.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row xl:flex-col gap-4 sm:gap-5 w-full xl:w-[240px] shrink-0 mt-4 xl:mt-0">
                <Link href="/dashboard/create-course" className="w-full py-4 sm:py-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black rounded-full text-center transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(52,211,153,0.4)] hover:shadow-[0_0_60px_rgba(52,211,153,0.6)] sm:hover:scale-[1.03] active:scale-95 group/btn">
                  <svg className="w-5 h-5 group-hover/btn:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                  <span className="text-[12px] sm:text-[13px] uppercase tracking-[0.2em] pt-0.5">New Course</span>
                </Link>
                
                <Link href="/dashboard/add-lesson" className="w-full py-4 sm:py-5 bg-[#030816] text-slate-300 font-black rounded-full text-center transition-all flex items-center justify-center gap-3 hover:bg-white/[0.05] hover:text-white sm:hover:scale-[1.03] active:scale-95 border border-white/[0.08] shadow-inner">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span className="text-[12px] sm:text-[13px] uppercase tracking-[0.2em] pt-0.5">Add Lesson</span>
                </Link>
              </div>
            </div>
          </TeacherCard>

          {/* 2. Global Reach Ring */}
          <TeacherCard className="group flex flex-col items-center justify-between text-center p-8 sm:p-12">
            
            <p className="text-slate-400 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center gap-2 sm:gap-3 bg-[#020510]/80 px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-emerald-500/[0.15] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(52,211,153,1)] animate-pulse"></span>
              Global Reach
            </p>

            <div className="relative flex items-center justify-center w-48 h-48 sm:w-64 sm:h-64 my-6">
              <svg className="absolute w-0 h-0">
                <defs>
                  <linearGradient id="globalReachGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" /> 
                    <stop offset="50%" stopColor="#14b8a6" /> 
                    <stop offset="100%" stopColor="#06b6d4" /> 
                  </linearGradient>
                  <filter id="glowEffect" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="12" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
              </svg>
              
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 256 256">
                <circle cx="128" cy="128" r={radius} stroke="currentColor" strokeWidth="20" fill="transparent" className="text-[#0a1228]" />
                {!loading && (
                  <motion.circle 
                    cx="128" cy="128" r={radius} 
                    stroke="url(#globalReachGrad)" strokeWidth="20" fill="transparent" 
                    strokeDasharray={circumference} 
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 3, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                    strokeLinecap="round" 
                    filter="url(#glowEffect)"
                  />
                )}
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {loading ? (
                  <span className="text-5xl sm:text-6xl font-black text-slate-800 animate-pulse">--</span>
                ) : (
                  <div className="flex items-start drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                    <span className="text-5xl sm:text-7xl font-black text-white tracking-tighter">
                      <CinematicNumber value={stats.totalStudents} />
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-[11px] sm:text-[12px] text-slate-500 font-bold tracking-[0.2em] sm:tracking-[0.25em] uppercase w-full">Total Active Students</p>
          </TeacherCard>
        </div>

        {/* --- ROW 2: EXTRA STATS GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Active Courses */}
          <TeacherCard className="group p-8 sm:p-12">
            <div className="absolute bottom-0 right-0 w-[180%] h-48 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors duration-700 pointer-events-none hidden sm:block">
              <svg className="w-full h-full filter drop-shadow-[0_0_20px_rgba(52,211,153,0.6)]" viewBox="0 0 200 50" preserveAspectRatio="none">
                <path d="M0 50 Q 40 30, 80 40 T 160 20 L 200 10 L 200 50 Z" fill="currentColor" />
                {!loading && (
                  <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 3, ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
                    d="M0 50 Q 40 30, 80 40 T 160 20 L 200 10" fill="none" stroke="url(#emeraldGradExtra)" strokeWidth="3" strokeLinecap="round"
                  />
                )}
                <defs>
                  <linearGradient id="emeraldGradExtra" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="transparent" /><stop offset="100%" stopColor="#34d399" /></linearGradient>
                </defs>
              </svg>
            </div>
            
            <div className="relative z-10 flex flex-col h-full justify-between min-h-[160px] sm:min-h-[200px]">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.25rem] sm:rounded-[1.5rem] bg-[#020617] flex items-center justify-center border border-emerald-500/30 text-emerald-400 mb-8 sm:mb-12 shadow-[0_0_40px_rgba(52,211,153,0.2),inset_0_2px_4px_rgba(255,255,255,0.05)] group-hover:border-emerald-400 group-hover:scale-110 transition-all duration-500">
                <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <div>
                <p className="text-slate-400 text-[11px] sm:text-[13px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-2 sm:mb-4">Published Courses</p>
                <div className="text-[4rem] sm:text-[5rem] lg:text-[6rem] leading-none font-black text-white tracking-tighter drop-shadow-2xl">
                  {loading ? <span className="text-slate-800 animate-pulse">0</span> : <CinematicNumber value={stats.activeCourses} />}
                </div>
              </div>
            </div>
          </TeacherCard>

          {/* Pending Submissions */}
          <TeacherCard className="group p-8 sm:p-12">
            <div className="absolute bottom-0 right-0 w-[180%] h-48 text-teal-500/10 group-hover:text-teal-500/20 transition-colors duration-700 pointer-events-none hidden sm:block">
              <svg className="w-full h-full filter drop-shadow-[0_0_20px_rgba(20,184,166,0.6)]" viewBox="0 0 200 50" preserveAspectRatio="none">
                <path d="M0 50 Q 30 20, 60 35 T 140 15 L 200 5 L 200 50 Z" fill="currentColor" />
                {!loading && (
                  <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 3, ease: [0.16, 1, 0.3, 1], delay: 1.1 }}
                    d="M0 50 Q 30 20, 60 35 T 140 15 L 200 5" fill="none" stroke="url(#tealGradExtra)" strokeWidth="3" strokeLinecap="round"
                  />
                )}
                <defs>
                  <linearGradient id="tealGradExtra" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="transparent" /><stop offset="100%" stopColor="#2dd4bf" /></linearGradient>
                </defs>
              </svg>
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between min-h-[160px] sm:min-h-[200px]">
              <div className="flex flex-row justify-between items-start gap-4 sm:gap-0 mb-8 sm:mb-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.25rem] sm:rounded-[1.5rem] bg-[#020617] flex items-center justify-center border border-teal-500/30 text-teal-400 shadow-[0_0_40px_rgba(20,184,166,0.2),inset_0_2px_4px_rgba(255,255,255,0.05)] group-hover:border-teal-400 group-hover:scale-110 transition-all duration-500">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                </div>
                {!loading && stats.pendingSubmissions > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 1 }} className="bg-teal-500/10 text-teal-400 text-[10px] sm:text-[12px] font-black uppercase tracking-widest px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-teal-500/30 shadow-[0_0_30px_rgba(20,184,166,0.3)] flex items-center gap-2 sm:gap-3 backdrop-blur-md">
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-teal-400 animate-ping"></span>
                    <span className="hidden sm:inline">Action Required</span>
                    <span className="sm:hidden">Required</span>
                  </motion.span>
                )}
              </div>
              <div>
                <p className="text-slate-400 text-[11px] sm:text-[13px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-2 sm:mb-4">Pending Reviews</p>
                <div className="text-[4rem] sm:text-[5rem] lg:text-[6rem] leading-none font-black text-white tracking-tighter drop-shadow-2xl">
                  {loading ? <span className="text-slate-800 animate-pulse">0</span> : <CinematicNumber value={stats.pendingSubmissions} />}
                </div>
              </div>
            </div>
          </TeacherCard>

        </div>

        {/* --- ROW 3: REAL API LIVE ACTIVITY FEED --- */}
        <TeacherCard className="p-6 sm:p-10 lg:p-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-0 mb-10 sm:mb-20 pb-8 sm:pb-10 border-b border-white/[0.05] relative z-10">
            <h3 className="text-3xl sm:text-4xl font-black flex items-center gap-4 sm:gap-6 text-white tracking-tight drop-shadow-lg">
              Live Activity Feed
            </h3>
            <Link href="/dashboard/submissions" className="w-full sm:w-auto text-center justify-center text-slate-300 hover:text-white text-[12px] sm:text-[14px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 sm:gap-3 group bg-white/[0.02] hover:bg-white/[0.06] px-6 sm:px-8 py-3 sm:py-4 rounded-xl border border-white/[0.05] shadow-inner">
              Grade Now
              <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4-4m4-4H3" /></svg>
            </Link>
          </div>
          
          <div className="relative z-10">
            {/* Glowing Line for Timeline */}
            <div className="absolute left-[11px] sm:left-[15px] top-4 sm:top-6 bottom-4 sm:bottom-6 w-1 sm:w-1.5 bg-gradient-to-b from-emerald-400 via-teal-500 to-transparent rounded-full shadow-[0_0_30px_rgba(52,211,153,0.6)]"></div>

            {loading ? (
              <div className="space-y-12 sm:space-y-16 pl-10 sm:pl-14">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex flex-col gap-4 sm:gap-5 relative">
                    <div className="absolute -left-[40px] sm:-left-[54px] top-1.5 w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-[#020617] border-[3px] sm:border-[5px] border-slate-700 shadow-[0_0_0_4px_#050B14] sm:shadow-[0_0_0_6px_#050B14]" />
                    <div className="h-6 sm:h-8 bg-white/[0.03] rounded-lg w-1/3 sm:w-1/4 animate-pulse"></div>
                    <div className="h-4 sm:h-5 bg-white/[0.02] rounded-lg w-2/3 sm:w-2/4 animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (!stats.recentActivities || stats.recentActivities.length === 0) ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 sm:py-28 border border-dashed border-white/[0.08] rounded-[2rem] sm:rounded-[3rem] bg-white/[0.01] px-4">
                <div className="w-20 h-20 sm:w-28 sm:h-28 bg-[#020617] rounded-[1.75rem] sm:rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 sm:mb-8 border border-white/[0.08] shadow-[0_24px_48px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.05)]">
                  <svg className="w-10 h-10 sm:w-14 sm:h-14 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                </div>
                <p className="text-white font-black text-2xl sm:text-4xl mb-3 sm:mb-4 tracking-tight">Timeline is empty</p>
                <p className="text-slate-400 text-base sm:text-xl max-w-lg mx-auto font-light">As soon as students enroll or submit assignments, they will appear here live.</p>
              </motion.div>
            ) : (
              <div className="relative space-y-12 sm:space-y-16 pb-6">
                <AnimatePresence>
                  {stats.recentActivities.map((act, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20, filter: "blur(10px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} transition={{ delay: i * 0.15, type: "spring", stiffness: 350, damping: 25 }}
                      key={act.id} 
                      className="group relative pl-10 sm:pl-16"
                    >
                      {/* Timeline Glowing Orb */}
                      <div className="absolute left-[-1px] sm:left-[2px] top-3 w-[8px] sm:w-[10px] h-[8px] sm:h-[10px] rounded-full bg-white shadow-[0_0_30px_rgba(255,255,255,1)] sm:group-hover:scale-[2.5] transition-transform duration-700 z-10" />
                      <div className="absolute left-[-6px] sm:left-[-4px] top-1.5 w-[18px] sm:w-[22px] h-[18px] sm:h-[22px] rounded-full bg-[#020617] border-[2px] sm:border-[3px] border-emerald-400 shadow-[0_0_0_4px_#050B14] sm:shadow-[0_0_0_6px_#050B14]" />
                      
                      <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-4 sm:gap-6 p-6 sm:p-10 -mt-6 sm:-mt-10 rounded-[2rem] sm:rounded-[2.5rem] bg-white/[0.01] sm:hover:bg-white/[0.03] transition-colors cursor-default border border-transparent sm:hover:border-white/[0.08] sm:hover:shadow-[0_24px_48px_rgba(0,0,0,0.4)]">
                        <div>
                          <h4 className="text-white font-black text-xl sm:text-2xl mb-2 sm:mb-3 sm:group-hover:text-emerald-400 transition-colors tracking-tight">{act.title}</h4>
                          <p className="text-slate-400 text-sm sm:text-lg font-light leading-relaxed max-w-3xl mix-blend-screen">{act.description}</p>
                        </div>
                        <div className="shrink-0 pt-2 lg:pt-0">
                          <span className="text-[10px] sm:text-[12px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-400 bg-[#010206] px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-white/[0.08] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] sm:group-hover:border-emerald-500/40 sm:group-hover:text-emerald-300 transition-colors inline-block">
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
        </TeacherCard>

      </motion.div>
    </div>
  );
}