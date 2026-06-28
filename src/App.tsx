import { useState, useEffect } from "react";
import { SAMPLE_ISSUES } from "./data";
import { CivicIssue, IssueStatus, AnalyzeResponse } from "./types";
import IssueReporter from "./components/IssueReporter";
import AIPlayground from "./components/AIPlayground";
import IssueFeed from "./components/IssueFeed";
import CityMap from "./components/CityMap";
import Leaderboard, { LeaderboardUser } from "./components/Leaderboard";
import AuthModal from "./components/AuthModal";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  Sparkles, 
  ClipboardList, 
  LayoutDashboard, 
  MapPin, 
  ShieldAlert, 
  CheckCircle, 
  RotateCcw,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  LogIn,
  LogOut,
  User,
  Zap,
  Award
} from "lucide-react";

const DEFAULT_LEADERBOARD_USERS: LeaderboardUser[] = [
  {
    id: "user-marcus",
    name: "Marcus Chen",
    email: "marcus@sf.gov",
    reportsCount: 15,
    points: 1250,
    level: 5,
    badges: [
      { id: "badge-sani", label: "Sanitation Hero", icon: "trash", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
      { id: "badge-veteran", label: "Gold Contributor", icon: "award", color: "bg-amber-100 text-amber-800 border-amber-200" }
    ]
  },
  {
    id: "user-alex",
    name: "Alex Rivera",
    email: "alex@sf.gov",
    reportsCount: 11,
    points: 920,
    level: 4,
    badges: [
      { id: "badge-light", label: "Lighting Ranger", icon: "light", color: "bg-yellow-100 text-yellow-800 border-yellow-200" }
    ]
  },
  {
    id: "user-sarah",
    name: "Sarah Jenkins",
    email: "sarah@sf.gov",
    reportsCount: 8,
    points: 680,
    level: 3,
    badges: [
      { id: "badge-pothole", label: "Pothole Patrol", icon: "car", color: "bg-blue-100 text-blue-800 border-blue-200" }
    ]
  },
  {
    id: "user-linda",
    name: "Linda Wu",
    email: "linda@sf.gov",
    reportsCount: 5,
    points: 420,
    level: 2,
    badges: [
      { id: "badge-pioneer", label: "Community Pioneer", icon: "users", color: "bg-purple-100 text-purple-800 border-purple-200" }
    ]
  }
];

export default function App() {
  // State for active view: main integrated dashboard or interactive AI generator playground
  const [activeTab, setActiveTab] = useState<"dashboard" | "playground">("dashboard");
  
  // Civic issues state loaded from localStorage or falling back to high-quality preloaded samples
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Authentication & Gamification State
  const [currentUser, setCurrentUser] = useState<LeaderboardUser | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<LeaderboardUser[]>([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Map interaction states
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [mapPlacedLocation, setMapPlacedLocation] = useState<string>("");
  const [mapPlacedX, setMapPlacedX] = useState<number | undefined>(undefined);
  const [mapPlacedY, setMapPlacedY] = useState<number | undefined>(undefined);
  const [mapPlacedLat, setMapPlacedLat] = useState<number | undefined>(undefined);
  const [mapPlacedLng, setMapPlacedLng] = useState<number | undefined>(undefined);

  // Load issues and user profiles on mount
  useEffect(() => {
    // 1. Load Issues
    const saved = localStorage.getItem("civic_pulse_issues");
    if (saved) {
      try {
        setIssues(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved issues:", e);
        setIssues(SAMPLE_ISSUES);
      }
    } else {
      setIssues(SAMPLE_ISSUES);
    }

    // 2. Load Registered Users
    const savedUsers = localStorage.getItem("civic_pulse_registered_users");
    let initialUsers = DEFAULT_LEADERBOARD_USERS;
    if (savedUsers) {
      try {
        initialUsers = JSON.parse(savedUsers);
      } catch (e) {
        console.error("Failed to load registered users:", e);
      }
    } else {
      localStorage.setItem("civic_pulse_registered_users", JSON.stringify(DEFAULT_LEADERBOARD_USERS));
    }
    setRegisteredUsers(initialUsers);

    // 3. Load Active Login Session
    const savedSession = localStorage.getItem("civic_pulse_session_user");
    if (savedSession) {
      try {
        setCurrentUser(JSON.parse(savedSession));
      } catch (e) {
        console.error("Failed to load user session:", e);
      }
    }
  }, []);

  // Save issues helper
  const saveIssues = (updatedList: CivicIssue[]) => {
    setIssues(updatedList);
    localStorage.setItem("civic_pulse_issues", JSON.stringify(updatedList));
  };

  // Reset to default sample issues
  const handleResetData = () => {
    saveIssues(SAMPLE_ISSUES);
    setSuccessMessage("Database reset to pre-seeded sample issues successfully.");
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Handle status update of reported issues
  const handleStatusChange = (id: string, newStatus: IssueStatus) => {
    const updated = issues.map((issue) => 
      issue.id === id ? { ...issue, status: newStatus } : issue
    );
    saveIssues(updated);
  };

  // Handle deleting reported issues
  const handleDeleteIssue = (id: string) => {
    const updated = issues.filter((issue) => issue.id !== id);
    saveIssues(updated);
    if (selectedIssueId === id) {
      setSelectedIssueId(null);
    }
  };

  // Map click handler to sync coordinates back to reporting form
  const handlePlacePinOnMap = (coords: { x: number; y: number; address: string; lat?: number; lng?: number }) => {
    setMapPlacedLocation(coords.address);
    setMapPlacedX(coords.x);
    setMapPlacedY(coords.y);
    setMapPlacedLat(coords.lat);
    setMapPlacedLng(coords.lng);
  };

  // Core integration: handle form submission, call server-side Gemini, and update state
  const handleNewIssueSubmit = async (formData: { description: string; location: string; image: string | null; mapX?: number; mapY?: number; lat?: number; lng?: number }) => {
    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/analyze-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: formData.description,
          location: formData.location,
          image: formData.image,
        }),
      });

      if (!response.ok) {
        throw new Error("Server analysis failed. Please try again.");
      }

      const aiData: AnalyzeResponse = await response.json();

      // Create new CivicIssue using AI classifications
      const newIssue: CivicIssue = {
        id: `issue-${Date.now()}`,
        description: formData.description,
        location: formData.location,
        imageUrl: formData.image || undefined,
        category: aiData.category,
        severity: aiData.severity,
        summary: aiData.summary,
        complaintLetter: aiData.complaintLetter,
        status: "Reported",
        createdAt: new Date().toISOString(),
        mapX: formData.mapX !== undefined ? formData.mapX : (mapPlacedX !== undefined ? mapPlacedX : 15 + Math.floor(Math.random() * 70)),
        mapY: formData.mapY !== undefined ? formData.mapY : (mapPlacedY !== undefined ? mapPlacedY : 15 + Math.floor(Math.random() * 70)),
        lat: formData.lat !== undefined ? formData.lat : (mapPlacedLat !== undefined ? mapPlacedLat : 37.7749 + (Math.random() - 0.5) * 0.02),
        lng: formData.lng !== undefined ? formData.lng : (mapPlacedLng !== undefined ? mapPlacedLng : -122.4194 + (Math.random() - 0.5) * 0.02),
        reporterId: currentUser?.id || undefined,
        reporterName: currentUser?.name || "Concerned Citizen",
      };

      const updatedIssues = [newIssue, ...issues];
      saveIssues(updatedIssues);

      // Award gamification rewards to logged-in user!
      if (currentUser) {
        let earnedPoints = 50;
        if (formData.image) earnedPoints += 25; // photo bonus

        const nextPoints = currentUser.points + earnedPoints;
        const nextReportsCount = currentUser.reportsCount + 1;
        
        let calculatedLevel = currentUser.level;
        const scoreToNextLevel = calculatedLevel * 200;
        if (nextPoints >= scoreToNextLevel) {
          calculatedLevel += 1;
        }

        const currentBadgeIds = currentUser.badges.map((b) => b.id);
        const nextBadges = [...currentUser.badges];

        // 1. Pothole Patrol
        if (aiData.category.toLowerCase().includes("pothole") && !currentBadgeIds.includes("badge-pothole")) {
          nextBadges.push({ id: "badge-pothole", label: "Pothole Patrol", icon: "car", color: "bg-blue-100 text-blue-800 border-blue-200" });
        }
        // 2. Lighting Ranger
        if (aiData.category.toLowerCase().includes("light") && !currentBadgeIds.includes("badge-light")) {
          nextBadges.push({ id: "badge-light", label: "Lighting Ranger", icon: "light", color: "bg-yellow-100 text-yellow-800 border-yellow-200" });
        }
        // 3. Sanitation Hero
        if (aiData.category.toLowerCase().includes("garbage") && !currentBadgeIds.includes("badge-sani")) {
          nextBadges.push({ id: "badge-sani", label: "Sanitation Hero", icon: "trash", color: "bg-emerald-100 text-emerald-800 border-emerald-200" });
        }
        // 4. Citizen Lensman
        if (formData.image && !currentBadgeIds.includes("badge-lensman")) {
          nextBadges.push({ id: "badge-lensman", label: "Citizen Lensman", icon: "camera", color: "bg-pink-100 text-pink-800 border-pink-200" });
        }
        // 5. Elite reporter
        if (nextReportsCount >= 5 && !currentBadgeIds.includes("badge-elite")) {
          nextBadges.push({ id: "badge-elite", label: "Community Pioneer", icon: "award", color: "bg-purple-100 text-purple-800 border-purple-200" });
        }

        const updatedUser: LeaderboardUser = {
          ...currentUser,
          points: nextPoints,
          reportsCount: nextReportsCount,
          level: calculatedLevel,
          badges: nextBadges,
        };

        setCurrentUser(updatedUser);
        localStorage.setItem("civic_pulse_session_user", JSON.stringify(updatedUser));

        const updatedRegList = registeredUsers.map((u) => (u.id === currentUser.id ? updatedUser : u));
        setRegisteredUsers(updatedRegList);
        localStorage.setItem("civic_pulse_registered_users", JSON.stringify(updatedRegList));

        if (calculatedLevel > currentUser.level) {
          setSuccessMessage(`Successfully classified! LEVEL UP! You are now Level ${calculatedLevel}! 🌟 (+${earnedPoints} XP awarded)`);
        } else {
          setSuccessMessage(`Successfully classified! +${earnedPoints} XP awarded! You have ${nextPoints} total points.`);
        }
      } else {
        setSuccessMessage(`Successfully classified as "${aiData.category}" with ${aiData.severity} severity! Draft complaint generated.`);
      }
      
      // Reset placement states
      setMapPlacedLocation("");
      setMapPlacedX(undefined);
      setMapPlacedY(undefined);
      setMapPlacedLat(undefined);
      setMapPlacedLng(undefined);

      // Auto-dismiss notification after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);

    } catch (error: any) {
      console.error("Submission failed:", error);
      alert(error.message || "Failed to process civic issue. Check connection/API key.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = (user: LeaderboardUser) => {
    setCurrentUser(user);
    localStorage.setItem("civic_pulse_session_user", JSON.stringify(user));
    
    // Add/Update in registered users list if not already there
    const updatedRegList = registeredUsers.some(u => u.id === user.id)
      ? registeredUsers.map(u => u.id === user.id ? user : u)
      : [...registeredUsers, user];
      
    setRegisteredUsers(updatedRegList);
    localStorage.setItem("civic_pulse_registered_users", JSON.stringify(updatedRegList));
  };

  const handleSignup = (name: string, email: string) => {
    // Already registered in AuthModal, we just need to refresh our registered list
    const savedUsers = localStorage.getItem("civic_pulse_registered_users");
    if (savedUsers) {
      try {
        setRegisteredUsers(JSON.parse(savedUsers));
      } catch (_) {}
    }
  };

  // Metrics helper
  const stats = {
    total: issues.length,
    reported: issues.filter((i) => i.status === "Reported").length,
    inProgress: issues.filter((i) => i.status === "In Progress").length,
    resolved: issues.filter((i) => i.status === "Resolved").length,
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-gray-800 selection:bg-orange-500 selection:text-white">
      {/* 🚀 PRIMARY APP BANNER & LOGO */}
      <header className="bg-white border-b border-orange-100 shadow-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 bg-orange-600 rounded-2xl flex items-center justify-center shadow-md shadow-orange-500/20 transform hover:rotate-6 transition-all duration-300">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="text-2xl font-black text-gray-950 tracking-tight leading-none">CivicPulse</h1>
                <span className="bg-orange-100 text-orange-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Citizen AI</span>
              </div>
              <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Municipal Grievance & AI Resolution Engine</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleResetData}
              className="text-xs font-semibold text-gray-500 hover:text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-xl border border-gray-100 hover:border-orange-200 transition-all flex items-center space-x-1"
              title="Reset data to initial presets"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset Seed Data</span>
            </button>

            <span className="w-px h-6 bg-gray-200 hidden sm:block"></span>

            {currentUser ? (
              <div className="flex items-center space-x-2.5 bg-orange-50/40 border border-orange-100 p-1.5 pr-3 rounded-2xl animate-fade-in">
                {/* Avatar with level badge overlay */}
                <div className="relative">
                  <div className="w-8 h-8 rounded-xl bg-orange-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 border border-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center scale-90 shadow-sm">
                    {currentUser.level}
                  </span>
                </div>
                
                {/* Stats and name */}
                <div className="hidden sm:block text-left">
                  <div className="text-[11px] font-black text-gray-900 leading-none">{currentUser.name}</div>
                  <div className="flex items-center space-x-0.5 mt-0.5">
                    <Zap className="w-3 h-3 text-orange-500 fill-orange-500" />
                    <span className="text-[9px] font-bold text-orange-700">{currentUser.points} XP</span>
                  </div>
                </div>

                {/* Logout Action */}
                <button
                  onClick={() => {
                    setCurrentUser(null);
                    localStorage.removeItem("civic_pulse_session_user");
                    setSuccessMessage("Logged out successfully.");
                    setTimeout(() => setSuccessMessage(null), 3000);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all ml-1"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="text-xs font-extrabold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-3.5 py-2 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Join Portal</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 🌍 CONTENT HUB */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Unified Tab Navigation Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-gray-200 pb-4 mb-6 gap-3">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-black transition-all ${
                activeTab === "dashboard"
                  ? "bg-white text-gray-950 shadow-xs"
                  : "text-gray-500 hover:text-gray-950"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-orange-500" />
              <span>🗺️ Live Citizen Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab("playground")}
              className={`flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-black transition-all ${
                activeTab === "playground"
                  ? "bg-white text-gray-950 shadow-xs"
                  : "text-gray-500 hover:text-gray-950"
              }`}
            >
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>🤖 Interactive AI Sandbox</span>
            </button>
          </div>

          <div className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-xl flex items-center justify-center gap-1.5 self-start sm:self-auto shadow-2xs">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping shrink-0"></span>
            <span>Real-time Sync Active</span>
          </div>
        </div>

        {/* Dynamic View Injection */}
        <AnimatePresence mode="wait">
          {activeTab === "playground" && (
            <motion.div
              key="playground"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <div className="text-center max-w-xl mx-auto mb-6">
                <span className="text-[9px] font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full uppercase tracking-wider">AI Document Generator</span>
                <h3 className="text-xl font-black text-gray-950 tracking-tight mt-1">Gemini AI Engine Sandbox</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Write freeform text about any civic problem or load pre-compiled test scenarios. Witness real-time priority evaluation, localized tag extraction, and instant legal document preparation.
                </p>
              </div>
              <AIPlayground />
            </motion.div>
          )}

          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* 📊 BENTO STATS CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-orange-100 shadow-xs flex items-center space-x-3.5">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider">Total Reports</span>
                    <span className="text-xl font-black text-gray-900">{stats.total}</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-orange-100 shadow-xs flex items-center space-x-3.5">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider">New Reported</span>
                    <span className="text-xl font-black text-gray-900">{stats.reported}</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-orange-100 shadow-xs flex items-center space-x-3.5">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                    <RotateCcw className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider">In Progress</span>
                    <span className="text-xl font-black text-gray-900">{stats.inProgress}</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-orange-100 shadow-xs flex items-center space-x-3.5">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider">Resolved</span>
                    <span className="text-xl font-black text-gray-900">{stats.resolved}</span>
                  </div>
                </div>
              </div>

              {/* SUCCESS POPUP FEEDBACK */}
              <AnimatePresence>
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl flex items-start space-x-3 text-xs shadow-sm"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <strong className="font-bold">Issue Classified and Added!</strong>
                      <p className="mt-0.5 text-emerald-800">{successMessage}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* DUAL COL GRID: Form + Live Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Submit Form Block */}
                <div className="lg:col-span-5 space-y-5">
                  {/* Auth promo banner if not logged in */}
                  {!currentUser && (
                    <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-md space-y-3 relative overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-300">
                      <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/8 text-white/10 pointer-events-none font-black text-7xl select-none">
                        XP
                      </div>
                      <h4 className="text-sm font-black uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-5 h-5 text-amber-200 animate-pulse" />
                        Join Civic Leaderboard
                      </h4>
                      <p className="text-[11px] text-orange-50 leading-relaxed font-semibold">
                        Log in or register your citizen credentials to earn points, unlock levels, and earn badges like <strong className="text-white underline">Pothole Patrol</strong> or <strong className="text-white underline">Sanitation Hero</strong>!
                      </p>
                      <button
                        onClick={() => setIsAuthOpen(true)}
                        className="bg-white hover:bg-orange-50 active:bg-orange-100 text-orange-700 font-extrabold text-[11px] px-4 py-2 rounded-xl shadow-sm transition-all transform active:scale-98"
                      >
                        Claim My Welcome +50 XP
                      </button>
                    </div>
                  )}

                  <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100/50">
                    <h3 className="text-sm font-black text-orange-950 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles className="w-4.5 h-4.5 text-orange-600 animate-pulse" />
                      1. Lodge New Civic Report
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Fill out the details below, or click any grid coordinate on the city map to select location. Our server-side Gemini 3.5 Flash model will instantaneously classify the problem, gauge hazard levels, and build a formal document.
                    </p>
                  </div>
                  
                  <IssueReporter 
                    onSubmit={handleNewIssueSubmit} 
                    isSubmitting={isSubmitting}
                    prefilledLocation={mapPlacedLocation}
                    prefilledX={mapPlacedX}
                    prefilledY={mapPlacedY}
                    prefilledLat={mapPlacedLat}
                    prefilledLng={mapPlacedLng}
                  />

                  {/* Citizen Gamified Leaderboard */}
                  <Leaderboard users={registeredUsers} />
                </div>

                {/* Card Feed block */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Live Dynamic City Map Preview */}
                  <CityMap 
                    issues={issues}
                    onSelectIssue={(id) => setSelectedIssueId(id)}
                    selectedIssueId={selectedIssueId}
                    onPlacePin={handlePlacePinOnMap}
                    isInteractiveReporting={true}
                  />

                  <div className="bg-slate-100/60 rounded-2xl p-5 border border-slate-200/40">
                    <h3 className="text-sm font-black text-gray-800 flex items-center gap-1.5 uppercase tracking-wider">
                      <FileSpreadsheet className="w-4.5 h-4.5 text-orange-600" />
                      2. Public Civic Registry Feed
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Direct tracking of classified grievances. Open any ticket below to read or copy the formal letter drafted automatically by CivicPulse.
                    </p>
                  </div>
                  <IssueFeed 
                    issues={issues} 
                    onStatusChange={handleStatusChange} 
                    onDeleteIssue={handleDeleteIssue}
                    selectedIssueId={selectedIssueId}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-orange-50 py-8 text-center mt-12">
        <p className="text-xs text-gray-400">CivicPulse • AI Citizen Engagement Portal</p>
        <p className="text-[10px] text-gray-400 mt-1">Built using React 19, Tailwind CSS, Express, and Gemini 3.5 Flash.</p>
      </footer>

      {/* AUTH MODAL DIALOG */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />
    </div>
  );
}
