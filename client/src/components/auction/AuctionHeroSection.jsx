import React from "react";
import { Link } from "react-router-dom";
import { useGetLiveAuctionQuery, useGetAuctionStatsQuery } from "@redux/services/api";
import CountdownTimer from "./CountdownTimer";

export default function AuctionHeroSection() {
  const { data: liveAuction, isLoading } = useGetLiveAuctionQuery(undefined, { pollingInterval: 60000 });
  const auctionId = liveAuction?._id;
  const { data: statsData } = useGetAuctionStatsQuery(auctionId, { skip: !auctionId, pollingInterval: 30000 });
  const statsBar = [
    { value: String(liveAuction?.totalCars ?? 0), label: "Cars in Auction" },
    { value: String(statsData?.activeBidders ?? 0), label: "Active Bidders" },
    { value: "₨2B+", label: "Total Sales" },
    { value: "48hrs", label: "Quick Delivery" },
  ];

  if (isLoading || !liveAuction) return null;

  const targetDate = liveAuction.endTime || new Date(Date.now() + 86400000 * 2);
  const activeBidders = statsData?.activeBidders ?? 0;

  return (
    <section className="bg-gradient-to-br from-slate-900 to-slate-800 border-y border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 mb-4">
              Live Auction
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {liveAuction.title || "Live Auction"} – Ends Soon
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              {activeBidders} active bidders · Okara Auction Yard
            </p>
            <Link
              to="/auctions/live"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-gradient-to-r from-[#FFA602] to-amber-500 text-white hover:from-amber-500 hover:to-[#FFA602] transition-all shadow-lg shadow-[#FFA602]/20"
            >
              View Live Auction
            </Link>
          </div>
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl px-6 py-4 min-w-[200px]">
            <p className="text-slate-400 text-xs mb-1">Ends in</p>
            <CountdownTimer targetDate={targetDate} size="default" showLabel={false} />
          </div>
        </div>
        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          {statsBar.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-xl md:text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
