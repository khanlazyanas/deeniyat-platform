"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

// Custom physics for that "Apple/Linear" frictionless feel
const smoothEase: [number, number, number, number] = [0.23, 1, 0.32, 1];

// FIXED: 'as const' added to 'type' so TypeScript knows exactly what animation this is
const springTransition = { type: "spring" as const, stiffness: 400, damping: 30 };

// Variants for staggered link animations in mobile menu
const mobileMenuContainerVariants = {
  closed: { opacity: 0, y: -20, scale: 0.96 },
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: smoothEase,
      staggerChildren: 0.06, // Sequential link animations
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -15,
    scale: 0.96,
    transition: { duration: 0.3, ease: smoothEase, staggerChildren: 0.04, staggerDirection: -1 },
  },
};

const mobileMenuItemVariants = {
  closed: { opacity: 0, x: -15 },
  open: { opacity: 1, x: 0, transition: { duration: 0.4, ease: smoothEase } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.2, ease: smoothEase } },
};

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const pathname = usePathname();
  const { scrollY } = useScroll();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: 'About', path: '/about' }
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [pathname]);

  // SMART SCROLL: Hide on scroll down, show on scroll up
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > 150 && latest > previous && !mobileMenuOpen) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setScrolled(latest > 20);
  });

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (pathname?.startsWith("/dashboard")) return null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <motion.nav 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: hidden ? -100 : 0, opacity: hidden ? 0 : 1 }}
          transition={{ duration: 0.5, ease: smoothEase }}
          className={`pointer-events-auto w-full max-w-7xl flex justify-between items-center transition-all duration-500 will-change-transform ${
            scrolled || mobileMenuOpen
              ? "bg-[#020617]/60 backdrop-blur-[28px] backdrop-saturate-200 border border-white/[0.08] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.06)] rounded-full px-3 py-2 sm:py-2.5" 
              : "bg-transparent border-transparent px-2 py-4"
          }`}
        >
          {/* 1. ELITE SAAS LOGO */}
          <div className="flex-shrink-0 flex items-center pl-2">
            <Link href="/" className="flex items-center gap-3.5 group outline-none">
              
              <div className="relative flex items-center justify-center w-[38px] h-[38px] sm:w-[40px] sm:h-[40px] rounded-[11px] bg-gradient-to-b from-[#4ade80] to-[#059669] shadow-[0_2px_12px_rgba(16,185,129,0.3),inset_0_1.5px_1px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(0,0,0,0.1)] transition-transform duration-400 ease-[0.23,1,0.32,1] group-hover:scale-[1.05]">
                <svg className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] text-[#020617] drop-shadow-[0_1px_1px_rgba(255,255,255,0.25)]" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>

              <span 
                className="text-[26px] sm:text-[28px] font-extrabold text-white tracking-[-0.04em] leading-none flex items-baseline ml-3.5 antialiased" 
                style={{ 
                  fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontFeatureSettings: '"cv11", "ss01", "ss03"', 
                  WebkitFontSmoothing: 'antialiased'
                }}
              >
                Deeniyat<span className="text-[#4ade80] ml-[1px]">.</span>
              </span>
            </Link>
          </div>

          {/* 2. DESKTOP NAVIGATION: Magnetic Pill */}
          <div className="hidden md:flex items-center space-x-1 pl-4">
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
                        layoutId="nav-hover-pill"
                        className="absolute inset-0 bg-white/[0.06] rounded-full border border-white/[0.04]"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={springTransition}
                      />
                    )}
                  </AnimatePresence>
                  
                  <Link 
                    href={link.path} 
                    className={`relative z-10 text-[14px] font-medium tracking-tight transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    {link.name}
                  </Link>

                  {isActive && (
                    <motion.div 
                      layoutId="active-dot"
                      className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#4ade80] rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)]"
                      transition={springTransition}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* 3. AUTH BUTTONS: Tactile 3D Buttons */}
          <div className="hidden md:flex items-center space-x-2 pr-1">
            {isLoggedIn ? (
              <Link 
                href="/dashboard" 
                className="px-6 py-2.5 text-[14px] font-semibold text-[#020617] bg-white rounded-full hover:bg-slate-200 transition-all duration-300 hover:scale-105 shadow-[0_2px_12px_rgba(255,255,255,0.1)] flex items-center gap-2"
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
                  className="relative group px-6 py-2.5 text-[14px] font-bold text-[#020617] bg-gradient-to-b from-[#4ade80] to-[#10b981] rounded-full transition-all duration-400 ease-[0.23,1,0.32,1] hover:scale-[1.04] shadow-[0_4px_16px_rgba(16,185,129,0.3),inset_0_1px_1px_rgba(255,255,255,0.6),inset_0_-2px_2px_rgba(0,0,0,0.15)] ring-1 ring-white/10"
                >
                  <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]">Sign Up</span>
                </Link>
              </>
            )}
          </div>

          {/* 4. HAMBURGER MENU */}
          <div className="md:hidden flex items-center pr-1">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative flex items-center justify-center w-11 h-11 bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.06] rounded-full transition-all duration-300 focus:outline-none shadow-sm active:scale-95"
              aria-label="Toggle Menu"
            >
              <div className="flex flex-col items-center justify-center w-4 h-4 relative">
                <motion.span
                  animate={mobileMenuOpen ? { y: 0, rotate: 45 } : { y: -3, rotate: 0 }}
                  transition={springTransition}
                  className="absolute block h-[1.5px] w-5 bg-slate-200 rounded-full"
                ></motion.span>
                <motion.span
                  animate={mobileMenuOpen ? { y: 0, rotate: -45 } : { y: 3, rotate: 0 }}
                  transition={springTransition}
                  className="absolute block h-[1.5px] w-5 bg-slate-200 rounded-full"
                ></motion.span>
              </div>
            </button>
          </div>
        </motion.nav>
      </header>

      {/* 5. MOBILE MENU: Refined Premium Floating Island */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Cinematic Backdrop with adaptive blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: smoothEase }}
              className="md:hidden fixed inset-0 z-30 bg-[#020617]/70 backdrop-blur-[16px] backdrop-saturate-150"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Floating Island Menu */}
            <motion.div 
              initial="closed"
              animate="open"
              exit="exit"
              variants={mobileMenuContainerVariants}
              className="md:hidden fixed top-[80px] sm:top-[88px] left-4 right-4 z-40 flex flex-col p-2.5 bg-[#060b18]/95 border border-white/[0.08] shadow-[0_24px_64px_-16px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.04)] rounded-[26px] backdrop-blur-3xl overflow-hidden will-change-transform"
            >
              <div className="flex flex-col gap-1.5 p-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.path;
                  return (
                    <motion.div 
                      variants={mobileMenuItemVariants}
                      key={link.name}
                    >
                      <Link 
                        href={link.path} 
                        className={`block text-[15px] sm:text-[16px] font-semibold tracking-tight px-5 py-3.5 rounded-[16px] transition-all duration-200 ease-out active:scale-[0.98] ${isActive ? 'bg-white/[0.08] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Staggered Separator */}
              <motion.div 
                variants={mobileMenuItemVariants}
                className="h-px w-[calc(100%-2.5rem)] mx-auto bg-gradient-to-r from-transparent via-white/[0.08] to-transparent my-1.5"
              />

              <motion.div 
                variants={mobileMenuItemVariants}
                className="flex flex-col gap-3 p-4 pt-3"
              >
                {isLoggedIn ? (
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full flex justify-center items-center gap-2 text-center py-3.5 text-[15px] sm:text-[16px] font-semibold text-[#020617] bg-white rounded-[18px] shadow-[0_2px_12px_rgba(255,255,255,0.15)] active:scale-[0.98] transition-transform duration-200 ease-out">
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3.5 text-[15px] sm:text-[16px] font-medium text-slate-300 bg-white/[0.03] rounded-[18px] border border-white/[0.06] hover:bg-white/[0.06] transition-colors active:scale-[0.98] transition-transform duration-200 ease-out">
                      Log In
                    </Link>
                    <Link 
                      href="/register" 
                      onClick={() => setMobileMenuOpen(false)} 
                      className="relative group w-full text-center py-3.5 text-[15px] sm:text-[16px] font-bold text-[#020617] bg-gradient-to-b from-[#4ade80] to-[#10b981] rounded-[18px] shadow-[0_4px_16px_rgba(16,185,129,0.3),inset_0_1px_1px_rgba(255,255,255,0.5),inset_0_-2px_2px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-transform duration-200 ease-out"
                    >
                      <div className="absolute inset-0 bg-white/20 rounded-[18px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]">Sign Up</span>
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