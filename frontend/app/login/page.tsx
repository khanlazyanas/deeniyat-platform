"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate, Variants } from "framer-motion";

// 👇 AUTH CONTEXT IMPORT
import { useAuth } from "../../context/AuthContext";

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

// --- PRE-COMPUTED HYPER-DENSE PARTICLE ARRAY ---
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

const ambientBubbles = generateBubbles(25); // Optimized for mobile GPU

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // 👇 AUTH CONTEXT SE LOGIN FUNCTION NIKALA
  const { login } = useAuth();
  
  // States (Form Data Only)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // --- MOUSE PARALLAX TRACKING LOGIC (60FPS Optimized) ---
  const cardRef = useRef<HTMLDivElement>(null);
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
  const cardSpringConfig = { damping: 30, stiffness: 200, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-50, 50], [6, -6]), cardSpringConfig);
  const rotateY = useSpring(useTransform(mouseX, [-50, 50], [-6, 6]), cardSpringConfig);

  const backgroundTemplate = useMotionTemplate`radial-gradient(800px circle at ${glareX}px ${glareY}px, rgba(255,255,255,0.1), transparent 45%)`;

  useEffect(() => {
    setMounted(true);
    
    // Global tracking for particles and card tilt
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;

      const x = (e.clientX / window.innerWidth - 0.5) * 100;
      const y = (e.clientY / window.innerHeight - 0.5) * 100;
      mouseX.set(x);
      mouseY.set(y);
    };
    
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [mouseX, mouseY]);

  // Local tracking specifically for the glare effect on the card
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768 || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    glareX.set(e.clientX - rect.left);
    glareY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = () => { if (window.innerWidth >= 768) isHovered.set(1); };
  const handleMouseLeave = () => {
    isHovered.set(0);
  };

  // Input Handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password");
      }

      const userData = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar || "",
        enrolledCourses: data.enrolledCourses || [] 
      };
      
      // 👇 LOCAL STORAGE HATA KAR SEEDHA CONTEXT USE KIYA
      login(userData, data.token);

      // Redirect securely to the God-Tier Dashboard
      router.push("/dashboard");
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return <div className="min-h-screen bg-[#010206]"></div>;

  return (
    <main className="min-h-screen pt-24 sm:pt-40 pb-12 bg-[#010206] text-slate-50 flex items-center justify-center font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-hidden relative px-4 sm:px-6 lg:px-8 perspective-[2000px]">
      
      {/* GLOBAL BACKGROUND */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay pointer-events-none z-0"></div>

      {/* --- HYPER-DENSE 3D PARTICLES ENGINE (Optimized) --- */}
      <div className="hidden md:block fixed inset-0 z-[5] pointer-events-none overflow-hidden">
        
        {/* Layer 0: Foreground */}
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

        {/* Layer 1: Midground */}
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

        {/* Layer 2: Background */}
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

      {/* Deep Islamic Geometric Glow (Background Effects) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none transform-gpu">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-[80vw] sm:w-[600px] h-[80vw] sm:h-[600px] bg-emerald-900/20 rounded-full blur-[100px] sm:blur-[120px] mix-blend-screen will-change-transform"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: 1 }}
          className="absolute w-[60vw] sm:w-[400px] h-[60vw] sm:h-[400px] bg-teal-900/10 rounded-full blur-[80px] sm:blur-[100px] mix-blend-screen translate-y-32 will-change-transform hidden sm:block"
        />
      </div>

      {/* Login Card (Holographic Glassmorphism) */}
      <motion.div 
        initial="hidden" animate="visible" variants={fadeInUp}
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative z-10 w-full max-w-md bg-[#030612]/70 backdrop-blur-xl backdrop-saturate-[150%] border border-white/[0.06] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-[0_32px_64px_-20px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.5)] transition-colors duration-700 hover:border-white/[0.12] will-change-transform my-8"
      >
        
        {/* Dynamic Holographic Glare (GPU Optimized) */}
        <motion.div
          className="pointer-events-none absolute -inset-px z-0 mix-blend-color-dodge transition-opacity duration-300 rounded-[2rem] sm:rounded-[2.5rem]"
          style={{ opacity: isHovered, background: backgroundTemplate }}
        />

        <div className="relative z-10 w-full h-full transform-gpu" style={{ transform: "translateZ(20px)" }}>
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-[1rem] sm:rounded-[1.25rem] bg-gradient-to-br from-[#060d20] to-[#040814] border border-white/[0.08] mb-6 shadow-[0_8px_16px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)] text-emerald-400">
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter drop-shadow-md">
              Welcome Back
            </h2>
            <p className="text-[13px] sm:text-[15px] text-slate-400 mt-2 sm:mt-3 font-light leading-relaxed mix-blend-screen">
              Enter your credentials to continue your journey.
            </p>
          </div>
          
          {/* Error Alert */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-red-500/10 text-red-400 p-4 rounded-[1rem] sm:rounded-[1.25rem] mb-6 text-sm border border-red-500/20 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-bold tracking-wide">{error}</span>
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-[11px] sm:text-[13px] font-black tracking-widest text-slate-400 uppercase mb-3">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <svg className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="relative w-full pl-12 pr-4 py-3.5 sm:py-4 bg-[#010206]/80 backdrop-blur-md border border-white/[0.06] rounded-[1rem] sm:rounded-[1.25rem] focus:bg-[#020510] focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all duration-300 text-slate-200 placeholder-slate-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] font-medium z-10 text-sm sm:text-base"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-[11px] sm:text-[13px] font-black tracking-widest text-slate-400 uppercase">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[11px] sm:text-[12px] font-bold tracking-wide text-emerald-400 hover:text-emerald-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <svg className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="relative w-full pl-12 pr-12 py-3.5 sm:py-4 bg-[#010206]/80 backdrop-blur-md border border-white/[0.06] rounded-[1rem] sm:rounded-[1.25rem] focus:bg-[#020510] focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all duration-300 text-slate-200 placeholder-slate-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] font-medium z-10 text-sm sm:text-base"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-emerald-400 focus:outline-none transition-colors z-20"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className={`group relative w-full flex justify-center items-center py-4 px-4 mt-2 rounded-[1rem] sm:rounded-[1.25rem] text-[13px] sm:text-[15px] font-black uppercase tracking-[0.15em] sm:tracking-widest transition-all duration-500 overflow-hidden ${
                loading 
                  ? 'bg-emerald-900/50 cursor-not-allowed text-slate-400 border border-emerald-900/50' 
                  : 'text-[#010206] bg-gradient-to-b from-emerald-400 to-teal-500 sm:hover:scale-[1.03] shadow-[0_0_30px_-10px_rgba(52,211,153,0.5),inset_0_1px_1px_rgba(255,255,255,0.8)] ring-1 ring-white/20 active:scale-95'
              }`}
            >
              {!loading && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out hidden sm:block"></div>}
              
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  <>
                    Access Portal
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 sm:mt-8 text-center text-[12px] sm:text-[13px] font-medium text-slate-500 mix-blend-screen">
            Don't have an account?{" "}
            <Link href="/register" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">
              Begin your path
            </Link>
          </p>
        </div>
      </motion.div>
      
      {/* Global CSS for Animations */}
      <style dangerouslySetInnerHTML={{ __html: globalAnimations }} />
    </main>
  );
}