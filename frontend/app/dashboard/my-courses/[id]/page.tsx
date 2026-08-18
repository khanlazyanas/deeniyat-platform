"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate, Variants } from "framer-motion";

// 👇 AUTH CONTEXT IMPORT
import { useAuth } from "../../../../context/AuthContext";

interface Lesson {
  _id: string;
  title: string;
  content?: string;
  videoUrl?: string;
  pdfUrl?: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  teacherId?: any; 
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
    color: ['bg-emerald-400', 'bg-teal-400', 'bg-blue-400', 'bg-purple-400', 'bg-amber-400', 'bg-white'][Math.floor(Math.random() * 6)],
    opacity: Math.random() * 0.4 + 0.2,
    layer: Math.floor(Math.random() * 3)
  }));
};

const ambientBubbles = generateBubbles(20); 

// --- Framer Motion Variants ---
const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
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

export default function CoursePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  // Assignment Submission States
  const [assignmentContent, setAssignmentContent] = useState("");
  const [submittingTask, setSubmittingTask] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState({ type: "", text: "" });

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Parallax logic for background
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

  // Security Check (Sirf Course ke Ustad ko buttons dikhenge)
  const isOwnerOrAdmin = true;
  useEffect(() => {
    setMounted(true);
    if (!courseId) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 100;
      const y = (e.clientY / window.innerHeight - 0.5) * 100;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);

    const fetchCourseAndLessons = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication required");

        // Fetch Course Details
        const courseRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`);
        const courseData = await courseRes.json();
        if (!courseRes.ok) throw new Error(courseData.message || "Failed to load course");
        setCourse(courseData);

        // Fetch Lessons
        const lessonsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lessons/course/${courseId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const lessonsData = await lessonsRes.json();
        
        if (lessonsRes.ok) {
          const fetchedLessons = Array.isArray(lessonsData) ? lessonsData : (lessonsData.data || []);
          setLessons(fetchedLessons);
          if (fetchedLessons.length > 0) {
            setActiveLesson(fetchedLessons[0]); 
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("Failed to initialize learning portal");
        }
      } finally {
        setTimeout(() => setLoading(false), 800); 
      }
    };

    fetchCourseAndLessons();
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [courseId, mouseX, mouseY]);

  // Extract YouTube ID safely
  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi;
    const match = regExp.exec(url);
    if (match && match[1].length === 11) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0&modestbranding=1&showinfo=0&controls=1`;
    }
    return url; 
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentContent.trim()) return;

    setSubmittingTask(true);
    setSubmissionMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const payload = {
        courseId: courseId,
        lessonId: activeLesson?._id,
        content: assignmentContent
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit assignment");
      }

      setSubmissionMessage({ type: "success", text: "Assignment submitted successfully! Ustad will review it soon." });
      setAssignmentContent(""); 
      
    } catch (err: unknown) {
        if (err instanceof Error) {
            setSubmissionMessage({ type: "error", text: err.message });
        }
    } finally {
      setSubmittingTask(false);
      setTimeout(() => setSubmissionMessage({ type: "", text: "" }), 5000);
    }
  };

  // Edit Lesson Handler
  const handleEditLesson = (e: React.MouseEvent, lessonId: string) => {
    e.stopPropagation(); 
    router.push(`/dashboard/edit-lesson/${lessonId}`);
  };

  // Delete Lesson Handler
  const handleDeleteLesson = async (e: React.MouseEvent, lessonId: string) => {
    e.stopPropagation(); 
    
    if (!window.confirm("Are you sure you want to permanently delete this lesson?")) return;

    setDeletingId(lessonId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lessons/${lessonId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        setLessons(prev => prev.filter(l => l._id !== lessonId));
        if (activeLesson?._id === lessonId) setActiveLesson(null);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete lesson");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while deleting lesson");
    } finally {
      setDeletingId(null);
    }
  };

  // --- LOADING & ERROR STATES ---
  if (loading || !mounted) return (
    <div className="min-h-screen pt-24 pb-12 bg-[#010206] flex flex-col items-center justify-center relative perspective-[2000px] overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-800/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
      <div className="w-16 h-16 border-4 border-slate-800/80 border-t-emerald-400 rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(52,211,153,0.5)] z-10"></div>
      <p className="text-emerald-400 font-bold tracking-[0.2em] uppercase text-sm z-10">Initializing Studio...</p>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen pt-24 pb-12 bg-[#010206] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="bg-[#030612]/80 backdrop-blur-2xl border border-red-500/30 p-10 rounded-[2.5rem] text-center max-w-xl shadow-[0_20px_40px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.05)] z-10">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h3 className="text-3xl font-black text-white mb-4 tracking-tight">System Error</h3>
        <p className="text-slate-400 text-lg font-light leading-relaxed mb-8">{error}</p>
        <button onClick={() => router.push('/dashboard')} className="px-10 py-4 bg-white/[0.03] border border-white/[0.08] rounded-full text-slate-300 font-bold hover:bg-white/[0.1] hover:text-white transition-all duration-300 tracking-wide uppercase text-sm">Return to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 bg-[#010206] flex flex-col md:flex-row overflow-hidden relative">
      
      {/* GLOBAL BACKGROUNDS */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay pointer-events-none z-0"></div>

      <div className="hidden md:block fixed inset-0 z-[5] pointer-events-none overflow-hidden">
        <motion.div style={{ x: fgX, y: fgY }} className="absolute inset-0 will-change-transform">
          {ambientBubbles.filter(b => b.layer === 0).map((p, i) => (
            <motion.div key={`fg-${i}`} className={`absolute rounded-full ${p.color}`} style={{ width: p.size, height: p.size, left: `${p.xPos}%`, top: `${p.yPos}%`, opacity: p.opacity, boxShadow: `0 0 ${p.size * 2}px currentColor` }} animate={{ y: [0, -40, 0], x: [0, 20, -10, 0] }} transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }} />
          ))}
        </motion.div>
        <motion.div style={{ x: mgX, y: mgY }} className="absolute inset-0 will-change-transform">
          {ambientBubbles.filter(b => b.layer === 1).map((p, i) => (
            <motion.div key={`mg-${i}`} className={`absolute rounded-full ${p.color}`} style={{ width: p.size * 0.8, height: p.size * 0.8, left: `${p.xPos}%`, top: `${p.yPos}%`, opacity: p.opacity * 0.7, boxShadow: `0 0 ${p.size * 1.5}px currentColor` }} animate={{ y: [0, -30, 0], x: [0, -15, 10, 0] }} transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }} />
          ))}
        </motion.div>
        <motion.div style={{ x: bgX, y: bgY }} className="absolute inset-0 will-change-transform">
          {ambientBubbles.filter(b => b.layer === 2).map((p, i) => (
            <motion.div key={`bg-${i}`} className={`absolute rounded-full ${p.color}`} style={{ width: p.size * 1.5, height: p.size * 1.5, left: `${p.xPos}%`, top: `${p.yPos}%`, opacity: p.opacity * 0.4, boxShadow: `0 0 ${p.size}px currentColor` }} animate={{ y: [0, -20, 0] }} transition={{ duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay }} />
          ))}
        </motion.div>
      </div>

      {/* LEFT SIDEBAR: Course Curriculum */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full md:w-[380px] lg:w-[420px] bg-[#020510]/80 backdrop-blur-[40px] border-r border-white/[0.06] flex flex-col h-[calc(100vh-6rem)] shrink-0 relative z-20 shadow-[8px_0_24px_rgba(0,0,0,0.5)]"
      >
        <div className="p-8 border-b border-white/[0.04] relative">
          <button onClick={() => router.back()} className="group text-[11px] font-black tracking-[0.2em] uppercase text-slate-500 hover:text-emerald-400 flex items-center gap-2 mb-6 transition-colors duration-300">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Dashboard
          </button>
          <h2 className="text-2xl font-black text-white leading-tight drop-shadow-md tracking-tighter pr-8">{course?.title}</h2>
          
          <div className="mt-5 w-full bg-[#010206] rounded-full h-2 border border-white/[0.05] overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: '15%' }} transition={{ duration: 1, delay: 0.5 }} className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
          </div>
          <p className="text-[10px] text-slate-500 mt-3 font-black uppercase tracking-[0.1em]">Course Progress: <span className="text-emerald-400">15%</span></p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
          {lessons.length === 0 ? (
            <div className="flex flex-col items-center text-center mt-10">
               <svg className="w-12 h-12 mb-3 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
               <p className="text-slate-500 text-sm font-medium">Curriculum is being prepared.</p>
            </div>
          ) : (
            lessons.map((lesson, index) => (
              
              /* 👇 COMPLETELY NEW CARD FOR LESSONS WITH EXPLICIT EDIT/DELETE 👇 */
              <div 
                key={lesson._id} 
                className={`flex flex-col rounded-[1.25rem] transition-all duration-300 border overflow-hidden ${
                  activeLesson?._id === lesson._id 
                    ? "bg-emerald-500/10 border-emerald-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.2)]" 
                    : "bg-[#010206]/50 border-white/[0.08]"
                }`}
              >
                
                {/* 1. TOP HALF: Play Video Area */}
                <div 
                  onClick={() => {
                    setActiveLesson(lesson);
                    setSubmissionMessage({ type: "", text: "" }); 
                  }}
                  className="p-5 flex items-start gap-4 cursor-pointer hover:bg-white/[0.02]"
                >
                  <div className={`w-10 h-10 rounded-[0.8rem] flex items-center justify-center shrink-0 font-black text-sm transition-colors ${
                    activeLesson?._id === lesson._id ? "bg-gradient-to-b from-emerald-400 to-teal-500 text-[#010206] shadow-[0_0_15px_rgba(52,211,153,0.5)]" : "bg-[#020510] border border-white/[0.1] text-slate-400"
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 overflow-hidden pt-1">
                    <h4 className={`font-bold text-[15px] truncate tracking-tight ${activeLesson?._id === lesson._id ? "text-emerald-400" : "text-slate-200"}`}>
                      {lesson.title}
                    </h4>
                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 mt-2 flex items-center gap-1.5">
                      {lesson.videoUrl ? (
                        <><svg className="w-3.5 h-3.5 text-emerald-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Video</>
                      ) : (
                        <><svg className="w-3.5 h-3.5 text-blue-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> Reading</>
                      )}
                    </p>
                  </div>
                </div>

                {/* 👇 2. BOTTOM HALF: Edit & Delete Buttons (VISIBLE TO USTAD) */}
                {isOwnerOrAdmin && (
                  <div className="flex items-center justify-end gap-2 px-4 py-3 bg-[#000000]/40 border-t border-white/[0.05]">
                    
                    <button 
                      onClick={(e) => handleEditLesson(e, lesson._id)} 
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Edit Module
                    </button>
                    
                    <button 
                      onClick={(e) => handleDeleteLesson(e, lesson._id)} 
                      disabled={deletingId === lesson._id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      {deletingId === lesson._id ? (
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      )}
                      Delete
                    </button>

                  </div>
                )}

              </div>
              /* 👆 END OF REBUILT CARD 👆 */
            ))
          )}
        </div>
      </motion.div>

      {/* RIGHT MAIN AREA: Video, Content & Assignment */}
      <div className="flex-1 h-[calc(100vh-6rem)] overflow-y-auto relative bg-transparent custom-scrollbar">
        
        {/* Ambient Content Glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[140px] pointer-events-none mix-blend-screen animate-[pulse_10s_ease-in-out_infinite]"></div>

        {activeLesson ? (
          <motion.div 
            key={activeLesson._id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto p-6 md:p-10 relative z-10 pb-32"
          >
            
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2 drop-shadow-lg">{activeLesson.title}</h1>
            </div>

            {/* Video Player */}
            {activeLesson.videoUrl && (
              <div className="w-full aspect-video bg-[#010206] rounded-[2rem] overflow-hidden border border-white/[0.08] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] mb-12 relative group transform-gpu">
                {activeLesson.videoUrl.includes('youtu') ? (
                  <iframe 
                    className="w-full h-full relative z-10 border-0"
                    src={getEmbedUrl(activeLesson.videoUrl)} 
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-[#020510] relative z-10">
                    <svg className="w-20 h-20 mb-6 opacity-30 group-hover:scale-110 transition-transform duration-700 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <a href={activeLesson.videoUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white/[0.03] border border-white/[0.08] rounded-full text-emerald-400 font-bold hover:bg-emerald-500 hover:text-[#010206] transition-all duration-300 tracking-wide uppercase text-sm hover:shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                      Open External Video
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Lesson Content / Notes Area */}
            {activeLesson.content && (
              <div className="bg-[#030612]/60 backdrop-blur-[40px] border border-white/[0.06] rounded-[2.5rem] p-10 md:p-14 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] mb-12 transform-gpu">
                <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-4 tracking-tight">
                  <div className="w-12 h-12 rounded-[1rem] bg-[#040814] border border-white/[0.08] flex items-center justify-center text-emerald-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                  Study Material
                </h3>
                <div className="prose prose-invert prose-emerald max-w-none text-slate-300 leading-relaxed text-lg font-light whitespace-pre-wrap mix-blend-screen">
                  {activeLesson.content}
                </div>
              </div>
            )}

            {/* Assignment Submission Section */}
            <div className="bg-gradient-to-br from-[#060d20] to-[#040814] border border-emerald-500/20 rounded-[2.5rem] p-10 md:p-14 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.1)] relative overflow-hidden group transform-gpu">
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-emerald-400 to-teal-500 shadow-[0_0_20px_rgba(52,211,153,0.8)]"></div>
              
              <h3 className="text-2xl font-black text-white mb-3 flex items-center gap-3 tracking-tight drop-shadow-md">
                <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Task Submission
              </h3>
              <p className="text-slate-400 text-[15px] font-light mb-8 mix-blend-screen">Write your reflections, answers, or paste a link to your assignment document below.</p>
              
              <form onSubmit={handleAssignmentSubmit}>
                <div className="relative">
                    <textarea
                    value={assignmentContent}
                    onChange={(e) => setAssignmentContent(e.target.value)}
                    placeholder="Start typing your assignment here..."
                    rows={6}
                    required
                    className="w-full bg-[#010206]/80 backdrop-blur-md border border-white/[0.08] rounded-[1.5rem] px-6 py-5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-300 resize-none mb-6 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] font-medium"
                    ></textarea>
                </div>
                
                {/* Status Messages */}
                <AnimatePresence>
                    {submissionMessage.text && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={`p-4 rounded-[1rem] text-[13px] font-bold tracking-wide border mb-6 flex items-center gap-3 ${submissionMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[inset_0_1px_1px_rgba(52,211,153,0.2)]' : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[inset_0_1px_1px_rgba(239,68,68,0.2)]'}`}
                    >
                        {submissionMessage.type === 'success' ? (
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                        {submissionMessage.text}
                    </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex justify-end">
                  <button 
                    type="submit"
                    disabled={submittingTask}
                    className="group relative px-10 py-5 bg-gradient-to-b from-emerald-400 to-teal-500 text-[#010206] text-[14px] font-black uppercase tracking-widest rounded-full transition-all duration-300 shadow-[0_0_30px_-5px_rgba(52,211,153,0.6),inset_0_1px_1px_rgba(255,255,255,0.8)] disabled:opacity-50 flex items-center gap-3 overflow-hidden ring-1 ring-white/20 active:scale-95"
                  >
                    {!submittingTask && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>}
                    <span className="relative z-10 flex items-center gap-2">
                        {submittingTask ? (
                            <>
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Uploading...
                            </>
                        ) : (
                            <>
                            Submit Work
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </>
                        )}
                    </span>
                  </button>
                </div>
              </form>
            </div>

          </motion.div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 relative z-10">
            <svg className="w-24 h-24 mb-6 opacity-20 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            <p className="text-xl font-bold tracking-tight text-slate-400">Select a lesson to initialize module.</p>
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: globalAnimations }} />
    </div>
  );
}