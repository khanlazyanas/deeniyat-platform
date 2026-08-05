"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// The "Apple/Linear" God-Tier Easing Curve
const smoothEase = [0.23, 1, 0.32, 1];

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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (pathname?.startsWith("/dashboard")) return null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none transition-all duration-700 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5">
        <motion.nav 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: smoothEase }}
          className={`pointer-events-auto w-full max-w-7xl flex justify-between items-center transition-all duration-500 will-change-transform ${
            scrolled || mobileMenuOpen
              ? "bg-[#020617]/60 backdrop-blur-[24px] backdrop-saturate-150 border border-white/[0.08] shadow-[0_16px_32px_-12px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.04)] rounded-full px-4 py-2.5" 
              : "bg-transparent border-transparent px-2 py-4"
          }`}
        >
          {/* 1. THE LOGO: Pixel-Perfect Typography & Squircle */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-3.5 group outline-none">
              
              {/* Premium Flat-Squircle Box */}
              <div className="relative flex items-center justify-center w-[40px] h-[40px] rounded-[12px] bg-gradient-to-b from-[#4ade80] to-[#10b981] shadow-[0_2px_8px_rgba(16,185,129,0.3),inset_0_1.5px_1px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-[0.23,1,0.32,1] group-hover:scale-[1.06]">
                <svg className="w-[20px] h-[20px] text-[#020617] drop-shadow-[0_1px_1px_rgba(255,255,255,0.2)]" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>

              {/* Typography: Sub-pixel antialiased, geometric sans */}
              <span className="text-[30px] font-extrabold text-white tracking-[-0.04em] leading-none flex items-baseline antialiased">
                Deeniyat<span className="text-[#4ade80] ml-[1px]">.</span>
              </span>
            </Link>
          </div>

          {/* 2. DESKTOP NAVIGATION: Frictionless Magnetic Pill */}
          <div className="hidden md:flex items-center space-x-1">
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
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.25, ease: smoothEase }}
                      />
                    )}
                  </AnimatePresence>
                  <Link 
                    href={link.path} 
                    className={`relative z-10 text-[14px] font-medium tracking-tight transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    {link.name}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* 3. AUTH BUTTONS: Linear/Stripe Grade */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <Link 
                href="/dashboard" 
                className="px-6 py-2.5 text-[14px] font-semibold text-[#020617] bg-white rounded-full hover:bg-slate-200 transition-all duration-300 hover:scale-105 shadow-[0_2px_10px_rgba(255,255,255,0.1)] flex items-center gap-2"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-5 py-2.5 text-[14px] font-medium text-slate-300 hover:text-white transition-colors">
                  Log in
                </Link>
                {/* God-Tier CTA Button */}
                <Link 
                  href="/register" 
                  className="relative group px-6 py-2.5 text-[14px] font-bold text-[#020617] bg-gradient-to-b from-[#4ade80] to-[#10b981] rounded-full transition-all duration-400 ease-[0.23,1,0.32,1] hover:scale-[1.04] shadow-[0_2px_12px_rgba(16,185,129,0.3),inset_0_1px_1px_rgba(255,255,255,0.5),inset_0_-1px_1px_rgba(0,0,0,0.1)] ring-1 ring-[#10b981]/50"
                >
                  <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">Sign Up</span>
                </Link>
              </>
            )}
          </div>

          {/* 4. GOD-TIER HAMBURGER: 2-Line Smooth Morph */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative flex items-center justify-center w-11 h-11 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-full transition-all duration-300 focus:outline-none shadow-sm active:scale-95"
              aria-label="Toggle Menu"
            >
              <div className="flex flex-col items-center justify-center w-4 h-4 relative">
                <motion.span
                  animate={mobileMenuOpen ? { y: 0, rotate: 45 } : { y: -3, rotate: 0 }}
                  transition={{ duration: 0.4, ease: smoothEase }}
                  className="absolute block h-[1.5px] w-5 bg-slate-200 rounded-full"
                ></motion.span>
                <motion.span
                  animate={mobileMenuOpen ? { y: 0, rotate: -45 } : { y: 3, rotate: 0 }}
                  transition={{ duration: 0.4, ease: smoothEase }}
                  className="absolute block h-[1.5px] w-5 bg-slate-200 rounded-full"
                ></motion.span>
              </div>
            </button>
          </div>
        </motion.nav>
      </header>

      {/* 5. MOBILE MENU: Cinematic Floating Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Dark Cinematic Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: smoothEase }}
              className="md:hidden fixed inset-0 z-30 bg-[#020617]/70 backdrop-blur-[12px] backdrop-saturate-150"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Floating Island Menu */}
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ duration: 0.4, ease: smoothEase }}
              className="md:hidden fixed top-[84px] left-4 right-4 z-40 flex flex-col p-2 bg-[#060b18]/90 border border-white/[0.08] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.04)] rounded-[24px] backdrop-blur-3xl"
            >
              <div className="flex flex-col gap-1 p-2">
                {navLinks.map((link, i) => {
                  const isActive = pathname === link.path;
                  return (
                    <motion.div 
                      initial={{ opacity: 0, x: -15 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: i * 0.05 + 0.1, ease: smoothEase }} 
                      key={link.name}
                    >
                      <Link 
                        href={link.path} 
                        className={`block text-[15px] font-semibold tracking-tight px-4 py-3.5 rounded-xl transition-all ${isActive ? 'bg-white/[0.08] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="h-px w-[calc(100%-2rem)] mx-auto bg-gradient-to-r from-transparent via-white/[0.08] to-transparent my-1"></div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2, ease: smoothEase }}
                className="flex flex-col gap-3 p-4 pt-3"
              >
                {isLoggedIn ? (
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full flex justify-center items-center gap-2 text-center py-3.5 text-[15px] font-semibold text-[#020617] bg-white rounded-[14px] shadow-sm active:scale-95 transition-transform">
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3.5 text-[15px] font-medium text-slate-300 bg-white/[0.03] rounded-[14px] border border-white/[0.06] hover:bg-white/[0.06] transition-colors active:scale-95">
                      Log In
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3.5 text-[15px] font-bold text-[#020617] bg-gradient-to-b from-[#4ade80] to-[#10b981] rounded-[14px] shadow-[0_2px_8px_rgba(16,185,129,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)] active:scale-95 transition-transform">
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