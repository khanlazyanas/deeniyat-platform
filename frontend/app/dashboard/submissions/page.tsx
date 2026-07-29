"use client";

import { useEffect, useState } from "react";

interface Submission {
  _id: string;
  audioFileUrl: string;
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
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Pending' | 'Graded'>('Pending');
  
  // Grading State
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState("A");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

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
        setMessage({ type: "success", text: "Assignment graded successfully! ✨" });
        setGradingId(null);
        setGradeInput("A");
        setFeedbackInput("");
        fetchSubmissions(); // Refresh the list
      } else {
        setMessage({ type: "error", text: "Failed to save grade." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error." });
    } finally {
      setSubmitLoading(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const filteredSubmissions = submissions.filter(sub => sub.status === activeTab);

  return (
    <div className="min-h-[85vh] p-4 md:p-8 relative overflow-hidden bg-[#020617]">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-emerald-500/30 mb-4 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-emerald-300 tracking-wider uppercase">Grading Portal</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">Student Submissions</h2>
            <p className="text-slate-400 font-light">Listen to audio recitations and provide feedback to your students.</p>
          </div>

          {/* Custom Tabs */}
          <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl inline-flex w-fit">
            <button 
              onClick={() => setActiveTab('Pending')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'Pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              Pending ({submissions.filter(s => s.status === 'Pending').length})
            </button>
            <button 
              onClick={() => setActiveTab('Graded')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'Graded' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              Graded ({submissions.filter(s => s.status === 'Graded').length})
            </button>
          </div>
        </div>

        {/* Global Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium border ${message.type === 'success' ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
            {message.text}
          </div>
        )}

        {/* Submissions List */}
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center shadow-xl">
            <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No {activeTab} Submissions</h3>
            <p className="text-slate-500">You're all caught up for now!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredSubmissions.map((sub) => (
              <div key={sub._id} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 transition-all hover:border-slate-700 shadow-xl">
                
                {/* Top Row: User & Lesson Info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold uppercase text-lg shrink-0">
                      {sub.studentId?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg">{sub.studentId?.name || 'Unknown Student'}</h4>
                      <p className="text-slate-400 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        {sub.lessonId?.title || 'Unknown Lesson'}
                      </p>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">Submitted on</span>
                    <span className="text-sm text-slate-300 bg-slate-900 px-3 py-1 rounded-md border border-slate-800">
                      {new Date(sub.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Middle Row: Audio Player */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                    Audio Recording
                  </p>
                  <audio controls className="w-full h-12 rounded-lg bg-slate-900 border border-slate-800 focus:outline-none custom-audio-player">
                    <source src={sub.audioFileUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>

                {/* Bottom Row: Grading Action or Result */}
                {sub.status === 'Graded' ? (
                  <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5 flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="shrink-0 text-center bg-slate-900 border border-emerald-500/30 p-3 rounded-xl min-w-[80px]">
                      <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Grade</span>
                      <span className="block text-3xl font-black text-emerald-400 leading-none">{sub.grade}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-emerald-500 uppercase mb-1">Ustad's Feedback</span>
                      <p className="text-slate-300 text-sm leading-relaxed">{sub.feedback || "No feedback provided."}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {gradingId === sub._id ? (
                      <div className="bg-slate-900/50 border border-amber-500/30 rounded-xl p-5 animate-in fade-in slide-in-from-top-4">
                        <h5 className="text-amber-400 font-semibold mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          Evaluate Submission
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Grade</label>
                            <select 
                              value={gradeInput}
                              onChange={(e) => setGradeInput(e.target.value)}
                              className="w-full bg-[#020617] border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                            >
                              <option value="A+">A+ (Excellent)</option>
                              <option value="A">A (Very Good)</option>
                              <option value="B">B (Good)</option>
                              <option value="C">C (Needs Improvement)</option>
                              <option value="Needs Revision">Needs Revision</option>
                            </select>
                          </div>
                          <div className="md:col-span-3">
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Feedback (Optional)</label>
                            <input 
                              type="text"
                              placeholder="e.g., MashaAllah, your makhraj is perfect."
                              value={feedbackInput}
                              onChange={(e) => setFeedbackInput(e.target.value)}
                              className="w-full bg-[#020617] border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => setGradingId(null)}
                            className="px-5 py-2 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleGradeSubmit(sub._id)}
                            disabled={submitLoading}
                            className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center gap-2"
                          >
                            {submitLoading ? "Saving..." : "Save Grade & Feedback"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setGradingId(sub._id)}
                        className="w-full md:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/50 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Evaluate & Grade
                      </button>
                    )}
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