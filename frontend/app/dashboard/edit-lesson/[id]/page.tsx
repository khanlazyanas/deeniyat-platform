"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Course {
  _id: string;
  title: string;
}

// --- GLOBAL STYLES ---
const globalAnimations = `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }
`;

// --- PARTICLES ---
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

const ambientBubbles = generateBubbles(25);

export default function EditLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const lessonId = unwrappedParams.id;

  const [mounted, setMounted] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    content: "",
    videoUrl: "",
    order: "",
  });

  // Parallax Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const fgX = useTransform(smoothMouseX, (v) => v * 1.5);
  const fgY = useTransform(smoothMouseY, (v) => v * 1.5);
  const mgX = useTransform(smoothMouseX, (v) => v * 0.8);
  const mgY = useTransform(smoothMouseY, (v) => v * 0.8);

  const cardRef = useRef<HTMLFormElement>(null);
  const cardSpringConfig = { damping: 40, stiffness: 250, mass: 0.5 };
  const rotateX = useSpring(useTransform(smoothMouseY, [-50, 50], [4, -4]), cardSpringConfig);
  const rotateY = useSpring(useTransform(smoothMouseX, [-50, 50], [-4, 4]), cardSpringConfig);

  useEffect(() => {
    setMounted(true);

    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("token");
        // Fetch Courses
        const coursesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`);
        const coursesData = await coursesRes.json();
        if (coursesRes.ok) setCourses(Array.isArray(coursesData) ? coursesData : []);

        // Fetch Specific Lesson Data
        const lessonRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lessons/${lessonId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const lessonData = await lessonRes.json();
        
        if (lessonRes.ok) {
          setFormData({
            courseId: lessonData.courseId || "",
            title: lessonData.title || "",
            content: lessonData.content || "",
            videoUrl: lessonData.videoUrl || "",
            order: lessonData.order || "",
          });
        } else {
          setMessage({ type: "error", text: "Failed to load module details." });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 100;
      const y = (e.clientY / window.innerHeight - 0.5) * 100;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [lessonId, mouseX, mouseY]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const payload = {
        ...formData,
        order: Number(formData.order) 
      };

      // 👇 FIX: Sending PUT request to UPDATE the lesson
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lessons/${lessonId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update module");
      }

      setMessage({ type: "success", text: "Module updated successfully! Redirecting..." });
      
      // Go back to the course player page
      setTimeout(() => router.push(`/dashboard/my-courses/${formData.courseId}`), 2000); 
      
    } catch (err: unknown) {
        if (err instanceof Error) {
            setMessage({ type: "error", text: err.message });
        }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !mounted) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-[#010206] flex flex-col items-center justify-center relative perspective-[2000px] overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse"></div>
        <div className="w-16 h-16 border-4 border-slate-800/80 border-t-blue-400 rounded-full animate-spin mb-6 z-10"></div>
        <p className="text-blue-400 font-bold tracking-[0.2em] uppercase text-sm z-10">Fetching Module Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#010206] text-slate-50 flex items-center justify-center font-sans selection:bg-blue-500/30 selection:text-blue-200 overflow-hidden relative px-4 sm:px-6 lg:px-8 perspective-[2000px]">
      
      {/* GLOBAL BACKGROUND */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>

      {/* 3D PARTICLES */}
      <div className="hidden md:block fixed inset-0 z-[5] pointer-events-none overflow-hidden">
        <motion.div style={{ x: fgX, y: fgY }} className="absolute inset-0 will-change-transform">
          {ambientBubbles.map((p, i) => (
            <motion.div
              key={`fg-${i}`} className={`absolute rounded-full ${p.color}`}
              style={{ width: p.size, height: p.size, left: `${p.xPos}%`, top: `${p.yPos}%`, filter: `blur(${p.blur}px)`, opacity: p.opacity }}
              animate={{ y: [0, -40, 0], x: [0, 20, -10, 0] }} transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
            />
          ))}
        </motion.div>
      </div>

      <div className="max-w-3xl w-full mx-auto relative z-10 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.02] border border-blue-500/30 shadow-[inset_0_1px_1px_rgba(59,130,246,0.2),0_4px_12px_rgba(0,0,0,0.2)] mb-6 backdrop-blur-xl">
            <span className="flex h-2.5 w-2.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.8)]"></span>
            <span className="text-[11px] font-black text-slate-300 tracking-[0.3em] uppercase">Edit Mode</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 drop-shadow-md">Update Module</h2>
          <p className="text-slate-400 font-light text-[17px] mix-blend-screen">Modify video links, notes, or chapter order.</p>
        </motion.div>

        <motion.form 
          onSubmit={handleSubmit} 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
          ref={cardRef} style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative bg-[#030612]/70 backdrop-blur-[40px] border border-white/[0.06] rounded-[2.5rem] p-8 md:p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] will-change-transform"
        >
          <div className="relative z-10 w-full h-full transform-gpu" style={{ transform: "translateZ(20px)" }}>
            
            <AnimatePresence>
              {message.text && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`mb-8 p-4 rounded-[1.25rem] text-[13px] font-bold tracking-wide border flex items-center gap-3 ${message.type === 'success' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
                >
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="space-y-8">
              {/* Course Selection */}
              <div>
                <label className="block text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Target Course</label>
                <select 
                  name="courseId" value={formData.courseId} onChange={handleChange} required
                  className="w-full pl-6 pr-12 py-4 bg-[#010206]/80 backdrop-blur-md border border-white/[0.06] rounded-[1.25rem] focus:border-blue-500/50 outline-none text-slate-200 font-bold"
                >
                  <option value="" disabled className="bg-[#040814] text-slate-500">-- Choose a course --</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id} className="bg-[#040814]">{course.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1">
                  <label className="block text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Index</label>
                  <input type="number" name="order" value={formData.order} onChange={handleChange} required min="1" className="w-full px-4 py-4 bg-[#010206]/80 border border-white/[0.06] rounded-[1.25rem] focus:border-blue-500/50 outline-none text-slate-200 font-medium text-center" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Module Title</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full px-6 py-4 bg-[#010206]/80 border border-white/[0.06] rounded-[1.25rem] focus:border-blue-500/50 outline-none text-slate-200 font-medium" />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Video URL (Optional)</label>
                <input type="url" name="videoUrl" value={formData.videoUrl} onChange={handleChange} className="w-full px-6 py-4 bg-[#010206]/80 border border-white/[0.06] rounded-[1.25rem] focus:border-blue-500/50 outline-none text-slate-200 font-medium" />
              </div>

              <div>
                <label className="block text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Study Material</label>
                <textarea name="content" value={formData.content} onChange={handleChange} required rows={6} className="w-full px-6 py-4 bg-[#010206]/80 border border-white/[0.06] rounded-[1.25rem] focus:border-blue-500/50 outline-none text-slate-200 font-medium custom-scrollbar resize-none" />
              </div>

              <div className="pt-6">
                <button type="submit" disabled={submitting} className="w-full sm:w-auto px-12 py-5 bg-gradient-to-b from-blue-400 to-indigo-500 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:scale-[1.03] active:scale-95 transition-all shadow-lg disabled:opacity-50">
                  {submitting ? "Saving..." : "Save Module Changes"}
                </button>
              </div>

            </div>
          </div>
        </motion.form>
      </div>
      <style dangerouslySetInnerHTML={{ __html: globalAnimations }} />
    </div>
  );
}