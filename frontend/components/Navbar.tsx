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
    setIsLoggedIn(!!token);
  }, [pathname]);

  // Handle Scroll Effect for Premium Floating Island
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
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
          className={`pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            scrolled || mobileMenuOpen
              ? "mt-5 w-[95%] max-w-6xl bg-[#020617]/70 backdrop-blur-2xl border border-white/[0.08] rounded-full shadow-[0_8px_32px_-8px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] py-3 px-4 sm:px-8" 
              : "mt-0 w-full max-w-7xl bg-transparent border-transparent py-8 px-4 sm:px-8"
          }`}
        >
          <div className="flex justify-between items-center relative z-10">
            
            {/* 1. EXACT PIXEL-PERFECT LOGO FROM SCREENSHOT */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-[14px] group">
                
                {/* 3D Apple-Style Squircle with Exact Glow */}
                <div className="relative flex items-center justify-center w-[46px] h-[46px] rounded-[14px] bg-gradient-to-br from-[#2dd4bf] to-[#059669] shadow-[0_0_28px_rgba(16,185,129,0.5),inset_0_1.5px_1px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.2)] transition-transform duration-300 group-hover:scale-105">
                  {/* Exact Open Book Icon matched to screenshot */}
                  <svg className="w-[22px] h-[22px] text-[#020617] drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>

                {/* Crisp Typography exactly like screenshot */}
                <span className="text-[32px] font-black text-white tracking-[-0.03em] leading-none flex items-baseline">
                  Deeniyat<span className="text-[#10B981] ml-[2px]">.</span>
                </span>
              </Link>
            </div>

            {/* 2. Navigation Links (Minimalist Magnetic Pill) */}
            <div className={`hidden md:flex items-center transition-all duration-500 ${scrolled ? 'space-x-1' : 'space-x-1 bg-white/[0.03] p-1.5 rounded-full border border-white/[0.04] backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]'}`}>
              {navLinks.map((link, i) => {
                const isActive = pathname === link.path;
                return (
                  <div 
                    key={link.name} 
                    className="relative px-5 py-2.5 rounded-full cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <AnimatePresence>
                      {hoveredIndex === i && (
                        <motion.div 
                          layoutId="nav-pill"
                          className="absolute inset-0 bg-white/[0.08] rounded-full border border-white/[0.05]"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        />
                      )}
                    </AnimatePresence>
                    <Link 
                      href={link.path} 
                      className={`relative z-10 text-[14px] font-semibold tracking-wide transition-colors duration-300 ${isActive ? 'text-white drop-shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                      {link.name}
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* 3. Auth Buttons (SaaS Grade) */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <Link 
                  href="/dashboard" 
                  className="px-6 py-2.5 text-[14px] font-bold text-slate-950 bg-white rounded-full hover:bg-slate-100 transition-all duration-300 hover:scale-[1.03] shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2 ring-1 ring-white/50"
                >
                  Dashboard
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4-4m4-4H3" /></svg>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="px-5 py-2.5 text-[14px] font-semibold text-slate-300 hover:text-white transition-colors">
                    Log in
                  </Link>
                  <Link 
                    href="/register" 
                    className="px-7 py-2.5 text-[14px] font-bold text-[#020617] bg-gradient-to-b from-[#2dd4bf] to-[#10b981] hover:to-[#059669] rounded-full transition-all duration-300 hover:scale-[1.03] shadow-[0_4px_20px_rgba(16,185,129,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)] ring-1 ring-white/10"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>

            {/* 4. Mobile Menu Button (Hamburger) */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="relative text-white focus:outline-none p-3 bg-white/[0.05] rounded-full border border-white/[0.1] backdrop-blur-md transition-all active:scale-95 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
              >
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

      {/* 5. Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden fixed inset-0 z-40 flex items-start justify-center pt-28 px-4 pb-4"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-2xl" onClick={() => setMobileMenuOpen(false)}></div>

            <motion.div 
              initial={{ y: -20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-sm bg-[#020617]/80 border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.9)] ring-1 ring-white/5 backdrop-blur-xl"
            >
              <div className="px-6 py-8 flex flex-col gap-2 relative z-10">
                {navLinks.map((link, i) => {
                  const isActive = pathname === link.path;
                  return (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, ease: "easeOut" }}
                      key={link.name}
                    >
                      <Link 
                        href={link.path} 
                        className={`block text-xl font-bold px-5 py-4 rounded-2xl transition-all ${isActive ? 'bg-white/[0.08] text-white border border-white/5' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  );
                })}

                <div className="h-px w-full bg-white/10 my-4"></div>

                <div className="flex flex-col gap-3">
                  {isLoggedIn ? (
                    <Link 
                      href="/dashboard" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex justify-center items-center gap-2 px-6 py-4 text-base font-bold text-slate-950 bg-white rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                      Dashboard
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4-4m4-4H3" /></svg>
                    </Link>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-4 text-base font-bold text-slate-300 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                        Log In
                      </Link>
                      <Link 
                        href="/register" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-center px-6 py-4 text-base font-bold text-[#020617] bg-gradient-to-b from-[#2dd4bf] to-[#10b981] rounded-2xl shadow-[0_4px_20px_rgba(16,185,129,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)]"
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}