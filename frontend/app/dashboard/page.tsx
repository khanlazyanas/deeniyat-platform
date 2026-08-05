"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants, useMotionValue, useSpring, useTransform } from "framer-motion";

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

// --- Hyper-Fluid Framer Motion Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.9, filter: "blur(20px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 350, damping: 25, mass: 1 } 
  }
};

// --- 1000x UPGRADE: 3D Spatial Spotlight Card ---
function SpatialCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Mouse position tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth spring physics for the 3D tilt
  const springConfig = { damping: 30, stiffness: 200, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), springConfig);

  const [isHovered, setIsHovered] = useState(false);
  const [glarePosition, setGlarePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    // Calculate relative mouse position (-0.5 to 0.5)
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    
    mouseX.set(relX);
    mouseY.set(relY);
    
    // Raw position for the glare effect
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
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
      }}
      className={`relative overflow-hidden rounded-[2rem] bg-[#020510]/80 backdrop-blur-3xl backdrop-saturate-200 border border-white/[0.05] shadow-[0_16px_32px_-10px_rgba(0,0,0,0.5),inset_0_1px_1px_0_rgba(255,255,255,0.1)] transition-colors duration-500 hover:border-white/[0.1] will-change-transform ${className}`}
    >
      {/* Interactive Glare/Spotlight */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 z-0 mix-blend-overlay"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(1000px circle at ${glarePosition.x}px ${glarePosition.y}px, rgba(255,255,255,0.15), transparent 40%)`,
        }}
      />
      {/* Subtle bottom shadow to enhance depth */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-b-[2rem]"></div>
      
      <div className="relative z-10 w-full h-full">{children}</div>
    </motion.div>
  );
}

