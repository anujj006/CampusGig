"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { Gig, GigCategory } from "@/lib/supabase/types";
import { GigCard } from "@/components/GigCard";
import { CategoryPills } from "@/components/CategoryPills";
import {
  Sparkles,
  Search,
  Plus,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Layers,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<GigCategory | "all">("all");
  const [feedTab, setFeedTab] = useState<"all" | "my_posted" | "my_accepted">("all");
  const [sortBy, setSortBy] = useState<"newest" | "highest_bounty" | "deadline">("newest");

  // Fetch gigs
  const fetchGigs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("gigs")
        .select("*, poster:profiles!gigs_poster_id_fkey(*), worker:profiles!gigs_worker_id_fkey(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGigs((data as Gig[]) || []);
    } catch (err) {
      console.error("Failed to load gigs:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchGigs();

    // Realtime subscription for marketplace feed updates
    const channel = supabase
      .channel("marketplace-gigs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gigs" },
        () => {
          fetchGigs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchGigs, supabase]);

  // Handle direct "Accept Gig"
  const handleAcceptGig = async (gigId: string) => {
    if (!user) {
      router.push(`/login?redirect=/gigs/${gigId}`);
      return;
    }

    setAcceptingId(gigId);
    try {
      const { error } = await supabase.rpc("accept_gig", {
        p_gig_id: gigId,
      });

      if (error) throw error;

      // Lock confirmed! Seamlessly transition to the conversation gateway
      router.push(`/chat/${gigId}`);
    } catch (err: any) {
      alert(
        err.message?.includes("GIG_UNAVAILABLE")
          ? "This gig is no longer available or has already been accepted."
          : err.message || "Failed to accept gig"
      );
      setAcceptingId(null);
    }
  };

  // Filtered & sorted gigs
  const filteredGigs = useMemo(() => {
    return gigs
      .filter((gig) => {
        // Tab filter
        if (feedTab === "all") {
          // In public feed, show open gigs plus gigs the user is party to
          if (gig.status !== "open" && gig.poster_id !== user?.id && gig.worker_id !== user?.id) {
            return false;
          }
        } else if (feedTab === "my_posted") {
          if (gig.poster_id !== user?.id) return false;
        } else if (feedTab === "my_accepted") {
          if (gig.worker_id !== user?.id) return false;
        }

        // Category filter
        if (selectedCategory !== "all" && gig.category !== selectedCategory) {
          return false;
        }

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = gig.title.toLowerCase().includes(q);
          const matchDesc = gig.description.toLowerCase().includes(q);
          const matchPoster = gig.poster?.name?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchPoster) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "highest_bounty") return b.amount - a.amount;
        if (sortBy === "deadline") return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [gigs, feedTab, selectedCategory, searchQuery, sortBy, user?.id]);

  const openGigsCount = gigs.filter((g) => g.status === "open").length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Hero Banner with Campus Vibe & Tactile Design */}
      <div className="relative overflow-hidden rounded-tactile bg-gradient-to-br from-brand-violet via-violet-700 to-indigo-900 text-white p-6 sm:p-10 shadow-glow mb-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold text-violet-100 mb-3 border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Exclusive College Peer Marketplace</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-3">
            Get college work done or earn cash on campus.
          </h1>
          <p className="text-xs sm:text-sm text-violet-100/90 leading-relaxed mb-6 max-w-lg">
            Post urgent assignments, lab reports, PPTs or errands with a set bounty. 
            When accepted, your gig locks and opens an instant direct chat gateway.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/gigs/new"
              className="px-5 py-3 rounded-xl bg-white text-brand-violet hover:bg-slate-50 font-extrabold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Post a Work Request
            </Link>

            <a
              href="#browse"
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-sm border border-white/20 transition-all flex items-center gap-1.5"
            >
              <Briefcase className="w-4 h-4" />
              Browse Gigs to Earn
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-6 mt-8 pt-6 border-t border-white/15 text-xs">
            <div>
              <span className="text-xl font-black block">{openGigsCount}</span>
              <span className="text-violet-200 text-[11px]">Open Gigs</span>
            </div>
            <div>
              <span className="text-xl font-black block">100%</span>
              <span className="text-violet-200 text-[11px]">Direct Escrow</span>
            </div>
            <div>
              <span className="text-xl font-black block">&lt; 4 hrs</span>
              <span className="text-violet-200 text-[11px]">Avg Delivery</span>
            </div>
          </div>
        </div>

        {/* Subtle decorative campus glow circle */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-brand-emerald/20 blur-3xl pointer-events-none" />
        <div className="absolute right-20 top-0 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Search & Category Discovery Bar */}
      <div id="browse" className="scroll-mt-20 mb-6 space-y-4">
        {/* Search Input & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by topic (e.g. React, calculus, graphic design, printout)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet shadow-tactile transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "highest_bounty" | "deadline")}
              className="px-3 py-2.5 bg-white border border-brand-border rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-violet shadow-tactile"
            >
              <option value="newest">Newest First</option>
              <option value="highest_bounty">Highest Bounty (₹)</option>
              <option value="deadline">Ending Soonest</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <CategoryPills
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* Marketplace / My Work Tabs */}
        {user && (
          <div className="flex items-center gap-2 border-b border-slate-200 pt-2">
            <button
              onClick={() => setFeedTab("all")}
              className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                feedTab === "all"
                  ? "border-brand-violet text-brand-violet"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              All Open Requests ({openGigsCount})
            </button>
            <button
              onClick={() => setFeedTab("my_posted")}
              className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                feedTab === "my_posted"
                  ? "border-brand-violet text-brand-violet"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Posted by Me
            </button>
            <button
              onClick={() => setFeedTab("my_accepted")}
              className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                feedTab === "my_accepted"
                  ? "border-brand-violet text-brand-violet"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              My Active Gigs
            </button>
          </div>
        )}
      </div>

      {/* Gigs Marketplace Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-violet border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-slate-500 font-medium">Scanning live campus gigs...</p>
        </div>
      ) : filteredGigs.length === 0 ? (
        <div className="bg-white rounded-tactile border border-brand-border p-12 text-center shadow-tactile my-6">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800 mb-1">
            No gigs match your criteria
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            {searchQuery || selectedCategory !== "all"
              ? "Try adjusting your search keywords or clearing filters."
              : "Be the first student to post a gig or offer your skills to peers!"}
          </p>
          <div className="flex items-center justify-center gap-3">
            {(searchQuery || selectedCategory !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Clear Filters
              </button>
            )}
            <Link
              href="/gigs/new"
              className="px-4 py-2 rounded-xl bg-brand-violet text-white text-xs font-bold shadow-sm hover:shadow"
            >
              Post a Gig Now
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredGigs.map((gig) => (
            <GigCard
              key={gig.id}
              gig={gig}
              onAccept={handleAcceptGig}
              isAccepting={acceptingId === gig.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
