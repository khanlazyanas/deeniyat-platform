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
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-emerald-500/30 mb-6 backdrop-blur-sm shadow-[0_0_15px_rgba(52,211,153,0.1)]">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-300 tracking-widest uppercase">Our Story</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6">
            Bridging <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Tradition</span> & Tech
          </h1>
          <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed">
            Deeniyat is a premium Islamic Learning Management System designed to bring authentic knowledge to seekers worldwide, blending timeless wisdom with cutting-edge technology.
          </p>
        </div>

        {/* Mission & Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-10 rounded-[2rem] hover:border-emerald-500/30 transition-colors group">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
            <p className="text-slate-400 leading-relaxed font-light">
              To make authentic Islamic education accessible, interactive, and structured for everyone, regardless of their geographical location. We strive to connect dedicated students with verified, world-class scholars.
            </p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-10 rounded-[2rem] hover:border-teal-500/30 transition-colors group">
            <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-6 text-teal-400 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
            <p className="text-slate-400 leading-relaxed font-light">
              To become the global standard for digital Islamic learning, fostering a community of learners who are deeply rooted in their Deen while excelling in the modern world.
            </p>
          </div>
        </div>

        {/* Core Values Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Core Values</h2>
          <div className="w-16 h-1 bg-emerald-500 mx-auto rounded-full mb-12"></div>
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
            <div key={i} className="bg-[#020617] border border-slate-800 p-8 rounded-3xl text-center hover:bg-slate-900/50 transition-colors">
              <div className="w-12 h-12 mx-auto bg-slate-800 rounded-full flex items-center justify-center text-emerald-400 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{val.icon}</svg>
              </div>
              <h4 className="text-xl font-bold text-white mb-3">{val.title}</h4>
              <p className="text-slate-400 text-sm font-light leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/20 border border-emerald-500/20 rounded-[2rem] p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">Ready to start your journey?</h2>
          <p className="text-emerald-100/70 mb-8 max-w-2xl mx-auto text-lg font-light relative z-10">
            Join thousands of students across the globe who are elevating their spiritual journey through the Deeniyat platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link href="/register" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-full transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:scale-105">
              Enroll Now
            </Link>
            <Link href="/courses" className="px-8 py-4 bg-transparent border border-slate-600 text-white hover:bg-slate-800 font-bold rounded-full transition-all">
              Browse Courses
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}