"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Course {
  _id: string;
  title: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
}

// --- GLOBAL STYLES (Safe from VS Code parser bugs) ---
const globalAnimations = `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }
  
  /* Webkit Date Picker Styling */
  ::-webkit-calendar-picker-indicator {
      filter: invert(1);
      cursor: pointer;
      opacity: 0.6;
  }
  ::-webkit-calendar-picker-indicator:hover {
      opacity: 1;
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
    color: ['bg-emerald-400', 'bg-teal-400', 'bg-blue-400', 'bg-indigo-400', 'bg-amber-400', 'bg-white'][Math.floor(Math.random() * 6)],
    blur: Math.random() * 3 + 1,
    opacity: Math.random() * 0.5 + 0.3,
    layer: Math.floor(Math.random() * 3)
  }));
};

const ambientBubbles = generateBubbles(45);

export default function AttendancePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
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

  // Holographic Card Config
  const cardRef = useRef<HTMLDivElement>(null);
  const cardSpringConfig = { damping: 40, stiffness: 250, mass: 0.5 };
  const rotateX = useSpring(useTransform(smoothMouseY, [-50, 50], [2, -2]), cardSpringConfig); // Reduced tilt for big tables
  const rotateY = useSpring(useTransform(smoothMouseX, [-50, 50], [-2, 2]), cardSpringConfig);
  const [isHovered, setIsHovered] = useState(false);
  const [glarePosition, setGlarePosition] = useState({ x: 0, y: 0 });

  // 1. Fetch Courses on Mount
  useEffect(() => {
    setMounted(true);
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`);
        if (response.ok) {
          const data = await response.json();
          setCourses(Array.isArray(data) ? data : (data.data || []));
        }
      } catch (error) {
        console.error("Failed to load courses");
      }
    };
    fetchCourses();

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

  // 2. Fetch Real Students when a Course is Selected!
  useEffect(() => {
    const fetchEnrolledStudents = async () => {
      if (!selectedCourse) {
        setStudents([]); 
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments/course/${selectedCourse}/students`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setStudents(data);
          setAttendanceData({}); 
        }
      } catch (error) {
        console.error("Failed to load students", error);
      } finally {
        setTimeout(() => setLoading(false), 500); // Cinematic UI delay
      }
    };

    fetchEnrolledStudents();
  }, [selectedCourse]); 

  // Handle individual status toggle
  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Submit all attendance records to backend
  const handleSaveAttendance = async () => {
    if (!selectedCourse) {
      setMessage({ type: "error", text: "Please select a course first." });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });
    const token = localStorage.getItem("token");

    try {
      let successCount = 0;
      let failCount = 0;
      let lastErrorMessage = "";

      for (const student of students) {
        const status = attendanceData[student._id];
        if (!status) continue; 

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            courseId: selectedCourse,
            studentId: student._id,
            date: date,
            status: status
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          failCount++;
          lastErrorMessage = errorData.message || `Failed to save for ${student.name}`;
        } else {
          successCount++;
        }
      }

      if (failCount > 0) {
        if (lastErrorMessage.includes('authorize') || lastErrorMessage.toLowerCase().includes('forbidden')) {
             setMessage({ type: "error", text: "Access Denied: Only Ustad or Admin can mark attendance." });
        } else {
             setMessage({ type: "error", text: `Saved ${successCount}, but failed for ${failCount} students. Error: ${lastErrorMessage}` });
        }
      } else if (successCount > 0) {
        setMessage({ type: "success", text: "Attendance locked and synced successfully! ✨" });
        setTimeout(() => setMessage({ type: "", text: "" }), 4000);
      } else {
        setMessage({ type: "error", text: "No attendance status selected. Please mark at least one student." });
      }

    } catch (error) {
      console.error("Network Error:", error);
      setMessage({ type: "error", text: "System Error: Failed to connect to secure server." });
    } finally {
      setLoading(false);
    }
  };

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
      <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-[pulse_10s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-[10%] left-[10%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[140px] pointer-events-none mix-blend-screen animate-[pulse_15s_ease-in-out_infinite_reverse]"></div>

      <div className="max-w-5xl w-full mx-auto relative z-10 py-12">
        
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.02] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)] mb-6 backdrop-blur-xl">
            <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_10px_rgba(129,140,248,1)]"></span>
            <span className="text-[11px] font-black text-slate-300 tracking-[0.3em] uppercase">Teacher Module</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 drop-shadow-md">Class Attendance</h2>
          <p className="text-slate-400 font-light text-[17px] mix-blend-screen max-w-xl">Digitally manage your students' daily presence, absences, and overall engagement.</p>
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

        {/* Filters / Selectors */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-[#030612]/70 backdrop-blur-[40px] border border-white/[0.06] rounded-[2rem] p-8 mb-8 flex flex-col md:flex-row gap-8 shadow-[0_32px_64px_-20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)]"
        >
          <div className="flex-1">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Select Target Course</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <svg className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <select 
                value={selectedCourse} 
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="relative w-full pl-12 pr-10 py-4 appearance-none bg-[#010206]/80 backdrop-blur-md border border-white/[0.06] rounded-[1.25rem] focus:bg-[#020510] focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all duration-300 text-slate-200 cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] font-bold z-10"
              >
                <option value="" className="bg-[#040814] text-slate-500">-- Choose a Course --</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id} className="bg-[#040814]">{course.title}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none z-20">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Attendance Date</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <svg className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="relative w-full pl-12 pr-4 py-4 bg-[#010206]/80 backdrop-blur-md border border-white/[0.06] rounded-[1.25rem] focus:bg-[#020510] focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all duration-300 text-slate-200 cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] font-bold z-10"
              />
            </div>
          </div>
        </motion.div>

        {/* Data Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
          ref={cardRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative bg-[#030612]/70 backdrop-blur-[40px] backdrop-saturate-[150%] border border-white/[0.06] rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.5)] transition-colors duration-700 hover:border-white/[0.12] will-change-transform overflow-hidden"
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
            
            <div className="p-8 border-b border-white/[0.04] flex justify-between items-center bg-[#010206]/50">
              <h3 className="text-xl font-black text-white flex items-center gap-4 tracking-tighter drop-shadow-md">
                <div className="w-10 h-10 rounded-[0.8rem] bg-[#040814] border border-white/[0.08] flex items-center justify-center text-indigo-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                Student Roster
              </h3>
              <span className="text-[12px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                  {students.length} Enrolled
              </span>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-12 h-12 border-4 border-slate-800/80 border-t-indigo-400 rounded-full animate-spin mb-6 shadow-[0_0_20px_rgba(129,140,248,0.5)] z-10"></div>
                    <p className="text-indigo-400 font-bold tracking-[0.2em] uppercase text-[11px] z-10">Syncing Roster...</p>
                </div>
              ) : students.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                  <svg className="w-16 h-16 mb-6 text-slate-700 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  <p className="text-slate-400 text-lg font-light">
                    {selectedCourse ? "No students are currently enrolled in this course." : "Please select a course to initialize the roster."}
                  </p>
                </div>
              ) : (
                students.map((student) => (
                  <div key={student._id} className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-white/[0.02] transition-colors duration-300 group">
                    
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-full bg-[#010206] border border-white/[0.08] flex items-center justify-center text-slate-300 font-black uppercase text-xl shrink-0 shadow-inner group-hover:border-indigo-500/50 group-hover:text-indigo-400 transition-colors duration-300">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-[16px] text-white tracking-tight">{student.name}</p>
                        <p className="text-[12px] font-bold text-slate-500 tracking-wide mt-1">{student.email}</p>
                      </div>
                    </div>

                    <div className="flex bg-[#010206] rounded-[1rem] border border-white/[0.06] p-1.5 shadow-inner">
                      <button 
                        onClick={() => handleStatusChange(student._id, 'Present')}
                        className={`px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all duration-300 ${
                            attendanceData[student._id] === 'Present' 
                                ? 'bg-emerald-500 text-[#010206] shadow-[0_0_15px_rgba(52,211,153,0.5)]' 
                                : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                      >
                        Present
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student._id, 'Late')}
                        className={`px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all duration-300 ${
                            attendanceData[student._id] === 'Late' 
                                ? 'bg-amber-500 text-[#010206] shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
                                : 'text-slate-500 hover:text-amber-400 hover:bg-amber-500/10'
                        }`}
                      >
                        Late
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student._id, 'Absent')}
                        className={`px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all duration-300 ${
                            attendanceData[student._id] === 'Absent' 
                                ? 'bg-red-500 text-[#010206] shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                                : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
                        }`}
                      >
                        Absent
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>

            <div className="p-8 border-t border-white/[0.04] bg-[#010206]/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-end gap-6 relative z-20">
              <button 
                onClick={handleSaveAttendance}
                disabled={loading || !selectedCourse || students.length === 0}
                className="group relative w-full sm:w-auto px-10 py-5 bg-gradient-to-b from-indigo-400 to-blue-600 text-[#010206] text-[14px] font-black uppercase tracking-widest rounded-full transition-all duration-500 shadow-[0_0_30px_-5px_rgba(99,102,241,0.6),inset_0_1px_1px_rgba(255,255,255,0.8)] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-3 overflow-hidden ring-1 ring-white/20 active:scale-95"
              >
                {!loading && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>}
                <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                        <>
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Syncing Data...
                        </>
                    ) : (
                        <>
                            Save Attendance
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        </>
                    )}
                </span>
              </button>
            </div>

          </div>
        </motion.div>

      </div>
      
      {/* Global CSS for Animations */}
      <style dangerouslySetInnerHTML={{ __html: globalAnimations }} />
    </div>
  );
}