"use client";

import { useEffect, useState } from "react";

interface Submission {
  _id: string;
  audioFileUrl: string;
  grade: string;
  feedback: string;
  status: 'Pending' | 'Graded';
  createdAt: string;
  lessonId: {
    _id: string;
    title: string;
  };
}

export default function MyGradesPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMySubmissions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submissions/my-submissions`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setSubmissions(data);
        }
      } catch (error) {
        console.error("Failed to fetch submissions", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMySubmissions();
  }, []);

  return (
    <div className="min-h-[85vh] p-4 md:p-8 relative overflow-hidden bg-[#020617]">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-emerald-500/30 mb-4 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-300 tracking-wider uppercase">Student Portal</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">My Grades & Feedback</h2>
          <p className="text-slate-400 font-light">Track your progress and read Ustad's feedback on your recitations.</p>
        </div>

        {/* Submissions List */}
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center shadow-xl">
            <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No Submissions Yet</h3>
            <p className="text-slate-500">You haven't submitted any assignments. Go to 'Submit Assignment' to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {submissions.map((sub) => (
              <div key={sub._id} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 transition-all hover:border-slate-700 shadow-xl">
                
                {/* Header Information */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800/50">
                  <div>
                    <h4 className="text-white font-bold text-lg flex items-center gap-2">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                      {sub.lessonId?.title || 'Unknown Lesson'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-2 font-medium uppercase tracking-wider block">
                      Submitted on: {new Date(sub.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    {sub.status === 'Graded' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-sm font-semibold">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        Graded
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-sm font-semibold">
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Pending Review
                      </span>
                    )}
                  </div>
                </div>

                {/* Audio Playback */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                    Your Recording
                  </p>
                  <audio controls className="w-full h-12 rounded-lg bg-slate-900 border border-slate-800 focus:outline-none custom-audio-player">
                    <source src={sub.audioFileUrl} type="audio/mpeg" />
                  </audio>
                </div>

                {/* Grade and Feedback Section */}
                {sub.status === 'Graded' && (
                  <div className="bg-[#020617] border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden">
                    {/* Decorative glow */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
                    
                    <div className="shrink-0 text-center bg-slate-900 border border-emerald-500/30 p-3 rounded-xl min-w-[80px] z-10">
                      <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Grade</span>
                      <span className="block text-3xl font-black text-emerald-400 leading-none">{sub.grade}</span>
                    </div>
                    <div className="z-10">
                      <span className="block text-xs font-bold text-emerald-500 uppercase mb-1">Ustad's Feedback</span>
                      <p className="text-slate-300 text-sm leading-relaxed">{sub.feedback || "Good job! No additional feedback provided."}</p>
                    </div>
                  </div>
                )}
                
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}