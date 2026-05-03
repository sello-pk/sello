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
      className="bg-[#050B20] border-y border-gray-200/80 w-full min-h-[52px] md:min-h-[56px] flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-3 md:gap-6 px-3 sm:px-4 md:px-8 lg:px-20 py-2 md:py-3 text-sm md:text-base text-gray-100 overflow-x-hidden"
    >
      <div className="flex w-full md:w-auto min-w-0 min-h-[44px] items-center gap-2 sm:gap-3 md:gap-4">
        {isLoading && (
          <div
            className="flex items-center gap-2 sm:gap-3 min-w-0 w-full md:w-auto"
            aria-hidden
          >
            <div className="h-7 w-[72px] rounded-full bg-white/15 animate-pulse shrink-0" />
            <div className="min-w-0 flex-1 space-y-2 max-w-[min(100%,320px)]">
              <div className="h-3 sm:h-3.5 rounded-md bg-white/15 animate-pulse w-[85%]" />
              <div className="h-3 rounded-md bg-white/10 animate-pulse w-[55%] sm:hidden" />
            </div>
          </div>
        )}
        {!isLoading && showAuction && (
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

      <div className="flex w-full md:w-auto items-center md:justify-end gap-2 sm:gap-3 md:gap-6 min-w-0">
        {/* Countdown */}
        <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-2.5 sm:px-3 py-1.5 sm:py-2 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_30px_rgba(5,11,32,0.28)] min-w-0">
          <span className="text-white/70 text-[10px] sm:text-xs uppercase tracking-[0.12em] whitespace-nowrap">
            Ends In
          </span>
          <CountdownTimer
            targetDate={targetDate}
            size="small"
            showLabel={false}
            variant="glassDark"
          />
        </div>

        <div className="flex items-center gap-3 sm:gap-4 md:gap-6 min-w-0 ml-auto">
          {showAuction && (
            <span
              className="hidden lg:inline-flex items-center gap-2 text-white/80 text-sm whitespace-nowrap"
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
            className="text-white text-sm sm:text-base whitespace-nowrap"
          >
            Filter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BottomHeader;
