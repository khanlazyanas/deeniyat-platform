"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate, Variants } from "framer-motion";

interface EnrolledCourse {
  _id: string;
  title: string;
  description: string;
  level: string;
  thumbnail?: string;
}

// --- GLOBAL STYLES (Safe from VS Code parser bugs) ---
const globalAnimations = `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }
`;

// --- Framer Motion Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 250, damping: 25, mass: 0.5 } 
  }
};

// --- 3D Holographic Course Card Component (GPU OPTIMIZED) ---
function HolographicCourseCard({ course }: { course: EnrolledCourse }) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Motion Values to prevent React re-renders on mousemove
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glareX = useMotionValue(0);
  const glareY = useMotionValue(0);
  const isHovered = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 200, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springConfig);

  const backgroundTemplate = useMotionTemplate`radial-gradient(800px circle at ${glareX}px ${glareY}px, rgba(255,255,255,0.15), transparent 45%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // 🛑 Optimize for mobile: Ignore 3D effects on small screens
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
      variants={itemVariants}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="group flex flex-col bg-[#030612]/70 backdrop-blur-xl backdrop-saturate-[150%] rounded-[2rem] border border-white/[0.06] overflow-hidden hover:border-white/[0.12] transition-colors duration-500 shadow-[0_32px_64px_-20px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.5)] h-full will-change-transform"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px z-30 mix-blend-color-dodge transition-opacity duration-300"
        style={{ opacity: isHovered, background: backgroundTemplate }}
      />

      {/* Thumbnail Area */}
      <div className="h-48 sm:h-56 bg-[#010206] flex items-center justify-center relative overflow-hidden border-b border-white/[0.04] transform-gpu">
        {course.thumbnail ? (
          <Image 
            src={course.thumbnail} 
            alt={course.title} 
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out mix-blend-screen will-change-transform" 
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#060d20] to-[#040814] flex flex-col items-center justify-center text-emerald-500/30 group-hover:text-emerald-400/50 transition-colors duration-500">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 mb-2 opacity-40 group-hover:scale-110 transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] sm:text-xs font-medium tracking-widest uppercase">Course Visual</span>
          </div>
        )}
        <div className="absolute inset-0 shadow-[inset_0_15px_30px_rgba(0,0,0,0.8)] pointer-events-none z-10"></div>

        {/* Level Badge */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#020510]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_16px_rgba(0,0,0,0.6)] rounded-full text-[9px] sm:text-[10px] font-black tracking-[0.2em] text-emerald-400 uppercase z-20">
          {course.level || "Beginner"}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 sm:p-8 flex flex-col flex-grow relative z-10 bg-gradient-to-t from-[#010206] to-transparent">
        <h3 className="text-xl sm:text-2xl font-black text-white mb-4 sm:mb-6 line-clamp-1 tracking-tighter group-hover:text-emerald-400 transition-colors duration-500 drop-shadow-md">
          {course.title}
        </h3>

        {/* 🚨 YAHAN BUTTON SEEDHA COURSE PLAYER PAR JAYEGA 🚨 */}
        <Link 
          href={`/dashboard/my-courses/${course._id}`}
          className="mt-auto w-full group/btn relative inline-flex items-center justify-center px-4 sm:px-6 py-3.5 sm:py-4 text-[12px] sm:text-[13px] font-black tracking-widest uppercase text-emerald-400 bg-emerald-950/20 border border-emerald-900/50 rounded-xl overflow-hidden transition-all duration-300 hover:bg-emerald-500 hover:text-[#010206] hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(52,211,153,0.4),inset_0_1px_1px_rgba(255,255,255,0.6)] active:scale-95"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            Continue Learning
            <svg className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </Link>
      </div>
    </motion.div>
  );
}

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Please login to view your courses");

        // 🚨 THE FIX: API URL CHANGED FROM /enrollments/my-courses TO /courses/my-courses
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/my-courses`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch enrolled courses");
        }

        setEnrollments(Array.isArray(data) ? data : (data.data || []));
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setTimeout(() => setLoading(false), 600); // Small delay for smooth cinematic feel
      }
    };

    fetchMyCourses();
  }, []);

  if (loading) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative perspective-[2000px] overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen animate-pulse hidden sm:block"></div>
      <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-slate-800/80 border-t-emerald-400 rounded-full animate-spin mb-4 sm:mb-6 shadow-[0_0_30px_rgba(52,211,153,0.5)] z-10"></div>
      <p className="text-emerald-400 font-bold tracking-[0.1em] sm:tracking-[0.2em] uppercase text-xs sm:text-sm z-10">Loading Curriculum...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 relative">
      <div className="bg-[#030612]/80 backdrop-blur-xl border border-red-500/30 p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] text-center max-w-xl w-full shadow-[0_20px_40px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.05)] z-10">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
          <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 sm:mb-4 tracking-tight">Oops! Something went wrong</h3>
        <p className="text-slate-400 text-sm sm:text-lg font-light leading-relaxed">{error}</p>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
      className="min-h-[85vh] p-4 sm:p-6 md:p-8 relative overflow-hidden perspective-[2000px]"
    >
      {/* Ambient Background Glow */}
      <div className="absolute top-[-5%] right-[-5%] w-[80vw] sm:w-[600px] h-[80vw] sm:h-[600px] bg-emerald-900/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none mix-blend-screen animate-[pulse_10s_ease-in-out_infinite] hidden sm:block"></div>
      <div className="absolute bottom-[-5%] left-[-5%] w-[70vw] sm:w-[500px] h-[70vw] sm:h-[500px] bg-teal-900/10 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none mix-blend-screen animate-[pulse_14s_ease-in-out_infinite_reverse] hidden sm:block"></div>

      <div className="max-w-7xl mx-auto relative z-10 py-6 sm:py-0">
        <div className="mb-8 sm:mb-12 text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter mb-3 sm:mb-4 drop-shadow-md">My Learning Journey</h2>
          <p className="text-slate-400 font-light text-base sm:text-xl">Continue mastering your Deen where you left off.</p>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-[#030612]/60 backdrop-blur-[20px] sm:backdrop-blur-[40px] p-8 sm:p-16 text-center rounded-[2rem] sm:rounded-[3rem] border border-white/[0.04] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] mx-2 sm:mx-0">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white/[0.02] rounded-[1.5rem] sm:rounded-[2rem] border border-white/[0.05] flex items-center justify-center mx-auto mb-6 sm:mb-8 text-slate-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
              <svg className="w-8 h-8 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 sm:mb-4 tracking-tight">Your curriculum is empty</h3>
            <p className="text-slate-400 mb-8 sm:mb-10 text-sm sm:text-lg font-light max-w-lg mx-auto leading-relaxed">
              You haven't enrolled in any courses yet. Explore our catalog and start your spiritual journey today.
            </p>
            <Link 
              href="/courses" 
              className="inline-flex items-center justify-center gap-2 sm:gap-3 px-8 sm:px-10 py-4 sm:py-5 text-[13px] sm:text-[15px] text-slate-950 bg-gradient-to-b from-emerald-400 to-teal-500 font-black uppercase tracking-widest rounded-full transition-all duration-500 shadow-[0_0_30px_-10px_rgba(52,211,153,0.6),inset_0_1px_1px_rgba(255,255,255,0.8)] hover:scale-[1.03] active:scale-95 ring-1 ring-white/20 w-full sm:w-auto"
            >
              Browse Catalog
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4-4m4-4H3" />
              </svg>
            </Link>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants} initial="hidden" animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-10"
          >
            {enrollments.map((course) => (
              <HolographicCourseCard key={course._id} course={course} />
            ))}
          </motion.div>
        )}
      </div>
      
      {/* Global CSS for Animations */}
      <style dangerouslySetInnerHTML={{ __html: globalAnimations }} />
    </motion.div>
  );
}