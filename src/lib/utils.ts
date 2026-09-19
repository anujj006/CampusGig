import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { GigCategory } from "./supabase/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupees(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    const pastDiffHours = Math.abs(diffHours);
    if (pastDiffHours < 1) return "Just now";
    if (pastDiffHours < 24) return `${pastDiffHours}h ago`;
    return `${Math.abs(diffDays)}d ago`;
  }

  if (diffHours <= 2) return `Due in ${Math.max(1, diffHours)}h`;
  if (diffHours <= 24) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays <= 7) return `Due in ${diffDays} days`;
  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getInitials(name?: string): string {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function getAvatarColor(name?: string): string {
  const colors = [
    "bg-indigo-600",
    "bg-violet-600",
    "bg-emerald-600",
    "bg-teal-600",
    "bg-sky-600",
    "bg-rose-600",
    "bg-amber-600",
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export const CATEGORY_DETAILS: Record<
  GigCategory,
  { label: string; icon: string; bg: string; text: string; border: string }
> = {
  assignments: {
    label: "Assignments & Notes",
    icon: "BookOpen",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  coding: {
    label: "Coding & Debugging",
    icon: "Code",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  design: {
    label: "Design & Posters",
    icon: "Palette",
    bg: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-200",
  },
  presentations: {
    label: "PPTs & Seminars",
    icon: "Presentation",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  tutoring: {
    label: "Peer Tutoring",
    icon: "GraduationCap",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  errands: {
    label: "Errands & Printouts",
    icon: "Truck",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  events: {
    label: "Fest & Event Help",
    icon: "PartyPopper",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  other: {
    label: "Other Campus Help",
    icon: "HelpCircle",
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
  },
};
