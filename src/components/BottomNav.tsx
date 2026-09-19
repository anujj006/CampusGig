"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Home, Plus, MessageSquare, User, Compass } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Hide bottom nav on full screen chat thread
  if (pathname.startsWith("/chat/") && pathname !== "/chat") {
    return null;
  }

  const navItems = [
    { label: "Feed", href: "/", icon: Home },
    { label: "Explore", href: "/#browse", icon: Compass },
    {
      label: "Post",
      href: "/gigs/new",
      icon: Plus,
      isCenterAction: true,
    },
    { label: "Chat", href: "/chat", icon: MessageSquare },
    { label: "Profile", href: user ? "/profile" : "/login", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-brand-border px-3 py-1.5 shadow-bottombar">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isCenterAction) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="relative -top-3 flex items-center justify-center w-12 h-12 rounded-full bg-brand-violet text-white shadow-glow hover:scale-105 active:scale-95 transition-all"
                aria-label="Post Gig"
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[11px] font-semibold transition-colors ${
                isActive
                  ? "text-brand-violet"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
