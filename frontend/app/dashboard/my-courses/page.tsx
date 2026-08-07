"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

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

// --- 3D Holographic Course Card Component ---
function HolographicCourseCard({ enrollment }: { enrollment: EnrolledCourse }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    
    const springConfig = { damping: 40, stiffness: 250, mass: 0.5 };
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springConfig);
  
    const [isHovered, setIsHovered] = useState(false);
    const [glarePosition, setGlarePosition] = useState({ x: 0, y: 0 });
  
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(relX);
      mouseY.set(relY);
      setGlarePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
  
    const handleMouseLeave = () => {
      setIsHovered(false);
      mouseX.set(0);
      mouseY.set(0);
    };

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="group flex flex-col bg-[#030612]/70 backdrop-blur-[40px] backdrop-saturate-[150%] rounded-[2rem] border border-white/[0.06] overflow-hidden hover:border-white/[0.12] transition-colors duration-700 shadow-[0_32px_64px_-20px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.5)] h-full will-change-transform"
        >
            {/* Dynamic Glare Effect */}
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 z-30 mix-blend-color-dodge"
                style={{
                    opacity: isHovered ? 1 : 0,
                    background: `radial-gradient(800px circle at ${glarePosition.x}px ${glarePosition.y}px, rgba(255,255,255,0.15), transparent 45%)`,
                }}
            />

            {/* Thumbnail Area */}
            <div className="h-56 bg-[#010206] flex items-center justify-center relative overflow-hidden border-b border-white/[0.04]">
                {enrollment.courseId?.thumbnail ? (
                    <Image 
                        src={enrollment.courseId.thumbnail} 
                        alt={enrollment.courseId.title} 
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out mix-blend-screen" 
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#060d20] to-[#040814] flex flex-col items-center justify-center text-emerald-500/30 group-hover:text-emerald-400/50 transition-colors duration-500">
                        <svg className="w-16 h-16 mb-2 opacity-40 group-hover:scale-110 transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium tracking-widest uppercase">Course Visual</span>
                    </div>
                )}
                <div className="absolute inset-0 shadow-[inset_0_15px_30px_rgba(0,0,0,0.8)] pointer-events-none z-10"></div>
                
                {/* Level Badge */}
                <div className="absolute top-4 right-4 px-4 py-2 bg-[#020510]/80 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_16px_rgba(0,0,0,0.6)] rounded-full text-[10px] font-black tracking-[0.2em] text-emerald-400 uppercase z-20">
                    {enrollment.courseId?.level || "Beginner"}
                </div>
            </div>

            {/* Content Area */}
            <div className="p-8 flex flex-col flex-grow relative z-10 bg-gradient-to-t from-[#010206] to-transparent">
                <h3 className="text-2xl font-black text-white mb-3 line-clamp-1 tracking-tighter group-hover:text-emerald-400 transition-colors duration-500 drop-shadow-md">
                    {enrollment.courseId?.title}
                </h3>
                
                <p className="text-[13px] font-medium text-slate-400 mb-8 flex items-center gap-2 mix-blend-screen">
                    <div className="w-6 h-6 rounded-full bg-white/[0.05] flex items-center justify-center border border-white/[0.08]">
                        <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                </p>

                <Link 
                    href={`/dashboard/my-courses/${enrollment.courseId?._id}`}
                    className="mt-auto w-full group/btn relative inline-flex items-center justify-center px-6 py-4 text-[13px] font-black tracking-widest uppercase text-emerald-400 bg-emerald-950/20 border border-emerald-900/50 rounded-xl overflow-hidden transition-all duration-300 hover:bg-emerald-500 hover:text-[#010206] hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(52,211,153,0.4),inset_0_1px_1px_rgba(255,255,255,0.6)] active:scale-95"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        Continue Learning
                        <svg className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </span>
                </Link>
            </div>
        </motion.div>
    );
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
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unexpected error occurred");
                }
            } finally {
                setTimeout(() => setLoading(false), 600); // Small delay for smooth cinematic feel
            }
        };

        fetchMyCourses();
    }, []);

    if (loading) return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center relative perspective-[2000px]">
            <div className="w-16 h-16 border-4 border-slate-800/80 border-t-emerald-400 rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(52,211,153,0.5)] z-10"></div>
            <p className="text-emerald-400 font-bold tracking-[0.2em] uppercase text-sm z-10">Loading Curriculum...</p>
        </div>
    );
    
    if (error) return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 relative">
            <div className="bg-[#030612]/80 backdrop-blur-2xl border border-red-500/30 p-10 rounded-[2.5rem] text-center max-w-xl shadow-[0_20px_40px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.05)] z-10">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Oops! Something went wrong</h3>
                <p className="text-slate-400 text-lg font-light leading-relaxed">{error}</p>
            </div>
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="min-h-[85vh] p-4 md:p-8 relative overflow-hidden perspective-[2000px]"
        >
            {/* Ambient Background Glow */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[140px] pointer-events-none mix-blend-screen animate-[pulse_10s_ease-in-out_infinite]"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-teal-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-[pulse_14s_ease-in-out_infinite_reverse]"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-12">
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 drop-shadow-md">My Learning Journey</h2>
                    <p className="text-slate-400 font-light text-xl">Continue mastering your Deen where you left off.</p>
                </div>

                {enrollments.length === 0 ? (
                    <div className="bg-[#030612]/60 backdrop-blur-[40px] p-16 text-center rounded-[3rem] border border-white/[0.04] shadow-[0_32px_64px_-20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)]">
                        <div className="w-24 h-24 bg-white/[0.02] rounded-[2rem] border border-white/[0.05] flex items-center justify-center mx-auto mb-8 text-slate-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Your curriculum is empty</h3>
                        <p className="text-slate-400 mb-10 text-lg font-light max-w-lg mx-auto leading-relaxed">
                            You haven't enrolled in any courses yet. Explore our catalog and start your spiritual journey today.
                        </p>
                        <Link 
                            href="/courses" 
                            className="inline-flex items-center gap-3 px-10 py-5 text-[15px] text-slate-950 bg-gradient-to-b from-emerald-400 to-teal-500 font-black uppercase tracking-widest rounded-full transition-all duration-500 shadow-[0_0_30px_-10px_rgba(52,211,153,0.6),inset_0_1px_1px_rgba(255,255,255,0.8)] hover:scale-105 ring-1 ring-white/20"
                        >
                            Browse Catalog
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {enrollments.map((enrollment) => (
                            <HolographicCourseCard key={enrollment._id} enrollment={enrollment} />
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}