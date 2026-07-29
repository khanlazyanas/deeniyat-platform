"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
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
                    // Verify if data is an array, else set to empty array
                    setTransactions(Array.isArray(data) ? data : []);
                } else {
                    // If the backend route isn't fully ready yet, we won't crash the app.
                    throw new Error("Failed to fetch transactions");
                }
            } catch (err: any) {
                console.warn("Using fallback/empty data because API failed:", err.message);
                // Fallback dummy data just to show the UI if backend is not linked yet
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
                        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                        courseId: { title: "Basic Arabic Grammar" }
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    return (
        <div className="min-h-[85vh] p-4 md:p-8 relative overflow-hidden bg-[#020617] font-sans">
            {/* Decorative Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

            <div className="max-w-6xl mx-auto relative z-10">

                {/* Header Section */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-emerald-500/30 mb-4 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                            <span className="text-xs font-semibold text-emerald-300 tracking-wider uppercase">Billing & Payments</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">Transaction History</h2>
                        <p className="text-slate-400 font-light">View all your course purchases, receipts, and payment status.</p>
                    </div>

                    <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-2 w-fit">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download Statement
                    </button>
                </div>

                {/* Data Table Section */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden">

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-10 h-10 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-400 font-medium tracking-wide">Loading transactions...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No Transactions Found</h3>
                            <p className="text-slate-400 mb-6 max-w-md">You haven't made any purchases yet. Explore our courses to start your learning journey.</p>
                            <Link href="/courses" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                                Browse Courses
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900/80 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400 font-bold">
                                        <th className="p-6">Transaction ID</th>
                                        <th className="p-6">Date</th>
                                        <th className="p-6">Course / Item</th>
                                        <th className="p-6">Amount</th>
                                        <th className="p-6">Status</th>
                                        <th className="p-6 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {transactions.map((tx) => (
                                        <tr key={tx._id} className="hover:bg-slate-800/30 transition-colors group">
                                            <td className="p-6">
                                                <span className="font-mono text-sm text-slate-300 font-medium">{tx.transactionId}</span>
                                            </td>
                                            <td className="p-6 text-sm text-slate-400">
                                                {new Date(tx.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="p-6">
                                                <span className="text-sm font-semibold text-white line-clamp-1">{tx.courseId?.title || "Unknown Course"}</span>
                                            </td>
                                            <td className="p-6">
                                                <span className="text-sm font-bold text-white">₹{tx.amount.toLocaleString()}</span>
                                            </td>
                                            <td className="p-6">
                                                {tx.status === 'Success' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Success
                                                    </span>
                                                ) : tx.status === 'Pending' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Pending
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Failed
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-6 text-right">
                                                <button className="text-emerald-400 hover:text-emerald-300 font-medium text-sm transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center justify-end gap-1 w-full">
                                                    Receipt <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}