"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

// TypeScript Interfaces - Tumhare backend populate structure ke hisaab se
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
  teacherId?: Teacher; // Backend se populate hokar aayega
}

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchSingleCourse = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${id}`);
        
        // Tumhara backend seedha course object ya error message bhej raha hai
        const data = await response.json(); 

        if (!response.ok) {
          throw new Error(data.message || "Failed to load course");
        }

        // FIX: Yahan sirf 'data' set karna hai kyunki backend res.json(course) bhej raha hai
        setCourse(data); 
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSingleCourse();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600 font-medium">Loading Course Details...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!course) return <div className="min-h-screen flex items-center justify-center">Course not found!</div>;

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 min-h-screen">
      
      {/* Back Button */}
      <button onClick={() => router.back()} className="text-blue-600 hover:underline mb-6 flex items-center font-medium">
        ← Back to Courses
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* Course Banner */}
        <div className="h-64 w-full bg-blue-50 flex items-center justify-center">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-blue-300 font-bold text-3xl">Deeniyat Platform</span>
          )}
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
              {course.level}
            </span>
          </div>

          {/* Teacher ka naam dikhane ka section (Kyunki backend ne populate kiya hai) */}
          {course.teacherId && (
            <div className="mb-6 inline-flex items-center text-gray-700 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
              <span className="font-semibold mr-2">Instructor:</span> 
              <span>{course.teacherId.name}</span>
            </div>
          )}

          <div className="mt-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">About this Course</h3>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
              {course.description}
            </p>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100">
            <button className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition shadow-md">
              Enroll Now
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}