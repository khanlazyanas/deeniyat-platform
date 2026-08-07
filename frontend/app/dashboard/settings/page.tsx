"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

// --- GLOBAL STYLES (Safe from VS Code parser bugs) ---
const globalAnimations = `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }
`;

// --- PRE-COMPUTED HYPER-DENSE PARTICLE ARRAY ---
const generateBubbles = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: Math.random() * 20 + 5,
    xPos: Math.random() * 100,
    yPos: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 10,
    color: ['bg-emerald-400', 'bg-teal-400', 'bg-cyan-400', 'bg-blue-400', 'bg-white'][Math.floor(Math.random() * 5)],
    blur: Math.random() * 3 + 1,
    opacity: Math.random() * 0.5 + 0.3,
    layer: Math.floor(Math.random() * 3)
  }));
};

const ambientBubbles = generateBubbles(45);

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mounted, setMounted] = useState(false);
  
  // Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Separated message states to avoid conflicts between forms
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  // --- MOUSE PARALLAX TRACKING LOGIC ---
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

  // Holographic Card Config
  const cardRef = useRef<HTMLDivElement>(null);
  const cardSpringConfig = { damping: 40, stiffness: 250, mass: 0.5 };
  // Subtler rotation for a more premium, less dizzying feel
  const rotateX = useSpring(useTransform(smoothMouseY, [-50, 50], [2.5, -2.5]), cardSpringConfig);
  const rotateY = useSpring(useTransform(smoothMouseX, [-50, 50], [-2.5, 2.5]), cardSpringConfig);
  const [isHovered, setIsHovered] = useState(false);
  const [glarePosition, setGlarePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined") {
        const user = JSON.parse(storedUser);
        setName(user.name || "");
        setEmail(user.email || "");
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
    }

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

  // Handle Profile Update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProfileMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });

      const data = await response.json();

      if (response.ok) {
        setProfileMessage({ type: "success", text: "Profile updated successfully! ✨" });
        
        const storedUser = localStorage.getItem("user");
        if (storedUser && storedUser !== "undefined") {
          const user = JSON.parse(storedUser);
          user.name = data.name; 
          localStorage.setItem("user", JSON.stringify(user));
        }
      } else {
        setProfileMessage({ type: "error", text: data.message || "Failed to update profile." });
      }
    } catch (error) {
      console.error("Profile update network error:", error);
      setProfileMessage({ type: "error", text: "Network Error. Failed to update profile." });
    } finally {
      setLoading(false);
      setTimeout(() => setProfileMessage({ type: "", text: "" }), 4000);
    }
  };

  // Handle Password Update
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "New password must be at least 6 characters long." });
      setTimeout(() => setPasswordMessage({ type: "", text: "" }), 4000);
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordMessage({ type: "success", text: "Password changed successfully! 🔒" });
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setPasswordMessage({ type: "error", text: data.message || "Failed to change password." });
      }
    } catch (error) {
      console.error("Password update network error:", error);
      setPasswordMessage({ type: "error", text: "Network Error. Failed to change password." });
    } finally {
      setPasswordLoading(false);
      setTimeout(() => setPasswordMessage({ type: "", text: "" }), 4000);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#010206] text-slate-50 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-hidden relative px-4 sm:px-6 lg:px-8 perspective-[2000px]">
      
      {/* GLOBAL BACKGROUND */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay pointer-events-none z-0"></div>

      {/* --- HYPER-DENSE 3D PARTICLES ENGINE --- */}
      {mounted && (
        <div className="fixed inset-0 z-[5] pointer-events-none overflow-hidden">
          {/* Layer 0: Foreground */}
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

          {/* Layer 1: Midground */}
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

          {/* Layer 2: Background */}
          <motion.div style={{ x: bgX, y: bgY }} className="absolute inset-0 will-change-transform">
            {ambientBubbles.filter(b => b.layer === 2).map((p, i) => (
              <motion.div
                key={`bg-${i}`}
                className={`absolute rounded-full ${p.color}`}
                style={{
                  width: p.size * 1.5, height: p.size * 1.5, left: `${p.xPos}%`, top: `${p.yPos}%`,
                  filter: `blur(${p.blur + 3}px)`, opacity: p.opacity * 0.4
                }}
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay }}
              />
            ))}
          </motion.div>
        </div>
      )}

      {/* Ambient Background Glows - intensified for depth */}
      <div className="absolute top-[10%] right-[10%] w-[600px] h-[600px] bg-emerald-900/15 rounded-full blur-[140px] pointer-events-none mix-blend-screen animate-[pulse_10s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-[10%] left-[10%] w-[600px] h-[600px] bg-cyan-900/15 rounded-full blur-[140px] pointer-events-none mix-blend-screen animate-[pulse_15s_ease-in-out_infinite_reverse]"></div>

      <div className="max-w-5xl w-full mx-auto relative z-10 py-12">
        
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-14 text-center md:text-left">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.02] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)] mb-6 backdrop-blur-xl">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_10px_rgba(52,211,153,1)]"></span>
            <span className="text-[11px] font-black text-slate-300 tracking-[0.3em] uppercase">Account Operations</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 drop-shadow-xl">Settings</h2>
          <p className="text-slate-400 font-light text-[17px] mix-blend-screen max-w-xl mx-auto md:mx-0">Manage your digital identity, configure security protocols, and personalize your experience.</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar Navigation */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1, type: "spring", stiffness: 100 }}
            className="lg:w-[300px] shrink-0 space-y-4"
          >
            <button className="relative w-full flex items-center justify-between px-6 py-5 rounded-[1.5rem] bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/30 text-emerald-400 font-black uppercase tracking-widest text-[12px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_20px_rgba(52,211,153,0.1)] transition-all overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-[1.5rem] shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
              <span className="relative z-10 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">Profile & Security</span>
              <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
            <button className="group w-full flex items-center justify-between px-6 py-5 rounded-[1.5rem] bg-[#030612]/60 backdrop-blur-md text-slate-400 border border-white/[0.04] hover:border-white/[0.12] hover:bg-white/[0.04] font-black uppercase tracking-widest text-[12px] transition-all duration-300 shadow-inner">
              <span className="group-hover:text-slate-200 transition-colors">Notifications</span>
              <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
            <button className="group w-full flex items-center justify-between px-6 py-5 rounded-[1.5rem] bg-[#030612]/60 backdrop-blur-md text-slate-400 border border-white/[0.04] hover:border-white/[0.12] hover:bg-white/[0.04] font-black uppercase tracking-widest text-[12px] transition-all duration-300 shadow-inner">
              <span className="group-hover:text-slate-200 transition-colors">Billing & Plans</span>
              <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
          </motion.div>

          {/* Main Content Area */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, type: "spring", bounce: 0.4 }}
            ref={cardRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="flex-1 relative bg-gradient-to-br from-[#030612]/90 to-[#02040b]/90 backdrop-blur-[60px] backdrop-saturate-[200%] border border-white/[0.08] rounded-[3rem] p-8 md:p-14 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9),inset_0_1px_2px_rgba(255,255,255,0.15),inset_0_-1px_3px_rgba(0,0,0,0.4)] transition-all duration-500 hover:border-white/[0.15] will-change-transform"
          >
            {/* Dynamic Holographic Glare */}
            <div
              className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 z-0 mix-blend-color-dodge rounded-[3rem]"
              style={{
                opacity: isHovered ? 1 : 0,
                background: `radial-gradient(1000px circle at ${glarePosition.x}px ${glarePosition.y}px, rgba(255,255,255,0.12), transparent 40%)`,
              }}
            />

            <div className="relative z-10 w-full h-full transform-gpu" style={{ transform: "translateZ(30px)" }}>
              
              {/* Profile Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-8 border-b border-white/[0.05]">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-[1.2rem] bg-gradient-to-br from-[#060d20] to-[#040814] border border-white/[0.08] flex items-center justify-center text-emerald-400 shadow-[0_8px_16px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)] shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <h3 className="text-3xl font-black text-white tracking-tighter drop-shadow-md">Profile Configuration</h3>
                </div>
              </div>
              
              <AnimatePresence>
                {profileMessage.text && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, scale: 0.95 }} animate={{ opacity: 1, height: 'auto', scale: 1 }} exit={{ opacity: 0, height: 0, scale: 0.95 }}
                    className={`mb-8 p-5 rounded-[1.5rem] text-[14px] font-bold tracking-wide border flex items-center gap-4 ${profileMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[inset_0_1px_1px_rgba(52,211,153,0.2)]' : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[inset_0_1px_1px_rgba(239,68,68,0.2)]'}`}
                  >
                    {profileMessage.type === 'success' ? (
                        <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                        <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                    {profileMessage.text}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleProfileUpdate} className="space-y-10 mb-20">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 p-8 rounded-[2.5rem] bg-gradient-to-r from-white/[0.02] to-transparent border border-white/[0.04] shadow-inner relative overflow-hidden group">
                  <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl group-hover:bg-emerald-500/30 transition-all duration-700"></div>
                    <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-[#060d20] to-[#040814] border-2 border-emerald-500/40 flex items-center justify-center text-4xl font-black text-emerald-400 uppercase shadow-[0_0_30px_rgba(52,211,153,0.3),inset_0_2px_4px_rgba(255,255,255,0.1)] shrink-0 z-10 group-hover:scale-105 transition-transform duration-500">
                        {name ? name.charAt(0) : "U"}
                    </div>
                  </div>
                  
                  <div className="text-center sm:text-left z-10 pt-2">
                    <button type="button" className="px-8 py-3.5 bg-white/[0.03] hover:bg-emerald-500/10 border border-white/[0.08] hover:border-emerald-500/50 text-slate-200 hover:text-emerald-400 text-[12px] font-black uppercase tracking-widest rounded-full transition-all duration-300 mb-4 block mx-auto sm:mx-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] active:scale-95">
                      Upload Avatar
                    </button>
                    <p className="text-[12px] text-slate-500 font-bold uppercase tracking-wider">Format: JPG, PNG • Max: 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="group/input">
                    <label className="block text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 group-focus-within/input:text-emerald-400 transition-colors">Legal Name</label>
                    <input 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#010206]/80 backdrop-blur-md border border-white/[0.06] rounded-[1.5rem] px-6 py-5 focus:bg-[#020510] focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all duration-300 text-slate-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] font-bold text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Email Address</label>
                    <input 
                      type="email"
                      value={email}
                      disabled
                      className="w-full bg-[#010206]/40 border border-white/[0.02] text-slate-600 rounded-[1.5rem] px-6 py-5 outline-none cursor-not-allowed shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] font-bold text-lg opacity-70"
                    />
                    <p className="text-[11px] text-amber-500/80 font-bold uppercase tracking-widest mt-3 pl-2 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Identity bound to email.
                    </p>
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="group/btn relative px-12 py-5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500 hover:to-teal-500 border border-emerald-500/30 text-emerald-400 hover:text-[#010206] text-[13px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all duration-500 disabled:opacity-50 overflow-hidden shadow-[0_0_20px_rgba(52,211,153,0.1),inset_0_1px_1px_rgba(255,255,255,0.1)] active:scale-95"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-out"></div>
                    <span className="relative z-10 flex items-center gap-3">
                        {loading ? "Syncing..." : "Update Profile"}
                        {!loading && <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </span>
                  </button>
                </div>
              </form>

              {/* Security Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-8 border-b border-white/[0.05]">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-[1.2rem] bg-gradient-to-br from-[#060d20] to-[#040814] border border-white/[0.08] flex items-center justify-center text-rose-400 shadow-[0_8px_16px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)] shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <h3 className="text-3xl font-black text-white tracking-tighter drop-shadow-md">Authentication</h3>
                </div>
              </div>
              
              <AnimatePresence>
                {passwordMessage.text && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, scale: 0.95 }} animate={{ opacity: 1, height: 'auto', scale: 1 }} exit={{ opacity: 0, height: 0, scale: 0.95 }}
                    className={`mb-8 p-5 rounded-[1.5rem] text-[14px] font-bold tracking-wide border flex items-center gap-4 ${passwordMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[inset_0_1px_1px_rgba(52,211,153,0.2)]' : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[inset_0_1px_1px_rgba(239,68,68,0.2)]'}`}
                  >
                    {passwordMessage.type === 'success' ? (
                        <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                        <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                    {passwordMessage.text}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handlePasswordUpdate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group/input">
                        <label className="block text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 group-focus-within/input:text-rose-400 transition-colors">Current Key</label>
                        <input 
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-[#010206]/80 backdrop-blur-md border border-white/[0.06] rounded-[1.5rem] px-6 py-5 focus:bg-[#020510] focus:ring-1 focus:ring-rose-500/50 focus:border-rose-500/50 outline-none transition-all duration-300 text-slate-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] font-bold text-lg placeholder-slate-700 tracking-[0.2em]"
                        />
                    </div>
                    <div className="group/input">
                        <label className="block text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 group-focus-within/input:text-rose-400 transition-colors">New Key</label>
                        <input 
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-[#010206]/80 backdrop-blur-md border border-white/[0.06] rounded-[1.5rem] px-6 py-5 focus:bg-[#020510] focus:ring-1 focus:ring-rose-500/50 focus:border-rose-500/50 outline-none transition-all duration-300 text-slate-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] font-bold text-lg placeholder-slate-700 tracking-[0.2em]"
                        />
                    </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <button 
                    type="submit"
                    disabled={passwordLoading || !currentPassword || !newPassword}
                    className="group/btn relative px-12 py-5 bg-gradient-to-r from-rose-500/10 to-red-600/10 hover:from-rose-500 hover:to-red-600 border border-rose-500/30 text-rose-400 hover:text-white text-[13px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all duration-500 disabled:opacity-50 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] active:scale-95"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-out"></div>
                    <span className="relative z-10 flex items-center gap-3">
                        {passwordLoading ? "Encrypting..." : "Change Password"}
                        {!passwordLoading && <svg className="w-5 h-5 group-hover/btn:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                    </span>
                  </button>
                </div>
              </form>

            </div>
          </motion.div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: globalAnimations }} />
    </div>
  );
}