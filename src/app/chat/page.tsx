"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { Gig } from "@/lib/supabase/types";
import {
  formatRupees,
  formatRelativeTime,
  getInitials,
  getAvatarColor,
} from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import {
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Inbox,
} from "lucide-react";

export default function ChatListPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchConversations = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("gigs")
          .select("*, poster:profiles!gigs_poster_id_fkey(*), worker:profiles!gigs_worker_id_fkey(*)")
          .or(`poster_id.eq.${user.id},worker_id.eq.${user.id}`)
          .in("status", ["locked", "submitted", "completed"])
          .order("accepted_at", { ascending: false });

        if (error) throw error;
        setGigs((data as Gig[]) || []);
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-tactile border border-brand-border text-center max-w-sm shadow-card">
          <MessageSquare className="w-10 h-10 text-brand-violet mx-auto mb-3" />
          <h2 className="text-lg font-bold text-brand-slate mb-2">Sign in to View Conversations</h2>
          <p className="text-xs text-slate-500 mb-5">
            Your conversations unlock once a gig is accepted.
          </p>
          <Link
            href="/login"
            className="w-full inline-block py-2.5 px-4 rounded-xl bg-brand-violet text-white text-xs font-bold shadow-sm"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-brand-slate tracking-tight">
            Conversations & Active Gigs
          </h1>
          <p className="text-xs text-slate-500">
            Realtime gateway between you and your campus collaborators
          </p>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-7 h-7 border-3 border-brand-violet border-t-transparent rounded-full animate-spin" />
        </div>
      ) : gigs.length === 0 ? (
        <div className="bg-white rounded-tactile border border-brand-border p-8 text-center shadow-tactile">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800 mb-1">
            No active conversations yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
            When you accept an open gig or someone accepts a gig you posted, it automatically locks and opens your dedicated conversation gateway.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-brand-violet text-white text-xs font-bold shadow-sm"
            >
              Browse Open Gigs
            </Link>
            <Link
              href="/gigs/new"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Post a Gig
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {gigs.map((gig) => {
            const isPoster = user.id === gig.poster_id;
            const counterpart = isPoster ? gig.worker : gig.poster;
            const roleLabel = isPoster ? "Worker" : "Poster";

            return (
              <Link
                key={gig.id}
                href={`/chat/${gig.id}`}
                className="block bg-white rounded-tactile border border-brand-border p-4 shadow-tactile hover:shadow-card hover:border-violet-200 transition-all group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm ${getAvatarColor(
                        counterpart?.name
                      )}`}
                    >
                      {getInitials(counterpart?.name)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-brand-slate group-hover:text-brand-violet transition-colors">
                          {counterpart?.name || "Campus Peer"}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          ({roleLabel})
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          .ac.in
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 line-clamp-1 mt-0.5">
                        {gig.title}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Bounty: <strong className="text-brand-slate">{formatRupees(gig.amount)}</strong> • {formatRelativeTime(gig.deadline)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <StatusBadge status={gig.status} />
                    <span className="text-xs text-brand-violet font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Open Chat
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
