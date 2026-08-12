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
  hidden: { opacity: 0, y: 60, scale: 0.92, filter: "blur(25px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 350, damping: 28, mass: 0.8 } 
  }
};

// --- Epic Holographic Spatial Card (Matched to Screenshot Deep Blue Theme) ---
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
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(relX);
    mouseY.set(relY);
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
      className={`relative overflow-hidden rounded-[2.5rem] bg-[#050B14]/80 backdrop-blur-[40px] backdrop-saturate-[150%] border border-blue-500/[0.12] shadow-[0_32px_64px_-20px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.05),inset_0_-1px_2px_rgba(0,0,0,0.5)] transition-colors duration-700 hover:border-blue-400/[0.25] will-change-transform ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 z-0 mix-blend-color-dodge"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(1000px circle at ${glarePosition.x}px ${glarePosition.y}px, rgba(59,130,246,0.15), transparent 45%)`,
        }}
      />
      <div 
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 z-0"
        style={{
          opacity: isHovered ? 0.4 : 0,
          boxShadow: `inset 0 0 50px rgba(59,130,246,0.1), inset 0 0 20px rgba(168,85,247,0.1)`
        }}
      />
      <div className="relative z-10 w-full h-full transform-gpu" style={{ transform: "translateZ(30px)" }}>
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
      {displayValue}{suffix}
    </span>
  );
}

