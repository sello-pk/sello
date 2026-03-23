import React from "react";
import {
  IoShieldCheckmarkOutline as Shield,
  IoDocumentTextOutline as FileText,
  IoCarSportOutline as Car,
  IoPeopleOutline as Users,
} from "react-icons/io5";

const DEFAULT_ITEMS = [
  {
    icon: Shield,
    title: "Verified listings",
    desc: "Vehicles are reviewed before they go live in auction.",
  },
  {
    icon: FileText,
    title: "Transparent process",
    desc: "Clear rules for token, wallet holds, escrow, and pickup.",
  },
  {
    icon: Car,
    title: "Inspected inventory",
    desc: "Book yard inspections and review details before you bid.",
  },
  {
    icon: Users,
    title: "Trusted bidders",
    desc: "Approved bidders and optional dealer programs keep auctions fair.",
  },
];

/**
 * Inspiration: TrustBadges — “Why choose us” style trust row.
 */
export default function TrustBadges({
  variant = "default",
  items = DEFAULT_ITEMS,
  className = "",
}) {
  const isDark = variant === "dark";
  return (
    <div
      className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
    >
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <div
            key={i}
            className={`rounded-2xl p-5 border ${
              isDark
                ? "bg-white/5 border-white/10 text-white"
                : "bg-white border-slate-200 text-slate-900 shadow-sm"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                isDark ? "bg-[#FFA602]/20 text-[#FFA602]" : "bg-amber-50 text-[#FFA602]"
              }`}
            >
              <Icon className="w-6 h-6" />
            </div>
            <h3
              className={`font-semibold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}
            >
              {item.title}
            </h3>
            <p
              className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
            >
              {item.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
}
