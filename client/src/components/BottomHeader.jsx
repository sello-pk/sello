import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useGetLiveAuctionQuery } from "../redux/services/api";
import CountdownTimer from "./auction/CountdownTimer";
import { FiZap } from "react-icons/fi";
import { FaLocationDot } from "react-icons/fa6";
import { FaRegHeart } from "react-icons/fa";
import { IoRefreshOutline as RefreshCw } from "react-icons/io5";

const BottomHeader = () => {
  const location = useLocation();
  const { data: liveAuction, isLoading } = useGetLiveAuctionQuery(undefined, {
    pollingInterval: 60000,
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
      className="bg-[#1a1f3a] border-y border-gray-200/80 w-full flex flex-wrap items-center justify-between gap-4 md:gap-6 px-4 md:px-20 py-2 md:py-3 text-sm md:text-base text-gray-100"
    >
      <div className="flex min-w-0 items-center gap-3 md:gap-4 flex-shrink overflow-visible">
        {showAuction && (
          <>
            {/* Live Badge */}
            <Link
              to="/auctions/live"
              aria-label="Go to live auction"
              title="Go to live auction"
              className="inline-flex items-center px-3 py-1 gap-2 animate-pulse duration-500 ease rounded-full text-xs font-medium bg-red-600 text-white border border-red-600 whitespace-nowrap flex-shrink-0"
            >
              <FiZap className="w-4 h-4 shrink-0" />
              <span>Live</span>
            </Link>

            {/* Auction Info */}
            <Link
              to="/auctions/live"
              aria-label={`${auctionVenue} - ${auctionName}`}
              title={`${auctionVenue} - ${auctionName}`}
              className="min-w-0 inline-flex items-center gap-2 text-white hover:text-primary transition-colors"
            >
              <FaLocationDot className="w-4 h-4 shrink-0" />
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-semibold">{auctionVenue}</p>
                <p className="truncate text-xs text-white/70">{auctionName}</p>
              </div>
            </Link>
          </>
        )}
      </div>

      <div className="flex items-center gap-4 md:gap-6 flex-shrink-0 ml-auto">
        {/* Countdown */}
        <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_30px_rgba(5,11,32,0.28)]">
          <span className="text-white/70 text-xs uppercase tracking-[0.18em] whitespace-nowrap">
            Ends In
          </span>
          <CountdownTimer
            targetDate={targetDate}
            size="small"
            showLabel={false}
            variant="glassDark"
          />
        </div>

        <div className="flex items-center gap-5 md:gap-6">
          {showAuction && (
            <span
              className="inline-flex items-center gap-2 text-white/80 text-sm whitespace-nowrap"
              role="status"
              aria-live="polite"
            >
              <RefreshCw className="w-4 h-4 animate-spin text-primary-500" />
              Live auction updating
            </span>
          )}

          {/* Saved Cars (FIXED) */}
          <Link
            to="/saved-cars"
            aria-label="View saved cars"
            title="Saved Cars"
            className="inline-flex items-center justify-center"
          >
            <FaRegHeart className="w-5 h-5 hover:text-primary text-white shrink-0" />
          </Link>

          {/* Filter (FIXED - already had text but improved) */}
          <Link
            to="/filter"
            aria-label="Open filters"
            title="Filter cars"
            className="text-white"
          >
            Filter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BottomHeader;
