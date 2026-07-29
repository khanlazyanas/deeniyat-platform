"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const courseId = unwrappedParams.id;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [course, setCourse] = useState<{ title: string; price: number; _id: string } | null>(null);

  useEffect(() => {
    // In a real app, fetch course details by ID. For now, simulating a fetch.
    setCourse({
      _id: courseId,
      title: "Advanced Tajweed & Qira'at Masterclass",
      price: 1499,
    });
  }, [courseId]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate payment processing delay (e.g., Stripe/Razorpay logic goes here)
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);

      // Redirect to transactions page after successful payment
      setTimeout(() => {
        router.push("/dashboard/transactions");
      }, 2000);
    }, 2500);
  };

  if (!course) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-emerald-500">Loading checkout...</div>;

  const tax = Math.round(course.price * 0.18); // 18% GST Simulation
  const total = course.price + tax;

  return (
    <div className="min-h-screen bg-[#020617] font-sans selection:bg-emerald-500/30 selection:text-emerald-200 relative flex items-center justify-center p-4">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        
        {/* Left Side - Order Summary */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-8 md:p-10 shadow-2xl">
          <Link href={`/courses`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white mb-10 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Courses
          </Link>
          
          <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
          
          <div className="flex gap-4 p-4 bg-[#020617] rounded-2xl border border-slate-800 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-900 to-slate-800 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-white text-lg leading-tight mb-1">{course.title}</h3>
              <p className="text-sm text-slate-400">Lifetime Access</p>
            </div>
          </div>

          <div className="space-y-4 text-sm font-medium border-t border-slate-800/50 pt-6">
            <div className="flex justify-between text-slate-300">
              <span>Original Price</span>
              <span>₹{course.price}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Taxes (18% GST)</span>
              <span>₹{tax}</span>
            </div>
            <div className="flex justify-between text-white text-xl font-black pt-4 border-t border-slate-800/50">
              <span>Total Amount</span>
              <span className="text-emerald-400">₹{total}</span>
            </div>
          </div>
        </div>

        {/* Right Side - Payment Form */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-8 md:p-10 shadow-2xl flex flex-col justify-center relative overflow-hidden">
          
          {success ? (
            <div className="text-center animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-[#020617] shadow-[0_0_30px_rgba(52,211,153,0.5)]">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
              </div>
              <h2 className="text-3xl font-black text-white mb-2">Payment Successful!</h2>
              <p className="text-slate-400">Generating your receipt and redirecting to dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handlePayment} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Payment Details</h2>
                <p className="text-sm text-slate-400 mb-6">Complete your secure purchase.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Card Number</label>
                  <input required type="text" placeholder="0000 0000 0000 0000" maxLength={19} className="w-full bg-[#020617] border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors font-mono tracking-widest" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Expiry Date</label>
                    <input required type="text" placeholder="MM/YY" maxLength={5} className="w-full bg-[#020617] border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">CVC</label>
                    <input required type="password" placeholder="•••" maxLength={3} className="w-full bg-[#020617] border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors font-mono tracking-widest" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Cardholder Name</label>
                  <input required type="text" placeholder="e.g. Anas Khan" className="w-full bg-[#020617] border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors" />
                </div>
              </div>

              <button disabled={loading} type="submit" className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(52,211,153,0.2)] disabled:opacity-70 flex items-center justify-center gap-2 group mt-8">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Pay ₹{total} Securely
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </>
                )}
              </button>
              
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-4">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Payments are 100% secure and encrypted
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}