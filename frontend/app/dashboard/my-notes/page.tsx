"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate, Variants } from "framer-motion";

interface Note {
  lessonId: {
    _id: string;
    title: string;
    order?: number;
  };
  personalNote: string;
}

interface CourseNotes {
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
  };
  notes: Note[];
}

// --- GLOBAL STYLES ---
const globalAnimations = `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }
`;

// --- PRE-COMPUTED HYPER-DENSE PARTICLE ARRAY (60fps Optimized) ---
const generateBubbles = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: Math.random() * 15 + 5,
    xPos: Math.random() * 100,
    yPos: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 15,
    // Amber & Purple theme for Notebook
    color: ['bg-amber-400', 'bg-orange-400', 'bg-yellow-400', 'bg-purple-400', 'bg-indigo-400', 'bg-white'][Math.floor(Math.random() * 6)],
    opacity: Math.random() * 0.4 + 0.2,
    layer: Math.floor(Math.random() * 3)
  }));
};

const ambientBubbles = generateBubbles(20);

// --- Framer Motion Variants ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 250, damping: 25, mass: 0.5 } 
  }
};

// --- 3D Holographic Card Component (GPU OPTIMIZED) ---
function HolographicCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glareX = useMotionValue(0);
  const glareY = useMotionValue(0);
  const isHovered = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 200, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [2, -2]), springConfig); 
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-2, 2]), springConfig);

  const backgroundTemplate = useMotionTemplate`radial-gradient(800px circle at ${glareX}px ${glareY}px, rgba(255,255,255,0.1), transparent 45%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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
      variants={fadeInUp}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative overflow-hidden rounded-[2rem] bg-[#030612]/70 backdrop-blur-[40px] border border-white/[0.06] shadow-[0_32px_64px_-20px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.05)] transition-colors duration-500 hover:border-white/[0.12] will-change-transform ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px z-30 mix-blend-color-dodge transition-opacity duration-300"
        style={{ opacity: isHovered, background: backgroundTemplate }}
      />
      <div className="relative z-10 w-full h-full transform-gpu" style={{ transform: "translateZ(10px)" }}>
        {children}
      </div>
    </motion.div>
  );
}

export default function MyNotesPage() {
  const router = useRouter();
  const [allNotes, setAllNotes] = useState<CourseNotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  // --- MOUSE PARALLAX TRACKING LOGIC ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const fgX = useTransform(smoothMouseX, (v) => v * 1.5);
  const fgY = useTransform(smoothMouseY, (v) => v * 1.5);
  const bgX = useTransform(smoothMouseX, (v) => v * 0.3);
  const bgY = useTransform(smoothMouseY, (v) => v * 0.3);

  useEffect(() => {
    setMounted(true);

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 100;
      const y = (e.clientY / window.innerHeight - 0.5) * 100;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);

    const fetchMyNotes = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments/my-notes`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error("Failed to load your notebook");
        
        const data = await response.json();
        setAllNotes(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setTimeout(() => setLoading(false), 800); // Cinematic delay
      }
    };

    fetchMyNotes();
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [mouseX, mouseY, router]);

  return (
    <div className="min-h-screen pt-24 bg-[#010206] text-slate-50 relative overflow-hidden font-sans selection:bg-amber-500/30 selection:text-amber-200 perspective-[2000px]">
      
      {/* GLOBAL BACKGROUND */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay pointer-events-none z-0"></div>

      {/* --- HYPER-DENSE 3D PARTICLES ENGINE --- */}
      {mounted && (
        <div className="hidden md:block fixed inset-0 z-[5] pointer-events-none overflow-hidden">
          <motion.div style={{ x: fgX, y: fgY }} className="absolute inset-0 will-change-transform">
            {ambientBubbles.filter(b => b.layer === 0).map((p, i) => (
              <motion.div
                key={`fg-${i}`} className={`absolute rounded-full ${p.color}`}
                style={{ width: p.size, height: p.size, left: `${p.xPos}%`, top: `${p.yPos}%`, opacity: p.opacity, boxShadow: `0 0 ${p.size * 2}px currentColor` }}
                animate={{ y: [0, -40, 0], x: [0, 20, -10, 0] }}
                transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
              />
            ))}
          </motion.div>
          <motion.div style={{ x: bgX, y: bgY }} className="absolute inset-0 will-change-transform">
            {ambientBubbles.filter(b => b.layer === 2).map((p, i) => (
              <motion.div
                key={`bg-${i}`} className={`absolute rounded-full ${p.color}`}
                style={{ width: p.size * 1.5, height: p.size * 1.5, left: `${p.xPos}%`, top: `${p.yPos}%`, opacity: p.opacity * 0.4, boxShadow: `0 0 ${p.size}px currentColor` }}
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay }}
              />
            ))}
          </motion.div>
        </div>
      )}

      {/* Ambient Background Glows */}
      <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-amber-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-[pulse_10s_ease-in-out_infinite] hidden sm:block"></div>
      <div className="absolute bottom-[10%] left-[10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none mix-blend-screen animate-[pulse_15s_ease-in-out_infinite_reverse] hidden sm:block"></div>

      <div className="max-w-6xl mx-auto relative z-10 py-12 px-4 sm:px-6 lg:px-8 pb-32">
        
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12 sm:mb-16 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/[0.02] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)] mb-4 sm:mb-6 backdrop-blur-xl">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(245,158,11,1)]"></span>
            <span className="text-[10px] sm:text-[11px] font-black text-slate-300 tracking-[0.3em] uppercase">Student Workspace</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-3 sm:mb-4 drop-shadow-md">My Notebook</h2>
          <p className="text-slate-400 font-light text-[15px] sm:text-[17px] mix-blend-screen max-w-2xl mx-auto sm:mx-0">Access all your saved lecture notes in one place. Click on any note to resume studying that specific course.</p>
        </motion.div>

        {/* Notebook Content List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 sm:py-32">
             <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-slate-800/80 border-t-amber-400 rounded-full animate-spin mb-4 sm:mb-6 shadow-[0_0_30px_rgba(245,158,11,0.5)] z-10"></div>
             <p className="text-amber-400 font-bold tracking-[0.2em] uppercase text-xs sm:text-sm z-10">Loading Notebook...</p>
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="bg-[#030612]/60 backdrop-blur-[40px] border border-red-500/30 rounded-[2rem] sm:rounded-[3rem] p-10 sm:p-16 text-center shadow-[0_32px_64px_-20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] mx-2 sm:mx-0"
          >
            <p className="text-red-400 text-lg font-bold">{error}</p>
          </motion.div>
        ) : allNotes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="bg-[#030612]/60 backdrop-blur-[40px] border border-white/[0.04] rounded-[2rem] sm:rounded-[3rem] p-10 sm:p-16 text-center shadow-[0_32px_64px_-20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] mx-2 sm:mx-0"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/[0.02] rounded-[1.5rem] sm:rounded-[2rem] border border-white/[0.05] flex items-center justify-center mx-auto mb-6 sm:mb-8 text-slate-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
               <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 sm:mb-4 tracking-tight">No Notes Found</h3>
            <p className="text-slate-400 text-sm sm:text-lg font-light leading-relaxed max-w-md mx-auto px-4 sm:px-0 mb-8">You haven't written any notes yet. Start taking notes while watching lectures to see them here.</p>
            <button onClick={() => router.push('/dashboard/my-courses')} className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-[#010206] font-black uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(245,158,11,0.4)]">Go to My Courses</button>
          </motion.div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 gap-8 sm:gap-10">
            {allNotes.map((courseData, index) => (
              <HolographicCard key={courseData.course._id} className="p-0">
                {/* Course Header inside Holographic Card */}
                <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-white/[0.05] bg-gradient-to-r from-white/[0.02] to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-white font-black text-xl sm:text-2xl flex items-center gap-3 tracking-tighter drop-shadow-md">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[0.6rem] sm:rounded-[0.8rem] bg-[#040814] border border-white/[0.08] flex items-center justify-center text-amber-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                    {courseData.course.title}
                  </h2>
                  <button onClick={() => router.push(`/dashboard/my-courses/${courseData.course._id}`)} className="text-[10px] sm:text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors uppercase tracking-widest flex items-center gap-2">
                    Open Course <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
                </div>

                {/* Notes Grid inside Holographic Card */}
                <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {courseData.notes.map((note, noteIndex) => (
                    <div 
                      key={noteIndex}
                      onClick={() => router.push(`/dashboard/my-courses/${courseData.course._id}`)}
                      className="bg-[#010206]/80 p-6 rounded-[1.5rem] border border-white/[0.04] hover:border-amber-500/30 transition-all duration-300 cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] hover:shadow-[0_10px_30px_rgba(245,158,11,0.05)] relative overflow-hidden group/note"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-[40px] pointer-events-none group-hover/note:bg-amber-500/10 transition-colors duration-500"></div>
                      
                      <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="px-3 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                          Ch {note.lessonId.order || '-'}
                        </div>
                        <h4 className="text-slate-200 font-bold text-sm truncate">{note.lessonId.title}</h4>
                      </div>

                      <p className="text-slate-400 text-sm leading-relaxed font-light mix-blend-screen line-clamp-4 whitespace-pre-wrap relative z-10">
                        {note.personalNote}
                      </p>
                    </div>
                  ))}
                </div>
              </HolographicCard>
            ))}
          </motion.div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: globalAnimations }} />
    </div>
  );
}