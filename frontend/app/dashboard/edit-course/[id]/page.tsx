"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, Variants } from "framer-motion";

// --- GLOBAL STYLES ---
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

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [mounted, setMounted] = useState(false);
  
  // Step Wizard State
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    level: "Beginner",
    thumbnail: "",
    promoVideo: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); // To show loading while getting existing data
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Parallax logic
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

  const cardRef = useRef<HTMLDivElement>(null);
  const cardSpringConfig = { damping: 40, stiffness: 250, mass: 0.5 };
  const rotateX = useSpring(useTransform(smoothMouseY, [-50, 50], [4, -4]), cardSpringConfig);
  const rotateY = useSpring(useTransform(smoothMouseX, [-50, 50], [-4, 4]), cardSpringConfig);
  const [isHovered, setIsHovered] = useState(false);
  const [glarePosition, setGlarePosition] = useState({ x: 0, y: 0 });

  // 👇 FETCH EXISTING COURSE DATA
  useEffect(() => {
    setMounted(true);

    if (!id) return;

    const fetchCourse = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load course details");
        }

        setFormData({
          title: data.title || "",
          description: data.description || "",
          level: data.level || "Beginner",
          thumbnail: data.thumbnail || "",
          promoVideo: data.promoVideo || "",
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setFetching(false);
      }
    };

    fetchCourse();

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 100;
      const y = (e.clientY / window.innerHeight - 0.5) * 100;
      mouseX.set(x);
      mouseY.set(y);

      if (cardRef.current && isHovered) {
        const rect = cardRef.current.getBoundingClientRect();
        setGlarePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    };
    
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [id, mouseX, mouseY, isHovered]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); 
  };

  const handleNext = () => {
    if (step === 1 && !formData.title.trim()) {
      setError("Please provide a Course Title.");
      return;
    }
    if (step === 2 && !formData.description.trim()) {
      setError("Please provide a Description.");
      return;
    }
    setError("");
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handlePrev = () => {
    setError("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // 👇 SUBMIT UPDATED DATA (PUT Request)
  const handleSubmit = async () => {
    if (step !== totalSteps) return; 
    
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${id}`, {
        method: "PUT", // 👈 IMPORTANT: UPDATE karne ke liye PUT
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(formData), 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update course");
      }

      setSuccess(true);
      setTimeout(() => router.push(`/courses/${id}`), 2000); // Wapas ussi course par bhej do

    } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("Network Error: Could not update curriculum");
        }
    } finally {
      setLoading(false);
    }
  };

  const stepVariants: Variants = {
    hidden: { opacity: 0, x: 40, filter: "blur(10px)" },
    visible: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -40, filter: "blur(10px)", transition: { duration: 0.3, ease: "easeIn" } }
  };

  if (fetching) return (
    <div className="min-h-screen bg-[#010206] flex flex-col items-center justify-center relative perspective-[2000px] overflow-hidden">
      <div className="w-16 h-16 border-4 border-slate-800/80 border-t-emerald-400 rounded-full animate-spin mb-6 z-10"></div>
      <p className="text-emerald-400 font-bold tracking-[0.2em] uppercase text-sm z-10">Loading Course Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#010206] text-slate-50 flex items-center justify-center font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-hidden relative px-4 sm:px-6 lg:px-8 perspective-[2000px]">
      
      {/* Backgrounds */}
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
        </div>
      )}

      <div className="max-w-3xl w-full mx-auto relative z-10 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.02] border border-blue-500/30 shadow-[inset_0_1px_1px_rgba(59,130,246,0.2),0_4px_12px_rgba(0,0,0,0.2)] mb-6 backdrop-blur-xl">
            <span className="flex h-2.5 w-2.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_10px_rgba(59,130,246,1)]"></span>
            <span className="text-[11px] font-black text-blue-300 tracking-[0.3em] uppercase">Edit Mode</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 drop-shadow-md">Update Curriculum</h2>
          <p className="text-slate-400 font-light text-[17px] mix-blend-screen">Make changes to your existing course details.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
          ref={cardRef} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative bg-[#030612]/70 backdrop-blur-[40px] border border-white/[0.06] rounded-[2.5rem] p-8 md:p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]"
        >
          <div
            className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 z-0 mix-blend-color-dodge rounded-[2.5rem]"
            style={{
              opacity: isHovered ? 1 : 0,
              background: `radial-gradient(800px circle at ${glarePosition.x}px ${glarePosition.y}px, rgba(255,255,255,0.15), transparent 40%)`,
            }}
          />

          <div className="relative z-10 w-full h-full transform-gpu" style={{ transform: "translateZ(20px)" }}>
            
            {/* Stepper */}
            <div className="mb-10">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/[0.05] rounded-full z-0"></div>
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full z-0 transition-all duration-500 ease-out"
                  style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
                ></div>
                
                {[1, 2, 3].map((s) => (
                  <div key={s} className="relative z-10 flex flex-col items-center gap-3">
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-black text-sm transition-all duration-500 shadow-xl ${
                      step >= s ? 'bg-[#020510] border-blue-400 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'bg-[#010206] border-white/[0.1] text-slate-500'
                    }`}>
                      {step > s ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : s}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3 bg-red-500/10 text-red-400 p-4 rounded-[1.25rem] mb-8 text-sm font-bold border border-red-500/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3 bg-blue-500/10 text-blue-400 p-4 rounded-[1.25rem] mb-8 text-sm font-bold border border-blue-500/30">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  <span>Course updated successfully! Redirecting...</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="space-y-8 min-h-[300px] flex flex-col justify-between">
              
              <AnimatePresence mode="wait">
                {/* STEP 1 */}
                {step === 1 && (
                  <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                    <div>
                      <label className="block text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Course Title</label>
                      <input 
                        type="text" name="title" value={formData.title} onChange={handleChange}
                        className="w-full px-6 py-4 bg-[#010206]/80 border border-white/[0.06] rounded-[1.25rem] focus:border-blue-500/50 outline-none text-slate-200 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Skill Level</label>
                      <select 
                        name="level" value={formData.level} onChange={handleChange}
                        className="w-full px-6 py-4 bg-[#010206]/80 border border-white/[0.06] rounded-[1.25rem] focus:border-blue-500/50 outline-none text-slate-200 font-bold"
                      >
                        <option value="Beginner" className="bg-[#040814]">Beginner</option>
                        <option value="Intermediate" className="bg-[#040814]">Intermediate</option>
                        <option value="Advanced" className="bg-[#040814]">Advanced</option>
                      </select>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8 h-full">
                    <div className="h-full flex flex-col">
                      <label className="block text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Description</label>
                      <textarea 
                        name="description" value={formData.description} onChange={handleChange} 
                        className="w-full h-full min-h-[200px] px-6 py-4 bg-[#010206]/80 border border-white/[0.06] rounded-[1.25rem] focus:border-blue-500/50 outline-none text-slate-200 font-medium resize-none custom-scrollbar"
                      />
                    </div>
                  </motion.div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                    <div>
                      <label className="block text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Thumbnail URL</label>
                      <input 
                        type="url" name="thumbnail" value={formData.thumbnail} onChange={handleChange} 
                        className="w-full px-6 py-4 bg-[#010206]/80 border border-white/[0.06] rounded-[1.25rem] focus:border-blue-500/50 outline-none text-slate-200 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Promo Video URL</label>
                      <input 
                        type="url" name="promoVideo" value={formData.promoVideo} onChange={handleChange} 
                        className="w-full px-6 py-4 bg-[#010206]/80 border border-white/[0.06] rounded-[1.25rem] focus:border-blue-500/50 outline-none text-slate-200 font-medium"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* NAVIGATION */}
              <div className="pt-6 flex items-center justify-between border-t border-white/[0.05] mt-auto">
                <button type="button" onClick={handlePrev} className={`px-8 py-4 rounded-full text-[13px] font-black uppercase ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-white bg-white/[0.05]'}`}>Back</button>
                {step < totalSteps ? (
                  <button type="button" onClick={handleNext} className="px-10 py-4 bg-white text-slate-950 text-[13px] font-black uppercase rounded-full flex gap-2">Next Step</button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={loading} className="px-10 py-4 bg-gradient-to-b from-blue-400 to-indigo-500 text-white text-[13px] font-black uppercase rounded-full flex gap-2">
                    {loading ? "Updating..." : "Save Changes"}
                  </button>
                )}
              </div>

            </div>
          </div>
        </motion.div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: globalAnimations }} />
    </div>
  );
}