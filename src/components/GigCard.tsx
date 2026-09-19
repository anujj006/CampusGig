"use client";

import React from "react";
import Link from "next/link";
import { Gig } from "@/lib/supabase/types";
import { formatRupees, formatRelativeTime, getInitials, getAvatarColor, CATEGORY_DETAILS } from "@/lib/utils";
import { Clock, ShieldCheck, ArrowRight, MessageSquare, MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface GigCardProps {
  gig: Gig;
  onAccept?: (gigId: string) => void;
  isAccepting?: boolean;
}

export function GigCard({ gig, onAccept, isAccepting }: GigCardProps) {
  const { user } = useAuth();
  const categoryInfo = CATEGORY_DETAILS[gig.category] || CATEGORY_DETAILS.other;

  const isPoster = user?.id === gig.poster_id;
  const isWorker = user?.id === gig.worker_id;
  const isOpen = gig.status === "open";
  const isLocked = gig.status === "locked";
  const isParty = isPoster || isWorker;

  return (
    <div className="bg-white rounded-tactile border border-brand-border p-4 sm:p-5 shadow-tactile hover:shadow-card transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Card Header: Poster info + Category badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm ${getAvatarColor(
                gig.poster?.name || "Student"
              )}`}
            >
              {getInitials(gig.poster?.name || "Student")}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-brand-slate">
                  {gig.poster?.name || "Campus Peer"}
                </span>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  .ac.in
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-[170px] sm:max-w-[220px]">
                {gig.poster?.college || "University Campus"}
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${categoryInfo.bg} ${categoryInfo.text} ${categoryInfo.border} whitespace-nowrap`}
          >
            {categoryInfo.label}
          </span>
        </div>

        {/* Gig Title & Description */}
        <Link href={`/gigs/${gig.id}`} className="block group-hover:text-brand-violet transition-colors">
          <h3 className="font-bold text-base text-brand-slate leading-snug mb-1.5 line-clamp-1">
            {gig.title}
          </h3>
        </Link>
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
          {gig.description}
        </p>

        {/* Metadata: Location/Hostel & Deadline */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mb-4">
          <div className="flex items-center gap-1 text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Campus Library / Hostel</span>
          </div>
          <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{formatRelativeTime(gig.deadline)}</span>
          </div>
        </div>
      </div>

      {/* Card Footer: Rupee Bounty + Action Button */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
            Offered Bounty
          </span>
          <span className="text-lg font-black text-brand-slate tracking-tight">
            {formatRupees(gig.amount)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* If open and user is not poster, allow direct accept */}
          {isOpen && !isPoster && onAccept && (
            <button
              onClick={() => onAccept(gig.id)}
              disabled={isAccepting}
              className="px-3.5 py-1.5 rounded-xl bg-brand-violet hover:bg-brand-violet-dark disabled:opacity-60 text-white text-xs font-bold shadow-sm hover:shadow active:scale-95 transition-all flex items-center gap-1.5"
            >
              {isAccepting ? "Locking..." : "Take Gig"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* If locked and user is part of the gig, jump straight to conversation */}
          {isLocked && isParty && (
            <Link
              href={`/chat/${gig.id}`}
              className="px-3 py-1.5 rounded-xl bg-violet-50 text-brand-violet hover:bg-violet-100 text-xs font-bold transition-all flex items-center gap-1 border border-violet-200"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Open Chat
            </Link>
          )}

          {/* View Details button */}
          <Link
            href={`/gigs/${gig.id}`}
            className="px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
