"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Course {
  _id: string;
  title: string;
}

export default function AddLessonPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    content: "",
    videoUrl: "",
    order: "",
  });

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`);
        const data = await response.json();
        
        if (response.ok) {
          setCourses(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const payload = {
        ...formData,
        order: Number(formData.order) 
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add lesson");
      }

      setMessage({ type: "success", text: "Lesson added successfully to the course! ✨" });
      setFormData({ courseId: formData.courseId, title: "", content: "", videoUrl: "", order: "" }); // Reset form
      
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <svg className="animate-spin h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-slate-400 font-medium animate-pulse">Loading curriculum data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

      <div className="relative w-full max-w-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-md rounded-[2rem] p-6 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 pb-6 border-b border-slate-800/60">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.3)] shrink-0 hidden sm:flex">
            <svg className="w-6 h-6 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-amber-500/30 mb-2 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
              <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="text-[10px] font-bold text-amber-300 tracking-wider uppercase">Curriculum Builder</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Add New Lesson</h2>
            <p className="text-slate-400 text-sm mt-1">Enrich your course with high-quality content and video lectures.</p>
          </div>
        </div>

        {/* Alerts */}
        {message.text && (
          <div className={`flex items-start gap-3 p-4 rounded-xl mb-6 text-sm border backdrop-blur-sm ${
            message.type === 'success' 
              ? 'bg-emerald-950/50 text-emerald-400 border-emerald-900/50' 
              : 'bg-red-950/50 text-red-400 border-red-900/50 animate-pulse'
          }`}>
            {message.type === 'success' ? (
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ) : (
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Course Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Select Course <span className="text-emerald-500">*</span></label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <select 
                name="courseId" 
                value={formData.courseId} 
                onChange={handleChange} 
                required
                className="w-full pl-11 pr-10 py-3 appearance-none bg-slate-950/50 border border-slate-800 rounded-xl focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-slate-200 cursor-pointer"
              >
                <option value="" disabled className="bg-slate-900">-- Choose a course --</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id} className="bg-slate-900">{course.title}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Lesson Order */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">Lesson No. <span className="text-emerald-500">*</span></label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <input 
                  type="number" name="order" value={formData.order} onChange={handleChange} placeholder="e.g. 1" required min="1"
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-slate-200 placeholder-slate-600"
                />
              </div>
            </div>

            {/* Lesson Title */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-300 mb-2">Lesson Title <span className="text-emerald-500">*</span></label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <input 
                  type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Introduction to Tajweed" required
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-slate-200 placeholder-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Video URL <span className="text-slate-500 text-xs">(Optional)</span></label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <input 
                type="url" name="videoUrl" value={formData.videoUrl} onChange={handleChange} placeholder="https://youtube.com/..."
                className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-slate-200 placeholder-slate-600"
              />
            </div>
          </div>

          {/* Content / Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Lesson Content / Notes <span className="text-emerald-500">*</span></label>
            <div className="relative group">
              <div className="absolute top-3.5 left-0 pl-4 flex items-start pointer-events-none">
                <svg className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <textarea 
                name="content" value={formData.content} onChange={handleChange} placeholder="Write the study material or summary for this lesson here..." required rows={5}
                className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-slate-200 placeholder-slate-600 resize-none custom-scrollbar"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={submitting}
              className={`relative w-full sm:w-auto px-8 py-3.5 border border-transparent rounded-xl text-base font-bold text-slate-950 transition-all duration-300 overflow-hidden flex justify-center items-center gap-2 ${
                submitting 
                  ? 'bg-emerald-600/50 cursor-not-allowed text-white' 
                  : 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:scale-[1.02] hover:shadow-[0_0_30px_-5px_rgba(52,211,153,0.6)]'
              }`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Publishing Lesson...
                </>
              ) : (
                <>
                  Publish Lesson
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}