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

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none transition-all duration-500 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <motion.nav 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`pointer-events-auto w-full max-w-7xl flex justify-between items-center transition-all duration-500 ${
            scrolled || mobileMenuOpen
              ? "bg-[#020617]/80 backdrop-blur-[24px] border border-white/[0.06] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] rounded-full px-5 py-3" 
              : "bg-transparent border-transparent px-2 py-4"
          }`}
        >
          {/* 1. EXACT SCREENSHOT LOGO (Ultra-Professional Font & Spacing) */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center group outline-none">
              
              {/* Premium Flat-Squircle Box with subtle inner highlight */}
              <div className="relative flex items-center justify-center w-[42px] h-[42px] rounded-[13px] bg-gradient-to-b from-[#4ade80] to-[#10b981] shadow-[0_4px_16px_rgba(16,185,129,0.25),inset_0_1px_1px_rgba(255,255,255,0.4)] transition-transform duration-300 group-hover:scale-105">
                
                {/* Thick, dark slate book icon perfectly centered */}
                <svg className="w-[22px] h-[22px] text-[#020617]" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>

              {/* Ultra-Professional Typography: Custom font stack, heavy weight, tight tracking */}
              <span 
                className="text-[32px] font-black text-white tracking-[-0.05em] leading-none flex items-baseline ml-3.5 antialiased" 
                style={{ fontFamily: '"Inter", "SF Pro Display", -apple-system, sans-serif' }}
              >
                Deeniyat<span className="text-[#4ade80] ml-[1px]">.</span>
              </span>
            </Link>
          </div>

          {/* 2. Navigation Links (Minimalist Magnetic Pill) */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link, i) => {
              const isActive = pathname === link.path;
              return (
                <div 
                  key={link.name} 
                  className="relative px-4 py-2 rounded-full cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <AnimatePresence>
                    {hoveredIndex === i && (
                      <motion.div 
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-white/[0.08] rounded-full"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                      />
                    )}
                  </AnimatePresence>
                  <Link 
                    href={link.path} 
                    className={`relative z-10 text-[14px] font-semibold tracking-tight transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    {link.name}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* 3. Auth Buttons (SaaS Grade) */}
          <div className="hidden md:flex items-center space-x-2">
            {isLoggedIn ? (
              <Link 
                href="/dashboard" 
                className="px-5 py-2.5 text-[14px] font-semibold text-[#020617] bg-white rounded-full hover:bg-slate-200 transition-all duration-300 hover:scale-105 shadow-[0_4px_14px_rgba(255,255,255,0.15)] flex items-center gap-2"
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
                  className="px-6 py-2.5 text-[14px] font-bold text-[#020617] bg-[#4ade80] hover:bg-[#22c55e] rounded-full transition-all duration-300 hover:scale-105 shadow-[0_4px_14px_rgba(74,222,128,0.25)]"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* 4. ULTRA-PROFESSIONAL SAAS HAMBURGER MENU (2-Line Asymmetric) */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative flex items-center justify-center w-10 h-10 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Toggle Menu"
            >
              <div className="flex flex-col items-end justify-center w-5 h-5 gap-[5px]">
                <motion.span
                  animate={mobileMenuOpen ? { rotate: 45, y: 3.5 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="block h-[2px] w-full bg-current rounded-full origin-center"
                ></motion.span>
                <motion.span
                  animate={mobileMenuOpen ? { rotate: -45, y: -3.5, width: "100%" } : { rotate: 0, y: 0, width: "70%" }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="block h-[2px] bg-current rounded-full origin-center"
                ></motion.span>
              </div>
            </button>
          </div>
        </motion.nav>
      </header>

      {/* 5. Ultra-Premium Floating Mobile Menu (Card Style instead of Full Screen) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Soft Backdrop overlay to bring focus to the menu */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden fixed inset-0 z-30 bg-[#020617]/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div 
              initial={{ opacity: 0, y: -15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden fixed top-[84px] left-4 right-4 z-40 flex flex-col p-2 bg-[#0a0f1d] border border-white/[0.08] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] rounded-3xl"
            >
              <div className="flex flex-col gap-1 p-2">
                {navLinks.map((link, i) => {
                  const isActive = pathname === link.path;
                  return (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: i * 0.05 + 0.1, ease: "easeOut" }} 
                      key={link.name}
                    >
                      <Link 
                        href={link.path} 
                        className={`block text-lg font-semibold px-4 py-3.5 rounded-2xl transition-all ${isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="h-px w-[calc(100%-2rem)] mx-auto bg-white/5 my-2"></div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2, ease: "easeOut" }}
                className="flex flex-col gap-2 p-4 pt-2"
              >
                {isLoggedIn ? (
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full flex justify-center items-center gap-2 text-center py-3.5 text-[15px] font-semibold text-[#020617] bg-white rounded-xl shadow-sm">
                    Dashboard
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4-4m4-4H3" /></svg>
                  </Link>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3.5 text-[15px] font-semibold text-slate-300 bg-white/[0.03] rounded-xl border border-white/[0.05] hover:bg-white/10 transition-colors">
                      Log In
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3.5 text-[15px] font-bold text-[#020617] bg-[#4ade80] rounded-xl shadow-[0_4px_14px_rgba(74,222,128,0.25)]">
                      Sign Up
                    </Link>
                  </>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}