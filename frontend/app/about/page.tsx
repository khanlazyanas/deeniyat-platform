"use client";

import Link from "next/link";
import { motion, Variants, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from "framer-motion";
import { useRef, useState, useEffect } from "react";

// --- GLOBAL STYLES & KEYFRAMES (Premium Font Applied Globally) ---
const globalAnimations = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&display=swap');

  .font-cinzel { 
    font-family: 'Cinzel', serif; 
  }

  @keyframes liquid-morph {
    0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(0deg); }
    33% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; transform: rotate(120deg); }
    66% { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; transform: rotate(240deg); }
    100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(360deg); }
  }
`;

// --- Framer Motion Variants ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 }, 
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring" as const, stiffness: 250, damping: 24, mass: 1 } 
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

// --- HYPER-DENSE PARTICLE ARRAY (Optimized for 60fps) ---
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

const ambientBubbles = generateBubbles(25); 

// --- 3D Holographic Card Component (GPU OPTIMIZED) ---
function HolographicCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const glareX = useMotionValue(0);
  const glareY = useMotionValue(0);
  const isHovered = useMotionValue(0);
  
  const springConfig = { damping: 30, stiffness: 200, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springConfig);

  const backgroundTemplate = useMotionTemplate`radial-gradient(800px circle at ${glareX}px ${glareY}px, rgba(255,255,255,0.12), transparent 45%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768 || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    
    mouseX.set(relX);
    mouseY.set(relY);
    glareX.set(e.clientX - rect.left);
    glareY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = () => { if (window.innerWidth >= 768) isHovered.set(1); };
  const handleMouseLeave = () => {
    isHovered.set(0);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      variants={fadeInUp}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative overflow-hidden bg-[#030612]/80 backdrop-blur-xl backdrop-saturate-[150%] border border-white/[0.06] shadow-[0_32px_64px_-20px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.5)] transition-colors duration-500 hover:border-white/[0.12] will-change-transform ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px z-0 mix-blend-color-dodge transition-opacity duration-300"
        style={{ opacity: isHovered, background: backgroundTemplate }}
      />
      <div 
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 z-0"
      />
      <div className="relative z-10 w-full h-full transform-gpu" style={{ transform: "translateZ(20px)" }}>
        {children}
      </div>
    </motion.div>
  );
}

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // --- Smooth Scroll Physics ---
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const yBg = useTransform(smoothProgress, [0, 1], ["0%", "30%"]); 

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

  useEffect(() => {
    setMounted(true);
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

  return (
    // 👇 Added 'font-cinzel' to root container
    <main ref={containerRef} className="min-h-screen bg-[#010206] text-slate-50 flex flex-col font-cinzel selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden relative perspective-[2000px] pt-24 sm:pt-32">
      
      {/* Top Progress Bar */}
      {mounted && (
        <motion.div 
          className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 origin-left z-[100] shadow-[0_0_20px_rgba(52,211,153,0.5)]"
          style={{ scaleX: smoothProgress }}
        />
      )}

      {/* GLOBAL BACKGROUND */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay pointer-events-none z-0"></div>

      {/* --- HYPER-DENSE 3D PARTICLES ENGINE --- */}
      {mounted && (
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
      )}

      {/* Ambient Orbs */}
      <motion.div style={{ y: yBg }} className="absolute top-[10%] left-[-10%] sm:left-[20%] w-[80vw] sm:w-[600px] h-[80vw] sm:h-[600px] bg-emerald-900/20 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none mix-blend-screen z-0"></motion.div>
      <div className="absolute bottom-[20%] right-[-10%] w-[70vw] sm:w-[500px] h-[70vw] sm:h-[500px] bg-teal-900/10 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none mix-blend-screen z-0"></div>

      <motion.div 
        initial="hidden" animate="visible" variants={staggerContainer}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      >
        {/* 1. Header Section */}
        <motion.div variants={fadeInUp} className="text-center max-w-4xl mx-auto mb-20 sm:mb-28">
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/[0.03] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)] mb-6 sm:mb-8 backdrop-blur-xl">
            <span className="flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,1)]"></span>
            <span className="text-[9px] sm:text-[11px] font-black font-cinzel text-slate-300 tracking-[0.2em] sm:tracking-[0.3em] uppercase">Our Story</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black font-cinzel uppercase text-white tracking-widest mb-6 sm:mb-8 leading-[1.05] drop-shadow-xl">
            Bridging <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 drop-shadow-[0_0_30px_rgba(52,211,153,0.3)] block sm:inline">Tradition</span> & Tech
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 font-cinzel font-light leading-relaxed mb-8 sm:mb-12 mix-blend-screen">
            Deeniyat is a premium Islamic Learning Management System designed to bring authentic knowledge to seekers worldwide. We blend the timeless wisdom of classical scholars with cutting-edge spatial digital technology.
          </p>
        </motion.div>

        {/* 2. Global Impact / Stats Section */}
        <motion.div variants={fadeInUp} className="relative mb-24 sm:mb-32 border-y border-white/[0.04] py-10 sm:py-16 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent">
          <div className="absolute inset-0 bg-gradient-to-r from-[#010206] via-transparent to-[#010206] pointer-events-none"></div>
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-6 relative z-10 font-cinzel">
            {[
              { value: "10,000+", label: "Active Students" },
              { value: "50+", label: "Verified Scholars" },
              { value: "120+", label: "Premium Courses" },
              { value: "24/7", label: "Learning Access" }
            ].map((stat, i) => (
              <div key={i} className="text-center group cursor-default">
                <h4 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 mb-2 sm:mb-3 drop-shadow-md group-hover:scale-105 transition-transform duration-500">
                  {stat.value}
                </h4>
                <p className="text-emerald-400/80 text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] group-hover:text-emerald-400 transition-colors">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 3. Mission & Vision Grid */}
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 mb-24 sm:mb-32 font-cinzel">
          
          <HolographicCard className="p-8 sm:p-10 md:p-14 rounded-[2rem] sm:rounded-[2.5rem]">
            <div className="w-16 h-16 bg-[#040814] border border-white/[0.08] rounded-[1rem] sm:rounded-[1.25rem] flex items-center justify-center mb-8 sm:mb-10 relative z-10 text-emerald-400 shadow-md">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-wider text-white mb-4 sm:mb-6 drop-shadow-md">Our Mission</h3>
            <p className="text-slate-400 leading-relaxed font-light text-lg sm:text-xl relative z-10">
              To make authentic Islamic education accessible, interactive, and structured for everyone, regardless of their geographical location. We strive to connect dedicated students with verified, world-class scholars.
            </p>
          </HolographicCard>

          <HolographicCard className="p-8 sm:p-10 md:p-14 rounded-[2rem] sm:rounded-[2.5rem]">
            <div className="w-16 h-16 bg-[#040814] border border-white/[0.08] rounded-[1rem] sm:rounded-[1.25rem] flex items-center justify-center mb-8 sm:mb-10 relative z-10 text-teal-400 shadow-md">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </div>
            <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-wider text-white mb-4 sm:mb-6 drop-shadow-md">Our Vision</h3>
            <p className="text-slate-400 leading-relaxed font-light text-lg sm:text-xl relative z-10">
              To become the global standard for digital Islamic learning, fostering a community of learners who are deeply rooted in their Deen while excelling in the modern, technological world.
            </p>
          </HolographicCard>

        </motion.div>

        {/* 4. Eminent Scholars / Leadership Section */}
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="mb-24 sm:mb-32">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-cinzel uppercase tracking-widest text-white mb-4 sm:mb-6">Guided by the Best</h2>
            <div className="w-20 sm:w-24 h-1.5 bg-gradient-to-r from-emerald-400 to-transparent mx-auto rounded-full mb-6 sm:mb-8"></div>
            <p className="text-slate-400 max-w-2xl mx-auto font-cinzel font-light text-lg sm:text-xl px-4">Learn directly from our board of certified scholars who bring decades of traditional teaching experience to the digital realm.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 font-cinzel">
            {[
              { name: "Shaykh Abdullah", role: "Head of Tafseer Dept.", img: "A" },
              { name: "Ustadha Ayesha", role: "Tajweed & Qira'at Lead", img: "A" },
              { name: "Mufti Rahman", role: "Fiqh & Jurisprudence", img: "R" }
            ].map((scholar, idx) => (
              <div key={idx} className="bg-[#030612]/80 backdrop-blur-xl border border-white/[0.04] rounded-[2rem] p-8 flex flex-col items-center text-center hover:bg-white/[0.05] transition-colors duration-500 shadow-[0_16px_32px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.05)] group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#060d20] to-[#040814] border border-white/[0.08] flex items-center justify-center text-3xl font-black text-emerald-400 mb-5 shadow-lg group-hover:scale-110 transition-transform duration-500">
                  {scholar.img}
                </div>
                <h4 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white mb-2">{scholar.name}</h4>
                <p className="text-emerald-400/90 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] mb-4 sm:mb-6">{scholar.role}</p>
                <p className="text-slate-400 text-sm sm:text-base font-light leading-relaxed">Certified in traditional Islamic sciences with over 15 years of teaching experience.</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 5. Core Values Section */}
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-cinzel uppercase tracking-widest text-white mb-4 sm:mb-6">Core Values</h2>
            <div className="w-20 sm:w-24 h-1.5 bg-gradient-to-r from-emerald-400 to-transparent mx-auto rounded-full mb-8 sm:mb-12"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-24 sm:mb-32 font-cinzel">
            {[
              {
                title: "Authenticity",
                desc: "All our courses are curated and verified by certified scholars following the righteous path.",
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              },
              {
                title: "Excellence (Ihsan)",
                desc: "We deliver a seamless, high-end spatial user experience to make seeking knowledge a beautiful journey.",
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              },
              {
                title: "Community",
                desc: "Creating an engaging ecosystem where students and teachers interact, collaborate, and grow together.",
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              }
            ].map((val, i) => (
              <motion.div variants={fadeInUp} key={i} className="bg-white/[0.02] border border-white/[0.04] p-8 sm:p-10 rounded-[2rem] text-center hover:bg-white/[0.05] transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] group">
                <div className="w-16 h-16 mx-auto bg-[#040814] border border-white/[0.08] rounded-[1.25rem] flex items-center justify-center text-emerald-400 mb-6 sm:mb-8 shadow-md group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">{val.icon}</svg>
                </div>
                <h4 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white mb-3 sm:mb-4">{val.title}</h4>
                <p className="text-slate-400 text-sm sm:text-base font-light leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </motion.div>

      {/* 6. Liquid Cinematic CTA Section */}
      <section className="relative py-32 sm:py-40 overflow-hidden bg-[#010206] border-t border-white/[0.04] z-20">
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center mix-blend-screen opacity-30 sm:opacity-50">
          <div className="absolute w-[100vw] sm:w-[80vw] h-[100vw] sm:h-[80vw] max-w-[1000px] max-h-[1000px] bg-gradient-to-tr from-emerald-500/20 via-teal-900/20 to-blue-600/20 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] blur-[80px] sm:blur-[120px] animate-liquid-morph"></div>
        </div>
        
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black font-cinzel text-white mb-6 sm:mb-8 uppercase tracking-widest leading-[1.05] drop-shadow-2xl">
            Ready to start your journey?
          </h2>
          <p className="text-slate-400 mb-10 sm:mb-14 text-lg sm:text-xl md:text-2xl font-cinzel font-light max-w-3xl mx-auto leading-relaxed mix-blend-screen">
            Join thousands of students across the globe who are elevating their spiritual journey through the Deeniyat platform. Your pursuit of knowledge starts here.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 font-cinzel">
            <Link href="/register" className="w-full sm:w-auto text-center group relative inline-flex items-center justify-center px-10 sm:px-12 py-5 sm:py-6 text-[15px] sm:text-[16px] font-bold text-white bg-[#030612] rounded-full overflow-hidden transition-all duration-500 active:scale-95 sm:hover:scale-[1.05] shadow-[0_16px_32px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/[0.1] hover:border-emerald-500/50 uppercase tracking-[0.15em] sm:tracking-[0.2em]">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10 flex items-center justify-center gap-3 drop-shadow-md">
                Enroll Now
                <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </span>
            </Link>
            <Link href="/courses" className="w-full sm:w-auto text-center px-10 sm:px-12 py-5 sm:py-6 text-[15px] sm:text-[16px] font-bold text-white bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-full hover:bg-white/[0.08] hover:border-white/[0.2] transition-all duration-300 uppercase tracking-[0.15em] sm:tracking-[0.2em] active:scale-95">
              Browse Courses
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Global CSS */}
      <style dangerouslySetInnerHTML={{ __html: globalAnimations }} />
    </main>
  );
}