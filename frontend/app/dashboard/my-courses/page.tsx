"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image"; // Added for optimized image rendering

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

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments/my-courses`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to fetch enrolled courses");
                }

                setEnrollments(Array.isArray(data) ? data : (data.data || []));
            } catch (err: unknown) {
                // Removed 'any' and added safe type checking
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unexpected error occurred");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchMyCourses();
    }, []);

    if (loading) return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center relative">
            <div className="w-12 h-12 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(52,211,153,0.4)]"></div>
            <p className="text-emerald-500 font-medium tracking-wide">Loading your curriculum...</p>
        </div>
    );
    
    if (error) return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <div className="bg-red-950/30 border border-red-500/30 p-8 rounded-2xl backdrop-blur-md text-center max-w-lg">
                <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-xl font-bold text-red-400 mb-2">Oops! Something went wrong</h3>
                <p className="text-red-300/80">{error}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-[85vh] p-4 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-10">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">My Learning Journey</h2>
                    <p className="text-slate-400 font-light">Continue mastering your Deen where you left off.</p>
                </div>

                {enrollments.length === 0 ? (
                    <div className="bg-slate-900/50 backdrop-blur-xl p-12 text-center rounded-[2rem] border border-slate-800 shadow-2xl">
                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-500">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Your curriculum is empty</h3>
                        <p className="text-slate-400 mb-8 max-w-md mx-auto">You haven't enrolled in any courses yet. Explore our catalog and start your spiritual journey today.</p>
                        <Link href="/courses" className="inline-flex items-center gap-2 px-8 py-3 text-slate-950 bg-emerald-500 hover:bg-emerald-400 font-bold rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:scale-105">
                            Browse Catalog
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {enrollments.map((enrollment) => (
                            <div key={enrollment._id} className="group flex flex-col bg-slate-900/40 backdrop-blur-md rounded-[2rem] border border-slate-800 overflow-hidden hover:border-emerald-500/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(52,211,153,0.15)]">
                                
                                <div className="h-48 bg-slate-800 flex items-center justify-center relative overflow-hidden">
                                    {enrollment.courseId?.thumbnail ? (
                                        <Image 
                                            src={enrollment.courseId.thumbnail} 
                                            alt={enrollment.courseId.title} 
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-cover group-hover:scale-105 transition-transform duration-700" 
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center text-slate-600">
                                            <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-sm font-medium">Course Visual</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-slate-950/80 backdrop-blur-md border border-slate-700/50 rounded-full text-xs font-semibold text-slate-300">
                                        {enrollment.courseId?.level || "Beginner"}
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col flex-grow relative">
                                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-emerald-400 transition-colors">
                                        {enrollment.courseId?.title}
                                    </h3>
                                    
                                    <p className="text-sm text-slate-400 mb-6 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                    </p>

                                    <Link 
                                        href={`/dashboard/my-courses/${enrollment.courseId?._id}`}
                                        className="mt-auto w-full group/btn relative inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 rounded-xl overflow-hidden transition-all duration-300 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-500 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)]"
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            Continue Learning
                                            <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}