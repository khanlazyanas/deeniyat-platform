"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, useScroll, AnimatePresence, useMotionTemplate, Variants } from "framer-motion";

interface Course {
  _id: string;
  title: string;
  description: string;
  level: string;
  thumbnail?: string;
  instructor?: {
    name: string;
  };
}

// --- GLOBAL STYLES & KEYFRAMES (Premium Font Applied) ---
const globalAnimations = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&display=swap');

  .font-cinzel { 
    font-family: 'Cinzel', serif; 
  }

  @keyframes shimmer { 
    100% { transform: translateX(200%); } 
  }
`;

// --- Framer Motion Variants ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring" as const, stiffness: 250, damping: 24, mass: 1 } 
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

// --- OPTIMIZED PARTICLES ENGINE CONFIG ---
const generateBubbles = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: Math.random() * 15 + 5,
    xPos: Math.random() * 100,
    yPos: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 15,
    color: ['bg-emerald-400', 'bg-teal-400', 'bg-blue-400', 'bg-purple-400', 'bg-amber-400', 'bg-white'][Math.floor(Math.random() * 6)],
    opacity: Math.random() * 0.4 + 0.2,
    layer: Math.floor(Math.random() * 3) 
  }));
};

const ambientBubbles = generateBubbles(30);

// --- 100,000x UPGRADE: Holographic 3D Spatial Course Card Component ---
function SpatialCourseCard({ course }: { course: Course }) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const glareX = useMotionValue(0);
  const glareY = useMotionValue(0);
  const isHovered = useMotionValue(0);
  
  const springConfig = { damping: 30, stiffness: 200, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springConfig);

  const backgroundTemplate = useMotionTemplate`radial-gradient(800px circle at ${glareX}px ${glareY}px, rgba(255,255,255,0.12), transparent 45%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768 || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    
    mouseX.set(relX);
    mouseY.set(relY);
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
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="group relative bg-[#030612]/70 backdrop-blur-xl backdrop-saturate-[150%] border border-white/[0.06] rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_32px_64px_-20px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.5)] transition-colors duration-500 hover:border-white/[0.12] will-change-transform flex flex-col overflow-hidden h-full"
    >
      {/* Deep Holographic Glare */}
      <motion.div
        className="pointer-events-none absolute -inset-px z-30 mix-blend-color-dodge transition-opacity duration-300"
        style={{ opacity: isHovered, background: backgroundTemplate }}
      />
      
      {/* Thumbnail Area with Inner Shadow */}
      <div className="h-48 sm:h-60 relative overflow-hidden bg-[#010206] shrink-0 border-b border-white/[0.04] transform-gpu">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100 mix-blend-screen will-change-transform"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#060d20] to-[#040814] flex flex-col items-center justify-center text-emerald-500/30 group-hover:text-emerald-400/50 transition-colors duration-500">
             <svg className="w-16 h-16 sm:w-20 sm:h-20 group-hover:scale-110 transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
        )}
        
        <div className="absolute inset-0 shadow-[inset_0_15px_30px_rgba(0,0,0,0.8)] pointer-events-none"></div>

        {/* Level Badge */}
        <div className="absolute top-4 left-4 sm:top-5 sm:left-5 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#020510]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_16px_rgba(0,0,0,0.6)] rounded-full text-[9px] sm:text-[10px] font-bold tracking-[0.2em] text-emerald-400 uppercase">
          {course.level || "Beginner"}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 sm:p-8 md:p-10 flex flex-col flex-grow relative z-10 bg-gradient-to-t from-[#010206] to-transparent font-cinzel">
        <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider text-white mb-3 sm:mb-4 line-clamp-2 group-hover:text-emerald-400 transition-colors duration-500 drop-shadow-md">
          {course.title}
        </h2>
        <p className="text-slate-400 text-[14px] sm:text-[15px] mb-6 sm:mb-8 line-clamp-3 leading-relaxed font-light mix-blend-screen">
          {course.description}
        </p>

        {/* Instructor Area */}
        {course.instructor?.name && (
          <div className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-10 mt-auto">
             <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[0.8rem] bg-[#040814] border border-white/[0.08] flex items-center justify-center text-[12px] sm:text-[13px] font-bold uppercase tracking-wider text-slate-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
               {course.instructor.name.charAt(0)}
             </div>
             <span className="text-[13px] sm:text-[14px] font-bold text-slate-300 tracking-widest uppercase">Ustad {course.instructor.name}</span>
          </div>
        )}

        {/* View Details Button */}
        <Link 
          href={`/courses/${course._id}`} 
          className="mt-auto block w-full text-center py-4 sm:py-5 rounded-[1rem] sm:rounded-[1.25rem] text-[13px] sm:text-[15px] font-bold tracking-[0.2em] uppercase text-white bg-white/[0.02] border border-white/[0.06] hover:bg-emerald-500 hover:text-[#010206] hover:border-emerald-400 transition-all duration-300 hover:shadow-[0_0_30px_rgba(52,211,153,0.4),inset_0_1px_1px_rgba(255,255,255,0.6)] active:scale-95"
        >
          View & Enroll
        </Link>
      </div>
    </motion.div>
  );
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  // --- Smooth Scroll Physics ---
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // --- MOUSE PARALLAX TRACKING LOGIC ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const fgX = useTransform(smoothMouseX, (v) => v * 1.5);
  const fgY = useTransform(smoothMouseY, (v) => v * 1.5);
  const mgX = useTransform(smoothMouseX, (v) => v * 0.8);
  const mgY = useTransform(smoothMouseY, (v) => v * 0.8);
  const bgX = useTransform(smoothMouseX, (v) => v * 0.3);
  const bgY = useTransform(smoothMouseY, (v) => v * 0.3);

  useEffect(() => {
    setMounted(true);
    
    // Fetch logic
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch courses");
        setCourses(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setTimeout(() => setLoading(false), 800); // Cinematic delay
      }
    };
    fetchCourses();

    // Mouse tracker
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 100;
      const y = (e.clientY / window.innerHeight - 0.5) * 100;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [mouseX, mouseY]);

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    // 👇 Added font-cinzel globally for this page
    <div className="min-h-screen bg-[#010206] pt-24 sm:pt-32 pb-24 relative overflow-hidden font-cinzel selection:bg-emerald-500/30 selection:text-emerald-200 perspective-[2000px]">
      
      {/* Top Progress Bar */}
      {mounted && (
        <motion.div 
          className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 origin-left z-[100] shadow-[0_0_20px_rgba(52,211,153,0.5)]"
          style={{ scaleX: smoothProgress }}
        />
      )}

      {/* --- GLOBAL BACKGROUND --- */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay pointer-events-none z-0"></div>

      {/* --- HYPER-DENSE 3D PARTICLES ENGINE (Optimized) --- */}
      {mounted && (
        <div className="hidden md:block fixed inset-0 z-[5] pointer-events-none overflow-hidden">
          
          {/* Layer 0: Foreground */}
          <motion.div style={{ x: fgX, y: fgY }} className="absolute inset-0 will-change-transform">
            {ambientBubbles.filter(b => b.layer === 0).map((p, i) => (
              <motion.div
                key={`fg-${i}`}
                className={`absolute rounded-full ${p.color}`}
                style={{
                  width: p.size, height: p.size, left: `${p.xPos}%`, top: `${p.yPos}%`,
                  opacity: p.opacity,
                  boxShadow: `0 0 ${p.size * 2}px currentColor`
                }}
                animate={{ y: [0, -40, 0], x: [0, 20, -10, 0] }}
                transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
              />
            ))}
          </motion.div>

          {/* Layer 1: Midground */}
          <motion.div style={{ x: mgX, y: mgY }} className="absolute inset-0 will-change-transform">
             {ambientBubbles.filter(b => b.layer === 1).map((p, i) => (
              <motion.div
                key={`mg-${i}`}
                className={`absolute rounded-full ${p.color}`}
                style={{
                  width: p.size * 0.8, height: p.size * 0.8, left: `${p.xPos}%`, top: `${p.yPos}%`,
                  opacity: p.opacity * 0.7,
                  boxShadow: `0 0 ${p.size * 1.5}px currentColor`
                }}
                animate={{ y: [0, -30, 0], x: [0, -15, 10, 0] }}
                transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
              />
            ))}
          </motion.div>

          {/* Layer 2: Background */}
          <motion.div style={{ x: bgX, y: bgY }} className="absolute inset-0 will-change-transform">
            {ambientBubbles.filter(b => b.layer === 2).map((p, i) => (
              <motion.div
                key={`bg-${i}`}
                className={`absolute rounded-full ${p.color}`}
                style={{
                  width: p.size * 1.5, height: p.size * 1.5, left: `${p.xPos}%`, top: `${p.yPos}%`,
                  opacity: p.opacity * 0.4,
                  boxShadow: `0 0 ${p.size}px currentColor`
                }}
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay }}
              />
            ))}
          </motion.div>
        </div>
      )}

      {/* --- Ambient Volumetric Background Glows --- */}
      <div className="absolute top-[-5%] sm:top-[-10%] left-[-10%] w-[80vw] sm:w-[50vw] h-[80vw] sm:h-[50vw] bg-emerald-600/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none mix-blend-screen animate-[pulse_10s_ease-in-out_infinite]"></div>
      <div className="absolute top-[20%] right-[-10%] w-[70vw] sm:w-[40vw] h-[70vw] sm:h-[40vw] bg-blue-800/10 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none mix-blend-screen animate-[pulse_14s_ease-in-out_infinite_reverse]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/[0.03] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)] mb-6 sm:mb-8 backdrop-blur-xl">
            <span className="flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,1)]"></span>
            <span className="text-[9px] sm:text-[11px] font-bold text-slate-300 tracking-[0.2em] sm:tracking-[0.3em] uppercase">Open Enrollment</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold uppercase tracking-widest text-white mb-6 sm:mb-8 leading-[1.05] drop-shadow-xl">
            Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 drop-shadow-[0_0_30px_rgba(52,211,153,0.3)] block sm:inline">Path</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 font-light leading-relaxed mb-8 sm:mb-12 mix-blend-screen">
            Explore our meticulously crafted curriculum. From foundational basics to advanced Islamic sciences, find the perfect course for your spiritual journey.
          </p>

          {/* Premium Search Bar */}
          <div className="relative max-w-2xl mx-auto group px-2 sm:px-0">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full blur-lg sm:blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            <div className="absolute inset-y-0 left-2 sm:left-0 pl-6 flex items-center pointer-events-none z-10">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-slate-500 group-focus-within:text-emerald-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              placeholder="SEARCH FOR COURSES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative w-full bg-[#030612]/80 backdrop-blur-2xl border border-white/[0.08] text-white rounded-full py-4 sm:py-5 pl-14 sm:pl-16 pr-6 sm:pr-8 text-base sm:text-lg focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-300 placeholder-slate-500 shadow-[0_16px_32px_-10px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] font-bold tracking-widest z-10 uppercase"
            />
          </div>
        </motion.div>

        {/* State Handlers */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 sm:py-32">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-slate-800/80 border-t-emerald-400 rounded-full animate-spin mb-4 sm:mb-6 shadow-[0_0_30px_rgba(52,211,153,0.5)]"></div>
            <p className="text-emerald-400 font-bold tracking-[0.1em] sm:tracking-[0.2em] uppercase text-xs sm:text-sm">Fetching curriculum...</p>
          </div>
        )}

        {error && (
          <div className="bg-[#030612]/80 backdrop-blur-2xl border border-red-500/30 p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] text-center max-w-xl mx-auto shadow-[0_20px_40px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.05)] mx-4 sm:mx-auto">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-widest text-white mb-3 sm:mb-4">Failed to load courses</h3>
            <p className="text-slate-400 text-base sm:text-lg font-light leading-relaxed">{error}</p>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && !error && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
          >
            {filteredCourses.length === 0 ? (
              <div className="text-center py-20 sm:py-32 bg-[#030612]/60 backdrop-blur-2xl border border-white/[0.04] rounded-[2rem] sm:rounded-[3rem] shadow-2xl mx-4 sm:mx-0 px-4">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white/[0.02] rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 border border-white/[0.05] text-slate-600 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
                  <svg className="w-8 h-8 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <p className="text-2xl sm:text-3xl font-bold uppercase tracking-widest text-white mb-3 sm:mb-4">No courses found</p>
                <p className="text-slate-400 text-base sm:text-lg font-light mb-6 sm:mb-8 max-w-md mx-auto">We couldn't find any courses matching "{searchQuery}". Try adjusting your search keywords.</p>
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="px-8 sm:px-10 py-3 sm:py-4 bg-white/[0.03] border border-white/[0.08] rounded-full text-emerald-400 font-bold hover:bg-emerald-500 hover:text-[#010206] transition-all duration-300 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] tracking-wider uppercase text-xs sm:text-sm"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-10">
                {filteredCourses.map((course) => (
                  <SpatialCourseCard key={course._id} course={course} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Global CSS for Animations (Safe string format) */}
      <style dangerouslySetInnerHTML={{ __html: globalAnimations }} />
    </div>
  );
}