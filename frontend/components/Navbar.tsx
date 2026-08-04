"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const pathname = usePathname();

  // Handle Auth State
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [pathname]);

  // Handle Scroll Effect for Premium Glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // FIX: Dashboard ke andar main navbar ko hide kar do
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <>
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-700 ease-out ${
          scrolled || mobileMenuOpen
            ? "bg-[#020617]/70 backdrop-blur-2xl border-b border-emerald-500/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] py-3" 
            : "bg-transparent border-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            
            {/* 1. Logo Area (Premium Glowing Icon) */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.4)] group-hover:shadow-[0_0_30px_rgba(52,211,153,0.8)] group-hover:scale-105 transition-all duration-500 border border-white/20">
                  <svg className="w-6 h-6 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-2xl font-black text-white tracking-wide flex items-baseline">
                  Deeniyat<span className="text-emerald-500 animate-pulse">.</span>
                </span>
              </Link>
            </div>

            {/* 2. Navigation Links (Desktop) */}
            <div className="hidden md:flex space-x-10 items-center">
              {[
                { name: 'Home', path: '/' },
                { name: 'Courses', path: '/courses' },
                { name: 'About', path: '/about' }
              ].map((link) => (
                <Link 
                  key={link.name}
                  href={link.path} 
                  className="text-sm font-semibold text-slate-300 hover:text-white transition-colors tracking-widest uppercase relative group py-2"
                >
                  {link.name}
                  {/* Premium Glowing Underline */}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-emerald-400 transition-all duration-300 group-hover:w-full rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
                </Link>
              ))}
            </div>

            {/* 3. Auth Buttons / Dashboard Button (Desktop) */}
            <div className="hidden md:flex items-center space-x-6">
              {isLoggedIn ? (
                <Link 
                  href="/dashboard" 
                  className="group relative px-7 py-2.5 text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full overflow-hidden transition-all duration-500 hover:scale-[1.03] shadow-[0_0_25px_rgba(52,211,153,0.4)] hover:shadow-[0_0_40px_rgba(52,211,153,0.8)] ring-1 ring-white/30"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                  <span className="relative flex items-center gap-2">
                    Portal Access
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4-4m4-4H3" /></svg>
                  </span>
                </Link>
              ) : (
                <div className="flex items-center space-x-6">
                  <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors tracking-wider">
                    LOG IN
                  </Link>
                  <Link 
                    href="/register" 
                    className="group relative px-7 py-2.5 text-sm font-bold text-white bg-slate-900/50 backdrop-blur-md rounded-full overflow-hidden transition-all duration-500 hover:scale-[1.03] shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-slate-700 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(52,211,153,0.2)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                    <span className="relative z-10">CREATE ACCOUNT</span>
                  </Link>
                </div>
              )}
            </div>

            {/* 4. Mobile Menu Button (Hamburger) */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-emerald-400 hover:text-white focus:outline-none p-2.5 bg-slate-900/80 rounded-xl border border-emerald-500/30 transition-all duration-300 shadow-[0_0_15px_rgba(52,211,153,0.15)]"
              >
                <motion.div
                  animate={mobileMenuOpen ? "open" : "closed"}
                  className="w-5 h-5 flex flex-col justify-center items-center relative"
                >
                  <span className={`block w-full h-0.5 bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? "rotate-45 absolute" : "-translate-y-1.5"}`}></span>
                  <span className={`block w-full h-0.5 bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : "opacity-100"}`}></span>
                  <span className={`block w-full h-0.5 bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 absolute" : "translate-y-1.5"}`}></span>
                </motion.div>
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* 5. Mobile Menu Dropdown (Framer Motion Animated) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden fixed top-[72px] left-0 w-full z-40"
          >
            <div className="mx-4 mt-2 bg-slate-900/95 backdrop-blur-3xl border border-slate-800 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] ring-1 ring-white/5">
              <div className="px-6 py-8 space-y-2 flex flex-col">
                {[
                  { name: 'Home', path: '/' },
                  { name: 'Courses', path: '/courses' },
                  { name: 'About', path: '/about' }
                ].map((link, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={link.name}
                  >
                    <Link 
                      href={link.path} 
                      className="block text-lg font-semibold text-slate-300 hover:text-emerald-400 hover:bg-slate-800/50 px-4 py-3.5 rounded-2xl transition-all"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}

                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                  className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent my-4"
                ></motion.div>

                {/* Mobile Auth Buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="flex flex-col space-y-4 pt-2"
                >
                  {isLoggedIn ? (
                    <Link 
                      href="/dashboard" 
                      className="w-full flex justify-center items-center gap-2 px-6 py-4 text-base font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                    >
                      Portal Access
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4-4m4-4H3" /></svg>
                    </Link>
                  ) : (
                    <>
                      <Link href="/login" className="w-full text-center py-4 text-base font-bold text-slate-300 hover:text-white bg-slate-800/50 rounded-2xl border border-slate-700/50">
                        LOG IN
                      </Link>
                      <Link 
                        href="/register" 
                        className="w-full text-center px-6 py-4 text-base font-bold text-slate-950 bg-emerald-400 rounded-2xl shadow-[0_0_20px_rgba(52,211,153,0.4)]"
                      >
                        CREATE ACCOUNT
                      </Link>
                    </>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}