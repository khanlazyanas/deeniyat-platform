import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-50 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-hidden">
      
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        
        {/* Deep Islamic Geometric Glow (Simulated with gradients) */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-[800px] h-[800px] bg-emerald-900/20 rounded-full blur-[120px] mix-blend-screen"></div>
          <div className="absolute w-[600px] h-[600px] bg-teal-900/20 rounded-full blur-[100px] mix-blend-screen translate-y-20"></div>
          {/* Subtle noise texture for high-end feel */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center mt-20">
          
          {/* Premium Gold Badge */}
          <div className="group cursor-default mb-10 inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-slate-900/50 border border-amber-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:border-amber-400/60 transition-all duration-500">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]"></span>
            <span className="text-sm font-semibold text-amber-300/90 tracking-widest uppercase letter-spacing-2">
              Bismillah ir-Rahman ir-Rahim
            </span>
          </div>

          {/* Majestic Headline */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tighter leading-[1.05] mb-8 drop-shadow-2xl">
            Elevate Your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 filter drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]">
              Spiritual Journey
            </span>
          </h1>

          {/* Sophisticated Subtitle */}
          <p className="max-w-2xl text-lg sm:text-xl text-slate-400 mb-12 leading-relaxed font-light">
            Experience the profound beauty of Deen through an elite, immersive curriculum. Master Quran, Fiqh, and Sunnah with world-class scholars.
          </p>
          
          {/* Ultra-Premium CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto items-center">
            <Link 
              href="/courses" 
              className="relative group px-10 py-5 text-base font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(52,211,153,0.8)]"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
              <span className="relative flex items-center gap-3">
                Begin Your Path
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </span>
            </Link>
            
            <Link 
              href="/dashboard" 
              className="px-10 py-5 text-base font-bold text-white bg-transparent border border-slate-700 rounded-full hover:bg-slate-800 hover:border-slate-500 transition-all duration-300"
            >
              Enter Portal
            </Link>
          </div>
        </div>

        {/* Fading bottom edge */}
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#020617] to-transparent z-10"></div>
      </section>

      {/* 2. MAJESTIC QUOTE SECTION */}
      <section className="relative py-16 bg-[#020617] border-y border-slate-800/50 z-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <svg className="w-10 h-10 mx-auto text-amber-500/50 mb-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <h2 className="text-2xl md:text-4xl font-serif text-slate-200 leading-snug font-medium italic">
            "Seeking knowledge is an obligation upon every Muslim."
          </h2>
          <p className="mt-4 text-amber-400/80 font-semibold tracking-widest uppercase text-sm">Sunan Ibn Majah</p>
        </div>
      </section>

      {/* 3. LUXURY BENTO GRID (Glassmorphism & Dark Mode) */}
      <section className="py-32 bg-[#020617] relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">The Deeniyat Advantage</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-transparent mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Massive Feature Card */}
            <div className="md:col-span-2 group relative bg-slate-900/40 rounded-[2rem] p-10 md:p-14 border border-slate-800 hover:border-emerald-500/30 overflow-hidden backdrop-blur-sm transition-all duration-500">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700 translate-x-20 -translate-y-20"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                    <svg className="w-8 h-8 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Elite Curriculum</h3>
                  <p className="text-slate-400 leading-relaxed max-w-lg text-lg font-light">
                    Move beyond basic lectures. Engage with an interactive, meticulously crafted syllabus that takes you from foundational Noorani Qaida to the depths of advanced Tafseer.
                  </p>
                </div>
              </div>
            </div>

            {/* Premium Side Feature 1 */}
            <div className="group relative bg-slate-900/40 rounded-[2rem] p-10 border border-slate-800 hover:border-amber-500/30 overflow-hidden backdrop-blur-sm transition-all duration-500">
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-700"></div>
              <div className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-500 text-amber-400">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 relative z-10">Verified Scholars</h3>
              <p className="text-slate-400 font-light leading-relaxed relative z-10">Direct access to authentic, certified Ustads dedicated to your personal growth.</p>
            </div>

            {/* Premium Side Feature 2 */}
            <div className="group relative bg-slate-900/40 rounded-[2rem] p-10 border border-slate-800 hover:border-blue-500/30 overflow-hidden backdrop-blur-sm transition-all duration-500">
              <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
              <div className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-500 text-blue-400">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 relative z-10">Flawless Sync</h3>
              <p className="text-slate-400 font-light leading-relaxed relative z-10">Resume your lessons flawlessly across devices with our cutting-edge cloud tech.</p>
            </div>
            
            {/* Bottom Glow Feature - Spans 2 Columns */}
            <div className="md:col-span-2 group bg-gradient-to-r from-emerald-900/40 to-slate-900/40 rounded-[2rem] p-10 md:p-14 border border-emerald-900/50 relative overflow-hidden transition-all duration-500 hover:border-emerald-500/50">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">Master Your Progress</h3>
                  <p className="text-emerald-100/70 max-w-md leading-relaxed text-lg font-light">
                    Attendance analytics, assignment tracking, and crystal-clear progress maps to keep your motivation at its peak.
                  </p>
                </div>
                <Link href="/register" className="shrink-0 px-8 py-4 bg-white text-slate-900 font-bold rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300">
                  Join the Platform
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. EXCLUSIVE CALL TO ACTION */}
      <section className="relative py-32 overflow-hidden bg-slate-950 border-t border-slate-900">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950 border border-emerald-800 mb-8">
            <span className="text-emerald-400 font-medium text-sm">Enrollment Open</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tight">The journey of a lifetime begins here.</h2>
          <p className="text-slate-400 mb-12 text-xl font-light">
            Secure your spot in our upcoming batches. Creating an account is completely free.
          </p>
          <div className="flex justify-center">
            <Link 
              href="/register" 
              className="group relative inline-flex items-center justify-center px-12 py-5 text-lg font-bold text-white bg-emerald-600 rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_50px_-10px_rgba(52,211,153,0.6)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10 flex items-center gap-2">
                Create Free Account
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </span>
            </Link>
          </div>
        </div>
      </section>
      
    </main>
  );
}