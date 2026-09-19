import React from "react";
import { GigCategory } from "@/lib/supabase/types";
import { CATEGORY_DETAILS } from "@/lib/utils";
import {
  BookOpen,
  Code,
  Palette,
  Presentation,
  GraduationCap,
  Truck,
  PartyPopper,
  HelpCircle,
  LayoutGrid,
} from "lucide-react";

interface CategoryPillsProps {
  selected: GigCategory | "all";
  onSelect: (cat: GigCategory | "all") => void;
}

export function CategoryPills({ selected, onSelect }: CategoryPillsProps) {
  const iconMap: Record<string, React.ReactNode> = {
    BookOpen: <BookOpen className="w-3.5 h-3.5 mr-1.5" />,
    Code: <Code className="w-3.5 h-3.5 mr-1.5" />,
    Palette: <Palette className="w-3.5 h-3.5 mr-1.5" />,
    Presentation: <Presentation className="w-3.5 h-3.5 mr-1.5" />,
    GraduationCap: <GraduationCap className="w-3.5 h-3.5 mr-1.5" />,
    Truck: <Truck className="w-3.5 h-3.5 mr-1.5" />,
    PartyPopper: <PartyPopper className="w-3.5 h-3.5 mr-1.5" />,
    HelpCircle: <HelpCircle className="w-3.5 h-3.5 mr-1.5" />,
  };

  const categories = Object.keys(CATEGORY_DETAILS) as GigCategory[];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar py-1">
      <button
        onClick={() => onSelect("all")}
        className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
          selected === "all"
            ? "bg-brand-violet text-white border-brand-violet shadow-sm"
            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5 mr-1.5" />
        All Gigs
      </button>

      {categories.map((cat) => {
        const item = CATEGORY_DETAILS[cat];
        const isSelected = selected === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
              isSelected
                ? "bg-brand-violet text-white border-brand-violet shadow-sm"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {iconMap[item.icon]}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
