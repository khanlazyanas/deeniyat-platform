"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import Link from "next/link";

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  thumbnail?: string;
  teacherId?: any;
}

export default function ManageCoursesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Agar user login nahi hai ya Ustad/Admin nahi hai, toh wapas bhej do
    if (!user || (user.role !== "Ustad" && user.role !== "Admin")) {
      router.push("/dashboard");
      return;
    }

    const fetchMyCourses = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`);
        const data = await response.json();

        if (response.ok) {
          // 👇 YAHAN FILTER HO RAHA HAI: Sirf Ustad ke apne courses dikhenge
          const filteredCourses = data.filter(
            (c: Course) => c.teacherId?._id === user._id || c.teacherId === user._id
          );
          setMyCourses(filteredCourses);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, [user, router]);

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm("Are you sure you want to completely delete this course?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setMyCourses(prev => prev.filter(c => c._id !== courseId));
        alert("Course deleted successfully!");
      } else {
        alert("Failed to delete course.");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#010206] flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-slate-800 border-t-emerald-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#010206] pt-28 pb-12 px-6 sm:px-10 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">Manage My Courses</h1>
            <p className="text-slate-400 font-light text-lg">Edit details, manage modules, or delete your published courses.</p>
          </div>
          <Link href="/dashboard/create-course" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-[#010206] font-black uppercase tracking-widest rounded-full transition-all text-sm inline-flex items-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.4)]">
            + Create New Course
          </Link>
        </div>

        {myCourses.length === 0 ? (
          <div className="bg-[#030612]/60 border border-white/[0.05] rounded-3xl p-12 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">No Courses Found</h3>
            <p className="text-slate-500 mb-6">You haven't published any courses yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {myCourses.map((course) => (
              <div key={course._id} className="bg-[#030612]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl overflow-hidden flex flex-col hover:border-white/[0.15] transition-colors shadow-lg">
                
                {/* Course Thumbnail */}
                <div className="w-full h-48 bg-[#0a0f1c] relative">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700 font-black text-xl">NO IMAGE</div>
                  )}
                  <div className="absolute top-4 right-4 bg-[#010206]/80 backdrop-blur px-3 py-1.5 rounded-lg text-emerald-400 font-bold text-xs border border-white/[0.1]">
                    ₹{course.price}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-6 flex-1">{course.description}</p>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <Link href={`/dashboard/my-courses/${course._id}`} className="w-full text-center px-4 py-3 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-xl font-bold transition-all text-sm border border-blue-500/20">
                      Manage Modules (Videos)
                    </Link>
                    
                    <div className="flex gap-3">
                      <Link href={`/dashboard/edit-course/${course._id}`} className="flex-1 text-center px-4 py-3 bg-white/[0.03] text-slate-300 hover:bg-white/[0.1] rounded-xl font-bold transition-all text-sm border border-white/[0.05]">
                        Edit Info
                      </Link>
                      <button onClick={() => handleDeleteCourse(course._id)} className="flex-1 px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-all text-sm border border-red-500/20">
                        Delete
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}