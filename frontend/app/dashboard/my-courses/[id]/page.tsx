"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate, Variants } from "framer-motion";
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

const globalAnimations = `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }
`;

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

const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
};

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

  const [assignmentContent, setAssignmentContent] = useState("");
  const [submittingTask, setSubmittingTask] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState({ type: "", text: "" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  // 👇 TEMPORARY TESTING BYPASS: Yeh sabko dikhega testing ke liye
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

        const courseRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`);
        const courseData = await courseRes.json();
        if (!courseRes.ok) throw new Error(courseData.message || "Failed to load course");
        setCourse(courseData);

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
        if (err instanceof Error) setError(err.message);
      } finally {
        setTimeout(() => setLoading(false), 800); 
      }
    };

    fetchCourseAndLessons();
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [courseId, mouseX, mouseY]);

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
      const payload = { courseId, lessonId: activeLesson?._id, content: assignmentContent };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to submit assignment");

      setSubmissionMessage({ type: "success", text: "Assignment submitted successfully!" });
      setAssignmentContent(""); 
    } catch (err: unknown) {
        if (err instanceof Error) setSubmissionMessage({ type: "error", text: err.message });
    } finally {
      setSubmittingTask(false);
      setTimeout(() => setSubmissionMessage({ type: "", text: "" }), 5000);
    }
  };

  const handleEditLesson = (lessonId: string) => {
    router.push(`/dashboard/edit-lesson/${lessonId}`);
  };

  const handleDeleteLesson = async (lessonId: string) => {
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
      alert("Network error while deleting lesson");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading || !mounted) return (
    <div className="min-h-screen pt-24 pb-12 bg-[#010206] flex flex-col items-center justify-center relative">
      <div className="w-16 h-16 border-4 border-slate-800/80 border-t-emerald-400 rounded-full animate-spin mb-6 z-10"></div>
      <p className="text-emerald-400 font-bold tracking-[0.2em] uppercase text-sm z-10">Initializing Studio...</p>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen pt-24 pb-12 bg-[#010206] flex items-center justify-center p-6 text-red-400">{error}</div>
  );

  return (
    <div className="min-h-screen pt-24 bg-[#010206] flex flex-col md:flex-row overflow-hidden relative">
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>

      <div className="hidden md:block fixed inset-0 z-[5] pointer-events-none overflow-hidden">
        <motion.div style={{ x: fgX, y: fgY }} className="absolute inset-0 will-change-transform">
          {ambientBubbles.filter(b => b.layer === 0).map((p, i) => (
            <motion.div key={`fg-${i}`} className={`absolute rounded-full ${p.color}`} style={{ width: p.size, height: p.size, left: `${p.xPos}%`, top: `${p.yPos}%`, opacity: p.opacity, boxShadow: `0 0 ${p.size * 2}px currentColor` }} animate={{ y: [0, -40, 0], x: [0, 20, -10, 0] }} transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }} />
          ))}
        </motion.div>
      </div>

      {/* LEFT SIDEBAR: Course Curriculum */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
        className="w-full md:w-[400px] lg:w-[450px] bg-[#020510]/80 backdrop-blur-[40px] border-r border-white/[0.06] flex flex-col h-[calc(100vh-6rem)] shrink-0 relative z-20 shadow-[8px_0_24px_rgba(0,0,0,0.5)]"
      >
        <div className="p-8 border-b border-white/[0.04]">
          <button onClick={() => router.back()} className="group text-[11px] font-black tracking-[0.2em] uppercase text-slate-500 hover:text-emerald-400 flex items-center gap-2 mb-6 transition-colors">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Dashboard
          </button>
          <h2 className="text-2xl font-black text-white leading-tight drop-shadow-md tracking-tighter">{course?.title}</h2>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
          {lessons.length === 0 ? (
            <div className="flex flex-col items-center text-center mt-10">
               <p className="text-slate-500 text-sm font-medium">Curriculum is being prepared.</p>
            </div>
          ) : (
            lessons.map((lesson, index) => (
              
              // 👇 FIX: Yeh main card hai, iske andar Click area aur Action Buttons dono honge
              <div 
                key={lesson._id} 
                className={`flex flex-col rounded-[1.25rem] transition-all duration-300 border overflow-hidden ${
                  activeLesson?._id === lesson._id 
                    ? "bg-emerald-500/10 border-emerald-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.2)]" 
                    : "bg-[#010206]/50 border-white/[0.08]"
                }`}
              >
                
                {/* 1. TOP HALF: Click to Play Lesson */}
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
                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 mt-2">
                      {lesson.videoUrl ? '🎥 Video' : '📘 Reading'}
                    </p>
                  </div>
                </div>

                {/* 👇 2. BOTTOM HALF: EXPLICIT EDIT/DELETE BUTTONS */}
                {isOwnerOrAdmin && (
                  <div className="flex items-center justify-end gap-2 px-4 py-3 bg-[#000000]/40 border-t border-white/[0.05]">
                    
                    <button 
                      onClick={() => handleEditLesson(lesson._id)} 
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Edit Module
                    </button>
                    
                    <button 
                      onClick={() => handleDeleteLesson(lesson._id)} 
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
            ))
          )}
        </div>
      </motion.div>

      {/* RIGHT MAIN AREA: Video, Content & Assignment */}
      <div className="flex-1 h-[calc(100vh-6rem)] overflow-y-auto relative bg-transparent custom-scrollbar">
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
                    <a href={activeLesson.videoUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white/[0.03] border border-white/[0.08] rounded-full text-emerald-400 font-bold hover:bg-emerald-500 hover:text-[#010206] transition-all duration-300 tracking-wide uppercase text-sm">
                      Open External Video
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Lesson Content / Notes Area */}
            {activeLesson.content && (
              <div className="bg-[#030612]/60 backdrop-blur-[40px] border border-white/[0.06] rounded-[2.5rem] p-10 md:p-14 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] mb-12">
                <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-4 tracking-tight">Study Material</h3>
                <div className="prose prose-invert prose-emerald max-w-none text-slate-300 leading-relaxed text-lg font-light whitespace-pre-wrap mix-blend-screen">
                  {activeLesson.content}
                </div>
              </div>
            )}

            {/* Assignment */}
            <div className="bg-gradient-to-br from-[#060d20] to-[#040814] border border-emerald-500/20 rounded-[2.5rem] p-10 md:p-14 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.1)] relative">
              <h3 className="text-2xl font-black text-white mb-3">Task Submission</h3>
              <p className="text-slate-400 text-[15px] font-light mb-8">Write your reflections, answers, or paste a link to your assignment document below.</p>
              <form onSubmit={handleAssignmentSubmit}>
                <textarea
                  value={assignmentContent}
                  onChange={(e) => setAssignmentContent(e.target.value)}
                  placeholder="Start typing your assignment here..."
                  rows={6} required
                  className="w-full bg-[#010206]/80 backdrop-blur-md border border-white/[0.08] rounded-[1.5rem] px-6 py-5 text-slate-200 focus:outline-none focus:border-emerald-500/50 mb-6"
                ></textarea>
                <button type="submit" disabled={submittingTask} className="px-10 py-5 bg-gradient-to-b from-emerald-400 to-teal-500 text-[#010206] font-black uppercase tracking-widest rounded-full disabled:opacity-50">
                  {submittingTask ? "Uploading..." : "Submit Work"}
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
            <p className="text-xl font-bold tracking-tight">Select a lesson to initialize module.</p>
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: globalAnimations }} />
    </div>
  );
}