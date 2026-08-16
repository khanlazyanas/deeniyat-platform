"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants, useMotionValue, useSpring, useTransform } from "framer-motion";

// 👇 1. AUTH CONTEXT IMPORT
import { useAuth } from "../../context/AuthContext";
// 👇 2. USTAD OVERVIEW COMPONENT IMPORT
import UstadOverview from "../../components/UstadOverview";

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
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
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

// --- Holographic Spatial Card ---
function HolographicCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
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
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-[#030612]/70 backdrop-blur-[40px] backdrop-saturate-[150%] border border-white/[0.06] shadow-[0_32px_64px_-20px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.5)] transition-colors duration-700 hover:border-white/[0.12] will-change-transform ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 z-0 mix-blend-color-dodge"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(1200px circle at ${glarePosition.x}px ${glarePosition.y}px, rgba(255,255,255,0.1), transparent 45%)`,
        }}
      />
      <div 
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 z-0"
        style={{
          opacity: isHovered ? 0.3 : 0,
          boxShadow: `inset 0 0 40px rgba(52,211,153,0.1), inset 0 0 20px rgba(59,130,246,0.1)`
        }}
      />
      <div className="relative z-10 w-full h-full transform-gpu" style={{ transform: "translateZ(30px)" }}>
        {children}
      </div>
    </motion.div>
  );
}

// --- Variable Weight Number Interpolation ---
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

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
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

