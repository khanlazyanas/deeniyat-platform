"use client";

import Link from "next/link";
import { motion, Variants, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { useRef, useState, useEffect } from "react";

// --- 1. Strict Framer Motion Variants ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 50, filter: "blur(15px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 300, damping: 24, mass: 1 } 
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const floatAnimation: Variants = {
  animate: {
    y: [0, -30, 0],
    rotate: [0, 15, -15, 0],
    transition: { duration: 8, repeat: Infinity, ease: "easeInOut" }
  }
};

const wordAnimation: Variants = {
  hidden: { opacity: 0, y: 30, rotateX: -90, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    rotateX: 0,
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 200, damping: 20 }
  }
};

const islamicValues = [
  { ar: "إِخْلَاص", en: "Sincerity" },
  { ar: "إِحْسَان", en: "Excellence" },
  { ar: "صَبْر", en: "Patience" },
  { ar: "تَوَكُّل", en: "Trust" },
  { ar: "شُكْر", en: "Gratitude" },
  { ar: "عِلْم", en: "Knowledge" },
];

// --- 2. Holographic 3D Spatial Card Component ---
function HolographicCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 40, stiffness: 250, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springConfig);

  const [isHovered, setIsHovered] = useState(false);
  const [glarePosition, setGlarePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(relX);
    mouseY.set(relY);
    setGlarePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      variants={fadeInUp}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative overflow-hidden bg-[#030612]/70 backdrop-blur-[40px] backdrop-saturate-[150%] border border-white/[0.06] shadow-[0_32px_64px_-20px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.5)] transition-colors duration-700 hover:border-white/[0.12] will-change-transform ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 z-0 mix-blend-color-dodge"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(1000px circle at ${glarePosition.x}px ${glarePosition.y}px, rgba(255,255,255,0.15), transparent 40%)`,
        }}
      />
      <div 
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 z-0"
        style={{
          opacity: isHovered ? 0.3 : 0,
          boxShadow: `inset 0 0 40px rgba(52,211,153,0.1), inset 0 0 20px rgba(59,130,246,0.1)`
        }}
      />
      <div className="relative z-10 w-full h-full transform-gpu" style={{ transform: "translateZ(30px)" }}>
        {children}
      </div>
    </motion.div>
  );
}

