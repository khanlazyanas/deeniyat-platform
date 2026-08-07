"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

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

// --- GLOBAL STYLES (Safe from VS Code parser bugs) ---
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

// --- PRE-COMPUTED HYPER-DENSE PARTICLE ARRAY ---
const generateBubbles = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: Math.random() * 20 + 5,
    xPos: Math.random() * 100,
    yPos: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 10,
    color: ['bg-emerald-400', 'bg-teal-400', 'bg-blue-400', 'bg-purple-400', 'bg-amber-400', 'bg-white'][Math.floor(Math.random() * 6)],
    blur: Math.random() * 3 + 1,
    opacity: Math.random() * 0.5 + 0.3,
    layer: Math.floor(Math.random() * 3)
  }));
};

const ambientBubbles = generateBubbles(45);

// --- 3D Holographic Grade Card Component ---
function HolographicGradeCard({ sub, index }: { sub: Submission, index: number }) {
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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, type: "spring", stiffness: 300, damping: 25 }}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="relative bg-[#030612]/70 backdrop-blur-[40px] backdrop-saturate-[150%] border border-white/[0.06] rounded-[2.5rem] p-8 md:p-10 shadow-[0_32px_64px_-20px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.5)] transition-colors duration-700 hover:border-white/[0.12] will-change-transform"
    >
      {/* Dynamic Holographic Glare */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 z-0 mix-blend-color-dodge rounded-[2.5rem]"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(800px circle at ${glarePosition.x}px ${glarePosition.y}px, rgba(255,255,255,0.15), transparent 40%)`,
        }}
      />

      <div className="relative z-10 w-full h-full transform-gpu" style={{ transform: "translateZ(20px)" }}>
        {/* Header Information */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8 pb-8 border-b border-white/[0.04]">
          <div>
            <h4 className="text-white font-black text-2xl flex items-center gap-3 tracking-tighter drop-shadow-md">
              <div className="w-10 h-10 rounded-[0.8rem] bg-[#040814] border border-white/[0.08] flex items-center justify-center text-emerald-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              {sub.lessonId?.title || 'Unknown Lesson'}
            </h4>
            <p className="text-[11px] text-slate-500 mt-3 font-black uppercase tracking-[0.2em] block">
              Submitted on: {new Date(sub.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div>
            {sub.status === 'Graded' ? (
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-[13px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(52,211,153,0.2),inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                Graded
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-[13px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2),inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Pending Review
              </span>
            )}
          </div>
        </div>

        {/* Audio Playback */}
        <div className="mb-8">
          <p className="text-[11px] font-black text-slate-500 mb-4 uppercase tracking-[0.25em] flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            Your Recording
          </p>
          <div className="w-full bg-[#040814] p-2 rounded-2xl border border-white/[0.05] shadow-inner">
             <audio controls className="w-full custom-audio-player focus:outline-none">
               <source src={sub.audioFileUrl} type="audio/mpeg" />
             </audio>
          </div>
        </div>

        {/* Grade and Feedback Section */}
        {sub.status === 'Graded' && (
          <div className="bg-gradient-to-br from-[#060d20] to-[#040814] border border-emerald-500/20 rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-start md:items-center relative overflow-hidden shadow-[0_16px_32px_-10px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.05)] group">
            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-700"></div>
            
            <div className="shrink-0 text-center bg-[#010206] border border-white/[0.06] p-5 rounded-[1.5rem] min-w-[100px] z-10 shadow-inner">
              <span className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-[0.2em]">Grade</span>
              <span className="block text-4xl font-black text-emerald-400 leading-none drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">{sub.grade}</span>
            </div>
            <div className="z-10 relative">
              <div className="absolute -left-6 top-2 w-1 h-full bg-gradient-to-b from-emerald-500 to-transparent rounded-full opacity-50"></div>
              <span className="block text-[11px] font-black text-emerald-500 uppercase mb-3 tracking-[0.25em] flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                 Ustad's Feedback
              </span>
              <p className="text-slate-300 text-lg font-light leading-relaxed mix-blend-screen">{sub.feedback || "Good job! No additional feedback provided."}</p>
            </div>
          </div>
        )}
        
      </div>
    </motion.div>
  );
}

export default function MyGradesPage() {
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
  const mgX = useTransform(smoothMouseX, (v) => v * 0.8);
  const mgY = useTransform(smoothMouseY, (v) => v * 0.8);
  const bgX = useTransform(smoothMouseX, (v) => v * 0.3);
  const bgY = useTransform(smoothMouseY, (v) => v * 0.3);

  useEffect(() => {
    setMounted(true);
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 100;
      const y = (e.clientY / window.innerHeight - 0.5) * 100;
      mouseX.set(x);
      mouseY.set(y);
    };
    
    window.addEventListener('mousemove', handleGlobalMouseMove);

    const fetchMySubmissions = async () => {
      try {
        const token = localStorage.getItem("token");
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
  }, [mouseX, mouseY]);

  return (
    <div className="min-h-screen pt-24 bg-[#010206] text-slate-50 relative overflow-hidden font-sans selection:bg-emerald-500/30 selection:text-emerald-200 perspective-[2000px]">
      
      {/* GLOBAL BACKGROUND */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay pointer-events-none z-0"></div>

      {/* --- HYPER-DENSE 3D PARTICLES ENGINE --- */}
      {mounted && (
        <div className="fixed inset-0 z-[5] pointer-events-none overflow-hidden">
          {/* Layer 0: Foreground */}
          <motion.div style={{ x: fgX, y: fgY }} className="absolute inset-0 will-change-transform">
            {ambientBubbles.filter(b => b.layer === 0).map((p, i) => (
              <motion.div
                key={`fg-${i}`}
                className={`absolute rounded-full ${p.color}`}
                style={{
                  width: p.size, height: p.size, left: `${p.xPos}%`, top: `${p.yPos}%`,
                  filter: `blur(${p.blur}px)`, opacity: p.opacity,
                  boxShadow: `0 0 ${p.size * 2.5}px currentColor`
                }}
                animate={{ y: [0, -60, 0], x: [0, 30, -20, 0], scale: [1, 1.2, 1] }}
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
                  filter: `blur(${p.blur + 1}px)`, opacity: p.opacity * 0.7,
                  boxShadow: `0 0 ${p.size * 1.5}px currentColor`
                }}
                animate={{ y: [0, -40, 0], x: [0, -20, 15, 0] }}
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
                  filter: `blur(${p.blur + 3}px)`, opacity: p.opacity * 0.4
                }}
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay }}
              />
            ))}
          </motion.div>
        </div>
      )}

      {/* Ambient Background Glows */}
      <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-[pulse_10s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-[10%] left-[10%] w-[600px] h-[600px] bg-teal-900/10 rounded-full blur-[140px] pointer-events-none mix-blend-screen animate-[pulse_15s_ease-in-out_infinite_reverse]"></div>

      <div className="max-w-5xl mx-auto relative z-10 py-12 px-4 sm:px-6 lg:px-8 pb-32">
        
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-16">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.02] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)] mb-6 backdrop-blur-xl">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,1)]"></span>
            <span className="text-[11px] font-black text-slate-300 tracking-[0.3em] uppercase">Student Portal</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 drop-shadow-md">My Grades & Feedback</h2>
          <p className="text-slate-400 font-light text-[17px] mix-blend-screen">Track your progress and read Ustad's detailed feedback on your recitations.</p>
        </motion.div>

        {/* Submissions List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
             <div className="w-16 h-16 border-4 border-slate-800/80 border-t-emerald-400 rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(52,211,153,0.5)] z-10"></div>
             <p className="text-emerald-400 font-bold tracking-[0.2em] uppercase text-sm z-10">Fetching Records...</p>
          </div>
        ) : submissions.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="bg-[#030612]/60 backdrop-blur-[40px] border border-white/[0.04] rounded-[3rem] p-16 text-center shadow-[0_32px_64px_-20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)]"
          >
            <div className="w-24 h-24 bg-white/[0.02] rounded-[2rem] border border-white/[0.05] flex items-center justify-center mx-auto mb-8 text-slate-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
               <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="text-3xl font-black text-white mb-4 tracking-tight">No Submissions Yet</h3>
            <p className="text-slate-400 text-lg font-light leading-relaxed max-w-md mx-auto">You haven't submitted any assignments. Go to 'Submit Assignment' to get started!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-10">
            {submissions.map((sub, index) => (
              <HolographicGradeCard key={sub._id} sub={sub} index={index} />
            ))}
          </div>
        )}

      </div>

      {/* Global CSS */}
      <style dangerouslySetInnerHTML={{ __html: globalAnimations }} />
    </div>
  );
}