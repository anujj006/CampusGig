"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { Gig } from "@/lib/supabase/types";
import { GigCard } from "@/components/GigCard";
import {
  getInitials,
  getAvatarColor,
} from "@/lib/utils";
import {
  User,
  Mail,
  ShieldCheck,
  Star,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  LogOut,
  Save,
} from "lucide-react";

export default function ProfilePage() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const supabase = createClient();

  const [isEditing, setIsEditing] = useState(false);
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState(2);
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // User gigs
  const [postedGigs, setPostedGigs] = useState<Gig[]>([]);
  const [acceptedGigs, setAcceptedGigs] = useState<Gig[]>([]);
  const [loadingGigs, setLoadingGigs] = useState(true);
  const [activeTab, setActiveTab] = useState<"posted" | "accepted">("posted");

  useEffect(() => {
    if (profile) {
      setCollege(profile.college || "");
      setBranch(profile.branch || "");
      setYear(profile.year || 2);
      setPhone(profile.phone || "");
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;

    const fetchUserGigs = async () => {
      setLoadingGigs(true);
      try {
        const [postedRes, acceptedRes] = await Promise.all([
          supabase
            .from("gigs")
            .select("*, poster:profiles!gigs_poster_id_fkey(*), worker:profiles!gigs_worker_id_fkey(*)")
            .eq("poster_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("gigs")
            .select("*, poster:profiles!gigs_poster_id_fkey(*), worker:profiles!gigs_worker_id_fkey(*)")
            .eq("worker_id", user.id)
            .order("created_at", { ascending: false }),
        ]);

        if (postedRes.data) setPostedGigs(postedRes.data as Gig[]);
        if (acceptedRes.data) setAcceptedGigs(acceptedRes.data as Gig[]);
      } catch (err) {
        console.error("Failed to fetch user gigs:", err);
      } finally {
        setLoadingGigs(false);
      }
    };

    fetchUserGigs();
  }, [user, supabase]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          college,
          branch,
          year,
          phone,
        })
        .eq("id", user.id);

      if (error) throw error;
      await refreshProfile();
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert("Failed to update profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-tactile border border-brand-border text-center max-w-sm shadow-card">
          <User className="w-10 h-10 text-brand-violet mx-auto mb-3" />
          <h2 className="text-lg font-bold text-brand-slate mb-2">Sign in to View Profile</h2>
          <p className="text-xs text-slate-500 mb-5">
            Log in to manage your campus account and tracked gigs.
          </p>
          <Link
            href="/login"
            className="w-full inline-block py-2.5 px-4 rounded-xl bg-brand-violet text-white text-xs font-bold shadow-sm"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header Profile Card */}
      <div className="bg-white rounded-tactile border border-brand-border p-5 sm:p-6 shadow-tactile mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-md ${getAvatarColor(
                profile?.name || user.email
              )}`}
            >
              {getInitials(profile?.name || user.email)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-brand-slate">
                  {profile?.name || "Campus Peer"}
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-brand-emerald" />
                  Verified .ac.in
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.email}</span>
              </p>
              <p className="text-xs text-brand-violet font-semibold mt-1">
                {profile?.college || "College Campus"} • {profile?.branch || "Student"} (Year {profile?.year || 1})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
            <button
              onClick={() => signOut()}
              className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="mt-5 pt-5 border-t border-slate-100 space-y-3 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">College / University</label>
                <input
                  type="text"
                  required
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Branch / Degree</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Year of Study</label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                  <option value={5}>5th Year</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-brand-violet hover:bg-brand-violet-dark text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}

        {saveSuccess && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
            <span>Profile updated successfully!</span>
          </div>
        )}

        {/* Reputation & Activity Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Poster Rating</span>
            <div className="flex items-center justify-center gap-1 mt-1 text-base font-extrabold text-brand-slate">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{profile?.rating_as_poster ? profile.rating_as_poster.toFixed(1) : "5.0"}</span>
            </div>
            <span className="text-[10px] text-slate-400">({profile?.count_as_poster || 0} reviews)</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Worker Rating</span>
            <div className="flex items-center justify-center gap-1 mt-1 text-base font-extrabold text-brand-slate">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{profile?.rating_as_worker ? profile.rating_as_worker.toFixed(1) : "5.0"}</span>
            </div>
            <span className="text-[10px] text-slate-400">({profile?.count_as_worker || 0} reviews)</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Gigs Posted</span>
            <p className="text-base font-extrabold text-brand-violet mt-1">{postedGigs.length}</p>
            <span className="text-[10px] text-slate-400">Student Requests</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Gigs Completed</span>
            <p className="text-base font-extrabold text-brand-emerald mt-1">{acceptedGigs.length}</p>
            <span className="text-[10px] text-slate-400">As Worker</span>
          </div>
        </div>
      </div>

      {/* Gigs History Tabs */}
      <div>
        <div className="flex items-center gap-3 border-b border-slate-200 mb-4">
          <button
            onClick={() => setActiveTab("posted")}
            className={`pb-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === "posted"
                ? "border-brand-violet text-brand-violet"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            My Posted Requests ({postedGigs.length})
          </button>
          <button
            onClick={() => setActiveTab("accepted")}
            className={`pb-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === "accepted"
                ? "border-brand-violet text-brand-violet"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Gigs I Worked On ({acceptedGigs.length})
          </button>
        </div>

        {loadingGigs ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading gigs...</div>
        ) : activeTab === "posted" ? (
          postedGigs.length === 0 ? (
            <div className="bg-white rounded-tactile border border-brand-border p-6 text-center text-slate-500 text-xs shadow-tactile">
              You haven&apos;t posted any gigs yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {postedGigs.map((g) => (
                <GigCard key={g.id} gig={g} />
              ))}
            </div>
          )
        ) : acceptedGigs.length === 0 ? (
          <div className="bg-white rounded-tactile border border-brand-border p-6 text-center text-slate-500 text-xs shadow-tactile">
            You haven&apos;t accepted any gigs yet. Browse open gigs to start earning!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {acceptedGigs.map((g) => (
              <GigCard key={g.id} gig={g} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
