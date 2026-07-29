"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Teacher {
  _id: string;
  name: string;
  email: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  level: string;
  thumbnail?: string;
  teacherId?: Teacher;
}

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Enrollment states
  const [enrolling, setEnrolling] = useState(false);
  const [enrollMessage, setEnrollMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!id) return;

    const fetchSingleCourse = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${id}`);
        const data = await response.json(); 

        if (!response.ok) {
          throw new Error(data.message || "Failed to load course");
        }
        setCourse(data); 
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSingleCourse();
  }, [id]);

  // Function to handle student enrollment
  const handleEnroll = async () => {
    const token = localStorage.getItem("token");
    
    // Redirect to login if the user is not authenticated
    if (!token) {
      router.push("/login?redirect=/courses/" + id);
      return;
    }

    setEnrolling(true);
    setEnrollMessage({ type: "", text: "" });

    try {
      // Send enrollment request to the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ courseId: id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong while enrolling");
      }

      setEnrollMessage({ type: "success", text: "Successfully enrolled in the course! 🎉" });
      
      // Redirect to the dashboard after a short delay so the student can see their new course
      setTimeout(() => {
        router.push("/dashboard/my-courses");
      }, 2000);

    } catch (err: any) {
      setEnrollMessage({ type: "error", text: err.message });
    } finally {
      setEnrolling(false);
    }
  };

  // Loading State UI
  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center relative">
      <div className="w-12 h-12 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(52,211,153,0.4)]"></div>
      <p className="text-emerald-500 font-medium tracking-wide">Loading Course Details...</p>
    </div>
  );

  // Error State UI
  if (error || !course) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="bg-red-950/30 border border-red-500/30 p-8 rounded-2xl backdrop-blur-md text-center max-w-lg w-full">
        <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Course</h3>
        <p className="text-red-300/80">{error || "Course not found!"}</p>
        <button onClick={() => router.push('/courses')} className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] pt-24 pb-20 relative overflow-hidden font-sans">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Back Navigation */}
        <button 
          onClick={() => router.push('/courses')} 
          className="group flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors mb-8 font-medium w-fit"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Course Catalog
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column: Course Info */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Thumbnail Area */}
            <div className="w-full h-[400px] bg-slate-900/50 rounded-[2rem] border border-slate-800 overflow-hidden relative shadow-2xl">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center text-slate-600">
                  <svg className="w-20 h-20 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
              )}
            </div>

            {/* Course Title and Description */}
            <div>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-sm font-bold tracking-wide uppercase">
                  {course.level || "Beginner"}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
                {course.title}
              </h1>
              
              <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-8 border border-slate-800/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  About this Course
                </h3>
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-lg font-light">
                  {course.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Enrollment Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-slate-900/60 backdrop-blur-xl border border-slate-700 rounded-[2rem] p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
              
              {/* Instructor Info */}
              {course.teacherId && (
                <div className="flex items-center gap-4 p-4 bg-[#020617] rounded-xl border border-slate-800 mb-8">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-lg font-bold text-slate-300">
                    {course.teacherId.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Taught By</p>
                    <p className="text-white font-medium">Ustad {course.teacherId.name}</p>
                  </div>
                </div>
              )}

              {/* Enrollment Status Message */}
              {enrollMessage.text && (
                <div className={`mb-6 p-4 rounded-xl text-sm font-medium border ${enrollMessage.type === 'success' ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
                  {enrollMessage.text}
                </div>
              )}

              {/* Action Button */}
              <button 
                onClick={handleEnroll}
                disabled={enrolling || enrollMessage.type === 'success'}
                className={`w-full py-4 text-slate-950 text-lg font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  enrolling || enrollMessage.type === 'success' 
                  ? 'bg-emerald-800 text-slate-400 cursor-not-allowed' 
                  : 'bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:shadow-[0_0_30px_rgba(52,211,153,0.5)]'
                }`}
              >
                {enrolling ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Enrolling...
                  </>
                ) : enrollMessage.type === 'success' ? (
                  "Successfully Enrolled ✓"
                ) : (
                  "Enroll Now"
                )}
              </button>
              
              <p className="text-center text-slate-500 text-xs mt-4">
                Secure your spot instantly. You will be redirected to your dashboard upon enrollment.
              </p>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}