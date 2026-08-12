"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 1. TypeScript Interface Define Karo
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  enrolledCourses: string[]; // 👈 NEW: Frontend ko course list yaad rakhne ke liye
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, authToken: string) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
  loading: boolean;
}

// 2. Context Create Karo
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Provider Component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initial load par Local Storage se data uthao
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    setLoading(false);

    // 👇 NEW: Storage event listener for multi-tab sync (Checkout page update karega toh yahan bhi hoga)
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem("user");
      if (updatedUser && updatedUser !== "undefined") {
        setUser(JSON.parse(updatedUser));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Login Function
  const login = (userData: User, authToken: string) => {
    // Make sure enrolledCourses exists even if empty
    const completeUser = { ...userData, enrolledCourses: userData.enrolledCourses || [] };
    setUser(completeUser);
    setToken(authToken);
    localStorage.setItem("user", JSON.stringify(completeUser));
    localStorage.setItem("token", authToken);
  };

  // Logout Function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/login"); 
  };

  // Update Profile Function 
  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Custom Hook 
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};