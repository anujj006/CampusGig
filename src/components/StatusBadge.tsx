import React from "react";
import { GigStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { Clock, Lock, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

interface StatusBadgeProps {
  status: GigStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const configs: Record<
    GigStatus,
    { label: string; bg: string; text: string; icon: React.ReactNode; border: string }
  > = {
    open: {
      label: "Open for Bids",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600" />,
    },
    locked: {
      label: "Locked & In Progress",
      bg: "bg-violet-50",
      text: "text-brand-violet",
      border: "border-violet-200",
      icon: <Lock className="w-3.5 h-3.5 mr-1 text-brand-violet" />,
    },
    submitted: {
      label: "Work Submitted",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />,
    },
    completed: {
      label: "Completed",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />,
    },
    cancelled: {
      label: "Cancelled",
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      icon: <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />,
    },
    expired: {
      label: "Expired",
      bg: "bg-slate-100",
      text: "text-slate-600",
      border: "border-slate-200",
      icon: <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />,
    },
  };

  const current = configs[status] || configs.open;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border",
        current.bg,
        current.text,
        current.border,
        className
      )}
    >
      {current.icon}
      {current.label}
    </span>
  );
}
