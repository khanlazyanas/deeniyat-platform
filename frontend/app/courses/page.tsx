"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// TypeScript Interface Frontend ke liye (Backend ke schema jaisa)
interface Course {
  _id: string;
  title: string;
  description: string;
  level: string;
  thumbnail?: string;
  teacherId?: { name: string } | string; // Agar backend se populate hoke aayega toh object hoga
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`);
        
        // Backend se jo data aa raha hai wo direct array hai
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch courses");
        }

        // FIX: Yahan 'data.courses' ki jagah sirf 'data' set karna hai
        // Kyunki tumhara backend directly courses ka array bhej raha hai
        setCourses(Array.isArray(data) ? data : []); 
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Our Courses</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose from our expertly crafted programs to begin or advance your journey in Islamic learning.
        </p>
      </div>

      {/* Loading & Error States */}
      {loading && <p className="text-center text-blue-600 font-medium">Loading courses...</p>}
      {error && <p className="text-center text-red-600 bg-red-50 p-4 rounded-md border border-red-200">{error}</p>}
      
      {/* Empty State */}
      {!loading && !error && courses.length === 0 && (
        <div className="text-center bg-gray-50 p-10 rounded-xl border border-gray-200">
          <p className="text-gray-500 text-lg">No courses available right now. Check back later!</p>
        </div>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <div key={course._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition flex flex-col border border-gray-100">
            
            {/* Thumbnail Placeholder ya Asli Image */}
            <div className="h-48 w-full bg-blue-50 flex items-center justify-center overflow-hidden">
              {course.thumbnail ? (
                 <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-blue-300 font-medium text-lg">Deeniyat Course</span>
              )}
            </div>
            
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{course.title}</h3>
                <span className="px-2 py-1 bg-gray-100 text-xs font-semibold text-gray-600 rounded whitespace-nowrap ml-2">
                  {course.level}
                </span>
              </div>
              
              <p className="text-gray-600 mb-6 flex-grow line-clamp-3 text-sm">{course.description}</p>
              
              <Link 
                href={`/courses/${course._id}`}
                className="w-full text-center bg-blue-50 text-blue-600 font-medium py-2 rounded hover:bg-blue-600 hover:text-white transition"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}