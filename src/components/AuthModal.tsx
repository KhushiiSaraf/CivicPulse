import React, { useState } from "react";
import { X, LogIn, UserPlus, Lock, Mail, User, ShieldCheck, Award, Zap, LogOut, CheckCircle } from "lucide-react";
import { LeaderboardUser } from "./Leaderboard";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: LeaderboardUser) => void;
  onSignup: (name: string, email: string) => void;
}

export default function AuthModal({ isOpen, onClose, onLogin, onSignup }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError("Please fill out all required fields.");
      return;
    }

    if (!isLogin && !name) {
      setError("Please provide your name for registration.");
      return;
    }

    // Email simple validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (isLogin) {
      // Look up in localStorage or create temporary
      const savedUsersRaw = localStorage.getItem("civic_pulse_registered_users");
      let registeredUsers: LeaderboardUser[] = [];
      if (savedUsersRaw) {
        try {
          registeredUsers = JSON.parse(savedUsersRaw);
        } catch (_) {}
      }

      const found = registeredUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        onLogin(found);
        setSuccess("Signed in successfully!");
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        // Mock successful login even if first-time (user convenience) or match default seeded
        const defaultSeeded: Record<string, string> = {
          "marcus@sf.gov": "Marcus Chen",
          "alex@sf.gov": "Alex Rivera",
          "sarah@sf.gov": "Sarah Jenkins",
        };

        const seededName = defaultSeeded[email.toLowerCase()] || email.split("@")[0];
        const dummyUser: LeaderboardUser = {
          id: `user-${Date.now()}`,
          name: seededName,
          email: email,
          reportsCount: email.toLowerCase().includes("sf.gov") ? 6 : 0,
          points: email.toLowerCase().includes("sf.gov") ? 320 : 50, // bonus for registering
          level: email.toLowerCase().includes("sf.gov") ? 2 : 1,
          badges: [
            { id: "badge-first", label: "First Citizen", icon: "award", color: "bg-orange-100 text-orange-800 border-orange-200" }
          ],
          isCurrentUser: true
        };

        // Save to registered
        registeredUsers.push(dummyUser);
        localStorage.setItem("civic_pulse_registered_users", JSON.stringify(registeredUsers));

        onLogin(dummyUser);
        setSuccess("New profile auto-configured & authenticated!");
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } else {
      // Sign Up
      const savedUsersRaw = localStorage.getItem("civic_pulse_registered_users");
      let registeredUsers: LeaderboardUser[] = [];
      if (savedUsersRaw) {
        try {
          registeredUsers = JSON.parse(savedUsersRaw);
        } catch (_) {}
      }

      if (registeredUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        setError("An account with this email already exists.");
        return;
      }

      const newUser: LeaderboardUser = {
        id: `user-${Date.now()}`,
        name: name,
        email: email,
        reportsCount: 0,
        points: 50, // Sign up welcome gift!
        level: 1,
        badges: [
          { id: "badge-first", label: "First Citizen", icon: "award", color: "bg-orange-100 text-orange-800 border-orange-200" }
        ],
        isCurrentUser: true
      };

      registeredUsers.push(newUser);
      localStorage.setItem("civic_pulse_registered_users", JSON.stringify(registeredUsers));

      onSignup(name, email);
      onLogin(newUser);
      setSuccess("Account registered! Welcome to CivicPulse (+50 Welcome XP).");
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl border border-orange-100 w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Accent */}
        <div className="h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-full transition-all focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mx-auto shadow-sm">
              {isLogin ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
            </div>
            <h2 className="text-xl font-black text-gray-950 tracking-tight">
              {isLogin ? "Sign In to CivicPulse" : "Join the Civic Crusade"}
            </h2>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              {isLogin 
                ? "Gain access to reporting points, citizen badges, and live level progression on our leaderboard."
                : "Earn +50 XP welcome bonus, track classified reports, and claim your First Citizen Badge."}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl text-xs font-bold animate-shake flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0"></span>
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 animate-bounce" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input - Only for Register */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">Full Name</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-gray-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Enter your citizen name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs border border-orange-100 rounded-xl text-gray-700 bg-orange-50/10 focus:outline-none focus:ring-1.5 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">Email Address</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-gray-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-orange-100 rounded-xl text-gray-700 bg-orange-50/10 focus:outline-none focus:ring-1.5 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">Password</label>
                {isLogin && (
                  <span className="text-[9px] font-bold text-orange-600 hover:underline cursor-pointer">Forgot?</span>
                )}
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-gray-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-orange-100 rounded-xl text-gray-700 bg-orange-50/10 focus:outline-none focus:ring-1.5 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg hover:shadow-orange-500/10 transform active:scale-98 transition-all flex items-center justify-center space-x-2"
            >
              <span>{isLogin ? "Access Citizen Portal" : "Join the Crusade (+50 XP)"}</span>
              <ShieldCheck className="w-4 h-4" />
            </button>
          </form>

          {/* Switch Link */}
          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-gray-500">
              {isLogin ? "New to CivicPulse?" : "Already registered?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setSuccess(null);
                }}
                className="font-extrabold text-orange-600 hover:text-orange-700 focus:outline-none hover:underline"
              >
                {isLogin ? "Create Citizen Account" : "Sign In to Profile"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
