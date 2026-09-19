"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getInitials, getAvatarColor } from "@/lib/utils";
import {
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Plus,
  LogOut,
  User as UserIcon,
  Briefcase,
  GraduationCap,
  ChevronDown,
} from "lucide-react";

export function Navbar() {
  const { user, profile, activeRole, setActiveRole, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-border px-4 py-2.5 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Campus Badge */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-brand-violet flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-brand-slate flex items-center gap-1">
                Campus<span className="text-brand-violet">Gig</span>
              </span>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-brand-emerald">
                <ShieldCheck className="w-3 h-3 text-brand-emerald" />
                <span>Verified .ac.in</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Center / Role Switcher */}
        {user && (
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
            <button
              onClick={() => setActiveRole("student")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeRole === "student"
                  ? "bg-white text-brand-violet shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Student (Poster)
            </button>
            <button
              onClick={() => setActiveRole("worker")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeRole === "worker"
                  ? "bg-brand-emerald text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Worker (Earner)
            </button>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {/* Post Gig CTA (visible always or in Student mode) */}
              <Link
                href="/gigs/new"
                className="hidden md:inline-flex items-center gap-1.5 bg-brand-violet hover:bg-brand-violet-dark text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all"
              >
                <Plus className="w-4 h-4" />
                Post a Gig
              </Link>

              {/* Chat Gateway Link */}
              <Link
                href="/chat"
                className="relative p-2 rounded-xl text-slate-600 hover:text-brand-violet hover:bg-slate-100 transition-colors"
                title="Conversations"
              >
                <MessageSquare className="w-5 h-5" />
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-all"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${getAvatarColor(
                      profile?.name || user.email
                    )}`}
                  >
                    {getInitials(profile?.name || user.email)}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-float border border-slate-200 py-2 z-40 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {profile?.name || "Campus Student"}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {user.email}
                        </p>
                        <p className="text-[10px] font-semibold text-brand-violet mt-0.5">
                          {profile?.college || "College Campus Member"}
                        </p>
                      </div>

                      {/* Mobile Role Switcher inside menu */}
                      <div className="sm:hidden px-3 py-2 border-b border-slate-100">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                          Current Mode
                        </p>
                        <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
                          <button
                            onClick={() => {
                              setActiveRole("student");
                              setDropdownOpen(false);
                            }}
                            className={`px-2 py-1 text-[11px] font-bold rounded-lg ${
                              activeRole === "student"
                                ? "bg-white text-brand-violet shadow-sm"
                                : "text-slate-600"
                            }`}
                          >
                            Student
                          </button>
                          <button
                            onClick={() => {
                              setActiveRole("worker");
                              setDropdownOpen(false);
                            }}
                            className={`px-2 py-1 text-[11px] font-bold rounded-lg ${
                              activeRole === "worker"
                                ? "bg-brand-emerald text-white shadow-sm"
                                : "text-slate-600"
                            }`}
                          >
                            Worker
                          </button>
                        </div>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        My Profile & History
                      </Link>

                      <Link
                        href="/chat"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 text-slate-400" />
                        Active Convos
                      </Link>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          signOut();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100 mt-1"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-bold text-slate-700 hover:text-brand-violet px-3 py-1.5 rounded-xl transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="bg-brand-violet hover:bg-brand-violet-dark text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
