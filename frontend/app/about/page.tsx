import Link from "next/link";

export const metadata = {
  title: "About Us | Deeniyat Platform",
  description: "Learn about the mission, vision, and values of the Deeniyat Islamic Learning Platform.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-50 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-hidden pt-20">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-teal-900/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 sm:py-24">
        
        {/* 1. Header Section */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-emerald-500/30 mb-6 backdrop-blur-sm shadow-[0_0_15px_rgba(52,211,153,0.1)]">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-300 tracking-widest uppercase">Our Story</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6">
            Bridging <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Tradition</span> & Tech
          </h1>
          <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed">
            Deeniyat is a premium Islamic Learning Management System designed to bring authentic knowledge to seekers worldwide. We blend the timeless wisdom of classical scholars with cutting-edge digital technology.
          </p>
        </div>

        {/* 2. Global Impact / Stats Section (NEW) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24 border-y border-slate-800/50 py-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-900/10 to-transparent"></div>
          
          {[
            { value: "10,000+", label: "Active Students" },
            { value: "50+", label: "Verified Scholars" },
            { value: "120+", label: "Premium Courses" },
            { value: "24/7", label: "Learning Access" }
          ].map((stat, i) => (
            <div key={i} className="text-center relative z-10">
              <h4 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-[0_0_15px_rgba(52,211,153,0.2)]">{stat.value}</h4>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* 3. Mission & Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-10 rounded-[2rem] hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(52,211,153,0.15)] group">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
            <p className="text-slate-400 leading-relaxed font-light text-lg">
              To make authentic Islamic education accessible, interactive, and structured for everyone, regardless of their geographical location. We strive to connect dedicated students with verified, world-class scholars.
            </p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-10 rounded-[2rem] hover:border-teal-500/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(20,184,166,0.15)] group">
            <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-6 text-teal-400 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
            <p className="text-slate-400 leading-relaxed font-light text-lg">
              To become the global standard for digital Islamic learning, fostering a community of learners who are deeply rooted in their Deen while excelling in the modern world.
            </p>
          </div>
        </div>

        {/* 4. Eminent Scholars / Leadership Section (NEW) */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Guided by the Best</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full mb-4"></div>
            <p className="text-slate-400 max-w-2xl mx-auto font-light">Learn directly from our board of certified scholars who bring decades of traditional teaching experience to the digital realm.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { name: "Shaykh Abdullah", role: "Head of Tafseer Dept.", img: "A" },
              { name: "Ustadha Ayesha", role: "Tajweed & Qira'at Lead", img: "A" },
              { name: "Mufti Rahman", role: "Fiqh & Jurisprudence", img: "R" }
            ].map((scholar, idx) => (
              <div key={idx} className="bg-[#020617] border border-slate-800 rounded-3xl p-6 flex flex-col items-center text-center hover:bg-slate-800/30 transition-colors">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-900 to-slate-800 border-2 border-emerald-500/30 flex items-center justify-center text-3xl font-black text-emerald-400 mb-4 shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                  {scholar.img}
                </div>
                <h4 className="text-xl font-bold text-white mb-1">{scholar.name}</h4>
                <p className="text-emerald-400/80 text-sm font-medium mb-4">{scholar.role}</p>
                <p className="text-slate-500 text-sm font-light leading-relaxed">Certified in traditional Islamic sciences with over 15 years of teaching experience.</p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Core Values Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Core Values</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full mb-12"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {[
            {
              title: "Authenticity",
              desc: "All our courses are curated and verified by certified scholars following the righteous path.",
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            },
            {
              title: "Excellence (Ihsan)",
              desc: "We deliver a seamless, high-end user experience to make seeking knowledge a beautiful journey.",
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            },
            {
              title: "Community",
              desc: "Creating an engaging ecosystem where students and teachers interact, collaborate, and grow together.",
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            }
          ].map((val, i) => (
            <div key={i} className="bg-slate-900/20 border border-slate-800 p-8 rounded-3xl text-center hover:bg-slate-900/60 hover:border-slate-700 transition-colors">
              <div className="w-14 h-14 mx-auto bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-emerald-400 mb-6">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">{val.icon}</svg>
              </div>
              <h4 className="text-xl font-bold text-white mb-3">{val.title}</h4>
              <p className="text-slate-400 text-sm font-light leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>

        {/* 6. Premium CTA Section */}
        <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/20 border border-emerald-500/20 rounded-[3rem] p-12 md:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Ready to start your journey?</h2>
            <p className="text-emerald-100/70 mb-10 max-w-2xl mx-auto text-lg font-light leading-relaxed">
              Join thousands of students across the globe who are elevating their spiritual journey through the Deeniyat platform. Your pursuit of knowledge starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link href="/register" className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-lg font-bold rounded-full transition-all shadow-[0_0_25px_rgba(52,211,153,0.3)] hover:scale-105 flex items-center justify-center gap-2">
                Enroll Now
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <Link href="/courses" className="px-10 py-4 bg-slate-900 border border-slate-700 text-white hover:bg-slate-800 text-lg font-bold rounded-full transition-all flex items-center justify-center">
                Browse Courses
              </Link>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}