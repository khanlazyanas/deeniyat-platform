"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface EnrolledCourse {
    _id: string;
    courseId: {
        _id: string;
        title: string;
        description: string;
        level: string;
        thumbnail?: string;
    };
    enrolledAt: string;
}

export default function MyCoursesPage() {
    const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchMyCourses = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Please login to view your courses");

                // Backend API ko call kar rahe hain enrollments laane ke liye
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments/my-courses`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to fetch enrolled courses");
                }

                // Assuming backend array bhej raha hai ya { success: true, data: [...] } bhej raha hai
                setEnrollments(Array.isArray(data) ? data : (data.data || []));
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMyCourses();
    }, []);

    if (loading) return <div className="p-8 text-blue-600 font-medium">Loading your courses...</div>;
    if (error) return <div className="p-8 text-red-600">{error}</div>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Enrolled Courses</h2>

            {enrollments.length === 0 ? (
                <div className="bg-gray-50 p-8 text-center rounded-xl border border-gray-200">
                    <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet.</p>
                    <Link href="/courses" className="text-blue-600 font-medium hover:underline">
                        Browse Courses
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrollments.map((enrollment) => (
                        <div key={enrollment._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                            <div className="h-40 bg-blue-50 flex items-center justify-center">
                                {enrollment.courseId?.thumbnail ? (
                                    <img src={enrollment.courseId.thumbnail} alt={enrollment.courseId.title} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-blue-300 font-medium">Course Image</span>
                                )}
                            </div>
                            <div className="p-5 flex flex-col flex-grow">
                                <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">{enrollment.courseId?.title}</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Enrolled on: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                </p>
                                <button className="mt-auto w-full py-2 bg-blue-50 text-blue-600 font-medium rounded hover:bg-blue-600 hover:text-white transition">
                                    Continue Learning
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}