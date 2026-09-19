"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { Gig, Message, Profile } from "@/lib/supabase/types";
import {
  formatRupees,
  formatRelativeTime,
  getInitials,
  getAvatarColor,
} from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import {
  Send,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Star,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface RealtimeChatProps {
  initialGig: Gig;
}

export function RealtimeChat({ initialGig }: RealtimeChatProps) {
  const { user } = useAuth();
  const [gig, setGig] = useState<Gig>(initialGig);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const isPoster = user?.id === gig.poster_id;
  const isWorker = user?.id === gig.worker_id;
  const otherParty: Profile | null = isPoster
    ? (gig.worker as Profile | null)
    : (gig.poster as Profile | null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load existing messages & sender profiles
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*, sender:profiles(*)")
        .eq("gig_id", gig.id)
        .order("created_at", { ascending: true });

      if (data && !error) {
        setMessages(data as Message[]);
      }
    };

    fetchMessages();

    // Check if user has already left a review
    const checkReview = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("reviews")
        .select("id")
        .eq("gig_id", gig.id)
        .eq("reviewer_id", user.id)
        .maybeSingle();

      if (data) {
        setHasReviewed(true);
      }
    };
    checkReview();
  }, [gig.id, user, supabase]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Realtime subscription for messages and gig updates
  useEffect(() => {
    const messageChannel = supabase
      .channel(`gig-chat-${gig.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `gig_id=eq.${gig.id}`,
        },
        async (payload) => {
          // If message is from other user, fetch sender profile
          const newMsg = payload.new as Message;
          if (newMsg.sender_id !== user?.id) {
            const { data: senderProfile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", newMsg.sender_id)
              .single();

            newMsg.sender = senderProfile as Profile;
          }
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "gigs",
          filter: `id=eq.${gig.id}`,
        },
        async (payload) => {
          const updatedGig = payload.new as Gig;
          setGig((prev) => ({
            ...prev,
            ...updatedGig,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [gig.id, user?.id, supabase]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || isSending) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          gig_id: gig.id,
          sender_id: user.id,
          body: messageText,
        })
        .select("*, sender:profiles(*)")
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setMessages((prev) => [...prev, data as Message]);
      }
    } catch (err: any) {
      console.error("Failed to send message:", err);
      setActionError(err.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  // Gig lifecycle actions (calls Supabase RPCs)
  const handleWorkerSubmit = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      const { error } = await supabase.rpc("submit_gig", {
        p_gig_id: gig.id,
      });
      if (error) throw error;
      setGig((prev) => ({ ...prev, status: "submitted" }));
    } catch (err: any) {
      setActionError(err.message || "Could not submit gig");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePosterComplete = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      const { error } = await supabase.rpc("complete_gig", {
        p_gig_id: gig.id,
      });
      if (error) throw error;
      setGig((prev) => ({ ...prev, status: "completed" }));
      setShowReviewModal(true);
    } catch (err: any) {
      setActionError(err.message || "Could not complete gig");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestRework = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      const { error } = await supabase.rpc("request_rework", {
        p_gig_id: gig.id,
      });
      if (error) throw error;
      setGig((prev) => ({ ...prev, status: "locked" }));
    } catch (err: any) {
      setActionError(err.message || "Could not request rework");
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Review
  const handleSubmitReview = async () => {
    if (!user) return;
    setIsSubmittingReview(true);
    try {
      const revieweeId = isPoster ? gig.worker_id! : gig.poster_id;
      const revieweeRole = isPoster ? "worker" : "poster";

      const { error } = await supabase.from("reviews").insert({
        gig_id: gig.id,
        reviewer_id: user.id,
        reviewee_id: revieweeId,
        reviewee_role: revieweeRole,
        rating,
        comment: reviewComment.trim() || null,
      });

      if (error) throw error;
      setHasReviewed(true);
      setShowReviewModal(false);
    } catch (err: any) {
      alert("Failed to submit review: " + err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] md:h-[calc(100vh-70px)] bg-brand-canvas max-w-4xl mx-auto md:border-x md:border-brand-border">
      {/* Top Banner: Gig Context & Navigation */}
      <div className="bg-white border-b border-brand-border p-3 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
              title="Back to Convos"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base text-brand-slate line-clamp-1">
                  {gig.title}
                </h1>
                <StatusBadge status={gig.status} />
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <span>Bounty: <strong className="text-brand-slate">{formatRupees(gig.amount)}</strong></span>
                <span>•</span>
                <span>{formatRelativeTime(gig.deadline)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/gigs/${gig.id}`}
              className="text-xs font-semibold text-brand-violet hover:underline hidden sm:block"
            >
              View Gig Details
            </Link>
          </div>
        </div>

        {/* Counterpart Student/Worker Card Bar */}
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${getAvatarColor(
                otherParty?.name
              )}`}
            >
              {getInitials(otherParty?.name)}
            </div>
            <div>
              <span className="font-bold text-slate-800">
                {otherParty?.name || (isPoster ? "Campus Worker" : "Student Requester")}
              </span>
              <span className="text-[11px] text-slate-500 ml-1.5 hidden sm:inline">
                ({isPoster ? "Worker" : "Poster"})
              </span>
              <span className="inline-flex items-center gap-0.5 ml-2 text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                <ShieldCheck className="w-2.5 h-2.5" />
                Verified
              </span>
            </div>
          </div>

          {/* Action Trays for Workflow Progression */}
          <div className="flex items-center gap-2">
            {/* Worker: Submit Work */}
            {isWorker && gig.status === "locked" && (
              <button
                onClick={handleWorkerSubmit}
                disabled={actionLoading}
                className="px-3 py-1 bg-brand-emerald hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg font-bold text-xs shadow-sm flex items-center gap-1 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Submit Work
              </button>
            )}

            {/* Poster: Approve or Rework */}
            {isPoster && gig.status === "submitted" && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleRequestRework}
                  disabled={actionLoading}
                  className="px-2.5 py-1 bg-white border border-amber-300 text-amber-700 hover:bg-amber-50 rounded-lg font-bold text-xs flex items-center gap-1 transition-all"
                >
                  <RotateCcw className="w-3 h-3" />
                  Request Rework
                </button>
                <button
                  onClick={handlePosterComplete}
                  disabled={actionLoading}
                  className="px-3 py-1 bg-brand-emerald hover:bg-emerald-600 text-white rounded-lg font-bold text-xs shadow-sm flex items-center gap-1 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve & Pay
                </button>
              </div>
            )}

            {/* If completed, allow leaving review */}
            {gig.status === "completed" && !hasReviewed && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-sm"
              >
                <Star className="w-3.5 h-3.5 fill-white" />
                Leave Review
              </button>
            )}
          </div>
        </div>

        {actionError && (
          <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{actionError}</span>
          </div>
        )}
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* System Notice */}
        <div className="text-center my-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-brand-violet text-[11px] font-semibold border border-violet-200">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-violet" />
            <span>Conversation Gateway Unlocked — Discuss scope, drafts & delivery safely</span>
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-xs">No messages yet. Send a greeting to start the collaboration!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 items-end ${
                  isMe ? "justify-end" : "justify-start"
                }`}
              >
                {!isMe && (
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${getAvatarColor(
                      msg.sender?.name
                    )}`}
                  >
                    {getInitials(msg.sender?.name)}
                  </div>
                )}

                <div
                  className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-sm leading-relaxed ${
                    isMe
                      ? "bg-brand-violet text-white rounded-br-none"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                  }`}
                >
                  {!isMe && (
                    <p className="text-[10px] font-bold text-brand-violet mb-0.5">
                      {msg.sender?.name || "Campus Peer"}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                  <p
                    className={`text-[10px] text-right mt-1 font-medium ${
                      isMe ? "text-violet-200" : "text-slate-400"
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      <div className="p-3 bg-white border-t border-brand-border">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            placeholder={
              gig.status === "cancelled" || gig.status === "expired"
                ? "This gig is closed"
                : "Type message or ask clarifying question..."
            }
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={
              isSending ||
              gig.status === "cancelled" ||
              gig.status === "expired"
            }
            className="flex-1 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={
              !newMessage.trim() ||
              isSending ||
              gig.status === "cancelled" ||
              gig.status === "expired"
            }
            className="w-10 h-10 rounded-xl bg-brand-violet hover:bg-brand-violet-dark disabled:opacity-40 text-white flex items-center justify-center shadow-sm hover:shadow transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-tactile p-6 max-w-md w-full shadow-float border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="font-extrabold text-base text-slate-900 mb-1">
              Rate your collaboration
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              How was your experience working with {otherParty?.name || "your peer"}?
            </p>

            {/* Stars */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((starVal) => (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => setRating(starVal)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      rating >= starVal
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              placeholder="Leave a short comment (e.g., Quick turnaround, delivered exactly on time!)"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Skip for now
              </button>
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={isSubmittingReview}
                className="px-4 py-2 text-xs font-bold bg-brand-violet hover:bg-brand-violet-dark text-white rounded-xl shadow-sm disabled:opacity-50"
              >
                {isSubmittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
