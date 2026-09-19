"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { GigCategory } from "@/lib/supabase/types";
import { CATEGORY_DETAILS } from "@/lib/utils";
import {
  Sparkles,
  ArrowLeft,
  AlertCircle,
  Calendar,
  IndianRupee,
  FileText,
  Tag,
  ShieldCheck,
} from "lucide-react";

export default function PostGigPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<GigCategory>("assignments");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(350);
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("20:00");
  const [locationTag, setLocationTag] = useState("Hostel Block / Campus");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default deadline to tomorrow evening
  React.useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];
    setDeadlineDate(dateStr);
  }, []);

  const bountyPresets = [150, 300, 500, 750, 1200];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }

    setError(null);

    // Validation
    if (title.trim().length < 5) {
      setError("Title must be at least 5 characters.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Description must be at least 10 characters.");
      return;
    }
    if (amount <= 0) {
      setError("Please specify a valid bounty amount.");
      return;
    }

    const fullDeadline = new Date(`${deadlineDate}T${deadlineTime}:00`);
    if (fullDeadline <= new Date()) {
      setError("Deadline must be in the future.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: insertError } = await supabase
        .from("gigs")
        .insert({
          poster_id: user.id,
          title: title.trim(),
          description: description.trim(),
          category,
          amount,
          deadline: fullDeadline.toISOString(),
          status: "open",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      router.push(`/gigs/${data.id}`);
    } catch (err: any) {
      console.error("Failed to post gig:", err);
      setError(err.message || "Failed to post gig. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-tactile border border-brand-border text-center max-w-sm shadow-card">
          <Sparkles className="w-10 h-10 text-brand-violet mx-auto mb-3" />
          <h2 className="text-lg font-bold text-brand-slate mb-2">Sign in to Post a Gig</h2>
          <p className="text-xs text-slate-500 mb-5">
            You must be logged in with your college account to post work requests.
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
      {/* Top Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-brand-slate tracking-tight">
            Post a Campus Gig
          </h1>
          <p className="text-xs text-slate-500">
            Reach skilled campus peers ready to assist you
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white rounded-tactile border border-brand-border p-5 sm:p-7 shadow-tactile">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Gig Title */}
          <div>
            <label className="text-xs font-bold text-brand-slate block mb-1.5 flex items-center justify-between">
              <span>Gig Title</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {title.length}/120
              </span>
            </label>
            <input
              type="text"
              required
              maxLength={120}
              placeholder="e.g. Need urgent help with React Router assignment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="text-xs font-bold text-brand-slate block mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-brand-violet" />
              <span>Category</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(CATEGORY_DETAILS) as GigCategory[]).map((cat) => {
                const item = CATEGORY_DETAILS[cat];
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-2 px-2.5 rounded-xl text-[11px] font-semibold text-center border transition-all truncate ${
                      isSelected
                        ? "bg-brand-violet text-white border-brand-violet shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-brand-slate block mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-brand-violet" />
                <span>Description & Detailed Requirements</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                {description.length}/2000
              </span>
            </label>
            <textarea
              required
              rows={4}
              maxLength={2000}
              placeholder="Describe what needs to be done, specific instructions, materials or syllabus reference, deliverable format..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet focus:bg-white transition-all"
            />
          </div>

          {/* Offered Bounty (INR) */}
          <div>
            <label className="text-xs font-bold text-brand-slate block mb-1.5 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Offered Bounty (₹ INR)</span>
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-[200px]">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min={50}
                  max={100000}
                  step={50}
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-extrabold text-brand-slate focus:outline-none focus:ring-2 focus:ring-brand-violet focus:bg-white"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                {bountyPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      amount === preset
                        ? "bg-brand-emerald text-white border-brand-emerald shadow-sm"
                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Deadline Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-brand-slate block mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-violet" />
                <span>Deadline Date</span>
              </label>
              <input
                type="date"
                required
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet focus:bg-white font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-brand-slate block mb-1">
                Deadline Time
              </label>
              <input
                type="time"
                required
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet focus:bg-white font-medium"
              />
            </div>
          </div>

          {/* Location Tag */}
          <div>
            <label className="text-xs font-bold text-brand-slate block mb-1">
              Campus Location / Preferred Meetup
            </label>
            <input
              type="text"
              placeholder="e.g. Central Library, Hostel 4, Online via Drive"
              value={locationTag}
              onChange={(e) => setLocationTag(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet focus:bg-white"
            />
          </div>

          {/* Trust Banner */}
          <div className="p-3 bg-violet-50/60 rounded-xl border border-violet-100 flex items-start gap-2.5 text-xs text-brand-violet">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Collegiate Escrow Promise</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Once a worker accepts your gig, it is locked exclusively for them and an instant conversation gateway opens to coordinate.
              </p>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-brand-violet hover:bg-brand-violet-dark text-white text-sm font-bold rounded-xl shadow-md hover:shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              "Posting Gig..."
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Publish Gig for ₹{amount}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
