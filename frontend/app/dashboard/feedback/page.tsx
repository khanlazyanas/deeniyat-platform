"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function FeedbackPage() {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ rating, review })
      });
      if (res.ok) {
        setStatus("success");
        setReview("");
      } else throw new Error();
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen pt-24 bg-[#010206] px-6">
      <div className="max-w-2xl mx-auto bg-[#030612]/80 backdrop-blur-xl border border-white/[0.05] p-10 rounded-[2rem] shadow-xl">
        <h2 className="text-3xl font-black text-white mb-2">Rate Your Experience</h2>
        <p className="text-slate-400 mb-8">Your feedback will be featured live on our homepage!</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button type="button" key={star} onClick={() => setRating(star)} className={`text-4xl transition-colors ${rating >= star ? 'text-amber-400' : 'text-slate-700'}`}>★</button>
            ))}
          </div>
          <textarea
            value={review} onChange={(e) => setReview(e.target.value)} required maxLength={300}
            placeholder="How has Deeniyat Platform helped you? (Max 300 chars)"
            className="w-full bg-[#010206] border border-white/[0.1] rounded-xl p-4 text-white focus:border-amber-400 focus:outline-none" rows={5}
          />
          <button type="submit" disabled={status === "submitting"} className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-full w-full">
            {status === "submitting" ? "Submitting..." : "Submit Review Live"}
          </button>
          {status === "success" && <p className="text-emerald-400 text-center font-bold">Review published to homepage! 🎉</p>}
        </form>
      </div>
    </div>
  );
}