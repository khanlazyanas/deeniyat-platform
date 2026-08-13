"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";
import { useAuth } from "../../../context/AuthContext"; 

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
  promoVideo?: string; // 👈 NEW: Interface updated
  teacherId?: Teacher;
  price?: number; 
}

const globalAnimations = `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }
`;

const generateBubbles = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: Math.random() * 20 + 5,
    xPos: Math.random() * 100,
    yPos: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 10,
    color: ['bg-emerald-400', 'bg-teal-400', 'bg-blue-400', 'bg-purple-400', 'bg-amber-400', 'bg-white'][Math.floor(Math.random() * 6)],
    blur: Math.random() * 3 + 1,
    opacity: Math.random() * 0.5 + 0.3,
    layer: Math.floor(Math.random() * 3)
  }));
};

const ambientBubbles = generateBubbles(45);

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { user } = useAuth(); 
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  
  const [enrolling, setEnrolling] = useState(false);

  const isEnrolled = (user as any)?.enrolledCourses?.includes(id);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const fgX = useTransform(smoothMouseX, (v) => v * 1.5);
  const fgY = useTransform(smoothMouseY, (v) => v * 1.5);
  const mgX = useTransform(smoothMouseX, (v) => v * 0.8);
  const mgY = useTransform(smoothMouseY, (v) => v * 0.8);
  const bgX = useTransform(smoothMouseX, (v) => v * 0.3);
  const bgY = useTransform(smoothMouseY, (v) => v * 0.3);

  // 👇 Helper function to convert raw youtube links into embed links
  const getEmbedUrl = (url?: string) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0&modestbranding=1` : url;
  };

  useEffect(() => {
    setMounted(true);
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
        setTimeout(() => setLoading(false), 800); 
      }
    };

    fetchSingleCourse();

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 100;
      const y = (e.clientY / window.innerHeight - 0.5) * 100;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [id, mouseX, mouseY]);

  const handleEnroll = () => {
    if (isEnrolled) {
      router.push(`/dashboard/my-courses/${id}`); 
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login?redirect=/courses/" + id);
      return;
    }
    setEnrolling(true);
    router.push(`/checkout/${id}`);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#010206] flex flex-col items-center justify-center relative perspective-[2000px] overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-800/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
      <div className="w-16 h-16 border-4 border-slate-800/80 border-t-emerald-400 rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(52,211,153,0.5)] z-10"></div>
      <p className="text-emerald-400 font-bold tracking-[0.2em] uppercase text-sm z-10">Decrypting Knowledge...</p>
    </div>
  );

  if (error || !course) return (
    <div className="min-h-screen bg-[#010206] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="bg-[#030612]/80 backdrop-blur-2xl border border-red-500/30 p-10 rounded-[2.5rem] text-center max-w-xl mx-auto shadow-[0_20px_40px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.05)] z-10">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Error Loading Course</h3>
        <p className="text-slate-400 text-lg font-light leading-relaxed mb-8">{error || "Course not found!"}</p>
        <button onClick={() => router.push('/courses')} className="px-10 py-4 bg-white/[0.03] border border-white/[0.08] rounded-full text-slate-300 font-bold hover:bg-white/[0.1] hover:text-white transition-all duration-300 tracking-wide uppercase text-sm">Return to Catalog</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#010206] pt-32 pb-24 relative overflow-hidden font-sans selection:bg-emerald-500/30 selection:text-emerald-200 perspective-[2000px]">
      
      {mounted && (
        <motion.div 
          className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 origin-left z-[100] shadow-[0_0_20px_rgba(52,211,153,0.8)]"
          style={{ scaleX: smoothProgress }}
        />
      )}

      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay pointer-events-none z-0"></div>

      {mounted && (
        <div className="fixed inset-0 z-[5] pointer-events-none overflow-hidden">
          <motion.div style={{ x: fgX, y: fgY }} className="absolute inset-0 will-change-transform">
            {ambientBubbles.filter(b => b.layer === 0).map((p, i) => (
              <motion.div
                key={`fg-${i}`}
                className={`absolute rounded-full ${p.color}`}
                style={{
                  width: p.size, height: p.size, left: `${p.xPos}%`, top: `${p.yPos}%`,
                  filter: `blur(${p.blur}px)`, opacity: p.opacity,
                  boxShadow: `0 0 ${p.size * 2.5}px currentColor`
                }}
                animate={{ y: [0, -60, 0], x: [0, 30, -20, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
              />
            ))}
          </motion.div>
          <motion.div style={{ x: mgX, y: mgY }} className="absolute inset-0 will-change-transform">
             {ambientBubbles.filter(b => b.layer === 1).map((p, i) => (
              <motion.div
                key={`mg-${i}`}
                className={`absolute rounded-full ${p.color}`}
                style={{
                  width: p.size * 0.8, height: p.size * 0.8, left: `${p.xPos}%`, top: `${p.yPos}%`,
                  filter: `blur(${p.blur + 1}px)`, opacity: p.opacity * 0.7,
                  boxShadow: `0 0 ${p.size * 1.5}px currentColor`
                }}
                animate={{ y: [0, -40, 0], x: [0, -20, 15, 0] }}
                transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
              />
            ))}
          </motion.div>
        </div>
      )}

      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none mix-blend-screen animate-[pulse_12s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-0 left-[-10%] w-[40vw] h-[40vw] bg-blue-800/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-[pulse_15s_ease-in-out_infinite_reverse]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        
        <motion.button 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          onClick={() => router.push('/courses')} 
          className="group flex items-center gap-3 text-slate-400 hover:text-emerald-400 transition-colors mb-10 font-bold tracking-widest uppercase text-[11px] w-fit px-5 py-2.5 rounded-full bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Course Catalog
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-2 space-y-10"
          >
            
            {/* 👇 FIX: Promo Video Player ya Thumbnail */}
            <div className="w-full h-[450px] bg-[#030612]/70 backdrop-blur-3xl rounded-[2.5rem] border border-white/[0.06] overflow-hidden relative shadow-[0_32px_64px_-20px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.1)] group">
              {course.promoVideo ? (
                <iframe 
                  className="w-full h-full relative z-10"
                  src={getEmbedUrl(course.promoVideo)} 
                  title={course.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              ) : course.thumbnail ? (
                <>
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out mix-blend-screen" />
                  <div className="absolute inset-0 shadow-[inset_0_20px_40px_rgba(0,0,0,0.8)] pointer-events-none"></div>
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#060d20] to-[#040814] flex flex-col items-center justify-center text-emerald-500/30">
                  <svg className="w-24 h-24 mb-4 opacity-40 group-hover:scale-110 transition-all duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
              )}
              
              {!course.promoVideo && (
                <div className="absolute top-6 left-6 px-5 py-2.5 bg-[#020510]/80 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_16px_rgba(0,0,0,0.6)] rounded-full text-[11px] font-black tracking-[0.25em] text-emerald-400 uppercase">
                  {course.level || "Beginner"}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-8 leading-[1.1] drop-shadow-lg">
                {course.title}
              </h1>
              
              <div className="bg-[#030612]/60 backdrop-blur-[40px] rounded-[2.5rem] p-10 md:p-14 border border-white/[0.06] shadow-[0_32px_64px_-20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-4 tracking-tight">
                  <div className="w-10 h-10 rounded-[0.8rem] bg-[#040814] border border-white/[0.08] flex items-center justify-center text-emerald-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  About Curriculum
                </h3>
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-xl font-light mix-blend-screen">
                  {course.description}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-32 bg-[#030612]/80 backdrop-blur-[40px] backdrop-saturate-150 border border-white/[0.08] rounded-[2.5rem] p-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.1)] overflow-hidden">
              
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>

              {course.teacherId && (
                <div className="flex items-center gap-5 p-5 bg-[#010206]/80 rounded-[1.5rem] border border-white/[0.05] mb-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] relative z-10 hover:border-white/[0.1] transition-colors">
                  <div className="w-14 h-14 rounded-[1rem] bg-gradient-to-br from-[#060d20] to-[#040814] border border-white/[0.08] flex items-center justify-center text-xl font-black text-emerald-400 shadow-[0_8px_16px_rgba(0,0,0,0.4)]">
                    {course.teacherId.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.25em] mb-1">Taught By</p>
                    <p className="text-white font-bold text-lg tracking-wide">Ustad {course.teacherId.name}</p>
                  </div>
                </div>
              )}

              <button 
                onClick={handleEnroll}
                disabled={enrolling && !isEnrolled}
                className={`group relative w-full py-6 text-slate-950 text-[17px] font-black tracking-widest uppercase rounded-[1.5rem] transition-all duration-500 flex items-center justify-center gap-3 overflow-hidden ${
                  enrolling && !isEnrolled
                  ? 'bg-emerald-900/50 text-slate-400 cursor-not-allowed border border-emerald-900/50' 
                  : isEnrolled 
                    ? 'bg-gradient-to-b from-blue-400 to-indigo-500 text-white hover:scale-[1.03] shadow-[0_0_40px_-10px_rgba(59,130,246,0.6),inset_0_1px_1px_rgba(255,255,255,0.8)] active:scale-95 ring-1 ring-white/20'
                    : 'bg-gradient-to-b from-emerald-400 to-teal-500 hover:scale-[1.03] shadow-[0_0_40px_-10px_rgba(52,211,153,0.6),inset_0_1px_1px_rgba(255,255,255,0.8)] active:scale-95 ring-1 ring-white/20'
                }`}
              >
                {!enrolling && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>}
                
                <span className="relative z-10 flex items-center gap-3">
                  {enrolling && !isEnrolled ? (
                    <>
                      <svg className="w-5 h-5 animate-spin text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      Authenticating...
                    </>
                  ) : isEnrolled ? (
                    <>
                      Go to Course Dashboard
                      <svg className="w-6 h-6 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </>
                  ) : (
                    <>
                      Proceed to Checkout
                      <svg className="w-6 h-6 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </>
                  )}
                </span>
              </button>
              
              <p className="text-center text-slate-500 text-[11px] font-bold tracking-[0.2em] uppercase mt-6 flex items-center justify-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Secure Environment
              </p>

            </div>
          </motion.div>

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: globalAnimations }} />
    </div>
  );
}