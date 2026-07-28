"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
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

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-500 border-b ${
        scrolled 
          ? "bg-[#020617]/70 backdrop-blur-xl border-slate-800/50 shadow-2xl py-3" 
          : "bg-transparent border-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          
          {/* 1. Logo Area (Premium Glowing Icon) */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.4)] group-hover:shadow-[0_0_25px_rgba(52,211,153,0.7)] transition-all duration-300">
                <svg className="w-6 h-6 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-2xl font-black text-white tracking-wide flex items-baseline">
                Deeniyat<span className="text-emerald-500">.</span>
              </span>
            </Link>
          </div>

          {/* 2. Navigation Links (Desktop) */}
          <div className="hidden md:flex space-x-10">
            <Link href="/" className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors tracking-wide relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/courses" className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors tracking-wide relative group">
              Courses
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/about" className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors tracking-wide relative group">
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>

          {/* 3. Auth Buttons / Dashboard Button */}
          <div className="flex items-center space-x-6">
            {isLoggedIn ? (
              // User is Logged In -> Portal Button
              <Link 
                href="/dashboard" 
                className="group relative px-6 py-2.5 text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(52,211,153,0.5)]"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                <span className="relative flex items-center gap-2">
                  Portal Access
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
              </Link>
            ) : (
              // User is NOT Logged In -> Login/Signup
              <div className="flex items-center space-x-6">
                <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                  Log in
                </Link>
                <Link 
                  href="/register" 
                  className="px-6 py-2.5 text-sm font-bold text-slate-950 bg-white rounded-full hover:bg-emerald-50 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 hover:scale-105"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}