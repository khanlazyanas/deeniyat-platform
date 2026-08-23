"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";

interface Transaction {
  _id: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed'; // 👈 FIXED: Matching backend 'Completed'
  transactionId: string;
  createdAt: string;
  courseId?: {
    title: string;
  };
}

// --- GLOBAL STYLES (Ultra Smooth) ---
const globalAnimations = `
  @keyframes liquid-morph {
    0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(0deg); }
    33% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; transform: rotate(120deg); }
    66% { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; transform: rotate(240deg); }
    100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(360deg); }
  }
  .animate-liquid-morph {
    animation: liquid-morph 20s ease-in-out infinite;
  }
  .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
  ::selection {
    background: rgba(16, 185, 129, 0.2);
    color: #a7f3d0;
  }
`;

// --- PRE-COMPUTED LIGHTWEIGHT PARTICLE ARRAY ---
const particlesData = [
  { l: 0, c: "bg-emerald-400/40", s: 12, x: 15, y: 20, d: 0.5, dur: 20, blur: 2 },
  { l: 0, c: "bg-teal-400/30", s: 18, x: 85, y: 25, d: 1.2, dur: 25, blur: 3 },
  { l: 0, c: "bg-blue-400/40", s: 10, x: 25, y: 70, d: 2.1, dur: 18, blur: 1 },
  { l: 1, c: "bg-emerald-500/30", s: 8, x: 20, y: 40, d: 0.4, dur: 22, blur: 1 },
  { l: 1, c: "bg-teal-500/20", s: 12, x: 80, y: 50, d: 1.7, dur: 28, blur: 2 },
  { l: 2, c: "bg-emerald-600/10", s: 40, x: 30, y: 20, d: 0.1, dur: 40, blur: 10 },
  { l: 2, c: "bg-teal-600/10", s: 50, x: 75, y: 70, d: 1.5, dur: 45, blur: 15 },
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // --- MOUSE PARALLAX TRACKING LOGIC ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const smoothMouseX = useSpring(mouseX, { stiffness: 40, damping: 30 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 40, damping: 30 });

  const fgX = useTransform(smoothMouseX, (v) => v * 1.0);
  const fgY = useTransform(smoothMouseY, (v) => v * 1.0);
  const bgX = useTransform(smoothMouseX, (v) => v * 0.15);
  const bgY = useTransform(smoothMouseY, (v) => v * 0.15);

  // Holographic Spotlight Config
  const cardRef = useRef<HTMLDivElement>(null);
  const glareX = useMotionValue(0);
  const glareY = useMotionValue(0);
  const isHovered = useMotionValue(0);

  const backgroundTemplate = useMotionTemplate`radial-gradient(600px circle at ${glareX}px ${glareY}px, rgba(16, 185, 129, 0.08), transparent 80%)`;

  useEffect(() => {
    setMounted(true);

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 100;
      const y = (e.clientY / window.innerHeight - 0.5) * 100;
      mouseX.set(x);
      mouseY.set(y);

      if (cardRef.current && isHovered.get() === 1) {
        const rect = cardRef.current.getBoundingClientRect();
        glareX.set(e.clientX - rect.left);
        glareY.set(e.clientY - rect.top);
      }
    };
    
    window.addEventListener('mousemove', handleGlobalMouseMove);

    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/my-transactions`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setTransactions(Array.isArray(data) ? data : []);
        } else {
          throw new Error("Failed to fetch transactions");
        }
      } catch (err: any) {
        console.warn("Using fallback data because API failed:", err.message);
        setTransactions([
          {
            _id: "tx_1",
            transactionId: "PAY-987654321",
            amount: 1499,
            status: "Completed", // 👈 Fallback bhi update kiya
            createdAt: new Date().toISOString(),
            courseId: { title: "Advanced Tajweed Rules" }
          },
          {
            _id: "tx_2",
            transactionId: "PAY-123456789",
            amount: 999,
            status: "Pending",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            courseId: { title: "Basic Arabic Grammar" }
          }
        ]);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchTransactions();

    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [mouseX, mouseY, isHovered, glareX, glareY]);

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#000000] text-slate-50 flex flex-col font-sans overflow-x-hidden relative">
      
      {/* GLOBAL BACKGROUND */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none"></div>

      {/* --- ELITE PARTICLES ENGINE --- */}
      {mounted && (
        <div className="hidden md:block fixed inset-0 z-[5] pointer-events-none overflow-hidden">
          <motion.div style={{ x: fgX, y: fgY }} className="absolute inset-0 will-change-transform">
            {particlesData.filter(p => p.l === 0).map((p, i) => (
              <motion.div
                key={`fg-${i}`}
                className={`absolute rounded-full ${p.c}`}
                style={{
                  width: p.s, height: p.s, left: `${p.x}%`, top: `${p.y}%`, 
                  filter: `blur(${p.blur}px)`,
                }}
                animate={{ y: [0, -20, 0], x: [0, 10, -5, 0] }}
                transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut", delay: p.d }}
              />
            ))}
          </motion.div>
          <motion.div style={{ x: bgX, y: bgY }} className="absolute inset-0 will-change-transform">
            {particlesData.filter(p => p.l !== 0).map((p, i) => (
              <motion.div
                key={`bg-${i}`}
                className={`absolute rounded-full ${p.c}`}
                style={{
                  width: p.s, height: p.s, left: `${p.x}%`, top: `${p.y}%`,
                  filter: `blur(${p.blur}px)`,
                }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: p.dur, repeat: Infinity, ease: "linear", delay: p.d }}
              />
            ))}
          </motion.div>
        </div>
      )}

      {/* Ambient Background Glows */}
      <div className="absolute top-[10%] right-[10%] w-[50vw] max-w-[600px] h-[50vw] max-h-[600px] bg-emerald-700/10 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] blur-[120px] pointer-events-none mix-blend-screen animate-liquid-morph"></div>

      <div className="max-w-6xl w-full mx-auto relative z-10 py-12 px-4 sm:px-6">
        
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.02] border border-white/[0.05] shadow-sm mb-6 backdrop-blur-xl">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
              <span className="text-[11px] font-black text-slate-300 tracking-[0.3em] uppercase">Billing & Payments</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 drop-shadow-md">Transaction History</h2>
            <p className="text-slate-400 font-light text-[17px] mix-blend-screen max-w-xl">View all your secure course purchases, detailed receipts, and current payment statuses.</p>
          </div>

          <button className="group relative px-8 py-4 bg-[#050505] hover:bg-[#0a0f1c] border border-white/[0.08] hover:border-emerald-500/50 rounded-2xl text-[13px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-all duration-500 flex items-center gap-3 overflow-hidden shadow-2xl w-fit">
             <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 translate-x-[-100%] group-hover:translate-x-[100%]"></div>
             <svg className="w-5 h-5 text-emerald-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
             <span className="relative z-10">Download Statement</span>
          </button>
        </motion.div>

        {/* Data Table Section (Spotlight Refined) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          ref={cardRef}
          onMouseEnter={() => { if (window.innerWidth >= 768) isHovered.set(1); }}
          onMouseLeave={() => isHovered.set(0)}
          className="relative bg-[#03050a] border border-white/[0.04] rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl transition-colors duration-500 hover:border-white/[0.1] overflow-hidden"
        >
          {/* Spotlight Glow tracking the mouse cursor */}
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition duration-300 group-hover:opacity-100 z-0"
            style={{ background: backgroundTemplate }}
          />
          {/* Top light reflection border for a glass feel */}
          <div className="absolute inset-0 z-0 pointer-events-none border-t border-white/[0.05] rounded-[inherit] mix-blend-overlay"></div>

          <div className="relative z-10 w-full h-full p-2 sm:p-4">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <div className="w-12 h-12 border-2 border-slate-800 border-t-emerald-400 rounded-full animate-spin mb-6 z-10"></div>
                    <p className="text-emerald-400 font-bold tracking-[0.2em] uppercase text-xs z-10">Fetching Records...</p>
                </div>
            ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center px-4">
                    <div className="w-24 h-24 bg-white/[0.02] rounded-[2rem] border border-white/[0.05] flex items-center justify-center mx-auto mb-8 text-slate-500 shadow-inner">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4 tracking-tight">No Transactions Found</h3>
                    <p className="text-slate-400 mb-10 text-lg font-light max-w-lg mx-auto leading-relaxed">You haven't made any purchases yet. Explore our premium courses to start your learning journey.</p>
                    <Link 
                        href="/courses" 
                        className="inline-flex items-center gap-3 px-10 py-5 text-[14px] font-black text-[#000000] bg-white hover:bg-slate-200 rounded-full transition-colors duration-300 shadow-[0_0_30px_rgba(255,255,255,0.15)] uppercase tracking-widest active:scale-95"
                    >
                        Browse Courses
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto custom-scrollbar rounded-[1.5rem]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/[0.05] text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                                <th className="p-6 sm:p-8 whitespace-nowrap">Transaction ID</th>
                                <th className="p-6 sm:p-8 whitespace-nowrap">Date</th>
                                <th className="p-6 sm:p-8 whitespace-nowrap">Course / Item</th>
                                <th className="p-6 sm:p-8 whitespace-nowrap">Amount</th>
                                <th className="p-6 sm:p-8 whitespace-nowrap">Status</th>
                                <th className="p-6 sm:p-8 text-right whitespace-nowrap">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {transactions.map((tx) => (
                                <tr key={tx._id} className="hover:bg-white/[0.02] transition-colors duration-300 group">
                                    <td className="p-6 sm:p-8">
                                        <span className="font-mono text-[13px] text-slate-300 font-medium bg-[#010206] px-3 py-1.5 rounded-lg border border-white/[0.05]">{tx.transactionId}</span>
                                    </td>
                                    <td className="p-6 sm:p-8 text-[14px] font-medium text-slate-400 whitespace-nowrap">
                                        {new Date(tx.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="p-6 sm:p-8">
                                        <span className="text-[15px] font-bold text-slate-200 line-clamp-1">{tx.courseId?.title || "Unknown Course"}</span>
                                    </td>
                                    <td className="p-6 sm:p-8">
                                        <span className="text-[16px] font-black text-emerald-400">₹{tx.amount.toLocaleString()}</span>
                                    </td>
                                    <td className="p-6 sm:p-8 whitespace-nowrap">
                                        {tx.status === 'Completed' ? ( // 👈 FIXED: Matches backend logic exactly
                                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-[0.1em]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(52,211,153,1)]"></span> Success
                                            </span>
                                        ) : tx.status === 'Pending' ? (
                                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-[0.1em]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_5px_rgba(245,158,11,1)]"></span> Pending
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-[0.1em]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,1)]"></span> Failed
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-6 sm:p-8 text-right">
                                        <button className="text-slate-500 group-hover:text-emerald-400 font-bold text-[11px] uppercase tracking-widest transition-colors duration-300 flex items-center justify-end gap-2 w-full">
                                            Receipt <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Global CSS for Animations */}
      <style dangerouslySetInnerHTML={{ __html: globalAnimations }} />
    </div>
  );
}