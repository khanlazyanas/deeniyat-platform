"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // URL change hone par track karne ke liye
  const pathname = usePathname();

  useEffect(() => {
    // Har baar jab page (URL) change hoga, yeh check karega ki token hai ya nahi
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [pathname]); // Jab bhi pathname badlega, yeh effect dubara chalega

  return (
    <nav className="bg-white shadow-md w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* 1. Logo Area */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600 tracking-wide">
              Deeniyat
            </Link>
          </div>

          {/* 2. Navigation Links (Desktop) */}
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition">Home</Link>
            <Link href="/courses" className="text-gray-700 hover:text-blue-600 transition">Courses</Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 transition">About</Link>
          </div>

          {/* 3. Auth Buttons / Dashboard Button */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              // Agar user logged in hai, toh sirf Dashboard button dikhao
              <Link 
                href="/dashboard" 
                className="bg-blue-600 text-white px-5 py-2 rounded-md font-medium hover:bg-blue-700 transition"
              >
                Go to Dashboard
              </Link>
            ) : (
              // Agar user logged in NAHI hai, toh Log in aur Sign up dikhao
              <>
                <Link href="/login" className="text-blue-600 font-medium hover:underline">
                  Log in
                </Link>
                <Link 
                  href="/register" 
                  className="bg-blue-600 text-white px-5 py-2 rounded-md font-medium hover:bg-blue-700 transition"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}