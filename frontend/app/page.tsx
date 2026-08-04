"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";

// --- Framer Motion Variants ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } // Custom bezier curve for buttery smooth ease
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const floatAnimation: Variants = {
  animate: {
    y: [0, -15, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
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
  return (
    <main className="min-h-screen bg-[#020617] text-slate-50 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-hidden relative">
      
      {/* GLOBAL BACKGROUND: Subtle grid to give a structured, premium tech feel combined with Islamic geometry concept */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-20">
        
        {/* Dynamic Glowing Orbs & Floating Particles */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15], rotate: [0, 90, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-[600px] sm:w-[900px] h-[600px] sm:h-[900px] bg-emerald-900/20 rounded-full blur-[120px] mix-blend-screen"
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1], rotate: [0, -90, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute w-[400px] sm:w-[700px] h-[400px] sm:h-[700px] bg-teal-800/20 rounded-full blur-[100px] mix-blend-screen translate-y-20 translate-x-20"
          />
          
          {/* Giant Arabic Watermark (Iqra) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="absolute text-[20rem] sm:text-[35rem] font-serif text-slate-800/10 select-none tracking-widest z-0 transform -translate-y-20 drop-shadow-2xl"
          >
            اقْرَأْ
          </motion.div>
        </div>

        {/* Floating Light Particles */}
        <motion.div variants={floatAnimation} animate="animate" className="absolute top-1/4 left-1/4 w-2 h-2 bg-emerald-400 rounded-full blur-[2px] opacity-60"></motion.div>
        <motion.div variants={floatAnimation} animate="animate" style={{ animationDelay: '1s' }} className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-teal-400 rounded-full blur-[3px] opacity-40"></motion.div>
        <motion.div variants={floatAnimation} animate="animate" style={{ animationDelay: '2s' }} className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-amber-400 rounded-full blur-[1px] opacity-50"></motion.div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 max-w-5xl mx-auto flex flex-col items-center"
        >
          {/* Premium Gold Badge with Arabic */}
          <motion.div variants={fadeInUp} className="group cursor-default mb-10 inline-flex flex-col items-center gap-2 px-8 py-3.5 rounded-3xl bg-slate-900/40 border border-amber-500/20 backdrop-blur-xl shadow-[0_8px_30px_rgba(245,158,11,0.08)] hover:border-amber-400/50 transition-all duration-500 hover:-translate-y-1">
            <span className="text-2xl md:text-3xl font-serif text-amber-400/90 font-medium tracking-wider drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </span>
            <div className="flex items-center gap-4 mt-1">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-500/50"></div>
              <span className="text-[10px] sm:text-xs font-bold text-amber-200/70 tracking-[0.25em] uppercase">
                In the name of Allah
              </span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-500/50"></div>
            </div>
          </motion.div>

          {/* Majestic Headline */}
          <motion.h1 variants={fadeInUp} className="text-5xl sm:text-7xl md:text-[5.5rem] font-black text-white tracking-tighter leading-[1.05] mb-8">
            Elevate Your <br className="hidden md:block" />
            <span className="relative whitespace-nowrap">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.4)]">
                Spiritual Journey
              </span>
              {/* Highlight swoosh underneath */}
              <span className="absolute -bottom-2 left-0 w-full h-4 bg-emerald-500/20 blur-lg rounded-full z-0"></span>
            </span>
          </motion.h1>

          {/* Sophisticated Subtitle */}
          <motion.p variants={fadeInUp} className="max-w-2xl text-lg sm:text-xl text-slate-400 mb-14 leading-relaxed font-light">
            Experience the profound beauty of Deen through an elite, immersive curriculum. Master <strong className="text-slate-200 font-medium">Quran, Fiqh, and Sunnah</strong> with world-class scholars.
          </motion.p>
          
          {/* Ultra-Premium CTA Buttons */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto items-center">
            <Link 
              href="/courses" 
              className="relative group px-12 py-5 text-base font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full overflow-hidden transition-all duration-500 hover:scale-[1.02] shadow-[0_0_40px_-10px_rgba(52,211,153,0.6)] hover:shadow-[0_0_60px_-15px_rgba(52,211,153,0.9)]"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
              <span className="relative flex items-center gap-3">
                Begin Your Path
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4-4m4-4H3" /></svg>
              </span>
            </Link>
            
            <Link 
              href="/dashboard" 
              className="px-12 py-5 text-base font-bold text-white bg-slate-900/30 backdrop-blur-md border border-slate-700/50 rounded-full hover:bg-slate-800 hover:border-slate-400 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            >
              Enter Portal
            </Link>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-0 w-full h-48 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent z-10 pointer-events-none"></div>
      </section>

      {/* INFINITE SCROLLING VALUES TICKER */}
      <section className="py-6 border-y border-slate-800/40 bg-slate-900/20 backdrop-blur-sm relative z-20 flex overflow-hidden">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="flex whitespace-nowrap items-center"
        >
          {[...islamicValues, ...islamicValues, ...islamicValues].map((val, idx) => (
            <div key={idx} className="flex items-center mx-8 sm:mx-16">
              <span className="text-emerald-500/80 mr-3">✦</span>
              <span className="text-2xl font-serif text-slate-300 mr-3 drop-shadow-sm">{val.ar}</span>
              <span className="text-sm font-medium tracking-widest text-slate-500 uppercase">{val.en}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* 2. MAJESTIC HADEETH SECTION */}
      <section className="relative py-32 bg-[#020617] z-20 overflow-hidden">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
          className="max-w-4xl mx-auto px-4 text-center relative z-10"
        >
          {/* Decorative Top Accent */}
          <div className="flex justify-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-emerald-900/50 flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.15)] transform rotate-45">
              <svg className="w-8 h-8 text-emerald-400 -rotate-45" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
          </div>
          
          <div className="relative bg-slate-900/30 backdrop-blur-xl border border-slate-800/60 rounded-[3rem] p-10 md:p-16 shadow-2xl">
            {/* Glowing Corner Accents */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl"></div>

            <div className="relative z-10 space-y-10">
              {/* Arabic */}
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif text-emerald-400 leading-relaxed font-medium drop-shadow-lg" dir="rtl" style={{ lineHeight: '1.6' }}>
                مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ
              </h2>
              
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mx-auto"></div>

              {/* Urdu */}
              <h3 className="text-xl md:text-3xl font-serif text-slate-200 leading-loose drop-shadow-md" dir="rtl">
                "جو شخص علم کی تلاش میں کسی راستے پر چلتا ہے، اللہ اس کے لیے جنت کا راستہ آسان کر دیتا ہے۔"
              </h3>
              
              {/* English */}
              <p className="text-lg md:text-xl text-slate-400 font-light italic max-w-3xl mx-auto leading-relaxed">
                "Whoever takes a path upon which to obtain knowledge, Allah makes the path to Paradise easy for him."
              </p>
            </div>

            <div className="mt-12 flex items-center justify-center gap-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/50"></div>
              <p className="text-amber-400/90 font-bold tracking-[0.2em] uppercase text-sm">Sahih Muslim</p>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/50"></div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. LUXURY BENTO GRID */}
      <section className="py-24 bg-[#020617] relative z-20">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          
          <motion.div variants={fadeInUp} className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">The Deeniyat Advantage</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-emerald-500 to-transparent mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Massive Feature Card */}
            <motion.div variants={fadeInUp} className="md:col-span-2 group relative bg-slate-900/30 rounded-[2rem] p-10 md:p-14 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-900/50 overflow-hidden backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(52,211,153,0.15)]">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700 translate-x-20 -translate-y-20"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(52,211,153,0.3)] group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-8 h-8 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Elite Curriculum</h3>
                  <p className="text-slate-400 leading-relaxed max-w-lg text-lg font-light group-hover:text-slate-300 transition-colors">
                    Move beyond basic lectures. Engage with an interactive, meticulously crafted syllabus that takes you from foundational Noorani Qaida to the depths of advanced Tafseer.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Premium Side Feature 1 */}
            <motion.div variants={fadeInUp} className="group relative bg-slate-900/30 rounded-[2rem] p-10 border border-slate-800/80 hover:border-amber-500/40 hover:bg-slate-900/50 overflow-hidden backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.1)]">
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-700"></div>
              <div className="w-14 h-14 bg-slate-800/80 border border-slate-700 rounded-2xl flex items-center justify-center mb-8 relative z-10 group-hover:bg-amber-500/20 transition-colors duration-500 text-amber-400">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 relative z-10">Verified Scholars</h3>
              <p className="text-slate-400 font-light leading-relaxed relative z-10 group-hover:text-slate-300 transition-colors">Direct access to authentic, certified Ustads dedicated to your personal growth.</p>
            </motion.div>

            {/* Premium Side Feature 2 */}
            <motion.div variants={fadeInUp} className="group relative bg-slate-900/30 rounded-[2rem] p-10 border border-slate-800/80 hover:border-blue-500/40 hover:bg-slate-900/50 overflow-hidden backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.1)]">
              <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
              <div className="w-14 h-14 bg-slate-800/80 border border-slate-700 rounded-2xl flex items-center justify-center mb-8 relative z-10 group-hover:bg-blue-500/20 transition-colors duration-500 text-blue-400">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 relative z-10">Flawless Sync</h3>
              <p className="text-slate-400 font-light leading-relaxed relative z-10 group-hover:text-slate-300 transition-colors">Resume your lessons flawlessly across devices with our cutting-edge cloud tech.</p>
            </motion.div>
            
            {/* Bottom Glow Feature */}
            <motion.div variants={fadeInUp} className="md:col-span-3 group bg-gradient-to-r from-emerald-900/30 to-slate-900/40 rounded-[2rem] p-10 md:p-14 border border-emerald-900/40 relative overflow-hidden transition-all duration-500 hover:border-emerald-400/60 shadow-xl hover:shadow-[0_20px_50px_-15px_rgba(52,211,153,0.3)] hover:-translate-y-1">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Master Your Progress</h3>
                  <p className="text-emerald-100/70 max-w-xl leading-relaxed text-lg font-light">
                    Attendance analytics, assignment tracking, and crystal-clear progress maps to keep your motivation at its peak.
                  </p>
                </div>
                <Link href="/register" className="shrink-0 px-10 py-5 bg-white text-slate-900 font-bold rounded-full shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-105 transition-all duration-300 flex items-center gap-2">
                  Join the Platform
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </section>

      {/* 4. EXCLUSIVE CALL TO ACTION */}
      <section className="relative py-40 overflow-hidden bg-slate-950 border-t border-slate-900">
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"
        />
        
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          className="relative z-10 max-w-3xl mx-auto px-4 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/80 border border-emerald-800/80 mb-8 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-300 font-medium text-sm tracking-wide">Enrollment Currently Open</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight">The journey of a lifetime begins here.</h2>
          <p className="text-slate-400 mb-12 text-xl font-light max-w-2xl mx-auto leading-relaxed">
            Secure your spot in our upcoming batches. Creating an account is completely free and grants you access to orientation materials.
          </p>
          <div className="flex justify-center">
            <Link 
              href="/register" 
              className="group relative inline-flex items-center justify-center px-12 py-5 text-lg font-bold text-white bg-emerald-600 rounded-full overflow-hidden transition-all hover:scale-[1.03] shadow-[0_0_50px_-10px_rgba(52,211,153,0.4)] hover:shadow-[0_0_70px_-15px_rgba(52,211,153,0.8)] border border-emerald-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10 flex items-center gap-3">
                Create Free Account
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </span>
            </Link>
          </div>
        </motion.div>
      </section>
      
    </main>
  );
}