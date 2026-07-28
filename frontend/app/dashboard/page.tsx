"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardOverview() {
  const [userName, setUserName] = useState("Scholar"); // Default name

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    
    // Check karein ki storedUser null na ho aur string "undefined" bhi na ho
    if (storedUser && storedUser !== "undefined") {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.name) {
          setUserName(user.name); // User ka asli naam state mein daal do
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
  }, []);

  return (
    <div className="p-6 md:p-10 relative overflow-hidden min-h-full">
      {/* Ambient Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2 capitalize">
            Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">{userName}!</span> ✨
          </h1>
          <p className="text-slate-400 font-light">Here is a quick overview of your learning journey and activities.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          <div className="group bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-3xl flex flex-col hover:border-emerald-500/40 transition-all duration-300 hover:shadow-[0_10px_30px_-10px_rgba(52,211,153,0.15)] hover:-translate-y-1">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              Enrolled Courses
            </span>
            <span className="text-5xl font-black text-white group-hover:text-emerald-400 transition-colors">2</span>
          </div>

          <div className="group bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-3xl flex flex-col hover:border-amber-500/40 transition-all duration-300 hover:shadow-[0_10px_30px_-10px_rgba(245,158,11,0.15)] hover:-translate-y-1">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Pending Assignments
            </span>
            <span className="text-5xl font-black text-white group-hover:text-amber-400 transition-colors">1</span>
          </div>

          <div className="group bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-3xl flex flex-col hover:border-teal-500/40 transition-all duration-300 hover:shadow-[0_10px_30px_-10px_rgba(20,184,166,0.15)] hover:-translate-y-1">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Attendance Rate
            </span>
            <span className="text-5xl font-black text-white group-hover:text-teal-400 transition-colors">95<span className="text-2xl text-slate-500">%</span></span>
          </div>

        </div>

        {/* Recent Activity Section */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Recent Activity
          </h3>
          
          <div className="space-y-4">
            
            {/* Activity Item 1 */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-900/50 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <p className="text-slate-200 font-semibold mb-0.5">Submitted Tajweed Audio</p>
                  <p className="text-sm text-slate-500">Lesson 3: Haroof-e-Maddah</p>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 whitespace-nowrap self-start md:self-auto">
                2 hours ago
              </span>
            </div>

            {/* Activity Item 2 */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center shrink-0 border border-blue-500/20">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p className="text-slate-200 font-semibold mb-0.5">Attended Live Class</p>
                  <p className="text-sm text-slate-500">Noorani Qaida Basics</p>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 whitespace-nowrap self-start md:self-auto">
                Yesterday
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}