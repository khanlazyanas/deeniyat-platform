"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Submission {
  _id: string;
  content: string;
  createdAt: string;
  courseId?: {
    title: string;
  };
  lessonId?: {
    title: string;
  };
  studentId?: {
    name: string;
    email: string;
  };
  status?: string;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication required");

        // Backend se saari submissions fetch kar rahe hain
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submissions`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch submissions");
        }

        setSubmissions(Array.isArray(data) ? data : (data.data || []));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  if (loading) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative">
      <div className="w-12 h-12 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(52,211,153,0.4)]"></div>
      <p className="text-emerald-500 font-medium tracking-wide">Loading student assignments...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="bg-red-950/30 border border-red-500/30 p-8 rounded-2xl backdrop-blur-md text-center max-w-lg">
        <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <h3 className="text-xl font-bold text-red-400 mb-2">Failed to load</h3>
        <p className="text-red-300/80">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-[85vh] p-4 md:p-8 relative overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-emerald-500/30 mb-4 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-emerald-300 tracking-wider uppercase">Teacher Portal</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">Student Submissions</h2>
            <p className="text-slate-400 font-light">Review and grade assignments submitted by your students.</p>
          </div>
          
          <div className="bg-slate-900/60 border border-slate-800 px-6 py-3 rounded-xl flex items-center gap-4">
            <div className="text-center">
              <span className="block text-2xl font-bold text-emerald-400">{submissions.length}</span>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total</span>
            </div>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="bg-slate-900/50 backdrop-blur-xl p-12 text-center rounded-[2rem] border border-slate-800 shadow-2xl">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-500">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No submissions yet</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">Looks like your students are still working on their assignments. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {submissions.map((sub) => (
              <div key={sub._id} className="group bg-slate-900/40 backdrop-blur-md rounded-[1.5rem] border border-slate-800 overflow-hidden hover:border-emerald-500/30 transition-all duration-300 hover:shadow-[0_10px_30px_-10px_rgba(52,211,153,0.15)] flex flex-col">
                
                {/* Header Info */}
                <div className="p-5 border-b border-slate-800/50 bg-slate-900/60 flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-emerald-400 mb-1">{sub.courseId?.title || "Unknown Course"}</h4>
                    <p className="text-lg font-semibold text-white leading-tight">{sub.lessonId?.title || "Unknown Lesson"}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-semibold">
                      {sub.status || "Pending Review"}
                    </span>
                    <p className="text-xs text-slate-500 mt-2">{new Date(sub.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 flex-grow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-300">
                      {sub.studentId?.name ? sub.studentId.name.charAt(0).toUpperCase() : "S"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-300">{sub.studentId?.name || "Anonymous Student"}</p>
                      <p className="text-xs text-slate-500">{sub.studentId?.email || "No email provided"}</p>
                    </div>
                  </div>
                  
                  <div className="bg-[#020617] rounded-xl p-4 border border-slate-800">
                    <p className="text-sm text-slate-400 font-medium mb-2 uppercase tracking-wider">Submitted Work:</p>
                    <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {sub.content}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-slate-800/50 bg-slate-900/40 flex justify-end gap-3">
                  <button className="px-4 py-2 rounded-lg text-sm font-semibold text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 transition-colors">
                    Mark as Graded ✓
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}