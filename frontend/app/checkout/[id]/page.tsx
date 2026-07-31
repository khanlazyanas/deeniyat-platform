"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";

// Script loading helper for Razorpay
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const courseId = unwrappedParams.id;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [course, setCourse] = useState<{ title: string; price: number; _id: string } | null>(null);

  useEffect(() => {
    // Fetch course details
    const fetchCourse = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`);
        if (res.ok) {
          const data = await res.json();
          setCourse(data);
        } else {
          // Fallback demo data if API fails during testing
          setCourse({ _id: courseId, title: "Advanced Tajweed & Qira'at Masterclass", price: 1499 });
        }
      } catch (err) {
        setCourse({ _id: courseId, title: "Advanced Tajweed & Qira'at Masterclass", price: 1499 });
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleRazorpayPayment = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // 1. Load Razorpay SDK
      const res = await loadRazorpayScript();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      // SAFE PRICE CALCULATION LOGIC
      const safePriceForPayment = course?.price || 1499;
      const taxForPayment = Math.round(safePriceForPayment * 0.18);
      const totalAmount = safePriceForPayment + taxForPayment;

      // 2. Call REAL BACKEND to create an order
      const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ amount: totalAmount, courseId })
      });
      const orderData = await orderResponse.json();

      if (!orderData.success) {
        alert("Failed to create order. Is Backend running?");
        setLoading(false);
        return;
      }

      // 3. Initialize Razorpay Options with REAL Order ID
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Automatically picks from .env.local
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        name: "Deeniyat Platform",
        description: `Enrollment for ${course?.title}`,
        order_id: orderData.order.id, // ASLI ID JO BACKEND SE AAYI HAI
        handler: async function (response: any) {
          
          // 4. VERIFY PAYMENT SIGNATURE ON BACKEND
          try {
            const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseId: courseId,
                amount: totalAmount
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // 5. Database mein Transaction Save karna
              await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                  amount: totalAmount,
                  type: "Course_Fee",
                  courseId: courseId,
                  status: "Completed",
                  paymentId: response.razorpay_payment_id
                })
              });

              setSuccess(true);
              setTimeout(() => {
                router.push("/dashboard/transactions");
              }, 2000);
            } else {
              alert("Payment Verification Failed! Data might be tampered.");
            }
          } catch (error) {
            alert("Error verifying payment.");
          }
        },
        prefill: {
          name: "Test Student", // You can update this to fetch user data if needed
          email: "student@test.com",
          contact: "9999999999"
        },
        theme: {
          color: "#10b981" 
        }
      };

      // 6. Open the Razorpay Payment Modal
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on("payment.failed", function (response: any) {
        alert(`Payment Failed: ${response.error.description}`);
        setLoading(false);
      });
      
      paymentObject.open();

    } catch (error) {
      console.error(error);
      alert("Something went wrong with the payment gateway.");
      setLoading(false);
    }
  };

  if (!course) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-emerald-500">Loading secure checkout...</div>;

  // SAFE CALCULATION FOR UI TO PREVENT NaN
  const safePrice = course?.price || 1499;
  const tax = Math.round(safePrice * 0.18);
  const total = safePrice + tax;

  return (
    <div className="min-h-screen bg-[#020617] font-sans selection:bg-emerald-500/30 selection:text-emerald-200 relative flex items-center justify-center p-4">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 pt-20 pb-10">
        
        {/* Left Side - Order Summary */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-8 md:p-10 shadow-2xl">
          <Link href={`/courses/${courseId}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white mb-10 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Course
          </Link>
          
          <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
          
          <div className="flex gap-4 p-4 bg-[#020617] rounded-2xl border border-slate-800 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-900 to-slate-800 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-white text-lg leading-tight mb-1">{course.title}</h3>
              <p className="text-sm text-slate-400">Full Lifetime Access</p>
            </div>
          </div>

          <div className="space-y-4 text-sm font-medium border-t border-slate-800/50 pt-6">
            <div className="flex justify-between text-slate-300">
              <span>Original Price</span>
              <span>₹{safePrice}</span>
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

        {/* Right Side - Professional Payment Gateway Trigger */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-8 md:p-10 shadow-2xl flex flex-col justify-center relative overflow-hidden">
          
          {success ? (
            <div className="text-center animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-[#020617] shadow-[0_0_30px_rgba(52,211,153,0.5)]">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
              </div>
              <h2 className="text-3xl font-black text-white mb-2">Payment Successful!</h2>
              <p className="text-slate-400">Your enrollment is confirmed. Redirecting to dashboard...</p>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300 shadow-inner">
                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-2">Secure Checkout</h2>
              <p className="text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed">
                You will be redirected to our secure payment gateway to complete your purchase using UPI, Credit Card, or Net Banking.
              </p>

              <button 
                onClick={handleRazorpayPayment}
                disabled={loading} 
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(52,211,153,0.2)] hover:shadow-[0_0_30px_rgba(52,211,153,0.4)] disabled:opacity-70 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    Connecting to Bank...
                  </>
                ) : (
                  <>
                    Pay ₹{total} via Razorpay
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </>
                )}
              </button>

              {/* Trust Badges */}
              <div className="pt-8 mt-8 border-t border-slate-800/50 flex flex-wrap justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
                <div className="px-3 py-1 bg-slate-800 rounded text-xs font-bold tracking-wider text-slate-300">UPI</div>
                <div className="px-3 py-1 bg-slate-800 rounded text-xs font-bold tracking-wider text-slate-300">VISA</div>
                <div className="px-3 py-1 bg-slate-800 rounded text-xs font-bold tracking-wider text-slate-300">MasterCard</div>
                <div className="px-3 py-1 bg-slate-800 rounded text-xs font-bold tracking-wider text-slate-300">NetBanking</div>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium mt-4">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                100% Encrypted & PCI DSS Compliant
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}