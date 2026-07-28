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
    order: "", // FIX: Added order field
  });

  // Fetch courses so the teacher can select which course to add a lesson to
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

      // FIX: Ensure order is sent as a number
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

  if (loading) return <div className="p-8 text-emerald-500 animate-pulse font-medium">Loading workspace...</div>;

  return (
    <div className="min-h-[85vh] p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

      <div className="w-full max-w-3xl relative z-10">
        
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-amber-500/30 mb-4 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-amber-300 tracking-wider uppercase">Curriculum Builder</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-3">Add New Lesson</h2>
          <p className="text-slate-400 font-light text-lg">Enrich your course with high-quality content and video lectures.</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-8 md:p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Course Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Select Course <span className="text-emerald-500">*</span></label>
              <select 
                name="courseId" 
                value={formData.courseId} 
                onChange={handleChange} 
                required
                className="w-full bg-[#020617] border border-slate-700 rounded-xl px-5 py-4 text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-300 appearance-none"
              >
                <option value="" disabled>-- Choose a course --</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>{course.title}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Lesson Order */}
              <div className="space-y-2 md:col-span-1">
                <label className="text-sm font-medium text-slate-300 ml-1">Lesson No. <span className="text-emerald-500">*</span></label>
                <input 
                  type="number" 
                  name="order" 
                  value={formData.order} 
                  onChange={handleChange} 
                  placeholder="e.g. 1"
                  required
                  min="1"
                  className="w-full bg-[#020617] border border-slate-700 rounded-xl px-5 py-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-300"
                />
              </div>

              {/* Lesson Title */}
              <div className="space-y-2 md:col-span-3">
                <label className="text-sm font-medium text-slate-300 ml-1">Lesson Title <span className="text-emerald-500">*</span></label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  placeholder="e.g. Introduction to Tajweed Rules"
                  required
                  className="w-full bg-[#020617] border border-slate-700 rounded-xl px-5 py-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-300"
                />
              </div>
            </div>

            {/* Video URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Video URL (Optional)</label>
              <input 
                type="url" 
                name="videoUrl" 
                value={formData.videoUrl} 
                onChange={handleChange} 
                placeholder="https://youtube.com/..."
                className="w-full bg-[#020617] border border-slate-700 rounded-xl px-5 py-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-300"
              />
            </div>

            {/* Content / Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Lesson Content / Notes <span className="text-emerald-500">*</span></label>
              <textarea 
                name="content" 
                value={formData.content} 
                onChange={handleChange} 
                placeholder="Write the study material or summary for this lesson here..."
                required
                rows={5}
                className="w-full bg-[#020617] border border-slate-700 rounded-xl px-5 py-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-300 resize-none"
              />
            </div>

            {/* Messages */}
            {message.text && (
              <div className={`p-4 rounded-xl text-sm font-medium border ${message.type === 'success' ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(52,211,153,0.4)] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10 flex items-center gap-2">
                {submitting ? "Publishing Lesson..." : "Publish Lesson"}
                {!submitting && <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>}
              </span>
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}