export default function UstadOverview() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // State for purely API driven data (NO DUMMY DATA)
  const [stats, setStats] = useState({ 
    totalStudents: 0, 
    activeCourses: 0, 
    pendingSubmissions: 0,
    recentActivities: [] as any[]
  });
  
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });

  // Math for the Circular Gauge (Matches screenshot purple-blue ring)
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  // Calculate dynamic fill (capping at 85% for pure visual aesthetics if it's 100%, or dynamic based on active vs total)
  // For the screenshot match, we'll keep it looking mostly full
  const fillPercentage = stats.totalStudents > 0 ? 0.85 : 0; 
  const strokeDashoffset = circumference - fillPercentage * circumference; 

  // Real API Data Fetch
  useEffect(() => {
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
            recentActivities: data.recentActivities || [] // Live timeline data
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="relative w-full z-10 pt-4">
      {/* Subtle Cursor Tracker Orb (Deep Blue Theme) */}
      <motion.div 
        className="fixed w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none z-0 mix-blend-screen"
        animate={{ x: cursorPos.x - 200, y: cursorPos.y - 200 }}
        transition={{ type: "spring", stiffness: 40, damping: 30, mass: 1 }}
      />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* --- ROW 1: SPATIAL BENTO GRID (MATCHES SCREENSHOT EXACTLY) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. Epic Command Banner */}
          <TeacherCard className="lg:col-span-2 group">
            <div className="p-12 sm:p-14 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-12 h-full relative z-10">
              
              <div className="flex-1 max-w-xl">
                {/* Glowing Outline Icon matching the screenshot */}
                <div className="w-[84px] h-[84px] rounded-[1.5rem] bg-[#020617] border border-blue-500/40 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(59,130,246,0.3),inset_0_2px_10px_rgba(59,130,246,0.2)] group-hover:scale-110 group-hover:border-blue-400 group-hover:shadow-[0_0_50px_rgba(59,130,246,0.5)] transition-all duration-700 text-blue-500">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                
                <h3 className="text-5xl sm:text-[4rem] leading-[1.05] font-black text-white mb-6 tracking-tighter drop-shadow-2xl">
                  Empower<br />the Ummah.
                </h3>
                <p className="text-slate-400 font-light text-xl leading-relaxed mix-blend-screen">
                  Your knowledge is a beacon.<br />Manage your courses, review<br />submissions, and guide your<br />students to success.
                </p>
              </div>
              
              {/* Exact Screenshot Button Layout */}
              <div className="flex flex-col gap-5 w-full xl:w-[240px] shrink-0">
                <Link href="/dashboard/create-course" className="w-full py-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-black rounded-full text-center transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:shadow-[0_0_60px_rgba(99,102,241,0.6)] hover:scale-[1.03] active:scale-95 group/btn">
                  <svg className="w-5 h-5 group-hover/btn:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                  <span className="text-[13px] uppercase tracking-[0.2em] pt-0.5">New Course</span>
                </Link>
                
                <Link href="/dashboard/add-lesson" className="w-full py-5 bg-[#030816] text-slate-300 font-black rounded-full text-center transition-all flex items-center justify-center gap-3 hover:bg-white/[0.05] hover:text-white hover:scale-[1.03] active:scale-95 border border-white/[0.08] shadow-inner">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span className="text-[13px] uppercase tracking-[0.2em] pt-0.5">Add Lesson</span>
                </Link>
              </div>
            </div>
          </TeacherCard>

          {/* 2. Global Reach Ring (Matches Screenshot) */}
          <TeacherCard className="group flex flex-col items-center justify-between text-center p-12">
            
            <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3 bg-[#020510]/80 px-6 py-3 rounded-full border border-blue-500/[0.15] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,1)] animate-pulse"></span>
              Global Reach
            </p>

            <div className="relative flex items-center justify-center w-64 h-64 my-6">
              <svg className="absolute w-0 h-0">
                <defs>
                  {/* Exact Blue to Magenta Gradient from your screenshot */}
                  <linearGradient id="globalReachGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" /> {/* Blue */}
                    <stop offset="50%" stopColor="#8b5cf6" /> {/* Violet */}
                    <stop offset="100%" stopColor="#d946ef" /> {/* Fuchsia */}
                  </linearGradient>
                  <filter id="glowEffect" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="12" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
              </svg>
              
              {/* Background Track */}
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
                  <span className="text-6xl font-black text-slate-800 animate-pulse">--</span>
                ) : (
                  <div className="flex items-start drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                    <span className="text-7xl font-black text-white tracking-tighter">
                      <CinematicNumber value={stats.totalStudents} />
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-[12px] text-slate-500 font-bold tracking-[0.25em] uppercase w-full">Total Active Students</p>
          </TeacherCard>
        </div>

        {/* --- ROW 2: EXTRA STATS GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          
          {/* Active Courses */}
          <TeacherCard className="group p-12">
            <div className="absolute bottom-0 right-0 w-[180%] h-48 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors duration-700 pointer-events-none">
              <svg className="w-full h-full filter drop-shadow-[0_0_20px_rgba(99,102,241,0.6)]" viewBox="0 0 200 50" preserveAspectRatio="none">
                <path d="M0 50 Q 40 30, 80 40 T 160 20 L 200 10 L 200 50 Z" fill="currentColor" />
                {!loading && (
                  <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 3, ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
                    d="M0 50 Q 40 30, 80 40 T 160 20 L 200 10" fill="none" stroke="url(#indigoGradExtra)" strokeWidth="3" strokeLinecap="round"
                  />
                )}
                <defs>
                  <linearGradient id="indigoGradExtra" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="transparent" /><stop offset="100%" stopColor="#818cf8" /></linearGradient>
                </defs>
              </svg>
            </div>
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="w-20 h-20 rounded-[1.5rem] bg-[#020617] flex items-center justify-center border border-indigo-500/30 text-indigo-400 mb-12 shadow-[0_0_40px_rgba(99,102,241,0.2),inset_0_2px_4px_rgba(255,255,255,0.05)] group-hover:border-indigo-400 group-hover:scale-110 transition-all duration-500">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <div>
                <p className="text-slate-400 text-[13px] font-black uppercase tracking-[0.3em] mb-4">Published Courses</p>
                <div className="text-[6rem] leading-none font-black text-white tracking-tighter drop-shadow-2xl">
                  {loading ? <span className="text-slate-800 animate-pulse">0</span> : <CinematicNumber value={stats.activeCourses} />}
                </div>
              </div>
            </div>
          </TeacherCard>

          {/* Pending Submissions */}
          <TeacherCard className="group p-12">
            <div className="absolute bottom-0 right-0 w-[180%] h-48 text-amber-500/10 group-hover:text-amber-500/20 transition-colors duration-700 pointer-events-none">
              <svg className="w-full h-full filter drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]" viewBox="0 0 200 50" preserveAspectRatio="none">
                <path d="M0 50 Q 30 20, 60 35 T 140 15 L 200 5 L 200 50 Z" fill="currentColor" />
                {!loading && (
                  <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 3, ease: [0.16, 1, 0.3, 1], delay: 1.1 }}
                    d="M0 50 Q 30 20, 60 35 T 140 15 L 200 5" fill="none" stroke="url(#amberGradExtra)" strokeWidth="3" strokeLinecap="round"
                  />
                )}
                <defs>
                  <linearGradient id="amberGradExtra" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="transparent" /><stop offset="100%" stopColor="#fbbf24" /></linearGradient>
                </defs>
              </svg>
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-12">
                <div className="w-20 h-20 rounded-[1.5rem] bg-[#020617] flex items-center justify-center border border-amber-500/30 text-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.2),inset_0_2px_4px_rgba(255,255,255,0.05)] group-hover:border-amber-400 group-hover:scale-110 transition-all duration-500">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                </div>
                {!loading && stats.pendingSubmissions > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 1.5 }} className="bg-amber-500/10 text-amber-400 text-[12px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.3)] flex items-center gap-3 backdrop-blur-md">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                    Action Required
                  </motion.span>
                )}
              </div>
              <div>
                <p className="text-slate-400 text-[13px] font-black uppercase tracking-[0.3em] mb-4">Pending Reviews</p>
                <div className="text-[6rem] leading-none font-black text-white tracking-tighter drop-shadow-2xl">
                  {loading ? <span className="text-slate-800 animate-pulse">0</span> : <CinematicNumber value={stats.pendingSubmissions} />}
                </div>
              </div>
            </div>
          </TeacherCard>

        </div>

        {/* --- ROW 3: REAL API LIVE ACTIVITY FEED --- */}
        <TeacherCard className="p-10 sm:p-16">
          <div className="flex justify-between items-center mb-20 pb-10 border-b border-white/[0.05] relative z-10">
            <h3 className="text-4xl font-black flex items-center gap-6 text-white tracking-tight drop-shadow-lg">
              Live Activity Feed
            </h3>
            <Link href="/dashboard/submissions" className="text-slate-300 hover:text-white text-[14px] font-bold uppercase tracking-widest transition-colors flex items-center gap-3 group bg-white/[0.02] hover:bg-white/[0.06] px-8 py-4 rounded-xl border border-white/[0.05] shadow-inner">
              Grade Now
              <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4-4m4-4H3" /></svg>
            </Link>
          </div>
          
          <div className="relative z-10">
            {/* Glowing Line for Timeline */}
            <div className="absolute left-[15px] top-6 bottom-6 w-1.5 bg-gradient-to-b from-blue-400 via-indigo-500 to-transparent rounded-full shadow-[0_0_30px_rgba(59,130,246,0.6)]"></div>

            {loading ? (
              <div className="space-y-16 pl-14">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex flex-col gap-5 relative">
                    <div className="absolute -left-[54px] top-1.5 w-6 h-6 rounded-full bg-[#020617] border-[5px] border-slate-700 shadow-[0_0_0_6px_#050B14]" />
                    <div className="h-8 bg-white/[0.03] rounded-lg w-1/4 animate-pulse"></div>
                    <div className="h-5 bg-white/[0.02] rounded-lg w-2/4 animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (!stats.recentActivities || stats.recentActivities.length === 0) ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-28 border border-dashed border-white/[0.08] rounded-[3rem] bg-white/[0.01]">
                <div className="w-28 h-28 bg-[#020617] rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-white/[0.08] shadow-[0_24px_48px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.05)]">
                  <svg className="w-14 h-14 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                </div>
                <p className="text-white font-black text-4xl mb-4 tracking-tight">Timeline is empty</p>
                <p className="text-slate-400 text-xl max-w-lg mx-auto font-light">As soon as students enroll or submit assignments, they will appear here live.</p>
              </motion.div>
            ) : (
              <div className="relative space-y-16 pb-6">
                <AnimatePresence>
                  {stats.recentActivities.map((act, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -40, filter: "blur(15px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} transition={{ delay: i * 0.2, type: "spring", stiffness: 350, damping: 25 }}
                      key={act.id} 
                      className="group relative pl-16"
                    >
                      {/* Timeline Glowing Orb */}
                      <div className="absolute left-[2px] top-3 w-[10px] h-[10px] rounded-full bg-white shadow-[0_0_30px_rgba(255,255,255,1)] group-hover:scale-[2.5] transition-transform duration-700 z-10" />
                      <div className="absolute left-[-4px] top-1.5 w-[22px] h-[22px] rounded-full bg-[#020617] border-[3px] border-blue-400 shadow-[0_0_0_6px_#050B14]" />
                      
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-6 p-10 -mt-10 rounded-[2.5rem] bg-white/[0.01] hover:bg-white/[0.03] transition-colors cursor-default border border-transparent hover:border-white/[0.08] hover:shadow-[0_24px_48px_rgba(0,0,0,0.4)]">
                        <div>
                          <h4 className="text-white font-black text-2xl mb-3 group-hover:text-blue-400 transition-colors tracking-tight">{act.title}</h4>
                          <p className="text-slate-400 text-lg font-light leading-relaxed max-w-3xl mix-blend-screen">{act.description}</p>
                        </div>
                        <div className="shrink-0 pt-2">
                          <span className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-400 bg-[#010206] px-6 py-3 rounded-full border border-white/[0.08] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] group-hover:border-blue-500/40 group-hover:text-blue-300 transition-colors inline-block">
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