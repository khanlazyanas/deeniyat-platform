"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
    color: ['bg-emerald-400', 'bg-teal-400', 'bg-blue-400', 'bg-purple-400', 'bg-amber-400', 'bg-white'][Math.floor(Math.random() * 6)],
    opacity: Math.random() * 0.4 + 0.2,
    layer: Math.floor(Math.random() * 3)
  }));
};

const ambientBubbles = generateBubbles(25); // Reduced from 45 to 25 for mobile GPU safety

export default function CreateCoursePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // 👇 Step Wizard State
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    level: "Beginner",
    thumbnail: "",
    promoVideo: "", 
    price: "",
    gstPercentage: "", // 👈 NEW: Added Custom GST field
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState("");

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

  useEffect(() => {
    setMounted(true);
    
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        const user = JSON.parse(storedUser);
        setUserId(user._id || user.id); 
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return; // Disable heavy mouse tracking on mobile
      const x = (e.clientX / window.innerWidth - 0.5) * 100;
      const y = (e.clientY / window.innerHeight - 0.5) * 100;
      mouseX.set(x);
      mouseY.set(y);
    };
    
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [mouseX, mouseY]);

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

  // 👇 Validation Logic for Steps
  const handleNext = () => {
    if (step === 1 && !formData.title.trim()) {
      setError("Please provide a Course Title before proceeding.");
      return;
    }
    if (step === 2 && !formData.description.trim()) {
      setError("Please provide a Description for your course.");
      return;
    }
    setError("");
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handlePrev = () => {
    setError("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (step !== totalSteps) return; // Guard
    
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        // 👇 FIX: Sending custom price AND custom GST percentage
        body: JSON.stringify({ 
          ...formData, 
          price: formData.price ? Number(formData.price) : 0, 
          gstPercentage: formData.gstPercentage ? Number(formData.gstPercentage) : 0,
          teacherId: userId 
        }), 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create course");
      }

      setSuccess(true);
      setTimeout(() => router.push("/dashboard/my-courses"), 2000); 

    } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("Network Error: Could not publish curriculum");
        }
    } finally {
      setLoading(false);
    }
  };

  // Variants for step animation (Optimized)
  const stepVariants: Variants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -30, transition: { duration: 0.3, ease: "easeIn" } }
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-32 pb-12 bg-[#010206] text-slate-50 flex items-center justify-center font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-hidden relative px-4 sm:px-6 lg:px-8 perspective-[2000px]">
      
      {/* GLOBAL BACKGROUND */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay pointer-events-none z-0"></div>

      {/* --- HYPER-DENSE 3D PARTICLES ENGINE (Optimized) --- */}
      {mounted && (
        <div className="hidden md:block fixed inset-0 z-[5] pointer-events-none overflow-hidden">
          <motion.div style={{ x: fgX, y: fgY }} className="absolute inset-0 will-change-transform">
            {ambientBubbles.filter(b => b.layer === 0).map((p, i) => (
              <motion.div
                key={`fg-${i}`}
                className={`absolute rounded-full ${p.color}`}
                style={{
                  width: p.size, height: p.size, left: `${p.xPos}%`, top: `${p.yPos}%`,
                  opacity: p.opacity,
                  boxShadow: `0 0 ${p.size * 2}px currentColor`
                }}
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
                style={{
                  width: p.size * 0.8, height: p.size * 0.8, left: `${p.xPos}%`, top: `${p.yPos}%`,
                  opacity: p.opacity * 0.7,
                  boxShadow: `0 0 ${p.size * 1.5}px currentColor`
                }}
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
                style={{
                  width: p.size * 1.5, height: p.size * 1.5, left: `${p.xPos}%`, top: `${p.yPos}%`,
                  opacity: p.opacity * 0.4,
                  boxShadow: `0 0 ${p.size}px currentColor`
                }}
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay }}
              />
            ))}
          </motion.div>
        </div>
      )}

      {/* Ambient Background Glows */}
      <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-[pulse_10s_ease-in-out_infinite] hidden sm:block"></div>
      <div className="absolute bottom-[10%] left-[10%] w-[600px] h-[600px] bg-teal-900/10 rounded-full blur-[140px] pointer-events-none mix-blend-screen animate-[pulse_15s_ease-in-out_infinite_reverse] hidden sm:block"></div>

      <div className="max-w-3xl w-full mx-auto relative z-10 py-6 sm:py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/[0.02] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)] mb-4 sm:mb-6 backdrop-blur-xl">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_10px_rgba(245,158,11,0.8)]"></span>
            <span className="text-[10px] sm:text-[11px] font-black text-slate-300 tracking-[0.3em] uppercase">Ustad Portal</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter mb-3 sm:mb-4 drop-shadow-md">Create Curriculum</h2>
          <p className="text-slate-400 font-light text-[14px] sm:text-[17px] mix-blend-screen px-2">Design and publish a new structural course in 3 easy steps.</p>
        </motion.div>

        {/* 3D Holographic Card - Optimized */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
          ref={cardRef}
          onMouseMove={handleMouseMoveCard}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative bg-[#030612]/70 backdrop-blur-xl backdrop-saturate-[150%] border border-white/[0.06] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.5)] transition-colors duration-700 hover:border-white/[0.12] will-change-transform"
        >
          {/* Dynamic Holographic Glare */}
          <motion.div
            className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 z-0 mix-blend-color-dodge rounded-[2rem] sm:rounded-[2.5rem]"
            style={{ opacity: isHovered, background: backgroundTemplate }}
          />

          <div className="relative z-10 w-full h-full transform-gpu" style={{ transform: "translateZ(20px)" }}>
            
            {/* 👇 STEPPER UI */}
            <div className="mb-8 sm:mb-10">
              <div className="flex items-center justify-between relative px-2 sm:px-0">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/[0.05] rounded-full z-0"></div>
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full z-0 transition-all duration-500 ease-out"
                  style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
                ></div>
                
                {[1, 2, 3].map((s) => (
                  <div key={s} className="relative z-10 flex flex-col items-center gap-2 sm:gap-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center font-black text-[12px] sm:text-sm transition-all duration-500 shadow-xl ${
                      step >= s 
                        ? 'bg-[#020510] border-emerald-400 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]' 
                        : 'bg-[#010206] border-white/[0.1] text-slate-500'
                    }`}>
                      {step > s ? <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : s}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 sm:mt-4 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-slate-500 px-1 sm:px-0">
                <span className={step >= 1 ? "text-emerald-400" : ""}>Core Info</span>
                <span className={step >= 2 ? "text-emerald-400" : ""}>Curriculum</span>
                <span className={step >= 3 ? "text-emerald-400" : ""}>Publish</span>
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-3 bg-red-500/10 text-red-400 p-4 rounded-[1rem] sm:rounded-[1.25rem] mb-6 sm:mb-8 text-xs sm:text-sm font-bold tracking-wide border border-red-500/20 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(239,68,68,0.2)]"
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{error}</span>
                </motion.div>
              )}
              
              {success && (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-3 bg-emerald-500/10 text-emerald-400 p-4 rounded-[1rem] sm:rounded-[1.25rem] mb-6 sm:mb-8 text-xs sm:text-sm font-bold tracking-wide border border-emerald-500/30 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(52,211,153,0.2)]"
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  <span>Curriculum published successfully! Redirecting...</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="space-y-6 sm:space-y-8 min-h-[250px] sm:min-h-[300px] flex flex-col justify-between">
              
              <AnimatePresence mode="wait">
                {/* 👇 STEP 1: Basic Info */}
                {step === 1 && (
                  <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6 sm:space-y-8">
                    <div>
                      <label className="block text-[11px] sm:text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Course Title</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                          <svg className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <input 
                          type="text" name="title" value={formData.title} onChange={handleChange}
                          className="relative w-full pl-10 sm:pl-12 pr-4 py-3.5 sm:py-4 bg-[#010206]/80 backdrop-blur-md border border-white/[0.06] rounded-[1rem] sm:rounded-[1.25rem] focus:bg-[#020510] focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all duration-300 text-slate-200 placeholder-slate-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] font-medium z-10 text-sm sm:text-base"
                          placeholder="e.g., Fundamentals of Tajweed"
                        />
                      </div>
                    </div>

                    {/* 👇 ADDED: Custom GST and Price Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        <div>
                        <label className="block text-[11px] sm:text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Course Price (₹) <span className="lowercase font-medium text-slate-500 tracking-normal">(Leave 0 for Free)</span></label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none z-10 text-slate-500 group-focus-within:text-emerald-400 font-bold transition-colors duration-300">
                            ₹
                            </div>
                            <input 
                            type="number" name="price" min="0" value={formData.price} onChange={handleChange}
                            className="relative w-full pl-10 sm:pl-10 pr-4 py-3.5 sm:py-4 bg-[#010206]/80 backdrop-blur-md border border-white/[0.06] rounded-[1rem] sm:rounded-[1.25rem] focus:bg-[#020510] focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all duration-300 text-slate-200 placeholder-slate-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] font-medium z-10 text-sm sm:text-base"
                            placeholder="e.g., 499"
                            />
                        </div>
                        </div>

                        <div>
                        <label className="block text-[11px] sm:text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">GST Percentage (%) <span className="lowercase font-medium text-slate-500 tracking-normal">(Leave 0 for Nil)</span></label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none z-10 text-slate-500 group-focus-within:text-emerald-400 font-bold transition-colors duration-300">
                            %
                            </div>
                            <input 
                            type="number" name="gstPercentage" min="0" max="100" value={formData.gstPercentage} onChange={handleChange}
                            className="relative w-full pl-10 sm:pl-10 pr-4 py-3.5 sm:py-4 bg-[#010206]/80 backdrop-blur-md border border-white/[0.06] rounded-[1rem] sm:rounded-[1.25rem] focus:bg-[#020510] focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all duration-300 text-slate-200 placeholder-slate-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] font-medium z-10 text-sm sm:text-base"
                            placeholder="e.g., 18"
                            />
                        </div>
                        </div>
                    </div>

                    <div>
                      <label className="block text-[11px] sm:text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Skill Level</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                          <svg className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <select 
                          name="level" value={formData.level} onChange={handleChange}
                          className="relative w-full pl-10 sm:pl-12 pr-10 py-3.5 sm:py-4 appearance-none bg-[#010206]/80 backdrop-blur-md border border-white/[0.06] rounded-[1rem] sm:rounded-[1.25rem] focus:bg-[#020510] focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all duration-300 text-slate-200 cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] font-bold z-10 text-sm sm:text-base"
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

                {/* 👇 STEP 2: Description */}
                {step === 2 && (
                  <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6 sm:space-y-8 h-full">
                    <div className="h-full flex flex-col">
                      <label className="block text-[11px] sm:text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Course Overview & Curriculum</label>
                      <div className="relative group flex-1">
                        <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none z-10">
                          <svg className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h7" />
                          </svg>
                        </div>
                        <textarea 
                          name="description" value={formData.description} onChange={handleChange} 
                          className="relative w-full h-full min-h-[150px] sm:min-h-[200px] pl-10 sm:pl-12 pr-4 py-3.5 sm:py-4 bg-[#010206]/80 backdrop-blur-md border border-white/[0.06] rounded-[1rem] sm:rounded-[1.25rem] focus:bg-[#020510] focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all duration-300 text-slate-200 placeholder-slate-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] font-medium custom-scrollbar resize-none z-10 text-sm sm:text-base"
                          placeholder="Provide a comprehensive overview of what the students will learn in this course..."
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 👇 STEP 3: Media & Publish */}
                {step === 3 && (
                  <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                    {/* Thumbnail URL */}
                    <div>
                      <label className="block text-[11px] sm:text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Thumbnail Image URL</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                          <svg className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input 
                          type="url" name="thumbnail" value={formData.thumbnail} onChange={handleChange} 
                          className="relative w-full pl-10 sm:pl-12 pr-4 py-3.5 sm:py-4 bg-[#010206]/80 backdrop-blur-md border border-white/[0.06] rounded-[1rem] sm:rounded-[1.25rem] focus:bg-[#020510] focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all duration-300 text-slate-200 placeholder-slate-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] font-medium z-10 text-sm sm:text-base"
                          placeholder="https://example.com/cover.jpg"
                        />
                      </div>
                    </div>

                    {/* Promo Video URL */}
                    <div>
                      <label className="block text-[11px] sm:text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Course Promo Video URL <span className="lowercase font-medium tracking-normal">(Optional)</span></label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                          <svg className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <input 
                          type="url" name="promoVideo" value={formData.promoVideo} onChange={handleChange} 
                          className="relative w-full pl-10 sm:pl-12 pr-4 py-3.5 sm:py-4 bg-[#010206]/80 backdrop-blur-md border border-white/[0.06] rounded-[1rem] sm:rounded-[1.25rem] focus:bg-[#020510] focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all duration-300 text-slate-200 placeholder-slate-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] font-medium z-10 text-sm sm:text-base"
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>
                    </div>

                    {/* UI Notice */}
                    <div className="bg-blue-500/10 border border-blue-500/20 p-3 sm:p-4 rounded-xl flex items-start sm:items-center gap-3 text-blue-400 text-xs sm:text-sm font-medium mt-4 sm:mt-6 shadow-[inset_0_1px_2px_rgba(59,130,246,0.1)]">
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5 sm:mt-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p>Note: This creates the Course Shell. You can upload <strong>unlimited lesson videos</strong> and PDFs from the "Add Lesson" page after publishing.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 👇 NAVIGATION BUTTONS */}
              <div className="pt-6 sm:pt-8 flex items-center justify-between border-t border-white/[0.05] mt-auto">
                <button 
                  type="button" 
                  onClick={handlePrev}
                  className={`px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-[11px] sm:text-[13px] font-black uppercase tracking-widest transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05]'}`}
                >
                  Back
                </button>

                {step < totalSteps ? (
                  <button 
                    type="button" 
                    onClick={handleNext}
                    className="group px-8 sm:px-10 py-3.5 sm:py-4 bg-white text-slate-950 text-[11px] sm:text-[13px] font-black uppercase tracking-widest rounded-full transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] active:scale-95 flex items-center gap-2"
                  >
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
                        ? 'bg-emerald-900/50 cursor-not-allowed text-slate-400 border border-emerald-900/50' 
                        : 'text-[#010206] bg-gradient-to-b from-emerald-400 to-teal-500 hover:scale-[1.03] shadow-[0_0_30px_-5px_rgba(52,211,153,0.6),inset_0_1px_1px_rgba(255,255,255,0.8)] ring-1 ring-white/20 active:scale-95'
                    }`}
                  >
                    {!loading && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out hidden sm:block"></div>}
                    <span className="relative z-10 flex items-center gap-2">
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Publishing...
                        </>
                      ) : (
                        <>
                          Publish Course
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