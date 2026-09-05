"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Note {
  lessonId: {
    _id: string;
    title: string;
    order?: number;
  };
  personalNote: string;
}

interface CourseNotes {
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
  };
  notes: Note[];
}

const globalAnimations = `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }
`;

export default function MyNotesPage() {
  const router = useRouter();
  const [allNotes, setAllNotes] = useState<CourseNotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyNotes = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments/my-notes`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error("Failed to load your notebook");
        
        const data = await response.json();
        setAllNotes(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyNotes();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-full bg-[#010206] flex flex-col items-center justify-center relative overflow-hidden pt-32 pb-20">
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse"></div>
        <div className="w-16 h-16 border-4 border-slate-800/80 border-t-amber-400 rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(245,158,11,0.5)] z-10"></div>
        <p className="text-amber-400 font-bold tracking-[0.2em] uppercase text-sm z-10">Loading Notebook...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#010206] relative overflow-hidden font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay pointer-events-none z-0"></div>
      
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none mix-blend-screen animate-[pulse_12s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-0 left-[-10%] w-[40vw] h-[40vw] bg-purple-800/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      <div className="max-w-6xl mx-auto px-6 py-12 lg:py-20 relative z-20">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black tracking-widest uppercase mb-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Personal Workspace
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-4 drop-shadow-lg">My Notebook</h1>
          <p className="text-slate-400 text-lg font-light max-w-2xl">Access all your saved lecture notes in one place. Click on any note to resume studying that specific course.</p>
        </motion.div>

        {/* Notes Content */}
        {error ? (
          <div className="bg-[#030612]/80 border border-red-500/30 p-10 rounded-[2rem] text-center shadow-lg backdrop-blur-md">
            <p className="text-red-400 text-lg">{error}</p>
          </div>
        ) : allNotes.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#030612]/60 backdrop-blur-2xl border border-white/[0.05] p-16 rounded-[2.5rem] text-center shadow-lg">
            <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700/50">
              <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </div>
            <h3 className="text-2xl font-black text-white mb-3">No Notes Found</h3>
            <p className="text-slate-400 text-base max-w-md mx-auto mb-8">You haven't written any notes yet. Start taking notes while watching lectures to see them here.</p>
            <button onClick={() => router.push('/dashboard/my-courses')} className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-[#010206] font-black uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(245,158,11,0.4)]">Go to My Courses</button>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {allNotes.map((courseData, courseIndex) => (
              <motion.div 
                key={courseData.course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: courseIndex * 0.1 }}
                className="bg-[#030612]/60 backdrop-blur-2xl border border-white/[0.05] rounded-[2rem] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] group"
              >
                {/* Course Header */}
                <div className="px-8 py-6 border-b border-white/[0.05] bg-gradient-to-r from-white/[0.02] to-transparent flex items-center justify-between">
                  <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                    <div className="w-2 h-8 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                    {courseData.course.title}
                  </h2>
                  <button onClick={() => router.push(`/dashboard/my-courses/${courseData.course._id}`)} className="text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors uppercase tracking-widest flex items-center gap-2">
                    Open Course <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
                </div>

                {/* Notes Grid */}
                <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {courseData.notes.map((note, noteIndex) => (
                    <div 
                      key={noteIndex}
                      onClick={() => router.push(`/dashboard/my-courses/${courseData.course._id}`)}
                      className="bg-[#010206]/80 p-6 rounded-[1.5rem] border border-white/[0.04] hover:border-amber-500/30 transition-all duration-300 cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] hover:shadow-[0_10px_30px_rgba(245,158,11,0.05)] relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-[40px] pointer-events-none"></div>
                      
                      <div className="flex items-center gap-3 mb-4">
                        <div className="px-3 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-amber-500/20">
                          Ch {note.lessonId.order || '-'}
                        </div>
                        <h4 className="text-slate-200 font-bold text-sm truncate">{note.lessonId.title}</h4>
                      </div>

                      <p className="text-slate-400 text-sm leading-relaxed font-medium line-clamp-4 whitespace-pre-wrap">
                        {note.personalNote}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: globalAnimations }} />
    </div>
  );
}