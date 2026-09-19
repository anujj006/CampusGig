"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { Gig } from "@/lib/supabase/types";
import {
  formatRupees,
  formatRelativeTime,
  getInitials,
  getAvatarColor,
  CATEGORY_DETAILS,
} from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import {
  ArrowLeft,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  Star,
  User,
} from "lucide-react";

export default function GigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const gigId = resolvedParams.id;
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [gig, setGig] = useState<Gig | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGig = async () => {
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from("gigs")
          .select("*, poster:profiles!gigs_poster_id_fkey(*), worker:profiles!gigs_worker_id_fkey(*)")
          .eq("id", gigId)
          .single();

        if (fetchError) throw fetchError;
        setGig(data as Gig);
      } catch (err: any) {
        console.error("Failed to load gig:", err);
        setError(err.message || "Gig not found or access denied.");
      } finally {
        setLoading(false);
      }
    };

    fetchGig();
  }, [gigId, supabase]);

  const handleAcceptGig = async () => {
    if (!user) {
      router.push(`/login?redirect=/gigs/${gigId}`);
      return;
    }

    setAccepting(true);
    setError(null);

    try {
      // Call Supabase RPC accept_gig
      const { error: rpcError } = await supabase.rpc("accept_gig", {
        p_gig_id: gigId,
      });

      if (rpcError) throw rpcError;

      // Acceptance automatically locks the gig and opens conversation gateway!
      router.push(`/chat/${gigId}`);
    } catch (err: any) {
      console.error("Accept error:", err);
      setError(
        err.message?.includes("GIG_UNAVAILABLE")
          ? "Sorry, this gig has already been accepted by another campus peer or has expired."
          : err.message || "Failed to accept gig"
      );
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-violet border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading gig details...</p>
        </div>
      </div>
    );
  }

  if (error || !gig) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800 mb-1">Unable to view Gig</h2>
        <p className="text-xs text-slate-500 mb-6">{error || "This gig may have been removed."}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-violet text-white text-xs font-bold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Feed
        </Link>
      </div>
    );
  }

  const categoryInfo = CATEGORY_DETAILS[gig.category] || CATEGORY_DETAILS.other;
  const isPoster = user?.id === gig.poster_id;
  const isWorker = user?.id === gig.worker_id;
  const isParty = isPoster || isWorker;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>

        <StatusBadge status={gig.status} />
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Gig Card */}
      <div className="bg-white rounded-tactile border border-brand-border p-5 sm:p-7 shadow-tactile mb-6">
        {/* Category & Date */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${categoryInfo.bg} ${categoryInfo.text} ${categoryInfo.border}`}
          >
            {categoryInfo.label}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            Posted {new Date(gig.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-black text-brand-slate leading-tight mb-3">
          {gig.title}
        </h1>

        {/* Bounty & Deadline Highlight Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 mb-5">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Offered Bounty
            </span>
            <span className="text-xl sm:text-2xl font-black text-brand-violet">
              {formatRupees(gig.amount)}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Deadline
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-800 mt-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{formatRelativeTime(gig.deadline)}</span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Campus Location
            </span>
            <div className="flex items-center gap-1 text-xs font-medium text-slate-700 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Hostel / Campus Library</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Description & Scope
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {gig.description}
          </p>
        </div>

        {/* CTA Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* If open and user is not the poster: "Accept Gig" */}
          {gig.status === "open" && !isPoster && (
            <div className="w-full flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Ready to take this up?
                </p>
                <p className="text-[11px] text-slate-500">
                  Accepting locks this gig and opens your live chat thread.
                </p>
              </div>
              <button
                onClick={handleAcceptGig}
                disabled={accepting}
                className="py-3 px-6 bg-brand-violet hover:bg-brand-violet-dark text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-glow active:scale-95 transition-all flex items-center gap-2 disabled:opacity-60"
              >
                {accepting ? (
                  "Locking Gig..."
                ) : (
                  <>
                    Accept Gig & Open Convo
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* If locked and user is part of the gig: Jump straight to chat gateway */}
          {gig.status !== "open" && isParty && (
            <div className="w-full flex items-center justify-between gap-3 bg-violet-50/70 p-3 rounded-2xl border border-violet-100">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-5 h-5 text-brand-violet" />
                <div>
                  <p className="text-xs font-bold text-brand-violet">
                    Conversation Gateway Active
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Discuss deliverables, submit work, or share files.
                  </p>
                </div>
              </div>
              <Link
                href={`/chat/${gig.id}`}
                className="py-2.5 px-4 bg-brand-violet hover:bg-brand-violet-dark text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all shrink-0"
              >
                Go to Chat
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* If poster and open: Status note */}
          {gig.status === "open" && isPoster && (
            <div className="w-full text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
              <span>This is your posted gig. Waiting for a campus worker to accept it.</span>
              <span className="font-bold text-brand-violet">Active in Feed</span>
            </div>
          )}
        </div>
      </div>

      {/* Parties Involved Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Requester Profile */}
        <div className="bg-white rounded-tactile border border-brand-border p-4 shadow-tactile">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
            Posted By
          </span>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(
                gig.poster?.name
              )}`}
            >
              {getInitials(gig.poster?.name)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-brand-slate">
                  {gig.poster?.name || "Student"}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  .ac.in
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {gig.poster?.college || "Campus Member"}
              </p>
              {gig.poster?.rating_as_poster && (
                <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold mt-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{gig.poster.rating_as_poster.toFixed(1)} rating</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Assigned Worker Profile */}
        <div className="bg-white rounded-tactile border border-brand-border p-4 shadow-tactile">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
            Assigned Worker
          </span>
          {gig.worker ? (
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(
                  gig.worker?.name
                )}`}
              >
                {getInitials(gig.worker?.name)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-brand-slate">
                    {gig.worker?.name || "Campus Worker"}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-brand-emerald bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Locked In
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {gig.worker?.college || "Campus Worker"}
                </p>
                {gig.worker?.rating_as_worker && (
                  <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold mt-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{gig.worker.rating_as_worker.toFixed(1)} worker rating</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-2 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-300" />
              <span>Awaiting acceptance by a student worker</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
