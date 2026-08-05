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
              ? "bg-[#020617]/70 backdrop-blur-[20px] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-full px-5 py-3" 
              : "bg-transparent border-transparent px-2 py-4"
          }`}
        >
          {/* 1. EXACT SCREENSHOT LOGO (Clean, Flat, Professional) */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              {/* Box with soft gradient and exact glow from screenshot */}
              <div className="relative flex items-center justify-center w-[42px] h-[42px] rounded-[12px] bg-gradient-to-b from-[#4ade80] to-[#10b981] shadow-[0_0_24px_rgba(52,211,153,0.3)] transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_0_32px_rgba(52,211,153,0.4)]">
                {/* Thick, dark slate book icon */}
                <svg className="w-6 h-6 text-[#020617]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>

              {/* Pure Solid White Text with Green Dot */}
              <span className="text-[32px] font-black text-white tracking-[-0.04em] leading-none flex items-baseline">
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
                        className="absolute inset-0 bg-white/10 rounded-full"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                      />
                    )}
                  </AnimatePresence>
                  <Link 
                    href={link.path} 
                    className={`relative z-10 text-[14px] font-medium tracking-wide transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`}
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
                className="px-5 py-2.5 text-[14px] font-semibold text-[#020617] bg-white rounded-full hover:bg-slate-200 transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-5 py-2.5 text-[14px] font-medium text-slate-300 hover:text-white transition-colors">
                  Log in
                </Link>
                <Link 
                  href="/register" 
                  className="px-6 py-2.5 text-[14px] font-semibold text-[#020617] bg-[#4ade80] hover:bg-[#22c55e] rounded-full transition-all duration-300 hover:scale-105 shadow-[0_0_16px_rgba(74,222,128,0.2)]"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* 4. Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white focus:outline-none p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <motion.div animate={mobileMenuOpen ? "open" : "closed"} className="w-5 h-5 flex flex-col justify-center items-center relative">
                <span className={`block w-full h-[2px] bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? "rotate-45 absolute" : "-translate-y-1.5"}`}></span>
                <span className={`block w-full h-[2px] bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : "opacity-100"}`}></span>
                <span className={`block w-full h-[2px] bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 absolute" : "translate-y-1.5"}`}></span>
              </motion.div>
            </button>
          </div>
        </motion.nav>
      </header>

      {/* 5. Clean Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-40 flex flex-col pt-24 px-4 pb-6 bg-[#020617]/95 backdrop-blur-xl"
          >
            <div className="flex-1 flex flex-col gap-2">
              {navLinks.map((link, i) => {
                const isActive = pathname === link.path;
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} key={link.name}
                  >
                    <Link 
                      href={link.path} 
                      className={`block text-xl font-semibold px-4 py-4 rounded-xl transition-all ${isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })}

              <div className="h-px w-full bg-white/10 my-4"></div>

              <div className="flex flex-col gap-3 px-4">
                {isLoggedIn ? (
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-4 text-base font-semibold text-[#020617] bg-white rounded-xl">
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-4 text-base font-semibold text-slate-300 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                      Log In
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-4 text-base font-semibold text-[#020617] bg-[#4ade80] rounded-xl">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}