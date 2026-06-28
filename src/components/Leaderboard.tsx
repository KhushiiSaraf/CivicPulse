import React from "react";
import { Trophy, Award, Zap, Star, Shield, Flame, Target, ArrowUpRight } from "lucide-react";

export interface LeaderboardUser {
  id: string;
  name: string;
  email: string;
  reportsCount: number;
  points: number;
  badges: { id: string; label: string; icon: string; color: string }[];
  level: number;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  users: LeaderboardUser[];
  onSelectUser?: (userId: string) => void;
}

export default function Leaderboard({ users, onSelectUser }: LeaderboardProps) {
  // Sort users by points descending
  const sortedUsers = [...users].sort((a, b) => b.points - a.points);

  // High-performance custom avatar colors based on username hash
  const getAvatarGradient = (name: string) => {
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
      "from-orange-500 to-amber-500",
      "from-blue-600 to-indigo-500",
      "from-emerald-500 to-teal-500",
      "from-pink-500 to-rose-500",
      "from-violet-600 to-purple-500",
    ];
    return gradients[hash % gradients.length];
  };

  return (
    <div className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm space-y-5" id="civic-leaderboard">
      {/* Leaderboard Header */}
      <div className="flex items-center justify-between border-b border-orange-50 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
            <Trophy className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-1.5 uppercase">
              Citizen Leaderboard
            </h3>
            <p className="text-[11px] text-gray-500 font-medium">
              Top contributors formatting local reports and restoring city safety.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-black text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-orange-500" /> Active Season
        </span>
      </div>

      {/* Top 3 Podiums */}
      {sortedUsers.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 pt-2">
          {/* Rank 2 */}
          <div className="flex flex-col items-center justify-end text-center p-3 bg-slate-50/50 rounded-xl border border-slate-100 relative order-1">
            <div className="absolute top-1 right-1 text-[9px] font-black text-slate-400 bg-white px-1.5 py-0.5 rounded shadow-2xs">#2</div>
            <div className={`w-11 h-11 rounded-full bg-gradient-to-tr ${getAvatarGradient(sortedUsers[1].name)} flex items-center justify-center text-white text-sm font-black shadow-md border-2 border-white relative`}>
              {sortedUsers[1].name.charAt(0).toUpperCase()}
              {sortedUsers[1].isCurrentUser && (
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
              )}
            </div>
            <h4 className="text-[11px] font-bold text-gray-800 mt-2 truncate max-w-full">
              {sortedUsers[1].name}
            </h4>
            <div className="flex items-center space-x-0.5 text-orange-600 text-[10px] font-black mt-1">
              <Zap className="w-3 h-3 fill-orange-500 text-orange-500" />
              <span>{sortedUsers[1].points} pts</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 mt-0.5">{sortedUsers[1].reportsCount} reports</span>
          </div>

          {/* Rank 1 (Center) */}
          <div className="flex flex-col items-center justify-end text-center p-4 bg-orange-50/60 rounded-2xl border-2 border-orange-200/50 relative order-2 transform -translate-y-1.5 shadow-md">
            <div className="absolute -top-3.5 bg-amber-400 text-white p-1 rounded-full shadow border-2 border-white">
              <Star className="w-3.5 h-3.5 fill-white text-white" />
            </div>
            <div className="absolute top-1 right-1 text-[9px] font-black text-orange-600 bg-white px-1.5 py-0.5 rounded shadow-2xs">#1</div>
            <div className={`w-13 h-13 rounded-full bg-gradient-to-tr ${getAvatarGradient(sortedUsers[0].name)} flex items-center justify-center text-white text-lg font-black shadow-md border-2 border-orange-300 relative`}>
              {sortedUsers[0].name.charAt(0).toUpperCase()}
              {sortedUsers[0].isCurrentUser && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
              )}
            </div>
            <h4 className="text-xs font-black text-orange-950 mt-2.5 truncate max-w-full">
              {sortedUsers[0].name}
            </h4>
            <div className="flex items-center space-x-0.5 text-orange-600 text-xs font-black mt-1">
              <Zap className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              <span>{sortedUsers[0].points} pts</span>
            </div>
            <span className="text-[10px] font-bold text-orange-800 mt-0.5">{sortedUsers[0].reportsCount} reports</span>
          </div>

          {/* Rank 3 */}
          <div className="flex flex-col items-center justify-end text-center p-3 bg-slate-50/50 rounded-xl border border-slate-100 relative order-3">
            <div className="absolute top-1 right-1 text-[9px] font-black text-amber-700 bg-white px-1.5 py-0.5 rounded shadow-2xs">#3</div>
            <div className={`w-11 h-11 rounded-full bg-gradient-to-tr ${getAvatarGradient(sortedUsers[2].name)} flex items-center justify-center text-white text-sm font-black shadow-md border-2 border-white relative`}>
              {sortedUsers[2].name.charAt(0).toUpperCase()}
              {sortedUsers[2].isCurrentUser && (
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
              )}
            </div>
            <h4 className="text-[11px] font-bold text-gray-800 mt-2 truncate max-w-full">
              {sortedUsers[2].name}
            </h4>
            <div className="flex items-center space-x-0.5 text-orange-600 text-[10px] font-black mt-1">
              <Zap className="w-3 h-3 fill-orange-500 text-orange-500" />
              <span>{sortedUsers[2].points} pts</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 mt-0.5">{sortedUsers[2].reportsCount} reports</span>
          </div>
        </div>
      )}

      {/* Leaderboard Table / Scroll Area */}
      <div className="space-y-2 max-h-76 overflow-y-auto pr-1">
        {sortedUsers.map((user, idx) => {
          const isCurrentUser = user.isCurrentUser;
          const userRank = idx + 1;
          const scoreToNextLevel = user.level * 200;
          const levelProgress = Math.min(100, (user.points % scoreToNextLevel) / scoreToNextLevel * 100);

          return (
            <div
              key={user.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                isCurrentUser
                  ? "bg-orange-50/50 border-orange-200 shadow-2xs"
                  : "bg-white border-slate-100 hover:border-orange-100 hover:shadow-2xs"
              }`}
            >
              {/* Left Side: Avatar & Rank */}
              <div className="flex items-center space-x-3">
                <span className={`w-5 text-[11px] font-black text-center ${
                  userRank === 1 ? "text-amber-500" : userRank === 2 ? "text-slate-400" : userRank === 3 ? "text-amber-700" : "text-gray-400"
                }`}>
                  {userRank}
                </span>

                <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${getAvatarGradient(user.name)} flex items-center justify-center text-white text-xs font-black relative shrink-0`}>
                  {user.name.charAt(0).toUpperCase()}
                  {isCurrentUser && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" title="You"></span>
                  )}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-xs font-bold leading-none ${isCurrentUser ? "text-orange-950" : "text-gray-800"}`}>
                      {user.name}
                    </span>
                    {isCurrentUser && (
                      <span className="text-[8px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded-md">
                        You
                      </span>
                    )}
                  </div>

                  {/* Level & Badge preview */}
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-bold text-gray-400 flex items-center bg-gray-50 px-1.5 py-0.2 rounded">
                      Lv {user.level}
                    </span>
                    <div className="flex items-center space-x-1">
                      {user.badges.slice(0, 2).map((badge) => (
                        <span
                          key={badge.id}
                          className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded-sm border ${badge.color}`}
                          title={badge.label}
                        >
                          {badge.label}
                        </span>
                      ))}
                      {user.badges.length > 2 && (
                        <span className="text-[8px] font-bold text-gray-400">+{user.badges.length - 2}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Score Progress & Score */}
              <div className="text-right flex flex-col items-end space-y-1">
                <div className="flex items-center space-x-1">
                  <Zap className="w-3.5 h-3.5 text-orange-500 fill-orange-500 shrink-0" />
                  <span className="text-xs font-black text-gray-900">{user.points}</span>
                  <span className="text-[10px] text-gray-400 font-medium">pts</span>
                </div>
                <span className="text-[9px] font-bold text-slate-400 leading-none">
                  {user.reportsCount} Reports
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Badge Quest Tracker */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-3 border border-orange-100/50 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[11px] font-black text-orange-950 uppercase tracking-wide">Weekly Civic Quest</h4>
            <p className="text-[10px] text-orange-800 font-medium">Report 3 street-level hazards to unlock the "City Ranger" Badge.</p>
          </div>
        </div>
        <ArrowUpRight className="w-4 h-4 text-orange-700 shrink-0 hover:translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer" />
      </div>
    </div>
  );
}
