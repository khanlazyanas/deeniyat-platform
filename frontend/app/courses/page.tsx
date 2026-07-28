"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Course {
  _id: string;
  title: string;
  description: string;
  level: string;
  thumbnail?: string;
  instructor?: {
    name: string;
  };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch courses");
        }

        setCourses(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020617] pt-24 pb-20 relative overflow-hidden font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-emerald-900/20 to-transparent pointer-events-none"></div>
      <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-teal-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-emerald-500/30 mb-6 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-300 tracking-widest uppercase">Open Enrollment</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
            Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Path</span>
          </h1>
          <p className="text-lg text-slate-400 font-light leading-relaxed mb-8">
            Explore our meticulously crafted curriculum. From foundational basics to advanced Islamic sciences, find the perfect course for your spiritual journey.
          </p>

          {/* Premium Search Bar */}
          <div className="relative max-w-xl mx-auto group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              placeholder="Search for courses, topics, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/60 backdrop-blur-md border border-slate-700 text-slate-200 rounded-full py-4 pl-12 pr-6 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-300 placeholder-slate-500 shadow-lg"
            />
          </div>
        </div>

        {/* State Handlers */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(52,211,153,0.4)]"></div>
            <p className="text-emerald-500 font-medium tracking-wide">Fetching curriculum...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-950/30 border border-red-500/30 p-8 rounded-3xl backdrop-blur-md text-center max-w-lg mx-auto">
            <h3 className="text-xl font-bold text-red-400 mb-2">Failed to load courses</h3>
            <p className="text-red-300/80">{error}</p>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && !error && (
          <>
            {filteredCourses.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-slate-500 font-medium">No courses found matching your search.</p>
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="mt-4 text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-4"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((course) => (
                  <div key={course._id} className="group relative bg-slate-900/40 backdrop-blur-md rounded-[2rem] border border-slate-800 overflow-hidden hover:border-emerald-500/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_15px_50px_-15px_rgba(52,211,153,0.2)] flex flex-col">
                    
                    {/* Thumbnail Area */}
                    <div className="h-56 bg-slate-800 relative overflow-hidden">
                      {course.thumbnail ? (
                        <img 
                          src={course.thumbnail} 
                          alt={course.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center text-slate-600">
                           <svg className="w-16 h-16 mb-3 opacity-30 group-hover:scale-110 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </div>
                      )}
                      
                      {/* Level Badge */}
                      <div className="absolute top-4 left-4 px-3 py-1.5 bg-slate-950/80 backdrop-blur-md border border-slate-700/50 rounded-full text-xs font-bold text-emerald-400 tracking-wide uppercase">
                        {course.level || "Beginner"}
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-8 flex flex-col flex-grow relative z-10 bg-gradient-to-t from-slate-900/80 to-transparent">
                      <h2 className="text-2xl font-bold text-white mb-3 line-clamp-1 group-hover:text-emerald-400 transition-colors">
                        {course.title}
                      </h2>
                      <p className="text-slate-400 text-sm mb-6 line-clamp-3 leading-relaxed font-light">
                        {course.description}
                      </p>

                      {/* Instructor Area */}
                      {course.instructor?.name && (
                        <div className="flex items-center gap-3 mb-8">
                           <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                             {course.instructor.name.charAt(0)}
                           </div>
                           <span className="text-sm font-medium text-slate-300">Ustad {course.instructor.name}</span>
                        </div>
                      )}

                      {/* View Details Button */}
                      <Link 
                        href={`/courses/${course._id}`} 
                        className="mt-auto block w-full text-center py-4 rounded-xl font-bold text-slate-950 bg-white hover:bg-emerald-400 transition-all duration-300 hover:shadow-[0_0_30px_rgba(52,211,153,0.3)] hover:-translate-y-1"
                      >
                        View Details & Enroll
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}