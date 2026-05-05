import React, { useMemo } from "react";
import { IoTrendingUpOutline as TrendingUp } from "react-icons/io5";

/**
 * Inspiration: BidPriceChart — simple bid history visualization (no chart lib).
 * `bids` items: { amount, createdAt } or { bidAmount, createdAt }
 */
export default function BidPriceChart({ bids = [], carLabel = "", className = "" }) {
  const series = useMemo(() => {
    const list = Array.isArray(bids) ? [...bids] : [];
    list.sort(
      (a, b) =>
        new Date(a.createdAt || a.created_at || 0) -
        new Date(b.createdAt || b.created_at || 0),
    );
    return list
      .map((b, i) => ({
        i,
        amount: Number(b.amount ?? b.bidAmount ?? 0),
        at: b.createdAt || b.created_at,
      }))
      .filter((x) => x.amount > 0);
  }, [bids]);

  const max = useMemo(() => {
    if (!series.length) return 1;
    return Math.max(...series.map((s) => s.amount), 1);
  }, [series]);

  if (!series.length) {
    return (
      <div
        className={`rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500 text-sm ${className}`}
      >
        No bid history yet. Be the first to bid
        {carLabel ? ` on ${carLabel}` : ""}.
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-[#FFA602]" />
        <h3 className="font-semibold text-slate-900">Bid trend</h3>
        <span className="text-xs text-slate-500">({series.length} bids)</span>
      </div>
      <div className="flex items-end gap-1 h-32 px-1">
        {series.slice(-24).map((pt) => {
          const h = Math.max(8, (pt.amount / max) * 100);
          return (
            <div
              key={`${pt.i}-${pt.at}`}
              className="flex-1 min-w-[4px] max-w-[14px] group relative"
            >
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-[#FFA602] to-amber-400 transition-all group-hover:from-amber-500 group-hover:to-[#FFA602]"
                style={{ height: `${h}%` }}
                title={`PKR ${pt.amount.toLocaleString()}`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-500 mt-2">
        <span>Older</span>
        <span className="break-all sm:break-normal">
          Latest: PKR {series[series.length - 1].amount.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
