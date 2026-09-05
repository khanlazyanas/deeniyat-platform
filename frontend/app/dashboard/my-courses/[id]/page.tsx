"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, Variants } from "framer-motion";

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
  
  audio::-webkit-media-controls-panel { background-color: #040814; }
  audio::-webkit-media-controls-current-time-display,
  audio::-webkit-media-controls-time-remaining-display { color: #4ade80; }
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

  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // File Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Smart Submission Check
  const [existingSubmission, setExistingSubmission] = useState<any>(null);
  const [checkingSubmission, setCheckingSubmission] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 🚀 NAYA: Personal Note States
  const [personalNote, setPersonalNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [noteMessage, setNoteMessage] = useState({ type: "", text: "" });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const fgX = useTransform(smoothMouseX, (v) => v * 1.5);
  const fgY = useTransform(smoothMouseY, (v) => v * 1.5);
  const mgX = useTransform(smoothMouseX, (v) => v * 0.8);
  const mgY = useTransform(smoothMouseY, (v) => v * 0.8);

  const isOwnerOrAdmin = user?.role === 'Admin' || (user?.role === 'Ustad' && (course?.teacherId?._id === user?._id || course?.teacherId === user?._id));

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

  useEffect(() => {
    if (!activeLesson || isOwnerOrAdmin) return;

    const checkExistingSubmissionAndNotes = async () => {
      setCheckingSubmission(true);
      setExistingSubmission(null);
      
      setAssignmentContent("");
      discardRecording();
      setSelectedFile(null);
      setSubmissionMessage({ type: "", text: "" });
      
      // 🚀 Reset Note state on lesson change
      setPersonalNote("");
      setNoteMessage({ type: "", text: "" });

      try {
        const token = localStorage.getItem("token");
        
        // Fetch Submissions
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submissions/my-submissions`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const submissionsArray = Array.isArray(data) ? data : (data.data || []);
          const found = submissionsArray.find((sub: any) => {
            const subLessonId = sub.lessonId?._id ? String(sub.lessonId._id) : String(sub.lessonId);
            return subLessonId === String(activeLesson._id);
          });
          setExistingSubmission(found || null);
        }

        // 🚀 NAYA: Fetch Saved Personal Note for this lesson
        const enrollRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments/my-courses`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (enrollRes.ok) {
           const enrollData = await enrollRes.json();
           const enrollmentsArray = Array.isArray(enrollData) ? enrollData : (enrollData.data || []);
           const currentEnroll = enrollmentsArray.find((e: any) => {
              const cId = e.courseId?._id || e.courseId;
              return String(cId) === String(courseId);
           });
           if (currentEnroll && currentEnroll.lessonProgress) {
              const progress = currentEnroll.lessonProgress.find((p: any) => String(p.lessonId) === String(activeLesson._id));
              if (progress && progress.personalNote) {
                 setPersonalNote(progress.personalNote);
              }
           }
        }
      } catch (error) {
        console.error("Failed to check status", error);
      } finally {
        setCheckingSubmission(false);
      }
    };

    checkExistingSubmissionAndNotes();
  }, [activeLesson, isOwnerOrAdmin, courseId]);

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi;
    const match = regExp.exec(url);
    if (match && match[1].length === 11) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0&modestbranding=1&showinfo=0&controls=1`;
    }
    return url; 
  };

  // Audio Recording Handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
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
      setSubmissionMessage({ type: "error", text: "Please allow microphone access to record." });
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setSelectedFile(e.target.files[0]);
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentContent.trim() && !audioBlob && !selectedFile) {
      setSubmissionMessage({ type: "error", text: "Please provide text, an audio recording, or upload a document." });
      return;
    }

    setSubmittingTask(true);
    setSubmissionMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const formData = new FormData();
      formData.append("courseId", courseId);
      if (activeLesson?._id) formData.append("lessonId", activeLesson._id);
      if (assignmentContent.trim()) formData.append("content", assignmentContent);
      if (audioBlob) formData.append("audio", audioBlob, "recording.webm");
      if (selectedFile) formData.append("document", selectedFile);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submissions`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to submit assignment");

      setSubmissionMessage({ type: "success", text: "Assignment submitted successfully! Ustad will review it soon." });
      setExistingSubmission(data.submission || data || { 
        content: assignmentContent, 
        audioFileUrl: audioBlob ? "Audio Uploaded" : null, 
        documentUrl: selectedFile ? "Document Uploaded" : null,
        status: "Pending" 
      });

      setAssignmentContent(""); 
      discardRecording();
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
    } catch (err: unknown) {
        if (err instanceof Error) setSubmissionMessage({ type: "error", text: err.message });
    } finally {
      setSubmittingTask(false);
      setTimeout(() => setSubmissionMessage({ type: "", text: "" }), 5000);
    }
  };

  // 🚀 NAYA: Handle Note Saving API Call
  const handleSaveNote = async () => {
    setSavingNote(true);
    setNoteMessage({ type: "", text: "" });
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments/save-note`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          lessonId: activeLesson?._id,
          note: personalNote
        })
      });
      if (!res.ok) throw new Error("Failed to save note");
      setNoteMessage({ type: "success", text: "Notes saved securely!" });
    } catch (err) {
      setNoteMessage({ type: "error", text: "Error saving notes. Check connection." });
    } finally {
      setSavingNote(false);
      setTimeout(() => setNoteMessage({ type: "", text: "" }), 4000);
    }
  };

  const handleEditLesson = (e: React.MouseEvent, lessonId: string) => {
    e.stopPropagation(); 
    router.push(`/dashboard/edit-lesson/${lessonId}`);
  };

  const handleDeleteLesson = async (e: React.MouseEvent, lessonId: string) => {
    e.stopPropagation(); 
    if (!window.confirm("Are you sure you want to permanently delete this module?")) return;

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
    <div className="min-h-screen pt-24 pb-12 bg-[#010206] flex flex-col items-center justify-center relative perspective-[2000px] overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse"></div>
      <div className="w-16 h-16 border-4 border-slate-800/80 border-t-emerald-400 rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(52,211,153,0.5)] z-10"></div>
      <p className="text-emerald-400 font-bold tracking-[0.2em] uppercase text-sm z-10">Initializing Studio...</p>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen pt-24 pb-12 bg-[#010206] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="bg-[#030612]/80 backdrop-blur-2xl border border-red-500/30 p-10 rounded-[2.5rem] text-center max-w-xl shadow-[0_20px_40px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.05)] z-10">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 text-red-400">
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
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
          {lessons.length === 0 ? (
            <div className="flex flex-col items-center text-center mt-10">
               <p className="text-slate-500 text-sm font-medium">Curriculum is being prepared.</p>
            </div>
          ) : (
            lessons.map((lesson, index) => (
              <div 
                key={lesson._id} 
                className={`flex flex-col rounded-[1.25rem] transition-all duration-300 border overflow-hidden ${
                  activeLesson?._id === lesson._id ? "bg-emerald-500/10 border-emerald-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.2)]" : "bg-[#010206]/50 border-white/[0.08]"
                }`}
              >
                <button 
                  onClick={() => {
                    if(activeLesson?._id !== lesson._id) setActiveLesson(lesson);
                  }}
                  className="w-full p-5 flex items-start gap-4 cursor-pointer hover:bg-white/[0.02] text-left transition-colors"
                >
                  <div className={`w-10 h-10 rounded-[0.8rem] flex items-center justify-center shrink-0 font-black text-sm transition-colors ${
                    activeLesson?._id === lesson._id ? "bg-gradient-to-b from-emerald-400 to-teal-500 text-[#010206]" : "bg-[#020510] border border-white/[0.1] text-slate-400"
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 overflow-hidden pt-1">
                    <h4 className={`font-bold text-[15px] truncate tracking-tight ${activeLesson?._id === lesson._id ? "text-emerald-400" : "text-slate-200"}`}>{lesson.title}</h4>
                  </div>
                </button>
                {isOwnerOrAdmin && (
                  <div className="flex items-center justify-end gap-2 px-4 py-3 bg-[#000000]/40 border-t border-white/[0.05]">
                    <button onClick={(e) => handleEditLesson(e, lesson._id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold transition-colors">Edit</button>
                    <button onClick={(e) => handleDeleteLesson(e, lesson._id)} disabled={deletingId === lesson._id} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold transition-colors disabled:opacity-50">Delete</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* RIGHT MAIN AREA */}
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
                    <a href={activeLesson.videoUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white/[0.03] border border-white/[0.08] rounded-full text-emerald-400 font-bold hover:bg-emerald-500 hover:text-[#010206] transition-all duration-300">
                      Open External Video
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Lesson Content Area */}
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

            {/* 🚀 NAYA: My Personal Notes Area (Visible to Students Only) */}
            {!isOwnerOrAdmin && (
              <div className="bg-[#030612]/60 backdrop-blur-[40px] border border-amber-500/10 rounded-[2.5rem] p-10 md:p-14 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] mb-12 transform-gpu">
                <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-4 tracking-tight">
                  <div className="w-12 h-12 rounded-[1rem] bg-[#040814] border border-white/[0.08] flex items-center justify-center text-amber-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </div>
                  My Personal Notes
                </h3>
                
                <div className="relative">
                  <textarea
                    value={personalNote}
                    onChange={(e) => setPersonalNote(e.target.value)}
                    placeholder="Type your notes here while watching the lecture..."
                    rows={5}
                    className="w-full bg-[#010206]/80 backdrop-blur-md border border-white/[0.08] rounded-[1.5rem] px-6 py-5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all duration-300 resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] font-medium"
                  ></textarea>
                </div>
                
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex-1">
                     <AnimatePresence>
                        {noteMessage.text && (
                           <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={`text-sm font-bold tracking-wide flex items-center gap-2 ${noteMessage.type === 'success' ? 'text-amber-400' : 'text-red-400'}`}>
                              {noteMessage.type === 'success' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
                              {noteMessage.text}
                           </motion.span>
                        )}
                     </AnimatePresence>
                  </div>
                  <button 
                     onClick={handleSaveNote}
                     disabled={savingNote}
                     className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-[#010206] text-[13px] font-black uppercase tracking-widest rounded-full transition-all duration-300 shadow-[0_0_20px_-5px_rgba(245,158,11,0.6)] disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                  >
                     {savingNote ? 'Saving...' : 'Save Notes'}
                     {!savingNote && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>}
                  </button>
                </div>
              </div>
            )}

            {/* Assignment & Recitation Submission Section */}
            {isOwnerOrAdmin ? (
              <div className="bg-[#030612]/60 border border-white/[0.05] rounded-[2.5rem] p-10 text-center shadow-lg">
                 <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700/50">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">Task Submission Area</h3>
                 <p className="text-slate-400 text-sm font-light max-w-md mx-auto">
                    Students will see the Text, Audio, and Image/PDF Document submission form here.
                 </p>
              </div>
            ) : checkingSubmission ? (
              <div className="bg-[#060d20]/50 border border-white/[0.05] rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-lg">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 text-sm font-medium">Checking assignment status...</p>
              </div>
            ) : existingSubmission ? (
              <div className="bg-gradient-to-br from-[#02100a] to-[#010604] border border-emerald-500/30 rounded-[2.5rem] p-10 md:p-14 shadow-lg relative overflow-hidden transform-gpu">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-[60px]"></div>
                
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">Task Submitted Successfully</h3>
                    <p className="text-slate-400 text-sm">You have completed the assignment for this module.</p>
                  </div>
                </div>

                <div className="bg-[#010206]/80 p-6 rounded-[1.5rem] border border-white/[0.08] text-slate-300 whitespace-pre-wrap relative z-10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] mb-6">
                  <span className="text-[10px] text-emerald-400 uppercase font-black tracking-widest block mb-3 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Your Written Answer
                  </span>
                  {existingSubmission.content || "No written answer provided."}
                </div>

                {existingSubmission.audioFileUrl && (
                  <div className="bg-[#010206]/80 p-4 rounded-[1.5rem] border border-white/[0.08] relative z-10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] mb-6">
                     <span className="text-[10px] text-amber-400 uppercase font-black tracking-widest block mb-3 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                        Your Recitation
                     </span>
                     <audio controls src={existingSubmission.audioFileUrl} className="w-full custom-audio-player focus:outline-none" />
                  </div>
                )}

                {existingSubmission.documentUrl && (
                  <div className="bg-[#010206]/80 p-4 rounded-[1.5rem] border border-white/[0.08] relative z-10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] mb-6">
                     <span className="text-[10px] text-blue-400 uppercase font-black tracking-widest block mb-3 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                        Your Uploaded Document
                     </span>
                     <a href={existingSubmission.documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-medium underline text-sm break-all">
                       {existingSubmission.documentUrl}
                     </a>
                  </div>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-3 relative z-10">
                  <span className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Evaluation Status:</span>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${existingSubmission.status === 'Graded' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]'}`}>
                    {existingSubmission.status || 'Pending'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-[#060d20] to-[#040814] border border-emerald-500/20 rounded-[2.5rem] p-10 md:p-14 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.1)] relative overflow-hidden group transform-gpu">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-emerald-400 to-teal-500 shadow-[0_0_20px_rgba(52,211,153,0.8)]"></div>
                
                <h3 className="text-2xl font-black text-white mb-3 flex items-center gap-3 tracking-tight drop-shadow-md">
                  <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Task Submission Workspace
                </h3>
                <p className="text-slate-400 text-[15px] font-light mb-8 mix-blend-screen">Provide written answers, record audio, or upload images/documents for your assignment.</p>
                
                <form onSubmit={handleAssignmentSubmit} className="space-y-6">
                  
                  <div className="relative">
                      <textarea
                      value={assignmentContent}
                      onChange={(e) => setAssignmentContent(e.target.value)}
                      placeholder="Start typing your written assignment here (Optional)..."
                      rows={4}
                      className="w-full bg-[#010206]/80 backdrop-blur-md border border-white/[0.08] rounded-[1.5rem] px-6 py-5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-300 resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] font-medium"
                      ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#010206]/60 border border-white/[0.04] rounded-[2rem] p-8 text-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col justify-between">
                      {isRecording && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <motion.div animate={{ scale: [1, 2, 2.5], opacity: [0.5, 0.2, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute w-32 h-32 bg-red-500/30 rounded-full"></motion.div>
                              <motion.div animate={{ scale: [1, 1.5, 2], opacity: [0.8, 0.4, 0] }} transition={{ duration: 1.5, delay: 0.5, repeat: Infinity }} className="absolute w-32 h-32 bg-red-500/40 rounded-full"></motion.div>
                          </div>
                      )}
                      <label className="flex items-center justify-center gap-3 text-[11px] font-black text-amber-500 uppercase tracking-[0.3em] mb-6 relative z-10">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                        Voice Recorder
                      </label>
                      
                      {!audioBlob ? (
                        <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
                          {isRecording ? (
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(239,68,68,0.2)]"><div className="w-8 h-8 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse"></div></div>
                              <button type="button" onClick={stopRecording} className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-black tracking-widest uppercase text-[12px] rounded-full border border-red-500/30 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">Stop</button>
                            </div>
                          ) : (
                            <button type="button" onClick={startRecording} className="w-16 h-16 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400 rounded-full flex items-center justify-center mx-auto transition-all duration-300 group shadow-[0_0_30px_rgba(245,158,11,0.1),inset_0_1px_2px_rgba(255,255,255,0.1)] active:scale-95">
                              <svg className="w-6 h-6 text-amber-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center relative z-10 w-full flex-1 justify-center">
                          <div className="w-full bg-[#040814] p-2 rounded-xl border border-white/[0.05] mb-4 shadow-inner"><audio src={audioUrl} controls className="w-full h-8 custom-audio-player focus:outline-none" /></div>
                          <button type="button" onClick={discardRecording} className="group flex items-center gap-2 text-slate-500 hover:text-red-400 text-[11px] font-black uppercase tracking-widest transition-colors"><svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> Discard Audio</button>
                        </div>
                      )}
                    </div>

                    <div className="bg-[#010206]/60 border border-white/[0.04] rounded-[2rem] p-8 text-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col justify-between">
                      <label className="flex items-center justify-center gap-3 text-[11px] font-black text-blue-500 uppercase tracking-[0.3em] mb-6 relative z-10">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Document / Image
                      </label>
                      
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" 
                      />

                      {!selectedFile ? (
                         <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
                           <button 
                             type="button" 
                             onClick={() => fileInputRef.current?.click()} 
                             className="w-16 h-16 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-400 rounded-full flex items-center justify-center mx-auto transition-all duration-300 group shadow-[0_0_30px_rgba(59,130,246,0.1),inset_0_1px_2px_rgba(255,255,255,0.1)] active:scale-95"
                           >
                             <svg className="w-6 h-6 text-blue-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                           </button>
                         </div>
                      ) : (
                        <div className="flex flex-col items-center relative z-10 w-full flex-1 justify-center">
                          <div className="w-full bg-[#040814] p-3 rounded-xl border border-white/[0.05] mb-4 shadow-inner overflow-hidden flex items-center gap-3">
                             <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                             <span className="text-slate-300 text-xs truncate font-medium">{selectedFile.name}</span>
                          </div>
                          <button type="button" onClick={() => { setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value = ""; }} className="group flex items-center gap-2 text-slate-500 hover:text-red-400 text-[11px] font-black uppercase tracking-widest transition-colors"><svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> Remove File</button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <AnimatePresence>
                      {submissionMessage.text && (
                      <motion.div 
                          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className={`p-4 rounded-[1rem] text-[13px] font-bold tracking-wide border flex items-center gap-3 ${submissionMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[inset_0_1px_1px_rgba(52,211,153,0.2)]' : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[inset_0_1px_1px_rgba(239,68,68,0.2)]'}`}
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

                  <div className="flex justify-end pt-2">
                    <button 
                      type="submit"
                      disabled={submittingTask || (!assignmentContent.trim() && !audioBlob && !selectedFile)}
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
                              Submit Assignment
                              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                              </>
                          )}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 relative z-10">
            <p className="text-xl font-bold tracking-tight text-slate-400">Select a lesson to initialize module.</p>
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: globalAnimations }} />
    </div>
  );
}