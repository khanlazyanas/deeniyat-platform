"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Separated message states to avoid conflicts between forms
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  // Load user data safely avoiding the "undefined" JSON bug
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined") {
        const user = JSON.parse(storedUser);
        setName(user.name || "");
        setEmail(user.email || "");
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
    }
  }, []);

  // Handle Profile Update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProfileMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });

      const data = await response.json();

      if (response.ok) {
        setProfileMessage({ type: "success", text: "Profile updated successfully! ✨" });
        
        const storedUser = localStorage.getItem("user");
        if (storedUser && storedUser !== "undefined") {
          const user = JSON.parse(storedUser);
          user.name = data.name; 
          localStorage.setItem("user", JSON.stringify(user));
        }
      } else {
        setProfileMessage({ type: "error", text: data.message || "Failed to update profile." });
      }
    } catch (error) {
      console.error("Profile update network error:", error);
      setProfileMessage({ type: "error", text: "Network Error. Failed to update profile." });
    } finally {
      setLoading(false);
      setTimeout(() => setProfileMessage({ type: "", text: "" }), 4000);
    }
  };

  // Handle Password Update
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    // Basic frontend validation
    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "New password must be at least 6 characters long." });
      setTimeout(() => setPasswordMessage({ type: "", text: "" }), 4000);
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordMessage({ type: "success", text: "Password changed successfully! 🔒" });
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setPasswordMessage({ type: "error", text: data.message || "Failed to change password." });
      }
    } catch (error) {
      console.error("Password update network error:", error);
      setPasswordMessage({ type: "error", text: "Network Error. Failed to change password." });
    } finally {
      setPasswordLoading(false);
      setTimeout(() => setPasswordMessage({ type: "", text: "" }), 4000);
    }
  };

  return (
    <div className="min-h-[85vh] p-4 md:p-8 relative overflow-hidden bg-[#020617] font-sans">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-emerald-500/30 mb-4 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-300 tracking-wider uppercase">Account Preferences</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">Settings</h2>
          <p className="text-slate-400 font-light">Manage your personal information and security preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-2">
            <button className="w-full text-left px-5 py-3 rounded-xl bg-emerald-900/20 text-emerald-400 border border-emerald-500/30 font-semibold shadow-[0_0_15px_rgba(52,211,153,0.1)]">
              Personal Info & Security
            </button>
            <button className="w-full text-left px-5 py-3 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-medium transition-colors">
              Notifications
            </button>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-8 shadow-2xl">
              
              {/* Profile Section */}
              <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-4">Personal Information</h3>
              
              {profileMessage.text && (
                <div className={`mb-6 p-4 rounded-xl text-sm font-medium border ${profileMessage.type === 'success' ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
                  {profileMessage.text}
                </div>
              )}

              <form onSubmit={handleProfileUpdate} className="space-y-6 mb-12">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-emerald-500/50 flex items-center justify-center text-2xl font-bold text-emerald-400 uppercase">
                    {name ? name.charAt(0) : "U"}
                  </div>
                  <div>
                    <button type="button" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors border border-slate-700 mb-2 block">
                      Change Avatar
                    </button>
                    <p className="text-xs text-slate-500">JPG, GIF or PNG. Max size of 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Full Name</label>
                    <input 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#020617] border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Email Address</label>
                    <input 
                      type="email"
                      value={email}
                      disabled
                      className="w-full bg-[#020617] border border-slate-800 text-slate-500 rounded-xl px-4 py-3 outline-none cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-2">Email address cannot be changed. Contact admin for support.</p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>

              {/* Security Section */}
              <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-4">Security</h3>
              
              {passwordMessage.text && (
                <div className={`mb-6 p-4 rounded-xl text-sm font-medium border ${passwordMessage.type === 'success' ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
                  {passwordMessage.text}
                </div>
              )}

              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Current Password</label>
                  <input 
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-[#020617] border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">New Password</label>
                  <input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-[#020617] border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                  />
                </div>
                <div className="pt-2 flex justify-end">
                  <button 
                    type="submit"
                    disabled={passwordLoading || !currentPassword || !newPassword}
                    className="px-8 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                  >
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}