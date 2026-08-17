"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate, Variants } from "framer-motion";

// --- GLOBAL STYLES ---
const globalAnimations = `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }
`;

// --- PRE-COMPUTED HYPER-DENSE PARTICLE ARRAY (60fps Optimized) ---
const generateBubbles = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: Math.random() * 15 + 5,
    xPos: Math.random() * 100,
    yPos: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 15,
    color: ['bg-blue-400', 'bg-indigo-400', 'bg-cyan-400', 'bg-emerald-400', 'bg-white'][Math.floor(Math.random() * 5)],
    opacity: Math.random() * 0.4 + 0.2,
    layer: Math.floor(Math.random() * 3)
  }));
};

const ambientBubbles = generateBubbles(25); // Reduced for mobile GPU safety

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
    price: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); 
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // --- MOUSE PARALLAX TRACKING LOGIC (60FPS Optimized) ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glareX = useMotionValue(0);
  const glareY = useMotionValue(0);
  const isHovered = useMotionValue(0);

  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const fgX = useTransform(smoothMouseX, (v) => v * 1.5);
  const fgY = useTransform(smoothMouseY, (v) => v * 1.5);
  const mgX = useTransform(smoothMouseX, (v) => v * 0.8);
  const mgY = useTransform(smoothMouseY, (v) => v * 0.8);
  const bgX = useTransform(smoothMouseX, (v) => v * 0.3);
  const bgY = useTransform(smoothMouseY, (v) => v * 0.3);

  // Holographic Card Config
  const cardRef = useRef<HTMLDivElement>(null);
  const cardSpringConfig = { damping: 30, stiffness: 200, mass: 0.5 };
  const rotateX = useSpring(useTransform(smoothMouseY, [-50, 50], [4, -4]), cardSpringConfig);
  const rotateY = useSpring(useTransform(smoothMouseX, [-50, 50], [-4, 4]), cardSpringConfig);

  const backgroundTemplate = useMotionTemplate`radial-gradient(800px circle at ${glareX}px ${glareY}px, rgba(255,255,255,0.15), transparent 40%)`;

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
          price: data.price || 0,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setTimeout(() => setFetching(false), 600); // Cinematic delay
      }
    };

    fetchCourse();

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return; // Disable heavy mouse tracking on mobile
      const x = (e.clientX / window.innerWidth - 0.5) * 100;
      const y = (e.clientY / window.innerHeight - 0.5) * 100;
      mouseX.set(x);
      mouseY.set(y);
    };
    
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [id, mouseX, mouseY]);

  // Local tracking specifically for the glare effect on the card
  const handleMouseMoveCard = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768 || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    glareX.set(e.clientX - rect.left);
    glareY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = () => { if (window.innerWidth >= 768) isHovered.set(1); };
  const handleMouseLeave = () => { isHovered.set(0); };

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
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ ...formData, price: formData.price ? Number(formData.price) : 0 }), 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update course");
      }

      setSuccess(true);
      setTimeout(() => router.push(`/courses/${id}`), 2000); 

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
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -30, transition: { duration: 0.3, ease: "easeIn" } }
  };

  if (fetching || !mounted) return (
    <div className="min-h-screen bg-[#010206] flex flex-col items-center justify-center relative perspective-[2000px] overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-800/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
      <div className="w-16 h-16 border-4 border-slate-800/80 border-t-blue-400 rounded-full animate-spin mb-6 z-10 shadow-[0_0_30px_rgba(59,130,246,0.5)]"></div>
      <p className="text-blue-400 font-bold tracking-[0.2em] uppercase text-sm z-10">Loading Course Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 sm:pt-32 pb-12 bg-[#010206] text-slate-50 flex items-center justify-center font-sans selection:bg-blue-500/30 selection:text-blue-200 overflow-hidden relative px-4 sm:px-6 lg:px-8 perspective-[2000px]">
      
      {/* Backgrounds */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay pointer-events-none z-0"></div>

      <div className="hidden md:block fixed inset-0 z-[5] pointer-events-none overflow-hidden">
        <motion.div style={{ x: fgX, y: fgY }} className="absolute inset-0 will-change-transform">
          {ambientBubbles.filter(b => b.layer === 0).map((p, i) => (
            <motion.div
              key={`fg-${i}`}
              className={`absolute rounded-full ${p.color}`}
              style={{ width: p.size, height: p.size, left: `${p.xPos}%`, top: `${p.yPos}%`, opacity: p.opacity, boxShadow: `0 0 ${p.size * 2}px currentColor` }}
              animate={{ y: [0, -40, 0], x: [0, 20, -10, 0] }}
              transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
            />
          ))}
        </motion.div>
        <motion.div style={{ x: mgX, y: mgY }} className="absolute inset-0 will-change-transform">
           {ambientBubbles.filter(b => b.layer === 1).map((p, i) => (
            <motion.div
              key={`mg-${i}`}
              className={`absolute rounded-full ${p.color}`}
              style={{ width: p.size * 0.8, height: p.size * 0.8, left: `${p.xPos}%`, top: `${p.yPos}%`, opacity: p.opacity * 0.7, boxShadow: `0 0 ${p.size * 1.5}px currentColor` }}
              animate={{ y: [0, -30, 0], x: [0, -15, 10, 0] }}
              transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
            />
          ))}
        </motion.div>
        <motion.div style={{ x: bgX, y: bgY }} className="absolute inset-0 will-change-transform">
          {ambientBubbles.filter(b => b.layer === 2).map((p, i) => (
            <motion.div
              key={`bg-${i}`}
              className={`absolute rounded-full ${p.color}`}
              style={{ width: p.size * 1.5, height: p.size * 1.5, left: `${p.xPos}%`, top: `${p.yPos}%`, opacity: p.opacity * 0.4, boxShadow: `0 0 ${p.size}px currentColor` }}
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay }}
            />
          ))}
        </motion.div>
      </div>

      <div className="max-w-3xl w-full mx-auto relative z-10 py-6 sm:py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8 sm:mb-10 text-center">
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/[0.02] border border-blue-500/30 shadow-[inset_0_1px_1px_rgba(59,130,246,0.2),0_4px_12px_rgba(0,0,0,0.2)] mb-4 sm:mb-6 backdrop-blur-xl">
            <span className="flex h-2 sm:h-2.5 w-2 sm:w-2.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_10px_rgba(59,130,246,1)]"></span>
            <span className="text-[9px] sm:text-[11px] font-black text-blue-300 tracking-[0.2em] sm:tracking-[0.3em] uppercase">Edit Mode</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter mb-3 sm:mb-4 drop-shadow-md">Update Curriculum</h2>
          <p className="text-slate-400 font-light text-[14px] sm:text-[17px] mix-blend-screen px-2">Make changes to your existing course details.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
          ref={cardRef} onMouseMove={handleMouseMoveCard} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative bg-[#030612]/70 backdrop-blur-[40px] border border-white/[0.06] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] will-change-transform"
        >
          <motion.div
            className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 z-0 mix-blend-color-dodge rounded-[2rem] sm:rounded-[2.5rem]"
            style={{ opacity: isHovered, background: backgroundTemplate }}
          />

          <div className="relative z-10 w-full h-full transform-gpu" style={{ transform: "translateZ(20px)" }}>
            
            {/* Stepper */}
            <div className="mb-8 sm:mb-10">
              <div className="flex items-center justify-between relative px-2 sm:px-0">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/[0.05] rounded-full z-0"></div>
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full z-0 transition-all duration-500 ease-out"
                  style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
                ></div>
                
                {[1, 2, 3].map((s) => (
                  <div key={s} className="relative z-10 flex flex-col items-center gap-2 sm:gap-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center font-black text-[12px] sm:text-sm transition-all duration-500 shadow-xl ${
                      step >= s ? 'bg-[#020510] border-blue-400 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'bg-[#010206] border-white/[0.1] text-slate-500'
                    }`}>
                      {step > s ? <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : s}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 sm:mt-4 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-slate-500 px-1 sm:px-0">
                <span className={step >= 1 ? "text-blue-400" : ""}>Core Info</span>
                <span className={step >= 2 ? "text-blue-400" : ""}>Curriculum</span>
                <span className={step >= 3 ? "text-blue-400" : ""}>Publish</span>
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3 bg-red-500/10 text-red-400 p-4 rounded-[1rem] sm:rounded-[1.25rem] mb-6 sm:mb-8 text-xs sm:text-sm font-bold border border-red-500/20 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(239,68,68,0.2)]">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3 bg-blue-500/10 text-blue-400 p-4 rounded-[1rem] sm:rounded-[1.25rem] mb-6 sm:mb-8 text-xs sm:text-sm font-bold border border-blue-500/30 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(59,130,246,0.2)]">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  <span>Course updated successfully! Redirecting...</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="space-y-6 sm:space-y-8 min-h-[250px] sm:min-h-[300px] flex flex-col justify-between">
              
              <AnimatePresence mode="wait">
                {/* STEP 1 */}
                {step === 1 && (
                  <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6 sm:space-y-8">
                    <div>
                      <label className="block text-[11px] sm:text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Course Title</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                          <svg className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <input 
                          type="text" name="title" value={formData.title} onChange={handleChange}
                          className="relative w-full pl-10 sm:pl-12 pr-4 py-3.5 sm:py-4 bg-[#010206]/80 backdrop-blur-md border border-white/[0.06] rounded-[1rem] sm:rounded-[1.25rem] focus:bg-[#020510] focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-300 text-slate-200 placeholder-slate-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] font-medium z-10 text-sm sm:text-base"
                          placeholder="e.g., Fundamentals of Tajweed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] sm:text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Course Price (₹) <span className="lowercase font-medium text-slate-500 tracking-normal">(Leave 0 for Free)</span></label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none z-10 text-slate-500 group-focus-within:text-blue-400 font-bold transition-colors duration-300">
                          ₹
                        </div>
                        <input 
                          type="number" name="price" min="0" value={formData.price} onChange={handleChange}
                          className="relative w-full pl-10 pr-4 py-3.5 sm:py-4 bg-[#010206]/80 backdrop-blur-md border border-white/[0.06] rounded-[1rem] sm:rounded-[1.25rem] focus:bg-[#020510] focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-300 text-slate-200 placeholder-slate-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] font-medium z-10 text-sm sm:text-base"
                          placeholder="e.g., 499"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] sm:text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Skill Level</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                          <svg className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <select 
                          name="level" value={formData.level} onChange={handleChange}
                          className="relative w-full pl-10 sm:pl-12 pr-10 py-3.5 sm:py-4 appearance-none bg-[#010206]/80 backdrop-blur-md border border-white/[0.06] rounded-[1rem] sm:rounded-[1.25rem] focus:bg-[#020510] focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-300 text-slate-200 cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] font-bold z-10 text-sm sm:text-base"
                        >
                          <option value="Beginner" className="bg-[#040814]">Beginner</option>
                          <option value="Intermediate" className="bg-[#040814]">Intermediate</option>
                          <option value="Advanced" className="bg-[#040814]">Advanced</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none z-20">
                          <svg className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6 sm:space-y-8 h-full">
                    <div className="h-full flex flex-col">
                      <label className="block text-[11px] sm:text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Course Overview & Curriculum</label>
                      <div className="relative group flex-1">
                        <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none z-10">
                          <svg className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h7" />
                          </svg>
                        </div>
                        <textarea 
                          name="description" value={formData.description} onChange={handleChange} 
                          className="relative w-full h-full min-h-[150px] sm:min-h-[200px] pl-10 sm:pl-12 pr-4 py-3.5 sm:py-4 bg-[#010206]/80 backdrop-blur-md border border-white/[0.06] rounded-[1rem] sm:rounded-[1.25rem] focus:bg-[#020510] focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-300 text-slate-200 placeholder-slate-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] font-medium custom-scrollbar resize-none z-10 text-sm sm:text-base"
                          placeholder="Provide a comprehensive overview of what the students will learn in this course..."
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                    <div>
                      <label className="block text-[11px] sm:text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Thumbnail Image URL</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                          <svg className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input 
                          type="url" name="thumbnail" value={formData.thumbnail} onChange={handleChange} 
                          className="relative w-full pl-10 sm:pl-12 pr-4 py-3.5 sm:py-4 bg-[#010206]/80 backdrop-blur-md border border-white/[0.06] rounded-[1rem] sm:rounded-[1.25rem] focus:bg-[#020510] focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-300 text-slate-200 placeholder-slate-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] font-medium z-10 text-sm sm:text-base"
                          placeholder="https://example.com/cover.jpg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] sm:text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Course Promo Video URL <span className="lowercase font-medium tracking-normal">(Optional)</span></label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                          <svg className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <input 
                          type="url" name="promoVideo" value={formData.promoVideo} onChange={handleChange} 
                          className="relative w-full pl-10 sm:pl-12 pr-4 py-3.5 sm:py-4 bg-[#010206]/80 backdrop-blur-md border border-white/[0.06] rounded-[1rem] sm:rounded-[1.25rem] focus:bg-[#020510] focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-300 text-slate-200 placeholder-slate-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] font-medium z-10 text-sm sm:text-base"
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* NAVIGATION */}
              <div className="pt-6 sm:pt-8 flex items-center justify-between border-t border-white/[0.05] mt-auto">
                <button type="button" onClick={handlePrev} className={`px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-[11px] sm:text-[13px] font-black uppercase tracking-widest transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05]'}`}>Back</button>
                {step < totalSteps ? (
                  <button type="button" onClick={handleNext} className="group px-8 sm:px-10 py-3.5 sm:py-4 bg-white text-slate-950 text-[11px] sm:text-[13px] font-black uppercase tracking-widest rounded-full transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] active:scale-95 flex items-center gap-2">
                    Next Step
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleSubmit} 
                    disabled={loading} 
                    className={`group relative px-6 sm:px-10 py-3.5 sm:py-4 rounded-full text-[11px] sm:text-[13px] font-black uppercase tracking-widest transition-all duration-500 overflow-hidden flex items-center gap-2 sm:gap-3 ${
                      loading 
                        ? 'bg-blue-900/50 cursor-not-allowed text-slate-400 border border-blue-900/50' 
                        : 'text-white bg-gradient-to-b from-blue-400 to-indigo-500 hover:scale-[1.03] shadow-[0_0_30px_-5px_rgba(59,130,246,0.6),inset_0_1px_1px_rgba(255,255,255,0.8)] ring-1 ring-white/20 active:scale-95'
                    }`}
                  >
                    {!loading && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out hidden sm:block"></div>}
                    <span className="relative z-10 flex items-center gap-2">
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </>
                      ) : (
                        <>
                          Save Changes
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        </>
                      )}
                    </span>
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