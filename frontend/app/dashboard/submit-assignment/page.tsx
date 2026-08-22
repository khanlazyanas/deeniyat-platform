"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useAuth } from "../../../../frontend/context/AuthContext";

interface Course {
  _id: string;
  title: string;
}

interface Lesson {
  _id: string;
  title: string;
  courseId: string;
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

export default function SubmitAssignmentPage() {
  const { user } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [mounted, setMounted] = useState(false);
  
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  
  const [textContent, setTextContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [loading, setLoading] = useState(false);
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

  const cardRef = useRef<HTMLFormElement>(null); 
  const cardSpringConfig = { damping: 40, stiffness: 250, mass: 0.5 };
  const rotateX = useSpring(useTransform(smoothMouseY, [-50, 50], [4, -4]), cardSpringConfig);
  const rotateY = useSpring(useTransform(smoothMouseX, [-50, 50], [-4, 4]), cardSpringConfig);
  const [isHovered, setIsHovered] = useState(false);
  const [glarePosition, setGlarePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 100;
      const y = (e.clientY / window.innerHeight - 0.5) * 100;
      mouseX.set(x);
      mouseY.set(y);

      if (cardRef.current && isHovered) {
        const rect = cardRef.current.getBoundingClientRect();
        setGlarePosition({ 
          x: e.clientX - rect.left, 
          y: e.clientY - rect.top 
        });
      }
    };
    
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [mouseX, mouseY, isHovered]);

  // 👇 DIRECT FETCH LOGIC FOR COURSES
  useEffect(() => {
    const fetchCoursesList = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          let sourceArray: any[] = [];
          if (Array.isArray(data)) sourceArray = data;
          else if (data.data && Array.isArray(data.data)) sourceArray = data.data;
          else if (data.courses && Array.isArray(data.courses)) sourceArray = data.courses;

          const validCourses = sourceArray.filter((c: any) => c && c._id && c.title);
          setCourses(validCourses as Course[]); 
        }
      } catch (error) {
        console.error("Failed to load all courses", error);
      }
    };

