"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate, Variants } from "framer-motion";

// --- GLOBAL STYLES ---
const globalAnimations = `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }
`;

// --- Framer Motion Variants ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 250, damping: 25, mass: 0.5 } 
  }
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // States (Only for Form Logic, NO MOUSE TRACKING STATE)
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false); 

  // --- MOUSE PARALLAX TRACKING LOGIC (Optimized for 60FPS) ---
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glareX = useMotionValue(0);
  const glareY = useMotionValue(0);
  const isHovered = useMotionValue(0);
  
  const springConfig = { damping: 30, stiffness: 200, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springConfig);

  const backgroundTemplate = useMotionTemplate`radial-gradient(600px circle at ${glareX}px ${glareY}px, rgba(255,255,255,0.1), transparent 40%)`;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // 🛑 Disable 3D effect on mobile for smooth scrolling & battery saving
    if (window.innerWidth < 768 || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    glareX.set(e.clientX - rect.left);
    glareY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = () => { if (window.innerWidth >= 768) isHovered.set(1); };
  const handleMouseLeave = () => {
    isHovered.set(0);
    mouseX.set(0);
    mouseY.set(0);
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset link");
      }

      setSuccess(true);
      setEmail(""); 
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return <div className="min-h-screen bg-[#010206]"></div>;

  return (
    <main className="min-h-screen pt-24 pb-12 bg-[#010206] text-slate-50 flex items-center justify-center font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-hidden relative px-4 sm:px-6 lg:px-8 perspective-[2000px]">
      
      {/* GLOBAL BACKGROUND */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay pointer-events-none z-0"></div>

      {/* Deep Islamic Geometric Glow */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none transform-gpu">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-[80vw] sm:w-[600px] h-[80vw] sm:h-[600px] bg-emerald-900/20 rounded-full blur-[100px] sm:blur-[120px] mix-blend-screen will-change-transform"
        />
      </div>

      {/* Holographic Card */}
      <motion.div 
        initial="hidden" animate="visible" variants={fadeInUp}
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative z-10 w-full max-w-md bg-[#030612]/70 backdrop-blur-xl border border-white/[0.06] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-[0_32px_64px_-20px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.1)] transition-colors duration-700 hover:border-white/[0.12] my-8 will-change-transform"
      >
        
        {/* Dynamic Holographic Glare (GPU Optimized) */}
        <motion.div
          className="pointer-events-none absolute -inset-px z-0 mix-blend-color-dodge transition-opacity duration-300 rounded-[2rem] sm:rounded-[2.5rem]"
          style={{ opacity: isHovered, background: backgroundTemplate }}
        />

        <div className="relative z-10 w-full h-full transform-gpu" style={{ transform: "translateZ(20px)" }}>
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-[1rem] sm:rounded-[1.25rem] bg-gradient-to-br from-[#060d20] to-[#040814] border border-white/[0.08] mb-6 shadow-[0_8px_16px_rgba(0,0,0,0.4)] text-emerald-400">
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter drop-shadow-md">
              Reset Password
            </h2>
            <p className="text-[13px] sm:text-[14px] text-slate-400 mt-3 font-light leading-relaxed mix-blend-screen px-2">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>
          
          {/* Error Alert */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-red-500/10 text-red-400 p-4 rounded-[1rem] sm:rounded-[1.25rem] mb-6 text-sm border border-red-500/20">
              <span className="font-bold tracking-wide">{error}</span>
            </motion.div>
          )}

          {/* Success Alert */}
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-emerald-500/10 text-emerald-400 p-4 rounded-[1rem] sm:rounded-[1.25rem] mb-6 text-sm border border-emerald-500/20">
              <span className="font-bold tracking-wide">Check your email for the reset link!</span>
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[11px] sm:text-[13px] font-black tracking-widest text-slate-400 uppercase mb-3">Email Address</label>
              <div className="relative group">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="relative w-full px-5 py-4 sm:px-6 sm:py-4 bg-[#010206]/80 backdrop-blur-md border border-white/[0.06] rounded-[1rem] sm:rounded-[1.25rem] focus:bg-[#020510] focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all duration-300 text-slate-200 placeholder-slate-600 font-medium z-10 text-sm sm:text-base"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className={`group relative w-full flex justify-center items-center py-4 px-4 rounded-[1rem] sm:rounded-[1.25rem] text-[13px] sm:text-[15px] font-black uppercase tracking-[0.15em] sm:tracking-widest transition-all duration-500 overflow-hidden border border-white/10 ${
                loading ? 'bg-emerald-900/50 cursor-not-allowed text-slate-400' : 'text-[#010206] bg-gradient-to-b from-emerald-400 to-teal-500 sm:hover:scale-[1.03] shadow-[0_0_30px_-10px_rgba(52,211,153,0.5)] active:scale-95'
              }`}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out hidden sm:block"></div>
              <span className="relative z-10">
                {loading ? "Sending..." : "Send Reset Link"}
              </span>
            </button>
          </form>

          <p className="mt-8 text-center text-[12px] sm:text-[13px] font-medium text-slate-500">
            Remembered your password?{" "}
            <Link href="/login" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
              Log in here
            </Link>
          </p>
        </div>
      </motion.div>
      <style dangerouslySetInnerHTML={{ __html: globalAnimations }} />
    </main>
  );
}