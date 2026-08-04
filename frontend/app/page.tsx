"use client";

import Link from "next/link";
import { motion, Variants, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

// --- Framer Motion Advanced Variants ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } 
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
    y: [0, -25, 0],
    rotate: [0, 10, -10, 0],
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
  }
};

const wordAnimation: Variants = {
  hidden: { opacity: 0, y: 20, rotateX: -90 },
  visible: { 
    opacity: 1, 
    y: 0, 
    rotateX: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

// Values for the infinite scrolling ticker
const islamicValues = [
  { ar: "إِخْلَاص", en: "Sincerity" },
  { ar: "إِحْسَان", en: "Excellence" },
  { ar: "صَبْر", en: "Patience" },
  { ar: "تَوَكُّل", en: "Trust" },
  { ar: "شُكْر", en: "Gratitude" },
  { ar: "عِلْم", en: "Knowledge" },
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Advanced Scroll Physics
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Parallax transforms
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacityBg = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Global Scroll Progress Bar (Top of screen)
  const scaleX = useScroll().scrollYProgress;

  return (
    <main ref={containerRef} className="min-h-screen bg-[#020617] text-slate-50 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-hidden relative">
      
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 origin-left z-[100]"
        style={{ scaleX }}
      />

      {/* GLOBAL BACKGROUND: Refined tech grid */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>

      {/* 1. CINEMATIC HERO SECTION (With Parallax & Overlap Fix) */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-10 pb-20 perspective-[1000px]">
        
        {/* Parallax Background Orbs & Watermark */}
        <motion.div 
          style={{ y: yBg, opacity: opacityBg }} 
          className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
        >
          <motion.div 
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-[600px] sm:w-[900px] h-[600px] sm:h-[900px] bg-emerald-900/20 rounded-full blur-[120px] mix-blend-screen"
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1], rotate: [0, -90, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute w-[400px] sm:w-[700px] h-[400px] sm:h-[700px] bg-teal-800/20 rounded-full blur-[100px] mix-blend-screen translate-y-20 translate-x-20"
          />
          
          {/* Giant Arabic Watermark (Iqra) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="absolute text-[20rem] sm:text-[40rem] font-serif text-slate-800/10 select-none tracking-widest z-0 transform -translate-y-24 drop-shadow-2xl"
          >
            اقْرَأْ
          </motion.div>
        </motion.div>

        {/* 15+ HIGH-DENSITY FLOATING PARTICLES */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          <motion.div variants={floatAnimation} animate="animate" className="absolute top-[15%] left-[20%] w-2 h-2 bg-emerald-400 rounded-full blur-[1px] shadow-[0_0_15px_rgba(52,211,153,0.8)]"></motion.div>
          <motion.div variants={floatAnimation} animate="animate" style={{ animationDelay: '1.5s' }} className="absolute top-[40%] right-[15%] w-3 h-3 bg-teal-400 rounded-full blur-[2px] shadow-[0_0_20px_rgba(45,212,191,0.8)]"></motion.div>
          <motion.div variants={floatAnimation} animate="animate" style={{ animationDelay: '3s' }} className="absolute top-[60%] left-[10%] w-1.5 h-1.5 bg-amber-400 rounded-full blur-[1px] shadow-[0_0_10px_rgba(245,158,11,0.8)]"></motion.div>
          <motion.div variants={floatAnimation} animate="animate" style={{ animationDelay: '0.8s' }} className="absolute bottom-[25%] right-[25%] w-2.5 h-2.5 bg-emerald-300 rounded-full blur-[1.5px] shadow-[0_0_12px_rgba(110,231,183,0.8)]"></motion.div>
          <motion.div variants={floatAnimation} animate="animate" style={{ animationDelay: '2.2s' }} className="absolute top-[25%] right-[30%] w-4 h-4 bg-teal-500 rounded-full blur-[4px] opacity-40 shadow-[0_0_25px_rgba(20,184,166,0.6)]"></motion.div>
          <motion.div variants={floatAnimation} animate="animate" style={{ animationDelay: '4.5s' }} className="absolute bottom-[40%] left-[30%] w-2 h-2 bg-white rounded-full blur-[1px] opacity-70 shadow-[0_0_10px_rgba(255,255,255,0.8)]"></motion.div>
          <motion.div variants={floatAnimation} animate="animate" style={{ animationDelay: '1.1s' }} className="absolute top-[10%] right-[45%] w-1 h-1 bg-emerald-200 rounded-full blur-[0.5px] shadow-[0_0_5px_rgba(167,243,208,0.8)]"></motion.div>
          <motion.div variants={floatAnimation} animate="animate" style={{ animationDelay: '3.7s' }} className="absolute bottom-[15%] left-[45%] w-3 h-3 bg-amber-300 rounded-full blur-[2px] opacity-50 shadow-[0_0_15px_rgba(252,211,77,0.8)]"></motion.div>
          <motion.div variants={floatAnimation} animate="animate" style={{ animationDelay: '0.3s' }} className="absolute top-[50%] right-[5%] w-2 h-2 bg-teal-300 rounded-full blur-[1px] shadow-[0_0_10px_rgba(94,234,212,0.8)]"></motion.div>
          <motion.div variants={floatAnimation} animate="animate" style={{ animationDelay: '2.9s' }} className="absolute top-[75%] left-[25%] w-1.5 h-1.5 bg-emerald-500 rounded-full blur-[1px] shadow-[0_0_10px_rgba(16,185,129,0.8)]"></motion.div>
        </div>

        {/* Hero Content with Parallax Text - Shifted up slightly (-translate-y-8) to avoid overlap */}
        <motion.div 
          style={{ y: yText }}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-20 max-w-5xl mx-auto flex flex-col items-center transform -translate-y-8 pb-10"
        >
          {/* Premium Gold Badge with Arabic */}
          <motion.div variants={fadeInUp} className="group cursor-default mb-10 inline-flex flex-col items-center gap-2 px-8 py-4 rounded-3xl bg-slate-900/30 border border-amber-500/20 backdrop-blur-2xl shadow-[0_10px_40px_rgba(245,158,11,0.15)] hover:border-amber-400/60 hover:bg-slate-900/50 transition-all duration-700 hover:-translate-y-1">
            <span className="text-2xl md:text-3xl font-serif text-amber-400/90 font-medium tracking-wider drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </span>
            <div className="flex items-center gap-4 mt-1">
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-amber-500/50"></div>
              <span className="text-[10px] sm:text-xs font-bold text-amber-200/70 tracking-[0.3em] uppercase drop-shadow-md">
                In the name of Allah
              </span>
              <div className="h-px w-10 bg-gradient-to-l from-transparent to-amber-500/50"></div>
            </div>
          </motion.div>

          {/* Majestic Headline - Word by Word */}
          <h1 className="text-5xl sm:text-7xl md:text-[6rem] font-black text-white tracking-tighter leading-[1.05] mb-8 flex flex-wrap justify-center gap-x-4">
            {["Elevate", "Your", "Spiritual", "Journey"].map((word, i) => (
              <motion.span 
                key={i} 
                variants={wordAnimation}
                className={i >= 2 ? "text-transparent bg-clip-text bg-gradient-to-br from-emerald-300 via-teal-200 to-emerald-500 drop-shadow-[0_0_40px_rgba(52,211,153,0.4)] relative" : ""}
              >
                {word}
                {i === 3 && (
                  <span className="absolute -bottom-3 left-0 w-full h-4 bg-emerald-500/30 blur-xl rounded-full z-0"></span>
                )}
              </motion.span>
            ))}
          </h1>

          {/* Sophisticated Subtitle */}
          <motion.p variants={fadeInUp} className="max-w-2xl text-lg sm:text-xl text-slate-300 mb-12 leading-relaxed font-light drop-shadow-sm">
            Experience the profound beauty of Deen through an elite, immersive curriculum. Master <strong className="text-white font-semibold drop-shadow-md">Quran, Fiqh, and Sunnah</strong> with world-class scholars.
          </motion.p>
          
          {/* Ultra-Premium CTA Buttons */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto items-center mb-10">
            <Link 
              href="/courses" 
              className="relative group px-12 py-5 text-base font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full overflow-hidden transition-all duration-500 hover:scale-[1.03] shadow-[0_0_40px_-10px_rgba(52,211,153,0.6)] hover:shadow-[0_0_70px_-10px_rgba(52,211,153,1)] ring-1 ring-white/20"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
              <span className="relative flex items-center gap-3">
                Begin Your Path
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4-4m4-4H3" /></svg>
              </span>
            </Link>
            
            <Link 
              href="/dashboard" 
              className="px-12 py-5 text-base font-bold text-white bg-slate-900/30 backdrop-blur-md border border-slate-700/50 rounded-full hover:bg-slate-800 hover:border-slate-400 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] ring-1 ring-inset ring-white/5"
            >
              Enter Portal
            </Link>
          </motion.div>
        </motion.div>

        {/* Bouncing Scroll Indicator - Safely positioned at absolute bottom */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30"
        >
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold drop-shadow-md">Discover</span>
          <motion.div 
            animate={{ y: [0, 8, 0] }} 
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-5 h-8 border-2 border-slate-500/80 rounded-full flex justify-center p-1 bg-[#020617]/50 backdrop-blur-sm"
          >
            <div className="w-1 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-0 w-full h-48 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent z-10 pointer-events-none"></div>
      </section>

      {/* EDGE-MASKED INFINITE SCROLLING VALUES TICKER */}
      <section className="py-6 border-y border-slate-800/40 bg-slate-900/40 backdrop-blur-md relative z-20 flex overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        {/* Gradient Mask for smooth edge fading */}
        <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #020617 0%, transparent 15%, transparent 85%, #020617 100%)' }}></div>
        
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="flex whitespace-nowrap items-center w-max"
        >
          {[...islamicValues, ...islamicValues, ...islamicValues, ...islamicValues].map((val, idx) => (
            <div key={idx} className="flex items-center mx-8 sm:mx-16">
              <span className="text-emerald-500/80 mr-3 animate-pulse shadow-emerald-500/50">✦</span>
              <span className="text-2xl font-serif text-slate-200 mr-3 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{val.ar}</span>
              <span className="text-sm font-medium tracking-[0.2em] text-slate-400 uppercase">{val.en}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* 2. MAJESTIC HADEETH SECTION (UPGRADED SHADOWS & PREMIUM FEEL) */}
      <section className="relative py-40 bg-[#020617] z-20 overflow-hidden">
        
        {/* Ambient background glows for the section */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-900/10 rounded-full blur-[150px] pointer-events-none"></div>

        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
          className="max-w-5xl mx-auto px-4 text-center relative z-10"
        >
          {/* Decorative Top Accent */}
          <div className="flex justify-center mb-12 relative">
            <div className="absolute inset-0 bg-emerald-500/30 blur-[30px] rounded-full w-24 h-24 mx-auto animate-pulse"></div>
            <div className="w-16 h-16 rounded-2xl bg-[#020617] border border-emerald-400/40 flex items-center justify-center shadow-[0_0_50px_rgba(52,211,153,0.4),inset_0_0_20px_rgba(52,211,153,0.2)] transform rotate-45 relative z-10 transition-transform duration-700 hover:rotate-90">
              <svg className="w-8 h-8 text-emerald-400 -rotate-45 transition-transform duration-700 hover:-rotate-90" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
          </div>
          
          {/* GOD-TIER PREMIUM BOX WITH INSANE SHADOWS */}
          <div className="relative bg-gradient-to-b from-slate-900/80 to-slate-900/40 backdrop-blur-3xl border border-emerald-500/30 rounded-[3rem] p-10 md:p-20 shadow-[0_0_100px_rgba(16,185,129,0.15),inset_0_0_60px_rgba(16,185,129,0.05),0_20px_40px_-10px_rgba(0,0,0,0.8)] ring-1 ring-white/10 overflow-hidden group hover:border-emerald-400/50 hover:shadow-[0_0_120px_rgba(16,185,129,0.25),inset_0_0_80px_rgba(16,185,129,0.1)] transition-all duration-700">
            
            {/* Inner Glowing Corner Accents */}
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-emerald-400/20 rounded-full blur-[80px] group-hover:bg-emerald-400/30 transition-colors duration-700"></div>
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-teal-400/20 rounded-full blur-[80px] group-hover:bg-teal-400/30 transition-colors duration-700"></div>
            
            {/* Noise texture overlay inside the box for organic feel */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

            <div className="relative z-10 space-y-12">
              {/* Premium Metallic Gradient Arabic Text */}
              <h2 className="text-4xl md:text-5xl lg:text-[4rem] font-serif leading-relaxed font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 via-emerald-400 to-teal-200 drop-shadow-[0_0_30px_rgba(52,211,153,0.3)]" dir="rtl" style={{ lineHeight: '1.8' }}>
                مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ
              </h2>
              
              <div className="w-40 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent mx-auto"></div>

              {/* Urdu */}
              <h3 className="text-2xl md:text-3xl font-serif text-slate-100 leading-loose drop-shadow-md" dir="rtl">
                "جو شخص علم کی تلاش میں کسی راستے پر چلتا ہے، اللہ اس کے لیے جنت کا راستہ آسان کر دیتا ہے۔"
              </h3>
              
              {/* English */}
              <p className="text-xl md:text-2xl text-slate-300 font-light italic max-w-4xl mx-auto leading-relaxed drop-shadow-sm">
                "Whoever takes a path upon which to obtain knowledge, Allah makes the path to Paradise easy for him."
              </p>
            </div>

            {/* Bottom Badge inside the box */}
            <div className="mt-16 flex items-center justify-center gap-6">
              <div className="h-px w-24 bg-gradient-to-r from-transparent to-amber-400/60"></div>
              <p className="text-amber-400 font-bold tracking-[0.3em] uppercase text-sm drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]">Sahih Muslim</p>
              <div className="h-px w-24 bg-gradient-to-l from-transparent to-amber-400/60"></div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. LUXURY BENTO GRID */}
      <section className="py-32 bg-[#020617] relative z-20 border-t border-slate-900/80">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          
          <motion.div variants={fadeInUp} className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">The Deeniyat Advantage</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-emerald-500 to-transparent mx-auto rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Massive Feature Card */}
            <motion.div variants={fadeInUp} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="md:col-span-2 group relative bg-slate-900/40 rounded-[2.5rem] p-10 md:p-14 border border-slate-700/50 hover:border-emerald-400/50 hover:bg-slate-900/70 overflow-hidden backdrop-blur-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] ring-1 ring-white/10 hover:shadow-[0_0_50px_rgba(52,211,153,0.15)]">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] group-hover:bg-emerald-500/20 transition-all duration-700 translate-x-32 -translate-y-32"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center mb-10 shadow-[0_0_40px_rgba(52,211,153,0.5)] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 border border-white/30">
                    <svg className="w-10 h-10 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                  <h3 className="text-4xl font-bold text-white mb-5 drop-shadow-md">Elite Curriculum</h3>
                  <p className="text-slate-300 leading-relaxed max-w-xl text-xl font-light group-hover:text-white transition-colors">
                    Move beyond basic lectures. Engage with an interactive, meticulously crafted syllabus that takes you from foundational Noorani Qaida to the depths of advanced Tafseer.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Premium Side Feature 1 */}
            <motion.div variants={fadeInUp} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="group relative bg-slate-900/40 rounded-[2.5rem] p-10 border border-slate-700/50 hover:border-amber-400/50 hover:bg-slate-900/70 overflow-hidden backdrop-blur-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] ring-1 ring-white/10 hover:shadow-[0_0_50px_rgba(245,158,11,0.1)]">
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] group-hover:bg-amber-500/20 transition-all duration-700"></div>
              <div className="w-16 h-16 bg-slate-800 border border-slate-600 rounded-2xl flex items-center justify-center mb-10 relative z-10 group-hover:bg-amber-500/20 group-hover:border-amber-500/50 transition-colors duration-500 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Verified Scholars</h3>
              <p className="text-slate-300 font-light leading-relaxed relative z-10 group-hover:text-white transition-colors text-lg">Direct access to authentic, certified Ustads dedicated to your personal growth.</p>
            </motion.div>

            {/* Premium Side Feature 2 */}
            <motion.div variants={fadeInUp} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="group relative bg-slate-900/40 rounded-[2.5rem] p-10 border border-slate-700/50 hover:border-blue-400/50 hover:bg-slate-900/70 overflow-hidden backdrop-blur-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] ring-1 ring-white/10 hover:shadow-[0_0_50px_rgba(59,130,246,0.1)]">
              <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] group-hover:bg-blue-500/20 transition-all duration-700"></div>
              <div className="w-16 h-16 bg-slate-800 border border-slate-600 rounded-2xl flex items-center justify-center mb-10 relative z-10 group-hover:bg-blue-500/20 group-hover:border-blue-500/50 transition-colors duration-500 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Flawless Sync</h3>
              <p className="text-slate-300 font-light leading-relaxed relative z-10 group-hover:text-white transition-colors text-lg">Resume your lessons flawlessly across devices with our cutting-edge cloud tech.</p>
            </motion.div>
            
            {/* Bottom Glow Feature */}
            <motion.div variants={fadeInUp} whileHover={{ scale: 1.01 }} className="md:col-span-3 group bg-gradient-to-r from-emerald-900/40 via-slate-900/70 to-slate-900/40 rounded-[2.5rem] p-10 md:p-16 border border-emerald-500/30 relative overflow-hidden transition-all duration-500 hover:border-emerald-400/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay pointer-events-none"></div>
              
              {/* Dynamic light beam effect on hover */}
              <div className="absolute -inset-full top-0 z-0 block h-full w-1/2 -skew-x-12 transform bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-shimmer"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
                <div>
                  <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-md">Master Your Progress</h3>
                  <p className="text-emerald-100/80 max-w-2xl leading-relaxed text-xl font-light">
                    Attendance analytics, assignment tracking, and crystal-clear progress maps to keep your motivation at its peak.
                  </p>
                </div>
                <Link href="/register" className="shrink-0 px-12 py-6 bg-white text-slate-950 font-extrabold rounded-full shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_70px_rgba(255,255,255,0.6)] hover:scale-105 transition-all duration-300 flex items-center gap-3 text-lg ring-4 ring-white/30">
                  Join the Platform
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </section>

      {/* 4. EXCLUSIVE CALL TO ACTION */}
      <section className="relative py-48 overflow-hidden bg-[#020617] border-t border-slate-800/80">
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-emerald-600/15 rounded-full blur-[150px] pointer-events-none"
        />
        
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          className="relative z-10 max-w-4xl mx-auto px-4 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-emerald-950/90 border border-emerald-600/50 mb-10 backdrop-blur-xl shadow-[0_0_30px_rgba(52,211,153,0.3)]">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,1)]"></span>
            <span className="text-emerald-300 font-bold text-sm tracking-widest uppercase">Enrollment Currently Open</span>
          </div>
          <h2 className="text-6xl md:text-8xl font-black text-white mb-10 tracking-tight leading-[1.1] drop-shadow-xl">
            The journey of a lifetime begins here.
          </h2>
          <p className="text-slate-300 mb-14 text-2xl font-light max-w-3xl mx-auto leading-relaxed">
            Secure your spot in our upcoming batches. Creating an account is completely free and grants you access to orientation materials.
          </p>
          <div className="flex justify-center">
            <Link 
              href="/register" 
              className="group relative inline-flex items-center justify-center px-14 py-6 text-xl font-bold text-white bg-emerald-600 rounded-full overflow-hidden transition-all hover:scale-[1.03] shadow-[0_0_60px_-10px_rgba(52,211,153,0.6)] hover:shadow-[0_0_100px_-10px_rgba(52,211,153,1)] border border-emerald-400/60 ring-2 ring-inset ring-white/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10 flex items-center gap-3 drop-shadow-md">
                Create Free Account
                <svg className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </span>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Tailwind config for dynamic hover shimmer beam */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}} />
    </main>
  );
}