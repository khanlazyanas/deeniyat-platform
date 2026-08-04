"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateCoursePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    level: "Beginner",
    thumbnail: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    
    if (storedUser && storedUser !== "undefined") {
      try {
        const user = JSON.parse(storedUser);
        setUserId(user._id || user.id); 
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ ...formData, teacherId: userId }), 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create course");
      }

      setSuccess(true);
      // 2 second baad user ko courses page par bhej do
      setTimeout(() => router.push("/dashboard/my-courses"), 2000); 

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full w-full py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative">
      
      {/* Subtle Background Glow specifically for this component */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative w-full max-w-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-md rounded-[2rem] p-6 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
        
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-800/60">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.3)] shrink-0">
            <svg className="w-6 h-6 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Create a New Course</h2>
            <p className="text-slate-400 text-sm mt-1">Design a new curriculum for your students</p>
          </div>
        </div>
        
        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-3 bg-red-950/50 text-red-400 p-4 rounded-xl mb-6 text-sm border border-red-900/50 backdrop-blur-sm animate-pulse">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="flex items-center gap-3 bg-emerald-950/50 text-emerald-400 p-4 rounded-xl mb-6 text-sm border border-emerald-900/50 backdrop-blur-sm">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Course published successfully! Redirecting to your courses...</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Course Title</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <input 
                type="text" name="title" value={formData.title} onChange={handleChange} required
                className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-slate-200 placeholder-slate-600"
                placeholder="e.g., Tajweed for Beginners"
              />
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <div className="relative group">
              <div className="absolute top-3 left-0 pl-4 flex items-start pointer-events-none">
                <svg className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </div>
              <textarea 
                name="description" value={formData.description} onChange={handleChange} required rows={4}
                className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-slate-200 placeholder-slate-600 custom-scrollbar resize-none"
                placeholder="Describe what students will learn..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Level Dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Level</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <select 
                  name="level" value={formData.level} onChange={handleChange}
                  className="w-full pl-11 pr-10 py-3 appearance-none bg-slate-950/50 border border-slate-800 rounded-xl focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-slate-200 cursor-pointer"
                >
                  <option value="Beginner" className="bg-slate-900">Beginner</option>
                  <option value="Intermediate" className="bg-slate-900">Intermediate</option>
                  <option value="Advanced" className="bg-slate-900">Advanced</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Thumbnail URL */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Thumbnail URL <span className="text-slate-500 text-xs">(Optional)</span></label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <input 
                  type="url" name="thumbnail" value={formData.thumbnail} onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-slate-200 placeholder-slate-600"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="pt-4">
            <button 
              type="submit" disabled={loading}
              className={`relative w-full sm:w-auto px-8 py-3.5 border border-transparent rounded-xl text-base font-bold text-slate-950 transition-all duration-300 overflow-hidden flex justify-center items-center gap-2 ${
                loading 
                  ? 'bg-emerald-600/50 cursor-not-allowed text-white' 
                  : 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:scale-[1.02] hover:shadow-[0_0_30px_-5px_rgba(52,211,153,0.6)]'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Publishing...
                </>
              ) : (
                <>
                  Publish Course
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}