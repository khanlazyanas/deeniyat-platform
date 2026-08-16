"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// 👇 Dhyan dena: Agar path galat ho toh apne hisab se adjust kar lena
import { useAuth } from "../../../context/AuthContext";

// --- GLOBAL STYLES ---
const globalAnimations = `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }
`;

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string; // URL se token nikal liya
  
  const [mounted, setMounted] = useState(false);
  const { login } = useAuth();
  
  // States
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --- MOUSE PARALLAX TRACKING LOGIC ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // Holographic Card Config
  const cardRef = useRef<HTMLDivElement>(null);
  const cardSpringConfig = { damping: 40, stiffness: 250, mass: 0.5 };
  const rotateX = useSpring(useTransform(smoothMouseY, [-50, 50], [6, -6]), cardSpringConfig);
  const rotateY = useSpring(useTransform(smoothMouseX, [-50, 50], [-6, 6]), cardSpringConfig);
  const [isHovered, setIsHovered] = useState(false);
  const [glarePosition, setGlarePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 100;
      const y = (e.clientY / window.innerHeight - 0.5) * 100;
      mouseX.set(x);
      mouseY.set(y);

      if (cardRef.current && isHovered) {
        const rect = cardRef.current.getBoundingClientRect();
        setGlarePosition({ 
          x: e.clientX - rect.left, 
          y: e.clientY - rect.top 
        });
      }
    };
    
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [mouseX, mouseY, isHovered]);

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      // Backend ki API hit kar rahe hain naye token ke sath
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password/${token}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password. Link might be expired.");
      }

      setSuccess("Password updated successfully! Logging you in...");
      
      // Auto-Login user after successful reset
      const userData = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar || "",
        enrolledCourses: data.enrolledCourses || []
      };
      
      setTimeout(() => {
        login(userData, data.token);
        router.push("/dashboard");
      }, 2000); // 2 second ka wait taaki success message padh sake
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen pt-40 pb-12 bg-[#010206] text-slate-50 flex items-center justify-center font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-hidden relative px-4 sm:px-6 lg:px-8 perspective-[2000px]">
      
      {/* GLOBAL BACKGROUND */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay pointer-events-none z-0"></div>

      {/* Deep Islamic Geometric Glow */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none transform-gpu">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[120px] mix-blend-screen will-change-transform"
        />
      </div>

      {/* Holographic Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 300, damping: 25 }}
        ref={cardRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative z-10 w-full max-w-md bg-[#030612]/70 backdrop-blur-[40px] border border-white/[0.06] rounded-[2.5rem] p-8 sm:p-10 shadow-[0_32px_64px_-20px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.1)] transition-colors duration-700 hover:border-white/[0.12] my-8"
      >
        
        {/* Dynamic Holographic Glare */}
        <div
          className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 z-0 mix-blend-color-dodge rounded-[2.5rem]"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(600px circle at ${glarePosition.x}px ${glarePosition.y}px, rgba(255,255,255,0.1), transparent 40%)`,
          }}
        />

        <div className="relative z-10 w-full h-full transform-gpu" style={{ transform: "translateZ(20px)" }}>
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-[#060d20] to-[#040814] border border-white/[0.08] mb-6 shadow-[0_8px_16px_rgba(0,0,0,0.4)] text-emerald-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter drop-shadow-md">
              Create New Password
            </h2>
            <p className="text-[14px] text-slate-400 mt-3 font-light leading-relaxed mix-blend-screen">
              Your new password must be different from previous used passwords.
            </p>
          </div>
          
          {/* Error Alert */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-red-500/10 text-red-400 p-4 rounded-[1.25rem] mb-6 text-sm border border-red-500/20">
              <span className="font-bold tracking-wide">{error}</span>
            </motion.div>
          )}

          {/* Success Alert */}
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-emerald-500/10 text-emerald-400 p-4 rounded-[1.25rem] mb-6 text-sm border border-emerald-500/20">
              <span className="font-bold tracking-wide">{success}</span>
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* New Password */}
            <div>
              <label className="block text-[13px] font-black tracking-widest text-slate-400 uppercase mb-3">New Password</label>
              <div className="relative group">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="relative w-full px-6 pr-12 py-4 bg-[#010206]/80 backdrop-blur-md border border-white/[0.06] rounded-[1.25rem] focus:bg-[#020510] focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all duration-300 text-slate-200 placeholder-slate-600 font-medium z-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-emerald-400 focus:outline-none transition-colors z-20"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={showPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                  </svg>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[13px] font-black tracking-widest text-slate-400 uppercase mb-3">Confirm Password</label>
              <div className="relative group">
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="relative w-full px-6 py-4 bg-[#010206]/80 backdrop-blur-md border border-white/[0.06] rounded-[1.25rem] focus:bg-[#020510] focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all duration-300 text-slate-200 placeholder-slate-600 font-medium z-10"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className={`group relative w-full flex justify-center items-center py-4 px-4 rounded-[1.25rem] text-[15px] font-black uppercase tracking-widest transition-all duration-500 overflow-hidden ${
                loading ? 'bg-emerald-900/50 cursor-not-allowed text-slate-400 border border-emerald-900/50' : 'text-[#010206] bg-gradient-to-b from-emerald-400 to-teal-500 hover:scale-[1.03] shadow-[0_0_30px_-10px_rgba(52,211,153,0.5)] active:scale-95'
              }`}
            >
              <span className="relative z-10">
                {loading ? "Updating..." : "Reset Password"}
              </span>
            </button>
          </form>
        </div>
      </motion.div>
      <style dangerouslySetInnerHTML={{ __html: globalAnimations }} />
    </main>
  );
}