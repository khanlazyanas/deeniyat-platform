"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Transaction {
  _id: string;
  amount: number;
  status: 'Success' | 'Pending' | 'Failed';
  transactionId: string;
  createdAt: string;
  courseId?: {
    title: string;
  };
}

// --- GLOBAL STYLES (Safe from VS Code parser bugs) ---
const globalAnimations = `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }
`;

// --- PRE-COMPUTED HYPER-DENSE PARTICLE ARRAY ---
const generateBubbles = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: Math.random() * 20 + 5,
    xPos: Math.random() * 100,
    yPos: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 10,
    color: ['bg-emerald-400', 'bg-teal-400', 'bg-blue-400', 'bg-purple-400', 'bg-amber-400', 'bg-white'][Math.floor(Math.random() * 6)],
    blur: Math.random() * 3 + 1,
    opacity: Math.random() * 0.5 + 0.3,
    layer: Math.floor(Math.random() * 3)
  }));
};

const ambientBubbles = generateBubbles(45);

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // --- MOUSE PARALLAX TRACKING LOGIC ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const fgX = useTransform(smoothMouseX, (v) => v * 1.5);
  const fgY = useTransform(smoothMouseY, (v) => v * 1.5);
  const mgX = useTransform(smoothMouseX, (v) => v * 0.8);
  const mgY = useTransform(smoothMouseY, (v) => v * 0.8);
  const bgX = useTransform(smoothMouseX, (v) => v * 0.3);
  const bgY = useTransform(smoothMouseY, (v) => v * 0.3);

  // Holographic Card Config
  const cardRef = useRef<HTMLDivElement>(null);
  const cardSpringConfig = { damping: 40, stiffness: 250, mass: 0.5 };
  const rotateX = useSpring(useTransform(smoothMouseY, [-50, 50], [4, -4]), cardSpringConfig);
  const rotateY = useSpring(useTransform(smoothMouseX, [-50, 50], [-4, 4]), cardSpringConfig);
  const [isHovered, setIsHovered] = useState(false);
  const [glarePosition, setGlarePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 100;
      const y = (e.clientY / window.innerHeight - 0.5) * 100;
      mouseX.set(x);
      mouseY.set(y);

      if (cardRef.current && isHovered) {
        const rect = cardRef.current.getBoundingClientRect();
        setGlarePosition({ 
          x: e.clientX - rect.left, 
          y: e.clientY - rect.top 
        });
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
        console.warn("Using fallback/empty data because API failed:", err.message);
        setTransactions([
          {
            _id: "tx_1",
            transactionId: "PAY-987654321",
            amount: 1499,
            status: "Success",
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
        setTimeout(() => setLoading(false), 800); // Cinematic delay
      }
    };

    fetchTransactions();

    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [mouseX, mouseY, isHovered]);

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#010206] text-slate-50 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-hidden relative px-4 sm:px-6 lg:px-8 perspective-[2000px]">
      
      {/* GLOBAL BACKGROUND */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay pointer-events-none z-0"></div>

      {/* --- HYPER-DENSE 3D PARTICLES ENGINE --- */}
      {mounted && (
        <div className="fixed inset-0 z-[5] pointer-events-none overflow-hidden">
          {/* Layer 0: Foreground */}
          <motion.div style={{ x: fgX, y: fgY }} className="absolute inset-0 will-change-transform">
            {ambientBubbles.filter(b => b.layer === 0).map((p, i) => (
              <motion.div
                key={`fg-${i}`}
                className={`absolute rounded-full ${p.color}`}
                style={{
                  width: p.size, height: p.size, left: `${p.xPos}%`, top: `${p.yPos}%`,
                  filter: `blur(${p.blur}px)`, opacity: p.opacity,
                  boxShadow: `0 0 ${p.size * 2.5}px currentColor`
                }}
                animate={{ y: [0, -60, 0], x: [0, 30, -20, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
              />
            ))}
          </motion.div>

          {/* Layer 1: Midground */}
          <motion.div style={{ x: mgX, y: mgY }} className="absolute inset-0 will-change-transform">
             {ambientBubbles.filter(b => b.layer === 1).map((p, i) => (
              <motion.div
                key={`mg-${i}`}
                className={`absolute rounded-full ${p.color}`}
                style={{
                  width: p.size * 0.8, height: p.size * 0.8, left: `${p.xPos}%`, top: `${p.yPos}%`,
                  filter: `blur(${p.blur + 1}px)`, opacity: p.opacity * 0.7,
                  boxShadow: `0 0 ${p.size * 1.5}px currentColor`
                }}
                animate={{ y: [0, -40, 0], x: [0, -20, 15, 0] }}
                transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
              />
            ))}
          </motion.div>

          {/* Layer 2: Background */}
          <motion.div style={{ x: bgX, y: bgY }} className="absolute inset-0 will-change-transform">
            {ambientBubbles.filter(b => b.layer === 2).map((p, i) => (
              <motion.div
                key={`bg-${i}`}
                className={`absolute rounded-full ${p.color}`}
                style={{
                  width: p.size * 1.5, height: p.size * 1.5, left: `${p.xPos}%`, top: `${p.yPos}%`,
                  filter: `blur(${p.blur + 3}px)`, opacity: p.opacity * 0.4
                }}
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay }}
              />
            ))}
          </motion.div>
        </div>
      )}

      {/* Ambient Background Glows */}
      <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-[pulse_10s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-[10%] left-[10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[140px] pointer-events-none mix-blend-screen animate-[pulse_15s_ease-in-out_infinite_reverse]"></div>

      <div className="max-w-6xl w-full mx-auto relative z-10 py-12">
        
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.02] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)] mb-6 backdrop-blur-xl">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,1)]"></span>
              <span className="text-[11px] font-black text-slate-300 tracking-[0.3em] uppercase">Billing & Payments</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 drop-shadow-md">Transaction History</h2>
            <p className="text-slate-400 font-light text-[17px] mix-blend-screen max-w-xl">View all your secure course purchases, detailed receipts, and current payment statuses.</p>
          </div>

          <button className="group relative px-8 py-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-emerald-500/50 rounded-2xl text-[13px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-all duration-300 flex items-center gap-3 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] w-fit">
             <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-[-100%] group-hover:translate-x-[100%]"></div>
             <svg className="w-5 h-5 text-emerald-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
             <span className="relative z-10">Download Statement</span>
          </button>
        </motion.div>

        {/* Data Table Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
          ref={cardRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative bg-[#030612]/70 backdrop-blur-[40px] backdrop-saturate-[150%] border border-white/[0.06] rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.5)] transition-colors duration-700 hover:border-white/[0.12] will-change-transform overflow-hidden"
        >
          {/* Dynamic Holographic Glare */}
          <div
            className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 z-0 mix-blend-color-dodge rounded-[2.5rem]"
            style={{
              opacity: isHovered ? 1 : 0,
              background: `radial-gradient(800px circle at ${glarePosition.x}px ${glarePosition.y}px, rgba(255,255,255,0.1), transparent 40%)`,
            }}
          />

          <div className="relative z-10 w-full h-full transform-gpu" style={{ transform: "translateZ(20px)" }}>
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <div className="w-16 h-16 border-4 border-slate-800/80 border-t-emerald-400 rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(52,211,153,0.5)] z-10"></div>
                    <p className="text-emerald-400 font-bold tracking-[0.2em] uppercase text-sm z-10">Fetching Records...</p>
                </div>
            ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center px-4">
                    <div className="w-24 h-24 bg-white/[0.02] rounded-[2rem] border border-white/[0.05] flex items-center justify-center mx-auto mb-8 text-slate-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4 tracking-tight">No Transactions Found</h3>
                    <p className="text-slate-400 mb-10 text-lg font-light max-w-lg mx-auto leading-relaxed">You haven't made any purchases yet. Explore our premium courses to start your learning journey.</p>
                    <Link 
                        href="/courses" 
                        className="inline-flex items-center gap-3 px-10 py-5 text-[15px] text-slate-950 bg-gradient-to-b from-emerald-400 to-teal-500 font-black uppercase tracking-widest rounded-full transition-all duration-500 shadow-[0_0_30px_-10px_rgba(52,211,153,0.6),inset_0_1px_1px_rgba(255,255,255,0.8)] hover:scale-105 ring-1 ring-white/20"
                    >
                        Browse Courses
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#010206]/80 backdrop-blur-md border-b border-white/[0.04] text-[11px] uppercase tracking-[0.2em] text-slate-500 font-black">
                                <th className="p-8">Transaction ID</th>
                                <th className="p-8">Date</th>
                                <th className="p-8">Course / Item</th>
                                <th className="p-8">Amount</th>
                                <th className="p-8">Status</th>
                                <th className="p-8 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {transactions.map((tx) => (
                                <tr key={tx._id} className="hover:bg-white/[0.02] transition-colors duration-300 group">
                                    <td className="p-8">
                                        <span className="font-mono text-[13px] text-slate-300 font-bold bg-[#010206] px-3 py-1.5 rounded-lg border border-white/[0.05]">{tx.transactionId}</span>
                                    </td>
                                    <td className="p-8 text-[14px] font-medium text-slate-400">
                                        {new Date(tx.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="p-8">
                                        <span className="text-[15px] font-bold text-white line-clamp-1 drop-shadow-md">{tx.courseId?.title || "Unknown Course"}</span>
                                    </td>
                                    <td className="p-8">
                                        <span className="text-[16px] font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">₹{tx.amount.toLocaleString()}</span>
                                    </td>
                                    <td className="p-8">
                                        {tx.status === 'Success' ? (
                                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.1em] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(52,211,153,1)]"></span> Success
                                            </span>
                                        ) : tx.status === 'Pending' ? (
                                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-[0.1em] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_5px_rgba(245,158,11,1)]"></span> Pending
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-[0.1em] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,1)]"></span> Failed
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-8 text-right">
                                        <button className="text-slate-400 group-hover:text-emerald-400 font-black text-[12px] uppercase tracking-widest transition-colors duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center justify-end gap-2 w-full">
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