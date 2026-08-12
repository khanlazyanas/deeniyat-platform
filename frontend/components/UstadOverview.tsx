"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useAuth } from "../context/AuthContext";

// --- Holographic Spatial Card (Ustad Theme) ---
function TeacherCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 40, stiffness: 250, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), springConfig);
  const [isHovered, setIsHovered] = useState(false);
  const [glarePosition, setGlarePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    setGlarePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); mouseX.set(0); mouseY.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative overflow-hidden rounded-[2.5rem] bg-[#030612]/80 backdrop-blur-[40px] backdrop-saturate-[150%] border border-blue-500/[0.15] shadow-[0_32px_64px_-20px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.1)] transition-colors duration-700 hover:border-blue-400/[0.25] will-change-transform ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 z-0 mix-blend-color-dodge"
        style={{ opacity: isHovered ? 1 : 0, background: `radial-gradient(800px circle at ${glarePosition.x}px ${glarePosition.y}px, rgba(96,165,250,0.15), transparent 40%)` }}
      />
      <div className="relative z-10 w-full h-full transform-gpu" style={{ transform: "translateZ(20px)" }}>
        {children}
      </div>
    </motion.div>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeProgress * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);
  return <span>{displayValue}</span>;
}

export default function UstadOverview() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Dummy stats API call simulation
  const [stats, setStats] = useState({ totalStudents: 0, activeCourses: 0, pendingSubmissions: 0 });

  useEffect(() => {
    // Backend API banne ke baad hum yahan real fetch lagayenge
    setTimeout(() => {
      setStats({ totalStudents: 124, activeCourses: 3, pendingSubmissions: 18 });
      setLoading(false);
    }, 1000);
  }, []);

  const firstName = user?.name?.split(" ")[0] || "Ustad";

  return (
    <div className="space-y-10">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-2">
            Welcome, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.3)]">{firstName}</span>.
          </h1>
          <p className="text-slate-400 text-lg font-medium">Your teaching command center is online.</p>
        </div>
        
        {/* Quick Create Action */}
        <Link href="/dashboard/create-course" className="group flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-[13px] shadow-[0_0_40px_rgba(37,99,235,0.4),inset_0_2px_4px_rgba(255,255,255,0.2)] transition-all active:scale-95">
          <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          Create Course
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <TeacherCard className="p-8 group">
          <div className="flex items-start justify-between mb-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <Link href="/dashboard/attendance" className="text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-blue-400">View All →</Link>
          </div>
          <p className="text-slate-400 text-[12px] font-black uppercase tracking-[0.2em] mb-2">Total Students</p>
          <div className="text-6xl font-black text-white tracking-tighter">
            {loading ? <span className="animate-pulse text-slate-700">--</span> : <AnimatedNumber value={stats.totalStudents} />}
          </div>
        </TeacherCard>

        <TeacherCard className="p-8 group">
          <div className="flex items-start justify-between mb-8">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(99,102,241,0.2)]">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <Link href="/dashboard/add-lesson" className="text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-400">Manage →</Link>
          </div>
          <p className="text-slate-400 text-[12px] font-black uppercase tracking-[0.2em] mb-2">Active Courses</p>
          <div className="text-6xl font-black text-white tracking-tighter">
            {loading ? <span className="animate-pulse text-slate-700">--</span> : <AnimatedNumber value={stats.activeCourses} />}
          </div>
        </TeacherCard>

        <TeacherCard className="p-8 group">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent pointer-events-none" />
          <div className="flex items-start justify-between mb-8 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <Link href="/dashboard/submissions" className="text-[11px] font-bold uppercase tracking-widest text-amber-500/70 hover:text-amber-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> Reviews →
            </Link>
          </div>
          <p className="text-slate-400 text-[12px] font-black uppercase tracking-[0.2em] mb-2 relative z-10">Pending Submissions</p>
          <div className="text-6xl font-black text-white tracking-tighter relative z-10">
            {loading ? <span className="animate-pulse text-slate-700">--</span> : <AnimatedNumber value={stats.pendingSubmissions} />}
          </div>
        </TeacherCard>
      </div>

      {/* Control Center Links */}
      <TeacherCard className="p-10">
        <h3 className="text-2xl font-black text-white mb-8 border-b border-white/[0.05] pb-4">Command Center</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/dashboard/create-course" className="p-6 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.05] hover:bg-blue-500/10 hover:border-blue-500/30 transition-all flex flex-col gap-4 group">
             <div className="w-10 h-10 rounded-full bg-[#030612] flex items-center justify-center text-slate-400 group-hover:text-blue-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg></div>
             <span className="font-bold text-slate-200">New Course</span>
          </Link>
          <Link href="/dashboard/add-lesson" className="p-6 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.05] hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all flex flex-col gap-4 group">
             <div className="w-10 h-10 rounded-full bg-[#030612] flex items-center justify-center text-slate-400 group-hover:text-indigo-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></div>
             <span className="font-bold text-slate-200">Add Lesson</span>
          </Link>
          <Link href="/dashboard/submissions" className="p-6 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.05] hover:bg-amber-500/10 hover:border-amber-500/30 transition-all flex flex-col gap-4 group">
             <div className="w-10 h-10 rounded-full bg-[#030612] flex items-center justify-center text-slate-400 group-hover:text-amber-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg></div>
             <span className="font-bold text-slate-200">Submissions</span>
          </Link>
          <Link href="/dashboard/attendance" className="p-6 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.05] hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all flex flex-col gap-4 group">
             <div className="w-10 h-10 rounded-full bg-[#030612] flex items-center justify-center text-slate-400 group-hover:text-emerald-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg></div>
             <span className="font-bold text-slate-200">Attendance</span>
          </Link>
        </div>
      </TeacherCard>

    </div>
  );
}