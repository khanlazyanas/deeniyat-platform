"use client";

import Link from "next/link";
import { motion, Variants, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";

// --- GLOBAL STYLES & KEYFRAMES (Premium Font Applied Globally) ---
const globalAnimations = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&display=swap');

  .font-cinzel { 
    font-family: 'Cinzel', serif; 
  }

  @keyframes shimmer { 
    100% { transform: translateX(200%); } 
  }
  @keyframes liquid-morph {
    0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(0deg); }
    33% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; transform: rotate(120deg); }
    66% { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; transform: rotate(240deg); }
    100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(360deg); }
  }
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }
`;

// --- Strict Framer Motion Variants ---
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

const wordAnimation: Variants = {
  hidden: { opacity: 0, y: 20, rotateX: -45 }, 
  visible: { 
    opacity: 1, 
    y: 0, 
    rotateX: 0,
    transition: { type: "spring" as const, stiffness: 200, damping: 20 }
  }
};

// --- PRE-COMPUTED LIGHTWEIGHT PARTICLE ARRAY ---
const particlesData = [
  { l: 0, c: "bg-emerald-400", s: 18, x: 10, y: 15, d: 0.5, dur: 12, op: 0.8 },
  { l: 0, c: "bg-teal-400", s: 22, x: 80, y: 25, d: 1.2, dur: 14, op: 0.7 },
  { l: 0, c: "bg-blue-400", s: 15, x: 25, y: 65, d: 2.1, dur: 10, op: 0.9 },
  { l: 0, c: "bg-purple-400", s: 16, x: 90, y: 10, d: 2.5, dur: 13, op: 0.8 },
  { l: 0, c: "bg-emerald-300", s: 24, x: 5, y: 85, d: 3.1, dur: 16, op: 0.6 },
  
  { l: 1, c: "bg-emerald-500", s: 12, x: 15, y: 35, d: 0.4, dur: 18, op: 0.5 },
  { l: 1, c: "bg-teal-500", s: 14, x: 85, y: 45, d: 1.7, dur: 20, op: 0.6 },
  { l: 1, c: "bg-amber-500", s: 10, x: 35, y: 25, d: 2.3, dur: 16, op: 0.5 },
  { l: 1, c: "bg-purple-500", s: 11, x: 65, y: 70, d: 0.8, dur: 19, op: 0.4 },
  
  { l: 2, c: "bg-emerald-600", s: 30, x: 20, y: 20, d: 0.1, dur: 25, op: 0.2 },
  { l: 2, c: "bg-teal-600", s: 40, x: 70, y: 60, d: 1.5, dur: 30, op: 0.15 },
  { l: 2, c: "bg-blue-600", s: 25, x: 10, y: 70, d: 2.8, dur: 22, op: 0.2 },
  { l: 2, c: "bg-purple-600", s: 35, x: 90, y: 30, d: 0.9, dur: 28, op: 0.15 },
];

const islamicValues = [
  { ar: "إِخْلَاص", en: "Sincerity" },
  { ar: "إِحْسَان", en: "Excellence" },
  { ar: "صَبْر", en: "Patience" },
  { ar: "تَوَكُّل", en: "Trust" },
  { ar: "شُكْر", en: "Gratitude" },
  { ar: "عِلْم", en: "Knowledge" },
];

// --- Holographic 3D Spatial Card Component ---
function HolographicCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const glareX = useMotionValue(0);
  const glareY = useMotionValue(0);
  const isHovered = useMotionValue(0);
  
  const springConfig = { damping: 30, stiffness: 200, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), springConfig);

  const backgroundTemplate = useMotionTemplate`radial-gradient(800px circle at ${glareX}px ${glareY}px, rgba(255,255,255,0.08), transparent 40%)`;

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
      className={`relative overflow-hidden bg-[#030612]/70 backdrop-blur-2xl border border-white/[0.05] shadow-[0_16px_32px_-10px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.08)] transition-all duration-500 hover:border-white/[0.15] will-change-transform ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px z-0 mix-blend-color-dodge transition-opacity duration-300"
        style={{ opacity: isHovered, background: backgroundTemplate }}
      />
      <div className="relative z-10 w-full h-full transform-gpu" style={{ transform: "translateZ(30px)" }}>
        {children}
      </div>
    </motion.div>
  );
}

