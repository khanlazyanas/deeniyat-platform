"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate, Variants } from "framer-motion";

interface Course {
  _id: string;
  title: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
}

// --- GLOBAL STYLES (Ultra Smooth & Safe) ---
const globalAnimations = `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.08); border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }

  /* Webkit Date Picker Styling for Dark Mode */
  ::-webkit-calendar-picker-indicator {
      filter: invert(1);
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.3s ease;
  }
  ::-webkit-calendar-picker-indicator:hover {
      opacity: 1;
  }
`;

// --- Framer Motion Variants ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 100, damping: 20, mass: 1 } 
  }
};

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
  const glareX = useMotionValue(0);
  const glareY = useMotionValue(0);
  const isHovered = useMotionValue(0);

  const backgroundTemplate = useMotionTemplate`radial-gradient(800px circle at ${glareX}px ${glareY}px, rgba(16, 185, 129, 0.08), transparent 40%)`;
  const cardRef = useRef<HTMLDivElement>(null);

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
  }, []);

  const handleMouseMoveCard = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768 || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    glareX.set(e.clientX - rect.left);
    glareY.set(e.clientY - rect.top);
  };

  // 2. Fetch Real Students using YOUR Enrollment Route
  useEffect(() => {
    const fetchEnrolledStudents = async () => {
      if (!selectedCourse) {
        setStudents([]); 
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        // 👇 PERFECT API CALL: Tumhara banaya hua Enrollment Route
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
        setTimeout(() => setLoading(false), 500);
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

        // Tumhari Original Attendance API call
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
    <div className="min-h-screen pt-24 sm:pt-32 pb-12 bg-[#000000] text-slate-50 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden relative">

      {/* GLOBAL BACKGROUND */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:80px_80px] pointer-events-none"></div>

      {/* Ambient Background Glows */}
      <div className="absolute top-[15%] right-[10%] w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen hidden sm:block"></div>

      <div className="max-w-5xl w-full mx-auto relative z-10 py-12 px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="mb-12 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] mb-6 backdrop-blur-md">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
            <span className="text-[10px] sm:text-[11px] font-black text-slate-300 tracking-[0.2em] sm:tracking-[0.3em] uppercase">Teacher Module</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 drop-shadow-md">Roster & Attendance</h2>
          <p className="text-slate-400 font-light text-[15px] sm:text-[17px] max-w-xl mx-auto sm:mx-0">Digitally manage your students' daily presence, absences, and overall engagement.</p>
        </motion.div>

        {/* Global Message Alert */}
        <AnimatePresence>
            {message.text && (
            <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`mb-8 p-4 rounded-[1rem] text-[13px] font-bold tracking-wide border flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[inset_0_1px_1px_rgba(52,211,153,0.2)]' : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[inset_0_1px_1px_rgba(239,68,68,0.2)]'}`}
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
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#03050a] backdrop-blur-xl border border-white/[0.04] rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 mb-8 flex flex-col md:flex-row gap-6 sm:gap-8 shadow-xl"
        >
          <div className="flex-1">
            <label className="block text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Select Target Course</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <svg className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <select 
                value={selectedCourse} 
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="relative w-full pl-12 pr-10 py-4 appearance-none bg-[#010206] border border-white/[0.06] rounded-[1rem] focus:bg-[#030612] focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all duration-300 text-slate-200 cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] font-bold z-10 text-sm sm:text-base"
              >
                <option value="" className="bg-[#040814] text-slate-500">-- Choose a Course --</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id} className="bg-[#040814]">{course.title}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none z-20">
                <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Attendance Date</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <svg className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="relative w-full pl-12 pr-4 py-4 bg-[#010206] border border-white/[0.06] rounded-[1rem] focus:bg-[#030612] focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all duration-300 text-slate-200 cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] font-bold z-10 text-sm sm:text-base"
              />
            </div>
          </div>
        </motion.div>

        {/* Data Container (Flat Premium Glassmorphism) */}
        <motion.div 
          initial="hidden" animate="visible" variants={fadeInUp}
          ref={cardRef}
          onMouseMove={handleMouseMoveCard}
          onMouseEnter={() => { if (window.innerWidth >= 768) isHovered.set(1); }}
          onMouseLeave={() => isHovered.set(0)}
          className="relative bg-[#03050a] border border-white/[0.04] rounded-[2rem] shadow-2xl transition-colors duration-500 hover:border-white/[0.08] overflow-hidden"
        >
          {/* Dynamic Glare Effect */}
          <motion.div
            className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0 mix-blend-color-dodge rounded-[2rem]"
            style={{ opacity: isHovered, background: backgroundTemplate }}
          />

          <div className="relative z-10 w-full h-full">

            <div className="p-6 sm:p-8 border-b border-white/[0.04] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 bg-white/[0.01]">
              <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-3 sm:gap-4 tracking-tighter drop-shadow-md">
                <div className="w-10 h-10 rounded-[0.8rem] bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-emerald-400 shadow-inner">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                Student Roster
              </h3>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full shadow-inner">
                  {students.length} Enrolled
              </span>
            </div>

            <div className="divide-y divide-white/[0.03] max-h-[500px] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-12 h-12 border-4 border-slate-800/50 border-t-emerald-400 rounded-full animate-spin mb-6 z-10"></div>
                    <p className="text-emerald-400 font-bold tracking-[0.2em] uppercase text-[11px] z-10">Syncing Roster...</p>
                </div>
              ) : students.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                  <div className="w-20 h-20 bg-white/[0.02] border border-white/[0.04] rounded-2xl flex items-center justify-center mb-6 shadow-inner text-slate-600">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  </div>
                  <p className="text-slate-400 text-lg font-light max-w-md">
                    {selectedCourse ? "No students are currently enrolled in this course." : "Please select a course to initialize the roster."}
                  </p>
                </div>
              ) : (
                students.map((student) => (
                  <div key={student._id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.01] transition-colors duration-300 group">

                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-full bg-[#010206] border border-white/[0.05] flex items-center justify-center text-slate-400 font-black uppercase text-xl shrink-0 shadow-inner group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-colors duration-300">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-[16px] text-slate-200 tracking-tight">{student.name}</p>
                        <p className="text-[12px] font-bold text-slate-500 tracking-wider mt-1">{student.email}</p>
                      </div>
                    </div>

                    {/* Premium Status Toggles */}
                    <div className="flex bg-[#010206] rounded-[1rem] border border-white/[0.05] p-1.5 shadow-inner">
                      <button 
                        onClick={() => handleStatusChange(student._id, 'Present')}
                        className={`px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${
                            attendanceData[student._id] === 'Present' 
                                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.1)]' 
                                : 'text-slate-500 hover:text-emerald-400 hover:bg-white/[0.02] border border-transparent'
                        }`}
                      >
                        Present
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student._id, 'Late')}
                        className={`px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${
                            attendanceData[student._id] === 'Late' 
                                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                                : 'text-slate-500 hover:text-amber-400 hover:bg-white/[0.02] border border-transparent'
                        }`}
                      >
                        Late
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student._id, 'Absent')}
                        className={`px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${
                            attendanceData[student._id] === 'Absent' 
                                ? 'bg-red-500/20 border border-red-500/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                                : 'text-slate-500 hover:text-red-400 hover:bg-white/[0.02] border border-transparent'
                        }`}
                      >
                        Absent
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>

            <div className="p-6 sm:p-8 border-t border-white/[0.04] bg-white/[0.01] flex flex-col sm:flex-row items-center justify-end relative z-20">
              {/* 👇 FIXED LOGIC: Button is disabled if NO STUDENTS are loaded */}
              <button 
                onClick={handleSaveAttendance}
                disabled={loading || !selectedCourse || students.length === 0}
                className="group relative w-full sm:w-auto px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-[#010206] text-[13px] font-black uppercase tracking-widest rounded-full transition-colors duration-300 shadow-[0_0_25px_rgba(52,211,153,0.3)] disabled:opacity-30 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-95"
              >
                <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                        <>
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Syncing...
                        </>
                    ) : (
                        <>
                            Save Attendance
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </>
                    )}
                </span>
              </button>
            </div>

          </div>
        </motion.div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: globalAnimations }} />
    </div>
  );
}