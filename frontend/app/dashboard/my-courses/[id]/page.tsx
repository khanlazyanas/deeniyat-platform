"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Lesson {
  _id: string;
  title: string;
  content: string;
  videoUrl?: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
}

export default function CoursePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id;

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Assignment Submission States
  const [assignmentContent, setAssignmentContent] = useState("");
  const [submittingTask, setSubmittingTask] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!courseId) return;

    const fetchCourseAndLessons = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication required");

        // Fetch Course Details
        const courseRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`);
        const courseData = await courseRes.json();
        if (!courseRes.ok) throw new Error(courseData.message || "Failed to load course");
        setCourse(courseData);

        // Fetch Lessons for this course
        const lessonsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lessons?courseId=${courseId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const lessonsData = await lessonsRes.json();
        
        if (lessonsRes.ok) {
          const fetchedLessons = Array.isArray(lessonsData) ? lessonsData : (lessonsData.data || []);
          setLessons(fetchedLessons);
          if (fetchedLessons.length > 0) {
            setActiveLesson(fetchedLessons[0]); // Auto-select the first lesson
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndLessons();
  }, [courseId]);

  // Helper function to extract YouTube embed URL
  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  // Handle Assignment Submission
  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentContent.trim()) return;

    setSubmittingTask(true);
    setSubmissionMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const payload = {
        courseId: courseId,
        lessonId: activeLesson?._id,
        content: assignmentContent
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit assignment");
      }

      setSubmissionMessage({ type: "success", text: "Assignment submitted successfully! Ustad will review it soon." });
      setAssignmentContent(""); // Clear the input field after success
      
    } catch (err: any) {
      setSubmissionMessage({ type: "error", text: err.message });
    } finally {
      setSubmittingTask(false);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSubmissionMessage({ type: "", text: "" }), 5000);
    }
  };

  // Loading State
  if (loading) return <div className="min-h-[85vh] flex items-center justify-center text-emerald-500 animate-pulse font-medium text-xl bg-[#020617]">Loading Learning Portal...</div>;
  
  // Error State
  if (error) return <div className="min-h-[85vh] flex items-center justify-center text-red-400 font-medium bg-[#020617]">{error}</div>;

  return (
    <div className="min-h-[85vh] bg-[#020617] flex flex-col md:flex-row border-t border-slate-800">
      
      {/* LEFT SIDEBAR: Course Curriculum */}
      <div className="w-full md:w-80 lg:w-96 bg-[#040a1f] border-r border-slate-800 flex flex-col h-[85vh] overflow-hidden shrink-0">
        <div className="p-6 border-b border-slate-800 bg-slate-900/40">
          <button onClick={() => router.back()} className="text-slate-400 hover:text-emerald-400 text-sm font-medium flex items-center gap-2 mb-4 transition-colors">
            ← Back to Dashboard
          </button>
          <h2 className="text-xl font-bold text-white leading-snug">{course?.title}</h2>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full" style={{ width: '10%' }}></div>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Course Progress: 10%</p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          {lessons.length === 0 ? (
            <p className="text-slate-500 text-sm text-center mt-10">No lessons available yet.</p>
          ) : (
            lessons.map((lesson, index) => (
              <button
                key={lesson._id}
                onClick={() => {
                  setActiveLesson(lesson);
                  setSubmissionMessage({ type: "", text: "" }); // Clear messages when switching lessons
                }}
                className={`w-full text-left p-4 rounded-xl flex items-start gap-4 transition-all duration-300 ${
                  activeLesson?._id === lesson._id 
                    ? "bg-emerald-900/30 border border-emerald-500/50 shadow-[0_0_15px_rgba(52,211,153,0.1)]" 
                    : "bg-slate-900/40 border border-slate-800 hover:border-slate-600 hover:bg-slate-800/60"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${
                  activeLesson?._id === lesson._id ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className={`font-semibold text-sm truncate ${activeLesson?._id === lesson._id ? "text-emerald-400" : "text-slate-300"}`}>
                    {lesson.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    {lesson.videoUrl ? (
                      <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> Video Lesson</>
                    ) : (
                      <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg> Reading Material</>
                    )}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* RIGHT MAIN AREA: Video, Content & Assignment */}
      <div className="flex-1 h-[85vh] overflow-y-auto relative bg-[#020617] custom-scrollbar">
        {/* Ambient Background Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

        {activeLesson ? (
          <div className="max-w-5xl mx-auto p-4 md:p-8 relative z-10 pb-20">
            
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">{activeLesson.title}</h1>
            </div>

            {/* Video Player Area */}
            {activeLesson.videoUrl && (
              <div className="w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl mb-8 relative group">
                {activeLesson.videoUrl.includes('youtu') ? (
                  <iframe 
                    className="w-full h-full"
                    src={getEmbedUrl(activeLesson.videoUrl)} 
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                    <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <a href={activeLesson.videoUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
                      Click here to view external video
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Lesson Content / Notes Area */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-[2rem] p-8 shadow-lg mb-8">
              <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-3">
                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                Lesson Notes & Material
              </h3>
              <div className="prose prose-invert prose-emerald max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">
                {activeLesson.content}
              </div>
            </div>

            {/* Assignment Submission Section */}
            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
              {/* Decorative side accent */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
              
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Submit Assignment
              </h3>
              <p className="text-slate-400 text-sm mb-6">Write your homework answers or paste a link to your document below.</p>
              
              <form onSubmit={handleAssignmentSubmit}>
                <textarea
                  value={assignmentContent}
                  onChange={(e) => setAssignmentContent(e.target.value)}
                  placeholder="Type your answer or paste a link here..."
                  rows={4}
                  required
                  className="w-full bg-[#020617] border border-slate-700 rounded-xl px-5 py-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-300 resize-none mb-4"
                ></textarea>
                
                {/* Status Messages */}
                {submissionMessage.text && (
                  <div className={`p-3 rounded-lg text-sm font-medium border mb-4 ${submissionMessage.type === 'success' ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
                    {submissionMessage.text}
                  </div>
                )}

                <div className="flex justify-end">
                  <button 
                    type="submit"
                    disabled={submittingTask}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:shadow-[0_0_30px_rgba(52,211,153,0.5)] disabled:opacity-50 flex items-center gap-2"
                  >
                    {submittingTask ? "Submitting..." : "Submit Work"}
                    {!submittingTask && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>}
                  </button>
                </div>
              </form>
            </div>

          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
            <svg className="w-20 h-20 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            <p className="text-xl font-medium">Select a lesson from the curriculum to start learning.</p>
          </div>
        )}
      </div>
    </div>
  );
}