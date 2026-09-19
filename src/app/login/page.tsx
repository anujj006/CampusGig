"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import {
  Sparkles,
  GraduationCap,
  Briefcase,
  AlertCircle,
  ArrowRight,
  Lock,
  Mail,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get("role") as "student" | "worker") || "student";

  const { setActiveRole, refreshProfile } = useAuth();
  const [selectedRole, setSelectedRole] = useState<"student" | "worker">(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.session) {
        setActiveRole(selectedRole);
        await refreshProfile();
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center p-4 bg-brand-canvas">
      <div className="w-full max-w-md bg-white rounded-tactile border border-brand-border p-6 sm:p-8 shadow-float">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-violet text-white shadow-glow mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-brand-slate tracking-tight">
            Welcome to CampusGig
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sign in with your verified college credentials
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="mb-6">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Select Your Role
          </label>
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedRole("student")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedRole === "student"
                  ? "bg-white text-brand-violet shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student Requester
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("worker")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedRole === "worker"
                  ? "bg-brand-emerald text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Campus Worker
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              College / Student Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="yourname@college.edu or .ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-brand-violet hover:bg-brand-violet-dark text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              "Signing In..."
            ) : (
              <>
                Sign In as {selectedRole === "student" ? "Student" : "Worker"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 text-center pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don&apos;t have an account yet?{" "}
            <Link
              href={`/signup?role=${selectedRole}`}
              className="text-brand-violet font-bold hover:underline"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-slate-500">Loading login...</div>}>
      <LoginForm />
    </Suspense>
  );
}