// --- 3. MAIN PAGE COMPONENT ---
export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Advanced Smooth Scroll Physics
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Parallax transforms using smoothed progress
  const yBg = useTransform(smoothProgress, [0, 1], ["0%", "40%"]);
  const opacityBg = useTransform(smoothProgress, [0, 0.8], [1, 0]);
  const yText = useTransform(smoothProgress, [0, 1], ["0%", "120%"]);
  
  // Mouse Parallax for Particles
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      setMousePosition({ 
        x: (e.clientX / window.innerWidth - 0.5) * 40, 
        y: (e.clientY / window.innerHeight - 0.5) * 40 
      });
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  return (
    <main ref={containerRef} className="min-h-screen bg-[#010206] text-slate-50 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-hidden relative perspective-[2000px]">
      
      {/* Top Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 origin-left z-[100] shadow-[0_0_20px_rgba(52,211,153,0.5)]"
        style={{ scaleX: smoothProgress }}
      />

      {/* GLOBAL BACKGROUND */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.025] mix-blend-overlay pointer-events-none z-0"></div>

      {/* --- INTERACTIVE 3D PARTICLES ENGINE --- */}
      <motion.div 
        className="fixed inset-0 overflow-hidden pointer-events-none z-10 transform-gpu"
        animate={{ x: -mousePosition.x, y: -mousePosition.y }}
        transition={{ type: "spring", stiffness: 50, damping: 30 }}
      >
        <motion.div variants={floatAnimation} animate="animate" className="absolute top-[15%] left-[20%] w-2 h-2 bg-emerald-400 rounded-full blur-[1px] shadow-[0_0_20px_rgba(52,211,153,1)] will-change-transform"></motion.div>
        <motion.div variants={floatAnimation} animate="animate" style={{ animationDelay: '1.5s' }} className="absolute top-[40%] right-[15%] w-3 h-3 bg-teal-400 rounded-full blur-[2px] shadow-[0_0_25px_rgba(45,212,191,1)] will-change-transform"></motion.div>
        <motion.div variants={floatAnimation} animate="animate" style={{ animationDelay: '3s' }} className="absolute top-[60%] left-[10%] w-1.5 h-1.5 bg-blue-400 rounded-full blur-[1px] shadow-[0_0_15px_rgba(59,130,246,1)] will-change-transform"></motion.div>
        <motion.div variants={floatAnimation} animate="animate" style={{ animationDelay: '0.8s' }} className="absolute bottom-[25%] right-[25%] w-2.5 h-2.5 bg-emerald-300 rounded-full blur-[1.5px] shadow-[0_0_20px_rgba(110,231,183,1)] will-change-transform"></motion.div>
        <motion.div variants={floatAnimation} animate="animate" style={{ animationDelay: '2.2s' }} className="absolute top-[25%] right-[30%] w-4 h-4 bg-teal-500 rounded-full blur-[4px] opacity-60 shadow-[0_0_30px_rgba(20,184,166,0.8)] will-change-transform"></motion.div>
        <motion.div variants={floatAnimation} animate="animate" style={{ animationDelay: '4.5s' }} className="absolute bottom-[40%] left-[30%] w-2 h-2 bg-white rounded-full blur-[1px] opacity-80 shadow-[0_0_15px_rgba(255,255,255,1)] will-change-transform"></motion.div>
        
        {/* Extra Premium Particles */}
        <motion.div variants={floatAnimation} animate="animate" style={{ animationDelay: '5s' }} className="absolute top-[35%] left-[5%] w-2 h-2 bg-purple-400 rounded-full blur-[1px] shadow-[0_0_15px_rgba(168,85,247,1)] will-change-transform"></motion.div>
        <motion.div variants={floatAnimation} animate="animate" style={{ animationDelay: '1.8s' }} className="absolute top-[55%] right-[25%] w-3 h-3 bg-emerald-400 rounded-full blur-[2px] shadow-[0_0_20px_rgba(52,211,153,0.9)] will-change-transform"></motion.div>
        <motion.div variants={floatAnimation} animate="animate" style={{ animationDelay: '0.9s' }} className="absolute top-[20%] left-[40%] w-5 h-5 bg-amber-500/20 rounded-full blur-[4px] shadow-[0_0_30px_rgba(245,158,11,0.4)] will-change-transform"></motion.div>
      </motion.div>

      {/* --- 1. CINEMATIC HERO SECTION --- */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-24 pb-20">
        
        <motion.div 
          style={{ y: yBg, opacity: opacityBg }} 
          className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none transform-gpu"
        >
          {/* Volumetric Orbs */}
          <motion.div 
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15], rotate: [0, 90, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute w-[60vw] sm:w-[900px] h-[60vw] sm:h-[900px] bg-emerald-600/20 rounded-full blur-[140px] mix-blend-screen will-change-transform"
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1], rotate: [0, -90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 2 }}
            className="absolute w-[40vw] sm:w-[700px] h-[40vw] sm:h-[700px] bg-teal-800/20 rounded-full blur-[120px] mix-blend-screen translate-y-20 translate-x-32 will-change-transform"
          />
          
          {/* Giant Arabic Watermark */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 3, ease: "easeOut" }}
            className="absolute text-[25rem] sm:text-[45rem] font-serif text-white/[0.02] select-none tracking-widest z-0 transform -translate-y-24 drop-shadow-2xl will-change-transform mix-blend-overlay"
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
          <motion.div variants={fadeInUp} className="group cursor-default mb-10 inline-flex flex-col items-center gap-2 px-10 py-5 rounded-full bg-[#030612]/80 border border-amber-500/30 backdrop-blur-3xl shadow-[0_16px_32px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] hover:border-amber-400/80 hover:shadow-[0_0_40px_rgba(245,158,11,0.3)] transition-all duration-700">
            <span className="relative z-10 text-2xl md:text-3xl font-serif text-amber-400/95 font-medium tracking-wider drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </span>
            <div className="relative z-10 flex items-center gap-4 mt-2">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/70"></div>
              <span className="text-[10px] sm:text-xs font-black text-amber-200/90 tracking-[0.4em] uppercase drop-shadow-md">
                In the name of Allah
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/70"></div>
            </div>
          </motion.div>

          {/* Staggered Chromatic Headline */}
          <h1 className="text-5xl sm:text-7xl md:text-[7.5rem] font-black text-white tracking-tighter leading-[1.05] mb-8 flex flex-wrap justify-center gap-x-5 drop-shadow-2xl">
            {["Elevate", "Your", "Spiritual", "Journey"].map((word, i) => (
              <motion.span 
                key={i} variants={wordAnimation}
                className={i >= 2 ? "text-transparent bg-clip-text bg-gradient-to-br from-emerald-300 via-teal-200 to-blue-400 drop-shadow-[0_0_60px_rgba(52,211,153,0.4)] relative inline-block" : "inline-block"}
              >
                {word}
                {i === 3 && <span className="absolute -bottom-4 left-0 w-full h-6 bg-emerald-500/40 blur-2xl rounded-full z-0 pointer-events-none"></span>}
              </motion.span>
            ))}
          </h1>

          <motion.p variants={fadeInUp} className="max-w-3xl text-lg sm:text-2xl text-slate-300 mb-14 leading-relaxed font-light drop-shadow-lg mix-blend-screen">
            Experience the profound beauty of Deen through an elite, immersive curriculum. Master <strong className="text-white font-bold drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">Quran, Fiqh, and Sunnah</strong> with world-class scholars.
          </motion.p>
          
          {/* Magnetic CTA Buttons */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto items-center mb-10">
            <Link href="/courses" className="relative group px-14 py-6 text-[17px] font-black text-slate-950 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full overflow-hidden transition-all duration-500 hover:scale-[1.03] shadow-[0_0_60px_-15px_rgba(52,211,153,0.8),inset_0_1px_1px_rgba(255,255,255,0.8)] ring-1 ring-white/20 active:scale-95">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
              <span className="relative flex items-center gap-3 uppercase tracking-widest">
                Begin Your Path
                <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4-4m4-4H3" /></svg>
              </span>
            </Link>
            
            <Link href="/dashboard" className="px-14 py-6 text-[17px] font-bold text-white bg-[#040814]/60 backdrop-blur-2xl border border-white/[0.08] rounded-full hover:bg-white/[0.05] hover:border-white/[0.2] transition-all duration-300 shadow-[0_16px_32px_rgba(0,0,0,0.5)] uppercase tracking-widest active:scale-95">
              Enter Portal
            </Link>
          </motion.div>
        </motion.div>

        {/* Bouncing Discover Node */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-30">
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 drop-shadow-md">Discover</span>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="w-6 h-10 border-2 border-white/[0.1] rounded-full flex justify-center p-1.5 bg-[#010206]/50 backdrop-blur-md">
            <div className="w-1.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_12px_rgba(52,211,153,1)]"></div>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-0 w-full h-64 bg-gradient-to-t from-[#010206] via-[#010206]/80 to-transparent z-10 pointer-events-none"></div>
      </section>

      {/* --- EDGE-MASKED INFINITE SCROLLING TICKER --- */}
      <section className="py-8 border-y border-white/[0.04] bg-white/[0.01] backdrop-blur-xl relative z-20 flex overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)]">
        <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #010206 0%, transparent 15%, transparent 85%, #010206 100%)' }}></div>
        <motion.div animate={{ x: [0, -1000] }} transition={{ repeat: Infinity, duration: 30, ease: "linear" }} className="flex whitespace-nowrap items-center w-max will-change-transform hover:[animation-play-state:paused]">
          {[...islamicValues, ...islamicValues, ...islamicValues, ...islamicValues].map((val, idx) => (
            <div key={idx} className="flex items-center mx-10 sm:mx-20 group cursor-default">
              <span className="text-emerald-500/80 mr-4 animate-pulse shadow-emerald-500/50">✦</span>
              <span className="text-3xl font-serif text-slate-300 mr-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:text-white transition-colors">{val.ar}</span>
              <span className="text-[13px] font-black tracking-[0.3em] text-slate-500 uppercase group-hover:text-emerald-400 transition-colors">{val.en}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* --- 2. MAJESTIC HADEETH SECTION (Holographic Card) --- */}
      <section className="relative py-48 bg-[#010206] z-20 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[40vw] h-[40vw] bg-emerald-900/10 rounded-full blur-[150px] pointer-events-none transform-gpu"></div>
        <div className="absolute bottom-0 right-1/4 w-[40vw] h-[40vw] bg-teal-900/10 rounded-full blur-[150px] pointer-events-none transform-gpu"></div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="max-w-6xl mx-auto px-4 text-center relative z-10">
          
          <div className="flex justify-center mb-16 relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-[40px] rounded-full w-32 h-32 mx-auto animate-pulse"></div>
            <div className="w-20 h-20 rounded-[1.5rem] bg-[#030612] border border-emerald-500/40 flex items-center justify-center shadow-[0_0_60px_rgba(52,211,153,0.3),inset_0_1px_2px_rgba(255,255,255,0.2)] transform rotate-45 relative z-10 transition-transform duration-700 hover:rotate-90">
              <svg className="w-10 h-10 text-emerald-400 -rotate-45 transition-transform duration-700 hover:-rotate-90" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
          </div>
          
          <HolographicCard className="p-10 md:p-24 rounded-[3.5rem]">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-emerald-400/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-teal-400/20 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="relative z-10 space-y-14">
              <h2 className="text-5xl md:text-6xl lg:text-[4.5rem] font-serif leading-relaxed font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 via-emerald-400 to-teal-200 drop-shadow-[0_0_40px_rgba(52,211,153,0.3)]" dir="rtl" style={{ lineHeight: '1.8' }}>
                مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ
              </h2>
              
              <div className="w-48 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent mx-auto"></div>

              <h3 className="text-3xl md:text-4xl font-serif text-slate-100 leading-loose drop-shadow-xl" dir="rtl">
                "جو شخص علم کی تلاش میں کسی راستے پر چلتا ہے، اللہ اس کے لیے جنت کا راستہ آسان کر دیتا ہے۔"
              </h3>
              
              <p className="text-2xl md:text-3xl text-slate-300 font-light italic max-w-5xl mx-auto leading-relaxed drop-shadow-md">
                "Whoever takes a path upon which to obtain knowledge, Allah makes the path to Paradise easy for him."
              </p>
            </div>

            <div className="mt-20 flex items-center justify-center gap-8 relative z-10">
              <div className="h-px w-32 bg-gradient-to-r from-transparent to-amber-500/60"></div>
              <p className="text-amber-400 font-black tracking-[0.4em] uppercase text-[13px] drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]">Sahih Muslim</p>
              <div className="h-px w-32 bg-gradient-to-l from-transparent to-amber-500/60"></div>
            </div>
          </HolographicCard>
        </motion.div>
      </section>

      {/* --- 3. LUXURY BENTO GRID --- */}
      <section className="py-40 bg-[#010206] relative z-20 border-t border-white/[0.04]">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div variants={fadeInUp} className="text-center max-w-3xl mx-auto mb-28">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tighter drop-shadow-md">The Deeniyat Advantage</h2>
            <div className="w-32 h-1.5 bg-gradient-to-r from-emerald-400 to-transparent mx-auto rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Massive Feature Card */}
            <HolographicCard className="md:col-span-2 p-10 md:p-14 rounded-[2.5rem]">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] translate-x-32 -translate-y-32"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-24 h-24 bg-gradient-to-br from-[#060d20] to-[#040814] rounded-[1.5rem] flex items-center justify-center mb-10 shadow-[0_16px_32px_rgba(0,0,0,0.5),inset_0_2px_2px_rgba(255,255,255,0.1)] border border-white/[0.08] text-emerald-400 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                  <h3 className="text-4xl sm:text-5xl font-black text-white mb-6 tracking-tighter">Elite Curriculum</h3>
                  <p className="text-slate-400 leading-relaxed max-w-xl text-xl font-light">
                    Move beyond basic lectures. Engage with an interactive, meticulously crafted syllabus that takes you from foundational Noorani Qaida to the depths of advanced Tafseer.
                  </p>
                </div>
              </div>
            </HolographicCard>

            {/* Premium Side Feature 1 */}
            <HolographicCard className="p-10 rounded-[2.5rem]">
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px]"></div>
              <div className="w-20 h-20 bg-[#040814] border border-white/[0.08] rounded-[1.25rem] flex items-center justify-center mb-10 relative z-10 text-amber-400 shadow-[0_8px_16px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-3xl font-black text-white mb-4 tracking-tighter">Verified Scholars</h3>
              <p className="text-slate-400 font-light leading-relaxed text-lg">Direct access to authentic, certified Ustads dedicated to your growth.</p>
            </HolographicCard>

            {/* Premium Side Feature 2 */}
            <HolographicCard className="p-10 rounded-[2.5rem]">
              <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]"></div>
              <div className="w-20 h-20 bg-[#040814] border border-white/[0.08] rounded-[1.25rem] flex items-center justify-center mb-10 relative z-10 text-blue-400 shadow-[0_8px_16px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-3xl font-black text-white mb-4 tracking-tighter">Flawless Sync</h3>
              <p className="text-slate-400 font-light leading-relaxed text-lg">Resume your lessons flawlessly across devices with cloud tech.</p>
            </HolographicCard>
            
            {/* Bottom Glow Feature */}
            <HolographicCard className="md:col-span-3 p-10 md:p-16 rounded-[2.5rem] bg-gradient-to-r from-[#0a1525] via-[#040814] to-[#040814]">
              <div className="absolute -inset-full top-0 z-0 block h-full w-1/2 -skew-x-12 transform bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:animate-[shimmer_2s_infinite]"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
                <div>
                  <h3 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter">Master Your Progress</h3>
                  <p className="text-slate-400 max-w-2xl leading-relaxed text-xl font-light">
                    Attendance analytics, assignment tracking, and crystal-clear progress maps to keep your motivation at its peak.
                  </p>
                </div>
                <Link href="/register" className="shrink-0 px-14 py-7 bg-white text-slate-950 font-black rounded-[1.5rem] shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_80px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300 flex items-center gap-4 text-lg border border-white/20 uppercase tracking-[0.2em]">
                  Join Platform
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>
            </HolographicCard>

          </div>
        </motion.div>
      </section>

      {/* --- 4. LIQUID CLIMAX CTA --- */}
      <section className="relative py-60 overflow-hidden bg-[#010206] border-t border-white/[0.04]">
        {/* Liquid Morphing Background from Dashboard */}
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center mix-blend-screen opacity-50">
          <div className="absolute w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] bg-gradient-to-tr from-emerald-500/20 via-teal-900/20 to-blue-600/20 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] blur-[120px] animate-liquid-morph"></div>
        </div>
        
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#030612]/90 border border-white/[0.08] mb-12 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_24px_rgba(0,0,0,0.4)]">
            <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,1)]"></span>
            <span className="text-slate-300 font-black text-[11px] tracking-[0.3em] uppercase">Enrollment Open</span>
          </div>
          
          <h2 className="text-7xl md:text-[8.5rem] font-black text-white mb-10 tracking-tighter leading-[1.05] drop-shadow-2xl">
            The journey of a lifetime begins here.
          </h2>
          <p className="text-slate-400 mb-16 text-2xl font-light max-w-3xl mx-auto leading-relaxed mix-blend-screen">
            Secure your spot in our upcoming batches. Creating an account is completely free and grants you access to orientation materials.
          </p>
          
          <div className="flex justify-center">
            <Link href="/register" className="group relative inline-flex items-center justify-center px-16 py-8 text-[18px] font-black text-white bg-[#030612] rounded-full overflow-hidden transition-all duration-500 hover:scale-[1.05] shadow-[0_24px_48px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/[0.1] hover:border-emerald-500/50 uppercase tracking-[0.25em]">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
              <span className="relative z-10 flex items-center gap-4 drop-shadow-md">
                Create Free Account
                <svg className="w-7 h-7 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </span>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Global CSS for Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer { 100% { transform: translateX(200%); } }
        @keyframes liquid-morph {
          0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(0deg); }
          33% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; transform: rotate(120deg); }
          66% { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; transform: rotate(240deg); }
          100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(360deg); }
        }
      `}} />
    </main>
  );
}