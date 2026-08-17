"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate, Variants } from "framer-motion";

interface Submission {
  _id: string;
  audioFileUrl: string;
  grade: string;
  feedback: string;
  status: 'Pending' | 'Graded';
  createdAt: string;
  lessonId: {
    _id: string;
    title: string;
  };
}

// --- GLOBAL STYLES ---
const globalAnimations = `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }
  
  /* Custom Audio Player Styling to match dark theme */
  audio::-webkit-media-controls-panel {
    background-color: #040814;
  }
  audio::-webkit-media-controls-current-time-display,
  audio::-webkit-media-controls-time-remaining-display {
    color: #4ade80;
  }
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
    color: ['bg-emerald-400', 'bg-teal-400', 'bg-blue-400', 'bg-purple-400', 'bg-amber-400', 'bg-white'][Math.floor(Math.random() * 6)],
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

// 🚨 YAHAN "export default" LAGA DIYA HAI, AB VERCEL ERROR NAHI DEGA 🚨
export default function MyGradesPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
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

    const fetchMySubmissions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
           router.push('/login');
           return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submissions/my-submissions`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setSubmissions(data);
        }
      } catch (error) {
        console.error("Failed to fetch submissions", error);
      } finally {
        setTimeout(() => setLoading(false), 800); // Cinematic delay
      }
    };

    fetchMySubmissions();
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [mouseX, mouseY, router]);

  return (
    <div className="min-h-screen pt-24 bg-[#010206] text-slate-50 relative overflow-hidden font-sans selection:bg-emerald-500/30 selection:text-emerald-200 perspective-[2000px]">
      
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
      <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-[pulse_10s_ease-in-out_infinite] hidden sm:block"></div>
      <div className="absolute bottom-[10%] left-[10%] w-[600px] h-[600px] bg-teal-900/10 rounded-full blur-[140px] pointer-events-none mix-blend-screen animate-[pulse_15s_ease-in-out_infinite_reverse] hidden sm:block"></div>

      <div className="max-w-5xl mx-auto relative z-10 py-12 px-4 sm:px-6 lg:px-8 pb-32">
        
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12 sm:mb-16 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/[0.02] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)] mb-4 sm:mb-6 backdrop-blur-xl">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,1)]"></span>
            <span className="text-[10px] sm:text-[11px] font-black text-slate-300 tracking-[0.3em] uppercase">Student Portal</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-3 sm:mb-4 drop-shadow-md">My Grades & Feedback</h2>
          <p className="text-slate-400 font-light text-[15px] sm:text-[17px] mix-blend-screen max-w-2xl mx-auto sm:mx-0">Track your progress and read Ustad's detailed feedback on your recitations.</p>
        </motion.div>

        {/* Submissions List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 sm:py-32">
             <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-slate-800/80 border-t-emerald-400 rounded-full animate-spin mb-4 sm:mb-6 shadow-[0_0_30px_rgba(52,211,153,0.5)] z-10"></div>
             <p className="text-emerald-400 font-bold tracking-[0.2em] uppercase text-xs sm:text-sm z-10">Fetching Records...</p>
          </div>
        ) : submissions.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="bg-[#030612]/60 backdrop-blur-[40px] border border-white/[0.04] rounded-[2rem] sm:rounded-[3rem] p-10 sm:p-16 text-center shadow-[0_32px_64px_-20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] mx-2 sm:mx-0"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/[0.02] rounded-[1.5rem] sm:rounded-[2rem] border border-white/[0.05] flex items-center justify-center mx-auto mb-6 sm:mb-8 text-slate-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
               <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 sm:mb-4 tracking-tight">No Submissions Yet</h3>
            <p className="text-slate-400 text-sm sm:text-lg font-light leading-relaxed max-w-md mx-auto px-4 sm:px-0">You haven't submitted any assignments. Complete lessons to get graded by an Ustad!</p>
          </motion.div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 gap-8 sm:gap-10">
            {submissions.map((sub, index) => (
              <HolographicCard key={sub._id} className="p-6 sm:p-8 md:p-10">
                {/* Header Information */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-white/[0.04]">
                  <div>
                    <h4 className="text-white font-black text-xl sm:text-2xl flex items-center gap-3 tracking-tighter drop-shadow-md">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[0.6rem] sm:rounded-[0.8rem] bg-[#040814] border border-white/[0.08] flex items-center justify-center text-emerald-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                      </div>
                      {sub.lessonId?.title || 'Unknown Lesson'}
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 mt-2 sm:mt-3 font-black uppercase tracking-[0.2em] block ml-1 sm:ml-2">
                      Submitted on: {new Date(sub.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    {sub.status === 'Graded' ? (
                      <span className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-[11px] sm:text-[13px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(52,211,153,0.2),inset_0_1px_1px_rgba(255,255,255,0.05)] w-full md:w-auto">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        Graded
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-[11px] sm:text-[13px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2),inset_0_1px_1px_rgba(255,255,255,0.05)] w-full md:w-auto">
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Audio Playback */}
                {sub.audioFileUrl && (
                  <div className="mb-6 sm:mb-8">
                    <p className="text-[10px] sm:text-[11px] font-black text-slate-500 mb-3 sm:mb-4 uppercase tracking-[0.25em] flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                      Your Recording
                    </p>
                    <div className="w-full bg-[#040814] p-1.5 sm:p-2 rounded-[1rem] sm:rounded-2xl border border-white/[0.05] shadow-inner">
                        <audio controls className="w-full custom-audio-player focus:outline-none h-[40px] sm:h-[54px]">
                          <source src={sub.audioFileUrl} type="audio/mpeg" />
                        </audio>
                    </div>
                  </div>
                )}

                {/* Grade and Feedback Section */}
                {sub.status === 'Graded' && (
                  <div className="bg-gradient-to-br from-[#060d20] to-[#040814] border border-emerald-500/20 rounded-[1.5rem] sm:rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 sm:gap-8 items-start md:items-center relative overflow-hidden shadow-[0_16px_32px_-10px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.05)] group">
                    <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-700"></div>
                    
                    <div className="shrink-0 text-center bg-[#010206] border border-white/[0.06] p-4 sm:p-5 rounded-[1.25rem] sm:rounded-[1.5rem] min-w-[90px] sm:min-w-[100px] z-10 shadow-inner w-full md:w-auto">
                      <span className="block text-[9px] sm:text-[10px] font-black text-slate-500 uppercase mb-1.5 sm:mb-2 tracking-[0.2em]">Grade</span>
                      <span className="block text-3xl sm:text-4xl font-black text-emerald-400 leading-none drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">{sub.grade}</span>
                    </div>
                    <div className="z-10 relative">
                      <div className="absolute -left-4 sm:-left-6 top-2 w-1 h-full bg-gradient-to-b from-emerald-500 to-transparent rounded-full opacity-50 hidden md:block"></div>
                      <span className="block text-[10px] sm:text-[11px] font-black text-emerald-500 uppercase mb-2 sm:mb-3 tracking-[0.25em] flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                          Ustad's Feedback
                      </span>
                      <p className="text-slate-300 text-sm sm:text-lg font-light leading-relaxed mix-blend-screen">{sub.feedback || "Good job! No additional feedback provided."}</p>
                    </div>
                  </div>
                )}
              </HolographicCard>
            ))}
          </motion.div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: globalAnimations }} />
    </div>
  );
}