import React from "react";

const STYLES = {
  live: "bg-red-500 text-white border-0 animate-pulse",
  upcoming: "bg-blue-100 text-blue-800",
  scheduled: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  ended: "bg-slate-200 text-slate-700",
  draft: "bg-amber-100 text-amber-800",
  cancelled: "bg-slate-100 text-slate-600",
  sold: "bg-emerald-600 text-white",
  default: "bg-slate-100 text-slate-800",
};

/**
 * Inspiration: AuctionStatusBadge — compact auction/lot status pill.
 */
export default function AuctionStatusBadge({
  status,
  size = "default",
  className = "",
}) {
  const key = String(status || "default").toLowerCase();
  const style = STYLES[key] || STYLES.default;
  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border border-transparent ${padding} ${style} ${className}`}
    >
      {key.replace(/_/g, " ")}
    </span>
  );
}