// --- UPGRADE: Cinematic Number Interpolation ---
function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }
    
    // Easing curve logic for numbers (slows down at the end)
    const duration = 1500; 
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Ease Out Expo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setDisplayValue(Math.floor(easeProgress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
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
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.attendanceRate / 100) * circumference;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeState({ greeting: "Good morning", icon: "🌤️", gradient: "from-amber-200 via-orange-400 to-amber-500" });
    else if (hour < 18) setTimeState({ greeting: "Good afternoon", icon: "☀️", gradient: "from-blue-400 via-teal-400 to-emerald-400" });
    else setTimeState({ greeting: "Good evening", icon: "🌙", gradient: "from-indigo-400 via-purple-400 to-pink-500" });

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
      finally { setTimeout(() => setLoading(false), 900); } // Cinematic delay
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
    <div className="p-4 sm:p-6 lg:p-10 relative min-h-full w-full bg-[#010309] overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200 text-slate-50 font-sans perspective-[1000px]">
      
      {/* --- LIQUID MORPHING BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center mix-blend-screen opacity-60">
        <div className="absolute w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-gradient-to-tr from-emerald-500/20 via-teal-900/10 to-blue-600/20 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] blur-[120px] animate-liquid-morph"></div>
        <div className="absolute w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-gradient-to-bl from-purple-600/10 via-indigo-900/10 to-transparent rounded-[60%_40%_30%_70%/60%_30%_70%_40%] blur-[100px] animate-liquid-morph-reverse animation-delay-2000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay"></div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 max-w-7xl mx-auto space-y-10">
        
        {/* --- DYNAMIC HEADER --- */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pt-4">
          <div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, type: "spring", bounce: 0.5 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)] mb-6 backdrop-blur-xl"
            >
              <span className="text-lg drop-shadow-lg filter">{timeState.icon}</span>
              <span className="text-slate-300 font-bold tracking-[0.25em] text-[10px] uppercase">{timeState.greeting}</span>
            </motion.div>
            <h1 className="text-6xl sm:text-7xl lg:text-[5.5rem] font-black text-white tracking-tighter leading-[1.05]">
              Welcome back,<br className="hidden sm:block lg:hidden" />
              <span className={`bg-clip-text text-transparent bg-gradient-to-r ${timeState.gradient} drop-shadow-[0_0_60px_rgba(255,255,255,0.1)] ml-0 sm:ml-4 lg:ml-0`}>
                {userName}.
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-4 bg-[#020510]/90 backdrop-blur-3xl px-6 py-4 rounded-[1.25rem] border border-white/[0.06] shadow-[0_24px_48px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_12px_rgba(52,211,153,1)]"></span>
            </div>
            <span className="text-[13px] font-black text-slate-200 tracking-widest uppercase">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </motion.div>

        {/* --- 500x SPATIAL BENTO GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. Cinematic Resume Card */}
          <SpatialCard className="lg:col-span-2 group">
            <div className="p-10 sm:p-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-12 h-full relative z-10">
              <div className="flex-1">
                <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-[#060d20] to-[#040814] border border-white/[0.1] flex items-center justify-center mb-8 shadow-[0_16px_32px_rgba(0,0,0,0.5),inset_0_2px_2px_rgba(255,255,255,0.1)] group-hover:scale-110 group-hover:border-emerald-500/40 group-hover:text-emerald-400 group-hover:shadow-[0_0_30px_rgba(52,211,153,0.2)] transition-all duration-700 text-slate-300">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <h3 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter drop-shadow-md">Master Your Deen.</h3>
                <p className="text-slate-400 font-light max-w-lg text-lg sm:text-xl leading-relaxed">
                  The path of knowledge is continuous. Pick up exactly where you left off and complete your next milestone.
                </p>
              </div>
              
              <Link href="/dashboard/my-courses" className="shrink-0 w-full sm:w-auto px-12 py-6 bg-white text-slate-950 font-black rounded-[1.5rem] text-center transition-all flex items-center justify-center gap-4 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_80px_rgba(255,255,255,0.4)] hover:bg-slate-100 hover:scale-[1.05] active:scale-95 group/btn border border-white/20 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-slate-900/10 to-transparent group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                <span className="relative z-10 text-[16px] uppercase tracking-[0.2em]">Resume</span>
                <svg className="w-6 h-6 relative z-10 group-hover/btn:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4-4m4-4H3" /></svg>
              </Link>
            </div>
          </SpatialCard>

          {/* 2. Glass-morphic Attendance Ring */}
          <SpatialCard className="group flex flex-col items-center justify-center text-center p-10">
            <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.25em] mb-10 flex items-center gap-3 bg-[#040814]/50 px-5 py-2.5 rounded-full border border-white/[0.08] shadow-inner">
              <span className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_12px_rgba(45,212,191,1)] animate-pulse"></span>
              Attendance Core
            </p>

            <div className="relative flex items-center justify-center w-56 h-56 mb-4">
              <svg className="absolute w-0 h-0">
                <defs>
                  <linearGradient id="attendanceGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="50%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <filter id="hyperGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="12" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
              </svg>
              
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="112" cy="112" r={radius} stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/[0.03]" />
                {!loading && (
                  <motion.circle 
                    cx="112" cy="112" r={radius} 
                    stroke="url(#attendanceGrad2)" strokeWidth="10" fill="transparent" 
                    strokeDasharray={circumference} 
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 3, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
                    strokeLinecap="round" 
                    filter="url(#hyperGlow)"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {loading ? (
                  <span className="text-5xl font-black text-slate-800 animate-pulse">--</span>
                ) : (
                  <div className="flex items-start drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    <span className="text-6xl font-black text-white tracking-tighter">
                      <AnimatedNumber value={stats.attendanceRate} />
                    </span>
                    <span className="text-2xl font-bold text-teal-400 mt-1 ml-1">%</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium tracking-wide">Presence is the key to mastery.</p>
          </SpatialCard>
        </div>

        {/* --- STATS GRID WITH LIVE SVG DRAWING --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          
          <SpatialCard className="group p-10">
            <div className="absolute bottom-0 right-0 w-[150%] h-40 text-blue-500/10 group-hover:text-blue-500/20 transition-colors duration-700 pointer-events-none">
              <svg className="w-full h-full filter drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" viewBox="0 0 200 50" preserveAspectRatio="none">
                <path d="M0 50 Q 40 30, 80 40 T 160 20 L 200 10 L 200 50 Z" fill="currentColor" />
                {!loading && (
                  <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
                    d="M0 50 Q 40 30, 80 40 T 160 20 L 200 10" fill="none" stroke="url(#blueGrad2)" strokeWidth="3" strokeLinecap="round"
                  />
                )}
                <defs>
                  <linearGradient id="blueGrad2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="transparent" /><stop offset="100%" stopColor="#60a5fa" /></linearGradient>
                </defs>
              </svg>
            </div>
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="w-16 h-16 rounded-[1.25rem] bg-[#040814] flex items-center justify-center border border-blue-500/30 text-blue-400 mb-10 shadow-[0_0_30px_rgba(59,130,246,0.2),inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:border-blue-400 transition-colors duration-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <div>
                <p className="text-slate-400 text-[12px] font-black uppercase tracking-[0.25em] mb-2">Active Enrollments</p>
                <div className="text-[5rem] leading-none font-black text-white tracking-tighter drop-shadow-2xl">
                  {loading ? <span className="text-slate-800 animate-pulse">0</span> : <AnimatedNumber value={stats.enrolledCourses} />}
                </div>
              </div>
            </div>
          </SpatialCard>

          <SpatialCard className="group p-10">
            <div className="absolute bottom-0 right-0 w-[150%] h-40 text-amber-500/10 group-hover:text-amber-500/20 transition-colors duration-700 pointer-events-none">
              <svg className="w-full h-full filter drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" viewBox="0 0 200 50" preserveAspectRatio="none">
                <path d="M0 50 Q 30 20, 60 35 T 140 15 L 200 5 L 200 50 Z" fill="currentColor" />
                {!loading && (
                  <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
                    d="M0 50 Q 30 20, 60 35 T 140 15 L 200 5" fill="none" stroke="url(#amberGrad2)" strokeWidth="3" strokeLinecap="round"
                  />
                )}
                <defs>
                  <linearGradient id="amberGrad2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="transparent" /><stop offset="100%" stopColor="#fbbf24" /></linearGradient>
                </defs>
              </svg>
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-10">
                <div className="w-16 h-16 rounded-[1.25rem] bg-[#040814] flex items-center justify-center border border-amber-500/30 text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2),inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:border-amber-400 transition-colors duration-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                </div>
                {!loading && stats.pendingAssignments > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 1 }} className="bg-amber-500/10 text-amber-400 text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center gap-2.5 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                    Action Required
                  </motion.span>
                )}
              </div>
              <div>
                <p className="text-slate-400 text-[12px] font-black uppercase tracking-[0.25em] mb-2">Pending Tasks</p>
                <div className="text-[5rem] leading-none font-black text-white tracking-tighter drop-shadow-2xl">
                  {loading ? <span className="text-slate-800 animate-pulse">0</span> : <AnimatedNumber value={stats.pendingAssignments} />}
                </div>
              </div>
            </div>
          </SpatialCard>

        </div>

        {/* --- 500x LIQUID GRADIENT TIMELINE --- */}
        <SpatialCard className="p-8 sm:p-14">
          <div className="flex justify-between items-center mb-16 pb-8 border-b border-white/[0.06] relative z-10">
            <h3 className="text-3xl font-black flex items-center gap-5 text-white tracking-tight drop-shadow-md">
              Activity History
            </h3>
            <Link href="/dashboard" className="text-slate-300 hover:text-white text-[13px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 group bg-white/[0.03] hover:bg-white/[0.08] px-6 py-3 rounded-xl border border-white/[0.05]">
              View Log
              <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4-4m4-4H3" /></svg>
            </Link>
          </div>
          
          <div className="relative z-10">
            {/* Liquid Glowing Line */}
            <div className="absolute left-[13px] top-4 bottom-4 w-1 bg-gradient-to-b from-emerald-400 via-blue-500 to-transparent rounded-full shadow-[0_0_15px_rgba(52,211,153,0.5)]"></div>

            {loading ? (
              <div className="space-y-14 pl-12">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex flex-col gap-4 relative">
                    <div className="absolute -left-[45px] top-1.5 w-5 h-5 rounded-full bg-[#040814] border-4 border-slate-700 shadow-[0_0_0_4px_#020510]" />
                    <div className="h-6 bg-white/[0.03] rounded-lg w-1/4 animate-pulse"></div>
                    <div className="h-4 bg-white/[0.02] rounded-lg w-2/4 animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : stats.recentActivities.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 border border-dashed border-white/[0.08] rounded-[2.5rem] bg-white/[0.01]">
                <div className="w-24 h-24 bg-[#040814] rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/[0.08] shadow-[0_16px_32px_rgba(0,0,0,0.5),inset_0_2px_2px_rgba(255,255,255,0.05)]">
                  <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                </div>
                <p className="text-white font-black text-3xl mb-3 tracking-tight">Timeline is empty</p>
                <p className="text-slate-400 text-lg max-w-md mx-auto font-light">Milestones and activity logs will automatically flow here as you progress.</p>
              </motion.div>
            ) : (
              <div className="relative space-y-14 pb-4">
                <AnimatePresence>
                  {stats.recentActivities.map((act, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -30, filter: "blur(10px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} transition={{ delay: i * 0.15, type: "spring", stiffness: 350, damping: 25 }}
                      key={act.id} 
                      className="group relative pl-14"
                    >
                      {/* Timeline Glowing Orb */}
                      <div className="absolute left-[-1px] top-2 w-[8px] h-[8px] rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,1)] group-hover:scale-[2] transition-transform duration-500 z-10" />
                      <div className="absolute left-[-5px] top-1 w-[16px] h-[16px] rounded-full bg-[#040814] border-2 border-emerald-400 shadow-[0_0_0_4px_#020510]" />
                      
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 p-8 -mt-8 rounded-[2rem] bg-white/[0.01] hover:bg-white/[0.03] transition-colors cursor-default border border-transparent hover:border-white/[0.06] hover:shadow-[0_16px_32px_rgba(0,0,0,0.3)]">
                        <div>
                          <h4 className="text-white font-bold text-xl mb-2.5 group-hover:text-emerald-400 transition-colors tracking-tight">{act.title}</h4>
                          <p className="text-slate-400 text-base font-light leading-relaxed max-w-3xl">{act.description}</p>
                        </div>
                        <div className="shrink-0 pt-1">
                          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 bg-[#020510] px-5 py-2.5 rounded-full border border-white/[0.08] shadow-inner group-hover:border-emerald-500/40 group-hover:text-emerald-300 transition-colors">
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
        </SpatialCard>

      </motion.div>

      {/* Global CSS required for background animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes liquid-morph {
          0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(0deg); }
          33% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; transform: rotate(120deg); }
          66% { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; transform: rotate(240deg); }
          100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(360deg); }
        }
        @keyframes liquid-morph-reverse {
          0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: rotate(360deg); }
          33% { border-radius: 30% 70% 70% 30% / 30% 70% 30% 70%; transform: rotate(240deg); }
          66% { border-radius: 50% 50% 20% 80% / 20% 80% 50% 50%; transform: rotate(120deg); }
          100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: rotate(0deg); }
        }
        .animate-liquid-morph { animation: liquid-morph 20s linear infinite; }
        .animate-liquid-morph-reverse { animation: liquid-morph-reverse 25s linear infinite; }
      `}} />
    </div>
  );
}