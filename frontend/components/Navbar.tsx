"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: 'About', path: '/about' }
  ];

  // Handle Auth State
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [pathname]);

  // Handle Scroll Effect for Premium Floating Island
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Hide main navbar inside the dashboard
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 flex justify-center pointer-events-none">
        <motion.nav 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`pointer-events-auto transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            scrolled || mobileMenuOpen
              ? "mt-4 w-[95%] max-w-6xl bg-[#020617]/50 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_8px_32px_-10px_rgba(0,0,0,0.8),0_0_20px_rgba(52,211,153,0.05)] py-2.5 px-4 sm:px-8" 
              : "mt-0 w-full max-w-7xl bg-transparent border-transparent py-6 px-4 sm:px-8"
          }`}
        >
          {/* Subtle noise overlay inside the navbar for that premium SaaS feel */}
          <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay rounded-full transition-opacity duration-700 ${scrolled ? 'opacity-[0.02]' : 'opacity-0'}`}></div>

          <div className="flex justify-between items-center relative z-10">
            
            {/* 1. Logo Area (Holographic Glow) */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-3 group relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.3)] group-hover:shadow-[0_0_25px_rgba(52,211,153,0.6)] group-hover:scale-[1.02] transition-all duration-500 border border-white/20">
                  <svg className="w-5 h-5 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="relative text-2xl font-black text-white tracking-wide flex items-baseline drop-shadow-lg">
                  Deeniyat<span className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]">.</span>
                </span>
              </Link>
            </div>

            {/* 2. Navigation Links (Frosted Glass Magnetic Pill) */}
            <div className={`hidden md:flex space-x-1 items-center transition-all duration-500 ${scrolled ? '' : 'bg-slate-900/30 p-1.5 rounded-full border border-white/5 backdrop-blur-md'}`}>
              {navLinks.map((link, i) => {
                const isActive = pathname === link.path;
                return (
                  <div 
                    key={link.name} 
                    className="relative px-5 py-2"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <AnimatePresence>
                      {hoveredIndex === i && (
                        <motion.div 
                          layoutId="nav-pill"
                          className="absolute inset-0 bg-white/5 rounded-full border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </AnimatePresence>
                    <Link 
                      href={link.path} 
                      className={`relative z-10 text-[13px] font-bold tracking-[0.15em] uppercase transition-all duration-300 ${isActive ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'text-slate-300 hover:text-white'}`}
                    >
                      {link.name}
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* 3. Auth Buttons (Desktop) */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <Link 
                  href="/dashboard" 
                  className="group relative px-6 py-2.5 text-[13px] font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full overflow-hidden transition-all duration-500 hover:scale-[1.03] shadow-[0_0_30px_rgba(52,211,153,0.3)] hover:shadow-[0_0_40px_rgba(52,211,153,0.6)] ring-1 ring-white/30 tracking-widest uppercase"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                  <span className="relative flex items-center gap-2 drop-shadow-sm">
                    Portal
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4-4m4-4H3" /></svg>
                  </span>
                </Link>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login" className="px-5 py-2.5 text-[13px] font-bold text-slate-300 hover:text-white transition-colors tracking-widest hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                    LOG IN
                  </Link>
                  
                  {/* Holographic Premium CTA Button */}
                  <div className="relative group">
                    {/* Outer Glowing Aura */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
                    
                    <Link 
                      href="/register" 
                      className="relative flex items-center px-6 py-2.5 text-[13px] font-bold text-white bg-slate-900/40 backdrop-blur-xl rounded-full overflow-hidden transition-all duration-500 hover:scale-[1.02] border border-white/10 group-hover:border-emerald-400/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-400/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Laser Shimmer Beam */}
                      <div className="absolute -inset-full top-0 z-0 block h-full w-1/2 -skew-x-12 transform bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:animate-shimmer"></div>

                      <span className="relative z-10 tracking-[0.15em] drop-shadow-md">JOIN NOW</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Mobile Menu Button (Hamburger) */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="relative group text-emerald-400 hover:text-white focus:outline-none p-3 bg-slate-900/60 rounded-full border border-white/10 transition-all duration-300 shadow-[0_0_15px_rgba(52,211,153,0.1)] backdrop-blur-xl"
              >
                <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <motion.div
                  animate={mobileMenuOpen ? "open" : "closed"}
                  className="w-5 h-5 flex flex-col justify-center items-center relative z-10"
                >
                  <span className={`block w-full h-[2px] bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? "rotate-45 absolute" : "-translate-y-1.5"}`}></span>
                  <span className={`block w-full h-[2px] bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : "opacity-100"}`}></span>
                  <span className={`block w-full h-[2px] bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 absolute" : "translate-y-1.5"}`}></span>
                </motion.div>
              </button>
            </div>

          </div>
        </motion.nav>
      </header>

      {/* 5. Mobile Menu Dropdown (Cinematic Overlay) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="md:hidden fixed inset-0 z-40 flex items-start justify-center pt-24 px-4 pb-4"
          >
            {/* Dark Cinematic Backdrop */}
            <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-2xl" onClick={() => setMobileMenuOpen(false)}></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

            <motion.div 
              initial={{ y: -20, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: -20, scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-sm bg-slate-900/60 border border-slate-700/50 rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.9)] ring-1 ring-white/10"
            >
              {/* Internal Glowing Orbs */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/15 rounded-full blur-[60px] pointer-events-none"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-teal-500/15 rounded-full blur-[60px] pointer-events-none"></div>

              <div className="px-6 py-10 flex flex-col gap-2 relative z-10">
                {navLinks.map((link, i) => {
                  const isActive = pathname === link.path;
                  return (
                    <motion.div 
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.1, ease: "easeOut" }}
                      key={link.name}
                    >
                      <Link 
                        href={link.path} 
                        className={`block text-2xl font-black tracking-wide px-6 py-4 rounded-3xl transition-all ${isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[inset_0_0_20px_rgba(52,211,153,0.05)]' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'}`}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  );
                })}

                <motion.div 
                  initial={{ opacity: 0, scaleX: 0 }} 
                  animate={{ opacity: 1, scaleX: 1 }} 
                  transition={{ delay: 0.3 }}
                  className="h-px w-full bg-gradient-to-r from-transparent via-slate-600 to-transparent my-6 origin-left"
                ></motion.div>

                {/* Mobile Auth Buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.4, ease: "easeOut" }}
                  className="flex flex-col gap-4"
                >
                  {isLoggedIn ? (
                    <Link 
                      href="/dashboard" 
                      className="w-full flex justify-center items-center gap-3 px-6 py-5 text-lg font-bold tracking-widest uppercase text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-3xl shadow-[0_0_30px_rgba(52,211,153,0.3)] ring-2 ring-white/20"
                    >
                      Portal Access
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4-4m4-4H3" /></svg>
                    </Link>
                  ) : (
                    <>
                      <Link href="/login" className="w-full text-center py-4 text-sm tracking-[0.2em] font-bold text-slate-300 hover:text-white bg-slate-800/30 rounded-full border border-slate-700/50 hover:bg-slate-800/80 transition-colors">
                        LOG IN
                      </Link>
                      <Link 
                        href="/register" 
                        className="relative overflow-hidden group w-full text-center px-6 py-4 text-sm tracking-[0.2em] font-bold text-white bg-slate-800 rounded-full border border-emerald-500/40 shadow-[0_0_20px_rgba(52,211,153,0.2)]"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-400/20 to-emerald-500/20 transition-opacity duration-500"></div>
                        <span className="relative z-10 drop-shadow-md">JOIN NOW</span>
                      </Link>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shimmer animation logic injection */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}} />
    </>
  );
}