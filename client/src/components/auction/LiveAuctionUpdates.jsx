import React, { useEffect, useState, useCallback } from "react";
import { IoFlashOutline as Zap } from "react-icons/io5";

const MAX_ITEMS = 40;

/**
 * Inspiration: LiveAuctionUpdates — live activity feed from socket + optional props.
 */
export default function LiveAuctionUpdates({
  auctionId,
  socket,
  addEventListener,
  removeEventListener,
  className = "",
}) {
  const [items, setItems] = useState([]);

  const push = useCallback((text, meta = {}) => {
    setItems((prev) => {
      const next = [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          text,
          ts: Date.now(),
          ...meta,
        },
        ...prev,
      ];
      return next.slice(0, MAX_ITEMS);
    });
  }, []);

  useEffect(() => {
    if (!addEventListener) return undefined;

    const onBid = (data) => {
      if (auctionId && data?.auctionId && data.auctionId !== auctionId) return;
      const amt = data?.amount != null ? ` PKR ${Number(data.amount).toLocaleString()}` : "";
      push(`New bid placed${amt}`, { type: "bid" });
    };
    const onExt = (data) => {
      if (auctionId && data?.auctionId && data.auctionId !== auctionId) return;
      push("Auction extended (anti-snipe)", { type: "extend" });
    };
    const onEnd = (data) => {
      if (auctionId && data?.auctionId && data.auctionId !== auctionId) return;
      push("Auction ended", { type: "end" });
    };

    addEventListener("new-bid", onBid);
    addEventListener("auction:extended", onExt);
    addEventListener("auction:ended", onEnd);
    return () => {
      removeEventListener("new-bid", onBid);
      removeEventListener("auction:extended", onExt);
      removeEventListener("auction:ended", onEnd);
    };
  }, [addEventListener, removeEventListener, auctionId, push]);

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white overflow-hidden ${className}`}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
        <Zap className="w-4 h-4 text-[#FFA602]" />
        <span className="font-semibold text-slate-900 text-sm">Live updates</span>
        {socket?.connected && (
          <span className="ml-auto text-xs text-emerald-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Connected
          </span>
        )}
      </div>
      <ul className="max-h-64 overflow-y-auto text-sm">
        {items.length === 0 ? (
          <li className="px-4 py-6 text-slate-500 text-center">
            Waiting for live activity…
          </li>
        ) : (
          items.map((it) => (
            <li
              key={it.id}
              className="px-4 py-2 border-b border-slate-50 flex justify-between gap-2"
            >
              <span className="text-slate-800">{it.text}</span>
              <span className="text-slate-400 text-xs whitespace-nowrap">
                {new Date(it.ts).toLocaleTimeString()}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