    fetchCoursesList();
  }, []);

  // 👇 100% PERFECT MATCH FOR YOUR BACKEND
  useEffect(() => {
    const fetchLessons = async () => {
      if (!selectedCourse) {
        setLessons([]);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        
        // Tumhare lessonRoutes.ts ke mutabiq EXACT correct URL path aur Token
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lessons/course/${selectedCourse}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Tumhara lessonController direct array bhej raha hai (res.json(lessons);)
          setLessons(data || []);
        } else {
          setLessons([]);
          console.error("Failed to fetch modules, Status:", response.status);
        }
      } catch (error) {
        console.error("Failed to load modules", error);
        setLessons([]);
      }
    };
    fetchLessons();
  }, [selectedCourse]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access denied", error);
      setMessage({ type: "error", text: "Please allow microphone access to record." });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const discardRecording = () => {
    setAudioBlob(null);
    setAudioUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse || !selectedLesson) {
      setMessage({ type: "error", text: "Please select a course and lesson." });
      return;
    }

    if (!audioBlob && !textContent.trim()) {
      setMessage({ type: "error", text: "Please provide either a text answer or an audio recording." });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      
      const formData = new FormData();
      formData.append("courseId", selectedCourse);
      formData.append("lessonId", selectedLesson);
      
      if (textContent.trim()) formData.append("content", textContent);
      if (audioBlob) formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submissions`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Alhamdulillah! Task submitted successfully." });
        setSelectedLesson("");
        setTextContent("");
        discardRecording();
      } else {
        const data = await response.json();
        setMessage({ type: "error", text: data.message || "Failed to submit assignment." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network Error. Failed to connect." });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#010206] text-slate-50 flex items-center justify-center font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-hidden relative px-4 sm:px-6 lg:px-8 perspective-[2000px] custom-scrollbar">
      
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay pointer-events-none z-0"></div>

      {mounted && (
        <div className="fixed inset-0 z-[5] pointer-events-none overflow-hidden">
          <motion.div style={{ x: fgX, y: fgY }} className="absolute inset-0 will-change-transform">
            {ambientBubbles.filter(b => b.layer === 0).map((p, i) => (
              <motion.div
                key={`fg-${i}`}
                className={`absolute rounded-full ${p.color}`}
                style={{ width: p.size, height: p.size, left: `${p.xPos}%`, top: `${p.yPos}%`, filter: `blur(${p.blur}px)`, opacity: p.opacity, boxShadow: `0 0 ${p.size * 2.5}px currentColor` }}
                animate={{ y: [0, -60, 0], x: [0, 30, -20, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
              />
            ))}
          </motion.div>

          <motion.div style={{ x: mgX, y: mgY }} className="absolute inset-0 will-change-transform">
             {ambientBubbles.filter(b => b.layer === 1).map((p, i) => (
              <motion.div
                key={`mg-${i}`}
                className={`absolute rounded-full ${p.color}`}
                style={{ width: p.size * 0.8, height: p.size * 0.8, left: `${p.xPos}%`, top: `${p.yPos}%`, filter: `blur(${p.blur + 1}px)`, opacity: p.opacity * 0.7, boxShadow: `0 0 ${p.size * 1.5}px currentColor` }}
                animate={{ y: [0, -40, 0], x: [0, -20, 15, 0] }}
                transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
              />
            ))}
          </motion.div>

          <motion.div style={{ x: bgX, y: bgY }} className="absolute inset-0 will-change-transform">
            {ambientBubbles.filter(b => b.layer === 2).map((p, i) => (
              <motion.div
                key={`bg-${i}`}
                className={`absolute rounded-full ${p.color}`}
                style={{ width: p.size * 1.5, height: p.size * 1.5, left: `${p.xPos}%`, top: `${p.yPos}%`, filter: `blur(${p.blur + 3}px)`, opacity: p.opacity * 0.4 }}
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay }}
              />
            ))}
          </motion.div>
        </div>
      )}

      <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-[pulse_10s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-[10%] left-[10%] w-[600px] h-[600px] bg-teal-900/10 rounded-full blur-[140px] pointer-events-none mix-blend-screen animate-[pulse_15s_ease-in-out_infinite_reverse]"></div>

      <div className="max-w-3xl w-full mx-auto relative z-10 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.02] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)] mb-6 backdrop-blur-xl">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,1)]"></span>
            <span className="text-[11px] font-black text-slate-300 tracking-[0.3em] uppercase">Student Portal</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 drop-shadow-md">Submit Task / Recitation</h2>
          <p className="text-slate-400 font-light text-[17px] mix-blend-screen">Provide your written answers, assignment links, or record a live audio recitation.</p>
        </motion.div>

        <motion.form 
          onSubmit={handleSubmit} 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
          ref={cardRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative bg-[#030612]/70 backdrop-blur-[40px] backdrop-saturate-[150%] border border-white/[0.06] rounded-[2.5rem] p-8 md:p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.5)] transition-colors duration-700 hover:border-white/[0.12] will-change-transform"
        >
          <div
            className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 z-0 mix-blend-color-dodge rounded-[2.5rem]"
            style={{
              opacity: isHovered ? 1 : 0,
              background: `radial-gradient(800px circle at ${glarePosition.x}px ${glarePosition.y}px, rgba(255,255,255,0.1), transparent 40%)`,
            }}
          />

          <div className="relative z-10 w-full h-full transform-gpu" style={{ transform: "translateZ(20px)" }}>
            
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

            <div className="space-y-8">
              
              {/* --- DROPDOWNS ROW --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Enrolled Course</label>
                  <div className="relative group">
                    <select 
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="relative w-full pl-6 pr-12 py-4 appearance-none bg-[#010206]/80 backdrop-blur-md border border-white/[0.06] rounded-[1.25rem] focus:bg-[#020510] focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all duration-300 text-slate-200 cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] font-bold z-10"
                    >
                      <option value="" className="bg-[#040814] text-slate-500">-- Choose Course --</option>
                      {courses.map((course: any) => (
                        <option key={course?._id} value={course?._id} className="bg-[#040814]">{course?.title}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none z-20">
                      <svg className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Target Module</label>
                  <div className="relative group">
                    <select 
                      value={selectedLesson}
                      onChange={(e) => setSelectedLesson(e.target.value)}
                      disabled={!selectedCourse || lessons.length === 0}
                      className="relative w-full pl-6 pr-12 py-4 appearance-none bg-[#010206]/80 backdrop-blur-md border border-white/[0.06] rounded-[1.25rem] focus:bg-[#020510] focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all duration-300 text-slate-200 cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] font-bold z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="" className="bg-[#040814] text-slate-500">{lessons.length === 0 && selectedCourse ? "No modules found" : "-- Choose Module --"}</option>
                      {lessons.map((lesson) => (
                        <option key={lesson._id} value={lesson._id} className="bg-[#040814]">{lesson.title}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none z-20">
                      <svg className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* TEXT SUBMISSION AREA */}
              <div className="bg-[#010206]/60 border border-white/[0.04] rounded-[2rem] p-8 md:p-10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <label className="flex items-center gap-3 text-[11px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-6 relative z-10">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Written Work / Link
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste your assignment link or type your notes here..."
                  rows={4}
                  className="w-full bg-[#020510]/80 border border-white/[0.08] rounded-[1.25rem] px-6 py-5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-300 resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] font-medium"
                ></textarea>
              </div>

              {/* LIVE AUDIO RECORDER AREA */}
              <div className="bg-[#010206]/60 border border-white/[0.04] rounded-[2rem] p-8 md:p-10 text-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] relative overflow-hidden">
                {isRecording && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <motion.div animate={{ scale: [1, 2, 2.5], opacity: [0.5, 0.2, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute w-32 h-32 bg-red-500/30 rounded-full"></motion.div>
                        <motion.div animate={{ scale: [1, 1.5, 2], opacity: [0.8, 0.4, 0] }} transition={{ duration: 1.5, delay: 0.5, repeat: Infinity }} className="absolute w-32 h-32 bg-red-500/40 rounded-full"></motion.div>
                    </div>
                )}

                <label className="flex items-center justify-center gap-3 text-[11px] font-black text-amber-500 uppercase tracking-[0.3em] mb-8 relative z-10">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                  Voice Recorder (Optional)
                </label>
                
                {!audioBlob ? (
                  <div className="relative z-10">
                    {isRecording ? (
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
                          <div className="w-12 h-12 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse"></div>
                        </div>
                        <p className="text-red-400 font-bold mb-6 tracking-wide drop-shadow-md">Recording active...</p>
                        <button 
                          type="button" 
                          onClick={stopRecording}
                          className="px-8 py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-black tracking-widest uppercase text-[12px] rounded-full border border-red-500/30 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                        >
                          Stop & Save
                        </button>
                      </div>
                    ) : (
                      <button 
                        type="button" 
                        onClick={startRecording}
                        className="w-24 h-24 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400 rounded-full flex items-center justify-center mx-auto transition-all duration-300 group shadow-[0_0_30px_rgba(245,158,11,0.1),inset_0_1px_2px_rgba(255,255,255,0.1)] active:scale-95"
                      >
                        <svg className="w-10 h-10 text-amber-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                      </button>
                    )}
                    {!isRecording && <p className="text-slate-500 mt-6 text-[12px] font-medium">Tap the mic if your task requires a recitation</p>}
                  </div>
                ) : (
                  <div className="flex flex-col items-center relative z-10 w-full">
                    <div className="w-full bg-[#040814] p-2 rounded-2xl border border-white/[0.05] mb-6 shadow-inner">
                        <audio src={audioUrl} controls className="w-full custom-audio-player focus:outline-none" />
                    </div>
                    <button 
                      type="button" 
                      onClick={discardRecording}
                      className="group flex items-center gap-2 text-slate-500 hover:text-red-400 text-[12px] font-black uppercase tracking-widest transition-colors"
                    >
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Discard & Retake
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={loading || !selectedLesson || (!audioBlob && !textContent.trim())}
                className="group relative px-10 py-5 w-full bg-gradient-to-b from-emerald-400 to-teal-500 text-[#010206] text-[15px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all duration-500 shadow-[0_0_30px_-5px_rgba(52,211,153,0.6),inset_0_1px_1px_rgba(255,255,255,0.8)] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-3 overflow-hidden ring-1 ring-white/20 active:scale-95"
              >
                {!loading && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>}
                <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                        <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Uploading...
                        </>
                    ) : (
                        <>
                        Upload Assignment
                        <svg className="w-5 h-5 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        </>
                    )}
                </span>
              </button>
            </div>
          </div>
        </motion.form>
      </div>
      
      {/* Global CSS for Animations */}
      <style dangerouslySetInnerHTML={{ __html: globalAnimations }} />
    </div>
  );
}