"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

// 👇 1. AUTH CONTEXT IMPORT
import { useAuth } from '../context/AuthContext';

const smoothEase: [number, number, number, number] = [0.23, 1, 0.32, 1];

// --- HELPER: GET FULL IMAGE URL ---
const getFullImageUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("blob")) return url;
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL 
      ? new URL(process.env.NEXT_PUBLIC_API_URL).origin 
      : "http://localhost:5000";
      
  return `${baseUrl}${url}`;
};

export default function Navbar() {
  // 👇 2. CONTEXT SE USER AUR LOGOUT FUNCTION NIKALA
  const { user, logout } = useAuth();
  
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const pathname = usePathname();
  const { scrollY } = useScroll();

  const navLinks = [
    { 
      name: 'Home', 
      path: '/', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> 
    },
    { 
      name: 'Courses', 
      path: '/courses', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /> 
    },
    { 
      name: 'About', 
      path: '/about', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> 
    }
  ];

  // 🔥 OPTIMIZED SCROLL TRACKING FOR 60FPS (Prevents unnecessary re-renders)
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    const isScrolled = latest > 20;
    const isHidden = latest > 150 && latest > previous && !mobileMenuOpen;

    if (scrolled !== isScrolled) setScrolled(isScrolled);
    if (hidden !== isHidden) setHidden(isHidden);
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
          className={`pointer-events-auto w-full max-w-7xl flex justify-between items-center transition-all duration-700 will-change-transform ${
            scrolled || mobileMenuOpen
              ? "bg-[#030612]/70 backdrop-blur-[30px] backdrop-saturate-[180%] border border-white/[0.08] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.1)] rounded-full px-4 py-2.5 sm:py-3" 
              : "bg-transparent border-transparent px-2 py-4"
          }`}
        >
          {/* Ambient Inner Glow Aura */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-blue-500/5 opacity-50 blur-xl pointer-events-none"></div>

          {/* 1. ELITE LOGO */}
          <div className="flex-shrink-0 flex items-center pl-2 relative z-10">
            <Link href="/" className="flex items-center gap-3.5 group outline-none">
              <div className="relative flex items-center justify-center w-[38px] h-[38px] sm:w-[40px] sm:h-[40px] rounded-[12px] bg-gradient-to-br from-[#4ade80] to-[#059669] shadow-[0_4px_20px_rgba(16,185,129,0.4),inset_0_2px_2px_rgba(255,255,255,0.5)] transition-transform duration-500 group-hover:scale-110">
                <svg className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] text-[#010206] drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>
              <span className="text-[26px] sm:text-[28px] font-black text-white tracking-tighter leading-none flex items-baseline ml-1 antialiased drop-shadow-md">
                Deeniyat<span className="text-[#4ade80] ml-[1px] drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]">.</span>
              </span>
            </Link>
          </div>

          {/* 2. DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center space-x-1.5 pl-4 relative z-10">
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
                        className="absolute inset-0 bg-white/[0.08] rounded-full border border-white/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </AnimatePresence>
                  
                  <Link 
                    href={link.path} 
                    className={`relative z-10 text-[14px] font-bold tracking-wide transition-colors duration-300 ${isActive ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    {link.name}
                  </Link>

                  {isActive && (
                    <motion.div 
                      layoutId="active-dot"
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#4ade80] rounded-full shadow-[0_0_10px_rgba(74,222,128,1)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* 3. AUTH BUTTONS */}
          <div className="hidden md:flex items-center space-x-3 pr-1 relative z-10">
            {user ? (
              <div className="flex items-center gap-3">
                <Link 
                  href="/dashboard" 
                  className="px-6 py-2.5 text-[14px] font-black text-[#010206] bg-white rounded-full hover:bg-slate-100 transition-all duration-300 hover:scale-105 shadow-[0_0_25px_rgba(255,255,255,0.3)] flex items-center gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-[#030612] overflow-hidden flex items-center justify-center text-white text-xs border border-slate-200">
                      {user.avatar ? (
                          <img src={getFullImageUrl(user.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                          user.name ? user.name.charAt(0) : "U"
                      )}
                  </div>
                  Dashboard
                </Link>
                <button 
                  onClick={logout}
                  className="p-2.5 text-slate-400 hover:text-rose-400 bg-white/[0.03] hover:bg-rose-500/10 border border-white/[0.05] hover:border-rose-500/30 rounded-full transition-all duration-300"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="px-5 py-2.5 text-[14px] font-bold text-slate-300 hover:text-white transition-colors">
                  Log in
                </Link>
                <Link 
                  href="/register" 
                  className="relative group px-7 py-2.5 text-[14px] font-black text-[#010206] bg-gradient-to-b from-[#4ade80] to-[#10b981] rounded-full transition-all duration-400 ease-[0.23,1,0.32,1] hover:scale-[1.05] shadow-[0_0_30px_rgba(16,185,129,0.5),inset_0_1px_2px_rgba(255,255,255,0.8)] ring-1 ring-white/30"
                >
                  <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">Sign Up</span>
                </Link>
              </>
            )}
          </div>

          {/* 4. HAMBURGER MENU */}
          <div className="md:hidden flex items-center pr-1 relative z-10">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative flex items-center justify-center w-11 h-11 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] rounded-full transition-all duration-300 focus:outline-none shadow-md active:scale-95"
              aria-label="Toggle Menu"
            >
              {user && !mobileMenuOpen ? (
                 <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-emerald-400 bg-black border border-white/[0.1]">
                    {user.avatar ? (
                        <img src={getFullImageUrl(user.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        user.name ? user.name.charAt(0) : "U"
                    )}
                 </div>
              ) : (
                  <div className="flex flex-col items-center justify-center w-4 h-4 relative">
                    <motion.span
                      animate={mobileMenuOpen ? { y: 0, rotate: 45 } : { y: -4, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="absolute block h-[2px] w-5 bg-slate-200 rounded-full"
                    ></motion.span>
                    <motion.span
                      animate={mobileMenuOpen ? { y: 0, rotate: -45 } : { y: 4, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="absolute block h-[2px] w-5 bg-slate-200 rounded-full"
                    ></motion.span>
                  </div>
              )}
            </button>
          </div>
        </motion.nav>
      </header>

      {/* 5. NATIVE APP-STYLE MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: smoothEase }}
              className="md:hidden fixed inset-0 z-30 bg-[#010206]/85 backdrop-blur-[20px]"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div 
              initial={{ opacity: 0, y: -30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: smoothEase }}
              className="md:hidden fixed top-[84px] left-4 right-4 z-40 flex flex-col p-4 bg-[#030612]/95 border border-white/[0.08] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.9),inset_0_1px_2px_rgba(255,255,255,0.1)] rounded-[32px] backdrop-blur-2xl overflow-hidden will-change-transform"
            >
              <div className="w-full flex justify-center pt-1 pb-3">
                <div className="w-12 h-1.5 bg-white/[0.15] rounded-full"></div>
              </div>

              {/* User Greeting in Mobile Menu */}
              {user && (
                  <div className="flex items-center gap-4 px-4 py-3 mb-2 rounded-[20px] bg-emerald-500/10 border border-emerald-500/20">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-emerald-400 bg-black border border-emerald-500/40">
                          {user.avatar ? (
                              <img src={getFullImageUrl(user.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                              user.name ? user.name.charAt(0) : "U"
                          )}
                      </div>
                      <div>
                          <p className="text-[12px] font-bold text-emerald-500 uppercase tracking-widest leading-none mb-1">Welcome</p>
                          <p className="text-white font-black text-lg leading-none">{user.name}</p>
                      </div>
                  </div>
              )}

              <div className="flex flex-col gap-1.5 px-1">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] px-3 mb-1 mt-2">Navigation</p>
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
                        className={`group flex items-center justify-between px-4 py-4 rounded-[20px] transition-all duration-300 ease-out active:scale-[0.98] ${
                          isActive 
                            ? 'bg-gradient-to-r from-[#4ade80]/15 to-transparent border border-[#4ade80]/20' 
                            : 'bg-white/[0.02] hover:bg-white/[0.06]'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-2xl transition-colors duration-300 ${isActive ? 'bg-[#4ade80]/20 text-[#4ade80] shadow-[0_0_12px_rgba(74,222,128,0.4)]' : 'bg-white/[0.05] text-slate-400 group-hover:text-white'}`}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              {link.icon}
                            </svg>
                          </div>
                          <span className={`text-[17px] font-bold tracking-tight transition-colors duration-300 ${isActive ? 'text-[#4ade80] drop-shadow-[0_0_10px_rgba(74,222,128,0.6)]' : 'text-slate-200 group-hover:text-white'}`}>
                            {link.name}
                          </span>
                        </div>
                        <svg className={`w-4 h-4 transition-colors duration-300 ${isActive ? 'text-[#4ade80]' : 'text-slate-600 group-hover:text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="h-px w-[calc(100%-1.5rem)] mx-auto bg-gradient-to-r from-transparent via-white/[0.08] to-transparent my-4"></div>

              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.25, ease: smoothEase }}
                className="flex flex-col gap-3 p-1"
              >
                {user ? (
                  <>
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full flex justify-center items-center gap-2 text-center py-4 text-[16px] font-black text-[#010206] bg-white rounded-[22px] shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-[0.98] transition-transform duration-300 ease-out">
                      Dashboard
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4-4m4-4H3" /></svg>
                    </Link>
                    <button 
                        onClick={() => { logout(); setMobileMenuOpen(false); }} 
                        className="w-full flex items-center justify-center gap-2 py-4 text-[16px] font-bold text-rose-400 bg-rose-500/10 rounded-[22px] border border-rose-500/20 hover:bg-rose-500/20 transition-all active:scale-[0.98] duration-300 ease-out"
                    >
                        Log Out
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full flex items-center justify-center gap-2 py-4 text-[16px] font-bold text-slate-300 bg-white/[0.03] rounded-[22px] border border-white/[0.06] hover:bg-white/[0.08] hover:text-white transition-all active:scale-[0.98] duration-300 ease-out">
                      Log In
                    </Link>
                    <Link 
                      href="/register" 
                      onClick={() => setMobileMenuOpen(false)} 
                      className="relative group w-full text-center py-4 text-[16px] font-black text-[#010206] bg-gradient-to-b from-[#4ade80] to-[#10b981] rounded-[22px] shadow-[0_0_35px_rgba(16,185,129,0.4),inset_0_1px_2px_rgba(255,255,255,0.8)] active:scale-[0.98] transition-transform duration-300 ease-out"
                    >
                      <div className="absolute inset-0 bg-white/20 rounded-[22px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">Create Account</span>
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