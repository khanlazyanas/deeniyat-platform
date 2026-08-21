"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Submission {
  _id: string;
  content?: string; 
  audioFileUrl?: string; 
  documentUrl?: string; 
  grade: string;
  feedback: string;
  status: 'Pending' | 'Graded';
  createdAt: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  lessonId: {
    _id: string;
    title: string;
  };
  // 👇 NEW: Interface me courseId add kiya hai
  courseId?: {
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
    color: ['bg-emerald-400', 'bg-teal-400', 'bg-blue-400', 'bg-amber-400', 'bg-white'][Math.floor(Math.random() * 5)],
    blur: Math.random() * 3 + 1,
    opacity: Math.random() * 0.5 + 0.3,
    layer: Math.floor(Math.random() * 3)
  }));
};

const ambientBubbles = generateBubbles(45);

// --- 3D Holographic Card Component ---
function HolographicSubmissionCard({
  sub, index, gradingId, setGradingId, gradeInput, setGradeInput, 
  feedbackInput, setFeedbackInput, handleGradeSubmit, submitLoading
}: {
  sub: Submission, index: number, gradingId: string | null, setGradingId: (id: string | null) => void,
  gradeInput: string, setGradeInput: (val: string) => void, feedbackInput: string, 
  setFeedbackInput: (val: string) => void, handleGradeSubmit: (id: string) => void, submitLoading: boolean
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 40, stiffness: 250, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), springConfig);

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

  const isGradingThis = gradingId === sub._id;

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
      className={`relative bg-[#030612]/70 backdrop-blur-[40px] backdrop-saturate-[150%] border rounded-[2.5rem] p-8 md:p-10 transition-all duration-700 will-change-transform ${
        isGradingThis 
          ? 'border-amber-500/30 shadow-[0_32px_64px_-20px_rgba(245,158,11,0.2),inset_0_1px_2px_rgba(255,255,255,0.1)]' 
          : 'border-white/[0.06] hover:border-white/[0.12] shadow-[0_32px_64px_-20px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.1)]'
      }`}
    >
      {/* Dynamic Holographic Glare */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 z-0 mix-blend-color-dodge rounded-[2.5rem]"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(800px circle at ${glarePosition.x}px ${glarePosition.y}px, rgba(255,255,255,0.1), transparent 40%)`,
        }}
      />

      <div className="relative z-10 w-full h-full transform-gpu" style={{ transform: "translateZ(20px)" }}>
        
        {/* Top Row: User & Lesson Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8 pb-8 border-b border-white/[0.04]">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#060d20] to-[#040814] border border-white/[0.08] flex items-center justify-center text-emerald-400 font-black uppercase text-2xl shrink-0 shadow-[0_8px_16px_rgba(0,0,0,0.4)]">
              {sub.studentId?.name?.charAt(0) || '?'}
            </div>
            <div>
              <h4 className="text-white font-black text-xl tracking-tight drop-shadow-md">{sub.studentId?.name || 'Unknown Student'}</h4>
              
              {/* 👇 UPDATED: Course and Lesson Name Section 👇 */}
              <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <span className="text-[11px] font-bold text-amber-400/80 uppercase tracking-[0.15em] flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md w-fit">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  {sub.courseId?.title || 'Unknown Course'}
                </span>
                <span className="hidden sm:block text-slate-600">•</span>
                <span className="text-[11px] font-bold text-emerald-400/80 uppercase tracking-[0.15em] flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md w-fit">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
                  {sub.lessonId?.title || 'Unknown Lecture'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-left md:text-right flex flex-col md:items-end">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">Timestamp</span>
            <span className="text-[13px] font-bold text-slate-300 bg-[#010206] px-4 py-2 rounded-xl border border-white/[0.05] shadow-inner">
              {new Date(sub.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Middle Row: Content Display (Audio, Text, AND Document) */}
        <div className="mb-8 space-y-6">
          
          {/* Document Section */}
          {sub.documentUrl && (
            <div>
              <p className="text-[11px] font-black text-slate-500 mb-4 uppercase tracking-[0.25em] flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                Uploaded Document
              </p>
              <div className="w-full bg-[#040814]/80 p-4 rounded-2xl border border-white/[0.05] shadow-inner flex items-center justify-between">
                 <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 shrink-0">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <span className="text-slate-300 text-sm truncate font-medium max-w-[200px] md:max-w-md">
                      Student_Attachment_File
                    </span>
                 </div>
                 <a href={sub.documentUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold transition-colors uppercase tracking-widest shrink-0">
                   View File
                 </a>
              </div>
            </div>
          )}

          {/* Audio Section (Only shows if audioFileUrl exists) */}
          {sub.audioFileUrl && (
            <div>
              <p className="text-[11px] font-black text-slate-500 mb-4 uppercase tracking-[0.25em] flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                Student Recording
              </p>
              <div className="w-full bg-[#040814] p-2 rounded-2xl border border-white/[0.05] shadow-inner">
                <audio controls className="w-full custom-audio-player focus:outline-none">
                  <source src={sub.audioFileUrl} type="audio/mpeg" />
                </audio>
              </div>
            </div>
          )}

          {/* Text Section (Only shows if content exists) */}
          {sub.content && (
            <div>
              <p className="text-[11px] font-black text-slate-500 mb-4 uppercase tracking-[0.25em] flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Written Assignment / Notes
              </p>
              <div className="w-full bg-[#040814]/80 p-5 rounded-2xl border border-white/[0.05] shadow-inner">
                <p className="text-slate-300 text-sm md:text-[15px] font-medium leading-relaxed whitespace-pre-wrap">
                  {sub.content}
                </p>
              </div>
            </div>
          )}

          {/* Fallback if somehow neither exists */}
          {!sub.audioFileUrl && !sub.content && !sub.documentUrl && (
             <div className="text-center p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
               No submission content found for this record.
             </div>
          )}

        </div>

        {/* Bottom Row: Grading Action or Result */}
        {sub.status === 'Graded' ? (
          <div className="bg-gradient-to-br from-emerald-900/10 to-[#040814] border border-emerald-500/20 rounded-[1.5rem] p-6 flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden group/grade shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none group-hover/grade:bg-emerald-500/20 transition-colors duration-700"></div>
            <div className="shrink-0 text-center bg-[#010206] border border-white/[0.06] p-4 rounded-[1.25rem] min-w-[90px] z-10 shadow-inner">
              <span className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-[0.2em]">Grade</span>
              <span className="block text-3xl font-black text-emerald-400 leading-none drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">{sub.grade}</span>
            </div>
            <div className="z-10 relative">
              <span className="block text-[11px] font-black text-emerald-500 uppercase mb-2 tracking-[0.25em]">Your Feedback</span>
              <p className="text-slate-300 text-sm font-light leading-relaxed mix-blend-screen">{sub.feedback || "No feedback provided."}</p>
            </div>
          </div>
        ) : (
          <div>
            <AnimatePresence mode="wait">
              {isGradingThis ? (
                <motion.div 
                  initial={{ opacity: 0, height: 0, scale: 0.95 }} animate={{ opacity: 1, height: 'auto', scale: 1 }} exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
                  className="bg-[#010206]/80 border border-amber-500/30 rounded-[1.5rem] p-8 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none"></div>
                  
                  <h5 className="text-amber-400 font-black text-lg mb-6 flex items-center gap-3 tracking-tight relative z-10">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    Evaluation Panel
                  </h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 relative z-10">
                    <div className="md:col-span-1">
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Assign Grade</label>
                      <select 
                        value={gradeInput}
                        onChange={(e) => setGradeInput(e.target.value)}
                        className="w-full bg-[#020510] border border-white/[0.08] text-white font-bold rounded-xl px-4 py-3.5 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all shadow-inner cursor-pointer"
                      >
                        <option value="A+">A+ (Excellent)</option>
                        <option value="A">A (Very Good)</option>
                        <option value="B">B (Good)</option>
                        <option value="C">C (Needs Improvement)</option>
                        <option value="Needs Revision">Needs Revision</option>
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Ustad Feedback <span className="lowercase tracking-normal text-slate-500 font-medium">(Optional)</span></label>
                      <input 
                        type="text"
                        placeholder="e.g., MashaAllah, perfect answer!"
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        className="w-full bg-[#020510] border border-white/[0.08] text-white rounded-xl px-5 py-3.5 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all shadow-inner"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-4 relative z-10">
                    <button 
                      onClick={() => setGradingId(null)}
                      className="px-6 py-3 rounded-xl text-[13px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleGradeSubmit(sub._id)}
                      disabled={submitLoading}
                      className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-[#010206] text-[13px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.4),inset_0_1px_1px_rgba(255,255,255,0.6)] flex items-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                      {submitLoading ? "Saving..." : "Lock Grade"}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.button 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => {
                    setGradingId(sub._id);
                    setGradeInput("A"); // Reset on open
                    setFeedbackInput("");
                  }}
                  className="w-full group/eval relative px-8 py-4 bg-white/[0.02] border border-white/[0.06] hover:border-amber-500/50 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 opacity-0 group-hover/eval:opacity-100 transition-opacity duration-500 translate-x-[-100%] group-hover/eval:translate-x-[100%]"></div>
                  <svg className="w-5 h-5 text-amber-500 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  <span className="relative z-10 text-white text-[14px] font-black uppercase tracking-widest">Evaluate Task</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Pending' | 'Graded'>('Pending');
  const [mounted, setMounted] = useState(false);
  
  // Grading State
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState("A");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

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

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submissions/all`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error("Failed to fetch submissions", error);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchSubmissions();

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 100;
      const y = (e.clientY / window.innerHeight - 0.5) * 100;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [mouseX, mouseY]);

  const handleGradeSubmit = async (submissionId: string) => {
    setSubmitLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submissions/${submissionId}/grade`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ grade: gradeInput, feedback: feedbackInput })
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Assignment graded successfully! System updated." });
        setGradingId(null);
        setGradeInput("A");
        setFeedbackInput("");
        fetchSubmissions(); 
      } else {
        setMessage({ type: "error", text: "Failed to save grade to database." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSubmitLoading(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    }
  };

  const filteredSubmissions = submissions.filter(sub => sub.status === activeTab);

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#010206] text-slate-50 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-hidden relative px-4 sm:px-6 lg:px-8 perspective-[2000px]">
      
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
      <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-amber-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-[pulse_10s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[140px] pointer-events-none mix-blend-screen animate-[pulse_15s_ease-in-out_infinite_reverse]"></div>

      <div className="max-w-5xl w-full mx-auto relative z-10 py-12">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.02] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)] mb-6 backdrop-blur-xl">
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(245,158,11,1)]"></span>
              <span className="text-[11px] font-black text-slate-300 tracking-[0.3em] uppercase">Grading Portal</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 drop-shadow-md">Review Workspace</h2>
            <p className="text-slate-400 font-light text-[17px] mix-blend-screen max-w-xl">Evaluate student submissions, correct assignments, and provide vital feedback.</p>
          </div>

          {/* Premium Animated Tabs */}
          <div className="flex p-1.5 bg-[#010206]/80 backdrop-blur-md border border-white/[0.06] rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] w-fit shrink-0 relative">
            <button 
              onClick={() => setActiveTab('Pending')}
              className={`relative z-10 px-8 py-3 rounded-xl text-[12px] font-black tracking-widest uppercase transition-colors duration-300 ${activeTab === 'Pending' ? 'text-amber-400' : 'text-slate-500 hover:text-white'}`}
            >
              Pending ({submissions.filter(s => s.status === 'Pending').length})
            </button>
            <button 
              onClick={() => setActiveTab('Graded')}
              className={`relative z-10 px-8 py-3 rounded-xl text-[12px] font-black tracking-widest uppercase transition-colors duration-300 ${activeTab === 'Graded' ? 'text-emerald-400' : 'text-slate-500 hover:text-white'}`}
            >
              Graded ({submissions.filter(s => s.status === 'Graded').length})
            </button>
            
            {/* Sliding Pill Background */}
            <motion.div 
               className={`absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] rounded-xl border z-0 ${activeTab === 'Pending' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}
               initial={false}
               animate={{ 
                 x: activeTab === 'Pending' ? 0 : '100%',
                 backgroundColor: activeTab === 'Pending' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                 borderColor: activeTab === 'Pending' ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'
               }}
               transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          </div>
        </motion.div>

        {/* Global Message Alert */}
        <AnimatePresence>
            {message.text && (
            <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`mb-8 p-4 rounded-[1.25rem] text-[13px] font-bold tracking-wide border flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[inset_0_1px_1px_rgba(52,211,153,0.2)]' : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[inset_0_1px_1px_rgba(239,68,68,0.2)]'}`}
            >
                {message.type === 'success' ? (
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                ) : (
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
                {message.text}
            </motion.div>
            )}
        </AnimatePresence>

        {/* Submissions List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
             <div className="w-16 h-16 border-4 border-slate-800/80 border-t-amber-500 rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(245,158,11,0.5)] z-10"></div>
             <p className="text-amber-500 font-bold tracking-[0.2em] uppercase text-sm z-10">Accessing Database...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="bg-[#030612]/60 backdrop-blur-[40px] border border-white/[0.04] rounded-[3rem] p-16 text-center shadow-[0_32px_64px_-20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)]"
          >
            <div className="w-24 h-24 bg-white/[0.02] rounded-[2rem] border border-white/[0.05] flex items-center justify-center mx-auto mb-8 text-slate-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
               <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Inbox Clear</h3>
            <p className="text-slate-400 text-lg font-light leading-relaxed max-w-md mx-auto">No <span className="font-bold text-white">{activeTab.toLowerCase()}</span> submissions found. You're all caught up!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-10">
            {filteredSubmissions.map((sub, index) => (
              <HolographicSubmissionCard 
                key={sub._id} sub={sub} index={index}
                gradingId={gradingId} setGradingId={setGradingId}
                gradeInput={gradeInput} setGradeInput={setGradeInput}
                feedbackInput={feedbackInput} setFeedbackInput={setFeedbackInput}
                handleGradeSubmit={handleGradeSubmit} submitLoading={submitLoading}
              />
            ))}
          </div>
        )}

      </div>

      {/* Global CSS */}
      <style dangerouslySetInnerHTML={{ __html: globalAnimations }} />
    </div>
  );
}