export default function Dashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [timeState, setTimeState] = useState({ greeting: "Welcome back", icon: "✨", gradient: "from-emerald-400 to-teal-400" });
  const [stats, setStats] = useState<DashboardStats>({
    enrolledCourses: 0,
    pendingAssignments: 0,
    attendanceRate: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });

  // SVG Circle calculation
  const radius = 90; 
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.attendanceRate / 100) * circumference;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeState({ greeting: "Good morning", icon: "🌤️", gradient: "from-amber-200 via-orange-400 to-rose-500" });
    else if (hour < 18) setTimeState({ greeting: "Good afternoon", icon: "☀️", gradient: "from-cyan-400 via-teal-400 to-emerald-500" });
    else setTimeState({ greeting: "Good evening", icon: "🌙", gradient: "from-indigo-400 via-purple-400 to-pink-500" });

    const fetchStats = async () => {
      if (!token) return;
      try {
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
      finally { setTimeout(() => setLoading(false), 1200); }
    };
    
    if (token) {
        fetchStats();
    }

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

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#010206] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 👇 Ustad Dashboard Switch
  if (user.role === "Ustad") {
      return (
        <div className="p-4 sm:p-6 lg:p-10 relative min-h-screen w-full bg-[#010206] overflow-hidden selection:bg-blue-500/30 selection:text-blue-200 text-slate-50 font-sans pt-24 sm:pt-32 z-10">
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center mix-blend-screen opacity-50">
              <div className="absolute w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] bg-gradient-to-tr from-blue-600/10 via-indigo-900/10 to-purple-800/10 rounded-full blur-[140px] animate-pulse"></div>
            </div>
            
            <div className="relative z-10 max-w-7xl mx-auto">
               <UstadOverview />
            </div>
        </div>
      );
  }

  // 👇 Student Dashboard
  const firstName = user.name.split(" ")[0] || "Scholar";

  return (
    <div className="p-4 sm:p-6 lg:p-10 relative min-h-full w-full bg-[#010206] overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200 text-slate-50 font-sans perspective-[2000px] pt-24 sm:pt-32">
      
      {/* --- HYPER-REALISTIC VOLUMETRIC BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center mix-blend-screen opacity-70">
        <div className="absolute w-[90vw] h-[90vw] max-w-[1000px] max-h-[1000px] bg-gradient-to-tr from-emerald-600/10 via-teal-900/10 to-blue-800/10 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] blur-[160px] animate-liquid-morph"></div>
        <div className="absolute w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] bg-gradient-to-bl from-purple-600/10 via-indigo-900/10 to-transparent rounded-[60%_40%_30%_70%/60%_30%_70%_40%] blur-[140px] animate-liquid-morph-reverse animation-delay-2000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay"></div>
      </div>

      <motion.div 
        className="hidden md:block fixed w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none z-0 mix-blend-screen"
        animate={{ x: cursorPos.x - 128, y: cursorPos.y - 128 }}
        transition={{ type: "spring", stiffness: 50, damping: 20, mass: 0.5 }}
      />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 max-w-7xl mx-auto space-y-8 sm:space-y-12">
        
        {/* --- CINEMATIC HEADER --- */}
        <motion.div variants={itemVariants} className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 sm:gap-8 mb-12 sm:mb-20 pt-4 sm:pt-8">
          <div className="relative">
            <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.5, type: "spring", bounce: 0.6 }}
              className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),0_8px_24px_rgba(0,0,0,0.4)] mb-6 sm:mb-8 backdrop-blur-2xl"
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

          <div className="flex items-center gap-4 sm:gap-5 bg-[#030612]/90 backdrop-blur-3xl px-6 sm:px-8 py-4 sm:py-5 rounded-[1.25rem] sm:rounded-[1.5rem] border border-white/[0.05] shadow-[0_32px_64px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.08)] transform-gpu hover:scale-105 transition-transform duration-500 w-full xl:w-auto mt-4 xl:mt-0">
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

        {/* --- SPATIAL BENTO GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          <HolographicCard className="lg:col-span-2 group">
            <div className="p-8 sm:p-12 lg:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 sm:gap-14 h-full relative z-10">
              <div className="flex-1">
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-[1.25rem] sm:rounded-[1.75rem] bg-gradient-to-br from-[#060d20] to-[#020510] border border-white/[0.08] flex items-center justify-center mb-6 sm:mb-10 shadow-[0_24px_48px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.1)] group-hover:scale-110 group-hover:border-emerald-500/40 group-hover:text-emerald-400 group-hover:shadow-[0_0_50px_rgba(52,211,153,0.25)] transition-all duration-700 text-slate-300">
                  <svg className="w-8 h-8 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <h3 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 tracking-tighter drop-shadow-xl">Master Your Deen.</h3>
                <p className="text-slate-400 font-light max-w-xl text-lg sm:text-xl lg:text-2xl leading-relaxed mix-blend-screen">
                  The path of knowledge is continuous. Pick up exactly where you left off and complete your next milestone.
                </p>
              </div>
              
              <Link href="/dashboard/my-courses" className="shrink-0 w-full md:w-auto px-8 sm:px-14 py-5 sm:py-7 bg-white text-slate-950 font-black rounded-[1.25rem] sm:rounded-[1.75rem] text-center transition-all flex items-center justify-center gap-3 sm:gap-4 shadow-[0_0_60px_rgba(255,255,255,0.15)] hover:shadow-[0_0_100px_rgba(255,255,255,0.4)] hover:bg-slate-100 hover:scale-[1.05] active:scale-95 group/btn border border-white/20 relative overflow-hidden mt-4 md:mt-0">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-slate-900/10 to-transparent group-hover/btn:animate-[shimmer_1s_infinite] pointer-events-none"></div>
                <span className="relative z-10 text-[16px] sm:text-[18px] uppercase tracking-[0.2em] sm:tracking-[0.25em]">Resume</span>
                <svg className="w-6 h-6 sm:w-7 sm:h-7 relative z-10 group-hover/btn:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4-4m4-4H3" /></svg>
              </Link>
            </div>
          </HolographicCard>

          <HolographicCard className="group flex flex-col items-center justify-center text-center p-8 sm:p-12">
            <p className="text-slate-400 text-[10px] sm:text-[12px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-8 sm:mb-12 flex items-center gap-2 sm:gap-3 bg-[#030612]/50 px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-white/[0.08] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-teal-400 shadow-[0_0_16px_rgba(45,212,191,1)] animate-pulse"></span>
              Attendance Core
            </p>

            <div className="relative flex items-center justify-center w-48 h-48 sm:w-64 sm:h-64 mb-4 sm:mb-6">
              <svg className="absolute w-0 h-0">
                <defs>
                  <linearGradient id="attendanceGradExtreme" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="50%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <filter id="hyperGlowExtreme" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="16" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
              </svg>
              
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 256 256">
                <circle cx="128" cy="128" r={radius} stroke="currentColor" strokeWidth="16" fill="transparent" className="text-white/[0.02]" />
                {!loading && (
                  <motion.circle 
                    cx="128" cy="128" r={radius} 
                    stroke="url(#attendanceGradExtreme)" strokeWidth="16" fill="transparent" 
                    strokeDasharray={circumference} 
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 3.5, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
                    strokeLinecap="round" 
                    filter="url(#hyperGlowExtreme)"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {loading ? (
                  <span className="text-5xl sm:text-6xl font-black text-slate-800 animate-pulse">--</span>
                ) : (
                  <div className="flex items-start drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                    <span className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tighter">
                      <CinematicNumber value={stats.attendanceRate} />
                    </span>
                    <span className="text-2xl sm:text-3xl font-bold text-teal-400 mt-1 sm:mt-2 ml-1">%</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm sm:text-base text-slate-500 font-medium tracking-widest uppercase mt-2">Presence unlocks mastery.</p>
          </HolographicCard>
        </div>

        {/* --- STATS GRID WITH LIVE SVG DRAWING --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          
          <HolographicCard className="group p-8 sm:p-12">
            <div className="absolute bottom-0 right-0 w-[180%] h-48 text-blue-500/10 group-hover:text-blue-500/20 transition-colors duration-700 pointer-events-none">
              <svg className="w-full h-full filter drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]" viewBox="0 0 200 50" preserveAspectRatio="none">
                <path d="M0 50 Q 40 30, 80 40 T 160 20 L 200 10 L 200 50 Z" fill="currentColor" />
                {!loading && (
                  <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 3, ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
                    d="M0 50 Q 40 30, 80 40 T 160 20 L 200 10" fill="none" stroke="url(#blueGradExtreme)" strokeWidth="3" strokeLinecap="round"
                  />
                )}
                <defs>
                  <linearGradient id="blueGradExtreme" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="transparent" /><stop offset="100%" stopColor="#60a5fa" /></linearGradient>
                </defs>
              </svg>
            </div>
            
            <div className="relative z-10 flex flex-col h-full justify-between min-h-[200px] sm:min-h-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.25rem] sm:rounded-[1.5rem] bg-[#030612] flex items-center justify-center border border-blue-500/30 text-blue-400 mb-8 sm:mb-12 shadow-[0_0_40px_rgba(59,130,246,0.2),inset_0_2px_4px_rgba(255,255,255,0.1)] group-hover:border-blue-400 group-hover:scale-110 transition-all duration-500">
                <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <div>
                <p className="text-slate-400 text-[11px] sm:text-[13px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-2 sm:mb-4">Active Enrollments</p>
                <div className="text-[4.5rem] sm:text-[5rem] lg:text-[6rem] leading-none font-black text-white tracking-tighter drop-shadow-2xl">
                  {loading ? <span className="text-slate-800 animate-pulse">0</span> : <CinematicNumber value={stats.enrolledCourses} />}
                </div>
              </div>
            </div>
          </HolographicCard>

          <HolographicCard className="group p-8 sm:p-12">
            <div className="absolute bottom-0 right-0 w-[180%] h-48 text-amber-500/10 group-hover:text-amber-500/20 transition-colors duration-700 pointer-events-none">
              <svg className="w-full h-full filter drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]" viewBox="0 0 200 50" preserveAspectRatio="none">
                <path d="M0 50 Q 30 20, 60 35 T 140 15 L 200 5 L 200 50 Z" fill="currentColor" />
                {!loading && (
                  <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 3, ease: [0.16, 1, 0.3, 1], delay: 1.1 }}
                    d="M0 50 Q 30 20, 60 35 T 140 15 L 200 5" fill="none" stroke="url(#amberGradExtreme)" strokeWidth="3" strokeLinecap="round"
                  />
                )}
                <defs>
                  <linearGradient id="amberGradExtreme" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="transparent" /><stop offset="100%" stopColor="#fbbf24" /></linearGradient>
                </defs>
              </svg>
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between min-h-[200px] sm:min-h-0">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 mb-8 sm:mb-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.25rem] sm:rounded-[1.5rem] bg-[#030612] flex items-center justify-center border border-amber-500/30 text-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.2),inset_0_2px_4px_rgba(255,255,255,0.1)] group-hover:border-amber-400 group-hover:scale-110 transition-all duration-500">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                </div>
                {!loading && stats.pendingAssignments > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 1.5 }} className="bg-amber-500/10 text-amber-400 text-[10px] sm:text-[12px] font-black uppercase tracking-widest px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.3)] flex items-center gap-2 sm:gap-3 backdrop-blur-md">
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                    Action Required
                  </motion.span>
                )}
              </div>
              <div>
                <p className="text-slate-400 text-[11px] sm:text-[13px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-2 sm:mb-4">Pending Tasks</p>
                <div className="text-[4.5rem] sm:text-[5rem] lg:text-[6rem] leading-none font-black text-white tracking-tighter drop-shadow-2xl">
                  {loading ? <span className="text-slate-800 animate-pulse">0</span> : <CinematicNumber value={stats.pendingAssignments} />}
                </div>
              </div>
            </div>
          </HolographicCard>

        </div>

        {/* --- LIQUID GRADIENT TIMELINE --- */}
        <HolographicCard className="p-6 sm:p-10 lg:p-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-0 mb-12 sm:mb-20 pb-8 sm:pb-10 border-b border-white/[0.05] relative z-10">
            <h3 className="text-3xl sm:text-4xl font-black flex items-center gap-4 sm:gap-6 text-white tracking-tight drop-shadow-lg">
              Activity History
            </h3>
            <Link href="/dashboard" className="w-full sm:w-auto text-center justify-center text-slate-300 hover:text-white text-[12px] sm:text-[14px] font-bold uppercase tracking-widest transition-colors flex items-center gap-3 group bg-white/[0.02] hover:bg-white/[0.06] px-6 sm:px-8 py-3 sm:py-4 rounded-xl border border-white/[0.05] shadow-inner">
              View Log
              <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4-4m4-4H3" /></svg>
            </Link>
          </div>
          
          <div className="relative z-10">
            {/* Timeline Line adjusted for mobile */}
            <div className="absolute left-[11px] sm:left-[15px] top-6 bottom-6 w-1 sm:w-1.5 bg-gradient-to-b from-emerald-400 via-blue-500 to-transparent rounded-full shadow-[0_0_30px_rgba(52,211,153,0.6)]"></div>

            {loading ? (
              <div className="space-y-12 sm:space-y-16 pl-10 sm:pl-14">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex flex-col gap-4 sm:gap-5 relative">
                    <div className="absolute -left-[40px] sm:-left-[54px] top-1.5 w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-[#030612] border-[3px] sm:border-[5px] border-slate-700 shadow-[0_0_0_4px_#010206] sm:shadow-[0_0_0_6px_#010206]" />
                    <div className="h-6 sm:h-8 bg-white/[0.03] rounded-lg w-1/3 sm:w-1/4 animate-pulse"></div>
                    <div className="h-4 sm:h-5 bg-white/[0.02] rounded-lg w-2/3 sm:w-2/4 animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : stats.recentActivities.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 sm:py-28 border border-dashed border-white/[0.08] rounded-[2rem] sm:rounded-[3rem] bg-white/[0.01] px-4">
                <div className="w-20 h-20 sm:w-28 sm:h-28 bg-[#030612] rounded-[1.75rem] sm:rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 sm:mb-8 border border-white/[0.08] shadow-[0_24px_48px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.05)]">
                  <svg className="w-10 h-10 sm:w-14 sm:h-14 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                </div>
                <p className="text-white font-black text-2xl sm:text-4xl mb-3 sm:mb-4 tracking-tight">Timeline is empty</p>
                <p className="text-slate-400 text-base sm:text-xl max-w-lg mx-auto font-light">Milestones and activity logs will automatically flow here as you progress.</p>
              </motion.div>
            ) : (
              <div className="relative space-y-12 sm:space-y-16 pb-6">
                <AnimatePresence>
                  {stats.recentActivities.map((act, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20, filter: "blur(10px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} transition={{ delay: i * 0.2, type: "spring", stiffness: 350, damping: 25 }}
                      key={act.id} 
                      className="group relative pl-10 sm:pl-16"
                    >
                      <div className="absolute left-[-1px] sm:left-[2px] top-3 w-[8px] sm:w-[10px] h-[8px] sm:h-[10px] rounded-full bg-white shadow-[0_0_30px_rgba(255,255,255,1)] group-hover:scale-[2] sm:group-hover:scale-[2.5] transition-transform duration-700 z-10" />
                      <div className="absolute left-[-6px] sm:left-[-4px] top-1.5 w-[18px] sm:w-[22px] h-[18px] sm:h-[22px] rounded-full bg-[#030612] border-[2px] sm:border-[3px] border-emerald-400 shadow-[0_0_0_4px_#010206] sm:shadow-[0_0_0_6px_#010206]" />
                      
                      <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-4 sm:gap-6 p-6 sm:p-10 -mt-6 sm:-mt-10 rounded-[2rem] sm:rounded-[2.5rem] bg-white/[0.01] hover:bg-white/[0.02] transition-colors cursor-default border border-transparent hover:border-white/[0.05] hover:shadow-[0_24px_48px_rgba(0,0,0,0.4)]">
                        <div>
                          <h4 className="text-white font-black text-xl sm:text-2xl mb-2 sm:mb-3 group-hover:text-emerald-400 transition-colors tracking-tight">{act.title}</h4>
                          <p className="text-slate-400 text-sm sm:text-lg font-light leading-relaxed max-w-3xl mix-blend-screen">{act.description}</p>
                        </div>
                        <div className="shrink-0 pt-2 lg:pt-0">
                          <span className="text-[10px] sm:text-[12px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-400 bg-[#010206] px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-white/[0.08] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] group-hover:border-emerald-500/40 group-hover:text-emerald-300 transition-colors inline-block">
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
        </HolographicCard>

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