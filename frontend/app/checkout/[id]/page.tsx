"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate, Variants } from "framer-motion";

// --- Framer Motion Variants ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 250, damping: 25, mass: 0.5 } 
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

// --- 3D Holographic Card Component (GPU OPTIMIZED) ---
function HolographicCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glareX = useMotionValue(0);
  const glareY = useMotionValue(0);
  const isHovered = useMotionValue(0);
  
  const springConfig = { damping: 30, stiffness: 200, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), springConfig); 
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), springConfig);

  const backgroundTemplate = useMotionTemplate`radial-gradient(800px circle at ${glareX}px ${glareY}px, rgba(255,255,255,0.08), transparent 45%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768 || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    glareX.set(e.clientX - rect.left);
    glareY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = () => { if (window.innerWidth >= 768) isHovered.set(1); };
  const handleMouseLeave = () => {
    isHovered.set(0);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      variants={fadeInUp}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative overflow-hidden bg-[#030612]/70 backdrop-blur-xl backdrop-saturate-[150%] border border-white/[0.06] rounded-[2rem] shadow-[0_32px_64px_-20px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.5)] transition-colors duration-500 hover:border-white/[0.1] will-change-transform ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px z-0 mix-blend-color-dodge transition-opacity duration-300"
        style={{ opacity: isHovered, background: backgroundTemplate }}
      />
      <div className="relative z-10 w-full h-full transform-gpu" style={{ transform: "translateZ(20px)" }}>
        {children}
      </div>
    </motion.div>
  );
}

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
  
  // 👇 FIX: Course State mein gstPercentage add kar diya gaya hai
  const [course, setCourse] = useState<{ title: string; price: number; gstPercentage: number; _id: string } | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`);
        if (res.ok) {
          const data = await res.json();
          // API se price aur gstPercentage dono lenge
          setCourse({
              _id: data._id,
              title: data.title,
              price: data.price || 0,
              gstPercentage: data.gstPercentage || 0
          });
        } else {
          setCourse({ _id: courseId, title: "Course Details Not Found", price: 0, gstPercentage: 0 });
        }
      } catch (err) {
        setCourse({ _id: courseId, title: "Course Details Not Found", price: 0, gstPercentage: 0 });
      }
    };
    fetchCourse();
  }, [courseId]);

  // 👇 DYNAMIC CALCULATION BASED ON USTAD'S SETTING
  const safePrice = course?.price || 0;
  const safeGst = course?.gstPercentage || 0;
  
  // Tax = (Base Price * GST%) / 100
  const calculatedTax = Math.round((safePrice * safeGst) / 100);
  const totalAmount = safePrice + calculatedTax;

  const handleRazorpayPayment = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await loadRazorpayScript();
      if (!res) {
        alert("Payment gateway offline. Check internet.");
        setLoading(false);
        return;
      }

      // 1. Call Backend to create order (sending exactly totalAmount)
      const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-order`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ amount: totalAmount, courseId })
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.success) {
        alert("Gateway Error: " + (orderData.error || 'Initialization failed.'));
        setLoading(false);
        return;
      }

      // 2. Razorpay Options
      const options = {
        key: 'rzp_test_8YGiWeZrGctMwH', // Asli working key
        amount: orderData.order.amount, // Total amount automatically in paise from backend
        currency: orderData.order.currency || "INR",
        name: "Deeniyat Platform",
        description: `Enrollment for ${course?.title}`,
        order_id: orderData.order.id,
        handler: async function (response: any) {
          try {
            // 3. Verify Payment on Backend
            const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/verify`, {
              method: "POST",
              headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${token}` 
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseId: courseId,
                amount: totalAmount
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              // 4. Save Transaction Record
              const txnResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
                method: "POST",
                headers: { 
                  "Content-Type": "application/json", 
                  "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({
                  amount: totalAmount,
                  type: "Course_Fee",
                  courseId: courseId,
                  status: "Completed",
                  paymentId: response.razorpay_payment_id
                })
              });

              if (txnResponse.ok) {
                // UPDATE LOCAL STORAGE SO FRONTEND INSTANTLY KNOWS ABOUT ENROLLMENT
                const storedUserStr = localStorage.getItem("user");
                if (storedUserStr) {
                  const storedUser = JSON.parse(storedUserStr);
                  storedUser.enrolledCourses = storedUser.enrolledCourses || [];
                  if (!storedUser.enrolledCourses.includes(courseId)) {
                    storedUser.enrolledCourses.push(courseId);
                  }
                  localStorage.setItem("user", JSON.stringify(storedUser));
                  window.dispatchEvent(new Event("storage"));
                }

                setSuccess(true);
                setTimeout(() => {
                  router.push("/dashboard/my-courses");
                }, 3000); // 3 seconds cinematic delay
              } else {
                alert("Payment verified, but failed to save transaction. Contact support.");
                setLoading(false);
              }
            } else {
              alert("Payment Verification Failed!");
              setLoading(false);
            }
          } catch (error) {
            alert("Error verifying payment signature.");
            setLoading(false);
          }
        },
        prefill: { 
          name: "Test Student", 
          contact: "9999999999" 
        },
        theme: { 
          color: '#10b981' 
        },
        modal: { 
          ondismiss: function() { 
            setLoading(false); 
          } 
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error(error);
      alert("Something went wrong with the payment gateway.");
      setLoading(false);
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-[#010206] flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] animate-pulse"></div>
        <div className="flex flex-col items-center z-10">
           <div className="w-16 h-16 border-4 border-slate-800 border-t-emerald-400 rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(52,211,153,0.3)]"></div>
           <p className="text-emerald-400 font-bold tracking-[0.2em] uppercase text-sm">Initializing Secure Checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#010206] font-sans selection:bg-emerald-500/30 selection:text-emerald-200 relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      
      {/* Global Background Textures */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay pointer-events-none z-0"></div>
      
      {/* Ambient Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen transform-gpu"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[140px] pointer-events-none mix-blend-screen transform-gpu"></div>
      
      <motion.div 
        initial="hidden" animate="visible" variants={staggerContainer}
        className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 relative z-10 pt-20 sm:pt-24 pb-10"
      >
        
        {/* Order Summary (Left Side) */}
        <HolographicCard className="lg:col-span-7 p-8 sm:p-12">
          <Link href={`/courses/${courseId}`} className="inline-flex items-center gap-2 text-[13px] font-bold tracking-widest uppercase text-slate-400 hover:text-emerald-400 mb-10 transition-colors group">
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Course
          </Link>
          
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-8 tracking-tighter drop-shadow-md">Order Summary</h2>
          
          {/* Course Details Block */}
          <div className="flex flex-col sm:flex-row gap-5 p-6 bg-[#010206]/50 rounded-[1.5rem] border border-white/[0.04] mb-8 shadow-inner">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#060d20] to-[#040814] border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="font-black text-white text-xl leading-tight mb-2 tracking-tight">{course.title}</h3>
              <div className="inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                <p className="text-[11px] font-black tracking-[0.2em] uppercase text-emerald-400">Full Lifetime Access</p>
              </div>
            </div>
          </div>

          {/* 👇 FIX: Pricing Breakdown with Dynamic GST % */}
          <div className="space-y-5 text-sm sm:text-base font-medium pt-2">
            <div className="flex justify-between text-slate-400">
              <span>Base Course Fee</span>
              <span className="text-slate-200">₹{safePrice.toLocaleString()}</span>
            </div>
            {/* Agar Ustad ne GST set kiya hai toh hi yeh line dikhegi */}
            {safeGst > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Taxes ({safeGst}% GST)</span>
                <span className="text-slate-200">₹{calculatedTax.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-end text-white pt-8 mt-4 border-t border-white/[0.08]">
              <div>
                 <span className="block text-sm text-slate-400 font-normal mb-1 tracking-wide">Total Amount</span>
                 <span className="text-3xl font-black tracking-tighter">Total Due</span>
              </div>
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                ₹{totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </HolographicCard>

        {/* Checkout Action Box (Right Side) */}
        <HolographicCard className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-center text-center">
          {success ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }} className="py-8">
              <div className="relative w-28 h-28 mx-auto mb-8">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(52,211,153,0.6),inset_0_2px_4px_rgba(255,255,255,0.4)]">
                  <svg className="w-12 h-12 text-[#010206]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tighter">Payment Successful!</h2>
              <p className="text-slate-400 text-lg font-light">Your enrollment is confirmed. Redirecting to your dashboard...</p>
            </motion.div>
          ) : (
            <div className="space-y-8 py-6">
              <div className="w-24 h-24 bg-[#010206] border border-white/[0.08] rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 text-slate-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),0_16px_32px_rgba(0,0,0,0.5)]">
                 <svg className="w-12 h-12 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              
              <div>
                <h2 className="text-3xl font-black text-white mb-4 tracking-tighter">Secure Checkout</h2>
                <p className="text-slate-400 text-base font-light leading-relaxed max-w-[280px] mx-auto">
                  Encrypted and safe. Proceed to complete your enrollment via Razorpay.
                </p>
              </div>

              <button 
                onClick={handleRazorpayPayment}
                disabled={loading} 
                className="group relative w-full inline-flex items-center justify-center px-8 py-6 text-[16px] font-black text-[#010206] bg-gradient-to-b from-emerald-400 to-teal-500 rounded-2xl overflow-hidden transition-all duration-300 active:scale-95 shadow-[0_16px_32px_rgba(52,211,153,0.3),inset_0_1px_1px_rgba(255,255,255,0.8)] disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-[0.15em] border border-white/20"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-[3px] border-[#010206]/20 border-t-[#010206] rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay ₹{totalAmount.toLocaleString()}
                      <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </>
                  )}
                </span>
              </button>

              <div className="flex items-center justify-center gap-3 pt-6 border-t border-white/[0.04]">
                 <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">100% Secure & Encrypted</span>
              </div>
            </div>
          )}
        </HolographicCard>

      </motion.div>
    </div>
  );
}