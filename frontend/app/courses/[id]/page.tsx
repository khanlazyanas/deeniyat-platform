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
  
  // Enrollment ke states
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

  // Naya function: Enroll karne ke liye
  const handleEnroll = async () => {
    const token = localStorage.getItem("token");
    
    // Agar user logged in nahi hai, toh seedha login page par bhej do
    if (!token) {
      router.push("/login?redirect=/courses/" + id);
      return;
    }

    setEnrolling(true);
    setEnrollMessage({ type: "", text: "" });

    try {
      // Backend ko request bhej rahe hain (Make sure ye endpoint tumhare backend API se match kare)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Token zaroori hai pata lagane ke liye kon enroll ho raha hai
        },
        body: JSON.stringify({ courseId: id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong while enrolling");
      }

      setEnrollMessage({ type: "success", text: "Successfully enrolled in the course! 🎉" });
      
      // Kuch seconds baad dashboard par bhej do taaki wo apne courses dekh sake
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);

    } catch (err: any) {
      setEnrollMessage({ type: "error", text: err.message });
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600 font-medium">Loading Course Details...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!course) return <div className="min-h-screen flex items-center justify-center">Course not found!</div>;

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 min-h-screen">
      <button onClick={() => router.back()} className="text-blue-600 hover:underline mb-6 flex items-center font-medium">
        ← Back to Courses
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
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
            {/* Messages */}
            {enrollMessage.text && (
              <div className={`mb-4 p-3 rounded text-sm ${enrollMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {enrollMessage.text}
              </div>
            )}

            {/* Active Enroll Button */}
            <button 
              onClick={handleEnroll}
              disabled={enrolling || enrollMessage.type === 'success'}
              className={`w-full md:w-auto px-8 py-3 text-white font-bold rounded shadow-md transition ${
                enrolling || enrollMessage.type === 'success' 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {enrolling ? "Enrolling..." : enrollMessage.type === 'success' ? "Enrolled!" : "Enroll Now"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}