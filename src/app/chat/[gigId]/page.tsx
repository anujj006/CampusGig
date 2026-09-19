"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { Gig } from "@/lib/supabase/types";
import { RealtimeChat } from "@/components/RealtimeChat";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function GigChatGatewayPage({
  params,
}: {
  params: Promise<{ gigId: string }>;
}) {
  const resolvedParams = use(params);
  const gigId = resolvedParams.gigId;
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const supabase = createClient();

  const [gig, setGig] = useState<Gig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push(`/login?redirect=/chat/${gigId}`);
      return;
    }

    const fetchGig = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("gigs")
          .select("*, poster:profiles!gigs_poster_id_fkey(*), worker:profiles!gigs_worker_id_fkey(*)")
          .eq("id", gigId)
          .single();

        if (error) throw error;

        const currentGig = data as Gig;

        // Security / Authorization check
        if (currentGig.poster_id !== user.id && currentGig.worker_id !== user.id) {
          throw new Error("You are not an authorized party in this gig conversation.");
        }

        if (currentGig.status === "open") {
          throw new Error("This gig is still open. Conversation gateway opens once accepted by a worker.");
        }

        setGig(currentGig);
      } catch (err: any) {
        console.error("Gateway load error:", err);
        setError(err.message || "Unable to access conversation gateway.");
      } finally {
        setLoading(false);
      }
    };

    fetchGig();
  }, [gigId, user, authLoading, router, supabase]);

  if (loading || authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-violet border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Connecting to conversation gateway...</p>
        </div>
      </div>
    );
  }

  if (error || !gig) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900 mb-1">Gateway Restricted</h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          {error || "Only the verified student poster and assigned worker can access this conversation."}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-violet text-white text-xs font-bold rounded-xl shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return <RealtimeChat initialGig={gig} />;
}