// --- NEW COMPONENT: FAQ Item ---
function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/[0.05] py-5">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left focus:outline-none group"
      >
        <span className="text-xl font-cinzel font-semibold text-slate-300 group-hover:text-white transition-colors duration-300">{question}</span>
        <motion.div 
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ml-4 transition-colors duration-300 ${isOpen ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/[0.02] border-white/[0.05] text-slate-500 group-hover:border-white/[0.15]'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="pt-4 text-slate-400 font-cinzel font-light leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 🚀 NAYA: Live Feedback State
  const [reviews, setReviews] = useState<any[]>([]);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const yBg = useTransform(smoothProgress, [0, 1], ["0%", "30%"]);
  const opacityBg = useTransform(smoothProgress, [0, 0.8], [1, 0]);
  const yText = useTransform(smoothProgress, [0, 1], ["0%", "80%"]);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const fgX = useTransform(smoothMouseX, (v) => v * 1.5);
  const fgY = useTransform(smoothMouseY, (v) => v * 1.5);
  const bgX = useTransform(smoothMouseX, (v) => v * 0.3);
  const bgY = useTransform(smoothMouseY, (v) => v * 0.3);

  const floatY1 = useTransform(smoothProgress, [0, 1], ["0px", "-150px"]);
  const floatY2 = useTransform(smoothProgress, [0, 1], ["0px", "100px"]);

  const [activeCurriculumTab, setActiveCurriculumTab] = useState(0);
  const curriculumTabs = [
    { title: "Noorani Qaida", desc: "Build a flawless foundation in reading the Quran with proper Makharij (pronunciation)." },
    { title: "Tajweed Mastery", desc: "Learn the rules of recitation to read the Quran exactly as it was revealed." },
    { title: "Fiqh Basics", desc: "Understand the essential rulings of purification, prayer, and daily life." },
    { title: "Tafseer", desc: "Dive deep into the meanings, context, and wisdom behind the verses of the Quran." }
  ];

  useEffect(() => {
    // Fetch live feedback from backend
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback`);
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          setReviews(data.data);
        }
      } catch (err) {
        console.error("Failed to load feedback", err);
      }
    };
    fetchReviews();

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

  // 🚀 Logic for flawless seamless marquee loop 
  // Hum array ko multiply karenge taaki wo screen width ko hamesha cover kare.
  const baseReviews = reviews.length > 0 ? reviews : [1, 2, 3, 4];
  const duplicatedReviews = [...baseReviews, ...baseReviews, ...baseReviews]; 
  // Done twice to satisfy the 0% to -50% Framer Motion offset seamlessly
  const displayReviews = [...duplicatedReviews, ...duplicatedReviews];

  return (
    <main ref={containerRef} className="min-h-screen bg-[#010206] text-slate-50 flex flex-col font-cinzel selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden relative perspective-[2000px]">
      
      {/* Top Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 origin-left z-[100] shadow-[0_0_20px_rgba(52,211,153,0.5)]"
        style={{ scaleX: smoothProgress }}
      />

      {/* GLOBAL BACKGROUND */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay pointer-events-none z-0"></div>

      {/* --- HYPER-DENSE 3D PARTICLES ENGINE --- */}
      <div className="hidden md:block fixed inset-0 z-[5] pointer-events-none overflow-hidden">
        {/* Layer 0: Foreground */}
        <motion.div style={{ x: fgX, y: fgY }} className="absolute inset-0 will-change-transform">
          {particlesData.filter(p => p.l === 0).map((p, i) => (
            <motion.div
              key={`fg-${i}`}
              className={`absolute rounded-full ${p.c}`}
              style={{
                width: p.s, height: p.s, left: `${p.x}%`, top: `${p.y}%`, opacity: p.op,
                boxShadow: `0 0 ${p.s * 2}px currentColor`
              }}
              animate={{ y: [0, -40, 0], x: [0, 20, -10, 0] }}
              transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut", delay: p.d }}
            />
          ))}
        </motion.div>

        {/* Layer 2: Background */}
        <motion.div style={{ x: bgX, y: bgY }} className="absolute inset-0 will-change-transform">
          {particlesData.filter(p => p.l === 2).map((p, i) => (
            <motion.div
              key={`bg-${i}`}
              className={`absolute rounded-full ${p.c}`}
              style={{
                width: p.s, height: p.s, left: `${p.x}%`, top: `${p.y}%`, opacity: p.op,
                boxShadow: `0 0 ${p.s}px currentColor`
              }}
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: p.dur, repeat: Infinity, ease: "linear", delay: p.d }}
            />
          ))}
        </motion.div>
      </div>

      {/* --- 1. CINEMATIC HERO SECTION --- */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-24 pb-20">
        
        {/* Floating Elements (NEW) */}
        <motion.div 
          style={{ y: floatY1 }}
          className="hidden lg:flex absolute top-40 left-20 z-30 items-center gap-3 px-5 py-3 rounded-2xl bg-[#030612]/60 border border-white/[0.08] backdrop-blur-md shadow-xl transform-gpu"
        >
          <span className="text-2xl">⭐</span>
          <div className="text-left font-cinzel">
            <p className="text-white font-bold text-sm leading-tight tracking-wider">4.9/5 Rating</p>
            <p className="text-slate-400 text-xs">Student Reviews</p>
          </div>
        </motion.div>

        <motion.div 
          style={{ y: floatY2 }}
          className="hidden lg:flex absolute bottom-40 right-20 z-30 items-center gap-3 px-5 py-3 rounded-2xl bg-[#030612]/60 border border-white/[0.08] backdrop-blur-md shadow-xl transform-gpu"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <div className="text-left font-cinzel">
            <p className="text-white font-bold text-sm leading-tight tracking-wider">10+ Ustads</p>
            <p className="text-slate-400 text-xs">Certified Scholars</p>
          </div>
        </motion.div>

        <motion.div 
          style={{ y: yBg, opacity: opacityBg }} 
          className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none transform-gpu"
        >
          {/* Volumetric Orbs */}
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.2, 0.15], rotate: [0, 90, 0] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute w-[80vw] sm:w-[800px] h-[80vw] sm:h-[800px] bg-emerald-600/20 rounded-full blur-[80px] sm:blur-[120px] mix-blend-screen will-change-transform"
          />
          
          {/* Giant Arabic Watermark */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2 }}
            className="absolute text-[15rem] sm:text-[35rem] text-white/[0.02] select-none tracking-widest z-0 transform -translate-y-24 drop-shadow-2xl will-change-transform mix-blend-overlay"
          >
            اقْرَأْ
          </motion.div>
        </motion.div>

        {/* Hero Content */}
        <motion.div 
          style={{ y: yText }}
          initial="hidden" animate="visible" variants={staggerContainer}
          className="relative z-20 max-w-5xl mx-auto flex flex-col items-center mt-12 pb-10 will-change-transform"
        >
          {/* Elite Badge */}
          <motion.div variants={fadeInUp} className="group cursor-default mb-8 sm:mb-10 inline-flex flex-col items-center gap-2 px-8 sm:px-10 py-4 sm:py-5 rounded-full bg-[#030612]/80 border border-amber-500/30 backdrop-blur-xl shadow-[0_16px_32px_rgba(0,0,0,0.3)] transition-all duration-500 hover:border-amber-500/60">
            <span className="relative z-10 text-xl md:text-3xl font-cinzel text-amber-400/95 font-semibold tracking-wider drop-shadow-lg">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </span>
            <div className="relative z-10 flex items-center gap-3 sm:gap-4 mt-1 sm:mt-2">
              <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-amber-500/70"></div>
              <span className="text-[9px] sm:text-[11px] font-black font-cinzel text-amber-200/90 tracking-[0.3em] sm:tracking-[0.4em] uppercase">
                In the name of Allah
              </span>
              <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-amber-500/70"></div>
            </div>
          </motion.div>

          {/* Staggered Chromatic Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-[7rem] font-black font-cinzel text-white tracking-tight leading-[1.05] mb-6 flex flex-wrap justify-center gap-x-3 sm:gap-x-5 drop-shadow-xl uppercase">
            {["Elevate", "Your", "Spiritual", "Journey"].map((word, i) => (
              <motion.span 
                key={i} variants={wordAnimation}
                className={i >= 2 ? "text-transparent bg-clip-text bg-gradient-to-br from-emerald-300 via-teal-200 to-blue-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.3)] relative inline-block" : "inline-block"}
              >
                {word}
                {i === 3 && <span className="absolute -bottom-2 left-0 w-full h-4 bg-emerald-500/30 blur-xl rounded-full z-0 pointer-events-none hidden sm:block"></span>}
              </motion.span>
            ))}
          </h1>

          <motion.p variants={fadeInUp} className="max-w-3xl text-base sm:text-xl md:text-2xl text-slate-300 mb-10 sm:mb-14 leading-relaxed font-light drop-shadow-md px-4 sm:px-0">
            Experience the profound beauty of Deen through an elite, immersive curriculum. Master <strong className="text-white font-bold tracking-wide">Quran, Fiqh, and Sunnah</strong> with world-class scholars.
          </motion.p>
          
          {/* Magnetic CTA Buttons */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto items-center mb-10 px-4 sm:px-0 font-cinzel">
            <Link href="/courses" className="w-full sm:w-auto text-center group relative px-10 sm:px-14 py-5 sm:py-6 text-[15px] sm:text-[17px] font-bold text-slate-950 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full overflow-hidden transition-all duration-300 active:scale-95 hover:shadow-[0_0_50px_-5px_rgba(52,211,153,0.8)]">
              <span className="relative flex items-center justify-center gap-3 uppercase tracking-widest">
                Begin Your Path
                <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4-4m4-4H3" /></svg>
              </span>
            </Link>
            
            <Link href="/dashboard" className="w-full sm:w-auto text-center px-10 sm:px-14 py-5 sm:py-6 text-[15px] sm:text-[17px] font-bold text-white bg-[#040814]/80 backdrop-blur-xl border border-white/[0.08] rounded-full hover:bg-white/[0.1] hover:border-white/[0.2] transition-all duration-300 uppercase tracking-widest active:scale-95">
              Enter Portal
            </Link>
          </motion.div>
        </motion.div>

        {/* Bouncing Discover Node */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }} className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 sm:gap-3 z-30 font-cinzel">
          <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-400">Discover</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="w-5 sm:w-6 h-8 sm:h-10 border-2 border-white/[0.1] rounded-full flex justify-center p-1 sm:p-1.5 bg-[#010206]/50">
            <div className="w-1 h-2 sm:w-1.5 sm:h-2.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-0 w-full h-32 sm:h-64 bg-gradient-to-t from-[#010206] via-[#010206]/80 to-transparent z-10 pointer-events-none"></div>
      </section>

      {/* --- 2. MAJESTIC HADEETH SECTION --- */}
      <section className="relative py-24 sm:py-48 bg-[#010206] z-20 overflow-hidden">
        <div className="absolute top-0 left-0 sm:left-1/4 w-[60vw] sm:w-[40vw] h-[60vw] sm:h-[40vw] bg-emerald-900/10 rounded-full blur-[80px] sm:blur-[150px] pointer-events-none"></div>
        
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="max-w-6xl mx-auto px-4 text-center relative z-10">
          
          <div className="flex justify-center mb-10 sm:mb-16 relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1rem] sm:rounded-[1.5rem] bg-[#030612] border border-emerald-500/40 flex items-center justify-center transform rotate-45 relative z-10 shadow-[0_0_30px_rgba(52,211,153,0.2)]">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 -rotate-45" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
          </div>
          
          <HolographicCard className="p-8 sm:p-10 md:p-24 rounded-[2rem] sm:rounded-[3.5rem]">
            <div className="relative z-10 space-y-8 sm:space-y-14 font-cinzel">
              <h2 className="text-3xl sm:text-5xl lg:text-[4.5rem] leading-relaxed sm:leading-[1.8] font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 via-emerald-400 to-teal-200" dir="rtl">
                مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ
              </h2>
              
              <div className="w-32 sm:w-48 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent mx-auto"></div>

              <h3 className="text-xl sm:text-3xl md:text-4xl text-slate-100 leading-relaxed sm:leading-loose font-medium" dir="rtl">
                "جو شخص علم کی تلاش میں کسی راستے پر چلتا ہے، اللہ اس کے لیے جنت کا راستہ آسان کر دیتا ہے۔"
              </h3>
              
              <p className="text-lg sm:text-2xl md:text-3xl text-slate-300 font-light italic max-w-5xl mx-auto leading-relaxed">
                "Whoever takes a path upon which to obtain knowledge, Allah makes the path to Paradise easy for him."
              </p>
            </div>

            <div className="mt-12 sm:mt-20 flex items-center justify-center gap-4 sm:gap-8 relative z-10 font-cinzel">
              <div className="h-px w-16 sm:w-32 bg-gradient-to-r from-transparent to-amber-500/60"></div>
              <p className="text-amber-400 font-bold tracking-[0.2em] sm:tracking-[0.4em] uppercase text-[10px] sm:text-[13px]">Sahih Muslim</p>
              <div className="h-px w-16 sm:w-32 bg-gradient-to-l from-transparent to-amber-500/60"></div>
            </div>
          </HolographicCard>
        </motion.div>
      </section>

      {/* --- INTERACTIVE CURRICULUM PREVIEW --- */}
      <section className="py-20 sm:py-32 bg-[#010206] relative z-20 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black font-cinzel uppercase text-white mb-6 tracking-wider">Explore the Curriculum</h2>
            <div className="w-16 h-1 bg-emerald-500/50 mx-auto rounded-full"></div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-10 font-cinzel">
            {curriculumTabs.map((tab, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveCurriculumTab(idx)}
                className={`px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${activeCurriculumTab === idx ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_15px_rgba(52,211,153,0.3)]' : 'bg-[#030612] text-slate-400 border border-white/[0.05] hover:bg-white/[0.05]'}`}
              >
                {tab.title}
              </button>
            ))}
          </div>

          <HolographicCard className="p-10 sm:p-14 rounded-[2rem]">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeCurriculumTab}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto bg-[#020510] border border-white/[0.1] rounded-2xl flex items-center justify-center mb-6 text-emerald-400 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <h3 className="text-3xl font-black font-cinzel uppercase tracking-widest text-white mb-4">{curriculumTabs[activeCurriculumTab].title}</h3>
                <p className="text-slate-400 font-cinzel font-light text-lg max-w-2xl mx-auto leading-relaxed">{curriculumTabs[activeCurriculumTab].desc}</p>
              </motion.div>
            </AnimatePresence>
          </HolographicCard>
        </div>
      </section>

      {/* --- EDGE-MASKED INFINITE SCROLLING TICKER --- */}
      <section className="py-6 sm:py-8 border-y border-white/[0.04] bg-white/[0.01] backdrop-blur-lg relative z-20 flex overflow-hidden shadow-xl">
        <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #010206 0%, transparent 15%, transparent 85%, #010206 100%)' }}></div>
        <motion.div animate={{ x: [0, -1000] }} transition={{ repeat: Infinity, duration: 40, ease: "linear" }} className="flex whitespace-nowrap items-center w-max will-change-transform">
          {[...islamicValues, ...islamicValues, ...islamicValues].map((val, idx) => (
            <div key={idx} className="flex items-center mx-6 sm:mx-16 group cursor-default">
              <span className="text-emerald-500/80 mr-3 sm:mr-4 animate-pulse">✦</span>
              <span className="text-2xl sm:text-3xl font-cinzel font-bold text-slate-300 mr-3 sm:mr-4 group-hover:text-white transition-colors">{val.ar}</span>
              <span className="text-[11px] sm:text-[13px] font-bold font-cinzel tracking-[0.2em] sm:tracking-[0.3em] text-slate-500 uppercase">{val.en}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* --- 3. LUXURY BENTO GRID --- */}
      <section className="py-24 sm:py-40 bg-[#010206] relative z-20 border-t border-white/[0.04]">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div variants={fadeInUp} className="text-center max-w-3xl mx-auto mb-16 sm:mb-28">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black font-cinzel uppercase text-white mb-6 sm:mb-8 tracking-widest">The Deeniyat Advantage</h2>
            <div className="w-24 sm:w-32 h-1.5 bg-gradient-to-r from-emerald-400 to-transparent mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 font-cinzel">
            
            {/* Massive Feature Card */}
            <HolographicCard className="md:col-span-2 p-8 sm:p-14 rounded-[2rem] sm:rounded-[2.5rem]">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-[#060d20] to-[#040814] rounded-[1rem] sm:rounded-[1.5rem] flex items-center justify-center mb-6 sm:mb-10 shadow-lg border border-white/[0.08] text-emerald-400">
                    <svg className="w-8 h-8 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-white mb-4 sm:mb-6">Elite Curriculum</h3>
                  <p className="text-slate-400 leading-relaxed max-w-xl text-lg sm:text-xl font-light">
                    Move beyond basic lectures. Engage with an interactive, meticulously crafted syllabus that takes you from foundational Noorani Qaida to the depths of advanced Tafseer.
                  </p>
                </div>
              </div>
            </HolographicCard>

            {/* Premium Side Feature 1 */}
            <HolographicCard className="p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem]">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#040814] border border-white/[0.1] rounded-[1rem] sm:rounded-[1.25rem] flex items-center justify-center mb-6 sm:mb-10 relative z-10 text-amber-400 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]">
                <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white mb-3 sm:mb-4">Verified Scholars</h3>
              <p className="text-slate-400 font-light leading-relaxed text-base sm:text-lg">Direct access to authentic, certified Ustads dedicated to your growth.</p>
            </HolographicCard>

            {/* Premium Side Feature 2 */}
            <HolographicCard className="p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem]">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#040814] border border-white/[0.1] rounded-[1rem] sm:rounded-[1.25rem] flex items-center justify-center mb-6 sm:mb-10 relative z-10 text-blue-400 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]">
                <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white mb-3 sm:mb-4">Flawless Sync</h3>
              <p className="text-slate-400 font-light leading-relaxed text-base sm:text-lg">Resume your lessons flawlessly across devices with cloud tech.</p>
            </HolographicCard>
            
            {/* Bottom Glow Feature */}
            <HolographicCard className="md:col-span-3 p-8 sm:p-10 md:p-16 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-r from-[#0a1525] via-[#040814] to-[#040814]">
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-10">
                <div>
                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-widest text-white mb-4 sm:mb-6">Master Your Progress</h3>
                  <p className="text-slate-400 max-w-2xl leading-relaxed text-lg sm:text-xl font-light">
                    Attendance analytics, assignment tracking, and crystal-clear progress maps to keep your motivation at its peak.
                  </p>
                </div>
                <Link href="/register" className="w-full md:w-auto shrink-0 px-10 sm:px-14 py-5 sm:py-7 bg-white text-slate-950 font-black rounded-[1.25rem] sm:rounded-[1.5rem] shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all duration-300 flex items-center justify-center gap-3 sm:gap-4 text-base sm:text-lg uppercase tracking-[0.1em] sm:tracking-[0.2em]">
                  Join Platform
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>
            </HolographicCard>

          </div>
        </motion.div>
      </section>

      {/* --- TESTIMONIALS MARQUEE (LIVE REAL FEEDBACK) --- */}
      <section className="py-12 bg-white/[0.01] border-y border-white/[0.04] relative z-20 flex overflow-hidden shadow-xl group cursor-pointer">
        {/* CSS Magic for Smooth Pause & Scroll */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes marquee-scroll {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .css-marquee {
            animation: marquee-scroll linear infinite;
          }
        `}} />
        
        <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #010206 0%, transparent 15%, transparent 85%, #010206 100%)' }}></div>
        
        <div 
          className="flex whitespace-nowrap items-center w-max css-marquee group-hover:[animation-play-state:paused]"
          style={{ 
            animationDuration: `${reviews.length > 0 ? Math.max(80, reviews.length * 15) : 80}s` 
          }}
        >
          {displayReviews.map((val: any, idx: number) => (
            <div key={idx} className="flex items-center mx-8 bg-[#030612]/80 border border-white/[0.08] rounded-full px-6 py-3 backdrop-blur-md shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] font-cinzel transition-transform hover:scale-105">
              <span className="text-amber-400 mr-3 text-lg">
                {reviews.length > 0 ? '★'.repeat(val.rating) : '★★★★★'}
              </span>
              <span className="text-slate-300 font-medium italic mr-3 text-sm">
                "{reviews.length > 0 ? val.review : 'Alhamdulillah, incredible learning platform.'}"
              </span>
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-xs">
                - {reviews.length > 0 && val.studentId?.name ? val.studentId.name : 'Student'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-24 sm:py-32 bg-[#010206] relative z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black font-cinzel uppercase tracking-widest text-white mb-4">Frequently Asked Questions</h2>
            <div className="w-12 h-1 bg-emerald-500/50 mx-auto rounded-full"></div>
          </div>
          
          <div className="space-y-2">
            <FAQItem 
              question="Do I need prior Islamic knowledge to join?" 
              answer="No, our curriculum is designed to accommodate everyone, from complete beginners starting with Noorani Qaida to advanced students looking to master Tafseer." 
            />
            <FAQItem 
              question="Are the classes live or pre-recorded?" 
              answer="We offer a hybrid model. The core material is available via high-quality video modules, and you submit your assignments and recitations for Ustads to review personally." 
            />
            <FAQItem 
              question="Is the platform free?" 
              answer="Creating an account and accessing the orientation materials is completely free. Full course enrollments may require a subscription depending on the specific program." 
            />
          </div>
        </div>
      </section>

      {/* --- 4. CTA SECTION (CINEMATIC FONT) --- */}
      <section className="relative py-32 sm:py-60 overflow-hidden bg-[#010206] border-t border-white/[0.04]">
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center mix-blend-screen opacity-30 sm:opacity-50">
          <div className="absolute w-[100vw] sm:w-[80vw] h-[100vw] sm:h-[80vw] max-w-[1000px] max-h-[1000px] bg-gradient-to-tr from-emerald-500/20 via-teal-900/20 to-blue-600/20 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] blur-[80px] sm:blur-[120px] animate-liquid-morph"></div>
        </div>
        
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#030612]/90 border border-white/[0.1] mb-12 sm:mb-20 backdrop-blur-xl shadow-md">
            <span className="flex h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-black font-cinzel text-[9px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.3em] uppercase">Enrollment Open</span>
          </div>
          
          <h2 className="flex flex-col items-center justify-center font-cinzel leading-[1.1] mb-10 sm:mb-16">
            <span className="text-5xl sm:text-7xl md:text-[7.5rem] font-medium text-white uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              The Journey
            </span>
            <span className="text-4xl sm:text-6xl md:text-[6rem] font-medium text-[#8495a9] uppercase tracking-[0.1em] mt-2 sm:mt-4 drop-shadow-md">
              Begins Here.
            </span>
          </h2>
          
          <p className="text-slate-400 mb-12 sm:mb-20 text-lg sm:text-2xl font-cinzel font-light max-w-3xl mx-auto leading-relaxed">
            Secure your spot in our upcoming batches. Creating an account is completely free and grants you access to orientation materials.
          </p>
          
          <div className="flex justify-center font-cinzel">
            <Link href="/register" className="group relative inline-flex items-center justify-center px-10 sm:px-16 py-6 sm:py-8 text-[15px] sm:text-[18px] font-bold text-white bg-[#030612] rounded-full overflow-hidden transition-all duration-300 active:scale-95 border border-white/[0.15] hover:border-emerald-500/60 uppercase tracking-[0.15em] sm:tracking-[0.25em] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10 flex items-center gap-3 sm:gap-4 drop-shadow-md">
                Create Free Account
                <svg className="w-6 h-6 sm:w-7 sm:h-7 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </span>
            </Link>
          </div>
        </motion.div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: globalAnimations }} />
    </main>
  );
}