import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useGetLiveAuctionQuery } from "../redux/services/api";
import CountdownTimer from "./auction/CountdownTimer";
import { FiZap } from "react-icons/fi";
import { FaLocationDot } from "react-icons/fa6";
import { FaRegHeart } from "react-icons/fa";

const BottomHeader = () => {
  const location = useLocation();
  const { data: liveAuction, isLoading } = useGetLiveAuctionQuery(undefined, {
    pollingInterval: 120000,
  });

  if (location.pathname === "/listings") return null;
  if (location.pathname === "/about") return null;
  if (location.pathname === "/help/faqs") return null;
  if (location.pathname === "/auctions/live") return null;

  const targetDate =
    liveAuction?.endTime ||
    (liveAuction ? new Date(Date.now() + 86400000 * 2) : null);

  const showAuction = !isLoading && liveAuction && targetDate;
  const auctionVenue = liveAuction?.location?.trim() || "Okara Auction Yard";
  const auctionName = liveAuction?.title?.trim() || "Live Auction";

  return (
    <div
      style={{ zIndex: 1000 }}
      className="sello-bottom-bar bg-[#050B20] border-y border-gray-200/80 w-full flex items-center px-3 sm:px-4 md:px-8 lg:px-20 text-sm text-white"
      aria-busy={isLoading}
    >
      <div className="flex w-full h-full items-center gap-2 sm:gap-3">
        {/* LEFT — hidden on mobile, visible sm+ */}
        {showAuction && (
          <div className="hidden sm:flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            {/* Live badge */}
            <Link
              to="/auctions/live"
              aria-label="Go to live auction"
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-red-700 text-white border border-red-600 whitespace-nowrap shrink-0"
            >
              <FiZap className="w-3 h-3 shrink-0" aria-hidden />
              <span>Live</span>
            </Link>

            {/* Venue */}
            <Link
              to="/auctions/live"
              aria-label={`${auctionVenue} - ${auctionName}`}
              className="min-w-0 inline-flex items-center gap-1.5 text-white hover:text-primary transition-colors"
            >
              <FaLocationDot className="w-3.5 h-3.5 shrink-0" />
              <div className="min-w-0 leading-tight max-w-xs">
                <p className="truncate text-xs font-semibold">{auctionVenue}</p>
                <p className="truncate text-[10px] text-white/70">
                  {auctionName}
                </p>
              </div>
            </Link>
          </div>
        )}

        {/* Mobile-only: compact Live icon badge */}
        {showAuction && (
          <Link
            to="/auctions/live"
            aria-label="Go to live auction"
            className="sm:hidden inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-700 border border-red-600 shrink-0"
          >
            <FiZap className="w-3 h-3 text-white" aria-hidden />
          </Link>
        )}

        {/* RIGHT — always visible */}
        <div className="flex items-center gap-1.5 sm:gap-3 ml-auto shrink-0">
          {/* Countdown pill — tighter on mobile */}
          <div className="flex items-center gap-1 rounded-xl bg-white/10 px-1.5 sm:px-2.5 py-0.5 sm:py-1">
            <span className="hidden md:inline text-[9px] uppercase tracking-widest text-white/60 whitespace-nowrap mr-1">
              Ends In
            </span>
            {targetDate ? (
              <CountdownTimer
                targetDate={targetDate}
                size="small"
                showLabel={false}
                variant="glassDark"
                className="text-[10px] sm:text-xs tabular-nums"
              />
            ) : (
              <span className="text-[10px] sm:text-xs tabular-nums text-white/60 whitespace-nowrap">
                --:--:--
              </span>
            )}
          </div>

          {/* Heart */}
          <Link
            to="/saved-cars"
            aria-label="View saved cars"
            className="inline-flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 shrink-0"
          >
            <FaRegHeart className="w-4 h-4 sm:w-5 sm:h-5 text-white hover:text-primary" />
          </Link>

          {/* Filter */}
          <Link
            to="/filter"
            aria-label="Open vehicle filters"
            className="text-white text-xs sm:text-sm font-medium whitespace-nowrap hover:underline underline-offset-4 shrink-0"
          >
            Filter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BottomHeader;
